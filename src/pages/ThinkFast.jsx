import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Square, RotateCcw, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import Countdown from "@/components/Countdown";
import ReviewPanel from "@/components/ReviewPanel";
import WarmUpBox from "@/components/WarmUpBox";
import PracticeReceipt from "@/components/PracticeReceipt";
import TopicSelect from "@/components/TopicSelect";
import LevelBadge from "@/components/LevelBadge";
import { useRecorder } from "@/hooks/useRecorder";
import { thinkfastPrompts, randomPrompt, promptText, thinkfastTypes } from "@/data/prompts";
import { computeMetrics, paceBand, formatTime } from "@/lib/speech";
import { saveSession } from "@/lib/sessionStore";
import { useLanguage, useT } from "@/lib/i18n";

const PREP = 8;
const SPEAK = 45;
const ACCENT = "coral";

export default function ThinkFast() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLanguage();
  const [phase, setPhase] = useState("topic"); // topic | prompt | warmup | prepare | record | review
  const [category, setCategory] = useState("surprise");
  const [level, setLevel] = useState("any");
  const [prompt, setPrompt] = useState(null);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [round, setRound] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const timerRef = useRef(null);

  const rec = useRecorder(lang);

  const selectTopic = (cat, lvl) => {
    setCategory(cat);
    setLevel(lvl);
    setPrompt(randomPrompt(thinkfastPrompts, lang, cat, lvl));
    setPhase("prompt");
  };
  const shuffle = () => setPrompt(randomPrompt(thinkfastPrompts, lang, category, level));

  useEffect(() => {
    if (phase !== "prepare") return;
    if (count <= 0) { beginRecording(); return; }
    const tm = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(tm);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "record") return;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - start) / 1000);
      setElapsed(e);
      if (e >= SPEAK) {
        finish();
      }
    }, 1000);
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

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    rec.stop();
  };

  useEffect(() => {
    if (rec.status === "stopped" && phase === "record") {
      // 200ms stagger gives mobile hardware threads time to safely complete audio buffer flush
      const timer = setTimeout(() => {
        const dur = Math.min(SPEAK, Math.max(elapsed, 1));
        const mt = computeMetrics(rec.transcript, dur);
        setMetrics(mt);
        const txt = promptText(prompt, lang);
        setRound(saveSession({
          audioUrl: rec.audioUrl,
          transcript: rec.transcript,
          metrics: mt,
          accent: ACCENT,
          motion: txt,
          position: "SPEAK",
          drillName: "Think Fast",
          durationSec: dur,
          category: prompt?.cats?.[0] || "general", 
          difficulty: prompt?.level || "any", 
          promptId: prompt?.id || "prompt", 
          challengeType: prompt?.structure || prompt?.type || "thinkfast", 
          targetDuration: SPEAK,
        }));
        setShowReceipt(true);
        setPhase("review");
      }, 200);

      return () => clearTimeout(timer);
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
  const band = paceBand(liveWpm, elapsed >= SPEAK);
  const bandColor = { green: "bg-sage", yellow: "bg-butter", red: "bg-coral" }[band];
  const typeMeta = thinkfastTypes.find((x) => x.id === prompt?.type);
  const half = elapsed >= SPEAK / 2;

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
            <span className="font-mono text-xs uppercase tracking-widest text-coral-deep">03 · {t("drills.thinkfast.name")}</span>
            {prompt?.level && <LevelBadge level={prompt.level} />}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-3 text-balance">{t("drills.thinkfast.desc")}</h1>

          {prompt?.type && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${typeMeta?.accent}/15`} style={{ color: `hsl(var(--${typeMeta?.accent}-deep))` }}>
                <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">{t(`challenge.${prompt.type}`)}</span>
              </span>
              <span className="text-sm text-charcoal/60">{t(`thinkfast.hint.${prompt.type}`)}</span>
            </div>
          )}

          <div className="mt-8 rounded-3xl border border-border/60 p-7 sm:p-9" style={{ background: `hsl(var(--${ACCENT}) / 0.18)` }}>
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
          <WarmUpBox onContinue={startRound} accent={ACCENT} />
        </div>
      </div>
    );
  }

  if (phase === "prepare") {
    return (
      <div className="relative min-h-[70vh] flex flex-col">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-10 w-full">
          <span className="font-mono text-xs uppercase tracking-widest text-coral-deep block text-center">{t("prep.getReady")}</span>
          <Countdown from={count} accent={ACCENT} onDone={() => setCount(0)} />
          <div className="mt-4 rounded-2xl border border-border/60 bg-card/70 p-5 text-center">
            <p className="text-charcoal/70 text-balance">{txt}</p>
          </div>
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
            <button onClick={() => { setMetrics(computeMetrics("", SPEAK)); setPhase("review"); }} className="px-6 py-3 rounded-full bg-card border border-border font-medium">{t("record.continuePractice")}</button>
          </div>
        </div>
      );
    }
    const remaining = Math.max(0, SPEAK - elapsed);
    const pct = Math.min(elapsed / SPEAK, 1);
    return (
      <div className="relative min-h-[80vh] flex flex-col">
        <FloatingShapes density="light" />
        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-8 w-full flex-1 flex flex-col">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-coral-deep">{t("drills.thinkfast.name")}</span>
            {prompt?.type && <span className="block mt-1 font-mono text-[10px] uppercase tracking-widest text-charcoal/40">{t(`challenge.${prompt.type}`)}</span>}
            <p className="mt-2 text-charcoal/70 text-balance">{txt}</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="font-display text-[5rem] sm:text-[7rem] font-semibold leading-none tabular-nums" style={{ color: `hsl(var(--${ACCENT}-deep))` }}>
              {formatTime(remaining)}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal/5">
              <span className={`w-2.5 h-2.5 rounded-full ${bandColor} ${rec.status === "recording" ? "animate-pulse-soft" : ""}`} />
              <span className="font-mono text-xs uppercase tracking-widest text-charcoal/60">{liveW
