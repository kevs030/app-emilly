/* Fase 13 — Empleo: ofertas por ciudad (Adzuna simulado), búsqueda, guardadas, portales y guía.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase13.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
const SUPA = "https://emuyxcrtkfqizavslwfj.supabase.co";
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*", "access-control-expose-headers": "content-range" };

const now = new Date();
const at = (daysAgo, h = 1) => new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - daysAgo * 86400000 + h * 3600000).toISOString();
const J = (id, city, title, posted_at, extra = {}) => ({ id: "adzuna:" + id, city, title, company: "Empresa " + id, area: city + " Centro", contract_type: "permanent", contract_time: "full_time", category: null, url: "https://www.adzuna.it/land/ad/" + id, posted_at, ...extra });
const JOBS = [
  J("1", "Milano", "Magazziniere", at(0, 1)),
  J("2", "Milano", "Cameriere di sala", at(0, 0.5), { contract_type: "contract", contract_time: "part_time" }),
  J("3", "Milano", "Aiuto cuoco", at(2)),
  J("4", "Milano", "Badante convivente", at(4)),
  J("5", "Roma", "Addetto pulizie", at(0, 1)),
];

async function withJobs(app, state) {
  await app.p.route(`${SUPA}/rest/v1/job_offers*`, (r) => {
    const req = r.request(); const u = new URL(req.url());
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    if (state.mode === "error") return r.fulfill({ status: 500, headers: { ...cors, "content-type": "application/json" }, body: "{}" });
    const city = (u.searchParams.get("city") || "").replace(/^eq\./, "");
    const rows = state.mode === "empty" ? [] : JOBS.filter((j) => j.city === city);
    state.calls.push(city);
    if (req.method() === "HEAD") {
      const since = (u.searchParams.get("posted_at") || "").replace(/^gte\./, "");
      const n = rows.filter((j) => j.posted_at >= since).length;
      return r.fulfill({ status: 200, headers: { ...cors, "content-range": `*/${n}` }, body: "" });
    }
    return r.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(rows) });
  });
}

(async () => {
  const br = await chromium.launch();
  const res = []; const errs = [];
  const check = (n, ok, x = "") => res.push(`${ok ? "OK   " : "FALLA"} ${n}${x ? " — " + x : ""}`);
  const go = async (p, path, sel = "h1") => { await p.goto(ORIGIN + PREFIX + path); await p.waitForSelector(sel); };

  // ── Sin cuenta: elige ciudad ──
  const g = await makeApp(br, errs, {}); const gs = { mode: "ok", calls: [] }; await withJobs(g, gs);
  await go(g.p, "/jobs", '[data-testid="jobs-city"]');
  check("sin cuenta: se abre y pide elegir ciudad", (await g.p.locator('[data-testid="jobs-city"]').count()) === 1);
  check("«Cómo funciona» en Empleo", (await g.p.locator("section.help-card li").count()) === 3);
  await g.p.selectOption('[data-testid="jobs-city"]', "Milano");
  await g.p.waitForSelector('[data-testid="job-card"]');
  check("Milano: 2 ofertas «Nuevas hoy» en tarjetas", (await g.p.locator('[data-testid="job-card"]').count()) === 2);
  check("Milano: 2 ofertas en «Esta semana»", (await g.p.locator('[data-testid="job-row"]').count()) === 2);
  check("contadores: hoy 2, semana 4, guardadas 0", (await g.p.locator('[data-testid="count-today"]').innerText()) === "2" && (await g.p.locator('[data-testid="count-week"]').innerText()) === "4" && (await g.p.locator('[data-testid="count-saved"]').innerText()).startsWith("0"));
  const first = await g.p.locator('[data-testid="job-card"]').first().innerText();
  check("la más reciente primero, con empresa, contrato y fuente", first.includes("Magazziniere") && first.includes("Empresa 1") && first.includes("Indefinido") && first.includes("Jornada completa") && first.includes("Adzuna"));
  check("etiquetas de contrato temporal y media jornada", (await g.p.locator('[data-testid="job-card"]').nth(1).innerText()).includes("Temporal") && (await g.p.locator('[data-testid="job-card"]').nth(1).innerText()).includes("Media jornada"));
  check("«Ver oferta» abre el anuncio original fuera de la app", (await g.p.locator('[data-testid="job-open"]').first().getAttribute("href")) === "https://www.adzuna.it/land/ad/1" && (await g.p.locator('[data-testid="job-open"]').first().getAttribute("target")) === "_blank");
  check("aviso de seguridad visible", (await g.p.locator('[data-testid="jobs-safe"]').innerText()).includes("Ninguna empresa legal te pedirá dinero"));
  check("mención «Ofertas de Adzuna»", (await g.p.locator("text=Ofertas de Adzuna").count()) === 1);
  check("sin publicidad en Empleo", (await g.p.locator('aside[aria-label="Publicidad"]').count()) === 0);
  // Búsqueda
  await g.p.fill('[data-testid="jobs-search"]', "CAMERIERE");
  check("buscar «CAMERIERE» deja solo esa oferta", (await g.p.locator('[data-testid="job-card"]').count()) === 1 && (await g.p.locator('[data-testid="job-row"]').count()) === 0);
  await g.p.fill('[data-testid="jobs-search"]', "fontanero");
  check("búsqueda sin resultados: lo dice", (await g.p.locator('[data-testid="jobs-nomatch"]').count()) === 1);
  await g.p.fill('[data-testid="jobs-search"]', "");
  // Guardar
  await g.p.locator('[data-testid="job-save"]').first().click();
  check("guardar: contador «Guardadas» = 1", (await g.p.locator('[data-testid="count-saved"]').innerText()).startsWith("1"));
  check("guardar: se marca como guardada", (await g.p.locator('[data-testid="job-save"]').first().getAttribute("aria-pressed")) === "true");
  await g.p.click('[data-testid="count-saved"]');
  check("ver guardadas", (await g.p.locator('[data-testid="jobs-saved"] [data-testid="job-card"]').count()) === 1);
  const stored = await g.p.evaluate(() => localStorage.getItem("aposto:jobs:saved"));
  check("guardadas solo en el teléfono (localStorage)", stored && stored.includes("adzuna:1"));
  // Portales
  check("portales con la ciudad: Subito, Indeed, InfoJobs, EURES", (await g.p.locator('[data-testid="portal-subito"]').getAttribute("href")) === "https://www.subito.it/annunci-lombardia/vendita/offerte-lavoro/milano/" && (await g.p.locator('[data-testid="portal-indeed"]').getAttribute("href")) === "https://it.indeed.com/jobs?l=Milano" && (await g.p.locator('[data-testid="portal-infojobs"]').getAttribute("href")) === "https://www.infojobs.it/offerte-lavoro/milano-e-provincia" && (await g.p.locator('[data-testid="portal-eures"]').count()) === 1);
  // Tamaños y desbordamiento
  const small = await g.p.locator("main a, main button, a.btn, button").evaluateAll((els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).map((e) => (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 25)));
  const overflow = await g.p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check("botones ≥ 44 px y sin desbordamiento", small.length === 0 && !overflow, small.join(" | "));
  // La ciudad se recuerda; cambiar ciudad
  await go(g.p, "/jobs", '[data-testid="job-card"]');
  check("la ciudad elegida se recuerda", (await g.p.locator('[data-testid="jobs-change-city"]').innerText()).includes("Milano"));
  await g.p.click('[data-testid="jobs-change-city"]');
  await g.p.selectOption('[data-testid="jobs-city"]', "Roma");
  await g.p.waitForSelector('[data-testid="job-card"]');
  check("cambiar a Roma muestra las ofertas de Roma", (await g.p.locator('[data-testid="job-card"]').innerText()).includes("Addetto pulizie") && (await g.p.locator('[data-testid="portal-subito"]').getAttribute("href")).includes("annunci-lazio"));
  // Vacío y error
  gs.mode = "empty"; await go(g.p, "/jobs", '[data-testid="jobs-empty"]');
  check("sin ofertas: mensaje claro y portales", (await g.p.locator('[data-testid="jobs-empty"]').innerText()).includes("Hoy no hay ofertas nuevas") && (await g.p.locator('[data-testid="portal-subito"]').count()) === 1);
  gs.mode = "error"; await go(g.p, "/jobs", '[data-testid="jobs-error"]');
  check("error de conexión: aviso, «Reintentar» y portales", (await g.p.locator('[data-testid="jobs-error"] button').count()) === 1 && (await g.p.locator('[data-testid="portal-subito"]').count()) === 1);
  gs.mode = "ok"; await g.p.click('[data-testid="jobs-error"] button'); await g.p.waitForSelector('[data-testid="job-card"]');
  check("«Reintentar» vuelve a cargar", (await g.p.locator('[data-testid="job-card"]').count()) === 1);
  // Guía
  await g.p.click('[data-testid="jobs-guide"]'); await g.p.waitForSelector('[data-testid="guide-scams"]');
  check("guía: título, 4 pasos y estafas", (await g.p.locator("h1").innerText()).includes("Cómo buscar trabajo en Italia") && (await g.p.locator("ol > li").count()) === 4 && (await g.p.locator('[data-testid="guide-scams"] li').count()) === 4);
  check("guía: enlaces oficiales (albo de agencias y Decreto Flussi)", (await g.p.locator('a[href="https://politicheattive.lavoro.gov.it/albi-informatici/"]').count()) === 1 && (await g.p.locator('a[href^="https://integrazionemigranti.gov.it/"]').count()) === 1);
  await g.p.click('a[href="/work"]'); await g.p.waitForSelector("h1");
  check("guía: enlace a «Trabajo y beneficios laborales»", new URL(g.p.url()).pathname.endsWith("/work"));
  await g.p.context().close();

  // ── Con cuenta: ciudad del perfil, tarjeta del inicio y accesos ──
  const a = await makeApp(br, errs, {}); const as = { mode: "ok", calls: [] }; await withJobs(a, as);
  a.db.profile.city = "milán";
  await a.login();
  await a.p.waitForSelector('[data-testid="home-jobs"]');
  check("inicio: tarjeta «2 nuevas ofertas hoy en Milano»", (await a.p.locator('[data-testid="home-jobs"]').innerText()).includes("2 nuevas ofertas hoy en Milano"));
  const labels = await a.p.locator('nav[aria-label="Accesos"] a').allInnerTexts();
  check("inicio: accesos con Empleo y Mi consulado, sin Trámites ni Avisos", labels.some((l) => l.includes("Empleo")) && labels.some((l) => l.includes("Mi consulado")) && !labels.some((l) => l.trim() === "Trámites") && !labels.some((l) => l.includes("Avisos")), labels.join(", "));
  await a.p.click('[data-testid="home-jobs"]'); await a.p.waitForSelector('[data-testid="job-card"]');
  check("con cuenta: usa la ciudad del perfil («milán» → Milano) sin preguntar", (await a.p.locator('[data-testid="jobs-change-city"]').innerText()).includes("Milano"));
  as.mode = "empty";
  await go(a.p, "/", 'nav[aria-label="Accesos"]'); await a.p.waitForTimeout(600);
  check("inicio: sin ofertas de hoy no hay tarjeta", (await a.p.locator('[data-testid="home-jobs"]').count()) === 0);

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  if (res.some((r) => r.startsWith("FALLA"))) process.exit(1);
})();
