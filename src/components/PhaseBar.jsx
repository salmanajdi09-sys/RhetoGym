import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

const phases = [
  { key: "clash", range: [0, 15], color: "sky", labelKey: "phase.clash", hintKey: "phase.clashHint" },
  { key: "counter", range: [15, 45], color: "lavender", labelKey: "phase.counter", hintKey: "phase.counterHint" },
  { key: "weigh", range: [45, 60], color: "coral", labelKey: "phase.weigh", hintKey: "phase.weighHint" },
];

export function getPhase(t) {
  return phases.find((p) => t >= p.range[0] && t < p.range[1]) || phases[phases.length - 1];
}

export default function PhaseBar({ elapsed, total = 60 }) {
  const t = useT();
  const pct = Math.min(elapsed / total, 1);
  const active = getPhase(elapsed);

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 mb-3">
        {phases.map((p) => {
          const isActive = p.key === active.key;
          const isPast = elapsed >= p.range[1];
          return (
            <div key={p.key} className="text-center">
              <motion.div
                animate={{ scale: isActive ? 1.04 : 1, opacity: isActive ? 1 : isPast ? 0.7 : 0.45 }}
                transition={{ duration: 0.4 }}
                className={`inline-flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl ${isActive ? `bg-${p.color}/30` : ""}`}
              >
                <span className={`font-mono text-xs sm:text-sm font-bold tracking-widest ${isActive ? `text-${p.color}-deep` : "text-charcoal/50"}`}>
                  {t(p.labelKey)}
                </span>
                <span className="hidden sm:block text-[10px] text-charcoal/40 font-mono">{p.range[0]}–{p.range[1]}s</span>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="relative h-3 rounded-full bg-charcoal/8 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: "linear-gradient(90deg, hsl(var(--sky)) 0%, hsl(var(--sky)) 25%, hsl(var(--lavender)) 25%, hsl(var(--lavender)) 75%, hsl(var(--coral)) 75%, hsl(var(--coral)) 100%)",
          }}
          transition={{ ease: "linear" }}
        />
        {[15, 45].map((t) => (
          <div key={t} className="absolute top-0 bottom-0 w-px bg-cream/70" style={{ left: `${(t / total) * 100}%` }} />
        ))}
      </div>
      <motion.p
        key={active.key}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 text-center text-sm text-charcoal/60 italic font-body"
      >
        {t(active.hintKey)}
      </motion.p>
    </div>
  );
}
