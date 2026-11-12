import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cuenta el clic de un anuncio y redirige a su destino.
 * El destino sale SIEMPRE de la base de datos (solo https, lo fija el administrador),
 * nunca de la URL del visitante: no hay redirección abierta.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/r/[id]">) {
  const { id: raw } = await ctx.params;
  const id = Number(raw);
  const home = new URL("/", request.nextUrl.origin);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.redirect(home);
  const supabase = await createClient();
  const { data } = await supabase.rpc("sponsor_click", { p_id: id });
  if (typeof data !== "string" || !data.startsWith("https://")) return NextResponse.redirect(home);
  return NextResponse.redirect(data);
}
