import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Square, RotateCcw, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import Countdown from "@/components/Countdown";
import PhaseBar, { getPhase } from "@/components/PhaseBar";
import ReviewPanel from "@/components/ReviewPanel";
import WarmUpBox from "@/components/WarmUpBox";
import PracticeReceipt from "@/components/PracticeReceipt";
import TopicSelect from "@/components/TopicSelect";
import LevelBadge from "@/components/LevelBadge";
import { completeRoundAndTriggerCounter } from "@/lib/streakStore";
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
  const [phase, setPhase] = useState("topic");
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

  useEffect(() => {
    if (phase !== "prepare") return;
    if (count <= 0) { setPhase("record"); return; }
    const tm = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(tm);
  }, [phase, count]);

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
    completeRoundAndTriggerCounter({ lang });
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
          prompt
