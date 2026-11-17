import { Camera, ExternalLink, FileText, FolderLock, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { addDocument, DOC_KINDS, documentBlob, listDocuments, MAX_BYTES, removeDocument, saveAnalysis, type Doc, type DocKind } from "~/lib/documents";
import { prepareImage } from "~/lib/image";
import { isNative } from "~/lib/supabase";
import { useLang } from "~/lib/lang";
import type { StringKey } from "~/lib/strings";
import { AnalysisView, ReadButton } from "~/ui/DocReader";
import { Alert, Field, Screen } from "~/ui/kit";

function DocCard({ doc, onChange }: { doc: Doc; onChange: () => void }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [analysis, setAnalysis] = useState(doc.analysis);
  const [preview, setPreview] = useState<string | null>(null);
  const isImage = doc.mime.startsWith("image/");

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  /** Se descifra en el teléfono. Las fotos se ven aquí mismo; los PDF se abren con el visor del sistema. */
  async function view() {
    if (preview) return setPreview(null);
    setBusy(true);
    setError(false);
    const blob = await documentBlob(doc);
    setBusy(false);
    if (!blob) return setError(true);
    if (isImage) return setPreview(URL.createObjectURL(blob));
    const file = new File([blob], `${doc.title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 40) || "documento"}.pdf`, { type: doc.mime });
    try {
      if (isNative && navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], title: doc.title });
    } catch {
      return; // la persona cerró el menú
    }
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  async function remove() {
    if (!window.confirm(t("docDeleteConfirm"))) return;
    setBusy(true);
    const ok = await removeDocument(doc);
    setBusy(false);
    if (ok) onChange();
    else setError(true);
  }

  return (
    <li className="card space-y-3">
      <div className="flex items-start gap-3">
        <span className="icon-tile shrink-0">
          <FileText size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">{doc.title}</p>
          <p className="text-[13px] text-ink-soft">
            {t(`cat_${doc.kind}` as StringKey)} · {new Date(doc.created_at).toLocaleDateString(lang)}
          </p>
          {doc.expires_on && (
            <p className={`text-[14px] ${doc.expires_on < new Date().toISOString().slice(0, 10) ? "font-semibold text-danger" : ""}`}>
              {t("docExpires")} {doc.expires_on}
            </p>
          )}
        </div>
        <button type="button" aria-label={t("delete")} disabled={busy} onClick={remove} className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft">
          <Trash2 size={18} aria-hidden />
        </button>
      </div>
      <button type="button" className="btn btn-secondary" disabled={busy} aria-expanded={isImage ? Boolean(preview) : undefined} onClick={view}>
        <ExternalLink size={18} aria-hidden /> {t("docView")}
      </button>
      {preview && <img src={preview} alt={doc.title} className="w-full rounded-2xl border border-beige" />}
      {analysis ? (
        <>
          <button type="button" className="btn btn-quiet" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {t(open ? "docHideExplanation" : "docShowExplanation")}
          </button>
          {open && <AnalysisView text={analysis} />}
        </>
      ) : (
        isImage && (
          <ReadButton
            getImage={() => documentBlob(doc)}
            onDone={async (text) => {
              setAnalysis(text);
              setOpen(true);
              await saveAnalysis(doc.id, text, lang);
            }}
          />
        )
      )}
      {error && <Alert kind="error">{t("generic")}</Alert>}
    </li>
  );
}

/** Mis documentos: fotos y PDF en un almacén privado. Solo la cuenta de la persona puede verlos. */
export function Documents() {
  const { t } = useLang();
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[] | null | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocKind>("altro");
  const [expires, setExpires] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const camera = useRef<HTMLInputElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => setDocs(user ? await listDocuments(user.id) : []), [user]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    reload();
  }, [reload]);

  function choose(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type)) return setError(t("docBadType"));
    if (f.size > MAX_BYTES && f.type === "application/pdf") return setError(t("docTooBig"));
    setFile(f);
    setTitle(f.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 120));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user) return;
    setBusy(true);
    setError("");
    try {
      // Las fotos se reducen antes de subirlas; los PDF se suben tal cual.
      const isPdf = file.type === "application/pdf";
      const blob = isPdf ? file : (await prepareImage(file, 2000)).blob;
      const doc = await addDocument(user.id, blob, isPdf ? "application/pdf" : "image/jpeg", { title: title.trim(), kind, expires_on: expires || null });
      if (!doc) throw new Error();
      setFile(null);
      setTitle("");
      setExpires("");
      setKind("altro");
      await reload();
    } catch {
      setError(t("docSaveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title={t("myDocuments")} back>
      <p className="flex gap-2 rounded-2xl bg-sage-soft p-3 text-[14px]">
        <FolderLock size={18} className="mt-0.5 shrink-0" aria-hidden />
        <span>{t("docPrivate")}</span>
      </p>

      {docs === null && <p className="card mt-4 text-ink-soft">{t("notReady")}</p>}
      {docs === undefined && <p className="mt-4 text-ink-soft">{t("loading")}</p>}

      {docs && (
        <div className="mt-4 space-y-5">
          <section className="card space-y-3">
            <h2 className="text-lg font-bold">{t("docAdd")}</h2>
            <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => choose(e.target.files?.[0])} />
            <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={(e) => choose(e.target.files?.[0])} />
            {!file ? (
              <>
                <button type="button" className="btn" onClick={() => camera.current?.click()}>
                  <Camera size={20} aria-hidden /> {t("docTakePhoto")}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => picker.current?.click()}>
                  <Upload size={20} aria-hidden /> {t("docChooseFile")}
                </button>
              </>
            ) : (
              <form onSubmit={save} className="space-y-3">
                <Field label={t("docTitle")} required minLength={1} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
                <div>
                  <label className="field-label" htmlFor="doc-kind">
                    {t("docKind")}
                  </label>
                  <select id="doc-kind" className="input" value={kind} onChange={(e) => setKind(e.target.value as DocKind)}>
                    {DOC_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`cat_${k}` as StringKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label={t("docExpiry")} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} hint={t("docExpiryHint")} />
                <button className="btn" disabled={busy || !title.trim()}>
                  {busy ? t("loading") : t("save")}
                </button>
                <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => setFile(null)}>
                  {t("back")}
                </button>
              </form>
            )}
            {error && <Alert kind="error">{error}</Alert>}
          </section>

          {docs.length === 0 ? (
            <p className="text-[15px] text-ink-soft">{t("docEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {docs.map((d) => (
                <DocCard key={d.id} doc={d} onChange={reload} />
              ))}
            </ul>
          )}
        </div>
      )}
    </Screen>
  );
}
