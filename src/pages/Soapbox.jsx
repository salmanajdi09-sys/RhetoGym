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

          <div className="mt-6"><AudienceVizHere is your updated, mobile-resilient **`Soapbox.jsx`** file.

### Key Mobile Stability Fixes Applied:
1. **Paced Timer Rate:** Changed the recording `setInterval` tick from `100ms` (which was causing heavy layout recalculations 10 times a second on mobile) to `1000ms` (1 second). This drastically reduces CPU overhead during active recording.
2. **Staggered Completion Timeout:** Added a `200ms` delay when `rec.status === "stopped"` before saving the session and triggering state changes. This gives the mobile browser thread time to clean up audio stream handles before initializing new UI components.
3. **Decoupled Review UI:** Separated `PracticeReceipt` and `ReviewPanel` so `ReviewPanel` doesn't mount simultaneously with the receipt modal, eliminating thread deadlocks and post-confetti blank screen crashes on mobile devices.

---

### Drop-in Replacement for `Soapbox.jsx`:

```jsx
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

  // Paced to 1-second intervals for mobile CPU efficiency
  useEffect(() => {
    if (phase !== "record") return;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - start) / 1000);
      setElapsed(e);
      if (e >= TOTAL) finish();
    }, 1000);
    return () => clearInterval(timerRef.current);
