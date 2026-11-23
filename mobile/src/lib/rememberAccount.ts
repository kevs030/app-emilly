/**
 * Recordar en ESTE teléfono quién usa la app, para no hacer escribirlo todo otra vez:
 * - el correo de la cuenta (al volver a la portada se abre «Entrar» con el correo ya escrito);
 * - un registro a medias (si la app se cierra mientras la persona mira su correo, al volver
 *   aparece directamente la pantalla para escribir el código, no «Crear cuenta» otra vez).
 * Solo se guarda el correo, nunca la contraseña (esa la guarda el gestor de contraseñas del teléfono).
 */
const ACCOUNT = "aposto:account-email";
const PENDING = "aposto:pending-signup";
const PENDING_MAX_MS = 24 * 3_600_000;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: no se recuerda */
  }
}

export function knownEmail(): string | null {
  return read(ACCOUNT);
}
export function rememberEmail(email: string | null | undefined) {
  if (email) write(ACCOUNT, email.trim().toLowerCase());
}

export function pendingSignup(now = Date.now()): string | null {
  try {
    const p = JSON.parse(read(PENDING) ?? "null") as { email?: string; at?: number } | null;
    if (p?.email && typeof p.at === "number" && now - p.at < PENDING_MAX_MS) return p.email;
  } catch {
    /* dato ilegible */
  }
  return null;
}
export function setPendingSignup(email: string, now = Date.now()) {
  write(PENDING, JSON.stringify({ email: email.trim(), at: now }));
}
export function clearPendingSignup() {
  write(PENDING, null);
}
