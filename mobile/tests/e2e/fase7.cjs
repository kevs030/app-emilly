/* Fase 7 — Tessera sanitaria, Codice fiscale y Art. 31: idioma al momento, ciudades, PDF y vídeo.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase7.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), "aposto-pdf-"));

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);
  const { p, login } = await makeApp(br, errs, { contextOptions: { acceptDownloads: true } });
  // Vídeos: solo existe el de codice fiscale en español
  await p.route("**/videos/manifest.json", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ es: { "codice-fiscale": true } }) }));
  await login();
  const closeHelp = async () => { const b = p.locator('button:has-text("Entendido")'); if (await b.count()) await b.first().click(); };
  const pdfOf = async (button) => {
    const [d] = await Promise.all([p.waitForEvent("download", { timeout: 20000 }), button.click()]);
    const file = path.join(OUT, d.suggestedFilename());
    await d.saveAs(file);
    return fs.readFileSync(file);
  };

  // ── Tessera sanitaria ──
  await p.goto(ORIGIN + PREFIX + "/guides/sanidad-tessera-sanitaria"); await p.waitForSelector("h1"); await closeHelp();
  const req = await p.locator("#tessera-req").locator("..").innerText();
  check("tessera: requisitos con Dichiarazione di Ospitalità, Carta d'Identità, codice fiscale y permesso", ["Dichiarazione di Ospitalità", "Carta d'Identità", "Codice fiscale", "Permesso di soggiorno"].every((w) => req.includes(w)));
  await p.selectOption("#tessera-title ~ label select, section[aria-labelledby=tessera-title] select", "milano");
  const mil = await p.locator("section[aria-labelledby=tessera-title]").innerText();
  check("tessera: Milano muestra ZeroCoda y Fascicolo Sanitario Lombardia", mil.includes("ZeroCoda") && mil.includes("Fascicolo Sanitario Lombardia") && mil.includes("SPID"));
  check("tessera: enlace directo a prenota.zerocoda.it", (await p.locator('a[href="https://prenota.zerocoda.it"]').count()) >= 1);
  await p.selectOption("section[aria-labelledby=tessera-title] select", "napoli");
  check("tessera: Nápoles muestra SINFONIA", (await p.locator('a[href="https://sinfonia.regione.campania.it"]').count()) === 1);
  await p.selectOption("section[aria-labelledby=tessera-title] select", "other");
  check("tessera: «Otra ciudad» explica que cada ASL es distinta", (await p.locator("section[aria-labelledby=tessera-title]").innerText()).includes("Cada ASL organiza"));
  await p.locator('button:has-text("¿Qué hay en este enlace?")').first().click();
  const dlg = p.locator('[role="dialog"]');
  check("enlace: el modal explica qué hay y los pasos", (await dlg.innerText()).toLowerCase().includes("qué encontrarás aquí") && (await dlg.innerText()).toLowerCase().includes("pasos a seguir"));
  const pdf1 = await pdfOf(dlg.locator('button:has-text("Resumen en PDF")'));
  check("enlace: el resumen en PDF es un PDF válido", pdf1.subarray(0, 8).toString() === "%PDF-1.4" && pdf1.length > 20000, `${pdf1.length} bytes`);
  fs.writeFileSync(path.join(OUT, "resumen-es.pdf"), pdf1);
  await dlg.locator('button[aria-label="Cerrar"]').click();
  check("tessera: sin vídeo todavía → aviso amable", (await p.locator("text=El vídeo en tu idioma está en preparación").count()) === 1 && (await p.locator("video").count()) === 0);

  // ── Cambio de idioma al momento (árabe) ──
  await p.evaluate(() => localStorage.setItem("aposto:lang", "ar")); await p.reload(); await p.waitForSelector("h1"); await closeHelp();
  const ar = await p.locator("#tessera-req").locator("..").innerText();
  check("idioma: en árabe los requisitos cambian y la página va de derecha a izquierda", ar.includes("تصريح") && (await p.evaluate(() => document.documentElement.dir)) === "rtl");
  check("idioma: la ciudad elegida se recuerda", (await p.locator("section[aria-labelledby=tessera-title] select").inputValue()) === "other");

  // ── Codice fiscale ──
  await p.evaluate(() => localStorage.setItem("aposto:lang", "bn"));
  await p.goto(ORIGIN + PREFIX + "/guides/codice-fiscale"); await p.waitForSelector("h1"); await closeHelp();
  const it = p.locator('a:has-text("AA4/8")').first();
  check("codice fiscale: el PDF oficial sigue en italiano y del sitio oficial", /agenziaentrate\.gov\.it\/.*AA4/.test(await it.getAttribute("href")));
  const bn = await p.locator("main").innerText();
  check("codice fiscale: guía de casillas en bengalí con los nombres italianos de cada casilla", bn.includes("Cognome") && bn.includes("পাসপোর্টে") && bn.includes("Tipo di richiesta"));
  const pdf2 = await pdfOf(p.locator("button", { hasText: "ঘরে ঘরে নির্দেশিকা PDF" }));
  fs.writeFileSync(path.join(OUT, "guia-bn.pdf"), pdf2);
  check("codice fiscale: guía de casillas en PDF (bengalí)", pdf2.subarray(0, 8).toString() === "%PDF-1.4");
  const pdf3 = await pdfOf(p.locator("button", { hasText: "লিফলেট PDF" }));
  check("codice fiscale: folleto para extranjeros en PDF en el idioma elegido", pdf3.subarray(0, 8).toString() === "%PDF-1.4");
  await p.evaluate(() => localStorage.setItem("aposto:lang", "es")); await p.reload(); await p.waitForSelector("h1");
  const v = p.locator("video");
  check("vídeo: codice fiscale en español se reproduce, sin pista de subtítulos", (await v.count()) === 1 && /\/videos\/es\/codice-fiscale\.mp4$/.test(await v.getAttribute("src")) && (await p.locator("video track").count()) === 0);
  await p.evaluate(() => localStorage.setItem("aposto:lang", "fr")); await p.reload(); await p.waitForSelector("h1");
  check("vídeo: en francés aún no existe → aviso en francés", (await p.locator("video").count()) === 0 && (await p.locator("text=La vidéo dans votre langue est en préparation").count()) === 1);

  // ── Art. 31 ──
  await p.evaluate(() => localStorage.setItem("aposto:lang", "es"));
  await p.goto(ORIGIN + PREFIX + "/guides/articolo-31"); await p.waitForSelector("h1"); await closeHelp();
  await p.selectOption("section[aria-labelledby=art31-title] select", "torino");
  const to = await p.locator("section[aria-labelledby=art31-title]").innerText();
  check("art. 31: Turín indica su Tribunal de Menores y su formulario propio", to.includes("Tribunale per i Minorenni di Torino") && (await p.locator('a[href*="tribmin-torino.giustizia.it"]').count()) === 2);
  check("art. 31: cómo se presenta, documentos y coste", to.includes("abogado") && to.includes("acta de nacimiento") && to.includes("27 €"));
  await p.selectOption("section[aria-labelledby=art31-title] select", "palermo");
  check("art. 31: Palermo → su tribunal", (await p.locator('a[href="https://tribmin-palermo.giustizia.it"]').count()) === 1);
  check("art. 31: cada enlace tiene su explicación", (await p.locator("section[aria-labelledby=art31-title] button", { hasText: "¿Qué hay en este enlace?" }).count()) >= 1);

  check("sin errores de JavaScript", errs.filter((e) => !/tribmin|zerocoda|tupassi|videos\//.test(e)).length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  console.log("PDF de prueba en", OUT);
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.log("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 3).join(" / ")); process.exit(1); });
