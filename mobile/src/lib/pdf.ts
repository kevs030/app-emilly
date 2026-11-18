import { isNative } from "./supabase";

/**
 * PDF en el idioma de la persona, sin librerías externas.
 * Por qué así: jsPDF y pdf-lib no dan forma al árabe ni al bengalí (las letras salen sueltas o al revés).
 * Aquí el texto lo dibuja el propio motor del teléfono en un lienzo (canvas), que sí sabe escribir
 * de derecha a izquierda y unir las letras; cada página se guarda como imagen JPEG dentro de un PDF mínimo.
 */
export type PdfSection = { heading?: string; items: string[]; numbered?: boolean };
export type PdfDoc = { title: string; subtitle?: string; sections: PdfSection[]; footer: string; url?: string; rtl?: boolean; lang?: string };
type Page = { data: Uint8Array; w: number; h: number };

const enc = new TextEncoder();

/** Escribe un PDF válido con una imagen JPEG a página completa por página (A4). Pura: se prueba sin navegador. */
export function buildPdf(pages: Page[]): Uint8Array {
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let size = 0;
  const push = (b: Uint8Array | string) => {
    const bytes = typeof b === "string" ? enc.encode(b) : b;
    parts.push(bytes);
    size += bytes.length;
  };
  const obj = (n: number, body: () => void) => {
    offsets[n] = size;
    push(`${n} 0 obj\n`);
    body();
    push("\nendobj\n");
  };
  const W = 595.28;
  const H = 841.89;
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  // 1 catálogo, 2 páginas; por cada página: página, contenido e imagen (3 objetos)
  const kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`));
  pages.forEach((p, i) => {
    const pageN = 3 + i * 3;
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(pageN, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${pageN + 2} 0 R >> >> /Contents ${pageN + 1} 0 R >>`));
    obj(pageN + 1, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    obj(pageN + 2, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.data.length} >>\nstream\n`);
      push(p.data);
      push("\nendstream");
    });
  });
  const xref = size;
  const count = 3 + pages.length * 3;
  push(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let n = 1; n < count; n++) push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(size);
  let at = 0;
  for (const b of parts) {
    out.set(b, at);
    at += b.length;
  }
  return out;
}

/** Corta un texto en líneas que caben en el ancho (respeta palabras; corta palabras muy largas como URLs). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const tryLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(tryLine).width <= max) {
      line = tryLine;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    while (ctx.measureText(line).width > max && line.length > 1) {
      let cut = line.length - 1;
      while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > max) cut--;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  if (line) lines.push(line);
  return lines;
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Arabic", "Noto Sans Bengali", sans-serif';

/** Dibuja el documento en páginas A4 (150 ppp) y devuelve el PDF. */
export async function renderPdf(doc: PdfDoc): Promise<Blob> {
  const W = 1240;
  const H = 1754;
  const M = 100;
  const pages: Page[] = [];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rtl = Boolean(doc.rtl);
  let y = 0;
  let pageNo = 0;

  const startPage = () => {
    pageNo++;
    ctx.fillStyle = "#FFFDF9";
    ctx.fillRect(0, 0, W, H);
    // Franja de marca
    ctx.fillStyle = "#A65337";
    ctx.fillRect(0, 0, W, 18);
    ctx.direction = rtl ? "rtl" : "ltr";
    ctx.textAlign = rtl ? "right" : "left";
    ctx.textBaseline = "top";
    y = M;
  };
  const flush = async () => {
    // Pie: fuente y número de página
    ctx.fillStyle = "#746A60";
    ctx.font = `22px ${FONT}`;
    const foot = wrap(ctx, doc.footer, W - 2 * M);
    let fy = H - M + 10 - foot.length * 30;
    for (const l of foot) {
      ctx.fillText(l, rtl ? W - M : M, fy);
      fy += 30;
    }
    ctx.textAlign = rtl ? "left" : "right";
    ctx.fillText(`A Posto · ${pageNo}`, rtl ? M : W - M, H - M + 20);
    ctx.textAlign = rtl ? "right" : "left";
    const blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/jpeg", 0.88));
    pages.push({ data: new Uint8Array(await blob.arrayBuffer()), w: W, h: H });
  };
  const bottom = H - M - 140;
  const write = async (text: string, size: number, color: string, weight = "", gapAfter = 10, indent = 0) => {
    ctx.font = `${weight} ${size}px ${FONT}`.trim();
    ctx.fillStyle = color;
    for (const l of wrap(ctx, text, W - 2 * M - indent)) {
      if (y + size * 1.35 > bottom) {
        await flush();
        startPage();
        ctx.font = `${weight} ${size}px ${FONT}`.trim();
        ctx.fillStyle = color;
      }
      ctx.fillText(l, rtl ? W - M - indent : M + indent, y);
      y += size * 1.38;
    }
    y += gapAfter;
  };

  startPage();
  await write(doc.title, 50, "#302B27", "bold", 12);
  if (doc.subtitle) await write(doc.subtitle, 28, "#746A60", "", 18);
  if (doc.url) await write(doc.url, 22, "#88412D", "", 20);
  for (const s of doc.sections) {
    if (s.heading) {
      y += 12;
      await write(s.heading, 34, "#586747", "bold", 10);
    }
    for (const [i, item] of s.items.entries()) {
      const mark = s.numbered ? `${i + 1}.` : "•";
      ctx.font = `28px ${FONT}`;
      ctx.fillStyle = "#A65337";
      if (y + 40 > bottom) {
        await flush();
        startPage();
      }
      ctx.fillText(mark, rtl ? W - M : M, y);
      await write(item, 28, "#302B27", "", 12, 46);
    }
  }
  await flush();
  return new Blob([buildPdf(pages) as BlobPart], { type: "application/pdf" });
}

/** Guarda o comparte el PDF: en el teléfono abre «Compartir» (guardar, WhatsApp…); en el navegador lo descarga. */
export async function savePdf(blob: Blob, filename: string): Promise<void> {
  const name = `${filename.replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 60) || "A-Posto"}.pdf`;
  const file = new File([blob], name, { type: "application/pdf" });
  if (isNative && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch {
      // cancelado: seguimos con la descarga normal
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
