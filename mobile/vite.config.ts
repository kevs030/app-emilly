import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// "@/…" apunta al código compartido con la web (contenido verificado y traducciones);
// "~/…" es el código propio de la app móvil.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": here("../src"), "~": here("./src") } },
  server: { fs: { allow: [".."] } },
  build: { outDir: "dist", sourcemap: false },
});
