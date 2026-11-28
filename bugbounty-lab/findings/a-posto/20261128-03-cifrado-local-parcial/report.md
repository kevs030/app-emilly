> ⚠️ **Estado: CANDIDATO** — NO es una vulnerabilidad confirmada. No enviar hasta validarla.

# «Mis documentos» en el móvil: la ficha y el análisis de IA se guardan sin cifrar

| Campo | Valor |
|---|---|
| ID interno | `20261128-03-cifrado-local-parcial` |
| Estado | candidato |
| Programa | a-posto |
| Política aplicable | App propia — programs/a-posto/scope.json (análisis estático del repositorio) |
| Activo afectado | mobile/src/lib/documents.ts (IndexedDB 'aposto-docs' en la WebView) |
| Tipo | Mobile — Insecure Data Storage (OWASP MASVS-STORAGE) |
| Severidad estimada | Media (CVSS 3.1 4.1 — `CVSS:3.1/AV:L/AC:H/PR:H/UI:N/S:U/C:H/I:N/A:N`) |

## Resumen

La app dice a los usuarios que sus documentos se guardan «cifrados». Solo se cifra el archivo (`data`, AES-GCM 256). El resto de la fila se guarda en claro en IndexedDB: título, tipo, fecha de caducidad, nota y sobre todo `analysis`, que contiene la traducción completa del documento con importes, fechas y números de referencia (hasta 20.000 caracteres). Además, la clave AES 'no exportable' se guarda en la misma IndexedDB; 'no exportable' impide que el JavaScript la lea, pero el motor de la WebView la serializa en disco junto a los datos, así que no protege frente a alguien con acceso a los archivos de la app. Atenuantes: android:allowBackup="false" (no sale en copias de seguridad) y el sistema aísla los datos de cada app. Solo es explotable con acceso privilegiado al dispositivo (root o análisis forense).

## Pasos de reproducción

1. (Fase 2, en un emulador Android propio con la app de depuración.)
2. Guardar un documento de prueba (no real) y leerlo con la IA.
3. Abrir chrome://inspect → la WebView de la app → Application → IndexedDB → aposto-docs → docs.
4. Comprobar que los campos title, note y analysis se ven en texto plano.

## Evidencia

_(pendiente)_

## Impacto demostrado

_(pendiente: describe solo lo demostrado)_

## Posibles falsos positivos (revisados)

- Que se considere aceptable porque el sandbox de Android/iOS ya protege los datos; aun así, el texto mostrado al usuario promete más de lo que se hace.

## Solución recomendada

Cifrar también title, note y analysis con la misma clave (un único blob JSON cifrado por fila, dejando en claro solo id, user_id y created_at). Mejor aún: guardar la clave en el Keystore/Keychain (p. ej. con el SecureStorage que ya usa la app) en lugar de en IndexedDB. Y ajustar el texto de la app para que diga exactamente qué se cifra.

## Cómo verificar la corrección

1. Repetir los pasos 2–4: en IndexedDB solo deben verse datos cifrados (ArrayBuffer) y los identificadores.
2. Comprobar que los documentos antiguos se migran al nuevo formato sin perderse.

## Referencias

- OWASP MASVS-STORAGE-1
- OWASP MASTG — Testing Local Data Storage

---
_Borrador generado el 2026-11-28. Revisión humana obligatoria antes de enviarlo a la plataforma oficial._
