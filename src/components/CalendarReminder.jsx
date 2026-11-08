import { CalendarPlus, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n";

// Builds a Google Calendar event draft. No date is sent on purpose: the user
// picks their own time inside Google Calendar. No account or API involved.
function calendarUrl(title, details) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, details });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CalendarReminder() {
  const t = useT();
  const href = calendarUrl(t("calendar.eventTitle"), t("calendar.eventDetails"));

  return (
    <section className="rounded-3xl border border-sky-deep/20 bg-sky/10 p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="shrink-0 w-9 h-9 rounded-2xl bg-sky/25 flex items-center justify-center">
          <CalendarPlus className="w-4 h-4 text-sky-deep" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg sm:text-xl text-charcoal leading-snug">{t("calendar.title")}</h3>
          <p className="text-sm text-charcoal/60 mt-1 leading-relaxed">{t("calendar.body")}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-sky-deep/25 text-sm font-semibold text-charcoal hover:bg-sky/20 hover:border-sky-deep/40 transition-colors"
          >
            {t("calendar.cta")}
            <ArrowUpRight className="w-3.5 h-3.5 text-charcoal/40" />
          </a>
        </div>
      </div>
    </section>
  );
}
