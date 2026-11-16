export type AnalysisPart = { section: 1 | 2 | 3 | 4 | 0; text: string };

/**
 * Separa la respuesta del lector de documentos en sus cuatro partes ([1]…[4]).
 * Si el modelo no usó los marcadores (por ejemplo, «no es un documento»), se devuelve todo como texto libre.
 */
export function parseAnalysis(raw: string): AnalysisPart[] {
  const parts: AnalysisPart[] = [];
  const re = /^\s*\[([1-4])\][^\n]*$/gm;
  let last: { section: AnalysisPart["section"]; start: number } = { section: 0, start: 0 };
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const text = raw.slice(last.start, m.index).trim();
    if (text) parts.push({ section: last.section, text });
    // el texto que sigue al marcador en la misma línea (p. ej. «[1] Qué es») es un título: no se repite
    last = { section: Number(m[1]) as AnalysisPart["section"], start: m.index + m[0].length };
  }
  const tail = raw.slice(last.start).trim();
  if (tail) parts.push({ section: last.section, text: tail });
  return parts;
}
