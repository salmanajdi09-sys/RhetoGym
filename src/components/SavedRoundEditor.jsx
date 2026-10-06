import { useState } from "react";
import ScoreSlider from "@/components/ScoreSlider";
import ReviewNoteFields from "@/components/ReviewNoteFields";
import ReviewReflectionFields from "@/components/ReviewReflectionFields";
import { saveReview } from "@/lib/sessionStore";
import { useT } from "@/lib/i18n";

export default function SavedRoundEditor({ record, onClose }) {
  const t = useT();
  const [draft, setDraft] = useState(() => ({ ...record, notes: (record.notes || []).map((n) => ({ ...n, id: n.id || crypto.randomUUID() })), scores: { clash: 3, structure: 3, time: 3, variety: 3, ...record.scores }, reflection: record.reflection || {}, selfAnswers: record.selfAnswers || [] }));
  const [error, setError] = useState("");
  const change = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const submit = (e) => {
    e.preventDefault();
    try { saveReview(draft); onClose(); } catch { setError(t("review.saveError")); }
  };
  return <form onSubmit={submit} className="space-y-6 rounded-2xl border border-lavender-deep/20 bg-lavender/15 p-5">
    <h3 className="font-display text-2xl">{t("review.edit")}</h3>
    <div className="grid sm:grid-cols-2 gap-3">{["clash", "structure", "time", "variety"].map((k) => <ScoreSlider key={k} label={t(`review.score.${k}`)} value={draft.scores[k] ?? 3} onChange={(v) => change("scores", { ...draft.scores, [k]: v })} accent="lavender" />)}</div>
    <ReviewReflectionFields reflection={draft.reflection} onChange={(v) => change("reflection", v)} />
    {draft.selfAnswers.length > 0 && <fieldset className="space-y-3"><legend>{t("review.selfCheck")}</legend>{t("review.checks").map((q, i) => <label key={q} className="block text-sm">{q}<select value={draft.selfAnswers[i] || ""} onChange={(e) => change("selfAnswers", draft.selfAnswers.map((v, j) => i === j ? e.target.value : v))} className="block mt-2 border rounded-lg bg-card p-2"><option value="">—</option>{[t("review.yes"), t("review.somewhat"), t("review.notReally")].map((v) => <option key={v}>{v}</option>)}</select></label>)}</fieldset>}
    <ReviewNoteFields notes={draft.notes} onChange={(v) => change("notes", v)} duration={record.durationSec || record.metrics?.durationSec || record.duration} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-3"><button type="submit" className="rounded-full bg-charcoal text-cream px-5 py-2.5">{t("review.save")}</button><button type="button" onClick={onClose} className="rounded-full border px-5 py-2.5">{t("review.cancel")}</button></div>
  </form>;
}
