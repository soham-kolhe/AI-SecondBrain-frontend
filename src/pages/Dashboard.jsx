import React, { useState } from "react";
import { Brain } from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import FileChip from "../components/Navbar/FileChip";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";
import AuthModal from "../components/Navbar/AuthModal";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import api from "../api/axiosConfig";

const Dashboard = () => {
  const { user, isAuthModalOpen, setIsAuthModalOpen, isLoginView, setIsLoginView, logout, setUser } = useAuth();

  const {
    file, setFile,
    chatHistory, setChatHistory,
    summary, setSummary,
    flashcards, setFlashcards,
    uploadedFiles, setUploadedFiles,
    chatSessions,
    activeSessionId, setActiveSessionId,
    weakTopics, setWeakTopics,
    loading, setLoading,
    uploading, setUploading,
    saveCurrentSession,
    loadSession,
    startNewChat,
    renameSession,
    deleteSession,
    shareSession,
  } = useChat();

  const [question, setQuestion] = useState("");
  const [currentMode, setMode] = useState('study');
  const [toast, setToast] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [viewingPdfName, setViewingPdfName] = useState(null);

  const showToast = (type, message, duration = 3500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (newMode === 'test') setFlashcards([]);
  };

  const handleAsk = async (isLoadMore = false) => {
    const originalQ = question.trim();
    if (!originalQ && !isLoadMore) return;

    const isCommand = originalQ.startsWith('/');
    const parts = originalQ.split(' ');
    const cmd = isCommand ? parts[0].toLowerCase() : null;

    // ── GUARD: Assessment mode requires login ─────────────────────────────────
    if (currentMode === 'test' && !user) {
      setIsAuthModalOpen(true);
      showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
      setQuestion('');
      return;
    }

    // ── LOCAL commands (instant, no backend) ──────────────────────────────────
    if (isCommand) {
      const localStudy = { '/reset': true, '/clear': true, '/summary': true, '/help': true };
      const localTest  = { '/reset': true, '/clear': true, '/stats': true, '/help': true, '/study': true };
      const isLocal = currentMode === 'study' ? localStudy[cmd] : localTest[cmd];

      if (cmd === '/reset' || cmd === '/clear') {
        setChatHistory([]); setFlashcards([]); setActiveFile(null); setQuestion(''); return;
      }
      if (currentMode === 'study' && cmd === '/summary') {
        const msg = summary.length > 0
          ? "**Summary:**\n" + summary.map(p => `- ${p}`).join('\n')
          : "No summary yet. Upload a document first.";
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: msg }]);
        setQuestion(''); return;
      }
      if (currentMode === 'study' && cmd === '/help') {
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: "**Study Mode:**\n`/summary` `/files` `/reset`\n\nSwitch to Assessment Mode for `/start` `/10` `/weak` `/stats`." }]);
        setQuestion(''); return;
      }
      if (currentMode === 'test' && cmd === '/stats') {
        const msg = weakTopics.length > 0
          ? "**Your Stats:**\n" + weakTopics.map(t => `- **${t.topic}** — ${t.wrongCount}× missed (${t.source || 'unknown'})`).join('\n')
          : "No stats yet. Complete assessments first.";
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: msg }]);
        setQuestion(''); return;
      }
      if (currentMode === 'test' && cmd === '/study') {
        handleModeSwitch('study');
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: 'Switched to **Study Mode**.' }]);
        setQuestion(''); return;
      }
      if (currentMode === 'test' && cmd === '/help') {
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: "**Assessment Mode:**\n`/start [file]` `/10` `/weak` `/stats` `/study` `/reset`" }]);
        setQuestion(''); return;
      }
    }

    // ── BACKEND CALL ──────────────────────────────────────────────────────────
    const userMsg = { role: 'user', text: isLoadMore ? `📄 /10 — Load more questions` : originalQ };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      let finalQuestion = originalQ;
      if (isLoadMore) finalQuestion = `/10${activeFile ? ' ' + activeFile : ''}`;

      const res = await api.post("/ask", {
        question: finalQuestion,
        mode: currentMode,
        strictMode: currentMode === 'research',
        activeFile,
      });

      if (res.data.activeFile) setActiveFile(res.data.activeFile);

      const aiText = res.data.answer || res.data.message || "Done.";
      const newFlashcards = res.data.flashcards || [];
      const aiMsg = { role: 'ai', text: aiText, sources: res.data.sources || [], flashcards: newFlashcards };

      let updatedHistory;
      setChatHistory(prev => { updatedHistory = [...prev, aiMsg]; return updatedHistory; });

      if (newFlashcards.length > 0) {
        const merged = isLoadMore ? [...flashcards, ...newFlashcards] : newFlashcards;
        setFlashcards(merged);
        const newId = await saveCurrentSession(updatedHistory, summary, merged, activeSessionId);
        if (!activeSessionId && newId) setActiveSessionId(newId);
      } else {
        const newId = await saveCurrentSession(updatedHistory, summary, flashcards, activeSessionId);
        if (!activeSessionId && newId) setActiveSessionId(newId);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthModalOpen(true);
        showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
        setChatHistory(prev => prev.slice(0, -1));
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: '⚠️ Error: ' + (err.response?.data?.error || err.message) }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", selectedFile);
    try {
      const res = await api.post("/ingest", formData);
      setSummary(res.data.summary || []);

      // Add to session-scoped uploadedFiles
      if (res.data.file) {
        setUploadedFiles(prev => {
          const updated = [...prev, res.data.file];
          return updated;
        });
      }

      const summaryPoints = (res.data.summary || []).map(p => `- ${p}`).join('\n');
      const aiMsg = {
        role: 'ai',
        text: `✅ **${selectedFile.name}** added to this Brain.\n\n${summaryPoints}`,
        sources: [selectedFile.name],
      };

      let updatedHistory;
      let updatedFiles;
      setChatHistory(prev => { updatedHistory = [...prev, aiMsg]; return updatedHistory; });
      setUploadedFiles(prev => { updatedFiles = prev; return prev; });

      // Small delay so state flushes before saving
      setTimeout(async () => {
        setUploadedFiles(currentFiles => {
          saveCurrentSession(updatedHistory, res.data.summary, flashcards, activeSessionId, currentFiles);
          return currentFiles;
        });
      }, 100);

      setFile(null);
    } catch (err) {
      showToast('error', 'Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleScoreUpdate = async (topic, isCorrect, source) => {
    try {
      await api.post("/analytics/track-performance", { topic, isCorrect, source });
      const res = await api.get("/analytics/weak-topics").catch(() => null);
      if (res && res.data) setWeakTopics(res.data);
    } catch (err) { console.error("Score tracking failed", err); }
  };

  // ── Sidebar action handlers ──────────────────────────────────────────────
  const handleRename = async (id, newTitle) => {
    await renameSession(id, newTitle);
  };

  const handleDelete = async (id) => {
    await deleteSession(id);
    showToast('info', 'Session deleted.');
  };

  const handleShare = async (id) => {
    const ok = await shareSession(id);
    if (ok) showToast('success', 'Chat copied to clipboard!');
    else showToast('error', 'Share failed. Try again.');
  };

  const toastBg = {
    error: 'bg-red-500/20 border-red-500/40 text-red-300',
    info: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    success: 'bg-green-500/20 border-green-500/40 text-green-300',
  };

  const isEmpty = chatHistory.length === 0 && flashcards.length === 0;

  return (
    <div className="h-screen w-screen bg-[#0B0F1A] text-slate-200 flex overflow-hidden font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl border text-[12px] font-bold uppercase tracking-wider shadow-2xl backdrop-blur-sm ${toastBg[toast.type]}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar on the far left */}
      <Sidebar
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={loadSession}
        onNewChat={startNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
        onShare={handleShare}
        weakTopics={weakTopics}
        onRetryTopic={(topic) => { handleModeSwitch('test'); setQuestion(`/10 ${topic}`); }}
      />

      {/* Main Content Area */}
      <div className={`flex flex-col bg-[#0B0F1A] overflow-hidden relative transition-all ${viewingPdfName ? 'w-1/2 border-r border-slate-800/50' : 'flex-1'}`}>
        <Navbar user={user} onLoginClick={() => setIsAuthModalOpen(true)} onLogout={logout} />

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
            <div className="mb-8 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-cyan-400">
                <Brain size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-[0.2em] mb-3">
                How can I help you today?
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Upload a document or ask a question to start.
              </p>
            </div>
            
            <div className="w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <ChatInput
                question={question}
                setQuestion={setQuestion}
                handleAsk={() => handleAsk(false)}
                currentMode={currentMode}
                setMode={handleModeSwitch}
                loading={loading}
                user={user}
                uploading={uploading}
                onFileUpload={handleUpload}
                onAuthRequired={() => {
                  setIsAuthModalOpen(true);
                  showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Chat messages + MCQs */}
          <ChatWindow
            chatHistory={chatHistory}
            loading={loading}
            summary={summary}
            flashcards={flashcards}
            currentMode={currentMode}
            onLoadMore={() => handleAsk(true)}
            weakTopics={weakTopics}
            onRetryTopic={(topic) => { handleModeSwitch('test'); setQuestion(`/10 ${topic}`); }}
            onScoreUpdate={handleScoreUpdate}
            onCitationClick={(src) => setViewingPdfName(src)}
          />

          {/* ── File chips ABOVE the input bar (session-specific) ── */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 md:px-20 py-2 flex gap-2 flex-wrap overflow-x-auto no-scrollbar border-t border-slate-800/50">
              {uploadedFiles.map((f, i) => (
                <FileChip
                  key={f._id || i}
                  file={f}
                  onDelete={() => {
                    setUploadedFiles(prev => prev.filter((_, idx) => idx !== i));
                  }}
                />
              ))}
            </div>
          )}

            {/* Input bar */}
            <div className="w-full max-w-4xl mx-auto">
              <ChatInput
                question={question}
                setQuestion={setQuestion}
                handleAsk={() => handleAsk(false)}
                currentMode={currentMode}
                setMode={handleModeSwitch}
                loading={loading}
                user={user}
                uploading={uploading}
                onFileUpload={handleUpload}
                onAuthRequired={() => {
                  setIsAuthModalOpen(true);
                  showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
                }}
              />
            </div>
          </>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}
        setUser={setUser} isLoginView={isLoginView} setIsLoginView={setIsLoginView}
      />

      {/* Side-by-Side PDF Viewer */}
      {viewingPdfName && (
        <div className="w-1/2 flex flex-col bg-[#0F172A] relative animate-fade-in">
          <div className="p-3 border-b border-slate-800/50 flex justify-between items-center bg-[#0B0F1A]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">Document Viewer</span>
              <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{viewingPdfName}</span>
            </div>
            <button 
              onClick={() => setViewingPdfName(null)} 
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <iframe 
            src={`http://localhost:5000/files/view/${encodeURIComponent(viewingPdfName)}`} 
            className="flex-1 w-full border-0 bg-white" 
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
