const ROUND_KEY = "rhetogym_total_rounds";
const POS_KEY = "rhetogym_badge_pos";

export function getRoundData() {
  try {
    const raw = localStorage.getItem(ROUND_KEY);
    if (!raw) return { count: 0 };
    return JSON.parse(raw);
  } catch (e) {
    return { count: 0 };
  }
}

export function recordCompletedRound() {
  const current = getRoundData();
  const newCount = current.count + 1;
  const newData = { count: newCount };

  try {
    localStorage.setItem(ROUND_KEY, JSON.stringify(newData));
  } catch (e) {}

  return { count: newCount };
}

export function completeRoundAndTriggerCounter(options = {}) {
  const result = recordCompletedRound();

  window.dispatchEvent(
    new CustomEvent("rhetogym_round_updated", {
      detail: typeof options === "string" ? { message: options } : options
    })
  );

  return result;
}

export function getSavedBadgePos() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    return raw ? JSON.parse(raw) : { x: 0, y: 0 };
  } catch (e) {
    return { x: 0, y: 0 };
  }
}

export function saveBadgePos(pos) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(pos));
  } catch (e) {}
}
