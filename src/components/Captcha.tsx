"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Protección contra bots en registro, acceso y recuperación de contraseña (Cloudflare Turnstile).
 * Gratis y sin rastreo publicitario. Supabase comprueba el justificante en el servidor.
 *
 * Apagado hasta configurar NEXT_PUBLIC_TURNSTILE_SITE_KEY (clave pública del sitio). Orden para activarlo:
 * 1) clave en la app y publicar; 2) después, activar CAPTCHA en Supabase. Al revés, nadie podría entrar.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const captchaEnabled = Boolean(SITE_KEY);
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loading: Promise<Turnstile | null> | null = null;
function loadTurnstile(): Promise<Turnstile | null> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve(window.turnstile ?? null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return loading;
}

/** Devuelve el recuadro de verificación, el justificante y cómo pedir uno nuevo tras cada intento. */
export function useCaptcha(lang: string): { node: ReactNode; token: string | undefined; ready: boolean; reset: () => void } {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!captchaEnabled) return;
    let alive = true;
    void loadTurnstile().then((ts) => {
      if (!alive || !ts || !box.current || widget.current) return;
      widget.current = ts.render(box.current, {
        sitekey: SITE_KEY,
        language: lang,
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(undefined),
        "error-callback": () => setToken(undefined),
      });
    });
    return () => {
      alive = false;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [lang]);

  const reset = useCallback(() => {
    if (!captchaEnabled) return;
    setToken(undefined);
    if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
  }, []);

  return { node: captchaEnabled ? <div ref={box} className="flex min-h-[65px] justify-center" /> : null, token, ready: !captchaEnabled || Boolean(token), reset };
}
