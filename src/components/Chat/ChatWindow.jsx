import React, { useRef, useEffect } from "react";
import { Link as LinkIcon } from "lucide-react";
import MCQCard from "../Sidebar/MCQCard";
import FlashcardStack from "./FlashcardStack";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import QuizPanel from "./QuizPanel";

const markdownComponents = {
  p: ({ children }) => <p style={{ marginBottom: 8, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{children}</p>,
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      style={{ 
        color: 'var(--accent-cyan)', 
        fontWeight: 700, 
        textDecoration: 'underline',
        transition: 'color var(--transition-fast)'
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--border-accent)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{children}</strong>,
  ul: ({ children }) => <ul style={{ listStyle: 'disc', paddingLeft: 20, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-secondary)' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ listStyle: 'decimal', paddingLeft: 20, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-secondary)' }}>{children}</ol>,
  li: ({ children }) => <li style={{ paddingLeft: 4 }}>{children}</li>,
  h1: ({ children }) => <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border-glass)' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 12, marginBottom: 6 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 10, marginBottom: 4 }}>{children}</h3>,
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !className && !String(children).includes('\n');
    if (isInline) {
      return (
        <code style={{
          background: 'var(--bg-tertiary)', color: 'var(--accent-cyan)',
          padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12,
          border: '1px solid var(--border-glass)',
        }} {...props}>
          {children}
        </code>
      );
    }
    return (
      <div style={{
        margin: '12px 0', overflow: 'hidden', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)',
        fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-secondary)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', borderBottom: '1px solid var(--border-glass)',
          background: 'var(--bg-tertiary)', fontSize: 9, fontWeight: 800,
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em',
        }}>
          <span>{match ? match[1] : 'code'}</span>
          <button
            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 9, fontWeight: 900, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.15em',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--accent-cyan)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            Copy
          </button>
        </div>
        <pre style={{ padding: 16, overflowX: 'auto', whiteSpace: 'pre', margin: 0 }}>
          <code className={className} {...props}>{children}</code>
        </pre>
      </div>
    );
  }
};

const ChatWindow = ({
  chatHistory,
  loading,
  flashcards,
  currentMode,
  onLoadMore,
  weakTopics,
  onRetryTopic,
  onScoreUpdate,
  onCitationClick
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, flashcards, loading]);

  return (
    <div
      ref={scrollRef}
      className="thin-scrollbar"
      style={{
        flex: 1, overflowY: 'auto', paddingTop: 32,
        background: 'transparent', scrollBehavior: 'smooth',
      }}
    >
      {/* Chat Messages */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${index * 0.03}s`,
              display: 'flex', flexDirection: 'column',
              alignItems: chat.role === "user" ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{ display: 'flex', justifyContent: chat.role === "user" ? 'flex-end' : 'flex-start', width: '100%' }}>
              <div style={{
                maxWidth: '85%', padding: '16px 20px',
                fontSize: 14, lineHeight: 1.7,
                borderRadius: chat.role === "user"
                  ? 'var(--radius-xl) var(--radius-xl) 4px var(--radius-xl)'
                  : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) 4px',
                ...(chat.role === "user"
                  ? {
                      background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(6,182,212,0.2)',
                    }
                  : {
                      background: 'var(--bg-glass)',
                      backdropFilter: 'blur(16px) saturate(1.4)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)',
                      borderLeft: '3px solid var(--accent-cyan)',
                    }
                ),
              }}>
                {chat.role === "user" ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{chat.text}</div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                      {chat.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Citations */}
                {chat.sources && chat.sources.length > 0 && (
                  <div style={{
                    marginTop: 14, paddingTop: 14,
                    borderTop: '1px solid var(--border-glass)',
                    position: 'relative',
                  }}>
                    <button
                      onClick={() => onCitationClick && onCitationClick(chat.sources[0])}
                      title={chat.sources.map(src => {
                        if (src.startsWith('http')) {
                          try {
                            const urlObj = new URL(src);
                            // Extract title if we can or just show domain/clean string
                            return `YouTube Link: ${src}`;
                          } catch (e) {
                            return `YouTube Link: ${src}`;
                          }
                        }
                        return src;
                      }).join('\n')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 10, padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                        color: 'var(--accent-cyan)', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.15em',
                        cursor: 'pointer', transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--accent-cyan-glow)';
                        e.currentTarget.style.borderColor = 'var(--border-accent)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--bg-card)';
                        e.currentTarget.style.borderColor = 'var(--border-glass)';
                      }}
                    >
                      <LinkIcon size={12} />
                      <span>+{chat.sources.length}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inline MCQs — rendered for both modes when flashcards present */}
            {chat.flashcards && chat.flashcards.length > 0 && (
              <div style={{ width: '100%', marginTop: 16 }}>
                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ height: 1, flex: 1, background: 'var(--border-glass)' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                    {chat.flashcards.length} Questions
                  </span>
                  <div style={{ height: 1, flex: 1, background: 'var(--border-glass)' }} />
                </div>

                {/* In test mode: show QuizPanel */}
                {currentMode === 'test' ? (
                  <QuizPanel
                    mcqs={chat.flashcards}
                    onScoreUpdate={onScoreUpdate}
                    onCitationClick={(cit) => onCitationClick && onCitationClick(cit)}
                  />
                ) : (
                  /* Otherwise show inline MCQ cards */
                  chat.flashcards.map((card, i) => (
                    <MCQCard
                      key={`${i}-${card.question?.substring(0, 20)}`}
                      quizData={card}
                      onScoreUpdate={onScoreUpdate}
                      questionNumber={i + 1}
                      totalQuestions={chat.flashcards.length}
                      onCitationClick={(ctx) => onCitationClick && onCitationClick(ctx.citation)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 24px' }}>
          <div className="glass-card animate-fade-in" style={{
            padding: '14px 20px', borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', gap: 12,
            borderLeft: '3px solid var(--accent-cyan)',
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  animation: `bounceSubtle 1s ease ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.2em',
            }}>
              {currentMode === 'test' ? 'Generating Questions...' : 'Brain Processing...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;