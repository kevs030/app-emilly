import { ExternalLink } from "lucide-react";
import type { Lang } from "@/content/types";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

type Sponsor = { id: number; title: string; body: string; cta: string };

/** Rotación: elige un anuncio al azar en cada visita (componente de servidor, se ejecuta por petición). */
function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const LABEL: Record<Lang, string> = { es: "Publicidad", en: "Advertisement", it: "Pubblicità" };

/**
 * Espacio publicitario propio: anuncios de texto que gestiona el administrador desde /admin.
 * Sin cookies ni rastreadores de terceros. Siempre etiquetado como publicidad.
 * Si no hay anuncios activos (o la tabla aún no existe), no muestra nada.
 */
export async function AdSlot({ placement, lang }: { placement: "home" | "guias" | "foro"; lang: Lang }) {
  if (!supabaseConfigured()) return null;
  let sponsor: Sponsor | undefined;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("sponsors").select("id, title, body, cta").eq("active", true).in("placement", [placement, "all"]).limit(20);
    if (data?.length) sponsor = pickOne(data as Sponsor[]);
  } catch {
    return null;
  }
  if (!sponsor) return null;
  return (
    <aside className="card border-dashed" aria-label={LABEL[lang]}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{LABEL[lang]}</p>
      <p className="mt-1 font-semibold">{sponsor.title}</p>
      <p className="text-sm text-muted">{sponsor.body}</p>
      <a href={`/r/${sponsor.id}`} target="_blank" rel="sponsored noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
        {sponsor.cta} <ExternalLink size={14} aria-hidden />
      </a>
    </aside>
  );
}
