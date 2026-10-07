import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Waves, Gauge, MessageSquare, Hand } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import CreatorPhoto from "@/components/CreatorPhoto";
import { useT } from "@/lib/i18n";

const principleIcons = [Mic, Waves, MessageSquare];

export default function About() {
  const t = useT();
  const doList = t("about.doList");
  const principles = t("about.principles");

  return (
    <div className="relative">
      <FloatingShapes density="light" />
      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-14">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("about.eyebrow")}</span>
          <h1 className="font-display text-4xl sm:text-6xl text-charcoal mt-2 text-balance">{t("about.title")}</h1>
        </motion.div>

        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8 space-y-5 text-lg text-charcoal/70 leading-relaxed">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
        </motion.div>

        {/* What you can do */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-12 rounded-[2rem] bg-sky/15 border border-sky-deep/20 p-7 sm:p-9 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 blob-a bg-sky/30 blur-2xl" />
          <h2 className="font-display text-2xl sm:text-3xl text-charcoal relative">{t("about.doTitle")}</h2>
          <ul className="mt-5 space-y-3 relative">
            {doList.map((line, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-sm text-charcoal/40 shrink-0 pt-1">0{i + 1}</span>
                <span className="text-charcoal/80">{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Principles */}
        <div className="mt-12 space-y-0">
          {principles.map((p, i) => {
            const Icon = principleIcons[i] || Gauge;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="flex gap-5 border-t border-border/60 py-5">
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-charcoal/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-charcoal/70" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-charcoal">{p.title}</h3>
                  <p className="text-charcoal/60 text-sm mt-0.5">{p.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Creator section */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-14 rounded-[2.5rem] border border-lavender-deep/20 p-8 sm:p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--lavender) / 0.18), hsl(var(--sky) / 0.14), hsl(var(--coral) / 0.14))" }}>
          <div className="absolute -right-12 -top-12 w-56 h-56 blob-b bg-lavender/25 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 blob-c bg-sky/20 blur-3xl" />
          <div className="relative grid sm:grid-cols-2 gap-8 sm:gap-10 items-center">
            {/* Photo */}
            <div className="order-1 sm:order-1">
              <CreatorPhoto />
            </div>
            {/* Name + statement */}
            <div className="order-2 sm:order-2">
              <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("creator.role")}</span>
              <h2 className="font-display text-3xl sm:text-4xl mt-2 text-charcoal">{t("about.creatorName")}</h2>
              <p className="mt-5 leading-relaxed font-display text-lg sm:text-xl text-charcoal/80">
                <span className="text-charcoal/40">"</span>{t("about.creatorBody")}<span className="text-charcoal/40">"</span>
              </p>
            </div>
          </div>
          {/* CTA */}
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link to="/train" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal text-cream font-semibold hover:scale-[1.02] transition-transform">
              {t("about.ctaDrill")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/feedback" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cream/80 border border-border text-charcoal font-medium hover:bg-cream transition-colors">
              <Hand className="w-4 h-4" /> {t("about.ctaFeedback")}
            </Link>
          </div>
        </motion.div>

        <p className="mt-10 text-sm text-charcoal/40">{t("about.note")}</p>
      </div>
    </div>
  );
}
