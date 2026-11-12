import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { createClient } from "@supabase/supabase-js";

// URL y clave "publishable": son públicas por diseño. La seguridad la imponen las
// políticas RLS de la base de datos. Aquí NUNCA va una clave secreta.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://emuyxcrtkfqizavslwfj.supabase.co";
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_NnRGtuKByH88O_Vnf9M-Dw_muktlw8F";

export const isNative = Capacitor.isNativePlatform();
export const APP_SCHEME = "com.emilly.app";
export const API_URL = import.meta.env.VITE_API_URL || "https://app-emilly.vercel.app";

/**
 * En el teléfono la sesión se guarda cifrada (Keychain en iOS, Keystore en Android).
 * En el navegador (solo desarrollo) se usa el almacenamiento normal.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNative,
    storage: isNative ? SecureStorage : undefined,
  },
});

/** Dirección a la que vuelven los enlaces de los correos (verificación y nueva contraseña). */
export function redirectUrl(path = ""): string {
  return isNative ? `${APP_SCHEME}://auth${path}` : `${window.location.origin}${path}`;
}
