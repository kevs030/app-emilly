import { ArrowRight, CalendarDays, FileText, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { listDocuments } from "~/lib/documents";
import { useLang } from "~/lib/lang";
import { usePersonal } from "~/lib/personal";
import type { StringKey } from "~/lib/strings";
import { Alert, Field, Screen } from "~/ui/kit";
import { Switch } from "~/ui/Switch";

// Los permisos se muestran con su nombre oficial en italiano, como aparece en la tarjeta.
const PERMITS: [string, string | null][] = [
  ["lavoro", "Lavoro"],
  ["famiglia", "Famiglia"],
  ["studio", "Studio"],
  ["protezione", "Protezione"],
  ["lungo_periodo", "Lungo periodo UE"],
  ["attesa_occupazione", "Attesa occupazione"],
  ["altro", null],
  ["nessuno", null],
];

/** Mi expediente: los datos que la persona decide dar, en un solo sitio. Todos son opcionales. */
export function MyFile() {
  const { t } = useLang();
  const { profile, saveProfile } = useAuth();
  const { procedures, reminders } = usePersonal();
  const [form, setForm] = useState({ country: "", city: "", permit: "", expiry: "", children: "" });
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [docCount, setDocCount] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rellenar el formulario con lo guardado
    setForm({ country: profile.country_of_origin ?? "", city: profile.city ?? "", permit: profile.permit_type ?? "", expiry: profile.permit_expiry ?? "", children: profile.has_children === null ? "" : profile.has_children ? "yes" : "no" });
  }, [profile]);
  useEffect(() => {
    void listDocuments().then((d) => setDocCount(d ? d.length : null));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const ok = await saveProfile({
      country_of_origin: form.country.trim() || null,
      city: form.city.trim() || null,
      permit_type: form.permit || null,
      permit_expiry: form.expiry || null,
      has_children: form.children === "" ? null : form.children === "yes",
    });
    setState(ok ? "saved" : "error");
  }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setState("idle");
  };

  const links: { to: string; icon: typeof FileText; label: StringKey; count: number | null }[] = [
    { to: "/guides", icon: ListChecks, label: "myProcedures", count: procedures.length },
    { to: "/documents", icon: FileText, label: "myDocuments", count: docCount },
    { to: "/appointments", icon: CalendarDays, label: "appointments", count: reminders.filter((r) => !r.done).length },
  ];

  return (
    <Screen title={t("myFile")} back>
      <p className="text-[15px] text-ink-soft">{t("fileLead")}</p>

      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="card flex min-h-14 items-center gap-3 py-3">
              <l.icon size={20} className="shrink-0 text-terracotta" aria-hidden />
              <span className="min-w-0 flex-1 font-medium">{t(l.label)}</span>
              {l.count !== null && <span className="rounded-full bg-beige px-3 py-0.5 text-[14px] font-semibold">{l.count}</span>}
              <ArrowRight size={18} className="shrink-0 text-ink-soft rtl:rotate-180" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <form onSubmit={save} className="card mt-5 space-y-4">
        <h2 className="text-lg font-bold">{t("fileSituation")}</h2>
        <Field label={t("fileCountry")} maxLength={60} autoComplete="country-name" value={form.country} onChange={set("country")} />
        <Field label={t("fileCity")} maxLength={60} autoComplete="address-level2" value={form.city} onChange={set("city")} />
        <div>
          <label className="field-label" htmlFor="permit">
            {t("filePermit")}
          </label>
          <select id="permit" className="input" value={form.permit} onChange={set("permit")}>
            <option value="">{t("fileNoAnswer")}</option>
            {PERMITS.map(([value, label]) => (
              <option key={value} value={value}>
                {label ?? t(value === "altro" ? "cat_altro" : "fileNoPermit")}
              </option>
            ))}
          </select>
        </div>
        <Field label={t("filePermitExpiry")} type="date" value={form.expiry} onChange={set("expiry")} hint={t("filePermitExpiryHint")} />
        <div>
          <label className="field-label" htmlFor="children">
            {t("fileChildren")}
          </label>
          <select id="children" className="input" value={form.children} onChange={set("children")}>
            <option value="">{t("fileNoAnswer")}</option>
            <option value="yes">{t("yes")}</option>
            <option value="no">{t("no")}</option>
          </select>
        </div>
        {state === "saved" && <Alert kind="ok">{t("saved")}</Alert>}
        {state === "error" && <Alert kind="error">{t("generic")}</Alert>}
        <button className="btn" disabled={state === "busy"}>
          {t("save")}
        </button>
      </form>

      <section className="card mt-5">
        <Switch
          label={t("fileShareAi")}
          hint={t("fileShareAiHint")}
          checked={profile?.consent_personalization ?? false}
          onChange={(v) => void saveProfile({ consent_personalization: v })}
        />
      </section>
    </Screen>
  );
}
