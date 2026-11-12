import type { Metadata } from "next";
import { BadgeCheck, Bot, CalendarCheck, HandCoins, Lock, ShieldAlert } from "lucide-react";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Quiénes somos" };

const T = {
  es: {
    title: "Quiénes somos y cómo trabajamos",
    intro: "Emilly es un proyecto independiente creado en Italia para ayudar a las personas migrantes a orientarse en los trámites. No somos una web del Gobierno, ni un despacho de abogados, ni una agencia.",
    items: [
      ["De dónde sale la información", "De webs oficiales: Polizia di Stato, INPS, Agenzia delle Entrate, Ministerio del Interior y Ministerio de Trabajo. Cada guía muestra sus fuentes para que puedas comprobarlas."],
      ["Cada cuánto se revisa", "Cada semana. En cada guía verás la fecha de la última revisión, y un aviso si lleva más de 7 días sin revisarse."],
      ["Qué hace el asistente", "Es una inteligencia artificial. Responde con la información verificada de Emilly y te remite a la fuente oficial. Puede equivocarse: no sustituye a un abogado ni a un Patronato."],
      ["Qué hacemos con tus datos", "Pedimos lo mínimo. Los datos se guardan en servidores de la Unión Europea, no se venden y puedes borrar tu cuenta cuando quieras."],
      ["Cómo se financia", "La información es gratis para ti. La app puede mostrar anuncios, siempre etiquetados como «Publicidad», de servicios legales y útiles. No aceptamos anuncios de «contratos de trabajo», «visados» ni préstamos abusivos."],
      ["Lo que nunca haremos", "Pedirte dinero por un trámite, pedirte contraseñas o códigos, ni prometerte un permiso. Si alguien lo hace en nombre de Emilly, es una estafa."],
    ],
  },
  en: {
    title: "Who we are and how we work",
    intro: "Emilly is an independent project created in Italy to help migrants find their way through paperwork. We are not a government website, a law firm or an agency.",
    items: [
      ["Where the information comes from", "From official websites: Polizia di Stato, INPS, Agenzia delle Entrate, the Ministry of the Interior and the Ministry of Labour. Every guide shows its sources so you can check them."],
      ["How often it is checked", "Every week. Each guide shows the date of its last check, and a warning if more than 7 days have passed."],
      ["What the assistant does", "It is an artificial intelligence. It answers using Emilly's verified information and points you to the official source. It can make mistakes: it does not replace a lawyer or a Patronato."],
      ["What we do with your data", "We ask for the minimum. Data is stored on servers in the European Union, is not sold, and you can delete your account at any time."],
      ["How it is funded", "The information is free for you. The app may show ads, always labelled “Advertisement”, for legal and useful services. We do not accept ads for “job contracts”, “visas” or predatory loans."],
      ["What we will never do", "Ask you for money for a procedure, ask for passwords or codes, or promise you a permit. If someone does so in Emilly's name, it is a scam."],
    ],
  },
  it: {
    title: "Chi siamo e come lavoriamo",
    intro: "Emilly è un progetto indipendente nato in Italia per aiutare le persone migranti a orientarsi tra le pratiche. Non siamo un sito del Governo, né uno studio legale, né un'agenzia.",
    items: [
      ["Da dove vengono le informazioni", "Da siti ufficiali: Polizia di Stato, INPS, Agenzia delle Entrate, Ministero dell'Interno e Ministero del Lavoro. Ogni guida mostra le sue fonti."],
      ["Ogni quanto si verifica", "Ogni settimana. In ogni guida trovi la data dell'ultima verifica."],
      ["Cosa fa l'assistente", "È un'intelligenza artificiale. Risponde con le informazioni verificate di Emilly e rimanda alla fonte ufficiale. Può sbagliare: non sostituisce un avvocato o un Patronato."],
      ["Cosa facciamo con i tuoi dati", "Chiediamo il minimo. I dati sono su server nell'Unione Europea, non vengono venduti e puoi cancellare l'account quando vuoi."],
      ["Come si finanzia", "Le informazioni sono gratuite. L'app può mostrare annunci, sempre indicati come «Pubblicità», di servizi legali e utili."],
      ["Cosa non faremo mai", "Chiederti denaro per una pratica, password o codici, né prometterti un permesso. Se qualcuno lo fa a nome di Emilly, è una truffa."],
    ],
  },
};

const ICONS = [BadgeCheck, CalendarCheck, Bot, Lock, HandCoins, ShieldAlert];

export default async function AboutPage() {
  const s = T[await getLang()];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{s.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{s.intro}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {s.items.map(([title, body], i) => {
          const Icon = ICONS[i];
          return (
            <section key={title} className="card">
              <span className="icon-tile">
                <Icon size={22} aria-hidden />
              </span>
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
