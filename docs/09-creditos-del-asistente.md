# 9. El asistente de IA con créditos

## Cómo funciona hoy
- **Gratis, sin límite:** guías, formularios oficiales, mapa, foro, progreso y recordatorios. No cuestan nada por uso.
- **Asistente de IA:** cada pregunta gasta **1 crédito**. Cada cuenta nueva recibe **3 créditos de regalo**.
- **Sin suscripción.** Cuando se acaban, la app muestra las dos formas de conseguir más (todavía marcadas como «Próximamente»).
- **Modelo:** el más económico (`claude-haiku-5-5`). Se cambia en una sola línea de `src/app/api/assistant/route.ts`.

## Por qué es seguro
- El saldo vive en la base de datos (`ai_wallets`) y **solo el servidor puede sumar créditos**. La app no puede regalárselos.
- El crédito se descuenta antes de llamar a la IA y de forma atómica: dos preguntas a la vez no gastan el mismo crédito.
- Cada movimiento queda en un libro (`ai_credit_ledger`). Una misma compra o un mismo anuncio no se puede cobrar dos veces.
- El asistente exige cuenta. Sin la clave del proveedor de IA no se descuenta nada.

## Cuentas (estimación, no medición)
| Concepto | Valor aproximado |
|---|---|
| Coste de una pregunta con el modelo económico | Unos 0,2 céntimos de dólar o menos |
| 3 preguntas de regalo por cuenta | Menos de 1 céntimo por usuario |
| Paquete de 20 preguntas a 1,99 € | Coste de IA: unos 4 céntimos |
| Lo que te queda de 1,99 € | Alrededor de 1,15–1,40 € tras el IVA (22 %) y la comisión de la tienda (15–30 %) |

Mide el coste real por pregunta la primera semana en la consola del proveedor y ajusta precios con ese dato.

## Lo que falta para cobrar (necesita la app en las tiendas)
1. **Paquetes de preguntas.** En iPhone y Android los bienes digitales se venden **obligatoriamente** con el sistema de compras de Apple y Google; usar otra pasarela dentro de la app es motivo de rechazo. Plan:
   - crear el producto consumible «20 preguntas» en App Store Connect y en Google Play Console;
   - integrar las compras en la app (por ejemplo con RevenueCat, que unifica las dos tiendas);
   - un aviso del servidor de compras llama a `grant_ai_credits(usuario, 20, 'purchase', id_de_la_compra)`.
2. **Ver un anuncio = 1 pregunta.** Con anuncios de vídeo con recompensa (Google AdMob):
   - cuenta de AdMob y la app registrada;
   - la recompensa se confirma **de servidor a servidor** (verificación SSV) y entonces se llama a `grant_ai_credits(usuario, 1, 'ad_reward', id_del_anuncio)`. Nunca se confía en la app;
   - hace falta el aviso de consentimiento de publicidad exigido en la UE;
   - un límite diario de anuncios por persona (por ejemplo, 5).
3. **Pago por documento** (explicar una carta por 0,99–1,49 €): es el mismo sistema, gastando varios créditos por análisis. Llega con los documentos (fase 4).

Para los puntos 1 y 2 hace falta añadir en Vercel la clave `SUPABASE_SERVICE_ROLE_KEY`. Es secreta: solo va en Vercel, nunca en el código ni en la app.

## Riesgos a vigilar
- **Cuentas repetidas para conseguir preguntas gratis.** Se frena con CAPTCHA, verificación de correo o teléfono y, si hace falta, bajando el regalo a 2.
- **Personas que no pueden pagar.** Las guías siguen siendo gratis y el anuncio con recompensa da acceso sin tarjeta.
- **Ingresos de los anuncios.** Lo que paga un vídeo con recompensa varía mucho según el país y la temporada. Hay que medirlo antes de darlo por rentable.
- **Reembolsos.** Si la IA falla sin responder, el crédito se devuelve solo cuando la clave de servidor está configurada.
