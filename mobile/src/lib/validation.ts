/** Reglas de validación del acceso. El servidor (Supabase) vuelve a comprobarlo todo. */

export const PASSWORD_MIN = 10;

export type PasswordIssue = "short" | "letters" | "digits";

export function passwordIssues(pw: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  if (pw.length < PASSWORD_MIN) issues.push("short");
  if (!/[a-zA-ZÀ-ÿ]/.test(pw)) issues.push("letters");
  if (!/[0-9]/.test(pw)) issues.push("digits");
  return issues;
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/** Une prefijo y número en formato internacional E.164 (por ejemplo +393331234567). */
export function toE164(dial: string, national: string): string | null {
  const digits = national.replace(/\D/g, "").replace(/^0+(?=\d)/, dial === "+39" ? "$&" : "");
  const full = `${dial}${digits}`;
  return /^\+[1-9]\d{7,14}$/.test(full) ? full : null;
}

export const COUNTRIES: { code: string; dial: string; name: string }[] = [
  { code: "IT", dial: "+39", name: "Italia" },
  { code: "PE", dial: "+51", name: "Perú" },
  { code: "EC", dial: "+593", name: "Ecuador" },
  { code: "CO", dial: "+57", name: "Colombia" },
  { code: "VE", dial: "+58", name: "Venezuela" },
  { code: "BO", dial: "+591", name: "Bolivia" },
  { code: "AR", dial: "+54", name: "Argentina" },
  { code: "BR", dial: "+55", name: "Brasil" },
  { code: "CL", dial: "+56", name: "Chile" },
  { code: "CU", dial: "+53", name: "Cuba" },
  { code: "DO", dial: "+1", name: "Rep. Dominicana" },
  { code: "SV", dial: "+503", name: "El Salvador" },
  { code: "GT", dial: "+502", name: "Guatemala" },
  { code: "HN", dial: "+504", name: "Honduras" },
  { code: "MX", dial: "+52", name: "México" },
  { code: "NI", dial: "+505", name: "Nicaragua" },
  { code: "PA", dial: "+507", name: "Panamá" },
  { code: "PY", dial: "+595", name: "Paraguay" },
  { code: "UY", dial: "+598", name: "Uruguay" },
  { code: "CR", dial: "+506", name: "Costa Rica" },
  { code: "ES", dial: "+34", name: "España" },
  { code: "US", dial: "+1", name: "Estados Unidos" },
];
