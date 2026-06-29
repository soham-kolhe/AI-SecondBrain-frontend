import React, { useState, useRef, useCallback } from 'react';
import { Check, X, RotateCcw, Sparkles, MapPin, ChevronRight } from 'lucide-react';

const FlashcardStack = ({ flashcards = [], onScoreUpdate, onComplete, onCitationClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState([]); // { correct: bool }[]
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  const SWIPE_THRESHOLD = 100;
  const currentCard = flashcards[currentIndex];
  const isComplete = currentIndex >= flashcards.length;
  const correctCount = results.filter(r => r.correct).length;

  const handleSwipe = useCallback((direction) => {
    const isCorrect = direction === 'right';
    setSwipeDirection(direction);
    setResults(prev => [...prev, { correct: isCorrect }]);

    if (onScoreUpdate && currentCard) {
      onScoreUpdate(
        currentCard.topic || 'General',
        isCorrect,
        currentCard.citation || currentCard.source || 'Unknown',
        currentCard._id
      );
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setFlipped(false);
      setDragOffset({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    }, 400);
  }, [currentCard, onScoreUpdate]);

  // Mouse/Touch drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - startPos.current.x,
      y: (clientY - startPos.current.y) * 0.3,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset.x) > SWIPE_THRESHOLD) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Difficulty badge colors
  const diffBadge = {
    Easy: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: '#4ade80' },
    Medium: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#22d3ee' },
    Hard: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },
  };

  // ── Complete State ──
  if (isComplete) {
    const score = flashcards.length > 0 ? Math.round((correctCount / flashcards.length) * 100) : 0;
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 animate-fade-in-up">
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: score >= 70 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `2px solid ${score >= 70 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          {score >= 70 ? (
            <Sparkles size={36} color="#4ade80" />
          ) : (
            <RotateCcw size={36} color="#f87171" />
          )}
        </div>

        <h3 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
          {score >= 90 ? 'Outstanding!' : score >= 70 ? 'Great job!' : score >= 50 ? 'Keep practicing!' : 'Study more!'}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>
          {correctCount} / {flashcards.length} correct
        </p>

        {/* Score ring */}
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-glass)" strokeWidth="6" />
            <circle cx="60" cy="60" r="52" fill="none"
              stroke={score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 327} 327`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>{score}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setFlipped(false);
              setResults([]);
              setSwipeDirection(null);
            }}
            style={{
              padding: '12px 32px', borderRadius: 'var(--radius-xl)',
              background: 'var(--accent-cyan)', color: '#000',
              fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.15em', border: 'none', cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Try Again
          </button>
          {onComplete && (
            <button
              onClick={onComplete}
              style={{
                padding: '12px 32px', borderRadius: 'var(--radius-xl)',
                background: 'transparent', border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.15em', cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--text-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const rotation = dragOffset.x * 0.08;
  const glowColor = dragOffset.x > 30 ? 'rgba(34,197,94,0.3)' : dragOffset.x < -30 ? 'rgba(239,68,68,0.3)' : 'transparent';
  const diff = diffBadge[currentCard.difficulty] || diffBadge.Medium;

  return (
    <div className="w-full flex flex-col items-center py-6 select-none">
      {/* ── Progress Bar ── */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 20, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {correctCount} correct
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--border-glass)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
            width: `${((currentIndex) / flashcards.length) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* ── Card Stack ── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: 320, margin: '0 auto' }}>
        {/* Background cards for depth effect */}
        {flashcards[currentIndex + 2] && (
          <div style={{
            position: 'absolute', inset: '16px 16px 0', borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
            transform: 'scale(0.92)', opacity: 0.3,
          }} />
        )}
        {flashcards[currentIndex + 1] && (
          <div style={{
            position: 'absolute', inset: '8px 8px 0', borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
            transform: 'scale(0.96)', opacity: 0.5,
          }} />
        )}

        {/* ── Active Card ── */}
        <div
          ref={cardRef}
          className="flashcard-container"
          style={{
            position: 'absolute', inset: 0, cursor: 'grab',
            transform: swipeDirection === 'right'
              ? 'translateX(150%) rotate(25deg)' 
              : swipeDirection === 'left'
              ? 'translateX(-150%) rotate(-25deg)'
              : `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
            opacity: swipeDirection ? 0 : 1,
            transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 40px ${glowColor}`,
            borderRadius: 'var(--radius-xl)',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => { if (isDragging) handleDragEnd(); }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onClick={(e) => {
            if (Math.abs(dragOffset.x) < 5) setFlipped(!flipped);
          }}
        >
          <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%' }}>
            {/* ── FRONT ── */}
            <div className="flashcard-front" style={{
              background: 'var(--bg-glass)', backdropFilter: 'blur(20px) saturate(1.5)',
              border: '1px solid var(--border-glass)', padding: 28,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              overflow: 'hidden',
            }}>
              {/* Swipe labels */}
              {dragOffset.x > 30 && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  padding: '6px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.5)',
                  fontSize: 14, fontWeight: 900, color: '#4ade80',
                  transform: 'rotate(12deg)', textTransform: 'uppercase',
                }}>CORRECT ✓</div>
              )}
              {dragOffset.x < -30 && (
                <div style={{
                  position: 'absolute', top: 20, left: 20,
                  padding: '6px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(239,68,68,0.2)', border: '2px solid rgba(239,68,68,0.5)',
                  fontSize: 14, fontWeight: 900, color: '#f87171',
                  transform: 'rotate(-12deg)', textTransform: 'uppercase',
                }}>WRONG ✗</div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  {currentCard.topic && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                      {currentCard.topic}
                    </span>
                  )}
                  {currentCard.difficulty && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                      background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text,
                      textTransform: 'uppercase', letterSpacing: '0.15em',
                    }}>
                      {currentCard.difficulty}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {currentCard.question}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                <span>Tap to flip</span>
                <ChevronRight size={12} />
              </div>
            </div>

            {/* ── BACK ── */}
            <div className="flashcard-back" style={{
              background: 'var(--bg-glass)', backdropFilter: 'blur(20px) saturate(1.5)',
              border: '1px solid var(--border-accent)', padding: 28,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              overflow: 'auto',
            }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: 12 }}>
                  Answer
                </span>
                {currentCard.correctAnswer && (
                  <div style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                    fontSize: 15, fontWeight: 700, color: '#4ade80', marginBottom: 16,
                  }}>
                    {currentCard.correctAnswer}
                  </div>
                )}
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontStyle: 'normal', marginRight: 6 }}>Explanation:</span>
                  {currentCard.explanation || "No explanation provided."}
                </p>
              </div>

              {currentCard.citation && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCitationClick?.(currentCard.citation); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
                    fontSize: 10, color: 'var(--text-muted)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.15em',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  <MapPin size={11} /> {currentCard.citation}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 32 }}>
        <button
          onClick={() => handleSwipe('left')}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
          title="Incorrect"
        >
          <X size={24} color="#f87171" />
        </button>

        <button
          onClick={() => setFlipped(!flipped)}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all var(--transition-base)',
            fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.transform = 'scale(1)'; }}
          title="Flip card"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={() => handleSwipe('right')}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
          title="Correct"
        >
          <Check size={24} color="#4ade80" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardStack;
