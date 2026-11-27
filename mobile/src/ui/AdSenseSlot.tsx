import { useEffect, useRef } from "react";
import { useLang } from "~/lib/lang";
import { isNative } from "~/lib/supabase";

/**
 * Anuncio de Google AdSense dentro de la app, SOLO cuando se abre desde el navegador en apostoapp.app
 * (p. ej. instalada en el iPhone desde Safari). En el APK de Android no aparece: las normas de AdSense
 * no permiten anuncios web dentro de apps (WebView). Apagado si faltan los datos de AdSense al compilar.
 */
const CLIENT = String(import.meta.env.VITE_ADSENSE_CLIENT ?? "");
const SLOT = String(import.meta.env.VITE_ADSENSE_SLOT ?? "");
const ENABLED = /^ca-pub-\d{10,20}$/.test(CLIENT) && /^\d{6,12}$/.test(SLOT);

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptAdded = false;
function addScript() {
  if (scriptAdded) return;
  scriptAdded = true;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
}

export function adSenseAllowed(native = isNative, host = typeof location === "undefined" ? "" : location.hostname): boolean {
  return ENABLED && !native && /(^|\.)apostoapp\.app$/.test(host);
}

export function AdSenseSlot() {
  const { t } = useLang();
  const pushed = useRef(false);
  const allowed = adSenseAllowed();
  useEffect(() => {
    if (!allowed || pushed.current) return;
    pushed.current = true;
    addScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* bloqueador de anuncios o sin conexión */
    }
  }, [allowed]);
  if (!allowed) return null;
  return (
    <aside className="my-4" aria-label={t("adLabel")} data-testid="adsense-app">
      <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{t("adLabel")}</p>
      <ins className="adsbygoogle" style={{ display: "block", minHeight: 100 }} data-ad-client={CLIENT} data-ad-slot={SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
