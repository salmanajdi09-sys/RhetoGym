import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Check, AlertCircle, ArrowLeft } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { useT } from "@/lib/i18n";

export default function Feedback() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("idle");
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
      const formData = new FormData();
      formData.append("access_key", "ac8fd8f6-c54e-4eb9-b1c9-aee92dcd2124");
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("message", feedback.trim());

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("sent");
      } else {
        setError(data.message || "Couldn't send feedback.");
        setStatus("error");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="relative">
      <FloatingShapes density="light" />
      <div className="relative mx-auto max-w-2xl px-5 sm:px-8 py-14">
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t("feedback.backAbout")}
        </Link>

        {status === "sent" ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-light mb-4">
              <Check className="w-8 h-8 text-sage-deep" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50 block mb-2">
              {t("feedback.sentTag")}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-2 mb-4">
              {t("feedback.thankYou")}
            </h1>
            <p className="text-charcoal/60 mt-3 max-w-md mx-auto">
              {t("feedback.thanksDesc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                to="/train"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal/90 transition-all"
              >
                {t("feedback.back")}
              </Link>
              <button
                onClick={() => {
                  setStatus("idle");
                  setFeedback("");
                  setName("");
                  setEmail("");
                }}
                className="px-6 py-3 rounded-xl border border-charcoal/15 text-charcoal font-medium hover:bg-charcoal/5 transition-all"
              >
                {t("feedback.another")}
              </button>
            </div>
          </motion.div>
        ) : (
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50 block mb-2">
              {t("feedback.tag")}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-charcoal mb-4">
              {t("feedback.title")}
            </h1>
            <p className="text-charcoal/70 text-lg mb-8">
              {t("feedback.desc")}
            </p>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm text-charcoal/70 mb-1.5">
                  {t("feedback.nameLabel")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("feedback.namePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white/60 focus:outline-none focus:border-charcoal/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal/70 mb-1.5">
                  {t("feedback.emailLabel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("feedback.emailPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white/60 focus:outline-none focus:border-charcoal/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal/70 mb-1.5">
                  {t("feedback.msgLabel")}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("feedback.msgPlaceholder")}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white/60 focus:outline-none focus:border-charcoal/40 transition-all"
                />
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-coral/10 text-coral-deep text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-charcoal text-cream font-medium hover:bg-charcoal/90 transition-all disabled:opacity-50"
              >
                {status === "sending" ? (
                  t("feedback.sending")
                ) : (
                  <>
                    <Send className="w-4 h-4" /> {t("feedback.submit")}
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
