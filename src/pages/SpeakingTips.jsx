import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import TipCard from "@/components/tips/TipCard";
import FrameworkCard from "@/components/tips/FrameworkCard";
import { useT } from "@/lib/i18n";

export default function SpeakingTips() {
  const t = useT();

  const beforeCards = t("tips.before.cards");
  const deliveryCards = t("tips.delivery.cards");
  const frameworks = t("tips.structure.frameworks");
  const nervesCards = t("tips.nerves.cards");
  const quickLines = t("tips.quick.lines");
  const accents = ["sky", "lavender", "coral", "sage", "butter", "peach"];

  return (
    <div className="relative">
      <FloatingShapes density="light" />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-12 sm:py-16">
        {/* Intro */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-charcoal/50">{t("tips.eyebrow")}</span>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal mt-2">{t("tips.title")}</h1>
          <p className="mt-4 text-charcoal/65 text-lg leading-relaxed max-w-2xl">{t("tips.intro")}</p>
        </motion.header>

        {/* Before You Press Start */}
        <Section eyebrow={t("tips.before.eyebrow")} title={t("tips.before.title")} intro={t("tips.before.intro")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {beforeCards.map((c, i) => (
              <TipCard key={i} title={c.title} accent={accents[i]} delay={i * 0.08}>
                <p>{c.body}</p>
                <p className="text-sm text-charcoal/55">{c.note}</p>
              </TipCard>
            ))}
          </div>
        </Section>

        {/* Core Delivery */}
        <Section eyebrow={t("tips.delivery.eyebrow")} title={t("tips.delivery.title")} intro={t("tips.delivery.intro")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {deliveryCards.map((c, i) => (
              <TipCard key={i} title={c.title} accent={accents[i + 1]} delay={i * 0.08}>
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("tips.labels.rule")}</span>
                  <p className="mt-1">{c.rule}</p>
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("tips.labels.practice")}</span>
                  <p className="mt-1">{c.practice}</p>
                </div>
                {c.note && <p className="text-sm text-charcoal/55">{c.note}</p>}
              </TipCard>
            ))}
          </div>
        </Section>

        {/* Structure Your Thoughts */}
        <Section eyebrow={t("tips.structure.eyebrow")} title={t("tips.structure.title")} intro={t("tips.structure.intro")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {frameworks.map((f, i) => (
              <FrameworkCard
                key={i}
                name={f.name}
                label={f.label}
                flow={f.flow}
                explanation={f.explanation}
                guidance={f.guidance}
                accent={accents[i + 2]}
                delay={i * 0.08}
              />
            ))}
          </div>
        </Section>

        {/* When You Feel Nervous */}
        <Section eyebrow={t("tips.nerves.eyebrow")} title={t("tips.nerves.title")} intro={t("tips.nerves.intro")}>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
            {nervesCards.map((c, i) => (
              <TipCard key={i} title={c.title} accent={accents[i + 3]} delay={i * 0.08}>
                <p>{c.body}</p>
                <p className="text-sm text-charcoal/55">{c.note}</p>
              </TipCard>
            ))}
          </div>
        </Section>

        {/* Quick Reference */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mt-16 rounded-3xl bg-charcoal text-cream p-7 sm:p-10"
        >
          <h2 className="font-display text-3xl text-cream mb-5">{t("tips.quick.title")}</h2>
          <ul className="space-y-2.5">
            {quickLines.map((line, i) => (
              <li key={i} className="flex items-center gap-3 text-cream/85">
                <span className="w-1.5 h-1.5 rounded-full bg-butter shrink-0" />
                <span className="text-lg">{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 text-center pb-6"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-charcoal mb-6">{t("tips.cta.title")}</h2>
          <Link
            to="/train"
            className="group inline-flex flex-col items-center gap-1 px-8 py-5 rounded-full bg-charcoal text-cream font-semibold text-lg hover:scale-[1.03] transition-transform duration-300 shadow-lg shadow-charcoal/10"
          >
            <span className="inline-flex items-center gap-2">
              {t("tips.cta.button")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-cream/60">{t("tips.cta.buttonSub")}</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ eyebrow, title, intro, children }) {
  return (
    <section className="mb-14">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-charcoal/50">{eyebrow}</span>
      <h2 className="font-display text-3xl sm:text-4xl text-charcoal mt-1.5">{title}</h2>
      <p className="mt-2.5 text-charcoal/60 leading-relaxed max-w-2xl mb-6">{intro}</p>
      {children}
    </section>
  );
}
