import { getLang } from "@/lib/lang";

const T = {
  es: {
    title: "Instala Emilly en tu celular",
    intro: "Es gratis, no ocupa casi espacio y se abre como cualquier app, con su icono en la pantalla de inicio.",
    android: "Android (Chrome)",
    androidSteps: ["Abre esta página en Chrome.", "Pulsa los tres puntitos ⋮ arriba a la derecha.", "Pulsa «Instalar app» o «Añadir a pantalla de inicio».", "Confirma con «Instalar»."],
    iphone: "iPhone (Safari)",
    iphoneSteps: ["Abre esta página en Safari.", "Pulsa el botón Compartir (el cuadrado con la flecha hacia arriba).", "Baja y pulsa «Añadir a pantalla de inicio».", "Pulsa «Añadir»."],
    done: "Listo: verás el icono de Emilly junto a tus otras apps.",
  },
  en: {
    title: "Install Emilly on your phone",
    intro: "It's free, takes almost no space and opens like any app, with its icon on your home screen.",
    android: "Android (Chrome)",
    androidSteps: ["Open this page in Chrome.", "Tap the three dots ⋮ at the top right.", "Tap “Install app” or “Add to Home screen”.", "Confirm with “Install”."],
    iphone: "iPhone (Safari)",
    iphoneSteps: ["Open this page in Safari.", "Tap the Share button (square with an up arrow).", "Scroll down and tap “Add to Home Screen”.", "Tap “Add”."],
    done: "Done: you'll see the Emilly icon next to your other apps.",
  },
  it: {
    title: "Installa Emilly sul telefono",
    intro: "È gratis, occupa pochissimo spazio e si apre come qualsiasi app.",
    android: "Android (Chrome)",
    androidSteps: ["Apri questa pagina in Chrome.", "Tocca i tre puntini ⋮ in alto a destra.", "Tocca «Installa app» o «Aggiungi a schermata Home».", "Conferma con «Installa»."],
    iphone: "iPhone (Safari)",
    iphoneSteps: ["Apri questa pagina in Safari.", "Tocca il pulsante Condividi (quadrato con freccia).", "Tocca «Aggiungi alla schermata Home».", "Tocca «Aggiungi»."],
    done: "Fatto: vedrai l'icona di Emilly tra le tue app.",
  },
};

export default async function InstallPage() {
  const s = T[await getLang()];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📲 {s.title}</h1>
      <p className="text-muted">{s.intro}</p>
      {[
        [s.android, s.androidSteps],
        [s.iphone, s.iphoneSteps],
      ].map(([title, steps]) => (
        <section key={title as string} className="card">
          <h2 className="font-semibold">{title as string}</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {(steps as string[]).map((st) => (
              <li key={st}>{st}</li>
            ))}
          </ol>
        </section>
      ))}
      <p className="rounded-lg bg-brand-soft p-3 text-sm">✅ {s.done}</p>
    </div>
  );
}
