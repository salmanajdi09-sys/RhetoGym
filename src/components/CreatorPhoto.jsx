import { Camera } from "lucide-react";
import { useT } from "@/lib/i18n";

// Elegant organic photo placeholder for the creator section.
// No stock or AI person — a soft pastel frame Salma can swap for her own portrait.
export default function CreatorPhoto() {
  const t = useT();
  return (
    <div className="relative mx-auto w-full max-w-[16rem]">
      <div
        className="relative aspect-[4/5] blob-a overflow-hidden border border-lavender-deep/20"
        style={{ background: "linear-gradient(140deg, hsl(var(--lavender) / 0.30), hsl(var(--sky) / 0.20), hsl(var(--coral) / 0.16))" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-charcoal/40">
          <div className="w-14 h-14 rounded-2xl bg-cream/50 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest">{t("creator.photoLabel")}</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-2 w-20 h-20 blob-b bg-butter/30 blur-xl" />
      <div className="absolute -top-3 -left-3 w-16 h-16 blob-c bg-sky/20 blur-lg" />
    </div>
  );
}
