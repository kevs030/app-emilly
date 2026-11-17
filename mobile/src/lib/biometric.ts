import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { isNative } from "./supabase";

/**
 * Entrar con huella (o Face ID) en el teléfono.
 *
 * Cómo funciona: al iniciar sesión, la sesión de Supabase ya se guarda cifrada en el
 * teléfono (Keychain / Keystore). Con la huella activada, la app queda bloqueada al
 * abrirse y solo muestra la cuenta tras confirmar la huella del sistema.
 * No se guarda ninguna contraseña ni ningún dato de la huella: eso lo gestiona el teléfono.
 */

const key = (uid: string) => `aposto:bio:${uid}`;
const askedKey = (uid: string) => `aposto:bio-asked:${uid}`;

function read(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function write(k: string, v: string | null) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* sin almacenamiento: la opción simplemente no se recuerda */
  }
}

/** ¿El teléfono tiene huella o Face ID configurados? En el navegador, siempre no. */
export async function biometricAvailable(): Promise<boolean> {
  if (!isNative) return false;
  try {
    return (await BiometricAuth.checkBiometry()).isAvailable;
  } catch {
    return false;
  }
}

export const biometricEnabled = (uid: string | undefined) => Boolean(uid && read(key(uid)) === "1");
export const biometricAsked = (uid: string | undefined) => Boolean(uid && read(askedKey(uid)) === "1");

export function setBiometricEnabled(uid: string, on: boolean) {
  write(key(uid), on ? "1" : null);
  write(askedKey(uid), "1");
}
export const markBiometricAsked = (uid: string) => write(askedKey(uid), "1");

export type UnlockResult = "ok" | "cancel" | "error";

/** Muestra el diálogo del sistema. Permite usar el PIN del teléfono si la huella falla. */
export async function biometricUnlock(texts: { reason: string; cancel: string; title: string }): Promise<UnlockResult> {
  try {
    await BiometricAuth.authenticate({ reason: texts.reason, cancelTitle: texts.cancel, androidTitle: texts.title, androidSubtitle: texts.reason, allowDeviceCredential: true, androidConfirmationRequired: false });
    return "ok";
  } catch (e) {
    const code = (e as { code?: string }).code;
    return code === "userCancel" || code === "appCancel" || code === "systemCancel" ? "cancel" : "error";
  }
}

/** Minutos en segundo plano tras los que se vuelve a pedir la huella. */
export const RELOCK_AFTER_MS = 2 * 60 * 1000;

/** Decide si hay que bloquear: al abrir la app, o al volver tras un rato en segundo plano. */
export function shouldLock(opts: { enabled: boolean; unlockedAt: number | null; backgroundSince: number | null; now: number }): boolean {
  if (!opts.enabled) return false;
  if (opts.unlockedAt === null) return true;
  return opts.backgroundSince !== null && opts.now - opts.backgroundSince >= RELOCK_AFTER_MS;
}
