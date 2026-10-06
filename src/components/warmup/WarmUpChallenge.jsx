import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

// Renders the active warm-up's challenge content, dispatched by type.
// Pure presentational — the timer lives in the parent.
export default function WarmUpChallenge({ warmup, step, lang }) {
  const t = useT();
  const c = warmup[lang] || warmup.en;
  const typeLabel = t(`warmup.type.${warmup.type}`);

  const Badge = () => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/5 font-mono text-[10px] uppercase tracking-widest font-semibold text-charcoal/60">
      {typeLabel}
    </span>
  );

  return (
    <motion.div
      key={warmup.id + (warmup.type === "three" ? `-${step}` : "")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center gap-5"
    >
      <Badge />

      {warmup.type === "tongue" && (
        <>
          <p className="font-display text-2xl sm:text-3xl text-charcoal leading-relaxed whitespace-pre-line text-balance max-w-lg">
            {c.text}
          </p>
          <p className="text-charcoal/70 text-balance max-w-md">{c.challenge}</p>
        </>
      )}

      {warmup.type === "words" && (
        <>
          <div className="flex flex-col gap-2.5 items-center">
            {c.words.map((w) => (
              <span key={w} className="font-display text-3xl sm:text-4xl text-lavender-deep font-semibold tracking-wide">
                {w.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-charcoal/70">{t("warmup.words.instruction")}</p>
        </>
      )}

      {warmup.type === "voice" && (
        <>
          <p className="font-display text-3xl text-sky-deep font-semibold">{c.style}</p>
          <p className="text-charcoal/70 text-balance max-w-md">{c.instruction}</p>
          <div className="mt-1 rounded-2xl bg-charcoal/5 px-5 py-4">
            <p className="font-display text-2xl text-charcoal text-balance max-w-md">{c.sentence}</p>
          </div>
        </>
      )}

      {warmup.type === "ban" && (
        <>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/20 border border-coral-deep/30">
            <span className="font-mono text-[10px] uppercase tracking-widest text-charcoal/50">{t("warmup.ban.label")}</span>
            <span className="font-display text-lg text-coral-deep line-through decoration-2">{c.banned}</span>
          </span>
          <p className="text-charcoal/80 text-balance max-w-md leading-relaxed">{c.challenge}</p>
        </>
      )}

      {warmup.type === "three" && (
        <>
          <div className="rounded-2xl bg-charcoal/5 px-5 py-4">
            <p className="font-display text-2xl sm:text-3xl text-charcoal text-balance max-w-md">{c.sentence}</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-charcoal/40">
            <span className={step === 0 ? "text-charcoal font-bold" : ""}>{t("warmup.three.step0.label")}</span>
            <span>↓</span>
            <span className={step === 1 ? "text-charcoal font-bold" : ""}>{t("warmup.three.step1.label")}</span>
            <span>↓</span>
            <span className={step === 2 ? "text-charcoal font-bold" : ""}>{t("warmup.three.step2.label")}</span>
          </div>
          <p className="font-display text-xl text-charcoal/80">{t(`warmup.three.step${step}.instruction`)}</p>
        </>
      )}

      {warmup.type === "onebreath" && (
        <>
          <p className="text-charcoal/70 text-balance max-w-md">{t("warmup.onebreath.instruction")}</p>
          <div className="rounded-2xl bg-charcoal/5 px-5 py-4">
            <p className="font-display text-2xl sm:text-3xl text-charcoal text-balance max-w-md">{c.sentence}</p>
          </div>
        </>
      )}

      {warmup.type === "reverse" && (
        <>
          <p className="text-charcoal/70 text-balance max-w-md">{t("warmup.reverse.instruction")}</p>
          <div className="rounded-2xl bg-charcoal/5 px-5 py-4">
            <p className="font-display text-2xl sm:text-3xl text-charcoal text-balance max-w-md">{c.sentence}</p>
          </div>
        </>
      )}

      {warmup.type === "threeword" && (
        <>
          <p className="text-charcoal/70 text-balance max-w-md">{t("warmup.threeword.instruction")}</p>
          <div className="flex flex-col gap-2.5 items-center mt-1">
            {c.words.map((w) => (
              <span key={w} className="font-display text-3xl sm:text-4xl text-sage-deep font-semibold tracking-wide">
                {w.toUpperCase()}
              </span>
            ))}
          </div>
        </>
      )}

      {warmup.type === "define" && (
        <>
          <p className="text-charcoal/70 text-balance max-w-md">{t("warmup.define.instruction")}</p>
          <div className="rounded-2xl bg-charcoal/5 px-5 py-4">
            <p className="font-display text-3xl text-charcoal">{c.object}</p>
          </div>
        </>
      )}
    </motion.div>
  );
}
