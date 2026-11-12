import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { APP } from "@/config/app";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Eliminar cuenta / Elimina account" };

/**
 * Página pública para pedir el borrado de la cuenta sin tener la app instalada.
 * Google Play exige indicar una URL como esta en la ficha de la aplicación.
 */
const T = {
  es: {
    title: "Eliminar tu cuenta de A posto",
    intro: "Puedes borrar tu cuenta y todos tus datos cuando quieras. Es inmediato y no se puede deshacer.",
    appTitle: "Desde la app",
    app: ["Abre A posto y entra en «Perfil».", "Baja hasta el final y pulsa «Borrar mi cuenta y mis datos».", "Confirma."],
    webTitle: "Desde la web",
    web: "Inicia sesión, abre «Mi perfil», marca «Confirmo» y pulsa «Borrar mi cuenta y mis datos».",
    webCta: "Ir a mi perfil",
    whatTitle: "Qué se borra",
    what: "Tu cuenta (correo o teléfono), tu perfil, tus trámites y progreso, recordatorios, intereses, historial de actividad, estadísticas de uso, tus preguntas restantes y tus mensajes del foro. No conservamos copias asociadas a ti.",
    helpTitle: "¿No puedes entrar en tu cuenta?",
    help: "Escríbenos desde el correo o teléfono de la cuenta y la borraremos en un máximo de 30 días.",
    pending: "El correo de contacto se publicará aquí antes del lanzamiento.",
  },
  it: {
    title: "Eliminare il tuo account A posto",
    intro: "Puoi eliminare l'account e tutti i tuoi dati quando vuoi. È immediato e non si può annullare.",
    appTitle: "Dall'app",
    app: ["Apri A posto ed entra in «Profilo».", "Scorri fino in fondo e premi «Elimina il mio account e i miei dati».", "Conferma."],
    webTitle: "Dal sito",
    web: "Accedi, apri «Il mio profilo», spunta la conferma e premi il pulsante di eliminazione.",
    webCta: "Vai al mio profilo",
    whatTitle: "Cosa viene eliminato",
    what: "Account (email o telefono), profilo, pratiche e progressi, promemoria, interessi, cronologia attività, statistiche di utilizzo, domande residue e messaggi del forum. Non conserviamo copie associate a te.",
    helpTitle: "Non riesci ad accedere?",
    help: "Scrivici dall'email o dal telefono dell'account e lo elimineremo entro 30 giorni.",
    pending: "L'email di contatto sarà pubblicata qui prima del lancio.",
  },
  en: {
    title: "Delete your A posto account",
    intro: "You can delete your account and all your data whenever you want. It is immediate and cannot be undone.",
    appTitle: "From the app",
    app: ["Open A posto and go to “Profile”.", "Scroll to the bottom and tap “Delete my account and data”.", "Confirm."],
    webTitle: "From the website",
    web: "Sign in, open “My profile”, tick the confirmation and press the delete button.",
    webCta: "Go to my profile",
    whatTitle: "What is deleted",
    what: "Your account (email or phone), profile, procedures and progress, reminders, interests, activity history, usage statistics, remaining questions and forum posts. We keep no copies linked to you.",
    helpTitle: "Can't sign in?",
    help: "Write to us from the account's email or phone and we will delete it within 30 days.",
    pending: "The contact email will be published here before launch.",
  },
};

export default async function DeleteAccountPage() {
  const s = T[await getLang()];
  return (
    <article className="max-w-2xl space-y-5">
      <span className="icon-tile">
        <Trash2 size={22} aria-hidden />
      </span>
      <h1 className="text-3xl font-bold tracking-tight">{s.title}</h1>
      <p className="text-muted">{s.intro}</p>
      <section className="card">
        <h2 className="font-semibold">{s.appTitle}</h2>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm">
          {s.app.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </section>
      <section className="card">
        <h2 className="font-semibold">{s.webTitle}</h2>
        <p className="mt-2 text-sm">{s.web}</p>
        <Link href="/perfil" className="btn mt-3">
          {s.webCta}
        </Link>
      </section>
      <section className="card">
        <h2 className="font-semibold">{s.whatTitle}</h2>
        <p className="mt-2 text-sm">{s.what}</p>
      </section>
      <section className="card">
        <h2 className="font-semibold">{s.helpTitle}</h2>
        <p className="mt-2 text-sm">{s.help}</p>
        <p className="mt-2 text-sm font-medium">{APP.contactEmail ? <a href={`mailto:${APP.contactEmail}`}>{APP.contactEmail}</a> : s.pending}</p>
      </section>
    </article>
  );
}
