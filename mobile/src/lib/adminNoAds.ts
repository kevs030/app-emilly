import { useEffect, useState } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { supabase } from "~/lib/supabase";

/**
 * La cuenta de administrador no ve anuncios (ni de Google ni patrocinadores propios), para no hacer
 * clics propios por error: Google los considera inválidos y puede cerrar la cuenta de AdSense.
 * Mientras se comprueba, se ocultan; sin sesión se muestran enseguida.
 */
const cache = new Map<string, boolean>();

export function useHideAds(): boolean {
  const { user } = useAuth();
  const id = user?.id ?? "";
  const [admin, setAdmin] = useState<boolean | undefined>(() => (id ? cache.get(id) : false));
  useEffect(() => {
    if (!id) return setAdmin(false);
    if (cache.has(id)) return setAdmin(cache.get(id));
    setAdmin(undefined);
    let alive = true;
    void Promise.resolve(supabase.rpc("is_admin"))
      .then(({ data, error }) => (error ? false : data === true))
      .catch(() => false)
      .then((isAdmin) => {
        cache.set(id, isAdmin);
        if (alive) setAdmin(isAdmin);
      });
    return () => {
      alive = false;
    };
  }, [id]);
  return admin !== false;
}
