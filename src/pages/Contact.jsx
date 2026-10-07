import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, AlertCircle } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please write a message before sending.");
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
      formData.append("message", message.trim());

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("sent");
      } else {
        setError(data.message || "Couldn't send message.");
        setStatus("error");
      }
    } catch (err) {
      setError("Network error. Please try again.");
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50 block mb-2">
            Get in Touch
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal mb-4">
            Contact Us
          </h1>
          <div className="mt-5 space-y-4 text-charcoal/70 leading-relaxed">
            <p>Have questions, ideas, or feedback about RhetoGym?</p>
            <p>
              Send us a message using the form below and we will get back to you as soon as possible.
            </p>
          </div>
        </motion.div>

        {status === "sent" ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 mt-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-light mb-4">
              <Check className="w-8 h-8 text-sage-deep" />
            </div>
            <h2 className="font-display text-3xl text-charcoal mb-2">
              Message Sent!
            </h2>
            <p className="text-charcoal/60 mt-2 max-w-md mx-auto">
              Thank you for reaching out. We have received your message.
            </p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-charcoal/15 text-charcoal font-medium hover:bg-charcoal/5 transition-all"
            >
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-charcoal/70 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white/60 focus:outline-none focus:border-charcoal/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal/70 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white/60 focus:outline-none focus:border-charcoal/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-charcoal/70 mb-1.5">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
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
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
