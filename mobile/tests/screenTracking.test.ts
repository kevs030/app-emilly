import { describe, expect, it, vi } from "vitest";
vi.mock("../src/lib/supabase", () => ({ supabase: {} }));
import { cleanPath } from "../src/lib/useScreenTracking";

describe("rutas de las estadísticas sin datos personales", () => {
  it("cambia los números por :id y limita la longitud", () => {
    expect(cleanPath("/community/1234")).toBe("/community/:id");
    expect(cleanPath("/guides/codice-fiscale")).toBe("/guides/codice-fiscale");
    expect(cleanPath("/")).toBe("/");
    expect(cleanPath("/a/" + "x".repeat(200)).length).toBe(80);
  });
});
