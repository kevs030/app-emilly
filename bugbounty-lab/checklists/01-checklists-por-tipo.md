# Módulos 3 y 6 — Qué revisar y cómo corregir, por tipo de fallo

Prioridad de arriba abajo. Todo con **cuentas propias**, a mano y a bajo ritmo.

## 1. Broken Access Control / IDOR / BOLA ⭐ (el que más paga a principiantes)
**Buscar:** IDs en URLs, cuerpos JSON, cabeceras o GraphQL (`/orders/1234`, `"userId": "…"`).
**Probar:** con la cuenta A, repetir la petición de un objeto de la cuenta B (lectura, edición y borrado). Probar también métodos alternativos (GET→PUT/DELETE), versiones antiguas de la API (`/v1/` frente a `/v2/`) y endpoints de exportación.
**En el código:** consultas que filtran solo por `id` y no por `owner = usuario actual`; en Supabase, tablas sin RLS o con políticas `using (true)`.
**Corregir:** autorización en el servidor en cada petición (dueño o rol), RLS en todas las tablas y IDs no adivinables como defensa adicional (no como única defensa).
**Verificar la corrección:** repetir la prueba A→B: debe devolver 403/404 sin datos.

## 2. Authorization flaws (escalada vertical)
**Probar:** llamar a funciones de admin o moderador con un usuario normal (endpoints vistos en el JS, *server actions*, campos ocultos como `"role":"admin"` en el registro o el perfil).
**Corregir:** comprobar el rol en el servidor e ignorar los campos de rol que manda el cliente (*mass assignment*).

## 3. Authentication
**Probar:** el flujo de restablecer contraseña (¿el token es reutilizable o no caduca? ¿se filtra en la cabecera Referer? ¿se puede envenenar la cabecera Host?), el cambio de correo sin pedir contraseña, el 2FA que se puede saltar llamando directamente al siguiente paso y el OAuth (`redirect_uri`, `state`).
**Corregir:** tokens de un solo uso que caducan rápido y pedir reautenticación para los cambios sensibles.

## 4. API Security (OWASP API Top 10)
**Probar:** BOLA (ver punto 1), *excessive data exposure* (la respuesta trae campos de más, como email, teléfono o hashes), *mass assignment*, falta de límites (paginación `?limit=100000`) y endpoints de documentación expuestos (`/swagger`, `/graphql` con introspección).
**Corregir:** listas de campos permitidos en la entrada y la salida, y límites de paginación y de uso.

## 5. Business Logic ⭐
**Probar:** importes negativos, cupones reutilizables, condiciones de carrera (dos peticiones a la vez para gastar el mismo saldo; **solo 2 o 3 peticiones**, nunca ráfagas), saltarse pasos de un flujo o cambiar el precio o el plan en el cliente.
**Corregir:** validar en el servidor, usar transacciones con bloqueo y claves de idempotencia.

## 6. Information Disclosure
**Buscar:** archivos `.map`, claves en el JS (comprobar si son claves *públicas por diseño*, como la anon key de Supabase o las claves publicables de Stripe; eso NO es un fallo), errores con trazas, `/.git/` y backups.
**Corregir:** no desplegar mapas de código ni secretos y usar errores genéricos en producción.

## 7. Security Misconfiguration
**Buscar:** CORS que refleja cualquier origen **con credenciales**, buckets de almacenamiento públicos y paneles de depuración.
⚠️ La falta de cabeceras de seguridad sola casi siempre está **excluida** de los programas.

## 8. Session Management
**Probar:** ¿la sesión sigue viva tras el logout o tras cambiar la contraseña? ¿Hay fijación de sesión? ¿Las cookies llevan `Secure`, `HttpOnly` y `SameSite`?

## 9. SSRF
**Buscar:** funciones que descargan una URL que das tú (vista previa de enlaces, importar desde URL, webhooks, generar PDFs).
**Probar:** solo con un servidor tuyo (p. ej. un *webhook catcher* gratuito) para ver si el servidor se conecta. **No** atacar metadatos de nube ni la red interna sin permiso explícito del programa.
**Corregir:** lista de dominios permitidos y bloqueo de IPs privadas y de enlace local tras resolver el DNS.

## 10. XSS
**Probar:** entradas que se muestran a otros (perfil, comentarios, nombres de archivo) con una prueba inocua como `"><img src=x onerror=alert(document.domain)>`, solo en tus propias cuentas.
**En el código (React/Next):** `dangerouslySetInnerHTML`, `href={entradaDelUsuario}` (`javascript:`), markdown renderizado sin sanear.
**Corregir:** escapar la salida, sanear con DOMPurify, aplicar CSP y validar el esquema de las URL.

## 11. SQL Injection
**Probar:** con mucha cautela: una comilla `'` y comparar el comportamiento. **Nada de sqlmap a ciegas** ni consultas que extraigan datos: basta con demostrar la inyección (p. ej. por diferencia de tiempo con `sleep` corto, si el programa lo permite).
**Corregir:** consultas parametrizadas y ORM.

## 12. Móvil
**Revisar (estático, en una app que te permitan analizar):** claves y endpoints incrustados en el APK o el IPA, almacenamiento local sin cifrar, *deep links* que abren acciones sin verificación, endpoints de API que la web no usa (a menudo con menos controles).
**Herramientas gratis:** jadx (descompilar APK) y MobSF (análisis estático), con tu aprobación.
