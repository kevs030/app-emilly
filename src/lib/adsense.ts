/**
 * Google AdSense (web y app abierta desde el navegador, p. ej. iPhone). Apagado hasta poner en Vercel:
 *   NEXT_PUBLIC_ADSENSE_CLIENT = ca-pub-XXXXXXXXXXXXXXXX   (número de editor)
 *   NEXT_PUBLIC_ADSENSE_SLOT   = 1234567890                (bloque de anuncios «Display»)
 * Solo se muestran en las páginas donde se coloca <AdSense /> (nunca en apoyo emocional, permiso, documentos ni acceso).
 * En la app de Android (WebView) no se usa AdSense: las normas de Google no lo permiten ahí.
 */
const client = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "").trim();
const slot = (process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "").trim();

export const ADSENSE_CLIENT = /^ca-pub-\d{10,20}$/.test(client) ? client : "";
export const ADSENSE_SLOT = /^\d{6,12}$/.test(slot) ? slot : "";
export const adsenseEnabled = Boolean(ADSENSE_CLIENT && ADSENSE_SLOT);

/** Orígenes que AdSense y su aviso de consentimiento necesitan (se añaden a la CSP solo si está activo). */
export const ADSENSE_CSP = {
  script: "https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://*.googletagservices.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com",
  frame: "https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google",
  img: "https:",
  connect: "https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://*.gstatic.com",
};
