// Simuladores LOCALES de Supabase y Anthropic para validar hallazgos de A Posto sin tocar producción.
// - No hay datos reales, ni claves reales, ni conexiones a Internet.
// - Supabase simulado: 127.0.0.1:54321 (auth, PostgREST y RPC mínimos que usa la app).
// - Anthropic simulado: 127.0.0.1:54322 (stream SSE que tarda THINK_MS en enviar el primer texto).
// - Estado y contadores: GET http://127.0.0.1:54321/__state   ·   reinicio: POST /__reset
import http from "node:http";

const LATENCY_MS = Number(process.env.DB_LATENCY_MS ?? 80); // latencia típica de una consulta remota
const THINK_MS = Number(process.env.THINK_MS ?? 3000); // el modelo "piensa" antes de escribir
const USER = { id: "00000000-0000-4000-8000-00000000000a", aud: "authenticated", role: "authenticated", email: "cuenta-a@prueba.local" };

let state;
function reset(credits = 3) {
  state = { wallet: credits, ledger: [], anthropic: { requests: 0, completed: 0, abortedByClient: 0 } };
}
reset();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const body = (req) => new Promise((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b ? JSON.parse(b) : {})); });
const send = (res, status, data, headers = {}) => { res.writeHead(status, { "content-type": "application/json", ...headers }); res.end(data === undefined ? "" : JSON.stringify(data)); };

function countLedger(url) {
  const reason = url.searchParams.get("reason")?.replace(/^eq\./, "");
  const user = url.searchParams.get("user_id")?.replace(/^eq\./, "");
  return state.ledger.filter((l) => (!reason || l.reason === reason) && (!user || l.user_id === user)).length;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/__state") return send(res, 200, state);
  if (url.pathname === "/__reset") { reset(Number(url.searchParams.get("credits") ?? 3)); return send(res, 200, state); }
  await sleep(LATENCY_MS);

  if (url.pathname === "/auth/v1/user") return send(res, 200, USER);

  if (url.pathname.startsWith("/rest/v1/rpc/")) {
    const fn = url.pathname.split("/").pop();
    const args = await body(req);
    if (fn === "rate_hit") return send(res, 200, true);
    if (fn === "is_admin") return send(res, 200, false);
    if (fn === "spend_ai_credit") {
      if (state.wallet <= 0) return send(res, 200, -1);
      state.wallet -= 1;
      state.ledger.push({ user_id: USER.id, delta: -1, reason: "question", ref: null });
      return send(res, 200, state.wallet);
    }
    if (fn === "grant_ai_credits") {
      if (args.p_ref && state.ledger.some((l) => l.reason === args.p_reason && l.ref === args.p_ref)) return send(res, 200, false);
      state.ledger.push({ user_id: args.p_user, delta: args.p_amount, reason: args.p_reason, ref: args.p_ref });
      state.wallet += args.p_amount;
      return send(res, 200, true);
    }
    return send(res, 404, { message: `rpc ${fn} no simulada` });
  }

  if (url.pathname === "/rest/v1/ai_credit_ledger") return send(res, 200, req.method === "HEAD" ? undefined : [], { "content-range": `*/${countLedger(url)}` });
  if (url.pathname === "/rest/v1/sponsors") return send(res, 200, [{ id: 1, title: "Anuncio de prueba", body: "Texto de prueba del anuncio", cta: "Ver" }]);
  if (url.pathname === "/rest/v1/ai_wallets") return send(res, 200, [{ credits: state.wallet }]);
  if (url.pathname.startsWith("/rest/v1/")) return send(res, 200, []); // profiles, procedures, reminders…
  send(res, 404, { message: "no simulado" });
}).listen(54321, "127.0.0.1", () => console.log("Supabase simulado en :54321"));

const sse = (res, event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

http.createServer(async (req, res) => {
  if (!req.url.startsWith("/v1/messages")) return send(res, 404, {});
  await body(req);
  state.anthropic.requests += 1;
  let closed = false;
  res.on("close", () => { if (!res.writableFinished) { closed = true; state.anthropic.abortedByClient += 1; } });
  res.writeHead(200, { "content-type": "text/event-stream" });
  sse(res, "message_start", { type: "message_start", message: { id: "msg_local", type: "message", role: "assistant", model: "simulado", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 0 } } });
  await sleep(THINK_MS);
  if (closed) return;
  sse(res, "content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } });
  sse(res, "content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Respuesta simulada." } });
  sse(res, "content_block_stop", { type: "content_block_stop", index: 0 });
  sse(res, "message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 3 } });
  sse(res, "message_stop", { type: "message_stop" });
  state.anthropic.completed += 1;
  res.end();
}).listen(54322, "127.0.0.1", () => console.log("Anthropic simulado en :54322"));
