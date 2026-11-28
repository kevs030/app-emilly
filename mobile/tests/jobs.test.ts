import { beforeEach, describe, expect, it } from "vitest";
import { filterJobs, isSaved, matchCity, savedJobs, splitJobs, toggleSaved, type Job } from "~/lib/jobs";
import { JB, JOB_CITY_INFO, portalLinks } from "~/content/modules/jobs";
import { UI_LANGS } from "../src/lib/strings";

const mem = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
  },
});

const job = (id: string, title: string, posted_at: string): Job => ({ id, city: "Milano", title, company: "Empresa", area: "Milano", contract_type: null, contract_time: null, category: null, url: `https://www.adzuna.it/land/ad/${id}`, posted_at });

describe("Empleo: ciudad", () => {
  it("reconoce la ciudad escrita de varias formas", () => {
    expect(matchCity("milano")).toBe("Milano");
    expect(matchCity(" Milán ")).toBe("Milano");
    expect(matchCity("NAPOLES")).toBe("Napoli");
    expect(matchCity("Florencia")).toBe("Firenze");
    expect(matchCity("Milano (MI)")).toBe("Milano");
  });
  it("si no es una ciudad de la lista, devuelve null", () => {
    expect(matchCity("Lecce")).toBeNull();
    expect(matchCity("")).toBeNull();
    expect(matchCity(null)).toBeNull();
    expect(matchCity(undefined)).toBeNull();
  });
  it("15 ciudades y enlaces de portales https con la ciudad", () => {
    expect(JOB_CITY_INFO).toHaveLength(15);
    for (const c of JOB_CITY_INFO) {
      const links = portalLinks(c.city);
      expect(links.map((l) => l.id)).toEqual(["subito", "indeed", "infojobs", "eures"]);
      for (const l of links) expect(l.url.startsWith("https://")).toBe(true);
    }
    expect(portalLinks("Milano")[0].url).toBe("https://www.subito.it/annunci-lombardia/vendita/offerte-lavoro/milano/");
    expect(portalLinks("Milano")[2].url).toBe("https://www.infojobs.it/offerte-lavoro/milano-e-provincia");
    expect(portalLinks("Roma")[1].url).toBe("https://it.indeed.com/jobs?l=Roma");
  });
});

describe("Empleo: listas", () => {
  it("separa «Nuevas hoy» (día local) y «Esta semana»", () => {
    const now = new Date(2026, 10, 28, 15, 0);
    const jobs = [job("1", "Hoy", new Date(2026, 10, 28, 6, 0).toISOString()), job("2", "Ayer", new Date(2026, 10, 27, 22, 0).toISOString()), job("3", "Viejo", new Date(2026, 10, 18, 9, 0).toISOString())];
    const { today, week } = splitJobs(jobs, now);
    expect(today.map((j) => j.id)).toEqual(["1"]);
    expect(week.map((j) => j.id)).toEqual(["2"]);
  });
  it("busca por puesto o empresa sin importar mayúsculas ni acentos", () => {
    const jobs = [job("1", "Cameriere di sala", "2026-11-28T06:00:00Z"), job("2", "Magazziniere", "2026-11-28T06:00:00Z")];
    expect(filterJobs(jobs, "CAMERIERE").map((j) => j.id)).toEqual(["1"]);
    expect(filterJobs(jobs, "  ").map((j) => j.id)).toEqual(["1", "2"]);
    expect(filterJobs([job("3", "Aiuto cuoco è", "2026-11-28T06:00:00Z")], "cuoco e").map((j) => j.id)).toEqual(["3"]);
  });
});

describe("Empleo: guardadas solo en el teléfono", () => {
  beforeEach(() => localStorage.clear());
  it("guardar y quitar", () => {
    const j = job("1", "Cameriere", "2026-11-28T06:00:00Z");
    expect(toggleSaved(j)).toBe(true);
    expect(isSaved("1")).toBe(true);
    expect(savedJobs()).toHaveLength(1);
    expect(toggleSaved(j)).toBe(false);
    expect(savedJobs()).toHaveLength(0);
  });
  it("máximo 100 y datos dañados no rompen", () => {
    for (let i = 0; i < 105; i++) toggleSaved(job(String(i), "x", "2026-11-28T06:00:00Z"));
    expect(savedJobs()).toHaveLength(100);
    localStorage.setItem("aposto:jobs:saved", "{roto");
    expect(savedJobs()).toEqual([]);
  });
});

describe("Empleo: textos en los 9 idiomas", () => {
  it("ningún texto vacío", () => {
    for (const [k, t] of Object.entries(JB)) for (const { code } of UI_LANGS) expect(t[code]?.trim(), `${k}.${code}`).toBeTruthy();
  });
});
