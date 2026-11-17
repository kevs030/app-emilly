import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { isNative } from "./supabase";

/**
 * La situación migratoria (tipo de permiso, caducidad, hijos) se guarda SOLO en este teléfono.
 *
 * Por qué: si el servidor guardara «no tengo permiso» junto a un correo o un número,
 * la base de datos sería una lista de personas en situación irregular. Así, el servidor
 * no puede saberlo aunque se lo pidan o sufra una filtración.
 *
 * En el teléfono va cifrado (Keychain en iOS, Keystore en Android). En el navegador,
 * en el almacenamiento local de ese navegador.
 * El plan, los avisos de caducidad y el asistente lo leen desde aquí.
 */

export type Situation = { permit_type: string | null; permit_expiry: string | null; has_children: boolean | null };
export const SITUATION_KEYS = ["permit_type", "permit_expiry", "has_children"] as const;
export const EMPTY_SITUATION: Situation = { permit_type: null, permit_expiry: null, has_children: null };

const key = (uid: string) => `aposto:situation:${uid}`;

const store = {
  async get(k: string): Promise<string | null> {
    try {
      return isNative ? await SecureStorage.getItem(k) : localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  async set(k: string, v: string): Promise<void> {
    if (isNative) await SecureStorage.setItem(k, v);
    else localStorage.setItem(k, v);
  },
  async remove(k: string): Promise<void> {
    try {
      if (isNative) await SecureStorage.removeItem(k);
      else localStorage.removeItem(k);
    } catch {
      /* nada que borrar */
    }
  },
};

/** Normaliza lo leído: cualquier valor raro se descarta. */
export function parseSituation(raw: string | null): Situation {
  if (!raw) return { ...EMPTY_SITUATION };
  try {
    const o = JSON.parse(raw) as Partial<Situation>;
    return {
      permit_type: typeof o.permit_type === "string" && o.permit_type ? o.permit_type : null,
      permit_expiry: typeof o.permit_expiry === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.permit_expiry) ? o.permit_expiry : null,
      has_children: typeof o.has_children === "boolean" ? o.has_children : null,
    };
  } catch {
    return { ...EMPTY_SITUATION };
  }
}

export const isEmptySituation = (s: Situation) => s.permit_type === null && s.permit_expiry === null && s.has_children === null;

export async function loadSituation(uid: string): Promise<Situation> {
  return parseSituation(await store.get(key(uid)));
}

export async function saveSituation(uid: string, s: Situation): Promise<boolean> {
  try {
    await store.set(key(uid), JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export const clearSituation = (uid: string) => store.remove(key(uid));

/** Separa un cambio de perfil en lo que va al teléfono y lo que va al servidor. */
export function splitPatch<T extends Record<string, unknown>>(patch: T): { local: Partial<Situation>; remote: Omit<T, (typeof SITUATION_KEYS)[number]> } {
  const local: Partial<Situation> = {};
  const remote: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if ((SITUATION_KEYS as readonly string[]).includes(k)) (local as Record<string, unknown>)[k] = v;
    else remote[k] = v;
  }
  return { local, remote: remote as Omit<T, (typeof SITUATION_KEYS)[number]> };
}
