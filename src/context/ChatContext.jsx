import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  // uploadedFiles = files active in THIS session only (not all user files)
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [allUserFiles, setAllUserFiles] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Track whether the reminder has been shown this session (for first-login trigger)
  const [reminderDismissed, setReminderDismissed] = useState(false);
  // isFirstLogin: true only on actual login/reload with user present
  const firstLoginRef = useRef(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchWeakTopics();
      fetchAllUserFiles();
      // Always start fresh on login/reload — don't auto-load last session
      resetToFreshChat();
      // Mark as first login so reminder fires once
      firstLoginRef.current = true;
    } else {
      // Clear everything on logout
      resetToFreshChat();
      setChatSessions([]);
      setWeakTopics([]);
      setAllUserFiles([]);
      setReminderDismissed(false);
      setShowReminder(false);
    }
  }, [user]);

  // Show reminder once weak topics load, only on first login
  useEffect(() => {
    if (firstLoginRef.current && weakTopics.length > 0 && !reminderDismissed) {
      setShowReminder(true);
      firstLoginRef.current = false; // fire only once per session
    }
  }, [weakTopics]);

  function resetToFreshChat() {
    setChatHistory([]);
    setSummary([]);
    setFlashcards([]);
    setUploadedFiles([]);  // fresh brain — no files carry over
    setActiveSessionId(null);
  }

  const fetchSessions = async () => {
    try {
      const res = await api.get("/chat/sessions");
      setChatSessions(res.data);
    } catch (err) { console.error("Sessions fetch error", err); }
  };

  const fetchWeakTopics = async () => {
    try {
      const res = await api.get("/analytics/weak-topics").catch(() => null);
      if (res && res.data) setWeakTopics(res.data);
    } catch (err) { console.error("Weak topics error", err); }
  };

  const fetchAllUserFiles = async () => {
    if (!user) return;
    try {
      const res = await api.get("/files");
      setAllUserFiles(res.data);
    } catch (err) { console.error("All files fetch error", err); }
  };

  const saveCurrentSession = async (h, s, f, activeId, sessionUploadedFiles) => {
    if (!user) return;
    try {
      const fileNames = (sessionUploadedFiles || uploadedFiles).map(f => f.name);
      const res = await api.post("/chat/session", {
        sessionId: activeId,
        chatHistory: h,
        summary: s,
        flashcards: f,
        activeFiles: fileNames,
      });
      if (!activeId) {
        const newId = res.data.sessionId;
        setActiveSessionId(newId);
        fetchSessions();
        return newId;
      }
      return activeId;
    } catch (err) { console.error("Save error", err); return null; }
  };

  const loadSession = async (id) => {
    try {
      const res = await api.get(`/chat/session/${id}`);
      const session = res.data;
      setActiveSessionId(session._id);
      let history = session.chatHistory || [];
      const fcards = session.flashcards || [];

      // Migrate old sessions: if global flashcards exist but are not inline, append them
      if (fcards.length > 0) {
        const hasInlineFlashcards = history.some(msg => msg.flashcards && msg.flashcards.length > 0);
        if (!hasInlineFlashcards) {
           const lastAIMsgIndex = history.map(m=>m.role).lastIndexOf('ai');
           if (lastAIMsgIndex !== -1) {
             // Create a new array with the modified message to trigger React state updates properly if needed
             history = [...history];
             history[lastAIMsgIndex] = { ...history[lastAIMsgIndex], flashcards: fcards };
           } else {
             history = [...history, { role: 'ai', text: 'Here are your flashcards:', flashcards: fcards }];
           }
        }
      }

      setChatHistory(history);
      setSummary(session.summary || []);
      setFlashcards(fcards);
      // Restore only the files that belong to this session
      const sessionFileNames = session.activeFiles || [];
      if (sessionFileNames.length > 0) {
        // Fetch the full file objects for these names
        const allFilesRes = await api.get("/files").catch(() => null);
        if (allFilesRes && allFilesRes.data) {
          const matching = allFilesRes.data.filter(f =>
            sessionFileNames.includes(f.name)
          );
          setUploadedFiles(matching);
        }
      } else {
        setUploadedFiles([]);
      }
    } catch (err) { console.error("Load session failed", err); }
  };

  const startNewChat = () => {
    resetToFreshChat();
  };

  const renameSession = async (id, newTitle) => {
    try {
      await api.patch(`/chat/session/${id}/rename`, { title: newTitle });
      setChatSessions(prev =>
        prev.map(s => s._id === id ? { ...s, title: newTitle } : s)
      );
    } catch (err) { console.error("Rename failed", err); }
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/chat/session/${id}`);
      setChatSessions(prev => prev.filter(s => s._id !== id));
      // If deleted session was active, reset to fresh chat
      if (activeSessionId === id) resetToFreshChat();
    } catch (err) { console.error("Delete failed", err); }
  };

  const shareSession = async (id) => {
    try {
      const res = await api.get(`/chat/session/${id}/share`);
      const { title, shareText } = res.data;
      await navigator.clipboard.writeText(`=== ${title} ===\n\n${shareText}`);
      return true; // signals success to caller for toast
    } catch (err) {
      console.error("Share failed", err);
      return false;
    }
  };

  const dismissReminder = () => {
    setShowReminder(false);
    setReminderDismissed(true);
  };

  return (
    <ChatContext.Provider
      value={{
        file, setFile,
        chatHistory, setChatHistory,
        summary, setSummary,
        flashcards, setFlashcards,
        uploadedFiles, setUploadedFiles,
        allUserFiles, setAllUserFiles,
        chatSessions, setChatSessions,
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
        fetchSessions,
        fetchAllUserFiles,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
