import { Baby, Briefcase, FileText, Flag, Hash, HeartPulse, Home, IdCard, type LucideIcon } from "lucide-react";

const BY_SLUG: Record<string, LucideIcon> = {
  "permesso-di-soggiorno": IdCard,
  "codice-fiscale": Hash,
  "sanidad-tessera-sanitaria": HeartPulse,
  "residencia-anagrafica": Home,
  "decreto-flussi": Briefcase,
  ciudadania: Flag,
  "articolo-31": Baby,
};

export function GuideIcon({ slug, size = 22 }: { slug: string; size?: number }) {
  const Icon = BY_SLUG[slug] ?? FileText;
  return (
    <span className="icon-tile">
      <Icon size={size} aria-hidden />
    </span>
  );
}

/** Logotipo: una marca de verificación: "a posto" significa "todo en orden". */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#a65d3d" />
      <path d="M18 33.5l9.5 9.5L46 23" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
