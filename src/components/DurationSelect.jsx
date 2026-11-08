import { motion } from "framer-motion";
import { durations } from "@/data/durations";
import { useLanguage, useT } from "@/lib/i18n";

// Mandatory, never remembered: a fresh pick is required for every round.
export default function DurationSelect({ value, onChange, accent = "sky", recommended }) {
  const { lang } = useLanguage();
  const t = useT();

  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("duration.eyebrow")}</span>
      <p className="font-display text-xl sm:text-2xl text-charcoal mt-1 text-balance">{t("duration.title")}</p>

      <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
        {durations.map((d, i) => {
          const selected = value === d.value;
          const isRecommended = recommended === d.value;
          return (
            <motion.button
              key={d.value}
              type="button"
              aria-pressed={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              onClick={() => onChange(d.value)}
              className={`rounded-2xl border px-2 py-2.5 text-center transition-all duration-200 ${
                selected
                  ? "bg-charcoal border-charcoal text-cream shadow-lg shadow-charcoal/15 scale-[1.02]"
                  : "bg-card/70 border-border/60 text-charcoal/75 hover:border-charcoal/30 hover:-translate-y-0.5"
              }`}
            >
              <span
                className="block h-3 font-mono text-[8px] uppercase tracking-widest leading-3 whitespace-nowrap overflow-hidden"
                style={{ color: selected ? "hsl(var(--cream) / 0.65)" : `hsl(var(--${accent}-deep) / 0.8)` }}
              >
                {isRecommended ? t("duration.recommended") : ""}
              </span>
              <span className="block font-display text-base sm:text-lg leading-tight mt-0.5 whitespace-nowrap">
                {d.label[lang] || d.label.en}
              </span>
            </motion.button>
          );
        })}
      </div>

      {!value && <p className="mt-2 text-xs text-charcoal/50">{t("duration.required")}</p>}
    </div>
  );
}
