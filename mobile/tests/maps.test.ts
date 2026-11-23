import { describe, expect, it } from "vitest";
import { directionsUrl, mapLink, mapsPlatform, placeUrl, searchUrl } from "~/lib/maps";

describe("abrir la app de mapas del teléfono", () => {
  it("detecta el tipo de teléfono", () => {
    expect(mapsPlatform("x", "android")).toBe("android");
    expect(mapsPlatform("x", "ios")).toBe("ios");
    expect(mapsPlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8)", "web")).toBe("android");
    expect(mapsPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "web")).toBe("ios");
    expect(mapsPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "web")).toBe("desktop");
  });
  it("Android usa geo: (la app de mapas predeterminada) con el nombre del lugar", () => {
    expect(placeUrl(41.8821, 12.50313, "Consolato (Perù)", "android")).toBe("geo:0,0?q=41.8821,12.50313(Consolato%20Per%C3%B9)");
    expect(directionsUrl(45.07, 7.68, "Questura", "android")).toMatch(/^geo:0,0\?q=45\.07,7\.68\(Questura\)$/);
    expect(searchUrl("Questura", [45.07, 7.68], "android")).toBe("geo:45.07,7.68?q=Questura");
  });
  it("iPhone abre Mapas de Apple", () => {
    expect(placeUrl(41.8821, 12.50313, "Consolato", "ios")).toBe("https://maps.apple.com/?ll=41.8821,12.50313&q=Consolato");
    expect(directionsUrl(41.8821, 12.50313, "", "ios")).toBe("https://maps.apple.com/?daddr=41.8821,12.50313");
  });
  it("en el ordenador, Google Maps en el navegador", () => {
    expect(directionsUrl(1, 2, "", "desktop")).toBe("https://www.google.com/maps/dir/?api=1&destination=1,2");
  });
  it("geo: se abre en la misma pestaña; https, en una nueva", () => {
    expect(mapLink("geo:0,0?q=1,2")).toEqual({ href: "geo:0,0?q=1,2" });
    expect(mapLink("https://maps.apple.com/?q=x")).toMatchObject({ target: "_blank" });
  });
});
