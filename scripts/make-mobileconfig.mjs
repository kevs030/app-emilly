// Genera public/a-posto.mobileconfig: «instalador» para iPhone/iPad que SOLO añade el icono de A Posto
// a la pantalla de inicio (un «Web Clip» que abre https://www.apostoapp.app/app a pantalla completa).
// No lleva certificados, VPN, restricciones ni gestión del dispositivo. Se puede borrar cuando se quiera.
// Uso: node scripts/make-mobileconfig.mjs   (los UUID son fijos: reinstalarlo reemplaza el anterior)
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const icon = await sharp(readFileSync("public/icons/apple-touch-icon.png")).flatten({ background: "#A65337" }).resize(180, 180).png().toBuffer();
const b64 = icon.toString("base64").replace(/(.{68})/g, "$1\n\t\t\t");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const DESC =
  "Añade el icono de A Posto a tu pantalla de inicio. Es solo un acceso directo a la app gratuita A Posto (apostoapp.app): " +
  "no instala nada más, no pide permisos y no controla tu teléfono. Puedes borrarlo cuando quieras en Ajustes > General > VPN y gestión de dispositivos.";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>FullScreen</key>
			<true/>
			<key>Icon</key>
			<data>
			${b64}
			</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>A Posto</string>
			<key>PayloadDescription</key>
			<string>Icono de A Posto en la pantalla de inicio</string>
			<key>PayloadDisplayName</key>
			<string>A Posto (icono)</string>
			<key>PayloadIdentifier</key>
			<string>app.apostoapp.webclip.icon</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>2278B639-408B-463F-9862-1725E13239F6</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>https://www.apostoapp.app/app</string>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>${esc(DESC)}</string>
	<key>PayloadDisplayName</key>
	<string>A Posto</string>
	<key>PayloadIdentifier</key>
	<string>app.apostoapp.webclip</string>
	<key>PayloadOrganization</key>
	<string>A Posto</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>67501C7E-9AF3-4C09-B08C-872348A27254</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`;
writeFileSync("public/a-posto.mobileconfig", xml);
console.log("public/a-posto.mobileconfig", xml.length, "bytes");
