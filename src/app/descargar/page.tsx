import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Bell, Bot, CheckCircle2, Download, FileCheck2, Languages, ListChecks, Lock, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { APP } from "@/config/app";
import { Logo } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = {
  title: "Descargar la app · Scarica l'app",
  description: "A posto: la app gratuita que te guía en tus trámites en Italia. Disponible para Android y iPhone.",
};

const T = {
  es: {
    kicker: "App gratuita para Android y iPhone",
    title: "Tus trámites en Italia, en regla.",
    sub: "A posto te dice qué hacer, qué documentos preparar y adónde ir. Paso a paso, con fuentes oficiales y en tu idioma.",
    play: ["Disponible en", "Google Play"],
    store: ["Consíguelo en el", "App Store"],
    soon: "Próximamente",
    freeNote: "Gratis. Sin tarjeta. Sin suscripción.",
    whatTitle: "Qué hace A posto",
    features: [
      ["Guías paso a paso", "Permiso de residencia, código fiscal, sanidad, residencia, art. 31 y más, con los formularios oficiales."],
      ["Tu progreso guardado", "Marca cada paso y cada documento. La app te recuerda qué te falta y dónde lo dejaste."],
      ["Recordatorios", "Apunta tus citas y fechas límite para no perder ninguna."],
      ["Asistente con IA", "Pregunta con tus palabras. Las primeras preguntas son gratis."],
      ["9 idiomas", "Español, italiano, inglés, francés, árabe, rumano, albanés, ucraniano y bengalí."],
    ],
    trustTitle: "Por qué puedes confiar",
    trust: [
      ["Fuentes oficiales", "Cada guía enlaza a la Polizia di Stato, INPS, Agenzia delle Entrate o al Ministerio, con su fecha de revisión."],
      ["Tus datos son tuyos", "Pedimos lo mínimo. Puedes ver, descargar y borrar todo desde la app, cuando quieras."],
      ["Sin letra pequeña", "No vendemos tus datos. No pedimos dinero por un trámite. No prometemos permisos."],
      ["Independiente", "A posto no es una web del Gobierno ni de una agencia. Es información general, no asesoramiento legal."],
    ],
    apkTitle: "Descarga directa para Android (APK)",
    apkBody: "Si prefieres no usar Google Play, puedes instalar el archivo oficial firmado por A posto. Recomendamos Google Play: se actualiza solo.",
    apkCta: "Descargar APK",
    apkVersion: "Versión",
    apkHash: "Huella SHA-256 del archivo (para comprobar que es auténtico):",
    apkSteps: ["Descarga el archivo desde esta página.", "Ábrelo. Android te pedirá permitir la instalación desde tu navegador: acepta solo para esta instalación.", "Pulsa «Instalar»."],
    apkWarn: "Descarga el APK solo desde esta página. No instales copias que te envíen por WhatsApp, Telegram u otras webs.",
    apkSoon: "La descarga directa estará disponible junto con la versión de Google Play.",
    privacy: "Política de privacidad",
    del: "Eliminar mi cuenta",
    about: "Quiénes somos",
    web: "Usar la versión web",
  },
  it: {
    kicker: "App gratuita per Android e iPhone",
    title: "Le tue pratiche in Italia, a posto.",
    sub: "A posto ti dice cosa fare, quali documenti preparare e dove andare. Passo dopo passo, con fonti ufficiali e nella tua lingua.",
    play: ["Disponibile su", "Google Play"],
    store: ["Scarica su", "App Store"],
    soon: "Prossimamente",
    freeNote: "Gratis. Senza carta. Senza abbonamento.",
    whatTitle: "Cosa fa A posto",
    features: [
      ["Guide passo dopo passo", "Permesso di soggiorno, codice fiscale, sanità, residenza, art. 31 e altro, con i moduli ufficiali."],
      ["I tuoi progressi salvati", "Segna ogni passaggio e ogni documento. L'app ti ricorda cosa manca e dove eri rimasto."],
      ["Promemoria", "Annota appuntamenti e scadenze per non perderne nessuno."],
      ["Assistente con IA", "Chiedi con parole tue. Le prime domande sono gratuite."],
      ["9 lingue", "Spagnolo, italiano, inglese, francese, arabo, rumeno, albanese, ucraino e bengalese."],
    ],
    trustTitle: "Perché puoi fidarti",
    trust: [
      ["Fonti ufficiali", "Ogni guida rimanda a Polizia di Stato, INPS, Agenzia delle Entrate o al Ministero, con la data di verifica."],
      ["I dati sono tuoi", "Chiediamo il minimo. Puoi vedere, scaricare ed eliminare tutto dall'app, quando vuoi."],
      ["Nessuna sorpresa", "Non vendiamo i tuoi dati. Non chiediamo denaro per una pratica. Non promettiamo permessi."],
      ["Indipendente", "A posto non è un sito del Governo né di un'agenzia. Sono informazioni generali, non consulenza legale."],
    ],
    apkTitle: "Download diretto per Android (APK)",
    apkBody: "Se preferisci non usare Google Play, puoi installare il file ufficiale firmato da A posto. Consigliamo Google Play: si aggiorna da solo.",
    apkCta: "Scarica APK",
    apkVersion: "Versione",
    apkHash: "Impronta SHA-256 del file (per verificare che sia autentico):",
    apkSteps: ["Scarica il file da questa pagina.", "Aprilo. Android chiederà di consentire l'installazione dal browser: accetta solo per questa installazione.", "Tocca «Installa»."],
    apkWarn: "Scarica l'APK solo da questa pagina. Non installare copie ricevute su WhatsApp, Telegram o altri siti.",
    apkSoon: "Il download diretto sarà disponibile insieme alla versione su Google Play.",
    privacy: "Informativa sulla privacy",
    del: "Elimina il mio account",
    about: "Chi siamo",
    web: "Usa la versione web",
  },
  en: {
    kicker: "Free app for Android and iPhone",
    title: "Your paperwork in Italy, sorted.",
    sub: "A posto tells you what to do, which documents to prepare and where to go. Step by step, with official sources and in your language.",
    play: ["Get it on", "Google Play"],
    store: ["Download on the", "App Store"],
    soon: "Coming soon",
    freeNote: "Free. No card. No subscription.",
    whatTitle: "What A posto does",
    features: [
      ["Step-by-step guides", "Residence permit, tax code, healthcare, residency, art. 31 and more, with the official forms."],
      ["Your progress, saved", "Tick each step and document. The app reminds you what's left and where you stopped."],
      ["Reminders", "Note your appointments and deadlines so you never miss one."],
      ["AI assistant", "Ask in your own words. Your first questions are free."],
      ["9 languages", "Spanish, Italian, English, French, Arabic, Romanian, Albanian, Ukrainian and Bengali."],
    ],
    trustTitle: "Why you can trust it",
    trust: [
      ["Official sources", "Every guide links to Polizia di Stato, INPS, Agenzia delle Entrate or the Ministry, with its review date."],
      ["Your data is yours", "We ask for the minimum. You can view, download and delete everything from the app, any time."],
      ["No small print", "We don't sell your data. We don't ask for money for a procedure. We don't promise permits."],
      ["Independent", "A posto is not a government or agency website. It is general information, not legal advice."],
    ],
    apkTitle: "Direct download for Android (APK)",
    apkBody: "If you prefer not to use Google Play, you can install the official file signed by A posto. We recommend Google Play: it updates automatically.",
    apkCta: "Download APK",
    apkVersion: "Version",
    apkHash: "SHA-256 fingerprint of the file (to check it is authentic):",
    apkSteps: ["Download the file from this page.", "Open it. Android will ask to allow installing from your browser: accept only for this install.", "Tap “Install”."],
    apkWarn: "Download the APK only from this page. Do not install copies sent over WhatsApp, Telegram or other websites.",
    apkSoon: "The direct download will be available together with the Google Play version.",
    privacy: "Privacy policy",
    del: "Delete my account",
    about: "About us",
    web: "Use the web version",
  },
};

const FEATURE_ICONS = [ListChecks, FileCheck2, Bell, Bot, Languages];
const TRUST_ICONS = [BadgeCheck, Lock, ShieldCheck, CheckCircle2];

/**
 * Botón de tienda. Sin enlace configurado se muestra desactivado con «Próximamente», nunca un enlace roto.
 * Antes de publicar, sustituye estos botones por las insignias oficiales de Google y Apple
 * (cada una tiene sus normas de uso de marca; ver docs/10-publicar-en-tiendas.md).
 */
function StoreButton({ href, lines, soon }: { href: string; lines: string[]; soon: string }) {
  const inner = (
    <>
      <Smartphone size={26} aria-hidden />
      <span className="text-start leading-tight">
        <span className="block text-[11px] opacity-80">{lines[0]}</span>
        <span className="block text-lg font-semibold">{lines[1]}</span>
      </span>
    </>
  );
  const cls = "inline-flex min-h-14 min-w-52 items-center gap-3 rounded-2xl bg-[#1f1b18] px-5 py-2 text-white";
  if (!href) {
    return (
      <span className={`${cls} relative opacity-70`} aria-disabled="true">
        {inner}
        <span className="absolute -top-3 end-3 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#5d4037]">{soon}</span>
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${cls} transition-transform hover:-translate-y-0.5`}>
      {inner}
    </a>
  );
}

/** Dibujo de un teléfono con la pantalla de progreso de la app. Es una ilustración, no una captura. */
function PhoneMockup() {
  return (
    <div className="mx-auto w-56 rounded-[2.2rem] border-[6px] border-[#1f1b18] bg-[#f7f2ea] p-3 text-[#34312e] shadow-2xl" aria-hidden>
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[#1f1b18]/20" />
      <p className="text-sm font-bold">Hola, Ana</p>
      <div className="mt-2 rounded-2xl bg-[#dce6d8] p-3">
        <p className="text-[10px] font-semibold text-[#3d5238]">Codice fiscale</p>
        <div className="mt-2 h-2 rounded-full bg-white/70">
          <div className="h-2 w-2/3 rounded-full bg-[#c77b59]" />
        </div>
        <p className="mt-1 text-[9px]">2 / 3</p>
      </div>
      {[true, true, false].map((done, i) => (
        <div key={i} className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2">
          <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${done ? "border-[#91a58b] bg-[#91a58b]" : "border-[#ede2d3]"}`}>
            {done && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
          <span className={`h-2 flex-1 rounded-full ${done ? "bg-[#ede2d3]" : "bg-[#d9cdbc]"}`} />
        </div>
      ))}
      <div className="mt-3 rounded-xl bg-[#a65d3d] py-2 text-center text-[10px] font-semibold text-white">A posto ✓</div>
    </div>
  );
}

export default async function DownloadPage() {
  const s = T[await getLang()];
  return (
    <div className="space-y-12">
      <section className="hero -mx-4 -mt-6 px-4 py-12 sm:mx-0 sm:mt-0 sm:rounded-3xl sm:px-10 sm:py-14">
        <div className="relative grid items-center gap-10 sm:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="fade-up inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Logo size={18} /> {s.kicker}
            </p>
            <h1 className="fade-up mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl" style={{ animationDelay: "80ms" }}>
              {s.title}
            </h1>
            <p className="fade-up mt-4 text-lg text-white/90" style={{ animationDelay: "160ms" }}>
              {s.sub}
            </p>
            <div className="fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <StoreButton href={APP.googlePlayUrl} lines={s.play} soon={s.soon} />
              <StoreButton href={APP.appStoreUrl} lines={s.store} soon={s.soon} />
            </div>
            <p className="mt-4 text-sm text-white/80">{s.freeNote}</p>
          </div>
          <div className="fade-up" style={{ animationDelay: "200ms" }}>
            <PhoneMockup />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight">{s.whatTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.features.map(([title, body], i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <Reveal key={title} delay={i * 60}>
                <div className="card h-full">
                  <span className="icon-tile">
                    <Icon size={22} aria-hidden />
                  </span>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight">{s.trustTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.trust.map(([title, body], i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <Reveal key={title} delay={i * 60}>
                <div className="card flex h-full gap-3">
                  <span className="icon-tile">
                    <Icon size={22} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted">{body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/privacidad" className="inline-flex items-center gap-1.5 text-brand underline">
            <Lock size={15} aria-hidden /> {s.privacy}
          </Link>
          <Link href="/eliminar-cuenta" className="inline-flex items-center gap-1.5 text-brand underline">
            <Trash2 size={15} aria-hidden /> {s.del}
          </Link>
          <Link href="/sobre" className="text-brand underline">
            {s.about}
          </Link>
          <Link href="/" className="text-brand underline">
            {s.web}
          </Link>
        </p>
      </section>

      <section id="apk" className="card">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Download size={22} className="text-brand" aria-hidden /> {s.apkTitle}
        </h2>
        <p className="mt-2 text-sm text-muted">{s.apkBody}</p>
        {APP.apkUrl ? (
          <>
            <a href={APP.apkUrl} className="btn-ghost mt-4" rel="noopener noreferrer">
              <Download size={18} aria-hidden /> {s.apkCta}
              {APP.apkVersion && (
                <span className="text-muted">
                  · {s.apkVersion} {APP.apkVersion}
                </span>
              )}
            </a>
            <ol className="mt-4 list-decimal space-y-1 ps-5 text-sm">
              {s.apkSteps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            {APP.apkSha256 && (
              <p className="mt-4 text-xs text-muted">
                {s.apkHash}
                <code className="mt-1 block break-all rounded-lg bg-background p-2 font-mono text-[11px] text-foreground">{APP.apkSha256}</code>
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 rounded-xl bg-brand-soft p-3 text-sm">{s.apkSoon}</p>
        )}
        <p className="mt-4 rounded-xl bg-warn-bg p-3 text-sm text-warn-fg">{s.apkWarn}</p>
      </section>
    </div>
  );
}
