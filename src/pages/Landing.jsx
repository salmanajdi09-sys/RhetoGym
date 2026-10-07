import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Mic, Waves } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { LogoMark } from "@/components/Logo";
import { useT, useLanguage } from "@/lib/i18n";

export default function Landing() {
  const t = useT();
  const { lang } = useLanguage();
  const words = t("landing.words");
  const steps = t("landing.steps");

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <FloatingShapes words={words} />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-20 pb-20">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal/5 border border-border/60 mb-8">
                <span className="w-2 h-2 rounded-full bg-sky animate-pulse-soft" />
                <span className="font-mono text-xs uppercase tracking-widest text-charcoal/60">{t("landing.eyebrow")}</span>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="mb-6">
                <LogoMark size={64} />
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}               className="font-display font-semibold tracking-tight text-charcoal text-[16vw] sm:text-[9.5rem] lg:text-[10.5rem] leading-[0.82]">
                RHETO<span className="text-gradient">GYM</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 font-display text-3xl sm:text-5xl text-charcoal text-balance max-w-xl">
                {t("landing.title1")} <span className="text-gradient">{t("landing.title2")}</span>
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-4 max-w-md text-charcoal/60 text-lg text-balance">
                {t("landing.subtitle")}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link to="/train" className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-charcoal text-cream font-semibold text-lg hover:scale-[1.03] transition-transform duration-300 shadow-lg shadow-charcoal/10">
                  {t("landing.cta")} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-card/70 border border-border text-charcoal font-semibold text-lg hover:bg-card transition-colors duration-300">
                  {t("landing.ctaSecondary")}
                </Link>
              </motion.div>
            </div>

            {/* organic visual cluster */}
            <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative h-[26rem]">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} className="absolute w-72 h-72 blob-a bg-sky/30 blur-2xl" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.35 }} className="absolute w-56 h-56 blob-b bg-lavender/40 blur-xl" style={{ top: "12%", right: "8%" }} />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="relative glass-strong rounded-3xl border border-border/60 p-6 w-64 shadow-xl shadow-charcoal/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse-soft" />
                  <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("drills.rebuttal.name")}</span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.span key={i} className="w-1.5 rounded-full bg-charcoal/30" animate={{ height: [6, 6 + Math.abs(Math.sin(i * 0.7)) * 40, 6] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-mono text-charcoal/50">
                  <span>{t("phase.clash")} → {t("phase.counter")} → {t("phase.weigh")}</span>
                  <span>01:00</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* waveform divider */}
          <div className="relative mt-6">
            <div className="mx-auto max-w-3xl flex items-center gap-1 justify-center h-12">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.span key={i} className="w-1 rounded-full bg-charcoal/20" animate={{ height: [6, 6 + Math.abs(Math.sin(i)) * 30, 6] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THREE MODES */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal max-w-xs">{t("landing.modesTitle")}</h2>
            <p className="text-charcoal/50 mt-2 text-sm">{t("landing.modesSub")}</p>
          </div>
          <Link to="/train" className="text-sm font-mono text-charcoal/50 hover:text-charcoal transition-colors shrink-0">→</Link>
        </div>
        <div className="grid md:grid-cols-12 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="md:col-span-7">
            <Link to="/drills/rebuttal-blitz" className="group relative block h-full min-h-[18rem] rounded-[2rem] border border-border/60 bg-sky/20 p-8 sm:p-10 overflow-hidden hover:shadow-xl hover:shadow-charcoal/5 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-12 -bottom-12 w-56 h-56 blob-a bg-sky/40 blur-2xl opacity-70 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-charcoal/40">01</span>
                  <Zap className="w-7 h-7 text-charcoal/50 group-hover:text-charcoal transition-colors" />
                </div>
                <div>
                  <h3 className="font-display text-4xl text-charcoal mt-3">{t("drills.rebuttal.name")}</h3>
                  <p className="text-charcoal/60 mt-2 max-w-xs">{t("drills.rebuttal.desc")}</p>
                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-charcoal/70 group-hover:gap-2 transition-all">
                    {lang === "fr" ? "Entrer" : "Enter"} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <div className="md:col-span-5 grid gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Link to="/soapbox" className="group block rounded-[2rem] border border-border/60 bg-lavender/20 p-7 hover:shadow-xl hover:shadow-charcoal/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm text-charcoal/40">02</span>
                  <Mic className="w-6 h-6 text-charcoal/50 group-hover:text-charcoal transition-colors" />
                </div>
                <h3 className="font-display text-2xl text-charcoal">{t("drills.soapbox.name")}</h3>
                <p className="text-charcoal/60 text-sm mt-1">{t("drills.soapbox.desc")}</p>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.18 }}>
              <Link to="/drills/think-fast" className="group block rounded-[2rem] border border-border/60 bg-coral/20 p-7 hover:shadow-xl hover:shadow-charcoal/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm text-charcoal/40">03</span>
                  <Waves className="w-6 h-6 text-charcoal/50 group-hover:text-charcoal transition-colors" />
                </div>
                <h3 className="font-display text-2xl text-charcoal">{t("drills.thinkfast.name")}</h3>
                <p className="text-charcoal/60 text-sm mt-1">{t("drills.thinkfast.desc")}</p>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <div className="rounded-[2.5rem] bg-charcoal text-cream p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 blob-b bg-sky/30 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 blob-c bg-lavender/25 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl mb-10 max-w-md">{t("landing.howTitle")}</h2>
            <div className="space-y-0">
              {steps.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="flex gap-5 sm:gap-8 border-t border-cream/15 py-5">
                  <span className="font-mono text-xs text-cream/40 w-8 shrink-0 pt-1">0{i + 1}</span>
                  <p className="text-cream/70 text-sm sm:text-base flex-1">{d}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/train" className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-sky text-cream font-semibold text-lg hover:bg-sky-deep transition-colors">
                {t("landing.cta")} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
