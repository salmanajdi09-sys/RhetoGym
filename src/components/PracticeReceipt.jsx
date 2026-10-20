import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { randomCelebration } from "@/data/celebrations";
import { formatTime } from "@/lib/speech";
import { useLanguage, useT } from "@/lib/i18n";

const C = {
  cream: "hsl(42, 40%, 95%)",
  creamDeep: "hsl(40, 32%, 90%)",
  charcoal: "hsl(240, 12%, 13%)",
  sky: "hsl(224, 68%, 58%)",
  skyDeep: "hsl(224, 72%, 46%)",
  lavender: "hsl(262, 64%, 77%)",
  lavenderDeep: "hsl(262, 48%, 45%)",
  coral: "hsl(350, 50%, 68%)",
  coralDeep: "hsl(350, 56%, 56%)",
  butter: "hsl(44, 78%, 74%)",
  sage: "hsl(152, 24%, 66%)",
  sageDeep: "hsl(152, 28%, 54%)",
  brown: "hsl(26, 38%, 40%)",
};

function ReceiptLogo() {
  return (
    <svg width={34} height={34} viewBox="0 0 40 40" fill="none" role="img" aria-label="RhetoGym">
      <defs>
        <linearGradient id="rg-receipt-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={C.skyDeep} />
          <stop offset="1" stopColor={C.lavenderDeep} />
        </linearGradient>
      </defs>
      <path d="M8 6h24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H16l-7 6v-6H8a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z" fill="url(#rg-receipt-grad)" />
      <g fill={C.cream}>
        <rect x="13" y="16" width="2.6" height="8" rx="1.3" />
        <rect x="18.7" y="12" width="2.6" height="12" rx="1.3" />
        <rect x="24.4" y="14" width="2.6" height="8" rx="1.3" />
      </g>
    </svg>
  );
}

function Metric({ label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ border: `1px solid ${C.creamDeep}`, borderRadius: 14, padding: "10px 12px", background: "hsl(42, 44%, 98%)" }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "hsl(240, 8%, 45%)" }}>{label}</div>
      <div style={{ fontSize: 17, fontFamily: "Fraunces, Georgia, serif", color: C.charcoal, marginTop: 2, lineHeight: 1.15, wordBreak: "break-word" }}>{value || "—"}</div>
    </motion.div>
  );
}

export default function PracticeReceipt({ round = {}, onClose }) {
  const t = useT();
  const { lang = "en" } = useLanguage ? useLanguage() : {};
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const celebration = useMemo(() => {
    try {
      return randomCelebration(lang) || "Great Job!";
    } catch {
      return "Great Job!";
    }
  }, [lang]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const colors = [C.lavender, C.sky, C.coral, C.butter, C.sage];
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.5 },
          colors,
          scalar: 0.7,
          ticks: 90,
          disableForReducedMotion: true,
          zIndex: 200,
        });
      } catch (e) {
        console.warn("Confetti skipped on this device:", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const m = round?.metrics || {};
  const topic = round?.motion || round?.prompt || "Practice Round";
  const hasTranscript = Boolean(m?.hasTranscript);

  const dateStr = useMemo(() => {
    try {
      const d = new Date(round?.completedAt || Date.now());
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
    } catch { return "Today"; }
  }, [round?.completedAt, lang]);

  const timeStr = useMemo(() => {
    try {
      const d = new Date(round?.completedAt || Date.now());
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { hour: "numeric", minute: "2-digit" }).format(d);
    } catch { return ""; }
  }, [round?.completedAt, lang]);

  const fillerText = hasTranscript && m?.fillerCount > 0
    ? `${m.fillerCount}`
    : hasTranscript ? (t ? t("receipt.none") : "None") : "—";

  const safeClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;
    setBusy(true); 
    setError("");
    
    try {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: C.cream, 
        scale: isMobile ? 1.2 : 2, 
        useCORS: true, 
        logging: false 
      });
      
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url; 
      a.download = "rhetogym-round.png"; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Capture failed:", err);
      setError("Could not save image on this device.");
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex min-h-full items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={safeClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="relative z-10 w-full max-w-md my-auto max-h-[90vh] overflow-y-auto rounded-[28px] bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={safeClose} aria-label="Close" className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:scale-105 transition-transform shadow-md">
          <X className="w-4 h-4" />
        </button>

        <div ref={cardRef} style={{ background: C.cream, borderRadius: 28, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "relative", padding: "30px 24px 24px" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ReceiptLogo />
                <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, color: C.charcoal }}>
                  RHETO<span style={{ color: C.skyDeep }}>GYM</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 100, background: `hsl(152, 24%, 66%, 0.25)` }}>
                <span style={{ fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", fontWeight: 700, color: C.sageDeep }}>COMPLETE</span>
              </div>
            </div>

            {/* Celebration */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 26, fontWeight: 600, color: C.charcoal, lineHeight: 1.1 }}>{celebration}</div>
            </div>

            {/* Topic */}
            <div style={{ marginTop: 16, borderRadius: 20, padding: "16px", background: `hsl(262, 64%, 77%, 0.28)` }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "hsl(240, 8%, 45%)" }}>Topic</div>
              <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 18, fontWeight: 500, color: C.charcoal, marginTop: 4, lineHeight: 1.25 }}>{topic}</div>
            </div>

            {/* Metrics grid */}
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
              <Metric label="Mode" value={round?.drillName || "Practice"} delay={0.1} />
              <Metric label="Duration" value={formatTime ? formatTime(round?.durationSec || 0) : `${round?.durationSec || 0}s`} delay={0.15} />
              <Metric label="Pace" value={hasTranscript ? `${m?.wpm || 0} WPM` : "—"} delay={0.2} />
              <Metric label="Words" value={hasTranscript ? m?.wordCount : "—"} delay={0.25} />
              <Metric label="Fillers" value={fillerText} delay={0.3} />
              <Metric label="Date" value={dateStr} delay={0.35} />
            </div>

            {/* Footer */}
            <div style={{ marginTop: 18, borderTop: `1.5px dashed ${C.creamDeep}`, paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 12, color: "hsl(240, 8%, 40%)", fontStyle: "italic" }}>Practiced with RhetoGym</span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "hsl(240, 8%, 50%)" }}>{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 pt-0">
          <button onClick={handleSave} disabled={busy} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-charcoal text-cream font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Save Receipt
          </button>
          
          <button onClick={safeClose} className="w-full sm:w-auto px-6 py-3 rounded-full border border-charcoal/20 text-charcoal font-semibold hover:bg-black/5 transition-colors">
            Continue to Review
          </button>
        </div>
        {error && <p className="text-center text-xs text-red-500 pb-3">{error}</p>}
      </motion.div>
    </div>
  );
}
