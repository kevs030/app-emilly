import Link from "next/link";
import { ArrowRight, BadgeCheck, BookUser, CalendarCheck, Download, FileDown, FileText, HandCoins, Lock, MapPin, PlayCircle, ShieldAlert, Video, Wallet } from "lucide-react";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { GuideIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { centers } from "@/content/centers";
import { AdSlot } from "@/components/AdSlot";

const H = {
  kicker: { es: "Gratis · Fuentes oficiales · En tu idioma", en: "Free · Official sources · In your language", it: "Gratis · Fonti ufficiali · Nella tua lingua" },
  title: { es: "Tu vida en Italia, paso a paso.", en: "Your life in Italy, step by step.", it: "La tua vita in Italia, passo dopo passo." },
  sub: {
    es: "Permiso de residencia, código fiscal, sanidad, ayudas y más. Te explicamos qué hacer, qué documentos llevar y adónde ir.",
    en: "Residence permit, tax code, healthcare, benefits and more. We explain what to do, which documents to bring and where to go.",
    it: "Permesso di soggiorno, codice fiscale, sanità, bonus e altro: cosa fare, quali documenti portare e dove andare.",
  },
  downloadShort: { es: "Descargar la app", en: "Download the app", it: "Scarica l'app" },
  heroAlt: { es: "Una pareja sonríe en una plaza de Milán, con el Duomo detrás.", en: "A couple smiling in a square in Milan, with the Duomo behind them.", it: "Una coppia sorride in una piazza di Milano, con il Duomo alle spalle." },
  download: { es: "Descargar la app para Android", en: "Download the Android app", it: "Scarica l'app per Android" },
  guides: { es: "Ver los trámites", en: "See the procedures", it: "Vedi le pratiche" },
  centers: { es: "Las oficinas que vas a necesitar", en: "The offices you will need", it: "Gli uffici di cui avrai bisogno" },
  centersSub: {
    es: "Qué se hace en cada una. En el mapa encuentras la más cercana a ti.",
    en: "What each one is for. Find the nearest one on the map.",
    it: "A cosa serve ognuno. Sulla mappa trovi il più vicino a te.",
  },
  centersMore: { es: "Más información", en: "Learn more", it: "Scopri di più" },
  photoNote: { es: "Fotos ilustrativas.", en: "Illustrative photos.", it: "Foto illustrative." },
  appTitle: { es: "Lleva todo esto en tu teléfono", en: "Carry all this on your phone", it: "Porta tutto questo sul telefono" },
  appSub: {
    es: "La app A Posto guarda tu progreso en cada trámite, te recuerda las citas, responde tus dudas con el asistente y guarda tus documentos solo en tu teléfono. Gratis.",
    en: "The A Posto app saves your progress on each procedure, reminds you of appointments, answers your questions with the assistant and keeps your documents only on your phone. Free.",
    it: "L'app A Posto salva i progressi di ogni pratica, ti ricorda gli appuntamenti, risponde ai dubbi con l'assistente e tiene i documenti solo sul tuo telefono. Gratis.",
  },
  popular: { es: "Trámites más buscados", en: "Most searched procedures", it: "Pratiche più cercate" },
  popularSub: { es: "Cada guía incluye los formularios oficiales y la fecha de revisión.", en: "Each guide includes the official forms and the date it was checked.", it: "Ogni guida include i moduli ufficiali e la data di verifica." },
  tools: { es: "Todo lo que necesitas", en: "Everything you need", it: "Tutto ciò che ti serve" },
  how: { es: "Cómo funciona", en: "How it works", it: "Come funziona" },
  video: { es: "Mira en 1 minuto cómo se usa la app.", en: "See how to use the app in 1 minute (video in Spanish with subtitles).", it: "Guarda in 1 minuto come si usa l'app (video in spagnolo con sottotitoli)." },
  scamTitle: { es: "Protégete de las estafas", en: "Protect yourself from scams", it: "Proteggiti dalle truffe" },
  scam: {
    es: "Nadie puede venderte un «contrato» del Decreto Flussi ni «acelerar» tu permiso por dinero. Los Patronatos ayudan gratis. A Posto nunca te pedirá dinero ni tus contraseñas.",
    en: "Nobody can sell you a Decreto Flussi “contract” or “speed up” your permit for money. Patronati help for free. A Posto will never ask you for money or passwords.",
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
  { es: "Descarga la app", en: "Download the app", it: "Scarica l'app", d: { es: "Instálala en tu Android y cuéntale tu situación en 4 preguntas.", en: "Install it on your Android and tell it your situation in 4 questions.", it: "Installala sul tuo Android e racconta la tua situazione in 4 domande." } },
  { es: "Sigue los pasos", en: "Follow the steps", it: "Segui i passaggi", d: { es: "Descarga el formulario oficial, reúne los documentos y mira dónde está tu oficina.", en: "Download the official form, gather the documents and find your office.", it: "Scarica il modulo ufficiale e trova il tuo ufficio." } },
  { es: "Resuelve tus dudas", en: "Get answers", it: "Risolvi i dubbi", d: { es: "Pregunta al asistente de la app con tus palabras, o a la comunidad.", en: "Ask the app's assistant in your own words, or the community.", it: "Chiedi all'assistente dell'app con parole tue, o alla comunità." } },
] as const;

export default async function Home() {
  const lang = await getLang();
  const tools = [
    { href: "/guias", icon: FileText, label: t("navGuides", lang) },
    { href: "/mapa", icon: MapPin, label: t("navMap", lang) },
    { href: "/documentos", icon: FileDown, label: lang === "en" ? "Official forms" : lang === "it" ? "Moduli ufficiali" : "Formularios" },
    { href: "/ayudas", icon: HandCoins, label: t("navBonus", lang) },
    { href: "/videos", icon: Video, label: t("navVideos", lang) },
    { href: "/contactos", icon: BookUser, label: t("navDirectory", lang) },
  ];
  return (
    <div className="space-y-12">
      {/* Portada: texto a la izquierda y, a la derecha, personas reales en Italia (el Duomo de Milán detrás) */}
      <section className="hero -mx-4 -mt-6 sm:mx-0 sm:mt-0 sm:rounded-[28px]">
        <div className="relative grid items-center md:grid-cols-[1.05fr_1fr]">
          <div className="px-5 pb-6 pt-10 sm:px-10 md:py-14">
            <h1 className="fade-up text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">{tr(H.title, lang)}</h1>
            <p className="fade-up hero-sub mt-5 max-w-xl text-lg" style={{ animationDelay: "80ms" }}>
              {tr(H.sub, lang)}
            </p>
            <div className="fade-up mt-7 flex flex-col items-start gap-3" style={{ animationDelay: "160ms" }}>
              <Link href="/descargar" className="btn btn-hero">
                <Download size={18} aria-hidden /> {tr(H.download, lang)}
              </Link>
              <Link href="/guias" className="btn btn-hero-outline">
                <FileText size={18} aria-hidden /> {tr(H.guides, lang)}
              </Link>
            </div>
          </div>
          <div className="hero-photo relative h-72 sm:h-96 md:h-full md:min-h-[460px]">
            <img
              src="/ill/pareja-960.webp"
              srcSet="/ill/pareja-960.webp 960w, /ill/pareja-1344.webp 1344w"
              sizes="(min-width: 768px) 50vw, 100vw"
              width={1344}
              height={768}
              alt={tr(H.heroAlt, lang)}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[60%_30%]"
            />
          </div>
        </div>
        {/* Borde ondulado inferior, como una colina */}
        <svg className="hero-wave" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden>
          <path d="M0 40 C 200 0, 400 70, 650 30 S 1050 10, 1200 35 V60 H0 Z" />
        </svg>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <ul className="grid grid-cols-3 gap-3">
          {tools.map((x, i) => (
            <Reveal key={x.href} delay={i * 40}>
              <li className="h-full">
                <Link href={x.href} className="card card-link flex h-full min-h-28 flex-col items-center justify-center gap-2 text-center">
                  <span className="duo">
                    <x.icon size={34} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">{x.label}</span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
        <Reveal>
          <section className="app-card relative flex h-full min-h-56 overflow-hidden rounded-[20px] p-6 text-white">
            <div className="relative z-10 max-w-[58%] sm:max-w-[60%]">
              <h2 className="text-2xl font-bold leading-tight">{tr(H.appTitle, lang)}</h2>
              <p className="mt-2 text-sm text-white/90">{tr(H.appSub, lang)}</p>
              <Link href="/descargar" className="btn mt-5 !border-white !bg-white !text-[var(--ap-sage-dark)] hover:!bg-[var(--ap-cream)]">
                <Download size={18} aria-hidden /> {tr(H.downloadShort, lang)}
              </Link>
            </div>
            <img src="/ill/movil-480.webp" width={480} height={480} alt="" loading="lazy" className="app-card-phone absolute -bottom-6 -right-8 w-[44%] max-w-[230px]" />
          </section>
        </Reveal>
      </section>

      <Reveal>
        <Link href="/guias/decreto-flussi" className="card-link flex items-center gap-4 rounded-[20px] border border-accent/60 bg-warn-bg p-5 text-warn-fg">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-card text-brand">
            <ShieldAlert size={24} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold text-foreground">{tr(H.scamTitle, lang)}</span>
            <span className="mt-1 block text-sm">{tr(H.scam, lang)}</span>
          </span>
          <ArrowRight size={22} className="shrink-0 text-brand rtl:rotate-180" aria-hidden />
        </Link>
      </Reveal>

      <section>
        <h2 className="text-2xl font-bold tracking-tight">{tr(H.how, lang)}</h2>
        <div className="mt-4 grid items-center gap-6 md:grid-cols-2">
          <img src="/ill/laptop-960.webp" srcSet="/ill/laptop-640.webp 640w, /ill/laptop-960.webp 960w" sizes="(min-width: 768px) 50vw, 100vw" width={1344} height={768} alt="" loading="lazy" className="w-full rounded-[24px] border border-border" />
          <ol className="space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.es} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-on-brand">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{s[lang]}</span>
                  <span className="mt-1 block text-sm text-muted">{s.d[lang]}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <details className="card mt-5">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-brand">
            <PlayCircle size={20} aria-hidden /> {tr(H.video, lang)}
          </summary>
          <figure className="mt-3 grid justify-items-center">
            {/* No se descarga hasta que se pulsa «reproducir»: ahorra datos. */}
            <video src="/video/tutorial-es.mp4" poster="/video/tutorial-es.jpg" controls playsInline preload="none" width={300} height={649} className="w-[min(300px,100%)] rounded-3xl border border-border bg-black">
              <track kind="captions" src="/video/tutorial-es.vtt" srcLang="es" label="Español" />
            </video>
          </figure>
        </details>
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


      <section aria-labelledby="centers-title">
        <h2 id="centers-title" className="text-2xl font-bold tracking-tight">{tr(H.centers, lang)}</h2>
        <p className="mt-1 text-muted">{tr(H.centersSub, lang)}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 70}>
              <li className="card flex h-full flex-col overflow-hidden p-0">
                <img
                  src={`/centros/${c.img}-640.webp`}
                  srcSet={`/centros/${c.img}-640.webp 640w, /centros/${c.img}-960.webp 960w`}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  width={640}
                  height={366}
                  loading="lazy"
                  decoding="async"
                  alt=""
                  className="aspect-[7/4] w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold">{c.name[lang]}</h3>
                  <p className="text-xs font-medium text-brand" lang="it">
                    {c.local}
                  </p>
                  <p className="mt-2 flex-1 text-sm text-muted">{c.what[lang]}</p>
                  <Link href={c.href} className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand underline">
                    {tr(H.centersMore, lang)} <ArrowRight size={16} aria-hidden />
                  </Link>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">{tr(H.photoNote, lang)}</p>
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


      <AdSlot placement="home" lang={lang} />
    </div>
  );
}
