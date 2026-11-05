import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Trophy, X } from "lucide-react";
import { getRoundData, getSavedBadgePos, saveBadgePos } from "@/lib/streakStore";

// Short, concise messages in EN & FR
const RESILIENCE_MESSAGES = {
  en: [
    "Rhetoric is muscle memory. Great rep!",
    "One round closer to mastery.",
    "Showing up counts. Keep going!",
    "Clearer thoughts, smoother delivery.",
    "Sharp practice today!"
  ],
  fr: [
    "La rhétorique s'entraîne. Bravo !",
    "Un tour de plus vers la maîtrise.",
    "Chaque séance compte. Continue !",
    "Pensées claires, élocution fluide.",
    "Excellente pratique aujourd'hui !"
  ]
};

function getRandomMessage(lang = "en") {
  const list = RESILIENCE_MESSAGES[lang] || RESILIENCE_MESSAGES.en;
  return list[Math.floor(Math.random() * list.length)];
}

export default function FloatingStreakBadge({ lang = "en" }) {
  const [roundData, setRoundData] = useState({ count: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    setRoundData(getRoundData());
    setPos(getSavedBadgePos());
    setMounted(true);

    const handleRoundUpdate = (event) => {
      const updated = getRoundData();
      setRoundData(updated);

      const msgLang = event?.detail?.lang || lang || "en";
      const customMsg = event?.detail?.message || getRandomMessage(msgLang);
      setPopupMessage(customMsg);
    };

    window.addEventListener("rhetogym_round_updated", handleRoundUpdate);
    return () => window.removeEventListener("rhetogym_round_updated", handleRoundUpdate);
  }, [lang]);

  // Auto-dismiss popup after 5 seconds so it doesn't linger forever
  useEffect(() => {
    if (!popupMessage) return;
    const timer = setTimeout(() => {
      setPopupMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [popupMessage]);

  if (!mounted) return null;

  const count = roundData.count;

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
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-xl border border-indigo-500/60 shadow-lg text-slate-900 transition-all">
        {count > 0 ? (
          <Trophy className="w-5 h-5 text-indigo-600 fill-indigo-500/20" />
        ) : (
          <Dumbbell className="w-5 h-5 text-indigo-600" />
        )}

        <div className="flex items-center gap-1 font-mono text-xs font-bold tracking-wider">
          <span className="text-indigo-600 text-sm">{count}</span>
          <span className="text-slate-800 uppercase">
            {lang === "fr" ? "TOURS" : "ROUNDS"}
          </span>
        </div>
      </div>

      {/* Motivational Speech Bubble Popup */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="relative mt-1.5 max-w-[220px] p-2.5 rounded-xl bg-indigo-600 text-white text-[11px] font-sans font-medium shadow-md border border-indigo-400/30 flex items-center justify-between gap-2"
          >
            <p className="leading-tight flex-1">{popupMessage}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevents parent motion.div from capturing the click
                setPopupMessage(null);
              }}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-indigo-500/50 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
