export const CATEGORY_LABEL: Record<string, { es: string; en: string }> = {
  permesso: { es: "Permisos", en: "Permits" },
  lavoro: { es: "Trabajo", en: "Work" },
  casa: { es: "Vivienda", en: "Housing" },
  salute: { es: "Salud", en: "Health" },
  famiglia: { es: "Familia", en: "Family" },
  bonus: { es: "Ayudas", en: "Benefits" },
  cittadinanza: { es: "Ciudadanía", en: "Citizenship" },
  altro: { es: "Otros", en: "Other" },
};

export const FORUM_RULES = {
  es: "Normas: respeto siempre. No publiques datos personales (tuyos ni de otros), números de documentos ni direcciones. Prohibido vender 'contratos', documentos o 'atajos'. Las respuestas son experiencias de la comunidad, no asesoramiento legal.",
  en: "Rules: always be respectful. Don't post personal data (yours or others'), document numbers or addresses. Selling 'contracts', documents or 'shortcuts' is forbidden. Replies are community experiences, not legal advice.",
};

export const ERRORS: Record<string, { es: string; en: string }> = {
  invalid: { es: "Revisa el texto: es demasiado corto o demasiado largo.", en: "Check the text: it's too short or too long." },
  rate_limited: { es: "Has publicado mucho en poco tiempo. Espera un rato.", en: "You've posted a lot in a short time. Please wait a while." },
  save_failed: { es: "No se pudo guardar. Inténtalo de nuevo.", en: "Couldn't save. Please try again." },
};
