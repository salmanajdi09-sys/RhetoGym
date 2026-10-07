import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "rhetogym-lang";

function detectDefault() {
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) return "fr";
  return "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "fr") return saved;
    }
    return detectDefault();
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l) => setLangState(l), []);
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: "en", setLang: () => {} };
  return ctx;
}

export function useT() {
  const { lang } = useLanguage();
  return useCallback(
    (key) => {
      const dict = translations[lang] || translations.en;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );
}
