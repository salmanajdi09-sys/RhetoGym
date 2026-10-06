import { useLanguage, useT } from "@/lib/i18n";
import { levels } from "@/data/prompts";

// Small difficulty badge shown on prompt screens.
export default function LevelBadge({ level, className = "" }) {
  const { lang } = useLanguage();
  const t = useT();
  const meta = levels.find((l) => l.id === level);
  if (!meta) return null;
  const label = t(`level.${meta.id}`);
  const desc = t(`level.${meta.id}Desc`);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${meta.accent}/15 ${className}`}
      style={{ color: `hsl(var(--${meta.accent}-deep))` }}
      title={desc}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-${meta.accent}`} />
      <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">{label}</span>
    </span>
  );
}
