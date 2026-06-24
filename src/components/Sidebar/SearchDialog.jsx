import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, Calendar } from 'lucide-react';

const SearchDialog = ({ isOpen, onClose, sessions = [], onSelectSession }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
  };

  const filteredSessions = Array.isArray(sessions)
    ? sessions.filter(s => s && typeof s.title === 'string' && s.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 96, padding: '96px 16px 0',
      }}
    >
      <div
        ref={dialogRef}
        className="animate-fade-in-down"
        style={{
          width: '100%', maxWidth: 560,
          background: 'var(--bg-glass)', backdropFilter: 'blur(24px) saturate(1.5)',
          border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
          maxHeight: 500, overflow: 'hidden',
        }}
      >
        {/* Search header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderBottom: '1px solid var(--border-glass)',
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search previous chat sessions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            onClick={onClose}
            style={{
              padding: 4, borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="thin-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {filteredSessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredSessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => { onSelectSession(session._id); onClose(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: 'transparent', border: '1px solid transparent',
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, paddingRight: 16 }}>
                    <MessageSquare size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{
                      color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {session.title}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 9, fontWeight: 700, color: 'var(--text-faint)',
                    textTransform: 'uppercase', letterSpacing: '0.15em', flexShrink: 0,
                  }}>
                    <Calendar size={10} />
                    <span>{formatDate(session.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '48px 16px', textAlign: 'center',
            }}>
              <MessageSquare size={32} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                No chats found
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4, maxWidth: 280 }}>
                We couldn't find any chats matching "{query}". Try checking your spelling.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 14px', borderTop: '1px solid var(--border-glass)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 9, fontWeight: 700, color: 'var(--text-faint)',
          textTransform: 'uppercase', letterSpacing: '0.2em',
        }}>
          <span>{filteredSessions.length} sessions found</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
