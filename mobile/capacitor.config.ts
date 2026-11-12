import type { CapacitorConfig } from "@capacitor/cli";

/**
 * La app se empaqueta con sus archivos dentro (webDir): NO carga la web remota.
 * appId: identificador único en las tiendas. Se puede cambiar hasta la primera subida; después, no.
 */
const config: CapacitorConfig = {
  appId: "com.emilly.app",
  appName: "Emilly",
  webDir: "dist",
  backgroundColor: "#F7F2EA",
  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
};

export default config;
