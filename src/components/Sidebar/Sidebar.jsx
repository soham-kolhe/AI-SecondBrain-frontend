import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, BrainCircuit, ChevronDown, Pencil, Link as LinkIcon, Trash2, MoreVertical, Search, BookOpen, FileText, FolderOpen, LogOut, LogIn, MessageSquare } from 'lucide-react';
import SearchDialog from './SearchDialog';

const Sidebar = ({
  chatSessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRename,
  onDelete,
  onShare,
  weakTopics = [],
  onRetryTopic,
  user,
  onLoginClick,
  onRegisterClick,
  onLogout,
  currentMode,
  onModeSwitch,
  isDocumentsOpen,
  onToggleDocuments
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModesOpen, setIsModesOpen] = useState(true);
  const [isRecentsPopoverOpen, setIsRecentsPopoverOpen] = useState(false);

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);
  const popoverRef = useRef(null);

  const modes = {
    study: { label: 'Study Mode', icon: <BookOpen size={14} />, color: 'var(--accent-cyan)' },
    test: { label: 'Assessment', icon: <FileText size={14} />, color: 'var(--accent-purple)' },
    research: { label: 'Research', icon: <Search size={14} />, color: 'var(--accent-emerald)' },
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpenId(null);
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsRecentsPopoverOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      setIsRecentsPopoverOpen(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const startRename = (session) => {
    setRenamingId(session._id);
    setRenameValue(session.title);
    setMenuOpenId(null);
  };

  const commitRename = () => {
    if (renameValue.trim() && renamingId) onRename(renamingId, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
  };

  return (
    <>
      <div style={{
        width: isExpanded ? 260 : 72,
        transition: 'width var(--transition-slow)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-secondary)',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Toggle Button */}
        <div style={{ padding: '16px 16px 8px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'all var(--transition-base)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title={isExpanded ? "Collapse menu" : "Open menu"}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* New Chat, Search & Documents */}
        <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { onClick: onNewChat, icon: <Plus size={14} />, label: 'New Chat', iconColor: 'var(--accent-cyan)', isActive: false },
            { onClick: () => setIsSearchOpen(true), icon: <Search size={14} />, label: 'Search Chats', iconColor: 'var(--text-muted)', isActive: false },
            { onClick: onToggleDocuments, icon: <FolderOpen size={14} />, label: 'Documents', iconColor: isDocumentsOpen ? 'var(--accent-cyan)' : 'var(--text-muted)', isActive: isDocumentsOpen },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: isExpanded ? 10 : 0,
                justifyContent: isExpanded ? 'flex-start' : 'center',
                padding: isExpanded ? '10px 12px' : '0',
                height: isExpanded ? 'auto' : 40,
                borderRadius: 'var(--radius-md)',
                background: btn.isActive ? 'var(--bg-card)' : 'transparent',
                border: btn.isActive ? '1px solid var(--border-glass)' : 'none',
                cursor: 'pointer',
                color: btn.isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={e => {
                if (!btn.isActive) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!btn.isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              title={btn.label}
            >
              <span style={{ color: btn.iconColor, flexShrink: 0 }}>{btn.icon}</span>
              {isExpanded && <span style={{ fontSize: 13, fontWeight: 700 }}>{btn.label}</span>}
            </button>
          ))}
        </div>

        {/* Modes Section */}
        <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border-glass)' }}>
          {isExpanded && (
            <button
              onClick={() => setIsModesOpen(!isModesOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 4px', marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Engine Mode
              </span>
              <ChevronDown size={14} style={{
                color: 'var(--text-muted)', transition: 'transform var(--transition-base)',
                transform: isModesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              }} />
            </button>
          )}

          {(!isExpanded || isModesOpen) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isExpanded ? 4 : 6 }}>
              {Object.keys(modes).map((key) => {
                const m = modes[key];
                const isActive = currentMode === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'test' && !user) { if (onLoginClick) onLoginClick(); return; }
                      onModeSwitch(key);
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: isExpanded ? 10 : 0,
                      justifyContent: isExpanded ? 'flex-start' : 'center',
                      padding: isExpanded ? '10px 12px' : '0',
                      height: isExpanded ? 'auto' : 40,
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--bg-card)' : 'transparent',
                      border: isActive ? '1px solid var(--border-glass)' : '1px solid transparent',
                      cursor: 'pointer', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    title={m.label}
                  >
                    <span style={{ color: m.color, flexShrink: 0 }}>{m.icon}</span>
                    {isExpanded && (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 700, flex: 1, textAlign: 'left' }}>{m.label}</span>
                        {key === 'test' && !user && (
                          <span style={{ fontSize: 8, fontWeight: 800, color: '#eab308', textTransform: 'uppercase' }}>Pro</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
              {!isExpanded && (
                <>
                  <div style={{ margin: '4px 0', height: 1, background: 'var(--border-glass)' }} />
                  <button
                    onClick={() => setIsRecentsPopoverOpen(!isRecentsPopoverOpen)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: isRecentsPopoverOpen ? 'var(--bg-card)' : 'transparent',
                      border: isRecentsPopoverOpen ? '1px solid var(--border-glass)' : '1px solid transparent',
                      cursor: 'pointer', color: isRecentsPopoverOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={e => { if (!isRecentsPopoverOpen) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    onMouseLeave={e => { if (!isRecentsPopoverOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    title="Recents"
                  >
                    <span style={{ color: isRecentsPopoverOpen ? 'var(--accent-cyan)' : 'var(--text-muted)', flexShrink: 0 }}>
                      <MessageSquare size={14} />
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Revision Topics */}
        {weakTopics && weakTopics.length > 0 && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => { if (!isExpanded) setIsExpanded(true); setIsRevisionOpen(!isRevisionOpen); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: isExpanded ? 'space-between' : 'center',
                padding: isExpanded ? '8px 12px' : '0',
                height: isExpanded ? 'auto' : 40,
                borderRadius: 'var(--radius-md)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--accent-red)', transition: 'all var(--transition-base)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Revision Topics"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BrainCircuit size={16} />
                {isExpanded && <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Revision</span>}
              </div>
              {isExpanded && <ChevronDown size={14} style={{ transition: 'transform var(--transition-base)', transform: isRevisionOpen ? 'rotate(180deg)' : 'none' }} />}
            </button>

            {isExpanded && isRevisionOpen && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px' }}>
                {weakTopics.slice(0, 5).map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => onRetryTopic && onRetryTopic(topic.topic || topic.name)}
                    className="glass-card"
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 12px',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                      {topic.topic || topic.name}
                    </span>
                    <span style={{ opacity: 0, color: 'var(--accent-red)', fontSize: 10, fontWeight: 700, flexShrink: 0, transition: 'opacity var(--transition-fast)' }}
                      className="retry-label"
                    >
                      Retry
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat List */}
        <div className="thin-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isExpanded && Array.isArray(chatSessions) && chatSessions.map((session) => (
            <div
              key={session._id}
              style={{
                display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-md)',
                background: activeSessionId === session._id ? 'var(--bg-card)' : 'transparent',
                transition: 'all var(--transition-base)', position: 'relative',
              }}
              onMouseEnter={e => { if (activeSessionId !== session._id) e.currentTarget.style.background = 'var(--bg-card)'; }}
              onMouseLeave={e => { if (activeSessionId !== session._id) e.currentTarget.style.background = 'transparent'; }}
            >
              {renamingId === session._id ? (
                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleRenameKey}
                    style={{
                      flex: 1, background: 'var(--bg-card)', color: 'var(--text-primary)',
                      fontSize: 12, fontWeight: 500, borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px', outline: 'none',
                      border: '1px solid var(--border-accent)', margin: 4,
                    }}
                    maxLength={60}
                  />
                  <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    <Pencil size={14} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelectSession(session._id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', textAlign: 'left',
                    padding: '10px 12px', background: 'none', border: 'none',
                    fontSize: 12, fontWeight: activeSessionId === session._id ? 700 : 500,
                    color: activeSessionId === session._id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'color var(--transition-fast)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.title}</span>
                </button>
              )}

              {/* Three-dot menu */}
              {renamingId !== session._id && (
                <div style={{ position: 'relative' }} ref={menuOpenId === session._id ? menuRef : null}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session._id ? null : session._id); }}
                    style={{
                      opacity: 0, marginRight: 8, width: 28, height: 28,
                      borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', transition: 'all var(--transition-fast)',
                    }}
                    className="session-menu-btn"
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <MoreVertical size={14} />
                  </button>

                  {menuOpenId === session._id && (
                    <div className="animate-scale-in" style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: 4,
                      width: 160, background: 'var(--bg-glass)', backdropFilter: 'blur(24px)',
                      border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)', zIndex: 100, padding: 4, overflow: 'hidden',
                    }}>
                      {[
                        { label: 'Rename', icon: <Pencil size={12} />, onClick: () => startRename(session) },
                        { label: 'Copy to Clipboard', icon: <LinkIcon size={12} />, onClick: () => { setMenuOpenId(null); onShare(session._id); } },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.onClick}
                          style={{
                            width: '100%', textAlign: 'left', padding: '10px 14px',
                            fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          {item.icon} {item.label}
                        </button>
                      ))}
                      <div style={{ margin: '2px 0', height: 1, background: 'var(--border-glass)' }} />
                      <button
                        onClick={() => { setMenuOpenId(null); onDelete(session._id); }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 14px',
                          fontSize: 11, fontWeight: 700, color: 'var(--accent-red)',
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>



        {/* Auth Section */}
        <div style={{
          padding: 12, borderTop: '1px solid var(--border-glass)',
          background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
        }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center', width: '100%' }}>
              {isExpanded ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#000', fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                      flexShrink: 0, boxShadow: 'var(--shadow-glow-cyan)',
                    }}>
                      {(user.user?.name || user.name || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 10, fontWeight: 900, color: 'var(--text-primary)',
                        textTransform: 'uppercase', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {user.user?.name || user.name}
                      </p>
                      <p style={{ fontSize: 8, fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '2px 0 0' }}>
                        Pro Member
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    style={{
                      padding: 8, borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                    title="Log out"
                  >
                    <LogOut size={14} />
                  </button>
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#000', fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                      boxShadow: 'var(--shadow-glow-cyan)', cursor: 'pointer',
                    }}
                    onClick={() => setIsExpanded(true)}
                    title={user.user?.name || user.name}
                  >
                    {(user.user?.name || user.name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', alignItems: 'center' }}>
              {isExpanded ? (
                <>
                  <button
                    onClick={onLoginClick}
                    style={{
                      width: '100%', height: 32, fontSize: 10, fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.15em',
                      color: 'var(--text-secondary)', background: 'transparent',
                      border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    Log in
                  </button>
                  <button
                    onClick={onRegisterClick}
                    style={{
                      width: '100%', height: 32, fontSize: 10, fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.15em',
                      color: '#000', background: 'var(--accent-cyan)',
                      border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      boxShadow: 'var(--shadow-glow-cyan)',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <button
                  onClick={onLoginClick}
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    transition: 'all var(--transition-base)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                  title="Log in"
                >
                  <LogIn size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session menu hover style injection */}
      <style>{`
        div:hover > .session-menu-btn { opacity: 1 !important; }
        .glass-card:hover .retry-label { opacity: 1 !important; }
      `}</style>

      {isRecentsPopoverOpen && (
        <div
          ref={popoverRef}
          className="animate-scale-in"
          style={{
            position: 'fixed',
            left: 80,
            top: 354,
            width: 280,
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: 350,
          }}
        >
          <div style={{
            fontSize: 11,
            fontWeight: 900,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            padding: '0 8px 8px 8px',
            borderBottom: '1px solid var(--border-glass)',
            marginBottom: 6,
          }}>
            Recents
          </div>
          <div className="thin-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.isArray(chatSessions) && chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <div
                  key={session._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: activeSessionId === session._id ? 'var(--bg-card)' : 'transparent',
                    transition: 'all var(--transition-base)',
                  }}
                  onMouseEnter={e => { if (activeSessionId !== session._id) e.currentTarget.style.background = 'var(--bg-card)'; }}
                  onMouseLeave={e => { if (activeSessionId !== session._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <button
                    onClick={() => {
                      onSelectSession(session._id);
                      setIsRecentsPopoverOpen(false);
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: activeSessionId === session._id ? 700 : 500,
                      color: activeSessionId === session._id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.title}
                    </span>
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                No recent chats
              </div>
            )}
          </div>
        </div>
      )}

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sessions={chatSessions}
        onSelectSession={onSelectSession}
      />
    </>
  );
};

export default Sidebar;