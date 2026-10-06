import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage, useT } from "@/lib/i18n";
import { LogoMark } from "@/components/Logo";

const navItems = [
  { labelKey: "nav.home", to: "/" },
  { labelKey: "nav.train", to: "/train" },
  { labelKey: "nav.tips", to: "/tips" },
  { labelKey: "nav.review", to: "/review" },
  { labelKey: "nav.about", to: "/about" },
  { labelKey: "nav.contact", to: "/contact" },
];

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="inline-flex items-center rounded-full bg-charcoal/5 p-0.5 text-xs font-mono font-semibold">
      {["en", "fr"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`relative px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${
            lang === l ? "text-cream" : "text-charcoal/50 hover:text-charcoal"
          }`}
        >
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 rounded-full bg-charcoal"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const t = useT();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <nav className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2 shrink-0" aria-label="RhetoGym home">
            <LogoMark size={30} className="transition-transform group-hover:scale-105" />
            <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-charcoal leading-none">
              RHETO<span className="text-gradient">GYM</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2.5 lg:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-charcoal text-cream"
                      : "text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
          </div>
        </nav>
        {/* mobile nav */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-charcoal/5"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-border/60 py-8 px-5 sm:px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-charcoal/50">
          <span className="font-display text-lg text-charcoal/80">RHETO<span className="text-gradient">GYM</span></span>
          <FooterTag />
        </div>
      </footer>
    </div>
  );
}

function FooterTag() {
  const { lang } = useLanguage();
  return (
    <span>{lang === "fr" ? "Un terrain d'entraînement sans pression pour penser à voix haute." : "A low-stakes training ground for thinking out loud."}</span>
  );
}
