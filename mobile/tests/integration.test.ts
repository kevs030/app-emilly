import { describe, expect, it, vi } from "vitest";
vi.mock("../src/lib/supabase", () => ({ isNative: false }));
import { UI_LANGS } from "../src/lib/strings";
import { BANK, BANKS, CPIA, CPIA_CARDS, HOSP, HOSP_FORM_URL, IG, ISEE, ISEE_LINKS, SPID, SPID_URL } from "../src/content/modules/integration";
import { CONSULATES, CS, findConsulates, IT_CITIES } from "../src/content/modules/consulates";
import { MQ, PROFILE_X, QUOTES, quoteIndexFor, WORK } from "../src/content/modules/motivation";
import { planQuotes } from "../src/lib/dailyQuote";
import { QUOTE_ID_BASE } from "../src/lib/notify";
import { cropBox } from "../src/lib/avatar";

const LANGS = UI_LANGS.map((l) => l.code);
function texts(x: unknown, out: Record<string, string>[] = []): Record<string, string>[] {
  if (Array.isArray(x)) x.forEach((v) => texts(v, out));
  else if (x && typeof x === "object") {
    if ("es" in x && "bn" in x) out.push(x as Record<string, string>);
    else Object.values(x).forEach((v) => texts(v, out));
  }
  return out;
}

describe("guía de integración, consulados y frases en 9 idiomas", () => {
  const all = texts([IG, HOSP, SPID, CPIA, ISEE, ISEE_LINKS, BANK, BANKS, CS, MQ, WORK, PROFILE_X, QUOTES]);
  it("ningún texto vacío en ningún idioma", () => {
    expect(all.length).toBeGreaterThan(150);
    expect(all.flatMap((t) => LANGS.filter((l) => !t[l]?.trim()).map((l) => `${l}: ${t.es.slice(0, 40)}`))).toEqual([]);
  });
  it("enlaces oficiales pedidos", () => {
    expect(HOSP_FORM_URL).toBe("https://www.poliziadistato.it/statics/18/modulo-art7.pdf");
    expect(SPID_URL).toBe("https://www.spid.gov.it/cos-e-spid/come-attivare-spid/");
    expect(ISEE_LINKS.map((l) => l.url)).toEqual(["https://www.inps.it/", "https://sistemats1.sanita.finanze.it/", "https://www.fascicolosanitario.regione.lombardia.it/esenzioni", "https://prenotasalute.regione.lombardia.it/"]);
    expect(CPIA_CARDS.find((c) => c.id === "mi")?.others).toHaveLength(6);
    for (const u of [...CPIA_CARDS.map((c) => c.url), ...BANKS.map((b) => b.url)]) expect(u).toMatch(/^https:\/\//);
  });
  it("mensaje literal de Trabajo y beneficios", () => {
    expect(WORK.body.es).toBe("Estamos trabajando en este apartado para que puedas recibir ayuda, guías y consejos prácticos sobre tus derechos laborales, nómina (busta paga), vacaciones, TFR y beneficios al trabajar con contrato en Italia.");
  });
});

describe("consulados", () => {
  it("coordenadas dentro de Italia, ids únicos, enlaces https", () => {
    expect(new Set(CONSULATES.map((c) => c.id)).size).toBe(CONSULATES.length);
    for (const c of CONSULATES) {
      expect(c.lat).toBeGreaterThan(36);
      expect(c.lat).toBeLessThan(47.2);
      expect(c.lon).toBeGreaterThan(6.6);
      expect(c.lon).toBeLessThan(18.6);
      for (const u of [c.web, c.booking]) if (u) expect(u).toMatch(/^https:\/\//);
    }
  });
  it("ordena por cercanía y marca la ciudad propia", () => {
    const fromRoma = findConsulates("PE", "Roma");
    expect(fromRoma[0].id).toBe("pe-roma");
    expect(fromRoma[0].local).toBe(true);
    expect(findConsulates("PE", "Torino")[0].id).toBe("pe-milano");
    expect(findConsulates("PE", "Napoli")[0].id).toBe("pe-roma");
    expect(IT_CITIES.length).toBeGreaterThan(10);
  });
});

describe("frase del día", () => {
  it("al menos 30 frases y cambia cada día", () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(30);
    const a = quoteIndexFor(new Date(2026, 10, 18, 23, 59));
    expect(quoteIndexFor(new Date(2026, 10, 18, 0, 1))).toBe(a);
    expect(quoteIndexFor(new Date(2026, 10, 19, 0, 1))).toBe((a + 1) % QUOTES.length);
  });
  it("programa 14 avisos a la hora elegida, con ids propios", () => {
    const now = new Date(2026, 10, 18, 9, 0);
    expect(planQuotes({ enabled: false, time: "08:30" }, "es", now)).toEqual([]);
    const p = planQuotes({ enabled: true, time: "08:30" }, "it", now);
    expect(p).toHaveLength(14);
    expect(p[0].at).toEqual(new Date(2026, 10, 19, 8, 30)); // hoy ya pasaron las 8:30
    expect(p.every((q) => q.id >= QUOTE_ID_BASE && q.id < 2 ** 31)).toBe(true);
    expect(p[0].body).toBe(QUOTES[quoteIndexFor(p[0].at)].it);
  });
});

describe("recorte del avatar", () => {
  it("la imagen siempre cubre el círculo", () => {
    const b = cropBox(1000, 500, 260, 1, 9999, -9999);
    expect(b.sh).toBe(260);
    expect(b.left).toBeLessThanOrEqual(0);
    expect(b.left + b.sw).toBeGreaterThanOrEqual(260);
    expect(b.top).toBe(0);
  });
});
