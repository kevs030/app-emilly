import type { Metadata } from "next";
import { getLang } from "@/lib/lang";
import { NewPasswordForm } from "./NewPasswordForm";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false, follow: false } };

/**
 * Destino del enlace «Cambiar contraseña» de los correos de la app.
 * Funciona en cualquier navegador (Safari, Chrome) sin necesitar la app instalada:
 * el enlace trae una sesión temporal y aquí se crea la contraseña nueva.
 */
export default async function NewPasswordPage() {
  const lang = await getLang();
  return <NewPasswordForm lang={lang} />;
}
