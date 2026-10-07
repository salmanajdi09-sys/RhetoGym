import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Square, RotateCcw, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import Countdown from "@/components/Countdown";
import PhaseBar, { getPhase } from "@/components/PhaseBar";
import ReviewPanel from "@/components/ReviewPanel";
import WarmUpBox from "@/components/WarmUpBox";
import PracticeReceipt from "@/components/PracticeReceipt";
import TopicSelect from "@/components/TopicSelect";
import LevelBadge from "@/components/LevelBadge";
import { useRecorder } from "@/hooks/useRecorder";
import { debatePrompts, randomPrompt, promptText } from "@/data/prompts";
import { computeMetrics, paceBand, formatTime } from "@/lib/speech";
import { saveSession } from "@/lib/sessionStore";
import { useLanguage, useT } from "@/lib/i18n";

const TOTAL = 60;
const PREP = 10;
const ACCENT = "sky";

export default function RebuttalBlitz() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLanguage();
  const [phase, setPhase] = useState("topic"); // topic | prompt | warmup | prepare | record | review
  const [category, setCategory] = useState("surprise");
  const [level, setLevel] = useState("any");
  const [prompt, setPrompt] = useState(null);
  const [count, setCount] = useState(PREP);
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [round, setRound] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const timerRef = useRef(null);

  const rec = useRecorder(lang);

  const selectTopic = (cat, lvl) => {
    setCategory(cat);
    setLevel(lvl);
    setPrompt(randomPrompt(debatePrompts, lang, cat, lvl));
    setPhase("prompt");
  };

  const shuffle = () => setPrompt(randomPrompt(debatePrompts, lang, category, level));

  // preparation countdown
  useEffect(() => {
    if (phase !== "prepare") return;
    if (count <= 0) { setPhase("record"); return; }
    const tm = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(tm);
  }, [phase, count]);

  // recording timer
  useEffect(() => {
    if (phase !== "record") return;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const e = (Date.now() - start) / 1000;
      setElapsed(e);
      if (e >= TOTAL) finishRecording();
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startRound = () => {
    setCount(PREP);
    setElapsed(0);
    setMetrics(null);
    setPhase("prepare");
  };

  const beginRecording = async () => {
    setElapsed(0);
    await rec.start();
    setPhase("record");
  };

  useEffect(() => {
    if (phase === "prepare" && count === 0) beginRecording();
  }, [phase, count]);

  const finishRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    rec.stop();
  };

  useEffect(() => {
    if (rec.status === "stopped" && phase === "record") {
      const dur = Math.min(TOTAL, Math.max(elapsed, 1));
      const mt = computeMetrics(rec.transcript, dur);
      setMetrics(mt);
      const p = promptText(prompt, lang);
      setRound(saveSession({
        audioUrl: rec.audioUrl,
        transcript: rec.transcript,
        metrics: mt,
        accent: ACCENT,
        motion: p.motion,
        position: p.position,
        drillName: "Rebuttal Blitz",
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
  const activePhase = getPhase(elapsed);
  const bandColor = { green: "bg-sage", yellow: "bg-butter", red: "bg-coral" }[band];
  const bandLabel = { green: t("record.pace.green"), yellow: t("record.pace.yellow"), red: t("record.pace.red") }[band];

  /* ---------- TOPIC ---------- */
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

  const p = prompt ? promptText(prompt, lang) : { motion: "", position: "", angles: [] };

  /* ---------- PROMPT ---------- */
  if (phase === "prompt") {
    return (
      <div className="relative">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-12">
          <button onClick={() => setPhase("topic")} className="text-sm text-charcoal/50 hover:text-charcoal mb-8 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t("topic.title")}
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs uppercase tracking-widest text-sky-deep">01 · {t("drills.rebuttal.name")}</span>
            {prompt?.level && <LevelBadge level={prompt.level} />}
            {prompt?.structure && <span className="text-sm text-charcoal/60">{t(`challenge.${prompt.structure}`)}</span>}
          </div>

          <div className="mt-6 rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-9">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("common.yourMotion")}</span>
            <h1 className="font-display text-3xl sm:text-4xl text-charcoal mt-2 text-balance">{p.motion}</h1>
          </div>

          <div className="mt-5 rounded-3xl bg-sky/20 border border-sky-deep/20 p-6 sm:p-8">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("common.yourPosition")}</span>
            <p className="font-display text-4xl sm:text-5xl text-sky-deep mt-1">{p.position}</p>
          </div>

          <div className="mt-5 rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-8">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("common.yourAngles")}</span>
            <p className="text-sm text-charcoal/50 mt-1 mb-4">{t("common.anglesHint")}</p>
            <div className="space-y-3">
              {p.angles.map((a, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="font-mono text-sm text-charcoal/40">0{i + 1}</span>
                  <span className="font-display text-xl text-charcoal">{a}</span>
                </div>
              ))}
            </div>
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

  /* ---------- WARMUP ---------- */
  if (phase === "warmup") {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-10 w-full">
          <WarmUpBox onContinue={startRound} accent={ACCENT} />
        </div>
      </div>
    );
  }

  /* ---------- PREPARE ---------- */
  if (phase === "prepare") {
    return (
      <div className="relative min-h-[70vh] flex flex-col">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-10 w-full">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-deep block text-center">{t("prep.getReady")}</span>
          <Countdown from={count} accent={ACCENT} onDone={() => setCount(0)} />
          <div className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-5">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("prep.yourAngles")}</span>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              {p.angles.map((a, i) => (
                <div key={i} className="rounded-xl bg-sky/10 p-3">
                  <span className="font-mono text-xs text-charcoal/40">0{i + 1}</span>
                  <p className="text-sm text-charcoal/80 mt-1">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- RECORD ---------- */
  if (phase === "record") {
    if (rec.status === "denied") {
      return (
        <div className="relative mx-auto max-w-lg px-5 sm:px-8 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-coral-deep mx-auto mb-4" />
          <h2 className="font-display text-3xl text-charcoal">{t("record.micDenied")}</h2>
          <p className="text-charcoal/60 mt-3">{t("record.micDeniedBody")}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={async () => { await rec.start(); setElapsed(0); }} className="px-6 py-3 rounded-full bg-charcoal text-cream font-medium">{t("record.tryAgain")}</button>
            <button onClick={() => { setMetrics(computeMetrics("", TOTAL)); setPhase("review"); }} className="px-6 py-3 rounded-full bg-card border border-border font-medium">{t("record.continuePractice")}</button>
          </div>
        </div>
      );
    }
    const remaining = Math.max(0, TOTAL - elapsed);
    return (
      <div className="relative min-h-[80vh] flex flex-col">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-8 w-full flex-1 flex flex-col">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-sky-deep">{t("drills.rebuttal.name")}</span>
            <p className="mt-2 text-charcoal/70 text-balance">{p.motion}</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="relative">
              <motion.div key={activePhase.key} initial={{ scale: 0.96, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-[5rem] sm:text-[7rem] font-semibold leading-none tabular-nums" style={{ color: `hsl(var(--${activePhase.color}-deep))` }}>
                {formatTime(remaining)}
              </motion.div>
              <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-3xl opacity-40" style={{ background: `hsl(var(--${activePhase.color}))` }} />
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal/5">
              <span className={`w-2.5 h-2.5 rounded-full ${bandColor} ${rec.status === "recording" ? "animate-pulse-soft" : ""}`} />
              <span className="font-mono text-xs uppercase tracking-widest text-charcoal/60">{bandLabel}</span>
              {rec.transcript && <span className="font-mono text-xs text-charcoal/40">· ~{liveWpm} WPM</span>}
            </div>
          </div>

          <PhaseBar elapsed={elapsed} total={TOTAL} />

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-coral/20 border border-coral-deep/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-deep opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-coral-deep" />
              </span>
              <span className="font-mono text-sm font-bold tracking-widest text-coral-deep">{t("record.recording")}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button onClick={finishRecording} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal text-cream font-medium hover:scale-105 transition-transform">
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

  /* ---------- REVIEW ---------- */
  return (
    <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-10">
      <ReviewPanel key={round?.id || prompt?.id} record={round || { category: prompt?.cats[0], difficulty: prompt?.level, promptId: prompt?.id, challengeType: prompt?.structure, targetDuration: TOTAL }} audioUrl={rec.audioUrl} transcript={rec.transcript} metrics={metrics} accent={ACCENT} motion={p.motion} position={p.position} drillName="Rebuttal Blitz" onRetry={retry} />
      {showReceipt && round && <PracticeReceipt round={round} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}
