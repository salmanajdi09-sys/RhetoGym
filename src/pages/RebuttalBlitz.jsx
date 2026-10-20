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

  // recording timer - 1 second ticks for mobile efficiency
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
    rec.stop();
  };

  useEffect(() => {
    if (rec.status === "stopped" && phase === "record") {
      // 200ms stagger prevents main thread deadlocks when mounting receipt modal
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
