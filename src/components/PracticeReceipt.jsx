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

  // Safely trigger non-blocking confetti for mobile GPU stability
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
    ?
