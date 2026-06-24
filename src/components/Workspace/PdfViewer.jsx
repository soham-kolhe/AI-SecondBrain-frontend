import React, { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Maximize2, Minimize2, Search, BookOpen, Sparkles, Quote } from 'lucide-react';
import api from '../../api/axiosConfig';

const PdfViewer = ({ 
  fileName, 
  onClose, 
  isResizing, 
  onWidthToggle, 
  leftPanelWidth, 
  onQuoteText, 
  onAskAI 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'text'
  const [pdfText, setPdfText] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (!fileName) {
      setPdfText(null);
      setSelectedText('');
      return;
    }
    
    // Clear selection when file changes
    setSelectedText('');
    
    if (activeTab === 'text' && (!pdfText || pdfText.name !== fileName)) {
      setTextLoading(true);
      api.get(`/files/text/${encodeURIComponent(fileName)}`)
        .then(res => {
          setPdfText(res.data);
          setTextLoading(false);
        })
        .catch(err => {
          console.error("Failed to load PDF text:", err);
          setTextLoading(false);
        });
    }
  }, [fileName, activeTab]);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text, query) => {
    if (!query || !query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} style={{ background: 'var(--accent-cyan)', color: '#000', borderRadius: 2, padding: '0 2px' }}>
              {part}
            </mark>
          ) : part
        )}
      </span>
    );
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
    }
  };

  const handleContainerClick = (e) => {
    if (e.target.closest('.quote-action-btn')) return;
    
    const selection = window.getSelection();
    if (selection.toString().trim() === '') {
      setSelectedText('');
    }
  };

  if (!fileName) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <FileText size={24} style={{ color: 'var(--text-faint)' }} />
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
          No document selected
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>
          Click a file above to preview it
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }} className="animate-fade-in">
      {/* Header */}
      <div style={{
        padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)', flexShrink: 0, gap: 12,
      }}>
        {/* Left Side Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.2em', flexShrink: 0 }}>
            Viewer
          </span>
        </div>

        {/* Center: Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: 2,
          border: '1px solid var(--border-glass)',
        }}>
          {[
            { id: 'pdf', label: 'PDF Visual', icon: <FileText size={11} /> },
            { id: 'text', label: 'Text Reader', icon: <BookOpen size={11} /> }
          ].map(tab => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: isTabActive ? 'var(--bg-secondary)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: isTabActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Width Toggle Button */}
          <button
            onClick={onWidthToggle}
            style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            title={leftPanelWidth > 450 ? "Restores narrow panel" : "Expand to wide panel"}
          >
            {leftPanelWidth > 450 ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          
          <a
            href={`http://localhost:5000/files/view/${encodeURIComponent(fileName)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            title="Open in new tab"
          >
            <ExternalLink size={12} />
          </a>
          
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        
        {/* PDF visual view */}
        {activeTab === 'pdf' && (
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {isLoading && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-secondary)', zIndex: 2,
              }}>
                <div className="animate-shimmer" style={{ width: '60%', height: 8, borderRadius: 4 }} />
              </div>
            )}
            <iframe
              src={`http://localhost:5000/files/view/${encodeURIComponent(fileName)}`}
              onLoad={() => setIsLoading(false)}
              style={{
                width: '100%', height: '100%', border: 'none',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                pointerEvents: isResizing ? 'none' : 'auto',
              }}
              title="PDF Viewer"
            />
          </div>
        )}

        {/* Text reader view */}
        {activeTab === 'text' && (
          <div 
            onClick={handleContainerClick}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg-secondary)' }}
          >
            {/* Search input bar */}
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-glass)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}>
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Search size={12} style={{ position: 'absolute', left: 10, color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Search PDF text..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 10px 6px 28px',
                    fontSize: 12,
                    outline: 'none',
                    color: 'var(--text-primary)',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Selection Quote Banner */}
            {selectedText && (
              <div className="quote-action-btn animate-fade-in-up" style={{
                padding: '10px 14px',
                background: 'var(--bg-glass)',
                borderBottom: '1px solid var(--border-accent)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
                zIndex: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Selection Active
                  </span>
                  <button
                    onClick={() => setSelectedText('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}
                  >
                    Dismiss
                  </button>
                </div>
                <p style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  maxHeight: 48,
                  overflowY: 'auto',
                  paddingLeft: 8,
                  borderLeft: '2px solid var(--accent-cyan)',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  "{selectedText}"
                </p>
                <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-end' }}>
                  <button
                    onClick={() => {
                      onQuoteText?.(selectedText);
                      setSelectedText('');
                    }}
                    style={{
                      padding: '5px 10px', fontSize: 10, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: 'var(--accent-cyan-glow)', border: '1px solid var(--border-accent)',
                      color: 'var(--accent-cyan)', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Quote size={10} />
                    Quote in Chat
                  </button>
                  <button
                    onClick={() => {
                      onAskAI?.(selectedText);
                      setSelectedText('');
                    }}
                    style={{
                      padding: '5px 10px', fontSize: 10, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: 'var(--accent-purple-glow)', border: '1px solid var(--accent-purple)',
                      color: 'var(--accent-purple)', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Sparkles size={10} />
                    Ask AI
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable text container */}
            <div 
              onMouseUp={handleSelection}
              className="thin-scrollbar" 
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '16px 20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16,
                userSelect: 'text', 
              }}
            >
              {textLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
                  <div className="animate-shimmer" style={{ width: '80%', height: 12, borderRadius: 4 }} />
                  <div className="animate-shimmer" style={{ width: '95%', height: 12, borderRadius: 4 }} />
                  <div className="animate-shimmer" style={{ width: '60%', height: 12, borderRadius: 4 }} />
                  <div className="animate-shimmer" style={{ width: '85%', height: 12, borderRadius: 4 }} />
                </div>
              ) : pdfText && pdfText.pages && pdfText.pages.length > 0 ? (
                pdfText.pages.map((pageText, index) => (
                  <div 
                    key={index} 
                    className="glass-card"
                    style={{
                      padding: 20,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      background: 'var(--bg-glass)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-glass)',
                      paddingBottom: 6,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        PAGE {index + 1} OF {pdfText.pages.length}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13,
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {highlightText(pageText, searchQuery)}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 12 }}>
                  {pdfText ? "This PDF contains no extractable text content." : "Select a document to begin."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
