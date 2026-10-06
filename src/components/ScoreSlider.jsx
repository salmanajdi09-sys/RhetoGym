import { Slider } from "@/components/ui/slider";

// Elegant reflection slider with a label, value, and accent.
export default function ScoreSlider({ label, value, onChange, accent = "coral" }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{label}</span>
        <span className="font-display text-2xl font-semibold" style={{ color: `hsl(var(--${accent}-deep))` }}>
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={1}
        max={5}
        step={1}
        onValueChange={(v) => onChange(v[0])}
        className="w-full"
      />
      <div className="flex justify-between mt-1.5 text-[10px] font-mono text-charcoal/30">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  );
}
