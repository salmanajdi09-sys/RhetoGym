// Lightweight session + review store.
// The "current session" (last completed drill) lives in memory so the blob URL
// stays valid during SPA navigation; a text-only copy is persisted to localStorage
// so the Review page can reopen it (audio won't survive a full reload).

const SESSION_KEY = "rhetogym_session";
const REVIEWS_KEY = "rhetogym_reviews";

let currentSession = null;

export function saveSession(session) {
  currentSession = { ...session, id: session.id || crypto.randomUUID(), completedAt: new Date().toISOString() };
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...currentSession, audioUrl: undefined })
    );
  } catch {}
  window.dispatchEvent(new Event("rhetogym:session"));
  return currentSession;
}

export function getSession() {
  if (currentSession) return currentSession;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function clearSession() {
  currentSession = null;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
  window.dispatchEvent(new Event("rhetogym:session"));
}

export function saveReview(review) {
  const reviews = getSavedReviews();
  const old = reviews.find((r) => r.id === review.id);
  const { audioUrl, ...data } = review;
  const entry = { ...old, ...data, id: review.id || crypto.randomUUID(), savedAt: old?.savedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  const next = old ? reviews.map((r) => r.id === entry.id ? entry : r) : [entry, ...reviews];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("rhetogym:reviews"));
  return entry;
}

export function getSavedReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteReview(id) {
  const reviews = getSavedReviews().filter((r) => r.id !== id);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event("rhetogym:reviews"));
}
