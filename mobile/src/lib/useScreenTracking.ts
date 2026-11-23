import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./supabase";

/** Ruta sin datos personales: los números (ids de citas, mensajes…) se cambian por «:id». */
export function cleanPath(path: string): string {
  return (path.replace(/\/\d+(?=\/|$)/g, "/:id").replace(/\/+$/, "") || "/").slice(0, 80);
}

/** Registra qué pantalla se abre, solo si la persona aceptó las estadísticas (el servidor lo vuelve a comprobar). */
export function useScreenTracking(enabled: boolean) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!enabled) return;
    void supabase.rpc("log_screen", { p_path: cleanPath(pathname) }).then(() => undefined);
  }, [enabled, pathname]);
}
