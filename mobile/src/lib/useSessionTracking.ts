import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { supabase } from "./supabase";

const IDLE_MS = 60_000; // sin tocar la pantalla 60 s = inactivo
const TICK_S = 5;
const FLUSH_S = 30;

/**
 * Mide sesiones y TIEMPO ACTIVO, solo si la persona aceptó las estadísticas.
 * - Cuenta un tramo como activo solo si la app está visible y hubo una interacción en los últimos 60 s.
 *   Dejar la app abierta 40 minutos sin tocarla suma, como mucho, 1 minuto.
 * - Solo registra que hubo interacción: nunca qué teclas, qué texto ni qué contenido.
 * - El servidor recorta cualquier valor mayor que el tiempo realmente transcurrido.
 */
export function useSessionTracking(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let sessionId: string | null = null;
    let lastInteraction = Date.now();
    let pending = 0;
    let stopped = false;

    const touch = () => {
      lastInteraction = Date.now();
    };
    const flush = () => {
      if (!sessionId || pending <= 0) return;
      const seconds = pending;
      pending = 0;
      void supabase.rpc("session_heartbeat", { p_session: sessionId, p_active_seconds: seconds }).then(() => undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else touch();
    };

    void supabase.rpc("session_start", { p_platform: Capacitor.getPlatform() }).then(({ data }) => {
      if (!stopped && typeof data === "string") sessionId = data;
    });

    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastInteraction <= IDLE_MS) pending += TICK_S;
      if (pending >= FLUSH_S) flush();
    }, TICK_S * 1000);

    return () => {
      stopped = true;
      flush();
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch, { capture: true }));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);
}
