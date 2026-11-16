/* Fase 1 — navegación, buscador, ayudas y citas. Uso: npm run build && npm run preview & ; node tests/e2e/fase1.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);
  const { p, db, login } = await makeApp(br, errs);
  p.on("response", (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`));
  await login();

  // Accesos del inicio: todos llevan a un destino real
  const links = await p.locator('nav[aria-label="Accesos"] a').evaluateAll((a) => a.map((x) => [x.textContent.trim(), x.getAttribute("href"), x.target]));
  check("el inicio muestra 7 accesos", links.length === 7, JSON.stringify(links.map((l) => l[0])));
  for (const [label, href, target] of links) {
    if (target === "_blank") { check(`acceso «${label}» abre la web`, /^https:\/\/app-emilly\.vercel\.app\/(mapa|foro)$/.test(href), href); continue; }
    await p.click(`nav[aria-label="Accesos"] a[href="${href}"]`);
    await p.waitForTimeout(250);
    const h1 = await p.locator("h1").first().innerText().catch(() => "");
    check(`acceso «${label}» abre una pantalla`, new URL(p.url()).pathname === href && h1.length > 0, `${href} → «${h1}»`);
    await p.goto("http://localhost:4173/"); await p.waitForSelector('nav[aria-label="Accesos"]');
  }
  const small = await p.locator("a, button").evaluateAll((els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).map((e) => e.textContent.trim().slice(0, 30)));
  check("todos los botones del inicio miden al menos 44 px", small.length === 0, small.join(" | "));
  check("sin desbordamiento horizontal", await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  // Buscador
  await p.click('a[role="search"]'); await p.waitForSelector('input[type="search"]');
  await p.fill('input[type="search"]', "codigo fiscal");
  check("buscar «codigo fiscal» (sin acento) encuentra la guía", (await p.locator("li a.card").first().innerText()).includes("código fiscal"));
  await p.fill('input[type="search"]', "zzzz");
  check("búsqueda sin resultados lo dice", (await p.locator("text=No encontramos nada").count()) === 1);
  await p.fill('input[type="search"]', "assegno unico");
  await p.locator('li a.card:has-text("Ayuda")').first().click(); await p.waitForTimeout(300);
  check("un resultado de ayuda abre la pantalla de ayudas en esa ayuda", p.url().endsWith("/benefits#assegno-unico"));

  // Ayudas
  const cards = p.locator("li.card");
  check("ayudas: cada una con fuente y fecha", (await cards.count()) >= 4 && (await cards.evaluateAll((c) => c.every((x) => x.querySelector('a[href^="https://"]') && /\d{4}-\d{2}-\d{2}/.test(x.textContent)))));
  await p.screenshot({ path: "tests/e2e/out-ayudas.png" });

  // Citas
  await p.goto("http://localhost:4173/appointments"); await p.waitForSelector("text=Pendientes");
  await p.click('button:has-text("Añadir recordatorio")');
  await p.fill('input[placeholder^="Ej."]', "Cita en la Questura");
  await p.fill('input[type=date]', new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10));
  await p.click('button.btn:has-text("Guardar")'); await p.waitForSelector("text=Cita en la Questura");
  check("cita guardada en el servidor", db.reminders.length === 1 && db.reminders[0].title === "Cita en la Questura");
  check("muestra «en 5 días»", (await p.locator("li:has-text('Cita en la Questura')").innerText()).includes("5"));
  await p.click('[role=checkbox][aria-label="Cita en la Questura"]'); await p.waitForSelector("h2:has-text('Hechas')");
  check("al marcarla pasa a «Hechas»", db.reminders[0].done === true);
  await p.goto("http://localhost:4173/"); await p.waitForSelector('nav[aria-label="Accesos"]');
  await p.screenshot({ path: "tests/e2e/out-inicio.png", fullPage: true });

  // Árabe: derecha a izquierda y textos nuevos traducidos
  await p.evaluate(() => localStorage.setItem("aposto:lang", "ar")); await p.goto("http://localhost:4173/search"); await p.waitForSelector('input[type="search"]');
  check("árabe: dirección RTL y buscador traducido", (await p.evaluate(() => document.documentElement.dir)) === "rtl" && (await p.locator('input[type="search"]').getAttribute("placeholder")).includes("ابحث"));

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})();
