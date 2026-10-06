import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLanguage, useT } from "@/lib/i18n";
import { categories, categoryLabel, categoryDesc, levels } from "@/data/prompts";

// Topic selection — pick a category and a level (or Surprise Me) before a drill.
export default function TopicSelect({ onSelect, accent = "sky" }) {
  const { lang } = useLanguage();
  const t = useT();
  const [level, setLevel] = useState("any");

  const levelOptions = [{ id: "any", accent: "charcoal", en: t("level.any"), fr: t("level.any") }, ...levels];

  return (
    <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("topic.title")}</span>
        <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-2 text-balance">{t("topic.subtitle")}</h1>
      </motion.div>

      {/* level selector */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mt-7">
        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("topic.levelLabel")}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {levelOptions.map((l) => {
            const active = level === l.id;
            const accentColor = l.id === "any" ? "charcoal" : l.accent;
            return (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${active ? "bg-charcoal text-cream border-charcoal" : `bg-card/70 text-charcoal/70 border-border/60 hover:bg-${accentColor}/10`}`}
              >
                {l.id === "any" ? t("level.any") : (lang === "fr" ? l.fr : l.en)}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.filter((cat) => cat.id !== "surprise").map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            onClick={() => onSelect(cat.id, level)}
            className={`group text-left rounded-2xl border border-border/60 bg-card/70 p-4 hover:border-${cat.accent}-deep/40 hover:bg-${cat.accent}/10 transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-2.5 h-2.5 rounded-full bg-${cat.accent}`} />
              <span className="font-mono text-[10px] text-charcoal/30 group-hover:text-charcoal/50">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
            </div>
            <p className="font-display text-lg text-charcoal mt-3 leading-tight">{categoryLabel(cat, lang)}</p>
            <p className="text-xs text-charcoal/50 mt-1 leading-snug">{categoryDesc(cat, lang)}</p>
          </motion.button>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => onSelect("surprise", level)}
          className="group w-full inline-flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-charcoal text-cream font-semibold hover:scale-[1.01] transition-transform"
        >
          <Sparkles className="w-5 h-5 text-butter" />
          {t("topic.surprise")}
        </button>
      </div>
    </div>
  );
}
