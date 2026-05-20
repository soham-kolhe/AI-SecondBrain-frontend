import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, BrainCircuit, ChevronDown, MessageSquare, Pencil, Link as LinkIcon, Trash2, MoreVertical } from 'lucide-react';

const Sidebar = ({ chatSessions, activeSessionId, onSelectSession, onNewChat, onRename, onDelete, onShare, weakTopics = [], onRetryTopic }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <div className={`${isExpanded ? 'w-[260px]' : 'w-[72px]'} transition-all duration-300 ease-in-out border-r border-slate-800/30 flex flex-col bg-[#0B0F1A] overflow-hidden shrink-0`}>
      <div className="p-4 pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-all"
          title={isExpanded ? "Collapse menu" : "Open menu"}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3 border-b border-slate-800/30">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} h-10 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 rounded-xl transition-all group`}
          title="New chat"
        >
          <Plus size={18} className="text-cyan-500 group-hover:text-cyan-400" />
          {isExpanded && <span className="ml-3 text-[11px] font-bold text-cyan-500 group-hover:text-cyan-400 uppercase tracking-widest truncate">New Chat</span>}
        </button>
      </div>

      {/* Revision Topics / Weak Topics */}
      {weakTopics && weakTopics.length > 0 && (
        <div className="px-2 py-3 border-b border-slate-800/30">
          <button
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setIsRevisionOpen(!isRevisionOpen);
            }}
            className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center'} py-2 rounded-lg hover:bg-red-500/10 transition-all text-red-400`}
            title="Revision Topics"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} />
              {isExpanded && <span className="text-[10px] font-black uppercase tracking-widest truncate">Revision</span>}
            </div>
            {isExpanded && (
              <ChevronDown size={14} className={`transition-transform ${isRevisionOpen ? 'rotate-180' : ''}`} />
            )}
          </button>
          
          {isExpanded && isRevisionOpen && (
            <div className="mt-2 space-y-1 px-2">
              {weakTopics.slice(0, 5).map((topic, i) => (
                <button
                  key={i}
                  onClick={() => onRetryTopic && onRetryTopic(topic.topic || topic.name)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/50 text-[11px] font-medium text-slate-300 truncate transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{topic.topic || topic.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-red-400 text-[10px] shrink-0">Retry</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 no-scrollbar">
        {isExpanded && (
          <p className="text-[9px] font-black text-slate-600 uppercase px-3 mb-3 tracking-widest truncate">
            Recent Chats
          </p>
        )}

        {isExpanded && chatSessions.length === 0 ? (
          <p className="text-[10px] text-slate-600 px-3 italic truncate">No sessions yet...</p>
        ) : (
          isExpanded && chatSessions.map((session) => (
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
                <div className="flex w-full items-center">
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleRenameKey}
                    className="flex-1 bg-slate-700/60 text-slate-200 text-[12px] font-medium rounded-lg px-3 py-2 outline-none border border-cyan-500/40 m-1 w-full"
                    maxLength={60}
                  />
                  <div className="w-6 h-6 flex items-center justify-center text-cyan-400"><Pencil size={14} /></div>
                </div>
              ) : (
                <button
                  onClick={() => onSelectSession(session._id)}
                  className={`flex-1 flex items-center text-left px-3 py-2.5 w-full text-[12px] font-medium transition-all ${
                    activeSessionId === session._id ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  {/* <MessageSquare size={14} className="mr-2" /> */}
                  <span className="truncate">{session.title}</span>
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
                    <MoreVertical size={14} />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpenId === session._id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#0F172A] border border-slate-700/50 rounded-xl shadow-2xl z-[100] py-1 overflow-hidden">
                      <button
                        onClick={() => startRename(session)}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Pencil size={12} /> Rename
                      </button>
                      <button
                        onClick={() => { setMenuOpenId(null); onShare(session._id); }}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
                      >
                        <LinkIcon size={12} /> Copy to Clipboard
                      </button>
                      <div className="my-1 h-px bg-slate-800/50" />
                      <button
                        onClick={() => { setMenuOpenId(null); onDelete(session._id); }}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-2"
                      >
                        <Trash2 size={12} /> Delete
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