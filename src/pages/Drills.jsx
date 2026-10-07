import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Waves, BrainCircuit } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { useT } from "@/lib/i18n";

const drills = [
  { to: "/drills/rebuttal-blitz", nameKey: "drills.rebuttal.name", descKey: "drills.rebuttal.desc", icon: Zap, accent: "sky", num: "01" },
  { to: "/soapbox", nameKey: "drills.soapbox.name", descKey: "drills.soapbox.desc", icon: Waves, accent: "lavender", num: "02" },
  { to: "/drills/think-fast", nameKey: "drills.thinkfast.name", descKey: "drills.thinkfast.desc", icon: BrainCircuit, accent: "coral", num: "03" },
];

export default function Drills() {
  const t = useT();
  return (
    <div className="relative">
      <FloatingShapes density="light" />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="font-mono text-xs uppercase tracking-widest text-sky-deep">{t("train.title")}</span>
          <h1 className="font-display text-4xl sm:text-6xl text-charcoal mt-2 text-balance">{t("train.subtitle")}</h1>
        </motion.div>

        <div className="mt-10 space-y-4">
          {drills.map((d, i) => (
            <motion.div
              key={d.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                to={d.to}
                className="group block rounded-[2rem] border border-border/60 bg-card/70 p-6 sm:p-8 hover:border-charcoal/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-5">
                  <div className={`shrink-0 w-14 h-14 rounded-2xl bg-${d.accent}/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <d.icon className="w-7 h-7" style={{ color: `hsl(var(--${d.accent}-deep))` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-charcoal/30">{d.num}</span>
                      <h2 className="font-display text-2xl sm:text-3xl text-charcoal">{t(d.nameKey)}</h2>
                    </div>
                    <p className="text-charcoal/60 mt-1">{t(d.descKey)}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/review" className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors">
            {t("train.reviewLink")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
