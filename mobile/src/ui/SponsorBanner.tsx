import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { loadSponsors, openSponsor, type Placement, type Sponsor } from "~/lib/ads";
import { useLang } from "~/lib/lang";

/**
 * Anuncio propio, siempre etiquetado como «Publicidad». Sin rastreadores.
 * Si no hay anuncios activos (o no hay conexión), no ocupa sitio.
 */
export function SponsorBanner({ placement }: { placement: Placement }) {
  const { t } = useLang();
  const [ad, setAd] = useState<Sponsor | null>(null);

  useEffect(() => {
    let alive = true;
    void loadSponsors(placement).then((list) => {
      if (alive && list.length) setAd(list[Math.floor(Math.random() * list.length)]);
    });
    return () => {
      alive = false;
    };
  }, [placement]);

  if (!ad) return null;
  return (
    <aside className="rounded-3xl border border-dashed border-beige bg-white p-4" aria-label={t("adLabel")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{t("adLabel")}</p>
      <p className="mt-1 font-semibold">{ad.title}</p>
      <p className="text-[14px] text-ink-soft">{ad.body}</p>
      <button type="button" onClick={() => void openSponsor(ad.id)} className="mt-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-terracotta-deep">
        {ad.cta} <ExternalLink size={14} aria-hidden />
      </button>
    </aside>
  );
}
