import { Camera, CircleCheckBig, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { addDocument } from "~/lib/documents";
import { prepareImage } from "~/lib/image";
import { useLang } from "~/lib/lang";
import { AnalysisView, ReadButton } from "~/ui/DocReader";
import { Alert, Screen } from "~/ui/kit";

/** Traductor de documentos: foto → lectura, explicación y traducción. Guardarla es opcional. */
export function Scan() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [saved, setSaved] = useState<"no" | "busy" | "yes" | "error">("no");
  const [error, setError] = useState("");
  const camera = useRef<HTMLInputElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- vista previa de la foto elegida
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function choose(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError(t("docBadType"));
    setFile(f);
    setResult("");
    setSaved("no");
  }

  async function keep() {
    if (!file || !user) return;
    setSaved("busy");
    try {
      const { blob } = await prepareImage(file, 2000);
      const title = `${t("docScanTitle")} ${new Date().toLocaleDateString(lang)}`;
      const doc = await addDocument(user.id, blob, "image/jpeg", { title, kind: "lettera", expires_on: null, analysis: result, analysis_lang: lang });
      setSaved(doc ? "yes" : "error");
    } catch {
      setSaved("error");
    }
  }

  return (
    <Screen title={t("translator")} back help="scan">
      <p className="text-[15px] text-ink-soft">{t("scanLead")}</p>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => choose(e.target.files?.[0])} />
      <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => choose(e.target.files?.[0])} />
      <div className="mt-4 space-y-3">
        <button type="button" className={file ? "btn btn-secondary" : "btn"} onClick={() => camera.current?.click()}>
          <Camera size={20} aria-hidden /> {t("docTakePhoto")}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => picker.current?.click()}>
          <Upload size={20} aria-hidden /> {t("docChoosePhoto")}
        </button>
        {error && <Alert kind="error">{error}</Alert>}
      </div>

      {file && preview && (
        <section className="card mt-4 space-y-3">
          <img src={preview} alt={t("docPreview")} className="max-h-72 w-full rounded-xl object-contain" />
          {!result && <ReadButton getImage={async () => file} onDone={setResult} />}
          {result && (
            <>
              <AnalysisView text={result} />
              {saved === "yes" ? (
                <p className="flex items-center gap-2 text-[15px] font-semibold text-[#3d5238]" role="status">
                  <CircleCheckBig size={18} aria-hidden /> {t("saved")} ·{" "}
                  <Link to="/documents" className="underline">
                    {t("myDocuments")}
                  </Link>
                </p>
              ) : (
                <button type="button" className="btn btn-secondary" disabled={saved === "busy"} onClick={keep}>
                  {t("scanSave")}
                </button>
              )}
              {saved === "error" && <Alert kind="error">{t("docSaveError")}</Alert>}
            </>
          )}
        </section>
      )}
    </Screen>
  );
}
