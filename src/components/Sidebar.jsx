import React, { useState } from 'react';
import { 
  CheckSquare, 
  Dumbbell, 
  Clock, 
  BarChart2, 
  Flame, 
  Award, 
  Sun, 
  Moon,
  ChevronRight,
  Edit3
} from 'lucide-react';

const Sidebar = ({ stats, currentTab, setCurrentTab, theme, toggleTheme, username, setUsername }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(username);

  const xpPercentage = Math.min(100, Math.floor((stats.xp / stats.xpNeeded) * 100));
  
  // Skill calculation helpers
  const getSkillInfo = (xp) => {
    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;
    return { level, progress };
  };

  const prodSkill = getSkillInfo(stats.skillsXp.productivity);
  const strengthSkill = getSkillInfo(stats.skillsXp.strength);
  const focusSkill = getSkillInfo(stats.skillsXp.focus);

  const navItems = [
    { id: 'tasks', label: 'Quests', icon: CheckSquare },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 }
  ];

  const handleSaveName = () => {
    if (editName.trim()) {
      setUsername(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(username);
      setIsEditing(false);
    }
  };

  return (
    <aside className="sidebar-container" style={sidebarStyle}>
      {/* Brand logo */}
      <div className="brand-logo" style={brandLogoStyle}>
        <Award size={24} style={{ color: 'var(--color-primary)' }} />
        <span className="heading-font" style={brandTextStyle}>QuestList</span>
      </div>

      {/* Profile summary card */}
      <div className="profile-card card" style={profileCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar-circle" style={avatarStyle}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                autoFocus
                style={usernameInputStyle}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '100%' }}>
                <span 
                  className="heading-font" 
                  style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {username}
                </span>
                <button 
                  onClick={() => { setEditName(username); setIsEditing(true); }} 
                  style={editNameButtonStyle}
                  className="edit-name-btn"
                  title="Change Username"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level {stats.level} Hero</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>XP Progress</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{stats.xp} / {stats.xpNeeded}</span>
          </div>
          <div className="xp-bar-track" style={xpTrackStyle}>
            <div className="xp-bar-fill" style={{ ...xpFillStyle, width: `${xpPercentage}%` }} />
          </div>
        </div>

        {/* Active Streak */}
        {stats.streak > 0 && (
          <div className="streak-badge" style={streakBadgeStyle}>
            <Flame size={16} fill="currentColor" />
            <span>{stats.streak} Day Streak</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'col', gap: '4px', margin: '24px 0' }}>
        <ul style={{ listStyle: 'none', width: '100%', padding: 0 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id} style={{ marginBottom: '6px' }}>
                <button
                  onClick={() => setCurrentTab(item.id)}
                  style={{
                    ...navButtonStyle,
                    backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    borderColor: isActive ? 'var(--border-color)' : 'transparent'
                  }}
                  className="card-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} />
                    <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Character Skills breakdown */}
      <div className="skills-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <h4 className="heading-font" style={skillsHeaderStyle}>Sub-Skills</h4>
        
        <div style={skillListStyle}>
          {/* Productivity */}
          <div style={skillItemStyle}>
            <div style={skillLabelRowStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckSquare size={12} style={{ color: 'var(--color-productivity)' }} />
                Productivity
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lvl {prodSkill.level}</span>
            </div>
            <div style={skillTrackStyle}>
              <div style={{ ...skillFillStyle, backgroundColor: 'var(--color-productivity)', width: `${prodSkill.progress}%` }} />
            </div>
          </div>

          {/* Strength */}
          <div style={skillItemStyle}>
            <div style={skillLabelRowStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Dumbbell size={12} style={{ color: 'var(--color-strength)' }} />
                Strength
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lvl {strengthSkill.level}</span>
            </div>
            <div style={skillTrackStyle}>
              <div style={{ ...skillFillStyle, backgroundColor: 'var(--color-strength)', width: `${strengthSkill.progress}%` }} />
            </div>
          </div>

          {/* Focus */}
          <div style={skillItemStyle}>
            <div style={skillLabelRowStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Clock size={12} style={{ color: 'var(--color-focus)' }} />
                Focus
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lvl {focusSkill.level}</span>
            </div>
            <div style={skillTrackStyle}>
              <div style={{ ...skillFillStyle, backgroundColor: 'var(--color-focus)', width: `${focusSkill.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle bottom bar */}
      <div style={themeToggleContainerStyle}>
        <button onClick={toggleTheme} style={themeButtonStyle} className="card-hover">
          {theme === 'dark' ? (
            <>
              <Sun size={16} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

// Styles
const sidebarStyle = {
  backgroundColor: 'var(--bg-sidebar)',
  borderRight: '1px solid var(--border-color)',
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'sticky',
  top: 0
};

const brandLogoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '28px'
};

const brandTextStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: 'var(--text-primary)'
};

const profileCardStyle = {
  padding: '16px',
  borderRadius: 'var(--radius-md)'
};

const avatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.1rem',
  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
};

const xpTrackStyle = {
  width: '100%',
  height: '6px',
  backgroundColor: 'var(--bg-input)',
  borderRadius: 'var(--radius-full)',
  overflow: 'hidden',
  marginTop: '4px'
};

const xpFillStyle = {
  height: '100%',
  backgroundColor: 'var(--color-success)',
  borderRadius: 'var(--radius-full)',
  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
};

const streakBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '12px',
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  color: 'var(--color-warning)',
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.8rem',
  fontWeight: 600
};

const navButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '12px 14px',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)'
};

const skillsHeaderStyle = {
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  marginBottom: '12px'
};

const skillListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const skillItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const skillLabelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const skillTrackStyle = {
  width: '100%',
  height: '4px',
  backgroundColor: 'var(--bg-input)',
  borderRadius: 'var(--radius-full)',
  overflow: 'hidden'
};

const skillFillStyle = {
  height: '100%',
  borderRadius: 'var(--radius-full)',
  transition: 'width 0.4s ease'
};

const themeToggleContainerStyle = {
  marginTop: 'auto',
  paddingTop: '20px',
  borderTop: '1px solid var(--border-color)'
};

const themeButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '10px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 500,
  transition: 'all var(--transition-fast)'
};

const usernameInputStyle = {
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--color-primary)',
  borderRadius: '4px',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontWeight: 600,
  padding: '2px 6px',
  width: '100%',
  maxWidth: '120px',
  outline: 'none'
};

const editNameButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '2px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all var(--transition-fast)'
};

export default Sidebar;
