import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { L10n } from "@/content/types";
import { tr } from "@/lib/i18n";
import { CONTENT_LANG, isUiLang, translate, UI_LANGS, type StringKey, type UiLang } from "./strings";

type Ctx = {
  lang: UiLang;
  setLang: (l: UiLang) => void;
  /** texto de la app */
  t: (k: StringKey) => string;
  /** texto del contenido compartido (guías), en el idioma disponible más cercano */
  c: (text: L10n) => string;
  /** true si las guías se muestran en un idioma distinto del elegido */
  contentFallback: boolean;
};
const LangContext = createContext<Ctx | null>(null);

function initial(): UiLang {
  const saved = localStorage.getItem("aposto:lang");
  if (isUiLang(saved)) return saved;
  const nav = navigator.language.slice(0, 2).toLowerCase();
  return isUiLang(nav) ? nav : "es";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>(initial);
  useEffect(() => {
    document.documentElement.lang = lang;
    // El árabe se escribe de derecha a izquierda: el navegador invierte la disposición.
    document.documentElement.dir = UI_LANGS.find((l) => l.code === lang)?.rtl ? "rtl" : "ltr";
  }, [lang]);
  const setLang = useCallback((l: UiLang) => {
    localStorage.setItem("aposto:lang", l);
    setLangState(l);
  }, []);
  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (k) => translate(k, lang), c: (text) => tr(text, CONTENT_LANG[lang]), contentFallback: CONTENT_LANG[lang] !== lang }),
    [lang, setLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang fuera de LangProvider");
  return ctx;
}
