import React, { useState, useRef, useEffect } from 'react';

const Sidebar = ({ chatSessions, activeSessionId, onSelectSession, onNewChat, onRename, onDelete, onShare }) => {
  const [menuOpenId, setMenuOpenId] = useState(null); // which session's three-dot menu is open
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus rename input
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
    if (renameValue.trim() && renamingId) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
  };

  return (
    <div className="w-[260px] border-r border-slate-800 flex flex-col bg-[#0B0F1A] overflow-hidden shrink-0">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={onNewChat}
          className="w-full border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 py-3 rounded-xl text-[11px] font-bold text-cyan-500 uppercase tracking-widest transition-all"
        >
          + New Brain
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 no-scrollbar">
        <p className="text-[9px] font-black text-slate-600 uppercase px-3 mb-3 tracking-widest">
          Recent Brains
        </p>

        {chatSessions.length === 0 ? (
          <p className="text-[10px] text-slate-600 px-3 italic">No sessions yet...</p>
        ) : (
          chatSessions.map((session) => (
            <div
              key={session._id}
              className={`group relative flex items-center rounded-xl transition-all border ${
                activeSessionId === session._id
                  ? 'bg-slate-800/80 border-cyan-500/20'
                  : 'border-transparent hover:bg-slate-900/60'
              }`}
            >
              {/* Inline rename input */}
              {renamingId === session._id ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKey}
                  className="flex-1 bg-slate-700/60 text-slate-200 text-[12px] font-medium rounded-lg px-3 py-2 outline-none border border-cyan-500/40 m-1"
                  maxLength={60}
                />
              ) : (
                <button
                  onClick={() => onSelectSession(session._id)}
                  className={`flex-1 text-left px-3 py-2.5 text-[12px] font-medium truncate transition-all ${
                    activeSessionId === session._id ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  <span className="mr-1.5 text-slate-600 text-[10px]">💬</span>
                  {session.title}
                </button>
              )}

              {/* ⋮ Three-dot menu trigger */}
              {renamingId !== session._id && (
                <div className="relative" ref={menuOpenId === session._id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === session._id ? null : session._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 mr-2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-slate-200 shrink-0"
                    title="Session options"
                  >
                    <span className="text-[14px] leading-none">⋮</span>
                  </button>

                  {/* Dropdown menu */}
                  {menuOpenId === session._id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-[100] py-1 overflow-hidden">
                      <button
                        onClick={() => startRename(session)}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
                      >
                        ✏️ Rename
                      </button>
                      <button
                        onClick={() => { setMenuOpenId(null); onShare(session._id); }}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
                      >
                        🔗 Copy to Clipboard
                      </button>
                      <div className="my-1 h-px bg-slate-800" />
                      <button
                        onClick={() => { setMenuOpenId(null); onDelete(session._id); }}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-2"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;