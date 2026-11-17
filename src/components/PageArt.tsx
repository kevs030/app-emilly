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
  "t-permesso-di-soggiorno": ["/tramites/permesso-di-soggiorno", 640, 960],
  "t-codice-fiscale": ["/tramites/codice-fiscale", 640, 960],
  "t-sanidad-tessera-sanitaria": ["/tramites/sanidad-tessera-sanitaria", 640, 960],
  "t-residencia-anagrafica": ["/tramites/residencia-anagrafica", 640, 960],
  "t-decreto-flussi": ["/tramites/decreto-flussi", 640, 960],
  "t-ciudadania": ["/tramites/ciudadania", 640, 960],
  "t-articolo-31": ["/tramites/articolo-31", 640, 960],
} as const;
export type ArtName = keyof typeof ART;

/** Foto de la oficina principal de cada guía. */
/** Foto de cada trámite: personas haciendo ese trámite (las mismas que en la app). */
export const GUIDE_ART: Record<string, ArtName> = {
  "permesso-di-soggiorno": "t-permesso-di-soggiorno",
  "codice-fiscale": "t-codice-fiscale",
  "sanidad-tessera-sanitaria": "t-sanidad-tessera-sanitaria",
  "residencia-anagrafica": "t-residencia-anagrafica",
  "decreto-flussi": "t-decreto-flussi",
  ciudadania: "t-ciudadania",
  "articolo-31": "t-articolo-31",
};

/** Miniatura de un trámite para tarjetas (sin bordes propios). */
export function GuideThumb({ slug, className = "" }: { slug: string; className?: string }) {
  if (!GUIDE_ART[slug]) return null;
  const base = `/tramites/${slug}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- WebP ya optimizados en dos tamaños
    <img src={`${base}-640.webp`} srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w`} sizes="(min-width: 640px) 50vw, 100vw" width={1344} height={768} alt="" loading="lazy" decoding="async" className={`block w-full object-cover ${className}`} />
  );
}

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
