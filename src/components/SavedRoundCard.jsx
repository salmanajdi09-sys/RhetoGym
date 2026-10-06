import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import SavedRoundDetails from "@/components/SavedRoundDetails";
import SavedRoundEditor from "@/components/SavedRoundEditor";
import { deleteReview } from "@/lib/sessionStore";
import { useT, useLanguage } from "@/lib/i18n";

export default function SavedRoundCard({ record }) {
  const t = useT();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const remove = () => { try { deleteReview(record.id); } catch { setError(t("review.saveError")); } };
  return <article className="rounded-3xl border border-border/60 bg-card/75 overflow-hidden">
    <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center gap-4 p-5 sm:p-6 text-left">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2"><span className="font-mono text-xs uppercase tracking-widest text-lavender-deep">{record.drillName}</span><time className="text-xs text-charcoal/50" dateTime={record.completedAt || record.savedAt}>{new Date(record.completedAt || record.savedAt).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div>
        <p className="text-sm text-charcoal/80 truncate">{record.motion || "—"}</p>
      </div>
      <ChevronDown className={`w-5 h-5 shrink-0 text-charcoal/50 ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="px-5 sm:px-6 pb-6 space-y-6">
      <SavedRoundDetails record={record} />
      {editing ? <SavedRoundEditor record={record} onClose={() => setEditing(false)} /> : <button onClick={() => setEditing(true)} className="rounded-full border px-5 py-2.5 text-sm font-medium">{t("review.edit")}</button>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button onClick={remove} className="inline-flex items-center gap-2 text-sm text-charcoal/50 hover:text-destructive"><Trash2 className="w-4 h-4" />{t("review.history.delete")}</button>
    </div>}
  </article>;
}
