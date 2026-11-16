import { ScanText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { streamAI } from "~/lib/ai";
import { parseAnalysis } from "~/lib/analysis";
import { prepareImage } from "~/lib/image";
import { useLang } from "~/lib/lang";
import type { StringKey } from "~/lib/strings";
import { Alert } from "~/ui/kit";

const SECTION: Record<1 | 2 | 3 | 4, StringKey> = { 1: "docWhat", 2: "docDo", 3: "docDates", 4: "docTranslation" };

/** Muestra la explicación de un documento, separada en sus cuatro partes. */
export function AnalysisView({ text }: { text: string }) {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      {parseAnalysis(text).map((p, i) => (
        <section key={i} className={p.section === 3 ? "rounded-2xl bg-beige p-3" : ""}>
          {p.section !== 0 && <h3 className="text-[13px] font-bold text-terracotta-deep">{t(SECTION[p.section])}</h3>}
          <p className="whitespace-pre-wrap text-[15px]">{p.text}</p>
        </section>
      ))}
      <p className="text-[13px] text-ink-soft">{t("docDisclaimer")}</p>
    </div>
  );
}

/**
 * Botón «Leer y traducir»: pide confirmación (la imagen sale del dispositivo hacia el proveedor de IA),
 * gasta 1 crédito y entrega el texto. `getImage` da la foto solo cuando la persona ya confirmó.
 */
export function ReadButton({ getImage, onDone }: { getImage: () => Promise<Blob | null>; onDone: (text: string) => void }) {
  const { t, lang } = useLang();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setConfirming(false);
    setBusy(true);
    setError("");
    setPartial("");
    try {
      const source = await getImage();
      if (!source) throw new Error("generic");
      const { base64 } = await prepareImage(source);
      let all = "";
      const res = await streamAI("/api/document", { image: base64, mime: "image/jpeg", lang }, (text) => {
        all = text;
        setPartial(text);
      });
      if (res.status === "ok" && all.trim()) onDone(all.trim());
      else if (res.status === "no_credits") setError(t("noCreditsTitle"));
      else if (res.status === "rate_limited") setError(t("tooMany"));
      else if (res.status === "not_ready") setError(t("asstNotReady"));
      else if (res.status === "offline") setError(t("offline"));
      else setError(t("asstError"));
    } catch {
      setError(t("docImageError"));
    } finally {
      setBusy(false);
      setPartial("");
    }
  }

  return (
    <div className="space-y-3">
      {!confirming && !busy && (
        <button type="button" className="btn btn-secondary" onClick={() => setConfirming(true)}>
          <ScanText size={20} aria-hidden /> {t("docRead")}
        </button>
      )}
      {confirming && (
        <div className="space-y-3 rounded-2xl bg-sage-soft p-3">
          <p className="flex gap-2 text-[14px]">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>{t("docConsent")}</span>
          </p>
          <button type="button" className="btn" onClick={run}>
            {t("docConsentOk")}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => setConfirming(false)}>
            {t("back")}
          </button>
        </div>
      )}
      {busy && (
        <div aria-live="polite">
          <p className="text-[15px] font-semibold text-brown">{t("docReading")}</p>
          {partial && <AnalysisView text={partial} />}
        </div>
      )}
      {error && <Alert kind="error">{error}</Alert>}
    </div>
  );
}
