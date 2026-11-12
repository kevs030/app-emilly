import type { Metadata } from "next";
import { getLang } from "@/lib/lang";
import { OfficeMapLoader } from "@/components/OfficeMapLoader";

export const metadata: Metadata = { title: "Mapa de oficinas y ayuda" };

const T = {
  es: {
    title: "Mapa de Italia: oficinas y puntos de ayuda",
    intro: "Questure, Agenzia delle Entrate, Patronatos, INPS, Prefecturas y centros de ayuda a migrantes de todo el país. Activa las categorías que necesites y acerca el mapa a tu ciudad.",
    note: "Datos de OpenStreetMap, actualizados cada semana. Pueden faltar oficinas o haber cambiado de dirección: confirma siempre el horario en la web oficial antes de ir.",
  },
  en: {
    title: "Map of Italy: offices and support points",
    intro: "Questure, Agenzia delle Entrate, Patronati, INPS, Prefectures and migrant support centres across the country. Turn on the categories you need and zoom in on your city.",
    note: "Data from OpenStreetMap, refreshed weekly. Some offices may be missing or may have moved: always confirm opening hours on the official website before you go.",
  },
  it: {
    title: "Mappa d'Italia: uffici e punti di aiuto",
    intro: "Questure, Agenzia delle Entrate, Patronati, INPS, Prefetture e centri di aiuto ai migranti in tutto il Paese.",
    note: "Dati OpenStreetMap aggiornati ogni settimana: verifica sempre orari e indirizzo sul sito ufficiale.",
  },
};

export default async function MapPage() {
  const lang = await getLang();
  const s = T[lang];
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{s.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{s.intro}</p>
      </header>
      <OfficeMapLoader lang={lang} />
      <p className="text-xs text-muted">{s.note}</p>
    </div>
  );
}
