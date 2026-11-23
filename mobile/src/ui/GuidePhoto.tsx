/**
 * Foto de cada trámite: personas haciendo ese trámite en Italia (generadas, ilustrativas).
 * Archivos en public/tramites/<slug>-640.webp y -960.webp (los mismos que usa la web).
 */
const SLUGS = new Set(["permesso-di-soggiorno", "codice-fiscale", "sanidad-tessera-sanitaria", "residencia-anagrafica", "decreto-flussi", "ciudadania", "articolo-31"]);

// Guías sin foto propia: usan la del trámite más cercano.
const ALIAS: Record<string, string> = { "art-35-sanidad-sin-papeles": "sanidad-tessera-sanitaria", "carta-identita-elettronica": "residencia-anagrafica", "permesso-ue-lungo-periodo": "permesso-di-soggiorno" };
const photoOf = (slug: string) => (SLUGS.has(slug) ? slug : ALIAS[slug]);

export function hasGuidePhoto(slug: string) {
  return Boolean(photoOf(slug));
}

export function GuidePhoto({ slug, className = "", eager = false }: { slug: string; className?: string; eager?: boolean }) {
  const photo = photoOf(slug);
  if (!photo) return null;
  const base = `${import.meta.env.BASE_URL}tramites/${photo}`;
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
