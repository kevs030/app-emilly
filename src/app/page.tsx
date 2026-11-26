import Link from "next/link";
import { ArrowRight, BadgeCheck, Bell, Bot, CheckSquare, Compass, Download, FileLock2, Gift, Languages, MapPin, ShieldAlert, Smartphone, UserRoundCheck } from "lucide-react";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";
import { getGuide, guides } from "@/content/guides";
import { STAGES } from "@/content/journey";
import { RoadmapQuiz } from "@/components/RoadmapQuiz";
import { GuideThumb } from "@/components/PageArt";
import { Reveal } from "@/components/Reveal";
import { centers } from "@/content/centers";
import { AdSlot } from "@/components/AdSlot";
import type { L10n, Lang } from "@/content/types";

/*
 * Portada de la WEB: una página de producto. Explica qué hace la app A Posto y lleva a descargarla.
 * La información de cada trámite está en /guias; el paso a paso completo (avances, recordatorios,
 * documentos, formularios) vive en la app.
 */

const H = {
  commEyebrow: { es: "Comunidad", en: "Community", it: "Comunità" },
  commTitle: { es: "No estás solo en esto", en: "You're not alone in this", it: "Non sei solo in questo" },
  commBody: {
    es: "Pregunta lo que necesites. Personas que ya pasaron por el mismo trámite te responden en la app, en tu idioma.",
    en: "Ask whatever you need. People who already went through the same procedure answer you in the app, in your language.",
    it: "Chiedi quello che ti serve. Persone che hanno già fatto la stessa pratica ti rispondono nell'app, nella tua lingua.",
  },
  commAlt: { es: "Grupo de amigos de distintos orígenes sonriendo juntos", en: "Group of friends from different backgrounds smiling together", it: "Gruppo di amici di origini diverse che sorridono insieme" },
  heroAlt: { es: "Calle de una ciudad italiana al atardecer, llena de gente", en: "Street in an Italian city at sunset, full of people", it: "Strada di una città italiana al tramonto, piena di gente" },
  howAlt: { es: "Persona atendida en una oficina con sus documentos", en: "Person being helped at an office with their documents", it: "Persona allo sportello con i suoi documenti" },
  photoCredit: { es: "Fotografías: Pexels (licencia libre).", en: "Photos: Pexels (free license).", it: "Fotografie: Pexels (licenza libera)." },
  eyebrow: { es: "La app gratuita para tus trámites en Italia", en: "The free app for your paperwork in Italy", it: "L'app gratuita per le tue pratiche in Italia" },
  title: { es: "Tu vida en Italia, paso a paso.", en: "Your life in Italy, step by step.", it: "La tua vita in Italia, passo dopo passo." },
  sub: {
    es: "A Posto te guía en cada trámite —permiso de residencia, código fiscal, sanidad, residencia, ayudas— en tu idioma, con fuentes oficiales y recordatorios para que no se te pase ninguna fecha.",
    en: "A Posto guides you through every procedure —residence permit, tax code, healthcare, residence, benefits— in your language, with official sources and reminders so you never miss a date.",
    it: "A Posto ti guida in ogni pratica —permesso di soggiorno, codice fiscale, sanità, residenza, bonus— nella tua lingua, con fonti ufficiali e promemoria per non perdere nessuna scadenza.",
  },
  explore: { es: "Explorar trámites gratis", en: "Explore procedures for free", it: "Esplora le pratiche gratis" },
  download: { es: "Descargar la app", en: "Download the app", it: "Scarica l'app" },
  trustLabel: { es: "Por qué confiar", en: "Why trust us", it: "Perché fidarsi" },
  sources: { es: "Información basada en fuentes oficiales", en: "Information based on official sources", it: "Informazioni basate su fonti ufficiali" },
  featEyebrow: { es: "Qué hace la app", en: "What the app does", it: "Cosa fa l'app" },
  featTitle: { es: "Todo tu proceso de integración, en tu bolsillo", en: "Your whole integration journey, in your pocket", it: "Tutto il tuo percorso di integrazione, in tasca" },
  featSub: {
    es: "La web te cuenta qué existe. La app te acompaña hasta terminarlo.",
    en: "The website tells you what exists. The app walks you through to the end.",
    it: "Il sito ti dice cosa esiste. L'app ti accompagna fino alla fine.",
  },
  stagesEyebrow: { es: "Trámites", en: "Procedures", it: "Pratiche" },
  stages: { es: "¿En qué momento estás?", en: "Where are you in your journey?", it: "A che punto sei?" },
  stagesSub: {
    es: "Los trámites ordenados según tu momento en Italia. Lee de qué trata cada uno y síguelo paso a paso en la app.",
    en: "Procedures ordered by your moment in Italy. Read what each one is about and follow it step by step in the app.",
    it: "Le pratiche ordinate secondo il tuo momento in Italia. Leggi di cosa si tratta e seguila passo dopo passo nell'app.",
  },
  videosEyebrow: { es: "Vídeos", en: "Videos", it: "Video" },
  videosTitle: { es: "Mira cómo se hace, en menos de un minuto", en: "See how it's done, in under a minute", it: "Guarda come si fa, in meno di un minuto" },
  videosSub: { es: "Grabados dentro de la app, paso a paso, con voz en español. También se entienden sin sonido.", en: "Recorded inside the app, step by step, with Spanish narration. They also work without sound.", it: "Registrati nell'app, passo dopo passo, con voce in spagnolo. Si capiscono anche senza audio." },
  allGuides: { es: "Ver todos los trámites", en: "See all procedures", it: "Vedi tutte le pratiche" },
  howEyebrow: { es: "Cómo empezar", en: "How to start", it: "Come iniziare" },
  how: { es: "Empieza en 3 pasos", en: "Start in 3 steps", it: "Inizia in 3 passi" },
  centers: { es: "Las oficinas que vas a necesitar", en: "The offices you will need", it: "Gli uffici di cui avrai bisogno" },
  centersSub: {
    es: "Qué se hace en cada una. En la app encuentras la más cercana a ti.",
    en: "What each one is for. In the app you find the nearest one.",
    it: "A cosa serve ognuno. Nell'app trovi il più vicino a te.",
  },
  centersMore: { es: "Más información", en: "Learn more", it: "Scopri di più" },
  photoNote: { es: "Fotos ilustrativas.", en: "Illustrative photos.", it: "Foto illustrative." },
  scamTitle: { es: "Protégete de las estafas", en: "Protect yourself from scams", it: "Proteggiti dalle truffe" },
  scam: {
    es: "Nadie puede venderte un «contrato» del Decreto Flussi ni «acelerar» tu permiso por dinero. Los Patronatos ayudan gratis. A Posto nunca te pedirá dinero ni tus contraseñas.",
    en: "Nobody can sell you a Decreto Flussi “contract” or “speed up” your permit for money. Patronati help for free. A Posto will never ask you for money or passwords.",
    it: "Nessuno può venderti un «contratto» del Decreto Flussi né velocizzare il permesso a pagamento. I Patronati aiutano gratis. A Posto non ti chiederà mai soldi né password.",
  },
  finalTitle: { es: "Empieza hoy, gratis", en: "Start today, for free", it: "Inizia oggi, gratis" },
  finalSub: {
    es: "Disponible para Android y para iPhone (desde Safari). En español, italiano, inglés, francés, árabe, rumano, albanés, ucraniano y bengalí.",
    en: "Available for Android and iPhone (from Safari). In Spanish, Italian, English, French, Arabic, Romanian, Albanian, Ukrainian and Bengali.",
    it: "Disponibile per Android e iPhone (da Safari). In spagnolo, italiano, inglese, francese, arabo, rumeno, albanese, ucraino e bengalese.",
  },
  android: { es: "Descargar para Android", en: "Download for Android", it: "Scarica per Android" },
  iphone: { es: "Instalar en iPhone", en: "Install on iPhone", it: "Installa su iPhone" },
  quizAlt: { es: "Personas de distintos países en una plaza italiana", en: "People from different countries in an Italian square", it: "Persone di diversi Paesi in una piazza italiana" },
  appShot: { es: "Pantalla de inicio de la app A Posto", en: "A Posto app home screen", it: "Schermata iniziale dell'app A Posto" },
} satisfies Record<string, L10n>;

const COMM_POINTS: L10n[] = [
  { es: "Preguntas y respuestas entre personas migrantes", en: "Questions and answers between migrants", it: "Domande e risposte tra persone migranti" },
  { es: "Moderada: sin datos personales ni estafas", en: "Moderated: no personal data and no scams", it: "Moderata: niente dati personali né truffe" },
  { es: "Te avisa cuando alguien te responde", en: "Lets you know when someone answers", it: "Ti avvisa quando qualcuno risponde" },
];


const HERO_TRUST = [
  { icon: Gift, es: "100% gratuito", en: "100% free", it: "100% gratuito" },
  { icon: UserRoundCheck, es: "Sin registro obligatorio", en: "No sign-up required", it: "Senza registrazione obbligatoria" },
  { icon: BadgeCheck, es: "Fuentes oficiales", en: "Official sources", it: "Fonti ufficiali" },
] as const;

const SOURCES = ["INPS", "Polizia di Stato", "Agenzia delle Entrate", "Ministero dell'Interno", "Ministero della Salute"];

type Feature = { img: string; icon: typeof Bell; title: L10n; body: L10n; points: L10n[] };
const FEATURES: Feature[] = [
  {
    img: "app-tramite",
    icon: CheckSquare,
    title: { es: "Cada trámite, paso a paso", en: "Every procedure, step by step", it: "Ogni pratica, passo dopo passo" },
    body: {
      es: "Qué hacer, en qué orden, qué documentos llevar y adónde ir. Marcas cada paso y la app te dice qué te falta.",
      en: "What to do, in which order, which documents to bring and where to go. Tick each step and the app tells you what's left.",
      it: "Cosa fare, in che ordine, quali documenti portare e dove andare. Segni ogni passo e l'app ti dice cosa manca.",
    },
    points: [
      { es: "Casillas para pasos y documentos", en: "Checkboxes for steps and documents", it: "Caselle per passi e documenti" },
      { es: "Formularios oficiales explicados casilla a casilla", en: "Official forms explained box by box", it: "Moduli ufficiali spiegati casella per casella" },
      { es: "Resúmenes en PDF en tu idioma", en: "PDF summaries in your language", it: "Riepiloghi in PDF nella tua lingua" },
    ],
  },
  {
    img: "app-documentos",
    icon: FileLock2,
    title: { es: "Tus documentos, seguros y a mano", en: "Your documents, safe and at hand", it: "I tuoi documenti, al sicuro e a portata di mano" },
    body: {
      es: "Guarda tu pasaporte, permesso, ISEE o contrato en el teléfono, cifrados, con su fecha de caducidad a la vista.",
      en: "Keep your passport, permesso, ISEE or contract on your phone, encrypted, with their expiry date in view.",
      it: "Conserva passaporto, permesso, ISEE o contratto sul telefono, cifrati, con la data di scadenza in vista.",
    },
    points: [
      { es: "Cifrados y solo en tu teléfono", en: "Encrypted and only on your phone", it: "Cifrati e solo sul telefono" },
      { es: "Funcionan sin internet", en: "Work offline", it: "Funzionano senza internet" },
      { es: "Lee una carta oficial y te la explica", en: "Reads an official letter and explains it", it: "Legge una lettera ufficiale e te la spiega" },
    ],
  },
  {
    img: "app-consulado",
    icon: MapPin,
    title: { es: "Tu consulado y las oficinas cerca de ti", en: "Your consulate and offices near you", it: "Il tuo consolato e gli uffici vicini" },
    body: {
      es: "Questura, ASL, Comune, Patronato y el consulado de tu país, con dirección, teléfono, citas y cómo llegar.",
      en: "Questura, ASL, Comune, Patronato and your country's consulate, with address, phone, appointments and directions.",
      it: "Questura, ASL, Comune, Patronato e il consolato del tuo Paese, con indirizzo, telefono, appuntamenti e indicazioni.",
    },
    points: [
      { es: "Mapa con la oficina más cercana", en: "Map with the nearest office", it: "Mappa con l'ufficio più vicino" },
      { es: "Recordatorios de tus citas", en: "Reminders for your appointments", it: "Promemoria degli appuntamenti" },
    ],
  },
  {
    img: "app-asistente",
    icon: Bot,
    title: { es: "Un asistente que te responde en tu idioma", en: "An assistant that answers in your language", it: "Un assistente che risponde nella tua lingua" },
    body: {
      es: "Pregunta con tus palabras: «¿qué me falta para renovar el permiso?». Responde con fuentes oficiales y te dice por dónde seguir.",
      en: "Ask in your own words: “what do I need to renew my permit?”. It answers with official sources and tells you what to do next.",
      it: "Chiedi con parole tue: «cosa mi manca per rinnovare il permesso?». Risponde con fonti ufficiali e ti dice come proseguire.",
    },
    points: [{ es: "9 idiomas, también árabe y bengalí", en: "9 languages, including Arabic and Bengali", it: "9 lingue, anche arabo e bengalese" }],
  },
];

const VIDEOS = [
  {
    file: "guia-codice-fiscale",
    title: { es: "Cómo pedir el código fiscal en Italia", en: "How to get the tax code (codice fiscale) in Italy", it: "Come richiedere il codice fiscale" },
    sub: { es: "Qué es, qué llevar, marcar tus pasos y el formulario AA4/8 explicado.", en: "What it is, what to bring, ticking your steps and the AA4/8 form explained.", it: "Cos'è, cosa portare, segnare i passi e il modulo AA4/8 spiegato." },
  },
  {
    file: "primer-mes-en-italia",
    title: { es: "Tu primer mes en Italia", en: "Your first month in Italy", it: "Il tuo primo mese in Italia" },
    sub: { es: "Guía de integración, tu consulado más cercano y tus documentos seguros.", en: "Integration guide, your nearest consulate and your documents kept safe.", it: "Guida all'integrazione, il consolato più vicino e i documenti al sicuro." },
  },
] as const;

const STEPS = [
  { es: "Descarga la app", en: "Download the app", it: "Scarica l'app", d: { es: "Gratis en Android, o añádela a tu iPhone desde Safari.", en: "Free on Android, or add it to your iPhone from Safari.", it: "Gratis su Android, o aggiungila all'iPhone da Safari." } },
  { es: "Cuéntale tu situación", en: "Tell it your situation", it: "Racconta la tua situazione", d: { es: "4 preguntas y te dice por dónde empezar.", en: "4 questions and it tells you where to start.", it: "4 domande e ti dice da dove iniziare." } },
  { es: "Avanza paso a paso", en: "Move forward step by step", it: "Avanza passo dopo passo", d: { es: "Marca tus avances, guarda tus documentos y recibe recordatorios.", en: "Track your progress, keep your documents and get reminders.", it: "Segna i progressi, salva i documenti e ricevi promemoria." } },
] as const;

/** Foto de cada momento del viaje (Pexels, licencia libre). */
const STAGE_PHOTO: Record<string, string> = { llegada: "milan-duomo", quedarme: "papeles", anos: "movil" };

function Phone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="phone-frame mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element -- capturas WebP ya optimizadas */}
      <img src={`/web/${src}.webp`} width={600} height={1022} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
    </div>
  );
}

function DownloadButtons({ lang, light = false }: { lang: Lang; light?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/descargar#apk" className={`btn sm:!w-auto ${light ? "!border-white !bg-white !text-[var(--ap-sage-dark)]" : ""}`}>
        <Download size={18} aria-hidden /> {tr(H.android, lang)}
      </Link>
      <a href="/descargar#iphone" className={`btn btn-hero-outline sm:!w-auto ${light ? "!border-white !bg-transparent !text-white" : ""}`}>
        <Smartphone size={18} aria-hidden /> {tr(H.iphone, lang)}
      </a>
    </div>
  );
}

export default async function Home() {
  const lang = await getLang();
  const guideInfo = Object.fromEntries(guides.map((g) => [g.slug, { title: tr(g.title, lang), summary: tr(g.summary, lang) }]));
  return (
    <div className="-mt-6 space-y-20 sm:space-y-24">
      {/* ── Portada: qué es A Posto + la app de verdad en un teléfono ── */}
      <section className="landing-photo full-bleed relative !mb-0 overflow-hidden px-4 pb-16 pt-14 sm:pb-24 sm:pt-24" data-testid="landing-hero">
        {/* eslint-disable-next-line @next/next/no-img-element -- foto WebP ya optimizada en dos tamaños */}
        <img src="/web/fotos/roma-atardecer-1600.webp" srcSet="/web/fotos/roma-atardecer-800.webp 800w, /web/fotos/roma-atardecer-1600.webp 1600w" sizes="100vw" width={1600} height={1067} alt={tr(H.heroAlt, lang)} fetchPriority="high" className="landing-photo-img absolute inset-0 h-full w-full object-cover" />
        <div className="hero-shade absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="eyebrow fade-up !text-[var(--ap-gold)]">{tr(H.eyebrow, lang)}</p>
            <h1 className="fade-up mt-3 text-[2.8rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">{tr(H.title, lang)}</h1>
            <p className="fade-up mt-5 max-w-xl text-lg text-white/85" style={{ animationDelay: "80ms" }}>
              {tr(H.sub, lang)}
            </p>
            <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "160ms" }}>
              <a href="#hoja-de-ruta" className="btn btn-hero sm:!w-auto" data-testid="hero-primary">
                <Compass size={18} aria-hidden /> {tr(H.explore, lang)}
              </a>
              <Link href="/descargar" className="btn btn-hero-outline !border-white !bg-white/10 !text-white backdrop-blur sm:!w-auto" data-testid="hero-secondary">
                <Download size={18} aria-hidden /> {tr(H.download, lang)}
              </Link>
            </div>
            <ul className="fade-up mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/85" style={{ animationDelay: "220ms" }} aria-label={tr(H.trustLabel, lang)} data-testid="hero-trust">
              {HERO_TRUST.map((x) => (
                <li key={x.es} className="flex items-center gap-1.5">
                  <x.icon size={15} className="shrink-0 text-[var(--ap-gold)]" aria-hidden /> {x[lang]}
                </li>
              ))}
            </ul>
          </div>
          <div className="fade-up" style={{ animationDelay: "120ms" }}>
            <Phone src="app-inicio" alt={tr(H.appShot, lang)} eager />
          </div>
        </div>
      </section>

      {/* ── Vídeos: cómo se hacen los trámites con la app ── */}
      <section className="dark-band full-bleed !mt-0 px-4 py-20" aria-labelledby="videos-title" data-testid="home-videos">
        <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="eyebrow !text-[var(--ap-gold)]">{tr(H.videosEyebrow, lang)}</p>
          <h2 id="videos-title" className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {tr(H.videosTitle, lang)}
          </h2>
          <p className="mt-3 text-white/75">{tr(H.videosSub, lang)}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {VIDEOS.map((v) => (
            <figure key={v.file} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {/* Con voz en español y textos grandes (se entiende también sin sonido). No se descarga hasta que se pulsa «reproducir». */}
              <video src={`/video/${v.file}.mp4`} poster={`/video/${v.file}.jpg`} controls playsInline preload="none" width={1280} height={720} className="aspect-video w-full bg-[var(--background-alt)]" />
              <figcaption className="p-4">
                <p className="font-semibold text-white">{tr(v.title, lang)}</p>
                <p className="text-sm text-white/70">{tr(v.sub, lang)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        </div>
      </section>

      {/* ── Fuentes oficiales ── */}
      <section className="text-center" aria-label={tr(H.sources, lang)}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{tr(H.sources, lang)}</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] font-semibold text-foreground/70">
          {SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      {/* ── Qué hace la app ── */}
      <section aria-labelledby="feat-title" data-testid="features">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{tr(H.featEyebrow, lang)}</p>
          <h2 id="feat-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {tr(H.featTitle, lang)}
          </h2>
          <p className="mt-3 text-lg text-muted">{tr(H.featSub, lang)}</p>
        </div>
        <div className="mt-14 space-y-20">
          {FEATURES.map((f, i) => (
            <Reveal key={f.img} className="tilt">
              <div className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <Phone src={f.img} alt={tr(f.title, lang)} />
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ap-terracotta-soft)] text-brand">
                    <f.icon size={24} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight">{tr(f.title, lang)}</h3>
                  <p className="mt-2 text-lg text-muted">{tr(f.body, lang)}</p>
                  <ul className="mt-4 space-y-2">
                    {f.points.map((pt) => (
                      <li key={pt.es} className="flex items-center gap-2">
                        <BadgeCheck size={18} className="shrink-0 text-sage" aria-hidden /> {tr(pt, lang)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Comunidad: personas reales que se ayudan ── */}
      <section className="grid items-center gap-10 md:grid-cols-2" aria-labelledby="comm-title" data-testid="home-community">
        <Reveal className="tilt">
          {/* eslint-disable-next-line @next/next/no-img-element -- foto WebP ya optimizada */}
          <img src="/web/fotos/comunidad-1600.webp" srcSet="/web/fotos/comunidad-800.webp 800w, /web/fotos/comunidad-1600.webp 1600w" sizes="(min-width: 768px) 50vw, 100vw" width={1600} height={1068} alt={tr(H.commAlt, lang)} loading="lazy" decoding="async" className="photo-card aspect-[4/3] w-full object-cover" />
        </Reveal>
        <div>
          <p className="eyebrow">{tr(H.commEyebrow, lang)}</p>
          <h2 id="comm-title" className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {tr(H.commTitle, lang)}
          </h2>
          <p className="mt-4 text-lg text-muted">{tr(H.commBody, lang)}</p>
          <ul className="mt-5 space-y-2">
            {COMM_POINTS.map((pt) => (
              <li key={pt.es} className="flex items-center gap-2">
                <BadgeCheck size={18} className="shrink-0 text-sage" aria-hidden /> {tr(pt, lang)}
              </li>
            ))}
          </ul>
          <Link href="/descargar" className="btn btn-hero mt-7 sm:!w-auto">
            <Download size={18} aria-hidden /> {tr(H.download, lang)}
          </Link>
        </div>
      </section>

      {/* ── Cuestionario: prueba gratis en la web ── */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.6fr]">
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustración WebP ya optimizada */}
        <img src="/ill/bienvenida-960.webp" srcSet="/ill/bienvenida-640.webp 640w, /ill/bienvenida-960.webp 960w" sizes="(min-width: 1024px) 35vw, 100vw" width={960} height={549} alt={tr(H.quizAlt, lang)} loading="lazy" className="hidden w-full rounded-2xl border border-border lg:block lg:sticky lg:top-24" />
        <RoadmapQuiz lang={lang} guides={guideInfo} />
      </div>

      {/* ── Trámites por momento del viaje ── */}
      <section className="band -mx-4 px-4 py-16" aria-labelledby="stages-title">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">{tr(H.stagesEyebrow, lang)}</p>
            <h2 id="stages-title" className="mt-2 text-3xl font-bold tracking-tight">
              {tr(H.stages, lang)}
            </h2>
            <p className="mt-2 text-muted">{tr(H.stagesSub, lang)}</p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {STAGES.map((st) => (
              <section key={st.id} className="card h-full overflow-hidden !pt-0" aria-labelledby={`stage-${st.id}`} data-testid={`stage-${st.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- foto WebP ya optimizada */}
                <img src={`/web/fotos/${STAGE_PHOTO[st.id] ?? "papeles"}-800.webp`} width={800} height={533} alt="" loading="lazy" decoding="async" className="-mx-5 mb-4 aspect-[16/9] w-[calc(100%+2.5rem)] max-w-none object-cover" />
                <h3 id={`stage-${st.id}`} className="text-lg font-bold">
                  {tr(st.title, lang)}
                </h3>
                <p className="mt-1 text-sm text-muted">{tr(st.pain, lang)}</p>
                <ul className="mt-4 space-y-2">
                  {st.slugs.map((slug) => {
                    const g = getGuide(slug);
                    return g ? (
                      <li key={slug}>
                        <Link href={`/guias/${slug}`} className="group flex min-h-11 items-center gap-3 rounded-xl border border-border p-2 pe-3 transition hover:border-brand">
                          <GuideThumb slug={slug} className="!h-11 !w-14 shrink-0 rounded-lg" />
                          <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{tr(g.title, lang)}</span>
                          <ArrowRight size={16} className="shrink-0 text-muted group-hover:text-brand rtl:rotate-180" aria-hidden />
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
              </section>
            ))}
          </div>
          <Link href="/guias" className="mt-6 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
            {tr(H.allGuides, lang)} <ArrowRight size={18} className="rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── Cómo empezar ── */}
      <section aria-labelledby="how-title">
        <div className="text-center">
          <p className="eyebrow">{tr(H.howEyebrow, lang)}</p>
          <h2 id="how-title" className="mt-2 text-3xl font-bold tracking-tight">
            {tr(H.how, lang)}
          </h2>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustración WebP ya optimizada */}
        <img src="/web/fotos/oficina-800.webp" width={800} height={1200} alt={tr(H.howAlt, lang)} loading="lazy" decoding="async" className="photo-card mx-auto mt-8 aspect-[16/8] w-full max-w-4xl object-cover object-[50%_72%]" />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.es} className="card text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand text-lg font-bold text-on-brand">{i + 1}</span>
              <p className="mt-4 text-lg font-semibold">{s[lang]}</p>
              <p className="mt-1 text-muted">{s.d[lang]}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Oficinas (información) ── */}
      <section aria-labelledby="centers-title">
        <h2 id="centers-title" className="text-2xl font-bold tracking-tight">
          {tr(H.centers, lang)}
        </h2>
        <p className="mt-1 text-muted">{tr(H.centersSub, lang)}</p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c) => (
            <li key={c.id} className="card flex h-full flex-col overflow-hidden !p-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- WebP ya optimizados */}
              <img src={`/centros/${c.img}-640.webp`} width={640} height={366} loading="lazy" decoding="async" alt="" className="aspect-[7/4] w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
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
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">{tr(H.photoNote, lang)}</p>
      </section>

      {/* ── Estafas ── */}
      <Link href="/guias/decreto-flussi" className="card card-link flex items-center gap-4 !border-accent/50 !bg-warn-bg text-warn-fg">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-card text-brand">
          <ShieldAlert size={24} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold text-foreground">{tr(H.scamTitle, lang)}</span>
          <span className="mt-1 block text-sm">{tr(H.scam, lang)}</span>
        </span>
        <ArrowRight size={22} className="shrink-0 text-brand rtl:rotate-180" aria-hidden />
      </Link>

      {/* ── Llamada final ── */}
      <section className="app-card relative overflow-hidden rounded-[28px] px-6 py-12 text-center text-white sm:px-12" data-testid="final-cta">
        <Languages size={32} className="mx-auto text-white/80" aria-hidden />
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{tr(H.finalTitle, lang)}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/90">{tr(H.finalSub, lang)}</p>
        <div className="mt-7 flex justify-center">
          <DownloadButtons lang={lang} light />
        </div>
      </section>

      <AdSlot placement="home" lang={lang} />
      <p className="-mt-14 text-center text-xs text-muted">{tr(H.photoCredit, lang)}</p>
    </div>
  );
}
