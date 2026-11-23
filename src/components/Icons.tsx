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

/** Logotipo: casa con ✓ («a posto» = en orden). Mismo dibujo que public/logo-aposto.svg y la app (scripts/make-icons.mjs). */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M10 30 32 12l22 18v20a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5z" fill="#A65337" stroke="#A65337" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 35.5l7 7 13.5-14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
