import React, { useState, useEffect } from "react";
import { Brain, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import FlashcardStack from "../components/Chat/FlashcardStack";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import FileBrowser from "../components/Workspace/FileBrowser";
import PdfViewer from "../components/Workspace/PdfViewer";
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
    allUserFiles, setAllUserFiles,
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
  const [dueReviews, setDueReviews] = useState([]);
  const [dueReviewsLoading, setDueReviewsLoading] = useState(false);
  const [initialDueCount, setInitialDueCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [viewingPdfName, setViewingPdfName] = useState(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true); // Closed by default
  const [leftPanelWidth, setLeftPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [fileViewMode, setFileViewMode] = useState('all'); // 'all' or 'chat'

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const panel = document.getElementById("left-workspace-panel");
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      let newWidth = e.clientX - rect.left;
      newWidth = Math.max(280, Math.min(newWidth, window.innerWidth * 0.75));
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleWidthToggle = () => {
    const wideWidth = Math.floor(window.innerWidth * 0.5);
    if (leftPanelWidth < wideWidth) {
      setLeftPanelWidth(wideWidth);
    } else {
      setLeftPanelWidth(380);
    }
  };

  const showToast = (type, message, duration = 3500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const fetchDueReviews = async () => {
    if (!user) return;
    setDueReviewsLoading(true);
    try {
      const res = await api.get("/analytics/due-reviews");
      setDueReviews(res.data || []);
      setInitialDueCount(res.data ? res.data.length : 0);
    } catch (err) {
      console.error("Error fetching due reviews", err);
      showToast("error", "Failed to fetch due reviews.");
    } finally {
      setDueReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (currentMode === 'review' && user) {
      fetchDueReviews();
    }
  }, [user, currentMode]);

  const handleModeSwitch = (newMode) => {
    if (newMode !== currentMode) {
      setMode(newMode);
      startNewChat();
      setLeftPanelCollapsed(true);
      setViewingPdfName(null);
      setFileViewMode('all');
      if (newMode === 'test') setFlashcards([]);
      if (newMode === 'review') {
        setDueReviews([]);
        setInitialDueCount(0);
        fetchDueReviews();
      }
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setLeftPanelCollapsed(true);
    setViewingPdfName(null);
    setFileViewMode('all');
  };

  const handleSelectSession = async (id) => {
    await loadSession(id);
    setFileViewMode('chat');
  };

  const handleToggleDocuments = () => {
    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false);
      setFileViewMode('all');
      setLeftPanelWidth(380); // Reset to default width when opened via Documents sidebar button
    } else {
      if (fileViewMode === 'chat') {
        setFileViewMode('all');
        setLeftPanelWidth(380); // Reset to default width
      } else {
        setLeftPanelCollapsed(true);
      }
    }
  };

  const handleFloatingToggle = () => {
    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false);
      if (viewingPdfName) {
        setLeftPanelWidth(Math.floor(window.innerWidth * 0.50));
      } else {
        setLeftPanelWidth(380);
      }
    } else {
      setLeftPanelCollapsed(true);
    }
  };

  const handleAsk = async (isLoadMore = false, overrideText = null) => {
    const rawQ = overrideText !== null ? overrideText : question;
    const originalQ = rawQ.trim();
    if (!originalQ && !isLoadMore) return;

    const isCommand = originalQ.startsWith('/');
    const parts = originalQ.split(' ');
    const cmd = isCommand ? parts[0].toLowerCase() : null;

    if (currentMode === 'test' && !user) {
      setIsAuthModalOpen(true);
      showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
      if (overrideText === null) setQuestion('');
      return;
    }

    // Local commands
    if (isCommand) {
      const localStudy = { '/reset': true, '/clear': true, '/help': true };
      const localTest = { '/reset': true, '/clear': true, '/stats': true, '/help': true, '/study': true };

      if (cmd === '/reset' || cmd === '/clear') {
        setChatHistory([]); setFlashcards([]); setActiveFile(null); if (overrideText === null) setQuestion(''); return;
      }
      if (currentMode === 'study' && cmd === '/help') {
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: "**Study Mode:**\n`/summary` `/files` `/reset`\n\nSwitch to Assessment Mode for `/start` `/10` `/weak` `/stats`." }]);
        if (overrideText === null) setQuestion(''); return;
      }
      if (currentMode === 'test' && cmd === '/stats') {
        const msg = weakTopics.length > 0
          ? "**Your Stats:**\n" + weakTopics.map(t => `- **${t.topic}** — ${t.wrongCount}× missed (${t.source || 'unknown'})`).join('\n')
          : "No stats yet. Complete assessments first.";
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: msg }]);
        if (overrideText === null) setQuestion(''); return;
      }
      if (currentMode === 'test' && cmd === '/study') {
        handleModeSwitch('study');
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: 'Switched to **Study Mode**.' }]);
        if (overrideText === null) setQuestion(''); return;
      }
      if (currentMode === 'test' && cmd === '/help') {
        setChatHistory(prev => [...prev, { role: 'user', text: originalQ }, { role: 'ai', text: "**Assessment Mode:**\n`/start [file]` `/10` `/weak` `/stats` `/study` `/reset`" }]);
        if (overrideText === null) setQuestion(''); return;
      }
    }

    // Backend call
    const userMsgText = isLoadMore ? `📄 /10 — Load more questions` : originalQ;
    const userMsg = { role: 'user', text: userMsgText };
    setChatHistory(prev => [...prev, userMsg]);
    if (overrideText === null) setQuestion('');
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
      const aiMsg = {
        role: 'ai',
        text: aiText,
        sources: res.data.sources || [],
        flashcards: newFlashcards,
        ytVideos: res.data.ytVideos || []
      };

      const nextHistory = [...chatHistory, userMsg, aiMsg];
      setChatHistory(nextHistory);

      if (newFlashcards.length > 0) {
        const merged = isLoadMore ? [...flashcards, ...newFlashcards] : newFlashcards;
        setFlashcards(merged);
        const newId = await saveCurrentSession(nextHistory, summary, merged, activeSessionId);
        if (!activeSessionId && newId) setActiveSessionId(newId);
      } else {
        const newId = await saveCurrentSession(nextHistory, summary, flashcards, activeSessionId);
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
      const newSummary = res.data.summary || [];
      setSummary(newSummary);

      let nextFiles = uploadedFiles;
      if (res.data.file) {
        nextFiles = [...uploadedFiles, res.data.file];
        setUploadedFiles(nextFiles);
        setAllUserFiles(prev => [...prev, res.data.file]);
      }

      const summaryPoints = newSummary.map(p => `- ${p}`).join('\n');
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
      const videos = res.data.ytVideos || [];
      
      let uploadSummaryText = `✅ **${selectedFile.name}** added to this Brain.\n\n${summaryPoints}`;
      let finalSources = [selectedFile.name];

      if (videos && videos.length > 0) {
        const links = videos.map(v => `- [${v.title}](${v.url})`).join("\n");
        uploadSummaryText += `\n\n📺 **Recommended YouTube Reference:**\n${links}`;
        finalSources = [...finalSources, ...videos.map(v => v.url)];
      } else {
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(baseName)}`;
        uploadSummaryText += `\n\n📺 **YouTube Reference:**\n- [Search YouTube for "${baseName}"](${ytUrl})`;
        finalSources = [...finalSources, ytUrl];
      }

      const aiMsg = {
        role: 'ai',
        text: uploadSummaryText,
        sources: finalSources,
      };

      const nextHistory = [...chatHistory, aiMsg];
      setChatHistory(nextHistory);

      const newId = await saveCurrentSession(nextHistory, newSummary, flashcards, activeSessionId, nextFiles);
      if (!activeSessionId && newId) setActiveSessionId(newId);

      setFile(null);
    } catch (err) {
      showToast('error', 'Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleScoreUpdate = async (topic, isCorrect, source, flashcardId) => {
    try {
      if (flashcardId) {
        await api.post("/analytics/track-flashcard", { flashcardId, isCorrect });
      } else {
        await api.post("/analytics/track-performance", { topic, isCorrect, source });
      }
      const res = await api.get("/analytics/weak-topics").catch(() => null);
      if (res && res.data) setWeakTopics(res.data);
    } catch (err) { console.error("Score tracking failed", err); }
  };

  const handleRename = async (id, newTitle) => { await renameSession(id, newTitle); };
  const handleDelete = async (id) => { await deleteSession(id); showToast('info', 'Session deleted.'); };
  const handleShare = async (id) => {
    const ok = await shareSession(id);
    if (ok) showToast('success', 'Chat copied to clipboard!');
    else showToast('error', 'Share failed. Try again.');
  };

  const toastStyles = {
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
    info: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', color: '#22d3ee' },
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', color: '#4ade80' },
  };

  const getModeStyles = () => {
    switch (currentMode) {
      case 'test':
        return {
          glowColor: 'rgba(168, 85, 247, 0.3)',
          borderColor: 'rgba(168, 85, 247, 0.6)',
          textColor: '#a855f7',
          bgGlow: 'rgba(168, 85, 247, 0.1)',
        };
      case 'research':
        return {
          glowColor: 'rgba(16, 185, 129, 0.3)',
          borderColor: 'rgba(16, 185, 129, 0.6)',
          textColor: 'var(--accent-emerald)',
          bgGlow: 'rgba(16, 185, 129, 0.1)',
        };
      case 'review':
        return {
          glowColor: 'rgba(249, 115, 22, 0.3)',
          borderColor: 'rgba(249, 115, 22, 0.6)',
          textColor: '#f97316',
          bgGlow: 'rgba(249, 115, 22, 0.1)',
        };
      default:
        return {
          glowColor: 'rgba(6, 182, 212, 0.3)',
          borderColor: 'var(--border-accent)',
          textColor: 'var(--accent-cyan)',
          bgGlow: 'var(--accent-cyan-glow)',
        };
    }
  };
  const modeStyles = getModeStyles();

  const isEmpty = chatHistory.length === 0 && flashcards.length === 0;
  const hasFiles = uploadedFiles.length > 0;
  const showLeftPanel = !leftPanelCollapsed;

  const renderReviewSession = () => {
    if (dueReviewsLoading) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flex: 1, color: 'var(--text-secondary)'
        }}>
          <div className="animate-spin" style={{
            width: 32, height: 32, border: '3px solid var(--border-glass)',
            borderTopColor: '#f97316', borderRadius: '50%', marginBottom: 16
          }} />
          <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Retrieving due cards...
          </p>
        </div>
      );
    }

    if (!user) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flex: 1, textAlign: 'center', maxWidth: 450, margin: '0 auto'
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
            🔒 Access Denied
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            Spaced repetition schedules reviews specifically for your learning profile. Please log in to start daily reviews.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              padding: '12px 24px', borderRadius: 'var(--radius-md)',
              background: '#f97316', color: '#fff', fontWeight: 700,
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em',
              border: 'none', cursor: 'pointer'
            }}
          >
            Login / Register
          </button>
        </div>
      );
    }

    if (dueReviews.length === 0) {
      return (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flex: 1, textAlign: 'center', maxWidth: 450, margin: '0 auto'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
          }}>
            <Sparkles size={32} color="#4ade80" />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
            You're All Caught Up!
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            No reviews are currently due. Upload notes and generate a quiz to build new flashcards!
          </p>
        </div>
      );
    }

    return (
      <div className="animate-fade-in-up" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 600, margin: '0 auto', flex: 1, justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            🧠 Spaced Repetition
          </h2>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Daily review session ({dueReviews.length} card{dueReviews.length > 1 ? 's' : ''} left)
          </p>
        </div>

        <FlashcardStack
          flashcards={dueReviews}
          onScoreUpdate={handleScoreUpdate}
          onCitationClick={(src) => {
            if (src.startsWith('http://') || src.startsWith('https://')) {
              window.open(src, '_blank');
            } else {
              setViewingPdfName(src);
              setLeftPanelCollapsed(false);
              setLeftPanelWidth(Math.floor(window.innerWidth * 0.50));
            }
          }}
          onComplete={() => {
            setDueReviews([]);
          }}
        />
      </div>
    );
  };

  // Find active session title for navbar
  const activeSession = chatSessions.find(s => s._id === activeSessionId);
  const sessionTitle = activeSession ? activeSession.title : "New Chat";

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
      display: 'flex', overflow: 'hidden', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Toast */}
      {toast && (
        <div className="animate-fade-in-down" style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '10px 24px', borderRadius: 'var(--radius-xl)',
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
          background: toastStyles[toast.type]?.bg, border: `1px solid ${toastStyles[toast.type]?.border}`,
          color: toastStyles[toast.type]?.color, backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
        onShare={handleShare}
        weakTopics={weakTopics}
        onRetryTopic={(topic) => { handleModeSwitch('test'); setQuestion(`/10 ${topic}`); }}
        user={user}
        onLoginClick={() => { setIsLoginView(true); setIsAuthModalOpen(true); }}
        onRegisterClick={() => { setIsLoginView(false); setIsAuthModalOpen(true); }}
        onLogout={logout}
        currentMode={currentMode}
        onModeSwitch={handleModeSwitch}
        isDocumentsOpen={!leftPanelCollapsed}
        onToggleDocuments={handleToggleDocuments}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <Navbar sessionTitle={sessionTitle} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* ── LEFT PANEL: File Browser + PDF Viewer ── */}
          <div
            id="left-workspace-panel"
            className="animate-slide-in-left"
            style={{
              width: showLeftPanel ? leftPanelWidth : 0,
              minWidth: showLeftPanel ? 280 : 0,
              maxWidth: showLeftPanel ? '80vw' : 0,
              transition: isResizing ? 'none' : 'width var(--transition-slow)',
              display: 'flex', flexDirection: 'column',
              borderRight: showLeftPanel ? '1px solid var(--border-glass)' : 'none',
              background: 'var(--bg-secondary)', overflow: 'hidden',
              position: 'relative',
            }}
          >
            {showLeftPanel && (
              <>
                {/* Dynamically toggle between File Browser and PDF Viewer */}
                {!viewingPdfName ? (
                  <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <FileBrowser
                      files={fileViewMode === 'chat' ? uploadedFiles : allUserFiles}
                      activeFile={viewingPdfName}
                      fileViewMode={fileViewMode}
                      onModeChange={setFileViewMode}
                      hasActiveSession={!!activeSessionId}
                      onFileSelect={(name) => {
                        setViewingPdfName(name);
                        setLeftPanelCollapsed(false);
                        setLeftPanelWidth(Math.floor(window.innerWidth * 0.50));
                      }}
                      onFileDelete={async (id, name) => {
                        try {
                          await api.delete(`/files/${id}/${encodeURIComponent(name)}`);
                          setUploadedFiles(prev => prev.filter(f => f._id !== id));
                          setAllUserFiles(prev => prev.filter(f => f._id !== id));
                          if (viewingPdfName === name) setViewingPdfName(null);
                          showToast('success', 'File deleted successfully');
                        } catch (err) {
                          showToast('error', 'Failed to delete file');
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <PdfViewer
                      fileName={viewingPdfName}
                      onClose={() => {
                        setViewingPdfName(null);
                        setLeftPanelCollapsed(true);
                        setLeftPanelWidth(380);
                      }}
                      isResizing={isResizing}
                      onWidthToggle={handleWidthToggle}
                      leftPanelWidth={leftPanelWidth}
                      onQuoteText={(text) => setQuestion(prev => prev ? prev + '\n' + `"${text}"` : `"${text}"`)}
                      onAskAI={(text) => handleAsk(false, `Explain this text from the PDF:\n\n"${text}"`)}
                    />
                  </div>
                )}
                
                {/* Drag Resizer Divider handle */}
                <div
                  onMouseDown={startResizing}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 6,
                    height: '100%',
                    cursor: 'col-resize',
                    zIndex: 100,
                    background: isResizing ? 'var(--accent-cyan)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isResizing) e.currentTarget.style.background = 'rgba(6, 182, 212, 0.3)';
                  }}
                  onMouseLeave={e => {
                    if (!isResizing) e.currentTarget.style.background = 'transparent';
                  }}
                />
              </>
            )}
          </div>

          {/* Unified Floating Collapse/Expand Button */}
          <button
            onClick={handleFloatingToggle}
            style={{
              position: 'absolute',
              top: 12,
              left: leftPanelCollapsed ? '12px' : `${leftPanelWidth - 14}px`,
              zIndex: 100,
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: isResizing 
                ? 'none' 
                : 'all var(--transition-base), left var(--transition-slow)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
            title={leftPanelCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {leftPanelCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>

          {/* ── RIGHT PANEL: Chat ── */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'var(--bg-primary)', overflow: 'hidden',
            transition: 'all var(--transition-slow)',
            position: 'relative',
          }}>
            {/* Interactive 3D Background */}
            <div className={`mode-bg-container ${(!isEmpty || currentMode === 'review') ? "chat-started" : ""}`} style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0,
              overflow: 'hidden',
            }}>
              {currentMode === 'study' && (
                <div className="study-3d-bg">
                  <div className="grid-3d-plane study" />
                  <div className="study-orb-1" />
                  <div className="study-orb-2" />
                </div>
              )}
              {currentMode === 'test' && (
                <div className="test-3d-bg">
                  <div className="grid-3d-plane test" />
                  <div className="test-orb-1" />
                  <div className="test-orb-2" />
                </div>
              )}
              {currentMode === 'research' && (
                <div className="research-3d-bg">
                  <div className="grid-3d-plane research" />
                  <div className="research-orb-1" />
                  <div className="research-orb-2" />
                </div>
              )}
              {currentMode === 'review' && (
                <div className="review-3d-bg">
                  <div className="grid-3d-plane review" />
                  <div className="review-orb-1" />
                  <div className="review-orb-2" />
                </div>
              )}
            </div>

            {currentMode === 'review' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'relative', zIndex: 1 }}>
                {renderReviewSession()}
              </div>
            ) : isEmpty ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '24px 24px 80px',
                position: 'relative',
                zIndex: 1,
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                  <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 'var(--radius-full)',
                    background: modeStyles.bgGlow, border: `1px solid ${modeStyles.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', color: modeStyles.textColor,
                    boxShadow: `0 0 20px ${modeStyles.glowColor}`,
                    animation: 'pulseGlow 3s ease-in-out infinite',
                    transition: 'all 0.5s ease-in-out',
                  }}>
                    <Brain size={28} />
                  </div>
                  <h2 style={{
                    fontSize: 28, fontWeight: 900, color: 'var(--text-primary)',
                    textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8,
                  }}>
                    How can I help you today?
                  </h2>
                  <p style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.25em',
                  }}>
                    Upload a document or ask a question to start.
                  </p>
                </div>

                {/* Mode suggestions and prompts */}
                <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 700, marginBottom: 24, textAlign: 'center', animationDelay: '0.05s' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>
                    {currentMode === 'study' && "Study Mode: Deeply analyze documents, generate summaries, and explain concepts."}
                    {currentMode === 'test' && "Assessment Mode: Take tests, target weak topics, and view stats."}
                    {currentMode === 'research' && "Research Mode: Evidence-based analysis with strict verified citations."}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                    {currentMode === 'study' && [
                      { text: "Summarize document", cmd: "/summary" },
                      { text: "Explain concept (/explain)", cmd: "/explain " },
                      { text: "Search video tutorials (/yt)", cmd: "/yt " }
                    ].map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(chip.cmd)}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                          color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all var(--transition-base)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--accent-cyan)';
                          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                          e.currentTarget.style.background = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-glass)';
                          e.currentTarget.style.background = 'var(--bg-card)';
                        }}
                      >
                        {chip.text}
                      </button>
                    ))}

                    {currentMode === 'test' && [
                      { text: "Generate Quiz (/quiz)", cmd: "/quiz" },
                      { text: "Check weak topics (/weak)", cmd: "/weak" },
                      { text: "Show statistics (/stats)", cmd: "/stats" }
                    ].map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (!user) {
                            setIsAuthModalOpen(true);
                            showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
                          } else {
                            setQuestion(chip.cmd);
                          }
                        }}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                          color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all var(--transition-base)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--accent-purple)';
                          e.currentTarget.style.borderColor = 'var(--accent-purple)';
                          e.currentTarget.style.background = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-glass)';
                          e.currentTarget.style.background = 'var(--bg-card)';
                        }}
                      >
                        {chip.text}
                      </button>
                    ))}

                    {currentMode === 'research' && [
                      { text: "Verify claims", cmd: "Verify the main claims in this document against facts." },
                      { text: "Synthesize sources", cmd: "Compare and synthesize findings across the uploaded documents." },
                      { text: "Literature outline", cmd: "Generate a structured literature review outline from this content." }
                    ].map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(chip.cmd)}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                          color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all var(--transition-base)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--accent-emerald)';
                          e.currentTarget.style.borderColor = 'var(--accent-emerald)';
                          e.currentTarget.style.background = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-glass)';
                          e.currentTarget.style.background = 'var(--bg-card)';
                        }}
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 700, animationDelay: '0.1s' }}>
                  <ChatInput
                    question={question}
                    setQuestion={setQuestion}
                    handleAsk={() => handleAsk(false)}
                    currentMode={currentMode}
                    setMode={handleModeSwitch}
                    loading={loading}
                    user={user}
                    uploading={uploading}
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleUpload}
                    onAuthRequired={() => {
                      setIsAuthModalOpen(true);
                      showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
                    }}
                  />
                </div>
              </div>
            </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
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
                  onCitationClick={(src) => {
                    if (src.startsWith('http://') || src.startsWith('https://')) {
                      window.open(src, '_blank');
                    } else {
                      setViewingPdfName(src);
                      setLeftPanelCollapsed(false);
                      setLeftPanelWidth(Math.floor(window.innerWidth * 0.50));
                    }
                  }}
                />

                {/* Input bar */}
                <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                  <ChatInput
                    question={question}
                    setQuestion={setQuestion}
                    handleAsk={() => handleAsk(false)}
                    currentMode={currentMode}
                    setMode={handleModeSwitch}
                    loading={loading}
                    user={user}
                    uploading={uploading}
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleUpload}
                    onAuthRequired={() => {
                      setIsAuthModalOpen(true);
                      showToast('error', 'Assessment Mode is a Pro feature. Please Login.');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}
        setUser={setUser} isLoginView={isLoginView} setIsLoginView={setIsLoginView}
      />
    </div>
  );
};

export default Dashboard;
