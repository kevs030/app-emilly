import { useCallback, useSyncExternalStore } from "react";

/**
 * Foto de perfil: se guarda solo en este teléfono (JPEG pequeño, 256 px), por cuenta.
 * No se sube a ningún servidor ni cambia la base de datos.
 */
const key = (userId: string) => `aposto:avatar:${userId}`;
const EVENT = "aposto:avatar";
export const AVATAR_SIZE = 256;

export function loadAvatar(userId: string | undefined): string | null {
  if (!userId) return null;
  try {
    const v = localStorage.getItem(key(userId));
    return v?.startsWith("data:image/") ? v : null;
  } catch {
    return null;
  }
}

export function saveAvatar(userId: string, dataUrl: string | null): boolean {
  try {
    if (dataUrl) localStorage.setItem(key(userId), dataUrl);
    else localStorage.removeItem(key(userId));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

/** La foto actual y una función para cambiarla; se actualiza en todas las pantallas a la vez. */
export function useAvatar(userId: string | undefined) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener(EVENT, cb);
    return () => window.removeEventListener(EVENT, cb);
  }, []);
  const url = useSyncExternalStore(subscribe, () => loadAvatar(userId));
  const set = useCallback((v: string | null) => (userId ? saveAvatar(userId, v) : false), [userId]);
  return [url, set] as const;
}

/** Medidas del recorte: la imagen cubre siempre el círculo; zoom ≥ 1; desplazamiento limitado a los bordes. */
export function cropBox(w: number, h: number, view: number, zoom: number, dx: number, dy: number) {
  const scale = Math.max(view / w, view / h) * zoom;
  const sw = w * scale;
  const sh = h * scale;
  const mx = (sw - view) / 2;
  const my = (sh - view) / 2;
  const x = Math.min(mx, Math.max(-mx, dx));
  const y = Math.min(my, Math.max(-my, dy));
  return { sw, sh, dx: x, dy: y, left: view / 2 + x - sw / 2, top: view / 2 + y - sh / 2 };
}
