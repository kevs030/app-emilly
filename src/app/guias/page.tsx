import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";

export default async function GuidesPage() {
  const lang = await getLang();
  return (
    <div>
      <h1 className="text-2xl font-bold">{t("navGuides", lang)}</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guias/${g.slug}`} className="card hover:border-brand">
            <div className="text-2xl">{g.icon}</div>
            <h2 className="mt-1 font-semibold">{tr(g.title, lang)}</h2>
            <p className="mt-1 text-sm text-muted">{tr(g.summary, lang)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
