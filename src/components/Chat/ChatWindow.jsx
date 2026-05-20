import React, { useRef, useEffect } from "react";
import { MapPin, Link as LinkIcon } from "lucide-react";
import MCQCard from "../Sidebar/MCQCard";

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
      className="flex-1 overflow-y-auto px-6 md:px-20 pt-10 no-scrollbar bg-[#0B0F1A]"
    >
      {/* ── CHAT MESSAGES ── */}
      {/* In test mode: only show test-session messages (hide study chat clutter).
          Study chat is visually present but MCQ interface dominates below. */}
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-6">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex flex-col ${chat.role === "user" ? "items-end" : "items-start"}`}
            style={{ animation: `fadeIn 0.2s ease ${index * 0.03}s both` }}
          >
            <div className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} w-full`}>
              <div
                className={`max-w-[85%] p-5 rounded-[24px] text-[14px] leading-relaxed ${
                  chat.role === "user"
                    ? "bg-cyan-600 text-white shadow-lg rounded-tr-none"
                    : "bg-slate-900/50 border border-slate-800 text-slate-300 rounded-tl-none"
                }`}
              >
                {/* Message Text — render ** as bold */}
                <div className="whitespace-pre-wrap">{renderMarkdown(chat.text)}</div>

                {/* Citations / Sources */}
                {chat.sources && chat.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 relative group w-fit">
                    <button
                      onClick={() => onCitationClick && onCitationClick(chat.sources[0])}
                      className="flex items-center gap-1.5 text-[10px] bg-black/30 px-3 py-1.5 rounded-lg text-cyan-500 font-bold uppercase tracking-widest hover:bg-cyan-500/10 transition-colors"
                    >
                      <LinkIcon size={12} />
                      <span>+{chat.sources.length}</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-max max-w-xs p-3 bg-[#0F172A] border border-slate-700/60 rounded-xl shadow-2xl z-50 text-[10px] text-slate-300 normal-case tracking-normal">
                      <p className="font-bold text-slate-500 mb-2 uppercase tracking-widest text-[8px]">References</p>
                      <ul className="space-y-1.5">
                        {chat.sources.map((src, i) => (
                          <li key={i} className="truncate">• {src}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INLINE MCQs */}
            {currentMode === 'test' && chat.flashcards && chat.flashcards.length > 0 && (
              <div className="w-full mt-4 max-w-2xl mx-auto space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    {chat.flashcards.length} Questions
                  </span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                {chat.flashcards.map((card, i) => (
                  <MCQCard
                    key={`${i}-${card.question?.substring(0, 20)}`}
                    quizData={card}
                    onScoreUpdate={onScoreUpdate}
                    onCitationClick={(ctx) => {
                      console.log('[PDF Citation Context]', ctx);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>



      {/* ── LOADING INDICATOR ── */}
      {loading && (
        <div className="w-full max-w-4xl mx-auto flex justify-start py-4">
          <div className="bg-slate-900/30 border border-slate-800/50 px-5 py-3 rounded-2xl flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {currentMode === 'test' ? 'Generating Questions...' : 'Brain Processing...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Minimal inline markdown renderer (bold only) ─────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-slate-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default ChatWindow;