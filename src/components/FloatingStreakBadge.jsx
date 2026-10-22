import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Flame, X } from "lucide-react";
import { getStreakData, getSavedBadgePos, saveBadgePos, recordPracticeSession } from "@/lib/streakStore";
import { getRandomResilienceMessage } from "@/data/resilienceMessages";

export default function FloatingStreakBadge() {
  const [streak, setStreak] = useState({ count: 0, completedToday: false });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    setStreak(getStreakData());
    setPos(getSavedBadgePos());
    setMounted(true);

    const handleStreakUpdate = (event) => {
      // 1. Refresh streak count
      const updated = getStreakData();
      setStreak(updated);

      // 2. Trigger floating speech bubble message
      const customMsg = event?.detail?.message || getRandomResilienceMessage();
      setPopupMessage(customMsg);
    };

    window.addEventListener("rhetogym_streak_updated", handleStreakUpdate);
    return () => window.removeEventListener("rhetogym_streak_updated", handleStreakUpdate);
  }, []);

  if (!mounted) return null;

  const count = streak.count;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ left: -300, right: 300, top: -100, bottom: 600 }}
      onDragEnd={(e, info) => {
        const newPos = { x: pos.x + info.offset.x, y: pos.y + info.offset.y };
        setPos(newPos);
        saveBadgePos(newPos);
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed z-50 top-6 right-6 cursor-grab active:cursor-grabbing select-none flex flex-col items-end"
    >
      {/* Badge Capsule */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/25 text-slate-900 transition-all">
        {streak.completedToday || count > 0 ? (
          <Flame className="w-6 h-6 text-indigo-600 fill-indigo-500/20 animate-pulse" />
        ) : (
          <Dumbbell className="w-6 h-6 text-indigo-600" />
        )}

        <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider">
          <span className="text-indigo-600 text-base">{count}</span>
          <span className="text-slate-800 uppercase">STREAK</span>
        </div>

        {streak.completedToday && (
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
        )}
      </div>

      {/* Motivational Speech Bubble Popup */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="relative mt-2 max-w-xs p-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-sans font-medium shadow-xl border border-indigo-400/30 flex items-start gap-2"
          >
            <p className="flex-1 leading-snug">{popupMessage}</p>
            <button
              onClick={() => setPopupMessage(null)}
              className="text-white/70 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
