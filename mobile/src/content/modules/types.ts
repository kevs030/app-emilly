import type { UiLang } from "../../lib/strings";

/** Texto en los 9 idiomas de la app. Los módulos de trámites usan este tipo: ningún idioma puede faltar. */
export type T9 = Record<UiLang, string>;

/** Enlace externo con su resumen («qué encontrarás aquí y qué hacer»), que también se puede bajar en PDF. */
export type ExternalLink = {
  id: string;
  url: string;
  label: T9;
  /** Qué encontrarás en el enlace */
  what: T9;
  /** Pasos a seguir allí */
  steps: T9[];
};

/** Entrada del directorio por ciudad/región. Para añadir una ciudad, basta con añadir un objeto a la lista. */
export type CityEntry = {
  id: string;
  city: string;
  region: string;
  /** Texto propio de esta ciudad (oficina competente, cómo se presenta…) */
  note: T9;
  links: ExternalLink[];
};

/** Campo de un formulario oficial explicado en el idioma de la persona. */
export type FormField = { box: string; explain: T9 };
