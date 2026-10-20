// Lightweight session + review store.
// The "current session" (last completed drill) lives in memory so the blob URL
// stays valid during SPA navigation; a text-only copy is persisted to localStorage
// so the Review page can reopen it (audio won't survive a full reload).

const SESSION_KEY = "rhetogym_session";
const REVIEWS_KEY = "rhetogym_reviews";

let currentSession = null;

// Mobile-safe fallback ID generator
function generateId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return "rg_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}

export function saveSession(session) {
  try {
    currentSession = { 
      ...session, 
      id: session?.id || generateId(), 
      completedAt: new Date().toISOString() 
    };
    
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...currentSession, audioUrl: undefined })
    );
  } catch (err) {
    console.warn("Failed to save session to localStorage:", err);
  }
  
  try {
    window.dispatchEvent(new Event("rhetogym:session"));
  } catch (e) {}

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
  try {
    window.dispatchEvent(new Event("rhetogym:session"));
  } catch (e) {}
}

export function saveReview(review) {
  try {
    const reviews = getSavedReviews();
    const reviewId = review?.id || generateId();
    const old = reviews.find((r) => r.id === reviewId);
    const { audioUrl, ...data } = review || {};
    const entry = { 
      ...old, 
      ...data, 
      id: reviewId, 
      savedAt: old?.savedAt || new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    const next = old ? reviews.map((r) => r.id === entry.id ? entry : r) : [entry, ...reviews];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
    try {
      window.dispatchEvent(new Event("rhetogym:reviews"));
    } catch (e) {}
    return entry;
  } catch (err) {
    console.error("Failed to save review:", err);
    return review;
  }
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
  try {
    const reviews = getSavedReviews().filter((r) => r.id !== id);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    try {
      window.dispatchEvent(new Event("rhetogym:reviews"));
    } catch (e) {}
  } catch (err) {
    console.error("Failed to delete review:", err);
  }
}
