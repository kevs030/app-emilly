import { describe, expect, it } from "vitest";
import { claimable, REWARD_SECONDS, signToken, verifyToken, type AdToken } from "@/lib/ads-token";

const key = Buffer.from("clave-de-prueba-32-bytes-0123456789");
const t0 = 1_800_000_000_000;
const tok: AdToken = { u: "user-1", s: 7, n: "nonce-abc", t: t0 };

describe("anuncio con recompensa: justificante firmado", () => {
  it("un justificante firmado se lee igual", () => {
    expect(verifyToken(signToken(tok, key), key)).toEqual(tok);
  });
  it("si alguien cambia el contenido, la firma falla", () => {
    const [, sig] = signToken(tok, key).split(".");
    const forged = Buffer.from(JSON.stringify({ ...tok, u: "otra-cuenta" })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`, key)).toBeNull();
  });
  it("con otra clave no vale", () => {
    expect(verifyToken(signToken(tok, key), Buffer.from("otra-clave-distinta-0000000000000"))).toBeNull();
  });
  it("texto basura no rompe nada", () => {
    expect(verifyToken("basura", key)).toBeNull();
    expect(verifyToken("a.b", key)).toBeNull();
  });
});

describe("anuncio con recompensa: cuándo se puede cobrar", () => {
  it(`antes de ${REWARD_SECONDS} segundos, no`, () => {
    expect(claimable(tok, "user-1", t0 + 5_000)).toBe("too_soon");
  });
  it(`a los ${REWARD_SECONDS} segundos, sí`, () => {
    expect(claimable(tok, "user-1", t0 + REWARD_SECONDS * 1000)).toBe("ok");
  });
  it("otra cuenta no puede cobrar un justificante ajeno", () => {
    expect(claimable(tok, "user-2", t0 + 20_000)).toBe("wrong_user");
  });
  it("caduca a los 10 minutos", () => {
    expect(claimable(tok, "user-1", t0 + 11 * 60_000)).toBe("expired");
  });
});
