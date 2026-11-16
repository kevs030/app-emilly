import { supabase } from "./supabase";

export const DOC_KINDS = ["permesso", "identita", "fiscale", "salute", "lavoro", "casa", "lettera", "altro"] as const;
export type DocKind = (typeof DOC_KINDS)[number];
export type Doc = { id: number; title: string; kind: DocKind; storage_path: string; mime: string; size_bytes: number; expires_on: string | null; note: string | null; analysis: string | null; analysis_lang: string | null; created_at: string };

const COLUMNS = "id, title, kind, storage_path, mime, size_bytes, expires_on, note, analysis, analysis_lang, created_at";
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
export const MAX_BYTES = 8 * 1024 * 1024;

/** null = la tabla aún no existe en el servidor (falta ejecutar la migración 0007). */
export async function listDocuments(): Promise<Doc[] | null> {
  const { data, error } = await supabase.from("documents").select(COLUMNS).order("created_at", { ascending: false });
  if (error) return null;
  return data as Doc[];
}

/**
 * Sube el archivo al almacén privado, dentro de la carpeta de la persona, y crea su ficha.
 * Si la ficha no se puede crear, el archivo se retira para no dejar restos.
 */
export async function addDocument(userId: string, file: Blob, mime: string, fields: { title: string; kind: DocKind; expires_on: string | null; analysis?: string; analysis_lang?: string }): Promise<Doc | null> {
  const ext = EXT[mime];
  if (!ext || file.size > MAX_BYTES || file.size === 0) return null;
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("documents").upload(path, file, { contentType: mime, upsert: false });
  if (up.error) return null;
  const { data, error } = await supabase
    .from("documents")
    .insert({ title: fields.title, kind: fields.kind, storage_path: path, mime, size_bytes: file.size, expires_on: fields.expires_on })
    .select(COLUMNS)
    .single();
  if (error || !data) {
    await supabase.storage.from("documents").remove([path]);
    return null;
  }
  const doc = data as Doc;
  if (fields.analysis && (await saveAnalysis(doc.id, fields.analysis, fields.analysis_lang ?? "es"))) return { ...doc, analysis: fields.analysis, analysis_lang: fields.analysis_lang ?? "es" };
  return doc;
}

export async function saveAnalysis(id: number, analysis: string, lang: string): Promise<boolean> {
  const { error } = await supabase.from("documents").update({ analysis: analysis.slice(0, 20000), analysis_lang: lang }).eq("id", id);
  return !error;
}

/** Borra primero el archivo y después la ficha. */
export async function removeDocument(doc: Doc): Promise<boolean> {
  const file = await supabase.storage.from("documents").remove([doc.storage_path]);
  if (file.error) return false;
  const { error } = await supabase.from("documents").delete().eq("id", doc.id);
  return !error;
}

/** Enlace temporal (1 minuto) para ver el archivo. No existe ninguna dirección pública permanente. */
export async function documentUrl(doc: Doc): Promise<string | null> {
  const { data } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
  return data?.signedUrl ?? null;
}

export async function documentBlob(doc: Doc): Promise<Blob | null> {
  const { data } = await supabase.storage.from("documents").download(doc.storage_path);
  return data ?? null;
}

/** Antes de borrar la cuenta: retira todos los archivos de la persona del almacén. */
export async function removeAllFiles(userId: string): Promise<boolean> {
  for (;;) {
    const { data, error } = await supabase.storage.from("documents").list(userId, { limit: 100 });
    // Si el almacén aún no existe en el servidor, no hay nada que retirar.
    if (error) return (await listDocuments()) === null;
    if (!data?.length) return true;
    const res = await supabase.storage.from("documents").remove(data.map((f) => `${userId}/${f.name}`));
    if (res.error) return false;
  }
}
