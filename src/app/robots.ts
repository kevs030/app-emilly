import type { MetadataRoute } from "next";

/** Los buscadores pueden leer toda la web informativa; no el panel, la app ni las páginas de un solo uso. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/app", "/api/", "/auth/", "/nueva-contrasena"] }],
    sitemap: "https://www.apostoapp.app/sitemap.xml",
  };
}
