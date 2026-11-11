import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { OfficeMapLoader } from "@/components/OfficeMapLoader";

export default async function MapPage() {
  const lang = await getLang();
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t("navMap", lang)}</h1>
      <p className="text-sm text-muted">
        {lang === "en"
          ? "Find the offices you need near you. Data from OpenStreetMap: check opening hours on the office's website."
          : "Encuentra las oficinas que necesitas cerca de ti. Datos de OpenStreetMap: confirma horarios en la web de la oficina."}
      </p>
      <OfficeMapLoader lang={lang} />
    </div>
  );
}
