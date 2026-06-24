import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, FileText, Search, Paperclip, ArrowUp, CornerDownLeft } from 'lucide-react';

const ChatInput = ({ question, setQuestion, handleAsk, currentMode, setMode, loading, user, uploading, uploadedFiles, onFileUpload, onAuthRequired }) => {
  const [cmdMenuOpen, setCmdMenuOpen] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setCmdMenuOpen(question.trim().startsWith('/'));
  }, [question]);

  const modes = {
    study: { label: 'Study Mode', icon: <BookOpen size={12} />, color: 'var(--accent-cyan)' },
    test: { label: 'Assessment', icon: <FileText size={12} />, color: 'var(--accent-purple)' },
    research: { label: 'Research', icon: <Search size={12} />, color: 'var(--accent-emerald)' },
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setCmdMenuOpen(false);
      handleAsk();
    }
    if (e.key === 'Escape') setCmdMenuOpen(false);
  };

  const studyCommands = [
    { cmd: '/help', desc: 'Show all commands' },
    { cmd: '/summary', desc: 'Summarize active document' },
    { cmd: '/files', desc: 'List uploaded files' },
    { cmd: '/reset', desc: 'Clear chat' },
  ];
  const testCommands = [
    { cmd: '/help', desc: 'Show all commands' },
    { cmd: '/start', desc: '/start [filename] — begin test' },
    { cmd: '/10', desc: 'Generate 10 MCQs' },
    { cmd: '/weak', desc: 'Target your weak topics' },
    { cmd: '/stats', desc: 'View performance report' },
    { cmd: '/study', desc: 'Switch to Study Mode' },
    { cmd: '/reset', desc: 'Clear chat' },
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
    setTimeout(() => handleAsk(), 0);
  };

  const active = modes[currentMode] || modes.study;

  const getModeStyles = () => {
    switch (currentMode) {
      case 'test':
        return {
          border: '1px solid rgba(168, 85, 247, 0.3)',
          shadow: '0 4px 20px rgba(168, 85, 247, 0.08)',
          accent: 'var(--accent-purple)',
          textColor: '#a855f7',
          placeholder: "Type / for assessment commands, e.g. /start physics.pdf",
        };
      case 'research':
        return {
          border: '1px solid rgba(16, 185, 129, 0.3)',
          shadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
          accent: 'var(--accent-emerald)',
          textColor: 'var(--accent-emerald)',
          placeholder: "Search queries in strict Research Mode...",
        };
      default:
        return {
          border: '1px solid rgba(6, 182, 212, 0.3)',
          shadow: '0 4px 20px rgba(6, 182, 212, 0.08)',
          accent: 'var(--accent-cyan)',
          textColor: 'var(--accent-cyan)',
          placeholder: "Ask anything... or type / for commands",
        };
    }
  };
  const modeStyle = getModeStyles();

  return (
    <div style={{ width: '100%', padding: '8px 16px 20px' }}>
      <div className="glass-input" style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        padding: 8, boxShadow: `var(--shadow-lg), ${modeStyle.shadow}`,
        border: modeStyle.border,
        transition: 'all 0.5s ease-in-out',
      }}>

        {/* Command Suggestion Menu */}
        {cmdMenuOpen && filteredCmds.length > 0 && (
          <div className="animate-fade-in-down" style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            marginBottom: 10, marginLeft: 8, marginRight: 8,
            background: 'var(--bg-glass)', backdropFilter: 'blur(24px) saturate(1.5)',
            border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)',
            padding: 6, boxShadow: 'var(--shadow-lg)', zIndex: 50,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderBottom: '1px solid var(--border-glass)', marginBottom: 4,
            }}>
              {currentMode === 'test' ? <FileText size={11} style={{ color: 'var(--text-muted)' }} /> : <BookOpen size={11} style={{ color: 'var(--text-muted)' }} />}
              <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {currentMode === 'test' ? 'Assessment Commands' : 'Study Commands'}
              </span>
            </div>
            {filteredCmds.map((c) => (
              <div key={c.cmd} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); selectCommand(c.cmd); }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    transition: 'all var(--transition-fast)', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 700, fontSize: 12, color: active.color }}>{c.cmd}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>{c.desc}</span>
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); executeCommand(c.cmd); }}
                  title="Run this command"
                  style={{
                    opacity: 0, marginRight: 4, padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    color: 'var(--text-muted)', fontWeight: 700, fontSize: 9, textTransform: 'uppercase',
                    transition: 'opacity var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  <CornerDownLeft size={10} /> Run
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
          {/* Upload Button */}
          <label
            title="Upload a PDF"
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, cursor: uploading ? 'not-allowed' : 'pointer',
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              color: uploading ? 'var(--text-faint)' : 'var(--text-secondary)',
              transition: 'all var(--transition-base)',
              ...(uploading ? {} : {}),
            }}
            onMouseEnter={e => {
              if (!uploading) {
                e.currentTarget.style.color = 'var(--accent-cyan)';
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow-cyan)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = uploading ? 'var(--text-faint)' : 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-glass)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {uploading ? (
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)',
                animation: 'spinSlow 0.8s linear infinite',
              }} />
            ) : (
              <Paperclip size={18} />
            )}
            <input
              type="file" style={{ display: 'none' }} accept=".pdf" disabled={uploading}
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
            placeholder={modeStyle.placeholder}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)',
              resize: 'none', maxHeight: 128, padding: '10px 4px',
              fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
            }}
            className="no-scrollbar"
            rows="1"
            disabled={loading}
          />

          {/* Send Button */}
          <button
            onClick={() => { setCmdMenuOpen(false); handleAsk(); }}
            disabled={loading || !question.trim()}
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: 'none', cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              background: loading || !question.trim() ? 'var(--bg-card)' : modeStyle.accent,
              color: loading || !question.trim() ? 'var(--text-faint)' : '#000',
              transition: 'all var(--transition-base)',
              boxShadow: loading || !question.trim() ? 'none' : `0 4px 12px ${modeStyle.textColor}4D`,
            }}
            onMouseEnter={e => {
              if (!loading && question.trim()) {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${modeStyle.textColor}66`;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              if (!loading && question.trim()) {
                e.currentTarget.style.boxShadow = `0 4px 12px ${modeStyle.textColor}4D`;
              }
            }}
          >
            {loading ? (
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff',
                animation: 'spinSlow 0.8s linear infinite',
              }} />
            ) : (
              <ArrowUp size={20} strokeWidth={3} />
            )}
          </button>
        </div>
      </div>

      <p style={{
        textAlign: 'center', fontSize: 9, color: 'var(--text-faint)',
        marginTop: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em',
      }}>
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
};

export default ChatInput;