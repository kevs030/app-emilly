"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ADSENSE_CLIENT, ADSENSE_SLOT, adsenseEnabled } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const LABEL = { es: "Publicidad", it: "Pubblicità", en: "Advertisement" } as const;

/** Un anuncio de Google AdSense, etiquetado «Publicidad». No pinta nada si AdSense no está configurado. */
export function AdSense({ lang = "es" }: { lang?: keyof typeof LABEL }) {
  const pushed = useRef(false);
  // La cuenta de administrador no ve anuncios (evita clics propios, que Google castiga). Se comprueba antes de mostrar.
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!adsenseEnabled) return;
    let alive = true;
    const supabase = createClient();
    void supabase.auth
      .getSession()
      .then(async ({ data }) => (data.session ? (await supabase.rpc("is_admin")).data !== true : true))
      .catch(() => true)
      .then((ok) => alive && setShow(ok));
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!show || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* bloqueador de anuncios o sin conexión: no pasa nada */
    }
  }, [show]);
  if (!adsenseEnabled || !show) return null;
  return (
    <aside className="my-6" aria-label={LABEL[lang]} data-testid="adsense">
      <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{LABEL[lang]}</p>
      <Script id="adsbygoogle-js" async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} />
      <ins className="adsbygoogle block min-h-[100px]" style={{ display: "block" }} data-ad-client={ADSENSE_CLIENT} data-ad-slot={ADSENSE_SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
