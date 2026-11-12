import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, FileDown, HandCoins, Lock, MapPin, MessageCircle, PlayCircle, ShieldAlert, Users, Wallet } from "lucide-react";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { GuideIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { InstallButton } from "@/components/InstallButton";
import { AdSlot } from "@/components/AdSlot";

const H = {
  kicker: { es: "Gratis · Fuentes oficiales · En tu idioma", en: "Free · Official sources · In your language", it: "Gratis · Fonti ufficiali · Nella tua lingua" },
  title: { es: "Tu vida en Italia, paso a paso.", en: "Your life in Italy, step by step.", it: "La tua vita in Italia, passo dopo passo." },
  sub: {
    es: "Permiso de residencia, código fiscal, sanidad, ayudas y más. Te explicamos qué hacer, qué documentos llevar y adónde ir.",
    en: "Residence permit, tax code, healthcare, benefits and more. We explain what to do, which documents to bring and where to go.",
    it: "Permesso di soggiorno, codice fiscale, sanità, bonus e altro: cosa fare, quali documenti portare e dove andare.",
  },
  ask: { es: "Preguntar al asistente", en: "Ask the assistant", it: "Chiedi all'assistente" },
  popular: { es: "Trámites más buscados", en: "Most searched procedures", it: "Pratiche più cercate" },
  popularSub: { es: "Cada guía incluye los formularios oficiales y la fecha de revisión.", en: "Each guide includes the official forms and the date it was checked.", it: "Ogni guida include i moduli ufficiali e la data di verifica." },
  tools: { es: "Todo lo que necesitas", en: "Everything you need", it: "Tutto ciò che ti serve" },
  how: { es: "Cómo funciona", en: "How it works", it: "Come funziona" },
  scamTitle: { es: "Protégete de las estafas", en: "Protect yourself from scams", it: "Proteggiti dalle truffe" },
  scam: {
    es: "Nadie puede venderte un «contrato» del Decreto Flussi ni «acelerar» tu permiso por dinero. Los Patronatos ayudan gratis. A posto nunca te pedirá dinero ni tus contraseñas.",
    en: "Nobody can sell you a Decreto Flussi “contract” or “speed up” your permit for money. Patronati help for free. A posto will never ask you for money or passwords.",
    it: "Nessuno può venderti un «contratto» del Decreto Flussi né velocizzare il permesso a pagamento. I Patronati aiutano gratis.",
  },
};

const TRUST = [
  { icon: BadgeCheck, es: "Fuentes oficiales", en: "Official sources", it: "Fonti ufficiali", d: { es: "Cada dato enlaza a INPS, Polizia di Stato o al Ministerio.", en: "Every fact links to INPS, Polizia di Stato or the Ministry.", it: "Ogni dato rimanda a INPS, Polizia di Stato o Ministero." } },
  { icon: CalendarCheck, es: "Revisado cada semana", en: "Checked every week", it: "Verificato ogni settimana", d: { es: "Verás la fecha de la última revisión en cada guía.", en: "You'll see the last check date on every guide.", it: "Trovi la data dell'ultima verifica in ogni guida." } },
  { icon: Wallet, es: "Gratis para ti", en: "Free for you", it: "Gratis per te", d: { es: "Nunca te cobramos por la información ni por un trámite.", en: "We never charge you for information or a procedure.", it: "Non ti chiediamo mai denaro." } },
  { icon: Lock, es: "Tus datos, protegidos", en: "Your data, protected", it: "Dati protetti", d: { es: "Servidores en la UE. Puedes borrar tu cuenta cuando quieras.", en: "Servers in the EU. Delete your account whenever you want.", it: "Server in UE. Puoi cancellare l'account quando vuoi." } },
] as const;

const STEPS = [
  { es: "Cuéntanos tu situación", en: "Tell us your situation", it: "Raccontaci la tua situazione", d: { es: "Busca tu trámite o pregúntale al asistente con tus palabras, también por voz.", en: "Find your procedure or ask the assistant in your own words, by voice too.", it: "Cerca la pratica o chiedi all'assistente, anche a voce." } },
  { es: "Sigue los pasos", en: "Follow the steps", it: "Segui i passaggi", d: { es: "Descarga el formulario oficial, reúne los documentos y mira dónde está tu oficina.", en: "Download the official form, gather the documents and find your office.", it: "Scarica il modulo ufficiale e trova il tuo ufficio." } },
  { es: "No te quedes solo", en: "You're not alone", it: "Non sei solo", d: { es: "Pregunta en el foro a personas que ya pasaron por lo mismo.", en: "Ask people in the forum who have been through the same.", it: "Chiedi nel forum a chi ci è già passato." } },
] as const;

export default async function Home() {
  const lang = await getLang();
  const tools = [
    { href: "/asistente", icon: MessageCircle, label: t("navAssistant", lang) },
    { href: "/mapa", icon: MapPin, label: t("navMap", lang) },
    { href: "/documentos", icon: FileDown, label: lang === "en" ? "Official forms" : lang === "it" ? "Moduli ufficiali" : "Formularios" },
    { href: "/ayudas", icon: HandCoins, label: t("navBonus", lang) },
    { href: "/videos", icon: PlayCircle, label: t("navVideos", lang) },
    { href: "/foro", icon: Users, label: t("navForum", lang) },
  ];
  return (
    <div className="space-y-12">
      <section className="hero -mx-4 -mt-6 px-4 py-12 sm:mx-0 sm:mt-0 sm:rounded-3xl sm:px-10 sm:py-16">
        <span className="hero-blob" style={{ width: 220, height: 220, right: -40, top: -60, background: "#dce6d8" }} />
        <span className="hero-blob" style={{ width: 180, height: 180, left: -50, bottom: -70, background: "#c77b59", animationDelay: "-5s" }} />
        <div className="relative max-w-2xl">
          <p className="fade-up inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">{tr(H.kicker, lang)}</p>
          <h1 className="fade-up mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl" style={{ animationDelay: "80ms" }}>
            {tr(H.title, lang)}
          </h1>
          <p className="fade-up mt-4 text-lg text-white/90" style={{ animationDelay: "160ms" }}>
            {tr(H.sub, lang)}
          </p>
          <div className="fade-up mt-6 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/asistente" className="btn btn-hero">
              <MessageCircle size={18} aria-hidden /> {tr(H.ask, lang)}
            </Link>
            <InstallButton lang={lang} className="btn btn-hero-outline" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {TRUST.map((x, i) => (
          <Reveal key={x.es} delay={i * 70}>
            <div className="card h-full">
              <span className="icon-tile">
                <x.icon size={22} aria-hidden />
              </span>
              <p className="mt-3 font-semibold">{x[lang]}</p>
              <p className="mt-1 text-sm text-muted">{x.d[lang]}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight">{tr(H.popular, lang)}</h2>
        <p className="mt-1 text-muted">{tr(H.popularSub, lang)}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {guides.map((g, i) => (
            <Reveal key={g.slug} delay={(i % 2) * 70}>
              <Link href={`/guias/${g.slug}`} className="card card-link group flex h-full gap-3">
                <GuideIcon slug={g.slug} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{tr(g.title, lang)}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-muted">{tr(g.summary, lang)}</span>
                </span>
                <ArrowRight size={18} className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight">{tr(H.tools, lang)}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {tools.map((x, i) => (
            <Reveal key={x.href} delay={i * 50}>
              <Link href={x.href} className="card card-link flex h-full flex-col items-center gap-2 text-center">
                <span className="icon-tile">
                  <x.icon size={22} aria-hidden />
                </span>
                <span className="text-sm font-medium">{x.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="flex gap-3 rounded-2xl border border-accent/40 bg-warn-bg p-5 text-warn-fg">
          <ShieldAlert size={26} className="mt-0.5 shrink-0" aria-hidden />
          <div>
            <h2 className="font-bold">{tr(H.scamTitle, lang)}</h2>
            <p className="mt-1 text-sm">{tr(H.scam, lang)}</p>
          </div>
        </section>
      </Reveal>

      <section>
        <h2 className="text-2xl font-bold tracking-tight">{tr(H.how, lang)}</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.es} delay={i * 90}>
              <li className="card h-full">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-on-brand">{i + 1}</span>
                <p className="mt-3 font-semibold">{s[lang]}</p>
                <p className="mt-1 text-sm text-muted">{s.d[lang]}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <AdSlot placement="home" lang={lang} />
    </div>
  );
}
