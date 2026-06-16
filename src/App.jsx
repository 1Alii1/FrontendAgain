import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import WorkoutPlanner from './components/WorkoutPlanner';
import FocusTimer from './components/FocusTimer';
import Dashboard from './components/Dashboard';
import LevelUpModal from './components/LevelUpModal';

// Predefined static quest pool (Strictly NO emojis)
const QUEST_POOL = [
  { title: "Complete a 25-minute Focus Session", priority: "medium", category: "Study" },
  { title: "Do 3 sets of squats in the Workout Arena", priority: "high", category: "Fitness" },
  { title: "Review tomorrow's task schedule", priority: "low", category: "Work" },
  { title: "Drink 8 glasses of water today", priority: "low", category: "Routine" },
  { title: "Read 10 pages of a book", priority: "medium", category: "Personal" },
  { title: "Complete a Full Workout Routine", priority: "high", category: "Fitness" },
  { title: "Organize digital workspace files", priority: "medium", category: "Work" },
  { title: "Spend 15 minutes stretching", priority: "low", category: "Fitness" },
  { title: "Plan weekly goals and milestones", priority: "medium", category: "Personal" },
  { title: "Perform a core trainer session", priority: "high", category: "Fitness" },
  { title: "Practice a new skill or language", priority: "medium", category: "Study" },
  { title: "Meditate for 10 minutes", priority: "low", category: "Personal" },
  { title: "Clean and declutter physical desk", priority: "low", category: "Routine" },
  { title: "Complete a high-priority work draft", priority: "high", category: "Work" },
  { title: "Update personal progress journal", priority: "low", category: "Personal" },
  { title: "Run 2 miles or walk briskly", priority: "high", category: "Fitness" }
];

// Helper to draw random quests from the pool
const generateRandomQuests = (count = 4) => {
  const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(q => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: q.title,
    priority: q.priority,
    category: q.category,
    completed: false,
    createdDate: new Date().toISOString().split('T')[0],
    completedDate: null
  }));
};

// Initial state helpers
const getInitialStats = () => {
  const saved = localStorage.getItem('ql_stats');
  if (saved) return JSON.parse(saved);
  return {
    level: 1,
    xp: 0,
    xpNeeded: 100,
    streak: 0,
    lastActiveDate: null,
    skillsXp: {
      productivity: 0,
      strength: 0,
      focus: 0
    }
  };
};

const getInitialTasks = () => {
  const saved = localStorage.getItem('ql_tasks');
  if (saved) {
    const parsed = JSON.parse(saved);
    // If we have active quests, return them. If not, generate new ones.
    const activeCount = parsed.filter(t => !t.completed).length;
    if (parsed.length > 0 && activeCount > 0) return parsed;
  }
  return generateRandomQuests(4);
};

const getInitialWorkouts = () => {
  const saved = localStorage.getItem('ql_workouts');
  return saved ? JSON.parse(saved) : [];
};

const getInitialHistory = () => {
  const saved = localStorage.getItem('ql_history');
  return saved ? JSON.parse(saved) : [];
};

const getInitialTheme = () => {
  const saved = localStorage.getItem('ql_theme');
  return saved || 'dark';
};

const getInitialUsername = () => {
  const saved = localStorage.getItem('ql_username');
  return saved || 'Adventurer';
};

function App() {
  const [currentTab, setCurrentTab] = useState('tasks');
  const [stats, setStats] = useState(getInitialStats);
  const [tasks, setTasks] = useState(getInitialTasks);
  const [workouts, setWorkouts] = useState(getInitialWorkouts);
  const [history, setHistory] = useState(getInitialHistory);
  const [theme, setTheme] = useState(getInitialTheme);
  const [username, setUsername] = useState(getInitialUsername);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [levelUpPending, setLevelUpPending] = useState(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ql_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('ql_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ql_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('ql_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ql_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('ql_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
  }, [theme]);

  // Session-based Welcome message tracking
  useEffect(() => {
    const welcomed = sessionStorage.getItem('ql_welcomed');
    if (welcomed !== 'true') {
      setWelcomeVisible(true);
      sessionStorage.setItem('ql_welcomed', 'true');
    }
  }, []);

  // Streak verification on mount
  useEffect(() => {
    verifyStreak();
  }, []);

  const verifyStreak = () => {
    const todayStr = getLocalDateString();
    const lastActive = stats.lastActiveDate;

    if (!lastActive) return;

    const diffDays = getDaysDifference(lastActive, todayStr);

    if (diffDays > 1) {
      setStats(prev => ({
        ...prev,
        streak: 0
      }));
      addHistoryLog('System', 'Streak reset due to inactivity', 0);
    }
  };

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDaysDifference = (date1Str, date2Str) => {
    const d1 = new Date(date1Str + 'T00:00:00');
    const d2 = new Date(date2Str + 'T00:00:00');
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Gamification core: Reward XP & update sub-skills
  const gainXp = (amount, skillType, sourceName) => {
    if (amount <= 0) return;

    const todayStr = getLocalDateString();
    let newStreak = stats.streak;

    if (stats.lastActiveDate !== todayStr) {
      if (stats.lastActiveDate === null) {
        newStreak = 1;
      } else {
        const diffDays = getDaysDifference(stats.lastActiveDate, todayStr);
        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
    }

    setStats(prev => {
      let currentXp = prev.xp + amount;
      let currentLevel = prev.level;
      let neededXp = prev.xpNeeded;
      let leveledUp = false;

      while (currentXp >= neededXp) {
        currentXp -= neededXp;
        currentLevel += 1;
        neededXp = currentLevel * 100;
        leveledUp = true;
      }

      const updatedSkillsXp = {
        ...prev.skillsXp,
        [skillType]: (prev.skillsXp[skillType] || 0) + amount
      };

      if (leveledUp) {
        setLevelUpPending({
          oldLevel: prev.level,
          newLevel: currentLevel
        });
      }

      return {
        ...prev,
        level: currentLevel,
        xp: currentXp,
        xpNeeded: neededXp,
        streak: newStreak,
        lastActiveDate: todayStr,
        skillsXp: updatedSkillsXp
      };
    });

    addHistoryLog(skillType, `${sourceName} completed: earned ${amount} XP`, amount);
  };

  const addHistoryLog = (type, description, xpEarned) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = getLocalDateString();
    
    setHistory(prev => [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        type,
        description,
        xpEarned,
        timestamp,
        date
      },
      ...prev
    ].slice(0, 100));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleTask = (id) => {
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === id) {
          const nextState = !task.completed;
          let xpReward = 0;
          
          if (nextState) {
            if (task.priority === 'low') xpReward = 10;
            else if (task.priority === 'medium') xpReward = 25;
            else if (task.priority === 'high') xpReward = 50;

            gainXp(xpReward, 'productivity', task.title);
            
            return {
              ...task,
              completed: nextState,
              completedDate: getLocalDateString()
            };
          } else {
            return {
              ...task,
              completed: nextState,
              completedDate: null
            };
          }
        }
        return task;
      });

      // Auto-replenish check: If all active tasks are completed, generate 4 more quests
      const activeCount = updated.filter(t => !t.completed).length;
      if (activeCount === 0) {
        return [...updated, ...generateRandomQuests(4)];
      }

      return updated;
    });
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => {
      const updated = prev.filter(task => task.id !== id);
      // Auto-replenish check upon deletion
      const activeCount = updated.filter(t => !t.completed).length;
      if (activeCount === 0) {
        return [...updated, ...generateRandomQuests(4)];
      }
      return updated;
    });
  };

  // Workout state modifiers
  const handleSaveWorkout = (workout) => {
    setWorkouts(prev => {
      const exists = prev.some(w => w.id === workout.id);
      if (exists) {
        return prev.map(w => w.id === workout.id ? workout : w);
      }
      return [workout, ...prev];
    });
  };

  const handleDeleteWorkout = (id) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const handleCompleteWorkout = (id) => {
    setWorkouts(prev => prev.map(w => {
      if (w.id === id) {
        const baseXP = 15;
        const exerciseCount = w.exercises.length;
        const xpReward = baseXP + (exerciseCount * 10);
        
        gainXp(xpReward, 'strength', w.name);
        
        return {
          ...w,
          completed: true,
          completedDate: getLocalDateString()
        };
      }
      return w;
    }));
  };

  return (
    <div className="app-layout">
      <Sidebar 
        stats={stats} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        theme={theme}
        toggleTheme={toggleTheme}
        username={username}
        setUsername={setUsername}
      />
      
      <main className="main-content" style={{ padding: '32px', overflowY: 'auto', height: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {currentTab === 'tasks' && (
            <TaskList 
              tasks={tasks} 
              onToggleTask={handleToggleTask} 
              onDeleteTask={handleDeleteTask}
              username={username}
              welcomeVisible={welcomeVisible}
              setWelcomeVisible={setWelcomeVisible}
            />
          )}
          
          {currentTab === 'workouts' && (
            <WorkoutPlanner 
              workouts={workouts} 
              onSaveWorkout={handleSaveWorkout}
              onDeleteWorkout={handleDeleteWorkout}
              onCompleteWorkout={handleCompleteWorkout}
            />
          )}
          
          {currentTab === 'timer' && (
            <FocusTimer 
              tasks={tasks}
              onFocusComplete={(minutes, taskName) => {
                const xp = Math.round(minutes * 1.5);
                gainXp(xp, 'focus', taskName || 'Focus session');
              }}
            />
          )}
          
          {currentTab === 'dashboard' && (
            <Dashboard 
              stats={stats}
              history={history}
              tasks={tasks}
              workouts={workouts}
            />
          )}
        </div>
      </main>

      {levelUpPending && (
        <LevelUpModal 
          oldLevel={levelUpPending.oldLevel}
          newLevel={levelUpPending.newLevel}
          onClose={() => setLevelUpPending(null)}
        />
      )}
    </div>
  );
}

export default App;
