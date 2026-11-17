/**
 * Limitador de peticiones en memoria (ventana deslizante).
 * Sirve para un solo servidor. En Vercel (varias instancias) hay que cambiarlo
 * por uno compartido (por ejemplo Upstash Redis). Ver docs/03-arquitectura-y-seguridad.md.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return true;
}

/**
 * Límite compartido entre todos los servidores (función `rate_hit` de la base de datos, migración
 * supabase/pendientes/0009). Si la función aún no existe o no hay clave de servidor, usa el límite
 * en memoria de arriba: la protección nunca desaparece, solo es menos precisa.
 */
export async function rateLimitShared(key: string, limit: number, windowMs: number): Promise<boolean> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && sharedAvailable) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const { SUPABASE_URL } = await import("@/lib/supabase/config");
      const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await admin.rpc("rate_hit", { p_key: key, p_limit: limit, p_window_seconds: Math.max(1, Math.round(windowMs / 1000)) });
      if (!error && typeof data === "boolean") return data;
      // PGRST202 = la función no existe todavía: no se vuelve a intentar hasta reiniciar el servidor.
      if (error?.code === "PGRST202") sharedAvailable = false;
    } catch {
      /* sin conexión con la base: se usa el límite en memoria */
    }
  }
  return rateLimit(key, limit, windowMs);
}
let sharedAvailable = true;
