import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, AlertCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

// Public Contact page — a single semantic h1, topical content, and a
// working contact form that reuses the existing sendFeedback backend function.
export default function Contact() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(t("feedback.required"));
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await base44.functions.invoke("sendFeedback", {
        name: name.trim(),
        email: email.trim(),
        feedback: message.trim(),
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

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setName("");
    setEmail("");
  };

  return (
    <div className="relative">
      <FloatingShapes density="light" />
      <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("contact.eyebrow")}</span>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-2 text-balance">{t("contact.title")}</h1>
          <div className="mt-5 space-y-4 text-charcoal/70 leading-relaxed">
            <p>{t("contact.intro")}</p>
            <p>{t("contact.p1")}</p>
            <p>{t("contact.p2")}</p>
            <p>{t("contact.p3")}</p>
          </div>
        </motion.div>

        {status === "sent" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 text-center py-10 rounded-3xl border border-border/60 bg-card/70">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sage/25 border border-sage-deep/30 mb-4">
              <Check className="w-7 h-7 text-sage-deep" />
            </div>
            <h2 className="font-display text-3xl text-charcoal">{t("feedback.thankYou")}</h2>
            <p className="text-charcoal/60 mt-2 max-w-md mx-auto">{t("feedback.thankYouBody")}</p>
            <button onClick={reset} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border text-charcoal/70 font-medium hover:text-charcoal">
              {t("feedback.another")}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-5">
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
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={5000} placeholder={t("feedback.bodyPh")} className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 resize-none" />
              <div className="text-right text-xs text-charcoal/40 mt-1">{message.length}/5000</div>
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
        )}
      </div>
    </div>
  );
}
