/**
 * Foto de cada trámite: personas haciendo ese trámite en Italia (generadas, ilustrativas).
 * Archivos en public/tramites/<slug>-640.webp y -960.webp (los mismos que usa la web).
 */
const SLUGS = new Set(["permesso-di-soggiorno", "codice-fiscale", "sanidad-tessera-sanitaria", "residencia-anagrafica", "decreto-flussi", "ciudadania", "articolo-31"]);

export function hasGuidePhoto(slug: string) {
  return SLUGS.has(slug);
}

export function GuidePhoto({ slug, className = "", eager = false }: { slug: string; className?: string; eager?: boolean }) {
  if (!SLUGS.has(slug)) return null;
  const base = `${import.meta.env.BASE_URL}tramites/${slug}`;
  return (
    <img
      src={`${base}-960.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w`}
      sizes="(max-width: 480px) 100vw, 448px"
      width={1344}
      height={768}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`block bg-beige object-cover ${/(^|\s)w-/.test(className) ? "" : "w-full "}${className}`}
    />
  );
}
