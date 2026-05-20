import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, FileText, Search, ChevronDown, Paperclip, ArrowUp, CornerDownLeft } from 'lucide-react';

const ChatInput = ({ question, setQuestion, handleAsk, currentMode, setMode, loading, user, uploading, onFileUpload, onAuthRequired }) => {
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [cmdMenuOpen, setCmdMenuOpen] = useState(false);
  const modeDropdownRef = useRef(null);
  const textareaRef = useRef(null);

  // Close mode dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target)) {
        setIsModeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open/close command menu based on question starting with '/'
  useEffect(() => {
    setCmdMenuOpen(question.trim().startsWith('/'));
  }, [question]);

  const modes = {
    study: {
      label: 'Study Mode',
      icon: <BookOpen size={12} />,
      desc: 'Normal chat with your PDFs',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    test: {
      label: 'Assessment',
      icon: <FileText size={12} />,
      desc: 'MCQ-based assessment engine',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    research: {
      label: 'Research',
      icon: <Search size={12} />,
      desc: 'Strict mode with deep citations',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  };

  const handleModeChange = (key) => {
    if (key === 'test' && !user) {
      setIsModeOpen(false);
      if (onAuthRequired) onAuthRequired();
      return;
    }
    setMode(key);
    setIsModeOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setCmdMenuOpen(false);
      handleAsk();
    }
    if (e.key === 'Escape') {
      setCmdMenuOpen(false);
    }
  };

  // Mode-aware command lists
  const studyCommands = [
    { cmd: '/help',    desc: 'Show all commands' },
    { cmd: '/summary', desc: 'Summarize active document' },
    { cmd: '/files',   desc: 'List uploaded files' },
    { cmd: '/reset',   desc: 'Clear chat' },
  ];
  const testCommands = [
    { cmd: '/help',   desc: 'Show all commands' },
    { cmd: '/start',  desc: '/start [filename] — begin test' },
    { cmd: '/10',     desc: 'Generate 10 MCQs' },
    { cmd: '/weak',   desc: 'Target your weak topics' },
    { cmd: '/stats',  desc: 'View performance report' },
    { cmd: '/study',  desc: 'Switch to Study Mode' },
    { cmd: '/reset',  desc: 'Clear chat' },
  ];

  const allCmds = currentMode === 'test' ? testCommands : studyCommands;
  const filteredCmds = question.trim() === '/'
    ? allCmds
    : allCmds.filter(c => c.cmd.startsWith(question.trim().toLowerCase()));

  const selectCommand = (cmd) => {
    setQuestion(cmd + ' ');
    setCmdMenuOpen(false);
    textareaRef.current?.focus();
  };

  const executeCommand = (cmd) => {
    if (currentMode === 'test' && !user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    setQuestion(cmd);
    setCmdMenuOpen(false);
    // Defer to next tick so setQuestion has settled
    setTimeout(() => handleAsk(), 0);
  };

  const active = modes[currentMode] || modes.study;

  return (
    <div className="w-full px-4 md:px-6 pb-6 pt-2">
      <div className="relative flex flex-col bg-slate-900/60 border border-slate-800/50 rounded-[28px] p-2 focus-within:border-slate-700/80 transition-all shadow-2xl backdrop-blur-md">

        {/* ── COMMAND SUGGESTION MENU (floating above input) ── */}
        {cmdMenuOpen && filteredCmds.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-3 mx-2 bg-[#0F172A] border border-slate-700/60 rounded-2xl p-2 shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-50">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/60 mb-1">
              {currentMode === 'test' ? <FileText size={12} className="text-slate-500" /> : <BookOpen size={12} className="text-slate-500" />}
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                {currentMode === 'test' ? 'Assessment Commands' : 'Study Commands'}
              </p>
            </div>
            {filteredCmds.map((c) => (
              <div key={c.cmd} className="flex items-center group">
                <button
                  onMouseDown={(e) => { e.preventDefault(); selectCommand(c.cmd); }}
                  className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-all text-left"
                >
                  <span className={`font-bold text-[12px] ${active.color}`}>{c.cmd}</span>
                  <span className="text-slate-500 text-[10px] font-medium">{c.desc}</span>
                </button>
                {/* Execute button (run immediately) */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); executeCommand(c.cmd); }}
                  title="Run this command"
                  className="opacity-0 group-hover:opacity-100 mr-2 px-2 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all text-slate-400 font-bold uppercase flex items-center gap-1"
                >
                  <CornerDownLeft size={10} /> <span className="text-[9px]">Run</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── TOP BAR: Mode selector + status ── */}
        <div className="flex items-center gap-2 px-3 pb-2 pt-1 border-b border-slate-800/30 mb-1">
          <div className="relative" ref={modeDropdownRef}>
            <button
              onClick={() => setIsModeOpen(!isModeOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:bg-slate-800 ${active.bgColor} ${active.border}`}
            >
              <span className="text-[10px] animate-pulse">●</span>
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1 ${active.color}`}>
                {active.icon} {active.label}
              </span>
              <ChevronDown size={10} className="text-slate-500 ml-1" />
            </button>

            {isModeOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-3 py-2">Select Engine</p>
                {Object.keys(modes).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`w-full flex flex-col items-start gap-1 p-3 rounded-xl transition-all mb-1 ${
                      currentMode === key ? 'bg-slate-800/80 ring-1 ring-slate-700' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`${modes[key].color}`}>{modes[key].icon}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${modes[key].color}`}>
                        {modes[key].label}
                      </span>
                      {key === 'test' && !user && (
                        <span className="text-[8px] text-yellow-500 font-bold uppercase">● Pro</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium lowercase tracking-tight">
                      {modes[key].desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter italic">
            {loading ? "Neural Link Active..." : "Second Brain Sync'd"}
          </span>
        </div>

        {/* ── INPUT ROW ── */}
        <div className="flex items-center gap-3 px-3 py-1">

          {/* + File Upload Button */}
          <label
            title="Upload a PDF"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer select-none ${
              uploading
                ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            }`}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Paperclip size={18} />
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileUpload(e.target.files[0]);
                  e.target.value = null;
                }
              }}
            />
          </label>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentMode === 'test'
                ? "Type / for commands, e.g. /start physics.pdf"
                : "Ask anything... or type / for commands"
            }
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-200 placeholder:text-slate-600 resize-none max-h-32 py-3 px-1 no-scrollbar"
            rows="1"
            disabled={loading}
          />

          {/* Send Button */}
          <button
            onClick={() => { setCmdMenuOpen(false); handleAsk(); }}
            disabled={loading || !question.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg shrink-0 ${
              loading || !question.trim()
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:scale-105 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <ArrowUp size={20} strokeWidth={3} />
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-[9px] text-slate-700 mt-3 font-medium uppercase tracking-[0.2em]">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
};

export default ChatInput;