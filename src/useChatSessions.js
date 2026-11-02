import { useEffect, useState } from "react";
import { loadSessions, saveSessions, createSession } from "./chatStorage.js";

// Manages chat history as a list of sessions, persisted to localStorage.
// A session is only created once it receives its first message - clicking
// "New Chat" just clears the active session back to null, it doesn't create
// an empty history entry.
export function useChatSessions() {
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activeMessages = activeSession ? activeSession.messages : [];

  // Creates a brand new session containing `message` and makes it active.
  // Synchronous and independent of the `sessions` state value - it never
  // reads `sessions` to decide anything, it just mints a new session and
  // schedules the write. That matters because callers (see App.js) invoke
  // this from inside a setTimeout callback (the delayed bot reply); if this
  // function instead checked "does this id already exist in `sessions`" it
  // would be checking a `sessions` snapshot captured back when the timeout
  // was scheduled - stale by the time the timeout fires, since React
  // re-renders (and hands out a fresh `sessions` closure) well before a
  // 450ms+ delay elapses. That staleness previously caused the user message
  // and its bot reply to end up split across two different sessions.
  function createNewSessionWithMessage(message) {
    const newSession = createSession(message);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }

  // Appends `message` to the session identified by `sessionId`, which must
  // already exist (callers are responsible for calling
  // createNewSessionWithMessage first if there's no session yet - see the
  // `sid`-threading pattern in App.js's run_chatbot()). Uses a functional
  // update so it's always applied against the latest state regardless of
  // when this closure was created.
  function appendMessageToSession(sessionId, message) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
          : s,
      ),
    );
  }

  function startNewChat() {
    setActiveSessionId(null);
  }

  function selectSession(id) {
    setActiveSessionId(id);
  }

  function deleteSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setActiveSessionId((current) => (current === id ? null : current));
  }

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return {
    sessions: sortedSessions,
    activeSessionId,
    activeMessages,
    createNewSessionWithMessage,
    appendMessageToSession,
    startNewChat,
    selectSession,
    deleteSession,
  };
}
