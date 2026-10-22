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
import { completeRoundAndTriggerStreak } from "@/lib/streakStore";
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
      const e = Math.floor((Date.now() - start) / 1000);
      setElapsed(e);
      if (e >= TOTAL) finishRecording();
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

  useEffect(() => {
    if (phase === "prepare" && count === 0) beginRecording();
  }, [phase, count]);

  const finishRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Trigger streak progress update & show speech bubble popup
    completeRoundAndTriggerStreak();
    rec.stop();
  };

  useEffect(() => {
    if (rec.status === "stopped" && phase === "record") {
      const timer = setTimeout(() => {
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
          category: prompt?.cats?.[0] || "general",
          difficulty: prompt?.level || "any",
          promptId: prompt?.id || "prompt",
          challengeType: prompt?.structure || prompt?.type || "rebuttal",
          targetDuration: TOTAL,
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
  const band = paceBand(liveWpm, elapsed >= TOTAL);
  const activePhase = getPhase(elapsed);
  const bandColor = { green: "bg-sage", yellow: "bg-butter", red: "bg-coral" }[band];
  const bandLabel = { green: t("record.pace.green"), yellow: t("record.pace.yellow"), red: t("record.pace.red") }[band];

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
