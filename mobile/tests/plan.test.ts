import { describe, expect, it } from "vitest";
import { guides } from "@/content/guides";
import { shouldLock } from "../src/lib/biometric";
import { daysUntil, recommend, suggestBenefits, type PlanAnswers } from "../src/lib/plan";

const known = (s: string) => guides.some((g) => g.slug === s);
const today = new Date("2026-11-17T10:00:00Z");
const base: PlanAnswers = { goals: [], permit: "", expiry: "", children: "" };

describe("plan para empezar", () => {
  it("las guías que usa la regla existen", () => {
    for (const s of ["permesso-di-soggiorno", "articolo-31", "codice-fiscale", "sanidad-tessera-sanitaria"]) expect(known(s)).toBe(true);
  });
  it("sin respuestas recomienda los primeros pasos", () => {
    expect(recommend(base, known, today)).toEqual(["codice-fiscale", "sanidad-tessera-sanitaria"]);
  });
  it("respeta lo que la persona dice necesitar, en su orden", () => {
    expect(recommend({ ...base, goals: ["residencia-anagrafica", "codice-fiscale"] }, known, today)).toEqual(["residencia-anagrafica", "codice-fiscale"]);
  });
  it("si el permiso vence en menos de 90 días, renovar va primero", () => {
    expect(recommend({ ...base, permit: "lavoro", expiry: "2027-01-10", goals: ["codice-fiscale"] }, known, today)[0]).toBe("permesso-di-soggiorno");
  });
  it("un permiso con más de 90 días no fuerza la renovación", () => {
    expect(recommend({ ...base, permit: "lavoro", expiry: "2027-06-01" }, known, today)).not.toContain("permesso-di-soggiorno");
  });
  it("un permiso ya caducado también va primero", () => {
    expect(recommend({ ...base, permit: "studio", expiry: "2026-10-01" }, known, today)[0]).toBe("permesso-di-soggiorno");
  });
  it("sin permiso y con hijos sugiere el artículo 31", () => {
    expect(recommend({ ...base, permit: "nessuno", children: "yes" }, known, today)).toContain("articolo-31");
  });
  it("sin repetir y como máximo 4", () => {
    const r = recommend({ ...base, permit: "lavoro", expiry: "2026-12-01", goals: guides.map((g) => g.slug).concat("permesso-di-soggiorno") }, known, today);
    expect(r.length).toBe(4);
    expect(new Set(r).size).toBe(4);
  });
  it("ignora guías que no existen", () => {
    expect(recommend({ ...base, goals: ["no-existe"] }, known, today)).toEqual(["codice-fiscale", "sanidad-tessera-sanitaria"]);
  });
  it("las ayudas para familias solo si hay hijos", () => {
    expect(suggestBenefits({ ...base, children: "yes" })).toBe(true);
    expect(suggestBenefits({ ...base, children: "no" })).toBe(false);
  });
  it("cuenta días por fecha, sin depender de la hora", () => {
    expect(daysUntil("2026-11-18", today)).toBe(1);
    expect(daysUntil("fecha mala", today)).toBe(null);
  });
});

describe("bloqueo con huella", () => {
  const now = 1_000_000;
  it("sin huella activada nunca bloquea", () => {
    expect(shouldLock({ enabled: false, unlockedAt: null, backgroundSince: null, now })).toBe(false);
  });
  it("con huella, al abrir la app bloquea", () => {
    expect(shouldLock({ enabled: true, unlockedAt: null, backgroundSince: null, now })).toBe(true);
  });
  it("tras desbloquear no vuelve a pedirla si no sale de la app", () => {
    expect(shouldLock({ enabled: true, unlockedAt: now - 5000, backgroundSince: null, now })).toBe(false);
  });
  it("vuelve a pedirla tras 2 minutos fuera, no antes", () => {
    expect(shouldLock({ enabled: true, unlockedAt: 1, backgroundSince: now - 60_000, now })).toBe(false);
    expect(shouldLock({ enabled: true, unlockedAt: 1, backgroundSince: now - 120_000, now })).toBe(true);
  });
});
