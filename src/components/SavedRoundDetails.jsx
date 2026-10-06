import { useT, useLanguage } from "@/lib/i18n";
import { formatTime } from "@/lib/speech";
import { categories, categoryLabel, levelLabel } from "@/data/prompts";

export default function SavedRoundDetails({ record: r }) {
  const t = useT();
  const { lang } = useLanguage();
  const cat = categories.find((c) => c.id === r.category);
  return <div className="space-y-5">
    <p className="font-display text-2xl leading-snug">{r.motion || "—"}</p>
    <p className="text-sm text-charcoal/60">{[r.position, cat ? categoryLabel(cat, lang) : null, levelLabel(r.difficulty, lang), r.challengeType ? t(`challenge.${r.challengeType}`) : null].filter(Boolean).join(" · ")}</p>
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-charcoal/70">
      <span>{t("review.metrics.time")}: {formatTime(r.durationSec || r.metrics?.durationSec || r.duration || 0)}</span>
      {r.metrics?.hasTranscript && <><span>{t("review.metrics.pace")}: {r.metrics.wpm} WPM</span><span>{t("review.metrics.words")}: {r.metrics.wordCount}</span><span>{t("review.metrics.fillers")}: {r.metrics.fillerCount}</span></>}
    </div>
    {r.metrics?.fillerList?.length > 0 && <p className="text-sm text-charcoal/60">{r.metrics.fillerList.map((f) => `${f.word} ×${f.count}`).join(", ")}</p>}
    {r.transcript && <section><h3 className="font-mono text-xs uppercase tracking-widest mb-2">{t("review.transcript")}</h3><p className="text-sm leading-relaxed whitespace-pre-wrap text-charcoal/80">{r.transcript}</p></section>}
    <div className="flex flex-wrap gap-2">{Object.entries(r.scores || {}).map(([k, v]) => <span key={k} className="rounded-full bg-lavender/25 px-3 py-1 text-xs">{t(`review.score.${k}`)}: {v}/5</span>)}</div>
    {r.notes?.length > 0 && <section><h3 className="font-mono text-xs uppercase tracking-widest mb-2">{t("review.notesLabel")}</h3><div className="space-y-2">{r.notes.map((n, i) => <p key={n.id || i} className="flex gap-3 text-sm"><span className="font-mono shrink-0 text-charcoal/50">{n.time == null ? "—" : formatTime(n.time)}</span><span className="whitespace-pre-wrap">{n.text || t("review.untitled")}</span></p>)}</div></section>}
    <div className="space-y-3">{["well", "change", "focus"].map((k) => r.reflection?.[k] && <div key={k} className="rounded-xl bg-charcoal/5 p-4"><h3 className="text-xs text-charcoal/60">{t(`review.reflect.${k}`)}</h3><p className="text-sm mt-1 whitespace-pre-wrap">{r.reflection[k]}</p></div>)}</div>
    {r.selfAnswers?.some(Boolean) && <div className="space-y-2 text-sm text-charcoal/60">{r.selfAnswers.map((answer, i) => answer && <p key={i}>{t("review.checks")[i]} — {answer}</p>)}</div>}
    <p className="text-xs text-charcoal/50">{t("review.history.noAudio")}</p>
  </div>;
}
