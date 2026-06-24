import React from "react";
import { Brain, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Navbar = ({ sessionTitle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-panel" style={{
      padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 20, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
      borderBottom: 'none', background: 'var(--bg-primary)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-cyan)', color: '#000',
        }}>
          <Brain size={15} />
        </div>
        <h1 style={{
          fontSize: 13, fontWeight: 800, letterSpacing: '0.12em',
          color: 'var(--text-primary)', textTransform: 'uppercase', margin: 0,
        }}>
          Second Brain
        </h1>
      </div>

      {/* Center: Session Title */}
      {sessionTitle && (
        <div className="animate-fade-in" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {sessionTitle}
        </div>
      )}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          width: 36, height: 36, borderRadius: 'var(--radius-full)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
          cursor: 'pointer', color: 'var(--text-secondary)',
          transition: 'all var(--transition-base)',
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.color = 'var(--accent-cyan)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-glass)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div style={{
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </div>
      </button>
    </nav>
  );
};

export default Navbar;
