import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, SkipForward, RefreshCw, ArrowRight, Check } from "lucide-react";
import WarmUpChallenge from "@/components/warmup/WarmUpChallenge";
import WarmUpTimer from "@/components/warmup/WarmUpTimer";
import { warmups, pickWarmUp } from "@/data/warmups";
import { useLanguage, useT } from "@/lib/i18n";

// Optional 10-20 second arcade warm-up before a full training round.
// Disposable: no score, no history, no recording. Skip anytime.
export default function WarmUpBox({ onContinue, accent = "lavender" }) {
  const t = useT();
  const { lang } = useLanguage();
  const [view, setView] = useState("idle"); // idle | active | done
  const [current, setCurrent] = useState(null);
  const [step, setStep] = useState(0);
  const [doneMsg, setDoneMsg] = useState("");
  const lastId = useRef(null);
  const lastType = useRef(null);

  const roll = useCallback(() => {
    const next = pickWarmUp(warmups, lastId.current, lastType.current);
    lastId.current = next.id;
    lastType.current = next.type;
    setCurrent(next);
    setStep(0);
    setView("active");
  }, []);

  const handleTimerDone = useCallback(() => {
    if (current?.type === "three" && step < 2) {
      setStep((s) => s + 1);
    } else {
      const msgs = t("warmup.doneMessages");
      setDoneMsg(Array.isArray(msgs) ? msgs[Math.floor(Math.random() * msgs.length)] : "Nice!");
      setView("done");
    }
  }, [current, step, t]);

  const duration = current ? current.timer : 0;

  return (
    <div className="relative rounded-3xl border border-border/60 bg-card/80 overflow-hidden">
      {/* decorative shapes */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 blur-2xl" style={{ background: "hsl(var(--lavender))" }} />
      <div className="pointer-events-none absolute -bottom-12 -right-8 w-44 h-44 rounded-full opacity-25 blur-2xl" style={{ background: "hsl(var(--sky))" }} />

      <div className="relative px-6 sm:px-10 py-8 sm:py-10">
        <div className="text-center mb-1">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-charcoal/40">{t("warmup.title")}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {view === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col items-center text-center py-6 gap-6">
              <p className="font-display text-3xl sm:text-4xl text-charcoal text-balance">{t("warmup.quick")}</p>
              <p className="text-charcoal/60 text-balance max-w-sm">{t("warmup.idleBody")}</p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button onClick={roll} className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-charcoal text-cream font-semibold hover:scale-[1.03] transition-transform">
                  <Dices className="w-5 h-5 group-hover:rotate-12 transition-transform" /> {t("warmup.roll")}
                </button>
                <button onClick={onContinue} className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-charcoal/60 hover:text-charcoal text-sm font-medium">
                  {t("warmup.skip")} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {view === "active" && current && (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-7 py-4">
              <WarmUpChallenge warmup={current} step={step} lang={lang} />
              <WarmUpTimer key={`${current.id}-${step}`} seconds={duration} onDone={handleTimerDone} />
              <div className="flex items-center gap-4">
                <button onClick={roll} className="inline-flex items-center gap-1.5 text-sm text-charcoal/50 hover:text-charcoal">
                  <RefreshCw className="w-4 h-4" /> {t("warmup.another")}
                </button>
                <button onClick={onContinue} className="inline-flex items-center gap-1.5 text-sm text-charcoal/50 hover:text-charcoal">
                  {t("warmup.skip")} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {view === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center py-6 gap-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="w-16 h-16 rounded-full bg-sage/30 border border-sage-deep/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-sage-deep" />
              </motion.div>
              <p className="font-display text-4xl text-charcoal">{doneMsg}</p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button onClick={onContinue} className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-charcoal text-cream font-semibold hover:scale-[1.03] transition-transform">
                  {t("warmup.startRound")} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={roll} className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-charcoal/60 hover:text-charcoal text-sm font-medium">
                  <RefreshCw className="w-4 h-4" /> {t("warmup.another")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
