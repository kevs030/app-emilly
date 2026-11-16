import { aiKeyPresent } from "@/lib/ai-server";

export const dynamic = "force-dynamic";

/** Estado del servidor, sin secretos: solo dice si cada pieza está configurada. */
export function GET() {
  return Response.json(
    { ok: true, assistant_key_configured: aiKeyPresent(), refunds_configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
