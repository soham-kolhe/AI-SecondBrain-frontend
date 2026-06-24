import React from 'react';
import { FileText, Trash2, FolderOpen, Upload } from 'lucide-react';

const FileBrowser = ({
  files = [],
  activeFile,
  onFileSelect,
  onFileDelete,
  fileViewMode = 'all',
  onModeChange,
  hasActiveSession = false,
}) => {
  const isEmpty = files.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Documents
          </span>
        </div>
        {files.length > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)',
          }}>
            {files.length}
          </span>
        )}
      </div>

      {/* Tabs if there's an active session */}
      {hasActiveSession && (
        <div style={{
          display: 'flex',
          padding: '6px 8px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--border-glass)',
          gap: 4
        }}>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'chat', label: 'This Chat' }
          ].map(tab => {
            const isTabActive = fileViewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onModeChange?.(tab.id)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: isTabActive ? 'var(--bg-card)' : 'transparent',
                  border: isTabActive ? '1px solid var(--border-glass)' : '1px solid transparent',
                  cursor: 'pointer',
                  color: isTabActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* File List */}
      <div className="thin-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {isEmpty ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: 24, textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Upload size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
              No documents yet
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              Upload a PDF via the chat input
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {files.map((file, i) => {
              const isActive = activeFile === file.name;
              return (
                <div
                  key={file._id || i}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border-accent)' : 'transparent'}`,
                    cursor: 'pointer', transition: 'all var(--transition-base)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onClick={() => onFileSelect?.(file.name)}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-card)';
                      e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--accent-cyan-glow)' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all var(--transition-base)',
                  }}>
                    <FileText size={14} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      PDF Document
                    </p>
                  </div>
                  {onFileDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onFileDelete(file._id, file.name); }}
                      style={{
                        width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-faint)', opacity: 0,
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent'; }}
                      className="file-delete-btn"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        div:hover > .file-delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default FileBrowser;
