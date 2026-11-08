// Lightweight speech metrics derived from a transcript + recording duration.

const FILLERS = ["um", "uh", "er", "ah", "like", "basically", "actually", "literally", "so", "well", "right", "hmm", "ya know", "you know"];

export function tokenize(transcript) {
  if (!transcript) return [];
  return transcript
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

export function countFillers(transcript) {
  const tokens = tokenize(transcript);
  const counts = {};
  let total = 0;
  // phrase-level fillers first
  const lower = transcript.toLowerCase();
  for (const phrase of ["you know", "ya know"]) {
    const re = new RegExp(`\\b${phrase}\\b`, "g");
    const m = (lower.match(re) || []).length;
    if (m) { counts[phrase] = m; total += m; }
  }
  for (const t of tokens) {
    if (["you", "ya", "know"].includes(t)) continue; // handled as phrase
    if (FILLERS.includes(t)) {
      counts[t] = (counts[t] || 0) + 1;
      total += 1;
    }
  }
  const list = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word, n]) => ({ word, count: n }));
  return { total, list };
}

export function computeMetrics(transcript, durationSec) {
  const tokens = tokenize(transcript);
  const wordCount = tokens.length;
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const wpm = Math.round(wordCount / minutes);
  const { total: fillerCount, list: fillerList } = countFillers(transcript);
  return {
    wordCount,
    wpm,
    fillerCount,
    fillerList,
    durationSec,
    hasTranscript: wordCount > 0,
  };
}

// Pace band for the live indicator.
// green: comfortable (120-165), yellow: outside but alive, red: ended
export function paceBand(wpm, ended) {
  if (ended) return "red";
  if (wpm === 0) return "yellow";
  if (wpm >= 120 && wpm <= 165) return "green";
  return "yellow";
}

export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function randomPrompt(list) {
  return list[Math.floor(Math.random() * list.length)];
}
