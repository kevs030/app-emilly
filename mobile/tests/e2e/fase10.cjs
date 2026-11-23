/* Fase 10 — La cuenta se queda guardada: registro a medias, volver a abrir la app y cerrar sesión.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase10.cjs */
const { chromium, devices } = require("playwright");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "u1", exp: Math.floor(Date.now() / 1000) + 36000, role: "authenticated" })}.sig`;
const user = { id: "u1", aud: "authenticated", email: "ana@example.com", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const session = { access_token: jwt, token_type: "bearer", expires_in: 36000, expires_at: Math.floor(Date.now() / 1000) + 36000, refresh_token: "r1", user };
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

(async () => {
  const br = await chromium.launch();
  const res = [];
  const check = (n, ok, x = "") => res.push(`${ok ? "OK   " : "FALLA"} ${n}${x ? " — " + x : ""}`);
  const errs = [];
  const calls = { recover: [], verify: [], signup: 0, user: 0 };
  const mk = async (dev) => {
    const ctx = await br.newContext({ ...dev, locale: "es-ES" });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
    await p.route("https://emuyxcrtkfqizavslwfj.supabase.co/**", async (r) => {
      const req = r.request(), u = new URL(req.url());
      if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
      const json = (status, body) => r.fulfill({ status, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(body) });
      if (u.pathname === "/auth/v1/settings") return json(200, { external: { email: true, phone: false } });
      if (u.pathname === "/auth/v1/signup") { calls.signup++; return json(200, { ...user, identities: [{}] }); }
      if (u.pathname === "/auth/v1/recover") { calls.recover.push({ redirect: u.searchParams.get("redirect_to"), body: req.postDataJSON() }); return json(200, {}); }
      if (u.pathname === "/auth/v1/verify") {
        const b = req.postDataJSON(); calls.verify.push(b);
        return b.token === "123456" ? json(200, session) : json(403, { code: 403, error_code: "otp_expired", msg: "Token has expired or is invalid" });
      }
      if (u.pathname === "/auth/v1/user") { calls.user++; return json(200, { ...user }); }
      if (u.pathname.startsWith("/rest/v1/profiles")) return json(200, req.headers()["accept"]?.includes("vnd.pgrst.object") ? { display_name: "Ana", preferred_language: "es", consent_personalization: false, consent_analytics: false } : [{ display_name: "Ana", preferred_language: "es" }]);
      return json(200, []);
    });
    return p;
  };

  const p = await mk(devices["Pixel 7"]);
  // 1) Registro desde la portada y la app se cierra mientras la persona mira su correo
  await p.goto(ORIGIN + PREFIX + "/welcome"); await p.waitForSelector("#langs-title");
  check("portada (teléfono nuevo): empieza en «Crear cuenta»", (await p.locator('button[aria-pressed="true"]', { hasText: "Crear cuenta" }).count()) === 1);
  await p.fill("input[type=email]", "ana@example.com");
  await p.fill("input[type=password]", "Correcta12345!");
  const age = p.locator("input[type=checkbox]"); for (let i = 0; i < (await age.count()); i++) await age.nth(i).check();
  await p.locator("form button.btn", { hasText: "Crear cuenta" }).click();
  await p.locator("text=¿Te llegó un código?").waitFor({ timeout: 8000 });
  await p.reload(); await p.waitForLoadState("networkidle");
  const back = await p.locator("text=¿Te llegó un código?").count();
  check("registro a medias: al volver a abrir la app sigue en «escribe el código» (no en «Crear cuenta»)", back === 1 && (await p.locator("text=ana@example.com").count()) >= 1);
  await p.locator('input[autocomplete="one-time-code"]').fill("123456");
  await p.locator("button", { hasText: "Confirmar el código" }).click();
  await p.waitForURL((u) => !/\/(welcome|auth)/.test(u.pathname), { timeout: 8000 });
  check("registro: con el código entra en la app", true, new URL(p.url()).pathname);
  // 2) Cerrar y volver a abrir la app: sigue dentro, sin volver a escribir nada
  await p.reload(); await p.waitForLoadState("networkidle"); await p.waitForTimeout(500);
  check("volver a abrir la app: sigue con la sesión abierta (sin portada ni «Crear cuenta»)", !/\/(welcome|auth)/.test(new URL(p.url()).pathname) && (await p.locator("text=Crear cuenta").count()) === 0, new URL(p.url()).pathname);
  await p.goto(ORIGIN + PREFIX + "/"); await p.waitForTimeout(500);
  check("abrir de nuevo desde el inicio: sigue dentro", !/\/(welcome|auth)/.test(new URL(p.url()).pathname));
  // 3) Cerrar sesión a propósito: la portada ofrece «Entrar» con el correo ya escrito
  await p.goto(ORIGIN + PREFIX + "/profile"); await p.waitForSelector("h1");
  await p.locator("button", { hasText: "Cerrar sesión" }).click();
  await p.waitForURL(/\/welcome/, { timeout: 8000 }); await p.waitForSelector("#langs-title");
  check("tras cerrar sesión: la portada muestra «Entrar» (no «Crear cuenta»)", (await p.locator('button[aria-pressed="true"]', { hasText: "Entrar" }).count()) === 1);
  check("tras cerrar sesión: el correo ya está escrito", (await p.inputValue("input[type=email]")) === "ana@example.com");
  check("la contraseña nunca se guarda en el teléfono", !(await p.evaluate(() => JSON.stringify(localStorage))).includes("Correcta12345"));
  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.log("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 3).join(" / ")); process.exit(1); });
