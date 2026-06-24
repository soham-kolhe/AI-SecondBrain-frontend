import React, { useState } from 'react';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';

const MCQCard = ({ quizData, onScoreUpdate, onCitationClick, questionNumber, totalQuestions }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  if (!quizData || !quizData.options) return null;

  const correctAnswer = quizData.correctAnswer || quizData.correct;

  const handleOptionClick = (option) => {
    if (!isSubmitted) setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === correctAnswer;
    setResult(isCorrect ? 'correct' : 'wrong');
    if (onScoreUpdate) {
      onScoreUpdate(
        quizData.topic || 'General',
        isCorrect,
        quizData.citation || quizData.source || 'Unknown Source'
      );
    }
  };

  const handleCitationClick = () => {
    const ctx = { citation: quizData.citation, topic: quizData.topic, question: quizData.question };
    if (onCitationClick) onCitationClick(ctx);
  };

  const diffColors = {
    Easy: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#4ade80' },
    Medium: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', text: '#22d3ee' },
    Hard: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
  };

  const diff = diffColors[quizData.difficulty] || diffColors.Medium;

  const cardBorder = isSubmitted
    ? result === 'correct'
      ? 'rgba(34,197,94,0.25)'
      : 'rgba(239,68,68,0.25)'
    : 'var(--border-glass)';

  const cardBg = isSubmitted
    ? result === 'correct'
      ? 'rgba(34,197,94,0.05)'
      : 'rgba(239,68,68,0.05)'
    : 'var(--bg-card)';

  return (
    <div
      className={`glass-card ${isSubmitted && result === 'wrong' ? 'animate-shake' : 'animate-fade-in-up'}`}
      style={{
        padding: 22, marginBottom: 16,
        background: cardBg, borderColor: cardBorder,
        backdropFilter: 'blur(16px) saturate(1.4)',
        transition: 'all var(--transition-base)',
      }}
    >
      {/* Progress indicator */}
      {questionNumber && totalQuestions && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Question {questionNumber} / {totalQuestions}
            </span>
          </div>
          <div style={{ height: 2, borderRadius: 1, background: 'var(--border-glass)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 1,
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
              width: `${(questionNumber / totalQuestions) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
          {quizData.question}
        </h4>
        {quizData.difficulty && (
          <span style={{
            fontSize: 9, padding: '3px 10px', borderRadius: 'var(--radius-sm)',
            fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
            background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {quizData.difficulty}
          </span>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {quizData.options.map((option, idx) => {
          let optBg = 'transparent';
          let optBorder = 'var(--border-glass)';
          let optColor = 'var(--text-secondary)';
          let optOpacity = 1;
          let optShadow = 'none';

          if (isSubmitted) {
            if (option === correctAnswer) {
              optBg = 'rgba(34,197,94,0.15)';
              optBorder = 'rgba(34,197,94,0.4)';
              optColor = '#4ade80';
              optShadow = 'var(--shadow-glow-green)';
            } else if (option === selectedOption && option !== correctAnswer) {
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

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={isSubmitted}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: optBg, border: `1px solid ${optBorder}`,
                color: optColor, fontSize: 13, cursor: isSubmitted ? 'default' : 'pointer',
                opacity: optOpacity, boxShadow: optShadow,
                transition: 'all var(--transition-base)',
                display: 'flex', alignItems: 'center', gap: 8,
                textDecoration: isSubmitted && option === selectedOption && option !== correctAnswer ? 'line-through' : 'none',
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
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Submit / Result */}
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 'var(--radius-lg)',
            background: selectedOption ? 'var(--accent-cyan)' : 'var(--bg-card)',
            color: selectedOption ? '#000' : 'var(--text-muted)',
            border: `1px solid ${selectedOption ? 'transparent' : 'var(--border-glass)'}`,
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
            cursor: selectedOption ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => { if (selectedOption) e.currentTarget.style.transform = 'scale(1.01)'; }}
          onMouseLeave={e => { if (selectedOption) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Check Answer
        </button>
      ) : (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Result badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
            background: result === 'correct' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: result === 'correct' ? '#4ade80' : '#f87171',
          }}>
            {result === 'correct' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{result === 'correct' ? 'Correct!' : 'Incorrect'}</span>
            {result === 'wrong' && (
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                — Correct: <strong style={{ color: '#4ade80' }}>{correctAnswer}</strong>
              </span>
            )}
          </div>

          {/* Explanation */}
          <div className="glass-card" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontStyle: 'normal', marginRight: 6 }}>
                Explanation:
              </span>
              {quizData.explanation || "No further explanation provided."}
            </p>

            {quizData.citation && (
              <button
                onClick={handleCitationClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
                  fontSize: 10, color: 'var(--text-muted)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <MapPin size={11} />
                <span style={{ textDecoration: 'none' }}>{quizData.citation}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQCard;