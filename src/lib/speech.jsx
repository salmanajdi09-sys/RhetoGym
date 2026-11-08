import { useRecorder } from "@/hooks/useRecorder";

// Helper to format seconds into MM:SS
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Compute speaking metrics from transcript and duration
export function computeMetrics(transcript = "", durationSec = 1) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const wpm = Math.round(wordCount / minutes);

  // Simple filler word detector
  const fillers = ["um", "uh", "like", "you know", "ah", "er", "so", "actually", "basically"];
  let fillerCount = 0;
  
  words.forEach((word) => {
    if (fillers.includes(word.toLowerCase().replace(/[.,!?]/g, ""))) {
      fillerCount++;
    }
  });

  return {
    wordCount,
    wpm,
    fillerCount,
  };
}

// Determine pace band (too slow, optimal, too fast)
export function paceBand(wpm, isFinished = false) {
  if (!isFinished && wpm === 0) return "yellow";
  if (wpm < 110) return "yellow"; // too slow
  if (wpm <= 160) return "green";  // optimal pace
  return "red"; // too fast
}
