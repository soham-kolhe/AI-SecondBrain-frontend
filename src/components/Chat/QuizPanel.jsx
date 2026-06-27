import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Timer, Sparkles, AlertTriangle, ArrowRight, Play } from 'lucide-react';

const QuizPanel = ({ mcqs = [], onScoreUpdate, onCitationClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState([]); // Array of { isCorrect: boolean, selectedOption: string }
  const [seconds, setSeconds] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const timerRef = useRef(null);

  // Start timer
  useEffect(() => {
    if (!quizFinished) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [quizFinished]);

  if (!mcqs || mcqs.length === 0) return null;

  const currentMcq = mcqs[currentIndex];
  const totalQuestions = mcqs.length;
  const isCorrectAnswer = selectedOption === (currentMcq.correctAnswer || currentMcq.correct);

  const handleOptionClick = (option) => {
    if (!isSubmitted) setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    const correctVal = currentMcq.correctAnswer || currentMcq.correct;
    const isCorrect = selectedOption === correctVal;
    
    // Save result
    setResults(prev => [...prev, { isCorrect, selectedOption }]);

    // Update global score analytics (weak topics tracking)
    if (onScoreUpdate) {
      onScoreUpdate(
        currentMcq.topic || 'General',
        isCorrect,
        currentMcq.citation || currentMcq.source || 'Notes'
      );
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // --- Scorecard Render ---
  if (quizFinished) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const weakTopics = [...new Set(
      mcqs
        .filter((_, idx) => !results[idx]?.isCorrect)
        .map(q => q.topic || 'General')
    )];

    return (
      <div className="glass-card animate-fade-in-up" style={{
        padding: 32, borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 450, margin: '16px auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
        backdropFilter: 'blur(20px) saturate(1.5)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: percentage >= 70 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `2px solid ${percentage >= 70 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          color: percentage >= 70 ? '#4ade80' : '#f87171',
        }}>
          {percentage >= 70 ? <Sparkles size={32} /> : <AlertTriangle size={32} />}
        </div>

        <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
          {percentage >= 90 ? 'Quiz Mastered!' : percentage >= 70 ? 'Passed!' : 'Practice Needed'}
        </h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>
          Score: {correctCount} / {totalQuestions} Correct
        </p>

        {/* Circular accuracy SVG */}
        <div style={{ position: 'relative', width: 130, height: 130, marginBottom: 24 }}>
          <svg width="130" height="130" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-glass)" strokeWidth="6" />
            <circle cx="60" cy="60" r="50" fill="none"
              stroke={percentage >= 70 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 314} 314`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>{percentage}%</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Accuracy</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginBottom: 24,
          padding: 12, borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Time Taken</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
              <Timer size={14} color="var(--accent-cyan)" /> {formatTime(seconds)}
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Weak Topics</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: weakTopics.length > 0 ? '#f87171' : '#4ade80', display: 'block', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {weakTopics.length > 0 ? `${weakTopics.length} Identified` : 'None! Perfect'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setIsSubmitted(false);
              setResults([]);
              setSeconds(0);
              setQuizFinished(false);
            }}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)', fontSize: 10, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  // Difficulty colors
  const diffColors = {
    Easy: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#4ade80' },
    Medium: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', text: '#22d3ee' },
    Hard: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
  };
  const diff = diffColors[currentMcq.difficulty] || diffColors.Medium;

  // Option styling helper
  const getOptionStyle = (option, idx) => {
    let optBg = 'transparent';
    let optBorder = 'var(--border-glass)';
    let optColor = 'var(--text-secondary)';
    let optOpacity = 1;
    let optShadow = 'none';

    const correctVal = currentMcq.correctAnswer || currentMcq.correct;

    if (isSubmitted) {
      if (option === correctVal) {
        optBg = 'rgba(34,197,94,0.15)';
        optBorder = 'rgba(34,197,94,0.4)';
        optColor = '#4ade80';
        optShadow = 'var(--shadow-glow-green)';
      } else if (option === selectedOption && option !== correctVal) {
        optBg = 'rgba(239,68,68,0.15)';
        optBorder = 'rgba(239,68,68,0.4)';
        optColor = '#f87171';
        optShadow = 'var(--shadow-glow-red)';
      } else {
        optOpacity = 0.35;
      }
    } else if (selectedOption === option) {
      optBg = 'var(--accent-cyan-glow)';
      optBorder = 'rgba(6,182,212,0.4)';
      optColor = 'var(--accent-cyan)';
      optShadow = 'var(--shadow-glow-cyan)';
    }

    return {
      optBg, optBorder, optColor, optOpacity, optShadow
    };
  };

  return (
    <div className="glass-card animate-fade-in-up" style={{
      padding: 24, borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 450, margin: '16px auto',
      background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
      backdropFilter: 'blur(20px) saturate(1.5)',
    }}>
      {/* Quiz Progress & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Timer size={13} color="var(--accent-purple)" /> {formatTime(seconds)}
        </span>
      </div>

      <div style={{ height: 3, borderRadius: 2, background: 'var(--border-glass)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
          width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Topic and Difficulty */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {currentMcq.topic || 'General Topic'}
        </span>
        {currentMcq.difficulty && (
          <span style={{
            fontSize: 8, padding: '3px 8px', borderRadius: 'var(--radius-sm)',
            fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
            background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text,
          }}>
            {currentMcq.difficulty}
          </span>
        )}
      </div>

      {/* Question Text */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
        {currentMcq.question}
      </h3>

      {/* Options Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {currentMcq.options.map((option, idx) => {
          const styles = getOptionStyle(option, idx);
          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={isSubmitted}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: styles.optBg, border: `1px solid ${styles.optBorder}`,
                color: styles.optColor, fontSize: 13, cursor: isSubmitted ? 'default' : 'pointer',
                opacity: styles.optOpacity, boxShadow: styles.optShadow,
                transition: 'all var(--transition-base)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={e => {
                if (!isSubmitted && selectedOption !== option) {
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSubmitted && selectedOption !== option) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, flexShrink: 0,
                background: selectedOption === option && !isSubmitted ? 'var(--accent-cyan)' : 'var(--bg-card)',
                color: selectedOption === option && !isSubmitted ? '#000' : 'var(--text-muted)',
                border: `1px solid ${selectedOption === option && !isSubmitted ? 'transparent' : 'var(--border-glass)'}`,
                transition: 'all var(--transition-base)',
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      {!isSubmitted ? (
        <button
          onClick={handleCheckAnswer}
          disabled={!selectedOption}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 'var(--radius-lg)',
            background: selectedOption ? 'var(--accent-cyan)' : 'var(--bg-card)',
            color: selectedOption ? '#000' : 'var(--text-muted)',
            border: `1px solid ${selectedOption ? 'transparent' : 'var(--border-glass)'}`,
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
            cursor: selectedOption ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
          onMouseEnter={e => { if (selectedOption) e.currentTarget.style.transform = 'scale(1.01)'; }}
          onMouseLeave={e => { if (selectedOption) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <span>Check Answer</span>
          <Play size={10} fill="currentColor" />
        </button>
      ) : (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Answer validation header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
            background: isCorrectAnswer ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: isCorrectAnswer ? '#4ade80' : '#f87171',
          }}>
            {isCorrectAnswer ? <Check size={16} /> : <X size={16} />}
            <span>{isCorrectAnswer ? 'Correct!' : 'Incorrect'}</span>
            {!isCorrectAnswer && (
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                — Correct: <strong style={{ color: '#4ade80' }}>{currentMcq.correctAnswer || currentMcq.correct}</strong>
              </span>
            )}
          </div>

          {/* Explanation & Citations */}
          <div className="glass-card" style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(20,20,28,0.3)', border: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontStyle: 'normal', marginRight: 6 }}>Explanation:</span>
              {currentMcq.explanation || "No further explanation provided."}
            </p>
            {currentMcq.citation && (
              <button
                onClick={() => onCitationClick?.(currentMcq.citation)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
                  fontSize: 10, color: 'var(--text-muted)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <span>Reference Document: {currentMcq.citation}</span>
              </button>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-purple)', color: '#fff',
              border: 'none', fontSize: 10, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
              transition: 'all var(--transition-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>{currentIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPanel;
