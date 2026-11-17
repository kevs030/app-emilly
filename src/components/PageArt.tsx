/**
 * Imagen de cabecera de cada sección de la web: personas y lugares de Italia relacionados con el tema.
 * Ilustraciones en /ill (las mismas de la app) y fotos de oficinas en /centros. Decorativa: el título va en texto.
 */
const ART = {
  tramites: ["/ill/tramites", 640, 960],
  ayudas: ["/ill/ayudas", 640, 960],
  mapa: ["/ill/mapa", 640, 960],
  comunidad: ["/ill/comunidad", 640, 960],
  documentos: ["/ill/documentos", 640, 960],
  bienvenida: ["/ill/bienvenida", 640, 960],
  privacidad: ["/ill/privacidad", 640, 960],
  asistente: ["/ill/asistente", 640, 960],
  questura: ["/centros/questura", 640, 960],
  comune: ["/centros/comune", 640, 960],
  sanidad: ["/centros/sanidad", 640, 960],
  patronato: ["/centros/patronato", 640, 960],
  inps: ["/centros/inps", 640, 960],
  correos: ["/centros/correos", 640, 960],
  escuela: ["/centros/escuela", 640, 960],
} as const;
export type ArtName = keyof typeof ART;

/** Foto de la oficina principal de cada guía. */
export const GUIDE_ART: Record<string, ArtName> = {
  "permesso-di-soggiorno": "questura",
  "codice-fiscale": "inps",
  "sanidad-tessera-sanitaria": "sanidad",
  "residencia-anagrafica": "comune",
  "decreto-flussi": "patronato",
  ciudadania: "comune",
  "articolo-31": "questura",
};

export function PageArt({ name, priority = false }: { name: ArtName; priority?: boolean }) {
  const [base, small, large] = ART[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- WebP ya optimizados en dos tamaños
    <img
      src={`${base}-${large}.webp`}
      srcSet={`${base}-${small}.webp ${small}w, ${base}-${large}.webp ${large}w`}
      sizes="(min-width: 1024px) 960px, 100vw"
      width={1344}
      height={768}
      alt=""
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="aspect-[16/6] w-full rounded-[24px] border border-border object-cover sm:aspect-[16/5]"
    />
  );
}
