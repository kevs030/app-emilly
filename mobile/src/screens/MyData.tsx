import { Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getGuide } from "@/content/guides";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { usePersonal } from "~/lib/personal";
import type { StringKey } from "~/lib/strings";
import { supabase } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";

/** Transparencia: todo lo que Emilly guarda de la persona, con opción de corregir, borrar y descargar. */
export function MyData() {
  const { t, c, lang } = useLang();
  const { profile, saveProfile } = useAuth();
  const { available, facts, activity, removeFact, confirmFact, clearActivity } = usePersonal();
  const [usage, setUsage] = useState<{ sessions: number; active_minutes: number } | null>(null);
  const [info, setInfo] = useState("");
  const [error, setError] = useState(false);
  const analyticsOn = profile?.consent_analytics === true;

  useEffect(() => {
    if (!available || !analyticsOn) return;
    let alive = true;
    void supabase.rpc("my_usage").then(({ data }) => {
      if (alive && data) setUsage(data as { sessions: number; active_minutes: number });
    });
    return () => {
      alive = false;
    };
  }, [available, analyticsOn]);

  async function exportData() {
    setInfo("");
    setError(false);
    const { data, error } = await supabase.rpc("export_my_data");
    if (error || !data) return setError(true);
    const text = JSON.stringify(data, null, 2);
    const file = new File([text], "emilly-mis-datos.json", { type: "application/json" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Emilly" });
        return setInfo(t("exportDone"));
      }
    } catch {
      // la persona canceló o el sistema no lo permite: probamos la descarga
    }
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      setInfo(t("exportDone"));
    } catch {
      await navigator.clipboard.writeText(text);
      setInfo(t("exportCopied"));
    }
  }

  const label = (key: string, value: string) => (key === "interest" ? `${t("interest")}: ${getGuide(value) ? c(getGuide(value)!.title).split(/[:(]/)[0].trim() : value}` : `${key}: ${value}`);

  return (
    <Screen back title={t("myData")}>
      <div className="rise space-y-5">
        <p className="text-ink-soft">{t("myDataIntro")}</p>
        {!available && <p className="card text-ink-soft">{t("notReady")}</p>}

        {available && (
          <section className="card">
            <h2 className="text-lg font-bold">{t("memory")}</h2>
            {facts.length === 0 ? (
              <p className="mt-2 text-[15px] text-ink-soft">{t("memoryEmpty")}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {facts.map((f) => (
                  <li key={f.id} className="flex items-start gap-2">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{label(f.key, f.value)}</span>
                      <span className={`block text-[13px] ${f.source === "user" ? "text-ink-soft" : "font-semibold text-terracotta-deep"}`}>{f.source === "user" || f.confirmed ? t("youSaid") : t("aiSuggested")}</span>
                      {f.source === "ai_suggestion" && !f.confirmed && (
                        <button type="button" className="mt-1 rounded-xl bg-sage-soft px-3 py-2 text-[14px] font-semibold" onClick={() => confirmFact(f)}>
                          {t("confirm")}
                        </button>
                      )}
                    </span>
                    <button type="button" aria-label={t("delete")} onClick={() => removeFact(f)} className="flex h-11 w-11 items-center justify-center text-ink-soft">
                      <Trash2 size={18} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {available && (
          <section className="card">
            <h2 className="text-lg font-bold">{t("history")}</h2>
            <p className="mt-1 text-[14px] text-ink-soft">{t("historyHint")}</p>
            <ul className="mt-3 space-y-1.5 text-[14px]">
              {activity.slice(0, 12).map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="min-w-0 flex-1">
                    {t(`act_${a.type}` as StringKey)}
                    {a.ref && getGuide(a.ref) && <> «{c(getGuide(a.ref)!.title).split(/[:(]/)[0].trim()}»</>}
                  </span>
                  <span className="shrink-0 text-ink-soft">{new Date(a.created_at).toLocaleDateString(lang, { day: "numeric", month: "short" })}</span>
                </li>
              ))}
            </ul>
            {activity.length > 0 && (
              <button type="button" className="btn btn-secondary mt-4" onClick={clearActivity}>
                {t("clearHistory")}
              </button>
            )}
          </section>
        )}

        <section className="card">
          <h2 className="text-lg font-bold">{t("usage")}</h2>
          <p className="mt-1 text-[14px] text-ink-soft">{t("usageHint")}</p>
          <label className="mt-3 flex items-center gap-3 font-medium">
            <input type="checkbox" className="h-6 w-6 accent-[#A65D3D]" checked={analyticsOn} onChange={(e) => saveProfile({ consent_analytics: e.target.checked })} />
            {t("usageOn")}
          </label>
          {analyticsOn && usage && <p className="mt-2 text-[14px] text-ink-soft">{t("usageTotals").replace("{s}", String(usage.sessions)).replace("{m}", String(usage.active_minutes))}</p>}
        </section>

        {available && (
          <button type="button" className="btn btn-secondary" onClick={exportData}>
            <Download size={20} aria-hidden /> {t("exportData")}
          </button>
        )}
        {info && <Alert kind="ok">{info}</Alert>}
        {error && <Alert kind="error">{t("generic")}</Alert>}
      </div>
    </Screen>
  );
}
