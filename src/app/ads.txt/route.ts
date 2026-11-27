import { ADSENSE_CLIENT } from "@/lib/adsense";

/** ads.txt: dice a los anunciantes que Google AdSense puede vender anuncios en apostoapp.app. */
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("# Sin anuncios de terceros\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const pub = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
