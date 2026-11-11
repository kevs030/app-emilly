import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino del enlace "Sign in" del correo de Supabase.
 * Acepta los dos formatos de Supabase: `?code=` (flujo PKCE) y `?token_hash=&type=`.
 * `next` solo admite rutas internas (empiezan por "/" y no por "//"): evita redirecciones abiertas.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const rawNext = url.searchParams.get("next") ?? "/perfil";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/perfil";

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  return NextResponse.redirect(new URL(ok ? next : "/entrar?error=link", url.origin));
}
