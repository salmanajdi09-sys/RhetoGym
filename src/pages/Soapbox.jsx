import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Square, RotateCcw, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import AudienceViz from "@/components/AudienceViz";
import ReviewPanel from "@/components/ReviewPanel";
import WarmUpBox from "@/components/WarmUpBox";
import PracticeReceipt from "@/components/PracticeReceipt";
import TopicSelect from "@/components/TopicSelect";
import LevelBadge from "@/components/LevelBadge";
import { useRecorder } from "@/hooks/useRecorder";
import { soapboxPrompts, randomPrompt, promptText } from "@/data/prompts";
import { computeMetrics, paceBand, formatTime } from "@/lib/speech";
import { saveSession } from "@/lib/sessionStore";
import { useLanguage, useT } from "@/lib/i18n";

const TOTAL = 75;
const ACCENT = "lavender";

export default function Soapbox() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLanguage();
  const [phase, setPhase] = useState("topic"); // topic | prompt | warmup | record | review
  const [category, setCategory] = useState("surprise");
  const [level, setLevel] = useState("any");
  const [prompt, setPrompt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [round, setRound] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const timerRef = useRef(null);

  const rec = useRecorder(lang);

  const selectTopic = (cat, lvl) => {
    setCategory(cat);
    setLevel(lvl);
    setPrompt(randomPrompt(soapboxPrompts, lang, cat, lvl));
    setPhase("prompt");
  };
  const shuffle = () => setPrompt(randomPrompt(soapboxPrompts, lang, category, level));

  useEffect(() => {
    if (phase !== "record") return;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const e = (Date.now() - start) / 1000;
      setElapsed(e);
      if (e >= TOTAL) finish();
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const start = async () => {
    setElapsed(0);
    setMetrics(null);
    await rec.start();
    setPhase("record");
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    rec.stop();
  };

  useEffect(() => {
    if (rec.status === "stopped" && phase === "record") {
      const dur = Math.min(TOTAL, Math.max(elapsed, 1));
      const mt = computeMetrics(rec.transcript, dur);
      setMetrics(mt);
      const txt = promptText(prompt, lang);
      setRound(saveSession({
        audioUrl: rec.audioUrl,
        transcript: rec.transcript,
        metrics: mt,
        accent: ACCENT,
        motion: txt,
        position: "DELIVER",
        drillName: "Soapbox",
        durationSec: dur,
        category: prompt.cats[0], difficulty: prompt.level, promptId: prompt.id, challengeType: prompt.structure || prompt.type, targetDuration: TOTAL,
      }));
      setShowReceipt(true);
      setPhase("review");
    }
  }, [rec.status]);

  const retry = () => {
    rec.reset();
    shuffle();
    setElapsed(0);
    setMetrics(null);
    setRound(null);
    setShowReceipt(false);
    setPhase("prompt");
  };

  const liveWpm = elapsed > 0 ? Math.round((rec.transcript.trim().split(/\s+/).filter(Boolean).length / elapsed) * 60) : 0;
  const band = paceBand(liveWpm, elapsed >= TOTAL);
  const bandColor = { green: "bg-sage", yellow: "bg-butter", red: "bg-coral" }[band];
  const energy = Math.min(1, 0.3 + (liveWpm > 110 ? 0.3 : 0) + (elapsed > 5 && liveWpm > 0 ? 0.3 : 0));
  const restless = elapsed > 0 && liveWpm < 40 ? Math.min(1, (elapsed % 10) / 10) : 0;

  const txt = prompt ? promptText(prompt, lang) : "";

  if (phase === "topic") {
    return (
      <div className="relative">
        <FloatingShapes density="light" />
        <div className="relative">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-8">
            <button onClick={() => navigate("/train")} className="text-sm text-charcoal/50 hover:text-charcoal inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {t("nav.train")}
            </button>
          </div>
          <TopicSelect onSelect={selectTopic} accent={ACCENT} />
        </div>
      </div>
    );
  }

  if (phase === "prompt") {
    return (
      <div className="relative">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-12">
          <button onClick={() => setPhase("topic")} className="text-sm text-charcoal/50 hover:text-charcoal mb-8 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t("topic.title")}
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs uppercase tracking-widest text-lavender-deep">02 · {t("drills.soapbox.name")}</span>
            {prompt?.level && <LevelBadge level={prompt.level} />}
            {prompt?.structure && <span className="text-sm text-charcoal/60">{t(`challenge.${prompt.structure}`)}</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-3 text-balance">{t("drills.soapbox.desc")}</h1>

          <div className="mt-8 rounded-3xl border border-border/60 p-7 sm:p-9" style={{ background: `hsl(var(--${ACCENT}) / 0.32)` }}>
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("common.yourMotion")}</span>
            <p className="font-display text-2xl sm:text-3xl text-charcoal mt-2 text-balance">{txt}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button onClick={() => setPhase("warmup")} className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-charcoal text-cream font-semibold text-lg hover:scale-[1.03] transition-transform">
              {t("common.ready")} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={shuffle} className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-charcoal/60 hover:text-charcoal text-sm">
              <RotateCcw className="w-4 h-4" /> {t("common.shuffle")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "warmup") {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-10 w-full">
          <WarmUpBox onContinue={start} accent={ACCENT} />
        </div>
      </div>
    );
  }

  if (phase === "record") {
    if (rec.status === "denied") {
      return (
        <div className="relative mx-auto max-w-lg px-5 sm:px-8 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-coral-deep mx-auto mb-4" />
          <h2 className="font-display text-3xl text-charcoal">{t("record.micDenied")}</h2>
          <p className="text-charcoal/60 mt-3">{t("record.micDeniedBody")}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={async () => { await rec.start(); }} className="px-6 py-3 rounded-full bg-charcoal text-cream font-medium">{t("record.tryAgain")}</button>
            <button onClick={() => { setMetrics(computeMetrics("", TOTAL)); setPhase("review"); }} className="px-6 py-3 rounded-full bg-card border border-border font-medium">{t("record.continuePractice")}</button>
          </div>
        </div>
      );
    }
    const remaining = Math.max(0, TOTAL - elapsed);
    const pct = Math.min(elapsed / TOTAL, 1);
    return (
      <div className="relative min-h-[80vh] flex flex-col">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-8 w-full flex-1 flex flex-col">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-lavender-deep">{t("drills.soapbox.name")}</span>
            <p className="mt-2 text-charcoal/70 text-balance">{txt}</p>
          </div>

          <div className="mt-6"><AudienceViz energy={energy} restless={restless} /></div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="font-display text-[4.5rem] sm:text-[6rem] font-semibold leading-none tabular-nums text-charcoal">{formatTime(remaining)}</div>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal/5">
              <span className={`w-2.5 h-2.5 rounded-full ${bandColor} ${rec.status === "recording" ? "animate-pulse-soft" : ""}`} />
              <span className="font-mono text-xs uppercase tracking-widest text-charcoal/60">{liveWpm > 0 ? `~${liveWpm} WPM` : "…"}</span>
            </div>
          </div>

          <div className="h-2.5 rounded-full bg-charcoal/8 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: `hsl(var(--${ACCENT}-deep))` }} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-coral/20 border border-coral-deep/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-deep opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-coral-deep" />
              </span>
              <span className="font-mono text-sm font-bold tracking-widest text-coral-deep">{t("record.recording")}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button onClick={finish} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal text-cream font-medium hover:scale-105 transition-transform">
                <Square className="w-4 h-4" /> {t("record.endReview")}
              </button>
              <button onClick={retry} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border text-charcoal/70 font-medium hover:text-charcoal">
                <RotateCcw className="w-4 h-4" /> {t("record.restart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-10">
      <ReviewPanel key={round?.id || prompt?.id} record={round || { category: prompt?.cats[0], difficulty: prompt?.level, promptId: prompt?.id, challengeType: prompt?.structure, targetDuration: TOTAL }} audioUrl={rec.audioUrl} transcript={rec.transcript} metrics={metrics} accent={ACCENT} motion={txt} position="DELIVER" drillName="Soapbox" onRetry={retry} extra={<AudienceViz energy={metrics?.hasTranscript ? 0.7 : 0.4} restless={0} />} />
      {showReceipt && round && <PracticeReceipt round={round} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}
