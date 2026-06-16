import React, { useState } from 'react';
import { Trash, Check, Folder, HelpCircle, X } from 'lucide-react';

const TaskList = ({ tasks, onToggleTask, onDeleteTask, username, welcomeVisible, setWelcomeVisible }) => {
  const [filter, setFilter] = useState('active'); // 'active' | 'completed' | 'all'
  const [catFilter, setCatFilter] = useState('all'); // category filtering

  // Extract all categories dynamically for filtering
  const categories = ['all', ...new Set(tasks.map(t => t.category))];

  const filteredTasks = tasks.filter(task => {
    const statusMatch = 
      filter === 'all' || 
      (filter === 'active' && !task.completed) || 
      (filter === 'completed' && task.completed);
    
    const catMatch = 
      catFilter === 'all' || 
      task.category === catFilter;

    return statusMatch && catMatch;
  });

  const getPriorityXP = (prio) => {
    switch (prio) {
      case 'low': return 10;
      case 'medium': return 25;
      case 'high': return 50;
      default: return 10;
    }
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      
      {/* Session Welcome Banner */}
      {welcomeVisible && (
        <div className="card animate-fade-in" style={welcomeBannerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h3 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Welcome Back, {username}!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your journey continues. Complete the quests on your board to gain experience and boost your skills.
              </p>
            </div>
            <button 
              onClick={() => setWelcomeVisible(false)} 
              style={closeWelcomeButtonStyle}
              className="card-hover"
              title="Dismiss Welcome Greeting"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div style={headerStyle}>
        <h2 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Quest Board</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Complete active quests to level up your Productivity sub-skill and earn XP. Clearing all active quests will automatically replenish the board with a new set of challenges.
        </p>
      </div>

      {/* Filter and Content controls */}
      <div style={controlsRowStyle}>
        <div className="tab-pills" style={{ width: 'fit-content' }}>
          <button 
            type="button" 
            className={`tab-pill ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            type="button" 
            className={`tab-pill ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            type="button" 
            className={`tab-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Folder size={12} /> Filter:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              style={{
                ...catPillStyle,
                backgroundColor: catFilter === cat ? 'var(--color-primary)' : 'var(--bg-card)',
                color: catFilter === cat ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${catFilter === cat ? 'var(--color-primary)' : 'var(--border-color)'}`
              }}
              className="card-hover"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div style={taskListStyle}>
        {filteredTasks.length === 0 ? (
          <div className="card" style={emptyStateStyle}>
            <HelpCircle size={40} style={{ color: 'var(--text-muted)' }} />
            <h4 className="heading-font" style={{ fontSize: '1.1rem', margin: '12px 0 6px 0', color: 'var(--text-secondary)' }}>
              No Quests Found
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>
              Complete any remaining active quests or adjust filters to display items.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="card card-hover animate-fade-in" 
              style={{
                ...taskItemStyle,
                opacity: task.completed ? 0.7 : 1,
                borderLeft: task.completed 
                  ? '3px solid var(--color-success)' 
                  : `3px solid var(--color-${task.priority === 'high' ? 'strength' : task.priority === 'medium' ? 'warning' : 'productivity'})`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                {/* Custom Checkbox */}
                <div 
                  className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => onToggleTask(task.id)}
                >
                  <Check />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span 
                    style={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontWeight: 500,
                      fontSize: '1rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {task.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={categoryLabelStyle}>{task.category}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Created {task.createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Badges and actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className={`badge badge-${task.priority}`}>
                  {task.priority.toUpperCase()} (+{getPriorityXP(task.priority)} XP)
                </span>
                
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="btn-danger-outline"
                  title="Remove Quest"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))
        )}
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

const controlsRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '8px'
};

const catPillStyle = {
  padding: '6px 12px',
  borderRadius: 'var(--radius-full)',
  border: 'none',
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)'
};

const taskListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const taskItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderRadius: 'var(--radius-md)',
  gap: '16px'
};

const categoryLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  backgroundColor: 'var(--bg-app)',
  padding: '2px 8px',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  width: 'fit-content'
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  textAlign: 'center',
  borderStyle: 'dashed'
};

const welcomeBannerStyle = {
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  borderColor: 'rgba(99, 102, 241, 0.25)',
  boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)',
  padding: '16px 20px',
  marginBottom: '20px',
  position: 'relative'
};

const closeWelcomeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  transition: 'all var(--transition-fast)'
};

export default TaskList;
