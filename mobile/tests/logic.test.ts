import { describe, expect, it } from "vitest";
import { computeProgress } from "../src/lib/progress";
import { normalize, search } from "../src/lib/search";
import { isEmail, passwordIssues, toE164 } from "../src/lib/validation";

const guide = { steps: [{}, {}, {}], documents: [{}, {}] } as never;

describe("progreso de un trámite", () => {
  it("sin nada marcado es 0 % y el siguiente paso es el primero", () => {
    expect(computeProgress(guide, [])).toMatchObject({ percent: 0, done: 0, total: 5, nextStep: 0 });
  });
  it("cuenta pasos y documentos por separado", () => {
    const p = computeProgress(guide, [{ kind: "step", idx: 0 }, { kind: "step", idx: 1 }, { kind: "document", idx: 0 }]);
    expect(p).toMatchObject({ stepsDone: 2, docsDone: 1, percent: 60, nextStep: 2 });
  });
  it("no cuenta dos veces el mismo paso ni índices que ya no existen en la guía", () => {
    const p = computeProgress(guide, [{ kind: "step", idx: 0 }, { kind: "step", idx: 0 }, { kind: "step", idx: 9 }, { kind: "document", idx: -1 }]);
    expect(p).toMatchObject({ stepsDone: 1, docsDone: 0, done: 1 });
  });
  it("el siguiente paso es el primer hueco, aunque haya pasos posteriores hechos", () => {
    expect(computeProgress(guide, [{ kind: "step", idx: 0 }, { kind: "step", idx: 2 }]).nextStep).toBe(1);
  });
  it("con todos los pasos hechos no queda siguiente paso, aunque falten documentos", () => {
    const p = computeProgress(guide, [0, 1, 2].map((idx) => ({ kind: "step" as const, idx })));
    expect(p.nextStep).toBeNull();
    expect(p.percent).toBe(60);
  });
});

describe("validación del acceso", () => {
  it("exige longitud, letra y número en la contraseña", () => {
    expect(passwordIssues("corta")).toEqual(["short", "digits"]);
    expect(passwordIssues("1234567890")).toEqual(["letters"]);
    expect(passwordIssues("Correcta12345")).toEqual([]);
  });
  it("valida correos", () => {
    expect(isEmail("ana@example.com")).toBe(true);
    expect(isEmail("ana@")).toBe(false);
    expect(isEmail("ana example.com")).toBe(false);
  });
  it("forma números internacionales y rechaza los imposibles", () => {
    expect(toE164("+39", "333 123 4567")).toBe("+393331234567");
    expect(toE164("+51", "0987 654 321")).toBe("+51987654321");
    expect(toE164("+39", "12")).toBeNull();
    expect(toE164("+39", "abc")).toBeNull();
  });
});

describe("buscador global", () => {
  it("ignora acentos y mayúsculas", () => {
    expect(normalize("Código Fiscal")).toBe("codigo fiscal");
  });
  it("encuentra un trámite por su nombre en el idioma de la persona", () => {
    expect(search("codigo fiscal", "es")[0]).toMatchObject({ kind: "guide", id: "codice-fiscale" });
  });
  it("encuentra por el nombre oficial en italiano aunque la persona use español", () => {
    expect(search("permesso di soggiorno", "es").some((r) => r.id === "permesso-di-soggiorno")).toBe(true);
  });
  it("devuelve ayudas y formularios, no solo trámites", () => {
    expect(search("assegno unico", "es").some((r) => r.kind === "benefit")).toBe(true);
    expect(search("AA4/8", "es").some((r) => r.kind === "form")).toBe(true);
  });
  it("exige todas las palabras y no inventa resultados", () => {
    expect(search("xyzzy inexistente", "es")).toEqual([]);
    expect(search("a", "es")).toEqual([]);
  });
});
