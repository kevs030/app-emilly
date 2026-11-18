import { describe, expect, it } from "vitest";
import { bonuses } from "@/content/bonuses";
import { parseAnalysis } from "../src/lib/analysis";
import { planNotifications } from "../src/lib/notify";
import { simulate, type Answers } from "../src/lib/simulator";

const base: Answers = { childrenUnder21: "no", newborn: "no", nursery: "no", vulnerableHousehold: "no", fiveYearsResidence: "no", permitOneYear: "no", isee: "unknown" };

describe("simulador de ayudas", () => {
  it("sin hijos ni hogar vulnerable no propone ninguna ayuda", () => {
    expect(simulate(base)).toEqual([]);
  });
  it("solo propone ayudas que existen en el contenido verificado", () => {
    const all = simulate({ childrenUnder21: "yes", newborn: "yes", nursery: "yes", vulnerableHousehold: "yes", fiveYearsResidence: "yes", permitOneYear: "yes", isee: "upTo10140" });
    const slugs = new Set(bonuses.map((b) => b.slug));
    expect(all).toHaveLength(4);
    for (const r of all) expect(slugs.has(r.slug)).toBe(true);
    expect(all.every((r) => r.verdict === "possible")).toBe(true);
  });
  it("Assegno Unico: con hijos es posible y avisa del importe mínimo si no hay ISEE", () => {
    const r = simulate({ ...base, childrenUnder21: "yes", isee: "none" })[0];
    expect(r).toMatchObject({ slug: "assegno-unico", verdict: "possible" });
    expect(r.reasons).toContain("auNoIsee");
  });
  it("Bonus nuovi nati: ISEE por encima de 40.000 € o permiso de menos de un año lo hacen improbable", () => {
    const find = (a: Answers) => simulate(a).find((r) => r.slug === "bonus-nuovi-nati")!;
    expect(find({ ...base, newborn: "yes", permitOneYear: "yes", isee: "over40000" }).verdict).toBe("unlikely");
    expect(find({ ...base, newborn: "yes", permitOneYear: "no", isee: "upTo40000" }).verdict).toBe("unlikely");
    expect(find({ ...base, newborn: "yes", permitOneYear: "yes", isee: "upTo40000" }).verdict).toBe("possible");
    expect(find({ ...base, newborn: "yes", permitOneYear: "unknown", isee: "upTo40000" }).verdict).toBe("check");
  });
  it("Assegno di Inclusione: exige ISEE bajo y 5 años de residencia", () => {
    const find = (a: Answers) => simulate(a).find((r) => r.slug === "assegno-di-inclusione")!;
    expect(find({ ...base, vulnerableHousehold: "yes", fiveYearsResidence: "yes", isee: "upTo10140" }).verdict).toBe("possible");
    expect(find({ ...base, vulnerableHousehold: "yes", fiveYearsResidence: "no", isee: "upTo10140" }).verdict).toBe("unlikely");
    expect(find({ ...base, vulnerableHousehold: "yes", fiveYearsResidence: "yes", isee: "upTo17468" }).verdict).toBe("unlikely");
    expect(find({ ...base, vulnerableHousehold: "yes", fiveYearsResidence: "yes", isee: "unknown" }).verdict).toBe("check");
  });
  it("nunca afirma un derecho sin dudas cuando falta un dato", () => {
    const r = simulate({ childrenUnder21: "unknown", newborn: "yes", nursery: "no", vulnerableHousehold: "unknown", fiveYearsResidence: "unknown", permitOneYear: "unknown", isee: "unknown" });
    expect(r.every((x) => x.verdict !== "possible")).toBe(true);
  });
});

describe("avisos de citas", () => {
  const now = new Date(2026, 10, 16, 12, 0, 0);
  const rem = (id: number, due: string, done = false) => ({ id, title: "Cita", due_date: due, done });
  it("sin consentimiento no se programa nada", () => {
    expect(planNotifications([rem(1, "2026-11-20")], { enabled: false, daysBefore: 1, showTitle: false }, now)).toEqual([]);
  });
  it("programa el mismo día y un día antes, a las 9:00", () => {
    const p = planNotifications([rem(1, "2026-11-20")], { enabled: true, daysBefore: 1, showTitle: false }, now);
    expect(p.map((x) => [x.at.getDate(), x.at.getHours(), x.daysLeft])).toEqual([[19, 9, 1], [20, 9, 0]]);
    expect(new Set(p.map((x) => x.id)).size).toBe(2);
  });
  it("no programa avisos pasados ni de citas hechas", () => {
    const s = { enabled: true, daysBefore: 3, showTitle: false };
    expect(planNotifications([rem(1, "2026-11-10"), rem(2, "2026-11-25", true)], s, now)).toEqual([]);
    expect(planNotifications([rem(3, "2026-11-17")], s, now)).toHaveLength(1); // el aviso de 3 días antes ya pasó
    expect(planNotifications([rem(4, "2026-11-16")], s, now)).toEqual([]); // hoy a las 9:00 ya pasó
  });
  it("respeta el máximo de avisos pendientes del sistema", () => {
    const many = Array.from({ length: 80 }, (_, i) => rem(i + 1, "2026-12-20"));
    expect(planNotifications(many, { enabled: true, daysBefore: 1, showTitle: false }, now)).toHaveLength(48);
  });
});

describe("lectura de documentos", () => {
  it("separa las cuatro partes", () => {
    const parts = parseAnalysis("[1] Qué es\nCarta del INPS.\n[2]\n1. Enviar el ISEE\n[3]\n30/11/2026\n[4]\nGentile signora…");
    expect(parts.map((p) => p.section)).toEqual([1, 2, 3, 4]);
    expect(parts[0].text).toBe("Carta del INPS.");
    expect(parts[3].text).toBe("Gentile signora…");
  });
  it("sin marcadores devuelve el texto tal cual", () => {
    expect(parseAnalysis("La imagen no es un documento.")).toEqual([{ section: 0, text: "La imagen no es un documento." }]);
  });
  it("funciona con una respuesta a medias mientras llega", () => {
    expect(parseAnalysis("[1]\nCarta de la Quest")).toEqual([{ section: 1, text: "Carta de la Quest" }]);
  });
});
