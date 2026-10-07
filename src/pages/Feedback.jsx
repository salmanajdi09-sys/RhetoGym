import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Check, AlertCircle, ArrowLeft } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

export default function Feedback() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError(t("feedback.required"));
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
  try {
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: "ac8fd8f6-c54e-4eb9-b1c9-aee92dcd2124",
      name: name.trim(),
      email: email.trim(),
      message: feedback.trim(),
  });
      if (res.data?.ok) {
        setStatus("sent");
      } else {
        setError(res.data?.error || "Couldn't send.");
        setStatus("error");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Network hiccup.");
      setStatus("error");
    }
  };

  return (
    <div className="relative">
      <FloatingShapes density="light" />
      <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-14">
        <Link to="/about" className="inline-flex items-center gap-1.5 text-sm text-charcoal/50 hover:text-charcoal mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("feedback.backAbout")}
        </Link>

        {status === "sent" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage/25 border border-sage-deep/30 mb-6">
              <Check className="w-8 h-8 text-sage-deep" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("feedback.eyebrow")}</span>
            <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-2 text-balance">{t("feedback.thankYou")}</h1>
            <p className="text-charcoal/60 mt-3 max-w-md mx-auto">{t("feedback.thankYouBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/train" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal text-cream font-medium hover:scale-105 transition-transform">
                {t("feedback.back")}
              </Link>
              <button onClick={() => { setStatus("idle"); setFeedback(""); setName(""); setEmail(""); }} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border text-charcoal/70 font-medium hover:text-charcoal">
                {t("feedback.another")}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("feedback.eyebrow")}</span>
            <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-2 text-balance">{t("feedback.title")}</h1>
            <p className="text-charcoal/60 mt-3">{t("feedback.subtitle")}</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-charcoal/70 mb-1.5">{t("feedback.name")} <span className="text-charcoal/40">{t("feedback.nameOpt")}</span></label>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder={t("feedback.namePh")} className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20" />
                </div>
                <div>
                  <label className="block text-sm text-charcoal/70 mb-1.5">{t("feedback.email")} <span className="text-charcoal/40">{t("feedback.nameOpt")}</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} placeholder={t("feedback.emailPh")} className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-charcoal/70 mb-1.5">{t("feedback.body")}</label>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={6} maxLength={5000} placeholder={t("feedback.bodyPh")} className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 resize-none" />
                <div className="text-right text-xs text-charcoal/40 mt-1">{feedback.length}/5000</div>
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-coral/15 border border-coral-deep/30 text-sm text-coral-deep">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={status === "sending"} className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-charcoal text-cream font-semibold text-lg hover:scale-[1.03] transition-transform disabled:opacity-60 disabled:hover:scale-100">
                {status === "sending" ? t("feedback.sending") : (<><Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" /> {t("feedback.send")}</>)}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
