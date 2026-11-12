"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const L = {
  es: { install: "Descargar la app", how: "Cómo instalarla", done: "App instalada ✓" },
  en: { install: "Get the app", how: "How to install", done: "App installed ✓" },
  it: { install: "Scarica l'app", how: "Come installarla", done: "App installata ✓" },
};

/**
 * Botón "Descargar la app". En Android y ordenador abre la ventana de instalación del
 * navegador; en iPhone (que no la permite) lleva a las instrucciones paso a paso.
 */
export function InstallButton({ lang, className = "btn" }: { lang: "es" | "en" | "it"; className?: string }) {
  const s = L[lang];
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- estado del navegador, solo disponible tras montar
    if (standalone) setInstalled(true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return <span className="text-sm opacity-80">{s.done}</span>;
  if (evt) {
    return (
      <button
        type="button"
        className={className}
        onClick={async () => {
          await evt.prompt();
          const { outcome } = await evt.userChoice;
          if (outcome === "accepted") setInstalled(true);
          setEvt(null);
        }}
      >
        <Download size={18} aria-hidden /> {s.install}
      </button>
    );
  }
  return (
    <Link href="/instalar" className={className}>
      <Download size={18} aria-hidden /> {s.install}
    </Link>
  );
}
