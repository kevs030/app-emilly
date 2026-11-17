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

/** Logotipo: una casa, «tu sitio» en Italia. Mismo dibujo que public/logo-aposto.svg y la app. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect x="41" y="11" width="7" height="13" rx="2" fill="#A65337" />
      <path d="M15.5 28v23.5a4 4 0 0 0 4 4h25a4 4 0 0 0 4-4V28" fill="none" stroke="#A65337" strokeWidth="6" strokeLinejoin="round" />
      <path d="M25.5 55.5V43a6.5 6.5 0 0 1 13 0v12.5z" fill="#D9A65E" />
      <path d="M8 31 32 10l24 21" fill="none" stroke="#A65337" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
