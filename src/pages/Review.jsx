import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import ReviewPanel from "@/components/ReviewPanel";
import SavedRoundCard from "@/components/SavedRoundCard";
import { getSession, getSavedReviews, clearSession } from "@/lib/sessionStore";
import { useT } from "@/lib/i18n";

export default function Review() {
  const t = useT();
  const [session, setSession] = useState(() => getSession());
  const [reviews, setReviews] = useState(() => getSavedReviews());
  useEffect(() => {
    const onSession = () => setSession(getSession());
    const onReviews = () => setReviews(getSavedReviews());
    window.addEventListener("rhetogym:session", onSession);
    window.addEventListener("rhetogym:reviews", onReviews);
    return () => { window.removeEventListener("rhetogym:session", onSession); window.removeEventListener("rhetogym:reviews", onReviews); };
  }, []);
  const unsaved = session && !reviews.some((r) => r.id === session.id);
  return <div className="relative">
    <FloatingShapes density="light" />
    <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-12 sm:py-16">
      <h1 className="font-display text-4xl sm:text-5xl">{t("nav.review")}</h1>
      <p className="mt-4 mb-9 text-sm text-charcoal/60 max-w-xl leading-relaxed">{t("review.storageNote")}</p>
      <div className="space-y-4">{reviews.map((r) => <SavedRoundCard key={r.id} record={r} />)}</div>
      {reviews.length === 0 && <div className="rounded-3xl bg-lavender/20 border border-lavender-deep/15 p-8 sm:p-12 text-center">
        <h2 className="font-display text-3xl">{t("review.history.empty")}</h2>
        <p className="mt-3 text-charcoal/60">{t("review.history.emptyBody")}</p>
        <Link to="/train" className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal text-cream px-6 py-3">{t("review.history.start")}<ArrowRight className="w-4 h-4" /></Link>
      </div>}
      {unsaved && <details className="mt-10 pt-6 border-t border-border/60">
        <summary className="cursor-pointer font-display text-2xl mb-6">{t("review.currentSession")}</summary>
        <ReviewPanel key={session.id || "legacy"} record={session} studio audioUrl={session.audioUrl} transcript={session.transcript} metrics={session.metrics} accent={session.accent || "sky"} motion={session.motion} position={session.position} drillName={session.drillName} />
        <button onClick={() => { clearSession(); setSession(null); }} className="mt-5 text-sm text-charcoal/60">{t("review.history.clear")}</button>
      </details>}
    </div>
  </div>;
}
