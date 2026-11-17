import type { CapacitorConfig } from "@capacitor/cli";

/**
 * La app se empaqueta con sus archivos dentro (webDir): NO carga la web remota.
 * appId: identificador único en las tiendas. Se puede cambiar hasta la primera subida; después, no.
 */
const config: CapacitorConfig = {
  appId: "com.aposto.app",
  appName: "A Posto",
  webDir: "dist",
  backgroundColor: "#F7F2EA",
  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
  plugins: {
    // Actualizaciones en vivo desde nuestra web (scripts/build-app-update.mjs). Modo manual, sin estadísticas
    // ni servidores de terceros: la app solo habla con app-emilly.vercel.app.
    CapacitorUpdater: { autoUpdate: false, statsUrl: "", channelUrl: "", appReadyTimeout: 10000, resetWhenUpdate: true },
  },
};

export default config;
