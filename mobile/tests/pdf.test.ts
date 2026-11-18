import { describe, expect, it, vi } from "vitest";
vi.mock("../src/lib/supabase", () => ({ isNative: false }));
import { buildPdf } from "../src/lib/pdf";

describe("generador de PDF sin dependencias", () => {
  const fake = (n: number) => ({ data: new Uint8Array(n).fill(7), w: 10, h: 14 });
  const pdf = new TextDecoder("latin1").decode(buildPdf([fake(50), fake(80)]));
  it("es un PDF con cabecera, catálogo y fin", () => {
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf).toContain("/Type /Catalog");
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
  });
  it("tiene una página por imagen", () => {
    expect(pdf).toContain("/Count 2");
    expect(pdf.match(/\/Type \/Page /g)?.length).toBe(2);
  });
  it("la tabla xref apunta exactamente a cada objeto", () => {
    const start = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(start, start + 4)).toBe("xref");
    const offs = [...pdf.slice(start).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    expect(offs.length).toBe(8);
    offs.forEach((o, i) => expect(pdf.startsWith(`${i + 1} 0 obj\n`, o)).toBe(true));
  });
});
