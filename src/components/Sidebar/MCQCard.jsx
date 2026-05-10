import React, { useState } from 'react';

const MCQCard = ({ quizData, onScoreUpdate, onCitationClick }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'wrong'

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
      // Pass source (citation/filename) so analytics knows which document
      onScoreUpdate(
        quizData.topic || 'General',
        isCorrect,
        quizData.citation || quizData.source || 'Unknown Source'
      );
    }
  };

  const handleCitationClick = () => {
    const ctx = {
      citation: quizData.citation,
      topic: quizData.topic,
      question: quizData.question,
    };
    console.log('[Citation Context]', ctx);
    if (onCitationClick) onCitationClick(ctx);
  };

  // Difficulty badge color
  const difficultyColor = {
    Easy: 'text-green-400 border-green-900/50 bg-green-500/10',
    Medium: 'text-cyan-400 border-cyan-900/50 bg-cyan-500/10',
    Hard: 'text-red-400 border-red-900/50 bg-red-500/10',
  }[quizData.difficulty] || 'text-slate-400 border-slate-700/50';

  return (
    <div className={`rounded-2xl border p-5 mb-4 transition-all duration-300 ${
      isSubmitted
        ? result === 'correct'
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-red-500/5 border-red-500/20'
        : 'bg-slate-800/30 border-slate-700/50'
    }`}>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-4 gap-4">
        <h4 className="text-[14px] font-bold text-slate-200 leading-snug">{quizData.question}</h4>
        {quizData.difficulty && (
          <span className={`text-[9px] px-2 py-1 rounded font-bold tracking-widest uppercase border whitespace-nowrap ${difficultyColor}`}>
            {quizData.difficulty}
          </span>
        )}
      </div>

      {/* ── Options ── */}
      <div className="space-y-2 mb-4">
        {quizData.options.map((option, idx) => {
          let optionClass = "border-slate-700/50 hover:bg-slate-700/30 text-slate-300";

          if (isSubmitted) {
            if (option === correctAnswer) {
              optionClass = "bg-green-500/20 border-green-500/50 text-green-400 font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)]";
            } else if (option === selectedOption && option !== correctAnswer) {
              optionClass = "bg-red-500/20 border-red-500/50 text-red-400 line-through opacity-70";
            } else {
              optionClass = "border-slate-800 text-slate-500 opacity-30";
            }
          } else if (selectedOption === option) {
            optionClass = "bg-cyan-500/20 border-cyan-500/50 text-cyan-300";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={isSubmitted}
              className={`w-full text-left px-4 py-3 rounded-xl border text-[13px] transition-all ${optionClass}`}
            >
              <span className="mr-2 text-slate-500 text-[11px] font-bold">
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* ── Submit / Result ── */}
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-cyan-500"
        >
          Check Answer
        </button>
      ) : (
        <div className="animate-fade-in space-y-3">
          {/* Result badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider ${
            result === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <span>{result === 'correct' ? '✓ Correct!' : '✗ Wrong!'}</span>
            {result === 'wrong' && (
              <span className="text-slate-400 font-normal normal-case tracking-normal">
                Correct: <strong className="text-green-400">{correctAnswer}</strong>
              </span>
            )}
          </div>

          {/* Explanation */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-[12px] text-slate-300 leading-relaxed italic">
              <span className="font-bold text-cyan-500 not-italic mr-2">Explanation:</span>
              {quizData.explanation || "No further explanation provided."}
            </p>

            {/* Citation — clickable */}
            {quizData.citation && (
              <button
                onClick={handleCitationClick}
                className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors group"
              >
                <span className="text-[11px]">📍</span>
                <span className="font-bold uppercase tracking-widest group-hover:underline">
                  {quizData.citation}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQCard;