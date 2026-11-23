import { getLang } from "@/lib/lang";

const T = {
  es: {
    title: "Instala A Posto en tu celular",
    intro: "Es gratis, no ocupa casi espacio y se abre como cualquier app, con su icono en la pantalla de inicio.",
    android: "Android (Chrome)",
    androidSteps: ["Abre esta página en Chrome.", "Pulsa los tres puntitos ⋮ arriba a la derecha.", "Pulsa «Instalar app» o «Añadir a pantalla de inicio».", "Confirma con «Instalar»."],
    iphone: "iPhone",
    iphoneSteps: ["En Safari, abre apostoapp.app/descargar y pulsa «Descargar el instalador para iPhone».", "Pulsa «Permitir».", "Abre Ajustes → «Perfil descargado» → «Instalar».", "Escribe el código de tu iPhone."],
    done: "Listo: verás el icono de A Posto junto a tus otras apps.",
  },
  en: {
    title: "Install A Posto on your phone",
    intro: "It's free, takes almost no space and opens like any app, with its icon on your home screen.",
    android: "Android (Chrome)",
    androidSteps: ["Open this page in Chrome.", "Tap the three dots ⋮ at the top right.", "Tap “Install app” or “Add to Home screen”.", "Confirm with “Install”."],
    iphone: "iPhone",
    iphoneSteps: ["In Safari, open apostoapp.app/descargar and tap “Download the iPhone installer”.", "Tap “Allow”.", "Open Settings → “Profile Downloaded” → “Install”.", "Enter your iPhone passcode."],
    done: "Done: you'll see the A Posto icon next to your other apps.",
  },
  it: {
    title: "Installa A Posto sul telefono",
    intro: "È gratis, occupa pochissimo spazio e si apre come qualsiasi app.",
    android: "Android (Chrome)",
    androidSteps: ["Apri questa pagina in Chrome.", "Tocca i tre puntini ⋮ in alto a destra.", "Tocca «Installa app» o «Aggiungi a schermata Home».", "Conferma con «Installa»."],
    iphone: "iPhone",
    iphoneSteps: ["In Safari apri apostoapp.app/descargar e tocca «Scarica l'installer per iPhone».", "Tocca «Consenti».", "Apri Impostazioni → «Profilo scaricato» → «Installa».", "Inserisci il codice del tuo iPhone."],
    done: "Fatto: vedrai l'icona di A Posto tra le tue app.",
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
