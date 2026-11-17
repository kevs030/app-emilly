import { describe, expect, it } from "vitest";
import { suggestEmail } from "../src/lib/emailTypos";

describe("sugerencia de correo mal escrito", () => {
  it("corrige dominios comunes mal escritos", () => {
    expect(suggestEmail("ana@gmial.com")).toBe("ana@gmail.com");
    expect(suggestEmail("ana@gmail.con")).toBe("ana@gmail.com");
    expect(suggestEmail("ana@hotmal.com")).toBe("ana@hotmail.com");
    expect(suggestEmail("ana@librero.it")).toBe("ana@libero.it");
  });
  it("no sugiere nada si el dominio es correcto o desconocido", () => {
    expect(suggestEmail("ana@gmail.com")).toBeNull();
    expect(suggestEmail("ana@empresa-propia.es")).toBeNull();
    expect(suggestEmail("sin-arroba")).toBeNull();
  });
});
