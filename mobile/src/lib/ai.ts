import { API_URL, supabase } from "./supabase";

export type AiResult = { status: "ok"; credits: number | null } | { status: "no_credits" | "rate_limited" | "not_ready" | "error" | "offline" };

/**
 * Llama a una función de IA del servidor y va entregando el texto según llega.
 * La clave del proveedor vive en el servidor; la app solo envía la sesión de la persona.
 */
export async function streamAI(path: "/api/assistant" | "/api/document", body: unknown, onText: (all: string) => void): Promise<AiResult> {
  try {
    const { data } = await supabase.auth.getSession();
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify(body),
    });
    if (res.status === 402) return { status: "no_credits" };
    if (res.status === 429) return { status: "rate_limited" };
    if (res.status === 503) return { status: "not_ready" };
    if (!res.ok || !res.body) return { status: "error" };
    const left = Number(res.headers.get("X-Credits-Remaining"));
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      onText(acc);
    }
    return { status: "ok", credits: Number.isFinite(left) ? left : null };
  } catch (e) {
    return { status: e instanceof TypeError ? "offline" : "error" };
  }
}
