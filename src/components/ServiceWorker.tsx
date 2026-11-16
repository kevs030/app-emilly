"use client";

import { useEffect } from "react";

/** Registra el Service Worker (página de «sin conexión» e instalación como app). Solo en producción. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // sin Service Worker la web funciona igual
    });
  }, []);
  return null;
}
