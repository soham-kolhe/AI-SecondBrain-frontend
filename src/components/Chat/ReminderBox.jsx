import React from 'react';

const ReminderBox = ({ weakTopics, onRetry, onDismiss, isAuth }) => {
  // Only render when authenticated, topics exist, and not dismissed
  if (!isAuth || !weakTopics || weakTopics.length === 0) return null;

  return (
    <div className="mx-4 md:mx-[4%] mb-6 p-5 bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/25 rounded-[28px] relative overflow-hidden">
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-slate-700 transition-all text-[12px]"
        title="Dismiss for this session"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pr-8">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
          <span className="text-base">🧠</span>
        </div>
        <div>
          <h3 className="text-red-400 text-[11px] font-black uppercase tracking-[0.2em]">
            Revision Needed
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Topics you struggled with recently
          </p>
        </div>
      </div>

      {/* Topic chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {weakTopics.slice(0, 4).map((topic, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-2xl border border-slate-800/60 gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-200 truncate">
                {topic.topic || topic.name}
              </p>
              {topic.source && (
                <p className="text-[9px] text-slate-500 mt-0.5 truncate">
                  📍 {topic.source} · {topic.wrongCount}× missed
                </p>
              )}
            </div>
            <button
              onClick={() => onRetry(topic.topic || topic.name)}
              className="shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[9px] font-black py-1.5 px-3 rounded-xl transition-all uppercase tracking-widest border border-red-500/20"
            >
              Retry
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderBox;