"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, Download, Map, RotateCcw, Share, Smartphone } from "lucide-react";
import { useState } from "react";
import type { Lang } from "@/content/types";
import { roadmap, type Answers, type Device, type Goal, type Situation } from "@/content/journey";

type GuideInfo = { title: string; summary: string };
type Opt<T> = { v: T; label: Record<Lang, string> };

const SITUATIONS: Opt<Situation>[] = [
  { v: "abroad", label: { es: "Aún no estoy en Italia", en: "I'm not in Italy yet", it: "Non sono ancora in Italia" } },
  { v: "arrived", label: { es: "Acabo de llegar", en: "I just arrived", it: "Sono appena arrivato" } },
  { v: "undocumented", label: { es: "Ya vivo en Italia sin papeles", en: "I live in Italy without papers", it: "Vivo in Italia senza documenti" } },
  { v: "permit", label: { es: "Tengo permiso y quiero renovarlo o pedir la ciudadanía", en: "I have a permit and want to renew it or apply for citizenship", it: "Ho il permesso e voglio rinnovarlo o chiedere la cittadinanza" } },
];
const GOALS: Opt<Goal>[] = [
  { v: "work", label: { es: "Trabajar legalmente", en: "Work legally", it: "Lavorare in regola" } },
  { v: "health", label: { es: "Ir al médico / Sanidad", en: "See a doctor / Healthcare", it: "Andare dal medico / Sanità" } },
  { v: "residence", label: { es: "Empadronarme / Residencia", en: "Register my address / Residence", it: "Prendere la residenza" } },
  { v: "family", label: { es: "Reagrupación / Familia", en: "Family / Reunification", it: "Famiglia / Ricongiungimento" } },
];
const CF: Opt<boolean>[] = [
  { v: true, label: { es: "Sí", en: "Yes", it: "Sì" } },
  { v: false, label: { es: "No", en: "No", it: "No" } },
];
const DEVICES: Opt<Device>[] = [
  { v: "android", label: { es: "Android", en: "Android", it: "Android" } },
  { v: "iphone", label: { es: "iPhone", en: "iPhone", it: "iPhone" } },
  { v: "computer", label: { es: "Ordenador", en: "Computer", it: "Computer" } },
];

const T = {
  title: { es: "Tu hoja de ruta en Italia en 1 minuto", en: "Your roadmap in Italy in 1 minute", it: "La tua tabella di marcia in Italia in 1 minuto" },
  sub: { es: "4 preguntas. Sin cuenta y sin descargar nada.", en: "4 questions. No account, nothing to download.", it: "4 domande. Senza account e senza scaricare nulla." },
  q: [
    { es: "¿Cuál es tu situación actual?", en: "What is your situation right now?", it: "Qual è la tua situazione attuale?" },
    { es: "¿Cuál es tu objetivo principal ahora mismo?", en: "What is your main goal right now?", it: "Qual è il tuo obiettivo principale adesso?" },
    { es: "¿Tienes ya tu Codice Fiscale?", en: "Do you already have your Codice Fiscale?", it: "Hai già il codice fiscale?" },
    { es: "¿Qué teléfono usas?", en: "Which phone do you use?", it: "Che telefono usi?" },
  ],
  step: { es: "Paso", en: "Step", it: "Passo" },
  of: { es: "de", en: "of", it: "di" },
  back: { es: "Atrás", en: "Back", it: "Indietro" },
  resultTitle: { es: "Tus 3 primeros trámites", en: "Your first 3 procedures", it: "Le tue prime 3 pratiche" },
  resultSub: { es: "En este orden. Cada uno abre la guía paso a paso.", en: "In this order. Each one opens the step-by-step guide.", it: "In quest'ordine. Ognuna apre la guida passo dopo passo." },
  restart: { es: "Empezar de nuevo", en: "Start again", it: "Ricomincia" },
  androidText: {
    es: "Guarda esta ruta en tu bolsillo. Descarga la app A Posto gratis para marcar tus avances, guardar tus PDFs sin internet y recibir recordatorios.",
    en: "Keep this roadmap in your pocket. Download the free A Posto app to track your progress, keep your PDFs offline and get reminders.",
    it: "Porta questa tabella di marcia in tasca. Scarica gratis l'app A Posto per segnare i progressi, salvare i PDF senza internet e ricevere promemoria.",
  },
  androidCta: { es: "Descargar gratis para Android", en: "Download free for Android", it: "Scarica gratis per Android" },
  iphoneText: {
    es: "Guarda A Posto en tu iPhone sin descargar nada: ábrela en Safari, pulsa el icono de Compartir y elige «Añadir a pantalla de inicio» para tener tu ruta siempre a mano.",
    en: "Keep A Posto on your iPhone without downloading anything: open it in Safari, tap the Share icon and choose “Add to Home Screen” to have your roadmap always at hand.",
    it: "Tieni A Posto sull'iPhone senza scaricare nulla: aprila in Safari, tocca l'icona Condividi e scegli «Aggiungi alla schermata Home» per avere sempre a portata di mano la tua tabella di marcia.",
  },
  iphoneCta: { es: "Abrir A Posto en Safari", en: "Open A Posto in Safari", it: "Apri A Posto in Safari" },
  computerText: {
    es: "Lleva esta ruta en tu móvil: abre este enlace en tu teléfono e instala A Posto gratis para marcar avances y recibir recordatorios.",
    en: "Take this roadmap on your phone: open this link on your phone and install A Posto for free to track progress and get reminders.",
    it: "Porta questa tabella di marcia sul telefono: apri questo link sul cellulare e installa A Posto gratis per segnare i progressi e ricevere promemoria.",
  },
  copy: { es: "Copiar el enlace", en: "Copy the link", it: "Copia il link" },
  copied: { es: "Enlace copiado", en: "Link copied", it: "Link copiato" },
  free: { es: "Gratis · En tu idioma · Tus documentos solo en tu teléfono", en: "Free · In your language · Your documents only on your phone", it: "Gratis · Nella tua lingua · I tuoi documenti solo sul telefono" },
} as const;

const LINK = "https://apostoapp.app/descargar";

function Options<V>({ opts, lang, onPick }: { opts: Opt<V>[]; lang: Lang; onPick: (v: V) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {opts.map((o) => (
        <button key={String(o.v)} type="button" onClick={() => onPick(o.v)} className="quiz-option flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-start font-medium transition hover:border-brand hover:bg-brand-soft">
          <span>{o.label[lang]}</span>
          <ArrowRight size={18} className="shrink-0 text-brand rtl:rotate-180" aria-hidden />
        </button>
      ))}
    </div>
  );
}

/** Cuestionario de 4 pasos que funciona entero en el navegador y termina invitando a usar la app. */
export function RoadmapQuiz({ lang, guides }: { lang: Lang; guides: Record<string, GuideInfo> }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Partial<Answers>>({});
  const [copied, setCopied] = useState(false);
  const done = step === 4;
  const result = done ? roadmap(a as Answers) : [];
  const pct = Math.round((step / 4) * 100);
  const next = (patch: Partial<Answers>) => {
    setA((x) => ({ ...x, ...patch }));
    setStep((s) => s + 1);
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(LINK);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="hoja-de-ruta" className="card scroll-mt-24 space-y-5 !p-5 sm:!p-7" aria-labelledby="quiz-title" data-testid="roadmap-quiz">
      <div>
        <h2 id="quiz-title" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Map size={24} className="shrink-0 text-brand" aria-hidden /> {T.title[lang]}
        </h2>
        <p className="mt-1 text-muted">{T.sub[lang]}</p>
      </div>

      <div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--ap-beige)]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={T.title[lang]}>
          <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        {!done && (
          <p className="mt-2 text-sm text-muted" data-testid="quiz-step">
            {T.step[lang]} {step + 1} {T.of[lang]} 4
          </p>
        )}
      </div>

      <div key={step} className="fade-up space-y-4" aria-live="polite">
        {!done && <h3 className="text-xl font-semibold">{T.q.at(step)?.[lang]}</h3>}
        {step === 0 && <Options opts={SITUATIONS} lang={lang} onPick={(situation) => next({ situation })} />}
        {step === 1 && <Options opts={GOALS} lang={lang} onPick={(goal) => next({ goal })} />}
        {step === 2 && <Options opts={CF} lang={lang} onPick={(hasCf) => next({ hasCf })} />}
        {step === 3 && <Options opts={DEVICES} lang={lang} onPick={(device) => next({ device })} />}

        {done && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold">{T.resultTitle[lang]}</h3>
              <p className="text-sm text-muted">{T.resultSub[lang]}</p>
            </div>
            <ol className="space-y-2" data-testid="quiz-result">
              {result.map((slug, i) => (
                <li key={slug}>
                  <Link href={`/guias/${slug}`} className="card card-link flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-on-brand">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{guides[slug]?.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{guides[slug]?.summary}</span>
                    </span>
                    <ArrowRight size={18} className="mt-1 shrink-0 text-brand rtl:rotate-180" aria-hidden />
                  </Link>
                </li>
              ))}
            </ol>

            <div className="app-card relative overflow-hidden rounded-[20px] p-5 text-white" data-testid={`quiz-cta-${a.device}`}>
              <p className="relative z-10 font-semibold leading-snug">
                {a.device === "android" ? T.androidText[lang] : a.device === "iphone" ? T.iphoneText[lang] : T.computerText[lang]}
              </p>
              <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                {a.device === "android" && (
                  <Link href="/descargar#apk" className="btn !border-white !bg-white !text-[var(--ap-sage-dark)]">
                    <Download size={18} aria-hidden /> {T.androidCta[lang]}
                  </Link>
                )}
                {a.device === "iphone" && (
                  <a href="/app" className="btn !border-white !bg-white !text-[var(--ap-sage-dark)]">
                    <Share size={18} aria-hidden /> {T.iphoneCta[lang]}
                  </a>
                )}
                {a.device === "computer" && (
                  <>
                    <button type="button" onClick={copy} className="btn !border-white !bg-white !text-[var(--ap-sage-dark)]">
                      {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />} {copied ? T.copied[lang] : T.copy[lang]}
                    </button>
                    <Link href="/descargar" className="btn btn-hero-outline !border-white !bg-transparent !text-white">
                      <Smartphone size={18} aria-hidden /> apostoapp.app/descargar
                    </Link>
                  </>
                )}
              </div>
              <p className="relative z-10 mt-3 text-xs text-white/85">{T.free[lang]}</p>
            </div>
          </div>
        )}
      </div>

      {step > 0 && (
        <button type="button" onClick={() => (done ? (setStep(0), setA({}), setCopied(false)) : setStep((s) => s - 1))} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand">
          {done ? <RotateCcw size={16} aria-hidden /> : <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden />} {done ? T.restart[lang] : T.back[lang]}
        </button>
      )}
    </section>
  );
}
