/**
 * «Tu plan para empezar»: qué guías recomendar según las respuestas del cuestionario inicial.
 * Reglas simples y explicables; solo usa lo que la persona ha contestado.
 */

export type PlanAnswers = {
  /** guías que la persona dice necesitar */
  goals: string[];
  /** tipo de permiso ("" = no contesta, "nessuno" = sin permiso) */
  permit: string;
  /** fecha de caducidad AAAA-MM-DD, o "" */
  expiry: string;
  children: "yes" | "no" | "";
};

export const FIRST_STEPS = ["codice-fiscale", "sanidad-tessera-sanitaria"];
const RENEW_WINDOW_DAYS = 90;

export function daysUntil(date: string, today: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const end = new Date(`${date}T00:00:00Z`).getTime();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((end - start) / 86_400_000);
}

/** Devuelve hasta 4 guías, de la más urgente a la menos, sin repetir. */
export function recommend(a: PlanAnswers, known: (slug: string) => boolean, today = new Date()): string[] {
  const out: string[] = [];
  const add = (slug: string) => {
    if (known(slug) && !out.includes(slug)) out.push(slug);
  };
  const days = a.permit && a.permit !== "nessuno" ? daysUntil(a.expiry, today) : null;
  // Permiso caducado o a punto de caducar: lo primero es renovarlo.
  if (days !== null && days <= RENEW_WINDOW_DAYS) add("permesso-di-soggiorno");
  // Sin permiso y con hijos menores: existe una vía específica (art. 31) que conviene conocer.
  if (a.permit === "nessuno" && a.children === "yes") add("articolo-31");
  a.goals.forEach(add);
  if (out.length === 0) FIRST_STEPS.forEach(add);
  return out.slice(0, 4);
}

/** ¿Merece la pena mostrar las ayudas para familias? */
export const suggestBenefits = (a: PlanAnswers) => a.children === "yes";
