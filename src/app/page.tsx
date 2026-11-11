import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";

const home = {
  ask: { es: "Pregúntale al asistente", en: "Ask the assistant", it: "Chiedi all'assistente" },
  askSub: {
    es: "Explícale tu situación con tus palabras y te dice qué pasos seguir y adónde ir.",
    en: "Describe your situation in your own words and it tells you the steps and where to go.",
    it: "Descrivi la tua situazione e ti indica i passi e dove andare.",
  },
  install: { es: "Instala Emilly en tu celular", en: "Install Emilly on your phone", it: "Installa Emilly sul telefono" },
  popular: { es: "Trámites más buscados", en: "Most searched procedures", it: "Pratiche più cercate" },
  scam: {
    es: "Nunca pagues a intermediarios por un 'contrato' del Decreto Flussi o para 'acelerar' tu permiso. Es la estafa más común.",
    en: "Never pay middlemen for a Decreto Flussi 'contract' or to 'speed up' your permit. It's the most common scam.",
    it: "Non pagare mai intermediari per contratti del Decreto Flussi o per velocizzare il permesso.",
  },
};

export default async function Home() {
  const lang = await getLang();
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-brand-soft p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Emilly</h1>
        <p className="mt-2 text-lg">{t("tagline", lang)}</p>
        <Link href="/asistente" className="btn mt-4">
          💬 {tr(home.ask, lang)}
        </Link>
        <p className="mt-2 text-sm text-muted">{tr(home.askSub, lang)}</p>
        <Link href="/instalar" className="mt-3 inline-block text-sm font-medium text-brand underline">
          📲 {tr(home.install, lang)}
        </Link>
      </section>

      <p className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">⚠️ {tr(home.scam, lang)}</p>

      <section>
        <h2 className="text-xl font-semibold">{tr(home.popular, lang)}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="card hover:border-brand">
              <div className="text-2xl">{g.icon}</div>
              <h3 className="mt-1 font-semibold">{tr(g.title, lang)}</h3>
              <p className="mt-1 text-sm text-muted">{tr(g.summary, lang)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { href: "/ayudas", icon: "💶", label: t("navBonus", lang) },
          { href: "/mapa", icon: "🗺️", label: t("navMap", lang) },
          { href: "/videos", icon: "🎬", label: t("navVideos", lang) },
          { href: "/foro", icon: "👥", label: t("navForum", lang) },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="card text-center hover:border-brand">
            <div className="text-3xl">{x.icon}</div>
            <div className="mt-1 font-medium">{x.label}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
