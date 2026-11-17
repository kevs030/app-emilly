import { describe, expect, it, vi } from "vitest";
vi.mock("@capgo/capacitor-updater", () => ({ CapacitorUpdater: {} }));
vi.mock("@capacitor/app", () => ({ App: {} }));
import { plan, type Manifest } from "../src/lib/liveUpdate";

const m = (o: Partial<Manifest> = {}): Manifest => ({ hash: "nuevo", url: "/app-update/bundle-x.zip", checksum: "abc", minNative: 2, ...o });

describe("actualizaciones en vivo", () => {
  it("descarga si el contenido publicado es distinto del instalado", () => {
    expect(plan(m(), { hash: "viejo", native: 2 })).toBe("download");
  });
  it("no hace nada si ya tiene lo último", () => {
    expect(plan(m({ hash: "igual" }), { hash: "igual", native: 2 })).toBe("none");
  });
  it("pide APK nuevo si el paquete necesita una versión nativa más reciente", () => {
    expect(plan(m({ minNative: 3 }), { hash: "viejo", native: 2 })).toBe("apk");
  });
  it("ignora un manifiesto vacío o roto", () => {
    expect(plan({} as Manifest, { hash: "x", native: 2 })).toBe("none");
  });
});
