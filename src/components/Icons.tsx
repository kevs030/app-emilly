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

/** Logotipo: la misma "E" con punto del icono de la app. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#0f766e" />
      <path d="M22 16h22v7H30v6h12v7H30v6h14v7H22z" fill="#fff" />
      <circle cx="47" cy="17" r="4.5" fill="#5eead4" />
    </svg>
  );
}
