import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

// Red, energetic countdown for the warm-up. Reads clearly without color alone
// (the number is always shown alongside the bar).
export default function WarmUpTimer({ seconds, onDone }) {
  const t = useT();
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      const id = setTimeout(() => onDoneRef.current(), 350);
      return () => clearTimeout(id);
    }
    const tm = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(tm);
  }, [remaining]);

  const pct = seconds > 0 ? Math.max(0, remaining / seconds) : 0;
  const urgent = remaining <= 3 && remaining > 0;
  const coral = "hsl(350, 56%, 56%)";
  const coralDeep = "hsl(350, 60%, 46%)";

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={urgent ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: urgent ? Infinity : 0, ease: "easeInOut" }}
        className="font-display text-6xl sm:text-7xl font-semibold leading-none tabular-nums"
        style={{ color: urgent ? coralDeep : coral }}
      >
        {remaining}
      </motion.div>
      <span className="font-mono text-xs uppercase tracking-widest" style={{ color: coralDeep }}>
        {remaining === 1 ? t("warmup.secondLeft") : t("warmup.secondsLeft")}
      </span>
      <div className="h-2 w-full max-w-xs rounded-full overflow-hidden" style={{ background: "hsl(350, 50%, 68%, 0.25)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: coral }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
      </div>
    </div>
  );
}
