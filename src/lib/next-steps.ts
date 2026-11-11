import type { L10n } from "@/content/types";

export type Profile = {
  display_name: string | null;
  country_of_origin: string | null;
  city: string | null;
  permit_type: string | null;
  permit_expiry: string | null;
  has_children: boolean | null;
  preferred_language: string;
  consent_personalization: boolean;
  consent_analytics: boolean;
};

export type NextStep = { priority: number; text: L10n; href: string };

/**
 * Motor de personalización v1, basado en reglas transparentes y explicables.
 * Usa SOLO los datos que el usuario ha dado y solo si ha dado su consentimiento.
 * Cuando haya datos anónimos suficientes (con consentimiento de analítica), se podrá entrenar
 * un modelo de recomendación. Ver docs/05-roadmap.md.
 */
export function nextSteps(p: Profile, today = new Date()): NextStep[] {
  const steps: NextStep[] = [];
  if (p.permit_expiry) {
    const days = Math.round((new Date(p.permit_expiry).getTime() - today.getTime()) / 86_400_000);
    if (days < 0) {
      steps.push({
        priority: 100,
        text: {
          es: `Tu permiso venció hace ${-days} días. Pide la renovación cuanto antes y consulta a un Patronato o abogado.`,
          en: `Your permit expired ${-days} days ago. Apply for renewal as soon as possible and talk to a Patronato or lawyer.`,
          it: `Il permesso è scaduto da ${-days} giorni: rinnova subito e rivolgiti a un Patronato o avvocato.`,
        },
        href: "/guias/permesso-di-soggiorno",
      });
    } else if (days <= 60) {
      steps.push({
        priority: 90,
        text: {
          es: `Tu permiso vence en ${days} días. Ya puedes pedir la renovación con el kit de Correos.`,
          en: `Your permit expires in ${days} days. You can already apply for renewal with the post office kit.`,
          it: `Il permesso scade tra ${days} giorni: puoi già chiedere il rinnovo.`,
        },
        href: "/guias/permesso-di-soggiorno",
      });
    }
  }
  if (p.permit_type === "nessuno") {
    steps.push({
      priority: 95,
      text: {
        es: "Sin permiso tienes derecho a atención sanitaria urgente (código STP). Para regularizarte, habla con una asociación o abogado; no pagues a intermediarios.",
        en: "Without a permit you still have the right to urgent healthcare (STP code). To regularise, talk to an association or lawyer; don't pay middlemen.",
        it: "Senza permesso hai diritto alle cure urgenti (STP). Per regolarizzarti rivolgiti a un'associazione o avvocato.",
      },
      href: "/contactos",
    });
  }
  if (p.has_children) {
    steps.push({
      priority: 60,
      text: {
        es: "Con hijos puedes tener derecho al Assegno Unico y a otras ayudas. Revisa los requisitos.",
        en: "With children you may be entitled to the Assegno Unico and other benefits. Check the requirements.",
        it: "Con figli potresti avere diritto all'Assegno Unico e ad altri bonus.",
      },
      href: "/ayudas",
    });
  }
  steps.push({
    priority: 30,
    text: {
      es: "¿Aún no tienes código fiscal o médico de cabecera? Son los dos primeros trámites.",
      en: "No tax code or family doctor yet? Those are the first two steps.",
      it: "Non hai ancora codice fiscale o medico di base? Sono i primi passi.",
    },
    href: "/guias/codice-fiscale",
  });
  return steps.sort((a, b) => b.priority - a.priority);
}
