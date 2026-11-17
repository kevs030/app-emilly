import { aiKeyPresent, aiProviderStatus, authenticate } from "@/lib/ai-server";

export const dynamic = "force-dynamic";

/**
 * Estado del servidor. Para cualquiera, solo «ok». El detalle de configuración (qué claves hay y el
 * estado del proveedor de IA) solo lo ve una cuenta administradora: no hay que dar pistas a un atacante.
 */
export async function GET(req: Request) {
  const headers = { "Cache-Control": "no-store" };
  const auth = await authenticate(req);
  const isAdmin = auth ? (await auth.supabase.rpc("is_admin")).data === true : false;
  if (!isAdmin) return Response.json({ ok: true }, { headers });
  return Response.json(
    { ok: true, assistant_key_configured: aiKeyPresent(), assistant_provider: await aiProviderStatus(), service_key_configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { headers },
  );
}
