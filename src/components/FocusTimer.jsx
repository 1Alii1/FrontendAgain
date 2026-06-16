import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Target, Sparkles, HelpCircle } from 'lucide-react';

const FocusTimer = ({ tasks, onFocusComplete }) => {
  const activeQuests = tasks.filter(t => !t.completed);

  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);

  const timerRef = useRef(null);

  // Sync totalSeconds when minutes state changes (if timer not running)
  useEffect(() => {
    if (!isActive && seconds === 0) {
      setTotalSeconds(minutes * 60);
    }
  }, [minutes]);

  // Main countdown effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(sec => sec - 1);
          setAccumulatedSeconds(prev => prev + 1);
        } else if (seconds === 0) {
          // Check minutes left
          const minsLeft = Math.floor((totalSeconds - accumulatedSeconds - 1) / 60);
          if (minsLeft >= 0) {
            setSeconds(59);
            setAccumulatedSeconds(prev => prev + 1);
          } else {
            // Timer finished
            handleTimerComplete();
          }
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, seconds, totalSeconds, accumulatedSeconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Play a dual tone success sound
    playSuccessSound();

    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    const taskName = selectedTask ? selectedTask.title : 'Focus Session';
    const focusMinutes = Math.floor(totalSeconds / 60);
    
    onFocusComplete(focusMinutes, taskName);
    
    // Reset timer
    setSeconds(0);
    setAccumulatedSeconds(0);
    setIsActive(false);
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (freq, duration, delay) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      playTone(523.25, 0.2, 0);   // C5
      playTone(659.25, 0.4, 0.15); // E5
    } catch (err) {
      console.warn("Audio Context blocked");
    }
  };

  const handleStartStop = () => {
    setIsActive(prev => !prev);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setAccumulatedSeconds(0);
  };

  const handleClaimEarly = () => {
    if (accumulatedSeconds < 60) return;
    const focusMinutes = Math.floor(accumulatedSeconds / 60);
    
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    const taskName = selectedTask ? `${selectedTask.title} (Partial)` : 'Focus Session (Partial)';
    
    onFocusComplete(focusMinutes, taskName);
    handleReset();
  };

  const currentRemainingSeconds = Math.max(0, totalSeconds - accumulatedSeconds);
  const remainingMins = Math.floor(currentRemainingSeconds / 60);
  const remainingSecs = currentRemainingSeconds % 60;

  // SVG Progress calculation
  const progressPercent = totalSeconds > 0 ? (currentRemainingSeconds / totalSeconds) : 0;
  const strokeDash = 2 * Math.PI * 90; // Radius = 90
  const strokeOffset = strokeDash * (1 - progressPercent);

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div style={headerStyle}>
        <h2 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Focus Chamber</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Channel concentration towards a task. Gain Focus XP (+1.5 XP / min) for completed intervals.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Main circular timer visualizer */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          
          {/* Linked task indicator */}
          <div style={linkedTaskStyle}>
            <Target size={14} style={{ color: 'var(--color-focus)' }} />
            <span>
              {selectedTaskId 
                ? `Linked Quest: ${tasks.find(t => t.id === selectedTaskId)?.title}` 
                : 'No Linked Quest'
              }
            </span>
          </div>

          {/* SVG Progress Circle */}
          <div style={timerVisualizerContainerStyle}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              {/* Underlay Circle */}
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="transparent"
                stroke="var(--border-color)"
                strokeWidth="8"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="transparent"
                stroke="var(--color-focus)"
                strokeWidth="8"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                style={{
                  transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.35s ease'
                }}
              />
            </svg>
            <div style={timerLabelStyle}>
              <span className="heading-font" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
                {String(remainingMins).padStart(2, '0')}:{String(remainingSecs).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isActive ? 'Focused' : 'Chamber Idle'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={actionButtonsRowStyle}>
            <button 
              onClick={handleReset} 
              className="btn-secondary" 
              style={{ width: '48px', height: '48px', padding: 0 }}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button 
              onClick={handleStartStop} 
              className="btn-primary" 
              style={{
                width: '120px', 
                height: '48px', 
                backgroundColor: isActive ? 'var(--color-danger)' : 'var(--color-focus)',
                boxShadow: isActive ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(139, 92, 246, 0.2)'
              }}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>

            {/* Claim Early Button */}
            <button
              onClick={handleClaimEarly}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                opacity: accumulatedSeconds >= 60 ? 1 : 0.4,
                cursor: accumulatedSeconds >= 60 ? 'pointer' : 'not-allowed'
              }}
              disabled={accumulatedSeconds < 60}
              title="Claim XP for completed minutes"
            >
              Claim XP
            </button>
          </div>

          {accumulatedSeconds > 0 && (
            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Accumulated focus: {Math.floor(accumulatedSeconds / 60)}m ({Math.round(Math.floor(accumulatedSeconds / 60) * 1.5)} XP pending)
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Quest Selector */}
          <div className="card">
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Link active quest</h3>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="select-field"
              style={{ width: '100%' }}
            >
              <option value="">No Active Quest (Standalone Focus)</option>
              {activeQuests.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.priority.toUpperCase()}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Presets Card */}
          <div className="card">
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Focus Presets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => { handleReset(); setMinutes(25); }} 
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', color: minutes === 25 ? 'var(--color-focus)' : 'var(--text-primary)' }}
                disabled={isActive}
              >
                <Sparkles size={14} />
                <span>Pomodoro (25 Min)</span>
              </button>
              
              <button 
                onClick={() => { handleReset(); setMinutes(50); }} 
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', color: minutes === 50 ? 'var(--color-focus)' : 'var(--text-primary)' }}
                disabled={isActive}
              >
                <Sparkles size={14} />
                <span>Deep Focus (50 Min)</span>
              </button>

              <button 
                onClick={() => { handleReset(); setMinutes(10); }} 
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', color: minutes === 10 ? 'var(--color-focus)' : 'var(--text-primary)' }}
                disabled={isActive}
              >
                <Sparkles size={14} />
                <span>Short Sprint (10 Min)</span>
              </button>
            </div>

            {/* Custom Minutes Input */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Custom Minutes</label>
              <input
                type="number"
                min={1}
                max={180}
                value={minutes}
                onChange={(e) => {
                  handleReset();
                  setMinutes(Math.max(1, parseInt(e.target.value) || 25));
                }}
                className="input-field"
                disabled={isActive}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const headerStyle = {
  marginBottom: '16px'
};

const linkedTaskStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  padding: '6px 16px',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: '20px'
};

const timerVisualizerContainerStyle = {
  position: 'relative',
  width: '220px',
  height: '220px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px'
};

const timerLabelStyle = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const actionButtonsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

export default FocusTimer;
