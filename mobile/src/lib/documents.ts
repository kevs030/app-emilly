import { supabase } from "./supabase";

/**
 * «Mis documentos» se guardan SOLO en este teléfono, cifrados.
 *
 * - Cada archivo se cifra con AES-GCM (256 bits) antes de guardarse en la base de datos local del
 *   dispositivo (IndexedDB). La clave se crea aquí y es «no exportable»: ningún código, ni siquiera
 *   el de la app, puede leerla y enviarla a otro sitio.
 * - Nada se sube a nuestro servidor. Si se pierde el teléfono o se borra la app, los documentos se
 *   pierden: el original en papel sigue siendo el que vale.
 * - Los documentos que se guardaron en el servidor con versiones anteriores se copian aquí y,
 *   solo después de copiarlos bien, se borran del servidor.
 * - Leer un documento con la IA envía la imagen en ese momento, con confirmación previa; no se guarda.
 */

export const DOC_KINDS = ["permesso", "identita", "fiscale", "salute", "lavoro", "casa", "lettera", "altro"] as const;
export type DocKind = (typeof DOC_KINDS)[number];
export type Doc = { id: number; title: string; kind: DocKind; mime: string; size_bytes: number; expires_on: string | null; note: string | null; analysis: string | null; analysis_lang: string | null; created_at: string };

const MIMES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
export const MAX_BYTES = 8 * 1024 * 1024;

type Row = Doc & { user_id: string; iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer; legacy_id?: number };

/* ---------- base de datos local ---------- */

const DB_NAME = "aposto-docs";
let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      d.createObjectStore("keys");
      d.createObjectStore("docs", { keyPath: "id" }).createIndex("user_id", "user_id");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run<T>(store: "keys" | "docs", mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const tx = d.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

/* ---------- cifrado ---------- */

/** Una clave por cuenta y por dispositivo, no exportable. */
async function keyFor(userId: string): Promise<CryptoKey> {
  const existing = await run<CryptoKey | undefined>("keys", "readonly", (s) => s.get(userId) as IDBRequest<CryptoKey | undefined>);
  if (existing) return existing;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await run("keys", "readwrite", (s) => s.put(key, userId));
  return key;
}

async function encrypt(userId: string, file: Blob): Promise<{ iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFor(userId), await file.arrayBuffer());
  return { iv, data };
}

async function decrypt(row: Row): Promise<Blob> {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: row.iv }, await keyFor(row.user_id), row.data);
  return new Blob([plain], { type: row.mime });
}

const strip = ({ user_id: _u, iv: _i, data: _d, legacy_id: _l, ...doc }: Row): Doc => doc;

/* ---------- operaciones ---------- */

async function rowsOf(userId: string): Promise<Row[]> {
  const rows = await run<Row[]>("docs", "readonly", (s) => s.index("user_id").getAll(userId) as IDBRequest<Row[]>);
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Documentos de esta cuenta en este teléfono. null = el almacenamiento local no está disponible. */
export async function listDocuments(userId: string): Promise<Doc[] | null> {
  try {
    await migrateFromServer(userId);
    return (await rowsOf(userId)).map(strip);
  } catch {
    return null;
  }
}

export async function addDocument(userId: string, file: Blob, mime: string, fields: { title: string; kind: DocKind; expires_on: string | null; note?: string; analysis?: string; analysis_lang?: string; created_at?: string; legacy_id?: number }): Promise<Doc | null> {
  if (!MIMES.has(mime) || file.size > MAX_BYTES || file.size === 0) return null;
  try {
    const { iv, data } = await encrypt(userId, file);
    const row: Row = {
      id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
      user_id: userId,
      title: fields.title,
      kind: fields.kind,
      mime,
      size_bytes: file.size,
      expires_on: fields.expires_on,
      note: fields.note ?? null,
      analysis: fields.analysis?.slice(0, 20000) ?? null,
      analysis_lang: fields.analysis ? (fields.analysis_lang ?? "es") : null,
      created_at: fields.created_at ?? new Date().toISOString(),
      iv,
      data,
      ...(fields.legacy_id !== undefined ? { legacy_id: fields.legacy_id } : {}),
    };
    await run("docs", "readwrite", (s) => s.put(row));
    return strip(row);
  } catch {
    return null;
  }
}

export async function saveAnalysis(id: number, analysis: string, lang: string): Promise<boolean> {
  try {
    const row = await run<Row | undefined>("docs", "readonly", (s) => s.get(id) as IDBRequest<Row | undefined>);
    if (!row) return false;
    await run("docs", "readwrite", (s) => s.put({ ...row, analysis: analysis.slice(0, 20000), analysis_lang: lang }));
    return true;
  } catch {
    return false;
  }
}

export async function removeDocument(doc: Doc): Promise<boolean> {
  try {
    await run("docs", "readwrite", (s) => s.delete(doc.id));
    return true;
  } catch {
    return false;
  }
}

/** El archivo descifrado, solo en la memoria de la app. */
export async function documentBlob(doc: Doc): Promise<Blob | null> {
  try {
    const row = await run<Row | undefined>("docs", "readonly", (s) => s.get(doc.id) as IDBRequest<Row | undefined>);
    return row ? await decrypt(row) : null;
  } catch {
    return null;
  }
}

/** Al borrar la cuenta: se borran sus documentos de este teléfono y su clave. */
export async function removeAllFiles(userId: string): Promise<boolean> {
  try {
    for (const row of await rowsOf(userId)) await run("docs", "readwrite", (s) => s.delete(row.id));
    await run("keys", "readwrite", (s) => s.delete(userId));
    return true;
  } catch {
    return false;
  }
}

/* ---------- documentos antiguos guardados en el servidor ---------- */

type ServerDoc = { id: number; title: string; kind: DocKind; storage_path: string; mime: string; expires_on: string | null; analysis: string | null; analysis_lang: string | null; created_at: string };

/** Copia al teléfono los documentos de versiones anteriores y los borra del servidor tras copiarlos. */
let migrating: Promise<void> | null = null;
export function migrateFromServer(userId: string): Promise<void> {
  // Si varias pantallas lo piden a la vez, se hace una sola vez.
  migrating ??= migrate(userId).finally(() => (migrating = null));
  return migrating;
}

async function migrate(userId: string): Promise<void> {
  const { data, error } = await supabase.from("documents").select("id, title, kind, storage_path, mime, expires_on, analysis, analysis_lang, created_at");
  if (error || !data?.length) return; // sin tabla o sin documentos antiguos: nada que hacer
  const copied = new Set((await rowsOf(userId)).map((r) => r.legacy_id));
  for (const d of data as ServerDoc[]) {
    if (!copied.has(d.id)) {
      const file = await supabase.storage.from("documents").download(d.storage_path);
      if (file.error || !file.data) continue; // se reintentará la próxima vez
      const copy = await addDocument(userId, file.data, d.mime, { title: d.title, kind: d.kind, expires_on: d.expires_on, analysis: d.analysis ?? undefined, analysis_lang: d.analysis_lang ?? undefined, created_at: d.created_at, legacy_id: d.id });
      if (!copy) continue;
    }
    const removed = await supabase.storage.from("documents").remove([d.storage_path]);
    if (!removed.error) await supabase.from("documents").delete().eq("id", d.id);
  }
}
