import { useT } from "@/lib/i18n";

export default function ReviewNoteFields({ notes, onChange, duration }) {
  const t = useT();
  const update = (id, field, value) => onChange(notes.map((n) => n.id === id ? { ...n, [field]: value } : n));
  return <fieldset className="space-y-3">
    <legend className="font-mono text-xs uppercase tracking-widest mb-3">{t("review.notesLabel")}</legend>
    {notes.map((n) => <div key={n.id} className="rounded-xl bg-butter/15 p-4 space-y-2">
      <label className="block text-xs text-charcoal/60">{t("review.noteTime")}
        <input type="number" min="0" max={duration || undefined} step="0.1" value={n.time ?? ""} onChange={(e) => update(n.id, "time", e.target.value === "" ? null : Number(e.target.value))} className="block mt-1 rounded-lg border bg-card px-3 py-2 w-32" />
      </label>
      <textarea aria-label={t("review.notesLabel")} value={n.text || ""} onChange={(e) => update(n.id, "text", e.target.value)} rows={2} className="w-full rounded-xl border bg-card p-3 text-sm" />
      <button type="button" onClick={() => onChange(notes.filter((x) => x.id !== n.id))} className="text-sm text-destructive">{t("review.delete")}</button>
    </div>)}
    <button type="button" onClick={() => onChange([...notes, { id: crypto.randomUUID(), time: null, text: "" }])} className="rounded-full border px-4 py-2 text-sm">{t("review.addPlainNote")}</button>
  </fieldset>;
}
