/**
 * Simulador orientativo de ayudas. No decide nada: compara las respuestas de la persona con los
 * requisitos publicados en `src/content/bonuses.ts` (cada uno con su fuente y fecha).
 * Las respuestas no se guardan ni salen del dispositivo.
 */
export type Tri = "yes" | "no" | "unknown";
export type IseeBand = "none" | "upTo10140" | "upTo17468" | "upTo40000" | "over40000" | "unknown";
export type Answers = {
  childrenUnder21: Tri;
  newborn: Tri;
  nursery: Tri;
  vulnerableHousehold: Tri;
  fiveYearsResidence: Tri;
  permitOneYear: Tri;
  isee: IseeBand;
};
export type Verdict = "possible" | "check" | "unlikely";
export type Reason = "auChildren" | "auNoIsee" | "auPermit" | "nnIseeOver" | "nnIseeNeeded" | "nnPermitShort" | "nnPermitCheck" | "nidoReceipts" | "adiIseeOver" | "adiIseeCheck" | "adiResidence" | "adiResidenceCheck" | "adiHousehold";
export type SimResult = { slug: string; verdict: Verdict; reasons: Reason[] };

const worst = (a: Verdict, b: Verdict): Verdict => (a === "unlikely" || b === "unlikely" ? "unlikely" : a === "check" || b === "check" ? "check" : "possible");

export function simulate(a: Answers): SimResult[] {
  const out: SimResult[] = [];

  // Assegno Unico: hijos a cargo menores de 21; sin ISEE corresponde el importe mínimo.
  if (a.childrenUnder21 !== "no") {
    const reasons: Reason[] = ["auPermit"];
    if (a.isee === "none" || a.isee === "unknown") reasons.unshift("auNoIsee");
    out.push({ slug: "assegno-unico", verdict: a.childrenUnder21 === "yes" ? "possible" : "check", reasons: a.childrenUnder21 === "yes" ? reasons : ["auChildren", ...reasons] });
  }

  // Bonus nuovi nati: hijo nacido o adoptado, ISEE hasta 40.000 €, permiso de al menos 1 año.
  if (a.newborn === "yes") {
    let verdict: Verdict = "possible";
    const reasons: Reason[] = [];
    if (a.isee === "over40000") {
      verdict = "unlikely";
      reasons.push("nnIseeOver");
    } else if (a.isee === "none" || a.isee === "unknown") {
      verdict = worst(verdict, "check");
      reasons.push("nnIseeNeeded");
    }
    if (a.permitOneYear === "no") {
      verdict = "unlikely";
      reasons.push("nnPermitShort");
    } else if (a.permitOneYear === "unknown") {
      verdict = worst(verdict, "check");
      reasons.push("nnPermitCheck");
    }
    out.push({ slug: "bonus-nuovi-nati", verdict, reasons });
  }

  // Bonus asilo nido: niños de hasta 3 años en guardería, con recibos de pago.
  if (a.nursery === "yes") out.push({ slug: "bonus-asilo-nido", verdict: "possible", reasons: ["nidoReceipts"] });

  // Assegno di Inclusione: hogar con menores, discapacidad o mayores de 60; ISEE bajo; 5 años de residencia.
  if (a.vulnerableHousehold !== "no") {
    let verdict: Verdict = a.vulnerableHousehold === "yes" ? "possible" : "check";
    const reasons: Reason[] = a.vulnerableHousehold === "yes" ? [] : ["adiHousehold"];
    if (a.isee === "upTo17468" || a.isee === "upTo40000" || a.isee === "over40000") {
      verdict = "unlikely";
      reasons.push("adiIseeOver");
    } else if (a.isee !== "upTo10140") {
      verdict = worst(verdict, "check");
      reasons.push("adiIseeCheck");
    }
    if (a.fiveYearsResidence === "no") {
      verdict = "unlikely";
      reasons.push("adiResidence");
    } else if (a.fiveYearsResidence === "unknown") {
      verdict = worst(verdict, "check");
      reasons.push("adiResidenceCheck");
    }
    out.push({ slug: "assegno-di-inclusione", verdict, reasons });
  }

  const order: Record<Verdict, number> = { possible: 0, check: 1, unlikely: 2 };
  return out.sort((x, y) => order[x.verdict] - order[y.verdict]);
}
