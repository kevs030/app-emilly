/* Fase 9 — Código del correo (registro y recuperar contraseña).
   Uso: npm run build && npm run preview & ; node tests/e2e/fase9.cjs */
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

  // ── Registro: pantalla «Revisa tu correo» con el código ──
  const p = await mk(devices["Pixel 7"]);
  await p.goto(ORIGIN + PREFIX + "/auth?mode=signup");
  await p.fill("input[type=email]", "ana@example.com");
  await p.fill("input[type=password]", "Correcta12345!");
  const age = p.locator("input[type=checkbox]"); for (let i = 0; i < (await age.count()); i++) await age.nth(i).check();
  await p.locator("button.btn", { hasText: "Crear cuenta" }).click();
  await p.locator("text=¿Te llegó un código?").waitFor({ timeout: 8000 });
  check("registro: tras crear la cuenta se puede escribir el código del correo", calls.signup === 1);
  const code = p.locator('input[autocomplete="one-time-code"]');
  await code.fill("999999"); await p.locator("button", { hasText: "Confirmar el código" }).click();
  await p.locator("text=El código no es correcto").waitFor({ timeout: 8000 });
  check("registro: código erróneo → mensaje claro", calls.verify.some((v) => v.token === "999999"));
  await code.fill("123456"); await p.locator("button", { hasText: "Confirmar el código" }).click();
  await p.waitForURL((u) => !u.pathname.startsWith(PREFIX + "/auth"), { timeout: 8000 });
  check("registro: código correcto → entra en la app", calls.verify.some((v) => v.token === "123456" && v.type === "email" && v.email === "ana@example.com"), p.url());

  // ── Recuperar contraseña ──
  const q = await mk(devices["iPhone 13"]);
  await q.goto(ORIGIN + PREFIX + "/reset");
  check("recuperar: explica que llega un código y un botón que funciona en Safari y Chrome", (await q.locator("text=funciona en Safari y Chrome").count()) === 1);
  await q.fill("input[type=email]", "ana@example.com");
  await q.locator("button.btn", { hasText: "Enviar" }).click();
  await q.locator("text=¿Te llegó un código?").waitFor({ timeout: 8000 });
  const rec = calls.recover.at(-1) || {};
  check("recuperar: el enlace del correo va a la web (no a la app) y sin código PKCE", rec.redirect === "https://www.apostoapp.app/nueva-contrasena" && !rec.body?.code_challenge, JSON.stringify(rec).slice(0, 160));
  await q.locator('input[autocomplete="one-time-code"]').fill("123456");
  await q.locator("button", { hasText: "Confirmar el código" }).click();
  await q.waitForURL(/new-password/, { timeout: 8000 });
  check("recuperar: código correcto → pantalla «Nueva contraseña»", calls.verify.some((v) => v.type === "recovery" && v.token === "123456"));
  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.log("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 3).join(" / ")); process.exit(1); });
