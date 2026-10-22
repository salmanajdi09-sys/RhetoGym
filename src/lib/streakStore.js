const STREAK_KEY = "rhetogym_streak_data";
const POS_KEY = "rhetogym_badge_pos";

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getStreakData() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: null, completedToday: false };
    const data = JSON.parse(raw);
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    if (data.lastDate === today) {
      return { count: data.count, lastDate: data.lastDate, completedToday: true };
    } else if (data.lastDate === yesterday) {
      return { count: data.count, lastDate: data.lastDate, completedToday: false };
    } else {
      return { count: 0, lastDate: data.lastDate, completedToday: false };
    }
  } catch (e) {
    return { count: 0, lastDate: null, completedToday: false };
  }
}

export function recordPracticeSession() {
  const current = getStreakData();
  const today = getTodayStr();

  let newCount = current.count;
  if (!current.completedToday) {
    newCount = current.count + 1;
  }

  const newData = { count: newCount, lastDate: today };

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(newData));
  } catch (e) {}

  return { count: newCount, newlyUpdated: !current.completedToday };
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
