/* Fase 8 — Perfil (foto con recorte, PDF), guía de integración, Mi consulado con mapa, trabajo y frase del día.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase8.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const fs = require("fs");
const path = require("path");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
const PNG = fs.readFileSync(path.join(__dirname, "../../public/icon-192.png"));
const PDF = Buffer.from("%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n");

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);
  const { p, login } = await makeApp(br, errs);
  const tiles = [];
  await p.route("https://tile.openstreetmap.org/**", (r) => { tiles.push(r.request().url()); r.fulfill({ status: 200, contentType: "image/png", body: PNG }); });
  const go = async (u) => { await p.goto(ORIGIN + PREFIX + u); await p.waitForSelector("h1, h2"); const b = p.locator('button:has-text("Entendido")'); if (await b.count()) await b.first().click(); };

  // ── Sin cuenta: Mi consulado se puede consultar ──
  await go("/consulates");
  check("ruta /consulates abre sin cuenta", (await p.locator("h1", { hasText: "Mi consulado" }).count()) === 1);

  await login();

  // ── Inicio ──
  const quote = await p.locator('[data-testid="daily-quote"]').innerText();
  check("inicio: frase del día visible", quote.includes("Frase del día") && quote.length > 30);
  const work = await p.locator('[data-testid="work-soon"]').innerText();
  check("inicio: Trabajo y beneficios con «En desarrollo / Próximamente» y el mensaje literal", work.includes("En desarrollo / Próximamente") && work.includes("Estamos trabajando en este apartado para que puedas recibir ayuda, guías y consejos prácticos sobre tus derechos laborales, nómina (busta paga), vacaciones, TFR y beneficios al trabajar con contrato en Italia."));
  check("inicio: siguen los 12 accesos", (await p.locator('nav[aria-label="Accesos"] li').count()) === 12);
  const ig = p.locator('[data-testid="integration-guide"]');
  check("guía: 5 puntos y progreso 0 de 5", (await ig.locator("li > button[aria-expanded]").count()) === 5 && (await p.locator('[data-testid="ig-count"]').innerText()).startsWith("0 de 5"));
  await ig.locator("button", { hasText: "Declaración de hospitalidad" }).click();
  check("hospitalidad: plazo 48 h y formulario oficial", (await ig.innerText()).includes("48 h") && (await p.locator('a[href="https://www.poliziadistato.it/statics/18/modulo-art7.pdf"]').count()) === 1);
  const hosp = await ig.innerText();
  check("hospitalidad: requisitos y formas de entrega (PEC, Raccomandata A/R, en persona)", ["documento de identidad", "contrato de alquiler", "pasaporte", "PEC", "Raccomandata A/R", "En persona"].every((w) => hosp.includes(w)));
  await p.selectOption('[data-testid="hosp-city"]', "Milano");
  check("hospitalidad: al elegir Milano aparece su Questura", (await p.locator('a[href="https://questure.poliziadistato.it/it/Milano"]').count()) === 1);
  await ig.locator("button", { hasText: "Marcar como hecho" }).click();
  check("guía: marcar como hecho → 1 de 5", (await p.locator('[data-testid="ig-count"]').innerText()).startsWith("1 de 5"));
  await ig.locator("button", { hasText: "SPID" }).click();
  check("SPID: pasos con CIE y enlace oficial", (await ig.innerText()).includes("PosteID") && (await p.locator('a[href="https://www.spid.gov.it/cos-e-spid/come-attivare-spid/"]').count()) === 1);
  await ig.locator("button", { hasText: "CPIA" }).click();
  const cpia = await ig.innerText();
  check("CPIA: 4 pasos y tarjetas Milano (6 sedes), Torino, Sassari, Viterbo", ["Via Giovanni Pontano 43", "02 45375400", "Viale Zara 100", "Via Valdagno 8", "Via Vajont 5", "Via del Paradiso 4"].every((w) => cpia.includes(w)) && (await p.locator('a[href="https://www.cpia5torino.it/"]').count()) === 1 && (await p.locator('a[href="https://www.cpia5sassari.edu.it/"]').count()) === 1);
  await ig.locator("button", { hasText: "ISEE" }).click();
  check("ISEE: E01/E02 y los 4 enlaces", (await ig.innerText()).includes("E01") && (await Promise.all(["https://www.inps.it/", "https://sistemats1.sanita.finanze.it/", "https://www.fascicolosanitario.regione.lombardia.it/esenzioni", "https://prenotasalute.regione.lombardia.it/"].map((u) => p.locator(`a[href="${u}"]`).count()))).every((n) => n === 1));
  await ig.locator("button", { hasText: "cuenta bancaria" }).click();
  const bank = await ig.innerText();
  check("banco: requisitos y comparativa", ["Postepay Evolution", "Conto XME", "My Genius", "Revolut", "N26", "Buddybank", "teléfono italiano"].every((w) => bank.includes(w)));
  await p.reload(); await p.waitForSelector('[data-testid="integration-guide"]');
  check("guía: el progreso se guarda en el teléfono", (await p.locator('[data-testid="ig-count"]').innerText()).startsWith("1 de 5"));

  // ── Mi consulado ──
  await p.click('[data-testid="consulate-card"]'); await p.waitForURL(/\/consulates$/);
  await p.selectOption('[data-testid="cs-country"]', "PE");
  await p.selectOption('[data-testid="cs-city"]', "Torino");
  check("consulado: Perú desde Turín → Milán primero, con distancia", (await p.locator('[data-testid="cs-results"] > li').first().getAttribute("data-testid")) === "cs-pe-milano" && (await p.locator('[data-testid="cs-pe-milano"]').innerText()).includes("km de tu ciudad"));
  await p.selectOption('[data-testid="cs-city"]', "Roma");
  const roma = p.locator('[data-testid="cs-pe-roma"]');
  check("consulado: Perú en Roma → «En tu ciudad», dirección, teléfono y citas", (await roma.innerText()).includes("En tu ciudad") && (await roma.innerText()).includes("Via Sibari 4") && (await roma.locator('a[href="tel:+39068848063"]').count()) === 1 && (await roma.locator('a[href^="https://www.gob.pe/"]').count()) === 1);
  await roma.locator("button", { hasText: "Ver en el mapa" }).click();
  const dlg = p.locator('[role="dialog"]');
  await dlg.locator(".leaflet-marker-icon").waitFor({ timeout: 10000 });
  const center = await dlg.locator('[data-testid="consulate-map"]').evaluate((el) => ({ lat: el.dataset.lat, lon: el.dataset.lon }));
  check("mapa: se abre centrado en las coordenadas exactas con marcador destacado", center.lat === "41.8821" && center.lon === "12.50313" && (await dlg.locator(".consulate-pin").count()) === 1 && tiles.some((u) => /\/17\//.test(u)), `${tiles.length} teselas`);
  const nav = await dlg.locator("a", { hasText: "Cómo llegar" }).getAttribute("href");
  check("mapa: botón de navegación externa a esas coordenadas", nav.includes("41.8821,12.50313"));
  await dlg.locator('button[aria-label="Cerrar"]').click();
  await p.selectOption('[data-testid="cs-country"]', "other");
  check("consulado: «Otro país» explica qué hacer", (await p.locator("text=Todavía no tenemos datos comprobados").count()) === 1);
  await p.evaluate(() => localStorage.setItem("aposto:lang", "ar")); await p.reload(); await p.waitForSelector("h1");
  check("consulado: en árabe, de derecha a izquierda y nombres de país traducidos", (await p.evaluate(() => document.documentElement.dir)) === "rtl" && (await p.locator("h1").innerText()).includes("قنصليتي"));
  await p.evaluate(() => localStorage.setItem("aposto:lang", "es"));

  // ── Perfil: foto ──
  await go("/profile");
  await p.setInputFiles('[data-testid="avatar-input"]', { name: "yo.png", mimeType: "image/png", buffer: PNG });
  const crop = p.locator('[data-testid="avatar-crop"]');
  await crop.waitFor();
  const bx = await crop.boundingBox();
  await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width / 2 + 40, bx.y + bx.height / 2 + 20, { steps: 4 }); await p.mouse.up();
  await p.locator('[role="dialog"] input[type=range]').fill("2");
  await p.locator('[role="dialog"] button', { hasText: "Guardar foto" }).click();
  const src = await p.locator('[data-testid="avatar-img"]').first().getAttribute("src");
  check("foto: se recorta y guarda (JPEG 256 px en el teléfono)", src && src.startsWith("data:image/jpeg"));
  await go("/");
  check("foto: aparece en el inicio", (await p.locator('header [data-testid="avatar-img"]').count()) === 1);

  // ── Perfil: PDF ──
  await go("/profile");
  await p.selectOption('[data-testid="vault-cat"]', "isee");
  await p.setInputFiles('[data-testid="vault-input"]', { name: "isee-2026.pdf", mimeType: "application/pdf", buffer: PDF });
  await p.locator('[data-testid="vault-list"]').waitFor();
  const row = await p.locator('[data-testid="vault-list"] li').first().innerText();
  check("PDF: aparece con nombre, categoría y fecha", row.includes("isee-2026") && row.includes("ISEE") && /\d/.test(row));
  const [popup] = await Promise.all([p.waitForEvent("popup", { timeout: 5000 }).catch(() => null), p.locator('button[aria-label^="Ver: "]').click()]);
  check("PDF: se abre en otra pestaña", Boolean(popup));
  if (popup) await popup.close();
  await p.setInputFiles('[data-testid="vault-input"]', { name: "foto.png", mimeType: "image/png", buffer: PNG });
  check("PDF: rechaza archivos que no son .pdf", (await p.locator("text=Solo archivos .pdf de hasta 8 MB.").count()) >= 2);
  await p.locator('button[aria-label^="Borrar: "]').click();
  await p.locator("text=Aún no has guardado ningún PDF.").waitFor();
  check("PDF: se puede borrar", (await p.locator('[data-testid="vault-list"]').count()) === 0);

  // ── Perfil: frase diaria ──
  const qs = await p.locator("section[aria-labelledby=quote-settings]").innerText();
  check("frase diaria: hora por defecto 08:30 y aviso de que funciona en la app instalada", (await p.locator('[data-testid="quote-time"]').inputValue()) === "08:30" && qs.includes("app instalada"));

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.log("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 3).join(" / ")); process.exit(1); });
