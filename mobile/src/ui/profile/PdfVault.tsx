import { ExternalLink, FileText, FolderLock, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { PROFILE_X } from "~/content/modules/motivation";
import type { T9 } from "~/content/modules/types";
import { addDocument, documentBlob, listDocuments, MAX_BYTES, removeDocument, type Doc, type DocKind } from "~/lib/documents";
import { useLang } from "~/lib/lang";
import type { StringKey } from "~/lib/strings";
import { isNative } from "~/lib/supabase";
import { useT9 } from "~/ui/modules/ModuleBlocks";

/** Las 4 categorías pedidas; se guardan con el tipo equivalente de «Mis documentos» y una marca propia. */
export const VAULT_CATS: { id: string; kind: DocKind; label: T9 }[] = [
  { id: "passport", kind: "identita", label: PROFILE_X.catPassport },
  { id: "permesso", kind: "permesso", label: PROFILE_X.catPermesso },
  { id: "isee", kind: "fiscale", label: PROFILE_X.catIsee },
  { id: "contract", kind: "lavoro", label: PROFILE_X.catContract },
];
const pdfOnly = (all: Doc[] | null) => (all ? all.filter((d) => d.mime === "application/pdf") : []);
const catOf = (d: Doc) => VAULT_CATS.find((c) => d.note === `vault:${c.id}`);

/** Abre el PDF descifrado: en el teléfono con el visor del sistema; en el navegador en otra pestaña. */
async function openPdf(doc: Doc): Promise<boolean> {
  const blob = await documentBlob(doc);
  if (!blob) return false;
  const file = new File([blob], `${doc.title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 40) || "documento"}.pdf`, { type: "application/pdf" });
  if (isNative && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: doc.title });
    } catch {
      /* la persona cerró el menú */
    }
    return true;
  }
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export function PdfVault() {
  const { x } = useT9();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [cat, setCat] = useState(VAULT_CATS[0].id);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setDocs(pdfOnly(await listDocuments(user.id)));
  }, [user]);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    void listDocuments(user.id).then((all) => alive && setDocs(pdfOnly(all)));
    return () => {
      alive = false;
    };
  }, [user]);

  async function upload(file: File | undefined) {
    setError("");
    if (!file || !user) return;
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf || file.size > MAX_BYTES || file.size === 0) return setError(x(PROFILE_X.onlyPdf));
    const c = VAULT_CATS.find((v) => v.id === cat)!;
    setBusy(true);
    const name = title.trim() || file.name.replace(/\.pdf$/i, "").slice(0, 80) || x(c.label);
    const ok = await addDocument(user.id, file, "application/pdf", { title: name, kind: c.kind, expires_on: null, note: `vault:${c.id}` });
    setBusy(false);
    if (input.current) input.current.value = "";
    if (!ok) return setError(t("generic"));
    setTitle("");
    await reload();
  }

  async function remove(d: Doc) {
    if (!window.confirm(t("docDeleteConfirm"))) return;
    if (await removeDocument(d)) await reload();
    else setError(t("generic"));
  }

  return (
    <section className="card space-y-4" aria-labelledby="vault-title">
      <div>
        <h2 id="vault-title" className="flex items-center gap-2 text-lg font-bold">
          <FolderLock size={20} className="text-sage" aria-hidden /> {x(PROFILE_X.vaultTitle)}
        </h2>
        <p className="hint mt-1">{x(PROFILE_X.vaultHint)}</p>
      </div>
      <div className="grid gap-3">
        <label className="block">
          <span className="field-label">{x(PROFILE_X.category)}</span>
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)} data-testid="vault-cat">
            {VAULT_CATS.map((c) => (
              <option key={c.id} value={c.id}>
                {x(c.label)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">{x(PROFILE_X.docName)}</span>
          <input className="input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={`btn cursor-pointer ${busy ? "opacity-60" : ""}`}>
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Upload size={18} aria-hidden />} {x(PROFILE_X.uploadPdf)}
          <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" disabled={busy} data-testid="vault-input" onChange={(e) => void upload(e.target.files?.[0])} />
        </label>
        <p className="hint">{x(PROFILE_X.onlyPdf)}</p>
      </div>
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {docs && docs.length === 0 && <p className="text-[15px] text-ink-soft">{x(PROFILE_X.empty)}</p>}
      {docs && docs.length > 0 && (
        <ul className="space-y-2" data-testid="vault-list">
          {docs.map((d) => {
            const c = catOf(d);
            return (
              <li key={d.id} className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-3">
                <span className="icon-tile shrink-0">
                  <FileText size={20} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-semibold">{d.title}</span>
                  <span className="block text-[13px] text-ink-soft">
                    {c ? x(c.label) : t(`cat_${d.kind}` as StringKey)} · {new Date(d.created_at).toLocaleDateString(lang)}
                  </span>
                </span>
                <button type="button" aria-label={`${x(PROFILE_X.open)}: ${d.title}`} title={isNative ? x(PROFILE_X.open) : x(PROFILE_X.newTab)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-terracotta-deep" onClick={async () => !(await openPdf(d)) && setError(t("generic"))}>
                  <ExternalLink size={20} aria-hidden />
                </button>
                <button type="button" aria-label={`${t("delete")}: ${d.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft" onClick={() => void remove(d)}>
                  <Trash2 size={18} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Link to="/documents" className="btn btn-quiet">
        {x(PROFILE_X.allDocs)}
      </Link>
    </section>
  );
}
