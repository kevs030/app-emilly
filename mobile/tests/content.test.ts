import { describe, expect, it } from "vitest";
import { bonuses } from "@/content/bonuses";
import { documents } from "@/content/documents";
import { guides } from "@/content/guides";
import { UI_LANGS } from "../src/lib/strings";
import { ar } from "../src/lib/locales/ar";
import { bn } from "../src/lib/locales/bn";
import { fr } from "../src/lib/locales/fr";
import { ro } from "../src/lib/locales/ro";
import { sq } from "../src/lib/locales/sq";
import { uk } from "../src/lib/locales/uk";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("contenido verificado", () => {
  it("cada guía tiene pasos, documentos, fuentes https y fecha de revisión", () => {
    for (const g of guides) {
      expect(g.steps.length, g.slug).toBeGreaterThan(0);
      expect(g.documents.length, g.slug).toBeGreaterThan(0);
      expect(g.sources.length, g.slug).toBeGreaterThan(0);
      expect(g.lastVerified, g.slug).toMatch(DATE);
      for (const s of g.sources) expect(s.url, g.slug).toMatch(/^https:\/\//);
      expect(g.sources.some((s) => s.official), `${g.slug} sin fuente oficial`).toBe(true);
    }
  });
  it("los identificadores de las guías son únicos", () => {
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
  });
  it("cada ayuda tiene fuente y fecha", () => {
    for (const b of bonuses) {
      expect(b.sources.length, b.slug).toBeGreaterThan(0);
      expect(b.lastVerified, b.slug).toMatch(DATE);
    }
  });
  it("cada formulario pertenece a una guía que existe y enlaza por https", () => {
    const slugs = new Set(guides.map((g) => g.slug));
    for (const d of documents) {
      expect(slugs.has(d.guide), `${d.id} -> ${d.guide}`).toBe(true);
      expect(d.url, d.id).toMatch(/^https:\/\//);
    }
  });
  it("todo texto del contenido existe al menos en español e inglés", () => {
    for (const g of guides) {
      for (const t of [g.title, g.summary, ...g.steps.flatMap((s) => [s.title, s.body]), ...g.documents]) {
        expect(t.es.length, g.slug).toBeGreaterThan(0);
        expect(t.en.length, g.slug).toBeGreaterThan(0);
      }
    }
  });
});

describe("traducciones de la app", () => {
  const locales = { fr, ar, ro, sq, uk, bn };
  it("hay nueve idiomas", () => {
    expect(UI_LANGS.map((l) => l.code).sort()).toEqual(["ar", "bn", "en", "es", "fr", "it", "ro", "sq", "uk"]);
  });
  it("los seis idiomas adicionales traducen las mismas claves", () => {
    const reference = Object.keys(fr).sort();
    for (const [code, dict] of Object.entries(locales)) expect(Object.keys(dict).sort(), code).toEqual(reference);
  });
  it("ninguna traducción está vacía y se conservan los marcadores {n}, {s}, {m}", () => {
    for (const [code, dict] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.length, `${code}.${key}`).toBeGreaterThan(0);
        const marks = (fr[key as keyof typeof fr] ?? "").match(/\{[a-z]\}/g) ?? [];
        for (const m of marks) expect(value, `${code}.${key}`).toContain(m);
      }
    }
  });
});
