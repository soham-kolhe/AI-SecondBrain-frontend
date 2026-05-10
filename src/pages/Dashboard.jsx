import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import FileChip from "../components/Navbar/FileChip";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";
import AuthModal from "../components/Navbar/AuthModal";
import ReminderBox from "../components/Chat/ReminderBox";
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
    showReminder, dismissReminder,
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

  return (
    <div className="h-screen w-screen bg-[#0B0F1A] text-slate-200 flex flex-col overflow-hidden font-sans">
      <Navbar user={user} onLoginClick={() => setIsAuthModalOpen(true)} onLogout={logout} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl border text-[12px] font-bold uppercase tracking-wider shadow-2xl backdrop-blur-sm ${toastBg[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        <Sidebar
          chatSessions={chatSessions}
          activeSessionId={activeSessionId}
          onSelectSession={loadSession}
          onNewChat={startNewChat}
          onRename={handleRename}
          onDelete={handleDelete}
          onShare={handleShare}
        />

        <div className="flex-1 flex flex-col bg-[#0B0F1A] overflow-hidden">

          {/* Reminder box — shown only once per login, inside chat area at top */}
          {showReminder && (
            <ReminderBox
              weakTopics={weakTopics}
              onRetry={(topic) => { handleModeSwitch('test'); setQuestion(`/10 ${topic}`); }}
              onDismiss={dismissReminder}
              isAuth={!!user}
            />
          )}

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
      </main>

      <AuthModal
        isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}
        setUser={setUser} isLoginView={isLoginView} setIsLoginView={setIsLoginView}
      />
    </div>
  );
};

export default Dashboard;
