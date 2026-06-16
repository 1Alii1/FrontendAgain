import React from 'react';
import { Award, Flame, CheckSquare, Dumbbell, Clock, Calendar, ShieldAlert } from 'lucide-react';

const Dashboard = ({ stats, history, tasks, workouts }) => {
  // Aggregate Metrics
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedWorkouts = workouts.filter(w => w.completed).length;

  // Calculate Last 7 Days XP breakdown for the bar chart
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const label = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      days.push({ dateStr, label, xp: 0 });
    }
    return days;
  };

  const chartData = getLast7Days();

  // Populate chart values from history logs
  history.forEach(log => {
    if (log.date) {
      const chartDay = chartData.find(d => d.dateStr === log.date);
      if (chartDay) {
        chartDay.xp += (log.xpEarned || 0);
      }
    }
  });

  const maxXp = Math.max(...chartData.map(d => d.xp), 50); // Fallback max to prevent division by zero

  const getActivityIcon = (type) => {
    switch (type) {
      case 'productivity': return <CheckSquare size={14} style={{ color: 'var(--color-productivity)' }} />;
      case 'strength': return <Dumbbell size={14} style={{ color: 'var(--color-strength)' }} />;
      case 'focus': return <Clock size={14} style={{ color: 'var(--color-focus)' }} />;
      case 'System': return <ShieldAlert size={14} style={{ color: 'var(--color-warning)' }} />;
      default: return <Award size={14} style={{ color: 'var(--color-primary)' }} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'productivity': return 'var(--color-productivity)';
      case 'strength': return 'var(--color-strength)';
      case 'focus': return 'var(--color-focus)';
      case 'System': return 'var(--color-warning)';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Character Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of your level progress, training metrics, and recent quest completions.</p>
      </div>

      {/* Metrics Grid */}
      <div style={metricsGridStyle}>
        {/* Level */}
        <div className="card" style={metricCardStyle}>
          <div style={metricIconContainerStyle('var(--color-primary)')}>
            <Award size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Level</span>
            <h3 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Level {stats.level}</h3>
          </div>
        </div>

        {/* Streak */}
        <div className="card" style={metricCardStyle}>
          <div style={metricIconContainerStyle('var(--color-warning)')}>
            <Flame size={22} style={{ color: 'white' }} fill="white" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Streak</span>
            <h3 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.streak} Days</h3>
          </div>
        </div>

        {/* Completed Quests */}
        <div className="card" style={metricCardStyle}>
          <div style={metricIconContainerStyle('var(--color-productivity)')}>
            <CheckSquare size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed Quests</span>
            <h3 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedTasks} Done</h3>
          </div>
        </div>

        {/* Completed Workouts */}
        <div className="card" style={metricCardStyle}>
          <div style={metricIconContainerStyle('var(--color-strength)')}>
            <Dumbbell size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Workouts Finished</span>
            <h3 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedWorkouts} Completed</h3>
          </div>
        </div>
      </div>

      {/* Charts & Feed split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        {/* XP Progress Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 600 }}>XP Gained (Last 7 Days)</h3>
          </div>

          <div className="chart-container">
            {chartData.map(day => {
              const heightPercent = Math.max(5, Math.floor((day.xp / maxXp) * 100));
              return (
                <div key={day.dateStr} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${heightPercent}%`,
                      backgroundColor: day.xp > 0 ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {day.xp > 0 && (
                      <div className="chart-bar-tooltip">
                        {day.xp} XP
                      </div>
                    )}
                  </div>
                  <span className="chart-label">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* History Log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '315px' }}>
          <h3 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Activity Log</h3>
          
          <div style={historyScrollStyle}>
            {history.length === 0 ? (
              <div style={emptyHistoryStyle}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activity logged yet. Complete quests to populate details.</span>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} style={historyItemStyle}>
                  <div style={historyDotStyle(getActivityColor(item.type))} />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.description}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.timestamp} • {item.date}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getActivityIcon(item.type)}
                    {item.xpEarned > 0 && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)' }}>
                        +{item.xpEarned} XP
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px'
};

const metricCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '20px'
};

const metricIconContainerStyle = (color) => ({
  width: '44px',
  height: '44px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 12px ${color}33`
});

const historyScrollStyle = {
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  flex: 1,
  paddingRight: '6px'
};

const emptyHistoryStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  height: '100%',
  padding: '24px'
};

const historyItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)'
};

const historyDotStyle = (color) => ({
  width: '6px',
  height: '6px',
  borderRadius: 'var(--radius-full)',
  backgroundColor: color
});

export default Dashboard;
