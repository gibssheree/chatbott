// Client-side chat history persistence - no backend, sessions live in
// localStorage only (per-browser, not synced across devices).

const STORAGE_KEY = "hermes-ai:chat-sessions";
const TITLE_MAX_LENGTH = 40;

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("❌ Gagal membaca chat history dari localStorage:", error);
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("❌ Gagal menyimpan chat history ke localStorage:", error);
  }
}

function deriveTitle(message) {
  const text = (message && message.text ? String(message.text) : "").trim();
  if (!text) return "New Chat";
  return text.length > TITLE_MAX_LENGTH
    ? text.slice(0, TITLE_MAX_LENGTH).trim() + "…"
    : text;
}

export function createSession(firstMessage) {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: deriveTitle(firstMessage),
    messages: [firstMessage],
    createdAt: now,
    updatedAt: now,
  };
}
