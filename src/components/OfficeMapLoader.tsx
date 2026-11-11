"use client";

import dynamic from "next/dynamic";

// Leaflet usa `window`, así que solo se carga en el navegador.
const OfficeMap = dynamic(() => import("./OfficeMap"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-xl bg-card" /> });

export function OfficeMapLoader({ lang }: { lang: "es" | "en" | "it" }) {
  return <OfficeMap lang={lang} />;
}
