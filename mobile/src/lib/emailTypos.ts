/**
 * Detecta errores típicos al escribir el dominio del correo (gmial.com, hotmal.com, gmail.con…).
 * Solo sugiere: la persona decide si corrige. No se envía nada a ningún servidor.
 */
const DOMAINS = ["gmail.com", "hotmail.com", "hotmail.it", "outlook.com", "outlook.it", "yahoo.com", "yahoo.it", "libero.it", "icloud.com", "live.com", "virgilio.it", "tiscali.it", "alice.it", "proton.me"];

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Devuelve el correo corregido si el dominio se parece mucho a uno común; si no, null. */
export function suggestEmail(email: string): string | null {
  const at = email.trim().lastIndexOf("@");
  if (at < 1) return null;
  const user = email.trim().slice(0, at);
  const domain = email.trim().slice(at + 1).toLowerCase();
  if (!domain || DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestD = 3;
  for (const d of DOMAINS) {
    const dist = distance(domain, d);
    if (dist < bestD) {
      best = d;
      bestD = dist;
    }
  }
  return best && bestD <= 2 ? `${user}@${best}` : null;
}
