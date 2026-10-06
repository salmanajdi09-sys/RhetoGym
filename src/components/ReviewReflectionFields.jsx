import { useT } from "@/lib/i18n";

export default function ReviewReflectionFields({ reflection, onChange, selfAnswers }) {
  const t = useT();
  return <div className="space-y-4">
    {["well", "change", "focus"].map((key) => <label key={key} className="block text-sm text-charcoal/80">
      {t(`review.reflect.${key}`)}
      <textarea value={reflection[key] || ""} onChange={(e) => onChange({ ...reflection, [key]: e.target.value })} rows={2} className="mt-2 w-full rounded-xl border bg-card p-3" />
    </label>)}
    {selfAnswers}
  </div>;
}
