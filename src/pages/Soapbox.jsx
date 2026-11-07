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
import { completeRoundAndTriggerCounter } from "@/lib/streakStore";
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
  const [phase, setPhase] = useState("topic"); // topic | prompt | warmup | record | receipt | review
  const [category, setCategory] = useState("surprise");
  const [level, setLevel] = useState("any");
  const [prompt, setPrompt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [round, setRound] = useState(null);
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
      const e = Math.floor((Date.now() - start) / 1000);
      setElapsed(e);
      if (e >= TOTAL) finish();
    }, 1000);
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
    completeRoundAndTriggerCounter({ lang });
    rec.stop();
  };

  useEffect(() => {
    if (rec.status === "stopped" && phase === "record") {
      const timer = setTimeout(() => {
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
          category: prompt?.cats?.[0] || "general", 
          difficulty: prompt?.level || "any", 
          promptId: prompt?.id || "prompt", 
          challengeType: prompt?.structure || prompt?.type || "soapbox", 
          targetDuration: TOTAL,
        }));
        setPhase("receipt");
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
      <WarmUpBox
        accent={ACCENT}
        onBack={() => setPhase("prompt")}
        onStart={start}
      />
    );
  }

  if (phase === "record") {
    return (
      <div className="relative min-h-[85vh] flex flex-col px-5 sm:px-8 py-8 max-w-4xl mx-auto justify-between">
        <FloatingShapes density="light" />
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-coral font-medium">
                {t("record.recording")}
              </span>
            </div>
            <div className="font-mono text-sm text-charcoal/60">
              {formatTime(elapsed)} / {formatTime(TOTAL)}
            </div>
          </div>
          <div className="mt-8 rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-8">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("common.yourMotion")}</span>
            <h2 className="font-display text-2xl sm:text-3xl text-charcoal mt-1 text-balance">{txt}</h2>
          </div>
        </div>

        <div className="my-8 rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-8 min-h-[160px] max-h-[220px] overflow-y-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40 block mb-2">{t("record.transcriptLive")}</span>
          <p className="text-charcoal/80 text-lg leading-relaxed font-sans">
            {rec.transcript || <span className="text-charcoal/30 italic">{t("record.startSpeaking")}</span>}
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium text-charcoal flex items-center gap-1.5 ${bandColor}`}>
              <span className="w-2 h-2 rounded-full bg-charcoal/60" />
              {liveWpm} WPM
            </div>
          </div>
          <button
            onClick={finish}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal text-white text-sm font-medium hover:bg-charcoal/90 transition-all shadow-lg"
          >
            <Square className="w-4 h-4 fill-current" /> {t("record.finish")}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "receipt") {
    return (
      <div className="relative min-h-[85vh] px-5 sm:px-8 py-10 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <FloatingShapes density="light" />
        <PracticeReceipt
          round={round}
          metrics={metrics}
          accent={ACCENT}
          onViewReview={() => setPhase("review")}
        />
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="relative min-h-[85vh] px-5 sm:px-8 py-10 max-w-4xl mx-auto">
        <FloatingShapes density="light" />
        <ReviewPanel
          round={round}
          metrics={metrics}
          accent={ACCENT}
          onRetry={retry}
        />
      </div>
    );
  }

  return null;
}
