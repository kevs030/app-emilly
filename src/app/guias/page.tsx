import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { GuideIcon } from "@/components/Icons";
import { AdSlot } from "@/components/AdSlot";

export default async function GuidesPage() {
  const lang = await getLang();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t("navGuides", lang)}</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guias/${g.slug}`} className="card card-link flex gap-3">
            <GuideIcon slug={g.slug} />
            <span>
              <span className="block font-semibold">{tr(g.title, lang)}</span>
              <span className="mt-1 block text-sm text-muted">{tr(g.summary, lang)}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <AdSlot placement="guias" lang={lang} />
      </div>
    </div>
  );
}
