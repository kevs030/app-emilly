/**
 * Ilustraciones de A Posto (generadas con Recraft en ElevenLabs y comprimidas a WebP).
 * Dos tamaños: el teléfono descarga solo el que necesita (16–68 KB cada una).
 */
export type IllustrationName = "laptop" | "bienvenida" | "tramites" | "asistente" | "citas" | "privacidad" | "documentos" | "mapa" | "comunidad" | "ayudas" | "traductor";

export function Illustration({ name, alt = "", className = "", eager = false }: { name: IllustrationName; alt?: string; className?: string; eager?: boolean }) {
  const base = `${import.meta.env.BASE_URL}ill/${name}`;
  return (
    <img
      src={`${base}-960.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w`}
      sizes="(max-width: 480px) 100vw, 448px"
      width={1344}
      height={768}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`ill block h-auto w-full rounded-[26px] ${className}`}
    />
  );
}

/** Paisaje italiano (Duomo, casas y árboles) para el pie de las pantallas. Decorativo. */
export function Landscape({ className = "" }: { className?: string }) {
  const base = `${import.meta.env.BASE_URL}ill/paisaje`;
  return (
    <img
      src={`${base}-960.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w`}
      sizes="(max-width: 480px) 100vw, 448px"
      width={1344}
      height={468}
      alt=""
      loading="lazy"
      decoding="async"
      className={`pointer-events-none block h-auto w-full select-none ${className}`}
    />
  );
}
