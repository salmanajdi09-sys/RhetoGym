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
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal/90 text-cream backdrop-blur-md shadow-xl border border-cream/10 text-xs font-mono font-medium tracking-wide transition-colors">
        {streak.completedToday ? (
          <Flame className="w-4 h-4 text-coral animate-pulse" />
        ) : (
          <Dumbbell className="w-4 h-4 text-cream/70" />
        )}
        <span>
          {count > 0 ? `${count} DAY${count > 1 ? "S" : ""} IN GYM` : "0 REPS YET"}
        </span>
        {streak.completedToday && (
          <span className="w-2 h-2 rounded-full bg-sage-deep" />
        )}
      </div>
    </motion.div>
  );
}
