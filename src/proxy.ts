import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/** Refresca la sesión de Supabase en cada petición (patrón oficial de @supabase/ssr). */
export async function proxy(request: NextRequest) {
  // El enlace del correo de la app vuelve a la portada de la web (su dirección por defecto).
  // Con `code` la cuenta ya quedó confirmada; con `error_description` el enlace caducó o ya se había usado.
  // En los dos casos se lleva a la página de la app con el mensaje que corresponde.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && (searchParams.has("code") || searchParams.has("error_description"))) {
    const to = request.nextUrl.clone();
    to.pathname = "/descargar";
    to.search = searchParams.has("code") ? "?confirmado=1" : "?confirmado=caducado";
    return NextResponse.redirect(to, 303);
  }
  let response = NextResponse.next({ request });
  const url = SUPABASE_URL;
  const key = SUPABASE_PUBLIC_KEY;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
