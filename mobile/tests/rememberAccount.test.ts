import { beforeEach, describe, expect, it } from "vitest";
import { clearPendingSignup, knownEmail, pendingSignup, rememberEmail, setPendingSignup } from "~/lib/rememberAccount";

// Las pruebas corren sin navegador: un localStorage mínimo en memoria.
const mem = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
  },
});

describe("recordar la cuenta en este teléfono", () => {
  beforeEach(() => localStorage.clear());
  it("guarda solo el correo, en minúsculas", () => {
    rememberEmail(" Ana@Example.com ");
    expect(knownEmail()).toBe("ana@example.com");
    expect([...mem.values()].join(" ")).not.toMatch(/password|contraseña/i);
  });
  it("el registro a medias dura 24 horas", () => {
    setPendingSignup("ana@example.com", 1_000);
    expect(pendingSignup(1_000 + 3_600_000)).toBe("ana@example.com");
    expect(pendingSignup(1_000 + 25 * 3_600_000)).toBeNull();
    clearPendingSignup();
    expect(pendingSignup(2_000)).toBeNull();
  });
});
