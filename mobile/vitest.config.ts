import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": here("../src"), "~": here("./src") } },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
