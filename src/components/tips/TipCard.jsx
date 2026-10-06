import { motion } from "framer-motion";

// Compact pastel card for a single speaking tip.
export default function TipCard({ title, accent = "sky", delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-3xl border border-border/60 bg-${accent}/10 p-6 sm:p-7 h-full`}
    >
      <h3 className="font-display text-2xl text-charcoal mb-3">{title}</h3>
      <div className="space-y-3 text-charcoal/75 leading-relaxed">{children}</div>
    </motion.div>
  );
}
