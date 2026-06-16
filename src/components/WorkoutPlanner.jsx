import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Play, Check, Dumbbell, Clock, ChevronLeft, Save } from 'lucide-react';

const PRESET_ROUTINES = [
  {
    id: 'preset-1',
    name: 'Upper Body Power',
    exercises: [
      { id: 'ex-1', name: 'Push-ups', sets: [ { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false }, { reps: 10, weight: 0, completed: false } ] },
      { id: 'ex-2', name: 'Dumbbell Rows', sets: [ { reps: 12, weight: 15, completed: false }, { reps: 12, weight: 15, completed: false }, { reps: 12, weight: 15, completed: false } ] },
      { id: 'ex-3', name: 'Shoulder Press', sets: [ { reps: 10, weight: 10, completed: false }, { reps: 10, weight: 10, completed: false } ] }
    ]
  },
  {
    id: 'preset-2',
    name: 'Lower Body Strength',
    exercises: [
      { id: 'ex-4', name: 'Bodyweight Squats', sets: [ { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false } ] },
      { id: 'ex-5', name: 'Lunges', sets: [ { reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false } ] },
      { id: 'ex-6', name: 'Plank Hold', sets: [ { reps: 1, weight: 0, completed: false, label: '60s hold' }, { reps: 1, weight: 0, completed: false, label: '60s hold' } ] }
    ]
  }
];

const WorkoutPlanner = ({ workouts, onSaveWorkout, onDeleteWorkout, onCompleteWorkout }) => {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newExercises, setNewExercises] = useState([]);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(3);

  // Rest Timer State
  const [restDuration, setRestDuration] = useState(60); // standard 60s
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  // Combine user-defined workouts with presets
  const allWorkouts = [...workouts, ...PRESET_ROUTINES.filter(p => !workouts.some(w => w.id === p.id))];

  // Rest timer loop
  useEffect(() => {
    if (restTimeLeft > 0 && isResting) {
      timerRef.current = setTimeout(() => {
        setRestTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (restTimeLeft === 0 && isResting) {
      setIsResting(false);
      // Play a clean synthesis beep (avoiding emojis or low-grade audio files)
      playAudioNotification();
    }
    return () => clearTimeout(timerRef.current);
  }, [restTimeLeft, isResting]);

  // Canvas drawing for radial progress bar
  useEffect(() => {
    if (!isResting || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 8;
    const center = width / 2;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background track arc
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw active timer fill arc
      const percentage = restTimeLeft / restDuration;
      const endAngle = -Math.PI / 2 + (2 * Math.PI * percentage);

      ctx.beginPath();
      ctx.arc(center, center, radius, -Math.PI / 2, endAngle, false);
      ctx.strokeStyle = 'var(--color-strength)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    draw();
  }, [restTimeLeft, isResting, restDuration]);

  const playAudioNotification = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note (sleek, high pitch)
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported");
    }
  };

  const handleStartWorkout = (routine) => {
    // Deep clone the workout state so we can track sets completion locally
    const clone = JSON.parse(JSON.stringify(routine));
    setActiveWorkout(clone);
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleToggleSet = (exerciseId, setIdx) => {
    if (!activeWorkout) return;

    let setCompleted = false;
    const updated = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const sets = ex.sets.map((s, idx) => {
            if (idx === setIdx) {
              setCompleted = !s.completed;
              return { ...s, completed: setCompleted };
            }
            return s;
          });
          return { ...ex, sets };
        }
        return ex;
      })
    };

    setActiveWorkout(updated);

    // If set was checked, start rest timer
    if (setCompleted) {
      setRestTimeLeft(restDuration);
      setIsResting(true);
    }
  };

  const handleAddExerciseToBuilder = () => {
    if (!newExName.trim()) return;
    const exercise = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: newExName.trim(),
      sets: Array.from({ length: newExSets }, () => ({ reps: 10, weight: 0, completed: false }))
    };
    setNewExercises([...newExercises, exercise]);
    setNewExName('');
  };

  const handleSaveNewRoutine = () => {
    if (!newRoutineName.trim() || newExercises.length === 0) return;
    const newWorkout = {
      id: 'workout-' + Date.now(),
      name: newRoutineName.trim(),
      exercises: newExercises,
      completed: false,
      completedDate: null
    };
    onSaveWorkout(newWorkout);
    // Reset state
    setNewRoutineName('');
    setNewExercises([]);
    setIsCreating(false);
  };

  const handleFinishActiveWorkout = () => {
    if (!activeWorkout) return;
    onCompleteWorkout(activeWorkout.id);
    setActiveWorkout(null);
    setIsResting(false);
    setRestTimeLeft(0);
  };

  // Check if all sets are completed in active workout
  const isWorkoutFullyCompleted = activeWorkout?.exercises.every(ex => ex.sets.every(s => s.completed));

  if (activeWorkout) {
    return (
      <div className="animate-fade-in" style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={() => setActiveWorkout(null)} style={backButtonStyle}>
            <ChevronLeft size={16} />
            <span>Cancel Workout</span>
          </button>
          
          <div style={timerConfigStyle}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rest Period:</span>
            <select
              value={restDuration}
              onChange={(e) => setRestDuration(Number(e.target.value))}
              className="select-field"
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            >
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>2m</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          {/* Main sets list */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Dumbbell size={24} style={{ color: 'var(--color-strength)' }} />
              <h2 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeWorkout.name}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeWorkout.exercises.map(ex => (
                <div key={ex.id} style={activeExerciseCardStyle}>
                  <h4 className="heading-font" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ex.name}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {ex.sets.map((set, sIdx) => (
                      <div 
                        key={sIdx} 
                        style={{
                          ...setRowStyle,
                          backgroundColor: set.completed ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                          borderColor: set.completed ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, width: '40px' }}>
                          SET {sIdx + 1}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => {
                              const weight = parseFloat(e.target.value) || 0;
                              setActiveWorkout(prev => {
                                const clone = { ...prev };
                                clone.exercises = clone.exercises.map(x => {
                                  if (x.id === ex.id) {
                                    x.sets[sIdx].weight = weight;
                                  }
                                  return x;
                                });
                                return clone;
                              });
                            }}
                            style={setInputStyle}
                            className="input-field"
                            disabled={set.completed}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>lbs</span>

                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const reps = parseInt(e.target.value) || 0;
                              setActiveWorkout(prev => {
                                const clone = { ...prev };
                                clone.exercises = clone.exercises.map(x => {
                                  if (x.id === ex.id) {
                                    x.sets[sIdx].reps = reps;
                                  }
                                  return x;
                                });
                                return clone;
                              });
                            }}
                            style={setInputStyle}
                            className="input-field"
                            disabled={set.completed}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reps</span>
                        </div>

                        {/* Set checkbox toggle */}
                        <button
                          onClick={() => handleToggleSet(ex.id, sIdx)}
                          style={{
                            ...setCompleteButtonStyle,
                            backgroundColor: set.completed ? 'var(--color-success)' : 'var(--bg-input)',
                            borderColor: set.completed ? 'var(--color-success)' : 'var(--border-color)',
                            color: set.completed ? 'white' : 'var(--text-muted)'
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinishActiveWorkout}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '32px',
                height: '50px',
                fontSize: '1rem',
                opacity: isWorkoutFullyCompleted ? 1 : 0.6
              }}
            >
              <Check size={18} />
              <span>{isWorkoutFullyCompleted ? 'Finish Training Quest' : 'Complete All Sets to Finish'}</span>
            </button>
          </div>

          {/* Sidebar rest timer panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
            <h4 className="heading-font" style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Rest Timer
            </h4>
            
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <canvas ref={canvasRef} width={120} height={120} style={{ position: 'absolute', top: 0, left: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <span className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  {restTimeLeft}
                </span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>seconds</span>
              </div>
            </div>

            {isResting ? (
              <button 
                onClick={() => { setIsResting(false); setRestTimeLeft(0); }} 
                className="btn-secondary"
                style={{ marginTop: '20px', padding: '6px 12px', fontSize: '0.8rem', width: '100%' }}
              >
                Skip Rest
              </button>
            ) : (
              <button 
                onClick={() => { setRestTimeLeft(restDuration); setIsResting(true); }} 
                className="btn-secondary"
                style={{ marginTop: '20px', padding: '6px 12px', fontSize: '0.8rem', width: '100%' }}
              >
                Trigger Timer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div style={headerStyle}>
        <h2 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Training Ground</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Log workout sessions to increase your Strength sub-skill level and earn character XP.</p>
      </div>

      {isCreating ? (
        <div className="card animate-scale-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create Routine</h3>
            <button onClick={() => setIsCreating(false)} className="btn-secondary" style={{ padding: '6px 12px' }}>Cancel</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Routine Name</label>
              <input
                type="text"
                placeholder="e.g. Legs A, Pull Day"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Added exercises list */}
            {newExercises.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exercises:</span>
                {newExercises.map((ex, idx) => (
                  <div key={ex.id} style={exerciseBuilderItemStyle}>
                    <span style={{ fontWeight: 500 }}>{ex.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.sets.length} sets</span>
                      <button 
                        onClick={() => setNewExercises(prev => prev.filter((_, i) => i !== idx))}
                        className="btn-danger-outline"
                        style={{ padding: '4px' }}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exercise builder tool */}
            <div style={exAddRowStyle}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Add Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bench Press"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ width: '100px' }}>
                <label style={labelStyle}>Sets</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newExSets}
                  onChange={(e) => setNewExSets(parseInt(e.target.value) || 3)}
                  className="input-field"
                />
              </div>

              <button 
                type="button" 
                onClick={handleAddExerciseToBuilder}
                className="btn-secondary" 
                style={{ height: '46px', alignSelf: 'flex-end' }}
              >
                <Plus size={18} />
                <span>Add Ex</span>
              </button>
            </div>

            <button 
              onClick={handleSaveNewRoutine}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '16px', height: '46px' }}
              disabled={!newRoutineName.trim() || newExercises.length === 0}
            >
              <Save size={18} />
              <span>Save Routine Template</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsCreating(true)} className="btn-primary">
              <Plus size={18} />
              <span>Create Workout Routine</span>
            </button>
          </div>

          <div style={routinesGridStyle}>
            {allWorkouts.map(routine => (
              <div key={routine.id} className="card card-hover" style={routineCardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{routine.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {routine.exercises.length} Exercises • {routine.exercises.reduce((acc, curr) => acc + curr.sets.length, 0)} Total Sets
                    </span>
                  </div>
                  <button 
                    onClick={() => handleStartWorkout(routine)}
                    className="btn-primary" 
                    style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <Play size={14} fill="white" />
                    <span>Train</span>
                  </button>
                </div>

                <div style={routineExercisesListStyle}>
                  {routine.exercises.slice(0, 3).map((ex, idx) => (
                    <div key={ex.id || idx} style={routineExerciseItemStyle}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{ex.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ex.sets.length} sets</span>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      + {routine.exercises.length - 3} more exercises
                    </span>
                  )}
                </div>

                {/* Show custom badge if completed in past */}
                {routine.completed && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <span className="badge badge-low" style={{ display: 'flex', gap: '4px', fontSize: '0.7rem' }}>
                      <Check size={10} /> Complete
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.9rem'
};

const timerConfigStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const activeExerciseCardStyle = {
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '20px',
  marginTop: '12px'
};

const setRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  gap: '12px',
  transition: 'all var(--transition-fast)'
};

const setInputStyle = {
  width: '70px',
  padding: '6px 8px',
  textAlign: 'center',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.85rem'
};

const setCompleteButtonStyle = {
  width: '24px',
  height: '24px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all var(--transition-fast)',
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  marginBottom: '6px'
};

const routinesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px'
};

const routineCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const routineExercisesListStyle = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid var(--border-color)'
};

const routineExerciseItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px'
};

const exerciseBuilderItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)'
};

const exAddRowStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

export default WorkoutPlanner;
