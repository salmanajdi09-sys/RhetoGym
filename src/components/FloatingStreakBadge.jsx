import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame } from "lucide-react";
import { getStreakData, getSavedBadgePos, saveBadgePos } from "@/lib/streakStore";

export default function FloatingStreakBadge() {
  const [streak, setStreak] = useState({ count: 0, completedToday: false });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStreak(getStreakData());
    setPos(getSavedBadgePos());
    setMounted(true);
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
      className="fixed z-50 top-6 right-6 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-purple-200/60 shadow-lg shadow-purple-500/5 text-xs font-mono font-medium text-slate-800 transition-all">
        {streak.completedToday ? (
          <Flame className="w-4 h-4 text-purple-600 animate-pulse" />
        ) : (
          <Sparkles className="w-4 h-4 text-purple-500" />
        )}
        
        <span className="tracking-wide">
          {count > 0 ? (
            <>
              <span className="font-bold text-purple-600">{count}</span> DAY STREAK
            </>
          ) : (
            <span className="text-slate-600">Ready for Round 1</span>
          )}
        </span>

        {streak.completedToday && (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>
    </motion.div>
  );
}
