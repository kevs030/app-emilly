/**
 * Datos públicos de A posto que hay que rellenar antes de publicar.
 * Mientras un valor esté vacío, la web y la app muestran «Próximamente» en lugar de un enlace roto.
 */
export const APP = {
  name: "A posto",
  /** Dirección pública de la web (cámbiala cuando haya dominio propio). */
  webUrl: "https://app-emilly.vercel.app",

  // ── Tiendas ──
  /** Ejemplo: https://play.google.com/store/apps/details?id=com.aposto.app */
  googlePlayUrl: "",
  /** Ejemplo: https://apps.apple.com/it/app/a-posto/id0000000000 */
  appStoreUrl: "",

  // ── Descarga directa para Android (opcional) ──
  /** Archivo .apk oficial. Debe existir en `public/a-posto.apk` antes de publicar la web. */
  apkUrl: "/a-posto.apk",
  /** Nombre con el que se guarda el archivo al descargarlo. */
  apkFileName: "A-Posto.apk",
  /** Versión del APK publicado, por ejemplo "1.0.0". */
  apkVersion: "",
  /** Huella SHA-256 del APK, para que cualquiera pueda comprobar que el archivo es auténtico. */
  apkSha256: "7652a3c1cfbdba2d347c7d7fb038b05993c43a60fc477081521e351e0993f495",

  // ── Responsable de los datos (obligatorio por el RGPD y por las tiendas) ──
  /** Nombre de la persona o empresa responsable. */
  legalName: "",
  /** Correo de contacto para privacidad y soporte. */
  contactEmail: "",
} as const;
