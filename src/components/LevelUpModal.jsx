import React, { useEffect, useRef } from 'react';
import { Award, Zap } from 'lucide-react';

const LevelUpModal = ({ oldLevel, newLevel, onClose }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Play celebratory sound arpeggio (C5 -> E5 -> G5 -> C6)
    playCelebrateArpeggio();

    // Canvas Confetti Animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 4;
        this.speedX = Math.random() * 12 - 6;
        this.speedY = Math.random() * -12 - 5; // upward blast
        this.gravity = 0.35;
        this.color = this.getRandomColor();
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 8 - 4;
        this.opacity = 1;
      }

      getRandomColor() {
        const colors = [
          '#6366f1', // Indigo
          '#10b981', // Emerald
          '#3b82f6', // Blue
          '#f59e0b', // Gold
          '#f43f5e', // Rose
          '#8b5cf6'  // Violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= 0.008;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        
        // Randomly draw squares or circles
        if (this.size > 7) {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 100; // start slightly below modal card

    // Spawn burst particles
    for (let i = 0; i < 120; i++) {
      particles.push(new Particle(centerX, centerY));
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        // Remove dead particles
        if (particles[i].opacity <= 0 || particles[i].y > canvas.height) {
          particles.splice(i, 1);
        }
      }

      // Keep spawning occasional ambient particles
      if (particles.length < 40 && Math.random() < 0.2) {
        particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const playCelebrateArpeggio = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (freq, duration, delay) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        
        // Soft filter to make saw wave sound retro/arcade
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      playTone(523.25, 0.25, 0);    // C5
      playTone(659.25, 0.25, 0.1);   // E5
      playTone(783.99, 0.25, 0.2);   // G5
      playTone(1046.50, 0.5, 0.3);  // C6
    } catch (e) {
      console.warn("Audio Context blocked");
    }
  };

  return (
    <div style={overlayStyle} className="modal-overlay">
      <canvas ref={canvasRef} style={canvasStyle} />
      
      <div style={cardStyle} className="card animate-scale-up">
        <div style={badgeContainerStyle}>
          <Award size={40} style={{ color: 'var(--color-warning)' }} />
        </div>
        
        <h1 className="heading-font" style={titleStyle}>Level Up!</h1>
        <p style={subtitleStyle}>You have progressed to new heights</p>

        <div style={levelRowStyle}>
          <div style={levelBoxStyle}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OLD LEVEL</span>
            <span style={levelTextStyle}>{oldLevel}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Zap size={20} style={{ color: 'var(--color-primary)', animation: 'spin-slow 4s linear infinite' }} />
          </div>

          <div style={levelBoxStyle}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NEW LEVEL</span>
            <span style={{ ...levelTextStyle, color: 'var(--color-success)' }}>{newLevel}</span>
          </div>
        </div>

        <p style={congratsTextStyle}>
          Your attributes have increased. Check your Sub-Skills in the sidebar to review your current training rankings.
        </p>

        <button 
          onClick={onClose} 
          className="btn-primary" 
          style={{ width: '100%', height: '48px', marginTop: '24px' }}
        >
          <span>Continue Quest</span>
        </button>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(9, 13, 22, 0.85)',
  backdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const canvasStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none'
};

const cardStyle = {
  width: '100%',
  maxWidth: '440px',
  textAlign: 'center',
  padding: '40px 32px',
  zIndex: 10000,
  backgroundColor: 'var(--bg-card)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
  position: 'relative'
};

const badgeContainerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px auto',
  border: '1px solid rgba(245, 158, 11, 0.2)',
  boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)',
  animation: 'float 3s ease-in-out infinite'
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
  marginBottom: '4px',
  letterSpacing: '-0.02em'
};

const subtitleStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
  marginBottom: '28px'
};

const levelRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '24px',
  marginBottom: '28px'
};

const levelBoxStyle = {
  display: 'flex',
  flexDirection: 'col',
  padding: '12px 20px',
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  minWidth: '100px'
};

const levelTextStyle = {
  display: 'block',
  fontSize: '2rem',
  fontWeight: 700,
  fontFamily: 'var(--font-heading)'
};

const congratsTextStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  lineHeight: 1.6,
  maxWidth: '320px',
  margin: '0 auto'
};

export default LevelUpModal;
