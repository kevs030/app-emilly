/* Pruebas de la limpieza de ofertas de Adzuna. Uso: npx tsx tests/web/jobs.test.ts */
import assert from "node:assert/strict";
import { adzunaUrl, JOB_CITIES, toJobRow } from "../../src/lib/jobs";

const raw = {
  id: "4512345678",
  title: "  <strong>Magazziniere</strong>   con  patentino ",
  created: "2026-11-28T05:12:00Z",
  redirect_url: "https://www.adzuna.it/land/ad/4512345678",
  company: { display_name: "Logistica Srl" },
  location: { display_name: "Linate, Milano", area: ["Italia", "Lombardia", "Milano", "Linate"] },
  category: { label: "Lavoro Logistica &amp; Magazzino" },
  contract_type: "permanent",
  contract_time: "full_time",
};
let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("OK   " + name); };

ok("título sin HTML ni espacios dobles", () => assert.equal(toJobRow(raw, "Milano")!.title, "Magazziniere con patentino"));
ok("id con prefijo de la fuente", () => assert.equal(toJobRow(raw, "Milano")!.id, "adzuna:4512345678"));
ok("fecha de publicación = created", () => assert.equal(toJobRow(raw, "Milano")!.posted_at, "2026-11-28T05:12:00.000Z"));
ok("empresa, zona, categoría, contrato", () => {
  const r = toJobRow(raw, "Milano")!;
  assert.equal(r.company, "Logistica Srl");
  assert.equal(r.area, "Linate, Milano");
  assert.equal(r.category, "Lavoro Logistica & Magazzino");
  assert.equal(r.contract_type, "permanent");
  assert.equal(r.contract_time, "full_time");
  assert.equal(r.city, "Milano");
});
ok("sin id → null", () => assert.equal(toJobRow({ ...raw, id: undefined }, "Milano"), null));
ok("sin título → null", () => assert.equal(toJobRow({ ...raw, title: " <b></b> " }, "Milano"), null));
ok("enlace no https → null", () => assert.equal(toJobRow({ ...raw, redirect_url: "http://x.it" }, "Milano"), null));
ok("fecha inválida → null", () => assert.equal(toJobRow({ ...raw, created: "ayer" }, "Milano"), null));
ok("basura → null", () => { assert.equal(toJobRow(null, "Milano"), null); assert.equal(toJobRow("x", "Milano"), null); });
ok("contrato desconocido → null en ese campo", () => assert.equal(toJobRow({ ...raw, contract_type: "<x>" }, "Milano")!.contract_type, null));
ok("textos largos se recortan", () => assert.ok(toJobRow({ ...raw, title: "a".repeat(500) }, "Milano")!.title.length <= 200));
ok("URL de Adzuna", () => {
  const u = new URL(adzunaUrl("Milano", "ID1", "KEY1"));
  assert.equal(u.origin + u.pathname, "https://api.adzuna.com/v1/api/jobs/it/search/1");
  assert.equal(u.searchParams.get("where"), "Milano");
  assert.equal(u.searchParams.get("results_per_page"), "50");
  assert.equal(u.searchParams.get("max_days_old"), "3");
  assert.equal(u.searchParams.get("sort_by"), "date");
  assert.equal(u.searchParams.get("app_id"), "ID1");
  assert.equal(u.searchParams.get("app_key"), "KEY1");
});
ok("15 ciudades", () => assert.equal(JOB_CITIES.length, 15));
console.log(`${n} pruebas OK`);

/* ── refreshJobs con dependencias simuladas ── */
import { refreshJobs } from "../../src/lib/jobs-refresh";
(async () => {
  const mk = (fail: (city: string) => boolean) => {
    const saved: string[] = []; const deleted: string[] = [];
    return {
      saved, deleted,
      deps: {
        appId: "a", appKey: "b", now: new Date("2026-11-28T06:00:00Z"),
        getJson: async (url: string) => { const city = new URL(url).searchParams.get("where")!; if (fail(city)) throw new Error("caído"); return { results: [raw, { ...raw }, { id: "x" }] }; },
        upsert: async (rows: { id: string }[]) => { saved.push(...rows.map((r) => r.id)); },
        deleteBefore: async (iso: string) => { deleted.push(iso); },
      },
    };
  };
  const a = mk(() => false); const r1 = await refreshJobs(a.deps);
  assert.equal(r1.ok, true); assert.equal(r1.saved, 15); assert.equal(a.deleted[0], "2026-11-14T06:00:00.000Z");
  console.log("OK   todas las ciudades: guarda sin duplicados y borra lo de más de 14 días");
  const b = mk((c) => c === "Roma"); const r2 = await refreshJobs(b.deps);
  assert.deepEqual(r2.failed, ["Roma"]); assert.equal(r2.saved, 14); assert.equal(b.deleted.length, 1);
  console.log("OK   una ciudad falla: las demás se guardan");
  const c = mk(() => true); const r3 = await refreshJobs(c.deps);
  assert.equal(r3.ok, false); assert.equal(c.deleted.length, 0);
  console.log("OK   Adzuna caído: no se borra nada");
})();
