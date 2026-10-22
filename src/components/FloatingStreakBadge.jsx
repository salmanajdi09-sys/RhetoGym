import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Flame } from "lucide-react";
import { getStreakData, getSavedBadgePos, saveBadgePos } from "@/lib/streakStore";

export default function FloatingStreakBadge() {
  const [streak, setStreak] = useState({ count: 0, completedToday: false });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStreak(getStreakData());
    setPos(getSavedBadgePos());
    setMounted(true);

    // Listen for custom streak update event when a round finishes
    const handleStreakUpdate = () => {
      setStreak(getStreakData());
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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed z-50 top-6 right-6 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Capsule shape with rich periwinkle/purple border and glowing shadow */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-xl border-2 border-indigo-500/80 shadow-xl shadow-indigo-500/20 text-slate-900 transition-all">
        {streak.completedToday || count > 0 ? (
          <Flame className="w-5 h-5 text-indigo-600 fill-indigo-500/20 animate-pulse" />
        ) : (
          <Dumbbell className="w-5 h-5 text-indigo-600" />
        )}

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider">
          {count > 0 ? (
            <span className="text-indigo-600 text-sm">{count}</span>
          ) : (
            <span className="text-slate-400">0</span>
          )}
          <span className="text-slate-700 uppercase">STREAK</span>
        </div>

        {streak.completedToday && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
        )}
      </div>
    </motion.div>
  );
}
