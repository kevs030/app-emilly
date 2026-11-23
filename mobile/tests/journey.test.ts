import { describe, expect, it } from "vitest";
import { guides } from "../../src/content/guides";
import { roadmap, STAGES, type Answers } from "../../src/content/journey";

const slugs = new Set(guides.map((g) => g.slug));

describe("momentos del viaje y hoja de ruta", () => {
  it("cada guía de las 3 etapas existe y todas las guías están en alguna etapa", () => {
    const all = STAGES.flatMap((s) => s.slugs);
    for (const s of all) expect(slugs.has(s)).toBe(true);
    for (const g of guides) expect(all).toContain(g.slug);
  });
  it("siempre devuelve 3 trámites distintos y existentes", () => {
    const sits = ["abroad", "arrived", "undocumented", "permit"] as const;
    const goals = ["work", "health", "residence", "family"] as const;
    for (const situation of sits)
      for (const goal of goals)
        for (const hasCf of [true, false]) {
          const r = roadmap({ situation, goal, hasCf, device: "android" });
          expect(r).toHaveLength(3);
          expect(new Set(r).size).toBe(3);
          r.forEach((s) => expect(slugs.has(s)).toBe(true));
        }
  });
  it("casos clave", () => {
    const a = (p: Partial<Answers>): Answers => ({ situation: "arrived", goal: "work", hasCf: true, device: "android", ...p });
    expect(roadmap(a({ hasCf: false }))[0]).toBe("codice-fiscale");
    expect(roadmap(a({ situation: "undocumented", goal: "health" }))[0]).toBe("art-35-sanidad-sin-papeles");
    expect(roadmap(a({ situation: "undocumented", goal: "family" }))[0]).toBe("articolo-31");
    expect(roadmap(a({ situation: "abroad", goal: "work" }))[0]).toBe("decreto-flussi");
    expect(roadmap(a({ situation: "permit", goal: "work" }))).toEqual(["permesso-di-soggiorno", "permesso-ue-lungo-periodo", "ciudadania"]);
  });
});
