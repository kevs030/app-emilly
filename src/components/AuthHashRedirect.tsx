"use client";

import { useEffect } from "react";

/**
 * Si Supabase devuelve el enlace de «cambiar contraseña» a otra página de la web (por ejemplo, la portada),
 * la sesión llega en la parte «#» de la dirección. Aquí se lleva a /nueva-contrasena para crear la contraseña.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const h = window.location.hash;
    if (window.location.pathname === "/nueva-contrasena") return;
    if (/type=recovery/.test(h) || (/error_code=otp_expired/.test(h) && /recovery|access_denied/.test(h))) window.location.replace(`/nueva-contrasena${h}`);
  }, []);
  return null;
}
