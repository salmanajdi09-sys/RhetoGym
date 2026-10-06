import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

// Dramatic preparation countdown.
export default function Countdown({ from = 10, onDone, accent = "coral" }) {
  const t = useT();
  const colors = {
    coral: "text-coral-deep",
    sky: "text-sky-deep",
    lavender: "text-lavender-deep",
    sage: "text-sage-deep",
    butter: "text-butter-deep",
  };
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <motion.div
        key={from}
        initial={{ scale: 0.4, opacity: 0, filter: "blur(8px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        exit={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className={`font-display text-[8rem] sm:text-[12rem] font-semibold leading-none ${colors[accent]}`}>
          {from}
        </div>
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div
            className="w-40 h-40 sm:w-64 sm:h-64 rounded-full blur-3xl opacity-40"
            style={{ background: `hsl(var(--${accent}))` }}
          />
        </div>
      </motion.div>
      <p className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-charcoal/50">
        {from > 0 ? t("prep.getReady") : t("prep.go")}
      </p>
      <button
        onClick={onDone}
        className="sr-only"
        aria-label="Skip countdown"
      >
        Skip
      </button>
    </div>
  );
}
