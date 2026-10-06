import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

// Rows of simple theater seats — an empty room you're speaking to.
// No people, faces, or silhouettes. Light pastel, gently drifting.
export default function AudienceViz({ energy = 0.5, restless = 0 }) {
  const { lang } = useLanguage();
  const rows = useMemo(
    () => [
      { count: 9, scale: 1, tint: "var(--lavender)" },
      { count: 11, scale: 0.9, tint: "var(--sky)" },
      { count: 13, scale: 0.82, tint: "var(--coral)" },
      { count: 15, scale: 0.74, tint: "var(--butter)" },
    ],
    []
  );

  return (
    <div
      className="relative w-full h-48 sm:h-56 overflow-hidden rounded-2xl border border-border/40"
      style={{ background: "linear-gradient(to bottom, hsl(var(--lavender) / 0.14), hsl(var(--sky) / 0.08))" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 pb-5 pt-8">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="flex justify-center gap-1.5 sm:gap-2"
            style={{ transform: `scale(${row.scale})`, marginBottom: ri < rows.length - 1 ? -3 : 0 }}
          >
            {Array.from({ length: row.count }).map((_, si) => {
              const delay = (ri * row.count + si) * 0.06;
              const lift = energy * 3 - (restless && si % 2 ? 1.5 : 0);
              return (
                <motion.div
                  key={si}
                  className="flex flex-col items-center"
                  animate={{ y: [0, -2 - lift, 0] }}
                  transition={{ duration: 4 + (si % 3), repeat: Infinity, ease: "easeInOut", delay }}
                >
                  {/* backrest */}
                  <div
                    className="rounded-t-[10px] rounded-b-[3px]"
                    style={{ width: 15, height: 16, background: `hsl(${row.tint} / 0.5)` }}
                  />
                  {/* seat base */}
                  <div
                    className="rounded-[4px] -mt-[1px]"
                    style={{ width: 11, height: 5, background: `hsl(${row.tint} / 0.32)` }}
                  />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-charcoal/8 to-transparent" />
      <p className="absolute top-3 left-4 font-mono text-[10px] uppercase tracking-widest text-charcoal/40">
        {lang === "fr" ? "La salle" : "The room"}
      </p>
    </div>
  );
}
