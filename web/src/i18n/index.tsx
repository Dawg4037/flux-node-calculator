import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setFormatLanguage } from "../format.ts";
import { de } from "./de.tsx";
import { en, type Messages } from "./en.tsx";
import { es } from "./es.tsx";
import { pt } from "./pt.tsx";

export const LANGS = ["en", "pt", "es", "de"] as const;
export type Lang = (typeof LANGS)[number];

/** Shown in the selector in each language's own name, so anyone can find theirs. */
export const LANG_NAME: Record<Lang, string> = {
  en: "English",
  pt: "Português (Brasil)",
  es: "Español",
  de: "Deutsch",
};

const CATALOG: Record<Lang, Messages> = { en, pt, es, de };

/** Locale for numbers and dates when the browser's own locale is a different language. */
const DEFAULT_LOCALE: Record<Lang, string> = { en: "en-US", pt: "pt-BR", es: "es-ES", de: "de-DE" };

const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

const browserLocales = (): readonly string[] => {
  try {
    return navigator.languages?.length ? navigator.languages : [navigator.language];
  } catch {
    return [];
  }
};

/** Saved choice, else the first browser language we support, else English. */
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (isLang(saved)) return saved;
  } catch {
    // Storage unavailable: fall through to the browser's languages.
  }
  for (const l of browserLocales()) {
    const base = l.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}

/**
 * Numbers and dates follow the visitor's own regional format when it matches the chosen
 * language (en-GB stays en-GB), otherwise the language's main region.
 */
export function localeFor(lang: Lang): string {
  const own = browserLocales().find((l) => l.toLowerCase().split("-")[0] === lang);
  return own ?? DEFAULT_LOCALE[lang];
}

interface LangContextValue {
  lang: Lang;
  t: Messages;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue>({ lang: "en", t: en, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  // Only an explicit choice is remembered, so a detected language keeps following the browser.
  const setLang = (l: Lang) => {
    try {
      localStorage.setItem("lang", l);
    } catch {
      // Storage unavailable: the choice lasts for this visit only.
    }
    setLangState(l);
  };
  const t = CATALOG[lang];

  // Set during render so every formatter below uses the new language in this same pass.
  setFormatLanguage(localeFor(lang), t.fmt);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, t, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useT = () => useContext(LangContext).t;
export type { Messages };
