import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { randomCelebration } from "@/data/celebrations";
import { formatTime } from "@/lib/speech";
import { useLanguage, useT } from "@/lib/i18n";

// Explicit palette (no CSS vars) so html2canvas captures the receipt faithfully.
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
      <div style={{ fontSize: 17, fontFamily: "Fraunces, Georgia, serif", color: C.charcoal, marginTop: 2, lineHeight: 1.15, wordBreak: "break-word" }}>{value}</div>
    </motion.div>
  );
}

export default function PracticeReceipt({ round, onClose }) {
  const t = useT();
  const { lang } = useLanguage();
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const celebration = useMemo(() => randomCelebration(lang), [lang]);

  useEffect(() => {
    const colors = [C.lavender, C.sky, C.coral, C.butter, C.sage];
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors, scalar: 0.8, ticks: 160, disableForReducedMotion: true, zIndex: 200 });
    const id = setTimeout(() => confetti({ particleCount: 30, spread: 50, origin: { y: 0.45 }, colors, scalar: 0.65, ticks: 120, disableForReducedMotion: true, zIndex: 200 }), 200);
    return () => clearTimeout(id);
  }, []);

  const m = round?.metrics || {};
  const topic = round?.motion || "";
  const position = round?.position || "";
  const showPosition = position && !["DELIVER", "SPEAK"].includes(position);
  const hasTranscript = m.hasTranscript;

  const dateStr = useMemo(() => {
    try {
      const d = new Date(round?.completedAt || Date.now());
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
    } catch { return ""; }
  }, [round?.completedAt, lang]);

  const timeStr = useMemo(() => {
    try {
      const d = new Date(round?.completedAt || Date.now());
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { hour: "numeric", minute: "2-digit" }).format(d);
    } catch { return ""; }
  }, [round?.completedAt, lang]);

  const reflectionText = useMemo(() => {
    const r = round?.reflection;
    if (!r) return "";
    return [r.well, r.change, r.focus].filter(Boolean).join(" ");
  }, [round?.reflection]);

  const fillerText = hasTranscript && m.fillerCount > 0
    ? `${m.fillerCount} (${(m.fillerList || []).slice(0, 2).map((f) => f.word).join(", ")})`
    : hasTranscript ? t("receipt.none") : "—";

  const capture = async () => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, { backgroundColor: C.cream, scale: 2, useCORS: true, logging: false });
  };

  const handleSave = async () => {
    setBusy(true); setError("");
    try {
      const canvas = await capture();
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url; a.download = "rhetogym-round.png"; a.click();
    } catch {
      setError(t("receipt.saveError"));
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="relative z-10 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label={t("receipt.close")} className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:scale-105 transition-transform shadow-md">
          <X className="w-4 h-4" />
        </button>

        {/* The receipt card — captured for save */}
        <div ref={cardRef} style={{ background: C.cream, borderRadius: 28, overflow: "hidden", position: "relative" }}>
          {/* decorative blobs */}
          <div style={{ position: "absolute", top: -40, left: -30, width: 150, height: 150, borderRadius: "42% 58% 67% 33% / 42% 48% 52% 58%", background: C.lavender, opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: -50, right: -20, width: 160, height: 160, borderRadius: "63% 37% 38% 62% / 61% 35% 65% 39%", background: C.coral, opacity: 0.3 }} />
          <div style={{ position: "absolute", top: 80, right: -30, width: 90, height: 90, borderRadius: "50%", background: C.butter, opacity: 0.45 }} />

          <div style={{ position: "relative", padding: "30px 26px 24px" }}>
            {/* logo + wordmark + complete badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ReceiptLogo />
                <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, color: C.charcoal, letterSpacing: "-0.02em" }}>
                  RHETO<span style={{ color: C.skyDeep }}>GYM</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 100, background: `hsl(152, 24%, 66%, 0.25)`, border: `1px solid hsl(152, 28%, 54%, 0.3)` }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.5L5 9L9.5 3.5" stroke={C.sageDeep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", fontWeight: 700, color: C.sageDeep }}>{t("receipt.eyebrow")}</span>
              </div>
            </div>

            {/* celebration */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 30, fontWeight: 600, color: C.charcoal, lineHeight: 1.1 }}>{celebration}</div>
            </div>

            {/* topic — the visual star */}
            <div style={{ marginTop: 18, borderRadius: 20, padding: "18px 18px", background: `hsl(262, 64%, 77%, 0.28)`, border: `1px solid hsl(262, 48%, 45%, 0.18)` }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "hsl(240, 8%, 45%)" }}>{t("receipt.topicLabel")}</div>
              <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 500, color: C.charcoal, marginTop: 6, lineHeight: 1.25 }}>{topic}</div>
            </div>

            {/* position */}
            {showPosition && (
              <div style={{ marginTop: 12, fontSize: 14, color: "hsl(240, 8%, 40%)", display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("receipt.position")}</span>
                <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 18, color: C.charcoal }}>{position}</span>
              </div>
            )}

            {/* metrics grid — responsive auto-fit */}
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
              <Metric label={t("receipt.mode")} value={round?.drillName || "—"} delay={0.15} />
              <Metric label={t("receipt.duration")} value={formatTime(round?.durationSec || 0)} delay={0.2} />
              <Metric label={t("receipt.pace")} value={hasTranscript ? `${m.wpm} WPM` : "—"} delay={0.25} />
              <Metric label={t("receipt.words")} value={hasTranscript ? m.wordCount : "—"} delay={0.3} />
              <Metric label={t("receipt.fillers")} value={fillerText} delay={0.35} />
              <Metric label={t("receipt.date")} value={dateStr} delay={0.4} />
            </div>

            {/* reflection (only if entered) */}
            {reflectionText && (
              <div style={{ marginTop: 14, borderRadius: 16, padding: "12px 14px", background: "hsl(44, 78%, 74%, 0.22)", border: `1px solid hsl(42, 76%, 60%, 0.25)` }}>
                <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "hsl(240, 8%, 45%)" }}>{t("receipt.reflection")}</div>
                <div style={{ fontSize: 13, color: C.charcoal, marginTop: 4, lineHeight: 1.4 }}>{reflectionText}</div>
              </div>
            )}

            {/* divider + branding */}
            <div style={{ marginTop: 20, borderTop: `1.5px dashed ${C.creamDeep}`, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 13, color: "hsl(240, 8%, 40%)", fontStyle: "italic" }}>{t("receipt.practicedWith")}</span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "hsl(240, 8%, 50%)" }}>{timeStr}</span>
            </div>
          </div>
        </div>

        {/* actions (not captured) */}
        <div className="flex items-center justify-center mt-5">
          <button onClick={handleSave} disabled={busy} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-charcoal text-cream font-semibold hover:scale-[1.03] transition-transform disabled:opacity-50 shadow-lg shadow-charcoal/10">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {t("receipt.save")}
          </button>
        </div>
        {error && <p className="text-center text-sm text-destructive mt-3">{error}</p>}
      </motion.div>
    </div>
  );
}
