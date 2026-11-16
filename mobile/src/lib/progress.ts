import type { Guide } from "@/content/types";

export type DoneItem = { kind: "step" | "document"; idx: number };
export type ProgressNumbers = { stepsDone: number; stepsTotal: number; docsDone: number; docsTotal: number; done: number; total: number; percent: number; nextStep: number | null };

/**
 * Progreso de un trámite. Es una cuenta, no una estimación:
 * solo valen los pasos y documentos que la persona marcó y que siguen existiendo en la guía.
 */
export function computeProgress(guide: Pick<Guide, "steps" | "documents">, items: DoneItem[]): ProgressNumbers {
  const stepsTotal = guide.steps.length;
  const docsTotal = guide.documents.length;
  const steps = new Set(items.filter((x) => x.kind === "step" && x.idx >= 0 && x.idx < stepsTotal).map((x) => x.idx));
  const docs = new Set(items.filter((x) => x.kind === "document" && x.idx >= 0 && x.idx < docsTotal).map((x) => x.idx));
  const total = stepsTotal + docsTotal;
  const done = steps.size + docs.size;
  let nextStep: number | null = null;
  for (let n = 0; n < stepsTotal; n++) {
    if (!steps.has(n)) {
      nextStep = n;
      break;
    }
  }
  return { stepsDone: steps.size, stepsTotal, docsDone: docs.size, docsTotal, done, total, percent: total ? Math.round((done / total) * 100) : 0, nextStep };
}
