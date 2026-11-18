import { describe, expect, it } from "vitest";
import { UI_LANGS } from "../src/lib/strings";
import { A31, COURTS } from "../src/content/modules/art31";
import { AA48_FIELDS, CF, CF_LINKS, LEAFLET } from "../src/content/modules/codiceFiscale";
import { P } from "../src/content/modules/phrases";
import { CITIES, REQUIREMENTS, T, TUPASSI, ZEROCODA } from "../src/content/modules/tessera";
import { V } from "../src/content/modules/videos";

const LANGS = UI_LANGS.map((l) => l.code);
/** Recorre cualquier estructura y devuelve todos los objetos de texto (los que tienen la clave «es»). */
function texts(x: unknown, out: Record<string, string>[] = []): Record<string, string>[] {
  if (Array.isArray(x)) x.forEach((v) => texts(v, out));
  else if (x && typeof x === "object") {
    if ("es" in x && "bn" in x) out.push(x as Record<string, string>);
    else Object.values(x).forEach((v) => texts(v, out));
  }
  return out;
}

describe("módulos de trámites en 9 idiomas", () => {
  const all = texts([P, T, REQUIREMENTS, ZEROCODA, TUPASSI, CITIES, CF, AA48_FIELDS, LEAFLET, CF_LINKS, A31, COURTS, V]);
  it("hay textos", () => expect(all.length).toBeGreaterThan(80));
  it("ningún texto vacío en ningún idioma", () => {
    const missing = all.flatMap((t) => LANGS.filter((l) => !t[l]?.trim()).map((l) => `${l}: ${t.es.slice(0, 40)}`));
    expect(missing).toEqual([]);
  });
  it("los requisitos de la tessera incluyen la Dichiarazione di Ospitalità, la Carta d'Identità, el codice fiscale y el permiso", () => {
    const es = REQUIREMENTS.map((r) => r.es).join(" ");
    for (const w of ["Dichiarazione di Ospitalità", "Carta d'Identità", "Codice fiscale", "Permesso di soggiorno"]) expect(es).toContain(w);
  });
  it("directorio de ciudades: las 8 ciudades pedidas, cada una con enlaces https", () => {
    expect(CITIES.map((c) => c.city)).toEqual(["Milano", "Roma", "Torino", "Napoli", "Bologna", "Firenze", "Palermo", "Bari"]);
    for (const c of [...CITIES, ...COURTS]) for (const l of c.links) expect(l.url).toMatch(/^https:\/\//);
    expect(ZEROCODA.url).toBe("https://prenota.zerocoda.it");
    expect(TUPASSI.url).toBe("https://www.tupassi.it");
  });
  it("el formulario oficial AA4/8 se mantiene en italiano y del sitio oficial", () => {
    expect(CF_LINKS[0].url).toMatch(/^https:\/\/www\.agenziaentrate\.gov\.it\/.*AA4/);
  });
});
