import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { L10n, Lang } from "@/content/types";
import { isLang, tr } from "@/lib/i18n";
import { translate, type StringKey } from "./strings";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: StringKey) => string; c: (text: L10n) => string };
const LangContext = createContext<Ctx | null>(null);

function initial(): Lang {
  const saved = localStorage.getItem("emilly:lang");
  if (isLang(saved)) return saved;
  const nav = navigator.language.slice(0, 2).toLowerCase();
  return isLang(nav) ? nav : "es";
}

/** Idioma de la interfaz. `t` traduce textos de la app y `c` textos del contenido compartido. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem("emilly:lang", l);
    setLangState(l);
  }, []);
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (k) => translate(k, lang), c: (text) => tr(text, lang) }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang fuera de LangProvider");
  return ctx;
}
