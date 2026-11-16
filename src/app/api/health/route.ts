import { aiKeyPresent, aiKeyShape, aiProviderStatus } from "@/lib/ai-server";

export const dynamic = "force-dynamic";

/** Estado del servidor, sin secretos: solo dice si cada pieza está configurada. */
export async function GET() {
  return Response.json(
    { ok: true, assistant_key_configured: aiKeyPresent(), assistant_provider: await aiProviderStatus(), assistant_key_shape: aiKeyShape(), refunds_configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
