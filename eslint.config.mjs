import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // La app móvil (Vite + Capacitor) tiene su propia configuración.
    "mobile/**",
    // Copia compilada de la app que se sirve en /app (se genera al publicar).
    "public/app/**",
  ]),
]);

export default eslintConfig;
