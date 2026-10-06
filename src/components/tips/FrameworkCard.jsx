import { motion } from "framer-motion";

// Card for a mental structure framework (PREP, time flow, both sides).
export default function FrameworkCard({ name, label, flow, explanation, guidance, accent = "lavender", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-3xl border border-border/60 bg-${accent}/10 p-6 sm:p-7 h-full`}
    >
      <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{label}</span>
      <h3 className="font-display text-2xl text-charcoal mt-1 mb-4">{name}</h3>
      <div className="rounded-2xl bg-charcoal/5 px-4 py-3 mb-4 font-mono text-sm text-charcoal/80 break-words">
        {flow}
      </div>
      <p className="text-charcoal/75 leading-relaxed">{explanation}</p>
      {guidance && <p className="text-sm text-charcoal/55 mt-3">{guidance}</p>}
    </motion.div>
  );
}
