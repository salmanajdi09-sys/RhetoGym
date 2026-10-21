import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCw, Plus, Check, Sparkles, Bookmark, Save, ArrowUpRight } from "lucide-react";
import Waveform from "@/components/Waveform";
import ScoreSlider from "@/components/ScoreSlider";
import { formatTime } from "@/lib/speech";
import { saveReview, getSavedReviews } from "@/lib/sessionStore";
import { useT } from "@/lib/i18n";

function transcriptSegments(text) {
  if (!text) return [];
  let parts = (text.match(/[^.!?]+[.!?]*/g) || []).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) {
    const words = text.split(/\s+/).filter(Boolean);
    parts = [];
    for (let i = 0; i < words.length; i += 10) parts.push(words.slice(i, i + 10).join(" "));
  }
  return parts;
}

export default function ReviewPanel({
  audioUrl,
  transcript,
  metrics,
  accent = "sky",
  motion: motionText,
  position,
  drillName = "Drill",
  onRetry,
  showSelfCheck = true,
  extra,
  studio = false,
  record = null,
}) {
  const t = useT();
  const waveformRef = useRef(null);

  const generateId = () => {
    try {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (e) {}
    return "rev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const [existing] = useState(() => {
    try {
      return record?.id ? getSavedReviews().find((r) => r.id === record.id) : null;
    } catch {
      return null;
    }
  });

  const [reviewId, setReviewId] = useState(existing?.id || record?.id || generateId());
  const [markers, setMarkers] = useState(existing?.notes || []);
  const [activeNote, setActiveNote] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [selfAnswers, setSelfAnswers] = useState(existing?.selfAnswers || [null, null, null]);
  const [scores, setScores] = useState(existing?.scores || { clash: 3, structure: 3, time: 3, variety: 3 });
  const [duration, setDuration] = useState(existing?.duration || metrics?.durationSec || 0);
  const [reflection, setReflection] = useState(existing?.reflection || { well: "", change: "", focus: "" });
  const fingerprint = JSON.stringify({ markers, selfAnswers, scores, reflection });
  const [savedFingerprint, setSavedFingerprint] = useState(existing ? fingerprint : null);
  const [saveError, setSaveError] = useState("");
  const saved = savedFingerprint === fingerprint && !activeNote;

  const checksArr = t("review.checks");
  const selfChecks = Array.isArray(checksArr) ? checksArr : [
    "Did you clearly state your position?",
    "Did you structure your response logically?",
    "Did you maintain a strong pace?"
  ];

  const scorecard = [
    { key: "clash", label: t("review.score.clash") || "Clash", accent: "sky" },
    { key: "structure", label: t("review.score.structure") || "Structure", accent: "lavender" },
    { key: "time", label: t("review.score.time") || "Time", accent: "coral" },
    { key: "variety", label: t("review.score.variety") || "Variety", accent: "sage" },
  ];
  
  const reflections = [
    { key: "well", label: t("review.reflect.well") || "What went well?" },
    { key: "change", label: t("review.reflect.change") || "What would you change?" },
    { key: "focus", label: t("review.reflect.focus") || "Next focus area" },
  ];

  const seekTo = (tm) => { 
    try {
      if (tm != null && waveformRef.current && waveformRef.current.seek) {
        waveformRef.current.seek(tm);
      }
    } catch (e) {} 
  };

  const addMarker = (tm) => {
    const m = { id: Date.now() + Math.random(), time: tm, text: "" };
    setMarkers((prev) => [...prev, m].sort((a, b) => a.time - b.time));
    setActiveNote(m);
    setNoteDraft("");
  };

  const addNoteAtCurrent = () => {
    try {
      const tm = waveformRef.current && waveformRef.current.getTime ? waveformRef.current.getTime() : 0;
      addMarker(tm);
    } catch {
      addMarker(0);
    }
  };

  const saveNote = () => {
    if (!activeNote) return;
    setMarkers((prev) => prev.map((m) => (m.id === activeNote.id ? { ...m, text: noteDraft } : m)));
    setActiveNote(null);
    setNoteDraft("");
  };

  const deleteNote = () => {
    if (!activeNote) return;
    setMarkers((prev) => prev.filter((m) => m.id !== activeNote.id));
    setActiveNote(null);
    setNoteDraft("");
  };

  const handleSaveReview = () => {
    const notes = activeNote ? markers.map((m) => m.id === activeNote.id ? { ...m, text: noteDraft } : m) : markers;
    setSaveError("");
    try {
      const entry = saveReview({
        ...record, id: reviewId, drillName, motion: motionText || "", position: position || "", accent,
        transcript: transcript || "", metrics: metrics || null, notes, reflection, scores, selfAnswers,
        duration, durationSec: metrics?.durationSec || duration,
      });
      setReviewId(entry.id);
      setMarkers(notes);
      setActiveNote(null);
      setSavedFingerprint(JSON.stringify({ markers: notes, selfAnswers, scores, reflection }));
    } catch (err) {
      console.error("Save review failed:", err);
      setSaveError(t("review.saveError") || "Could not save review.");
    }
  };

  const m = metrics || {};
  const segs = transcriptSegments(transcript);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-butter-deep" />
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("review.roundComplete") || "Round Complete"}</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl text-charcoal">{t("review.title") || "Review Your Round"}</h2>
        {motionText && (
          <p className="mt-3 text-charcoal/60">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40 mr-2">{position || ""}</span>
            {motionText}
          </p>
        )}
        {!studio && (
          <Link to="/review" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors">
            {t("review.openStudio") || "Open Studio"} <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </motion.div>

      {extra}

      {/* recording player */}
      <div className="rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("review.yourRecording") || "Your Recording"}</span>
          {audioUrl ? (
            <button onClick={addNoteAtCurrent} disabled={!duration} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-cream text-xs font-medium hover:scale-105 transition-transform disabled:opacity-40">
              <Plus className="w-3.5 h-3.5" /> {t("review.addNote") || "Add Note"}
            </button>
          ) : (
            <button onClick={() => addMarker(null)} className="rounded-full border px-3 py-1.5 text-xs font-medium">{t("review.addPlainNote") || "Add Note"}</button>
          )}
        </div>
        {audioUrl ? (
          <div className="w-full min-h-[80px]">
            <Waveform ref={waveformRef} audioUrl={audioUrl} markers={markers} onAddMarker={addMarker} onSelectMarker={(mk) => { setActiveNote(mk); setNoteDraft(mk.text || ""); }} onDurationChange={setDuration} accent={accent} />
          </div>
        ) : (
          <div className="h-24 sm:h-28 rounded-xl bg-charcoal/5 flex items-center justify-center text-charcoal/40 text-sm text-center px-4">
            {t("review.noAudioBody") || "Audio recording not available for this session."}
          </div>
        )}

        {activeNote && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-2xl bg-butter/20 border border-butter-deep/30">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => seekTo(activeNote.time)} className="font-mono text-sm font-semibold text-charcoal hover:text-coral-deep transition-colors inline-flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" /> {activeNote.time == null ? (t("review.notesLabel") || "Note") : `${t("review.noteAt") || "Note at"} ${formatTime(activeNote.time)}`}
              </button>
              <button onClick={deleteNote} className="text-xs text-charcoal/50 hover:text-coral-deep">{t("review.delete") || "Delete"}</button>
            </div>
            <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="…" rows={2} autoFocus className="w-full rounded-xl border border-border bg-cream/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setActiveNote(null); setNoteDraft(""); }} className="px-3 py-1.5 text-sm text-charcoal/60 hover:text-charcoal">{t("review.cancel") || "Cancel"}</button>
              <button onClick={saveNote} className="px-4 py-1.5 rounded-full bg-charcoal text-cream text-sm font-medium inline-flex items-center gap-1">
                <Check className="w-4 h-4" /> {t("review.saveNote") || "Save Note"}
              </button>
            </div>
          </motion.div>
        )}

        {markers.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40">{t("review.notesLabel") || "Notes"}</span>
            {markers.map((mk) => (
              <button key={mk.id} onClick={() => seekTo(mk.time)} className="w-full text-left flex items-start gap-3 px-4 py-2.5 rounded-2xl bg-butter/15 border border-butter-deep/20 hover:bg-butter/25 transition-colors">
                <span className="font-mono text-sm font-semibold text-charcoal shrink-0 pt-0.5">{mk.time == null ? "—" : formatTime(mk.time)}</span>
                <span className="text-sm text-charcoal/70">{mk.text || <span className="text-charcoal/40 italic">{t("review.untitled") || "Untitled note"}</span>}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={t("review.metrics.pace") || "Pace"} value={m.hasTranscript ? `${m.wpm || 0} WPM` : "—"} sub={m.hasTranscript ? (t("review.metrics.target") || "Target pace") : (t("review.metrics.noTranscript") || "No transcript")} accent="sky" />
        <MetricCard label={t("review.metrics.words") || "Words"} value={m.hasTranscript ? (m.wordCount || 0) : "—"} sub={m.hasTranscript ? (t("review.metrics.spoken") || "Spoken words") : (t("review.metrics.noTranscript") || "No transcript")} accent="lavender" />
        <MetricCard label={t("review.metrics.fillers") || "Fillers"} value={m.hasTranscript ? (m.fillerCount || 0) : "—"} sub={m.hasTranscript && m.fillerList?.length ? m.fillerList.slice(0, 2).map((f) => `${f.word} ×${f.count}`).join(", ") : (t("review.metrics.detected") || "None detected")} accent="butter" />
        <MetricCard label={t("review.metrics.time") || "Duration"} value={formatTime(m.durationSec || duration || 0)} sub={record?.targetDuration ? `/ ${formatTime(record.targetDuration)}` : ""} accent="sage" />
      </div>

      {!m.hasTranscript && (
        <p className="text-sm text-charcoal/50 bg-charcoal/5 rounded-xl px-4 py-3">{t("review.noTranscriptNote") || "Speech recognition transcript was unavailable for this practice round."}</p>
      )}

      {/* transcript */}
      {transcript && (
        <div className="rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-7">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("review.transcript") || "Transcript"}</span>
            {duration > 0 && <span className="text-xs text-charcoal/40">{t("review.transcriptHint") || "Click any sentence to jump"}</span>}
          </div>
          <div className="space-y-1.5">
            {segs.map((s, i) => (
              <button key={i} onClick={() => duration > 0 && seekTo((i / segs.length) * duration)} disabled={!duration} className="block text-left text-charcoal/80 leading-relaxed hover:text-charcoal hover:bg-charcoal/5 rounded-lg px-2 py-0.5 -mx-2 transition-colors disabled:hover:bg-transparent">
                <span className="font-mono text-[10px] text-charcoal/30 mr-2 align-middle">{duration > 0 ? formatTime((i / segs.length) * duration) : "·"}</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* reflection */}
      <div className="rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-7">
        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("review.reflection") || "Reflection"}</span>
        <p className="font-display text-2xl text-charcoal mt-1 mb-5">{t("review.reflectionSub") || "Note your thoughts on this session."}</p>
        <div className="space-y-5">
          {reflections.map((r) => (
            <div key={r.key}>
              <label className="block text-charcoal/80 mb-2">{r.label}</label>
              <textarea value={reflection[r.key] || ""} onChange={(e) => setReflection((p) => ({ ...p, [r.key]: e.target.value }))} placeholder="…" rows={2} className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 resize-none" />
            </div>
          ))}
        </div>
      </div>

      {/* self check */}
      {showSelfCheck && (
        <div className="rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-7">
          <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("review.selfCheck") || "Self-Check"}</span>
          <p className="font-display text-2xl text-charcoal mt-1 mb-5">{t("review.selfCheckSub") || "Evaluate your delivery."}</p>
          <div className="space-y-5">
            {selfChecks.map((q, i) => (
              <div key={i}>
                <p className="text-charcoal/80 mb-2">{q}</p>
                <div className="flex flex-wrap gap-2">
                  {[t("review.yes") || "Yes", t("review.somewhat") || "Somewhat", t("review.notReally") || "Not really"].map((opt) => {
                    const active = selfAnswers[i] === opt;
                    return (
                      <button key={opt} onClick={() => setSelfAnswers((p) => p.map((v, idx) => (idx === i ? opt : v)))} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? "bg-charcoal text-cream" : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* scorecard */}
      <div className="rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-7">
        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{t("review.scorecard") || "Scorecard"}</span>
        <p className="font-display text-2xl text-charcoal mt-1 mb-5">{t("review.scorecardSub") || "Rate your core competencies."}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {scorecard.map((s) => (
            <ScoreSlider key={s.key} label={s.label} value={scores[s.key] || 3} onChange={(v) => setScores((p) => ({ ...p, [s.key]: v }))} accent={s.accent} />
          ))}
        </div>
      </div>

      {/* save + retry */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2 pb-6">
        {saved ? (
          <div className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-sage/30 border border-sage-deep/30 text-sage-deep font-semibold">
            <Check className="w-5 h-5" /> {t("review.saved") || "Saved to Studio"}
          </div>
        ) : (
          <button onClick={handleSaveReview} className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-charcoal text-cream font-semibold text-lg hover:scale-[1.03] transition-transform duration-300 shadow-lg shadow-charcoal/10">
            <Save className="w-5 h-5" /> {t("review.save") || "Save Review"}
          </button>
        )}
        {onRetry && (
          <button onClick={onRetry} className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-sky text-cream font-semibold hover:bg-sky-deep transition-all duration-300">
            <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            {t("review.tryAnother") || "Try Another"}
          </button>
        )}
      </div>

      {saveError && <p role="alert" className="text-center text-sm text-destructive">{saveError}</p>}
      {saved && (
        <p className="text-center text-sm text-charcoal/50 -mt-4 pb-2">
          {t("review.savedBody") || "View all your past sessions in"}{" "}
          <Link to="/review" className="underline hover:text-charcoal">{t("review.openStudio") || "Studio"}</Link>
        </p>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border border-border/60 bg-${accent}/15 p-4`}>
      <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{label}</span>
      <div className="font-display text-3xl text-charcoal mt-1" style={{ color: `hsl(var(--${accent}-deep))` }}>{value}</div>
      <span className="text-xs text-charcoal/50">{sub}</span>
    </motion.div>
  );
}
