# 2. Análisis legal — qué límites tiene A posto en Italia

> ⚠️ Este análisis es una investigación previa, **no es asesoramiento legal**. Antes de lanzar la app hay que validarlo con un abogado experto en protección de datos y derecho digital en Italia. Calcula unos 1.000–3.000 € para una primera revisión: es la inversión más importante del proyecto.

## Resumen en semáforo
| Tema | Riesgo | Qué hemos hecho / qué falta |
|---|---|---|
| Privacidad (RGPD) | 🔴 Alto: los usuarios son personas vulnerables | Minimización de datos, consentimiento separado, borrado de cuenta y RLS ya hechos. **Falta:** evaluación de impacto (DPIA), política de privacidad revisada y registro de tratamientos |
| Asesoramiento legal | 🟠 Medio | La app da **información general**, no consultas personalizadas, y deriva a abogados y Patronatos |
| IA (AI Act + ley italiana 132/2025) | 🟢 Bajo/medio | Aviso claro de que se habla con una IA (obligatorio desde el 2/8/2026). No es un sistema "de alto riesgo" |
| Foro (DSA) | 🟠 Medio | Botón de denunciar, ocultación automática y moderación. **Falta:** página de contacto DSA y explicaciones de moderación |
| Videos (derechos de autor) | 🟠 Medio | Solo usamos el reproductor oficial de YouTube. **No** descargamos ni volvemos a subir videos |
| Redes sociales (*scraping*) | 🔴 Alto si se hace mal | **No** extraemos datos personales. Seguimos los temas de forma legal |
| Monetización con abogados/dentistas | 🟠 Medio | **No cobrar comisión por cliente** a los abogados. Ver más abajo |

## 1. Privacidad (RGPD + Código de Privacidad italiano)
- **Usuarios vulnerables y datos delicados.** Los datos sobre la situación migratoria pueden revelar origen étnico, salud o religión (art. 9 RGPD). Por eso:
  - pedimos **solo** lo necesario: correo o teléfono para entrar y, de forma opcional, país, ciudad, tipo de permiso, fecha de vencimiento e hijos;
  - los datos opcionales tienen **consentimiento separado** (art. 6.1.a y 7). Si se retira, **se borran**;
  - el asistente tiene instrucciones de **no pedir** pasaporte, salud, religión ni antecedentes penales.
- **DPIA (evaluación de impacto, art. 35):** casi seguro que es obligatoria, porque combina personas vulnerables, una tecnología nueva (IA) y escala. Debe hacerse **antes** del lanzamiento.
- **Transferencias fuera de la UE:** Anthropic (asistente) y Supabase/Vercel son proveedores con sede en EE. UU. Hay que:
  - firmar sus contratos de encargado del tratamiento (DPA, art. 28);
  - comprobar si están en el EU-US Data Privacy Framework o usan cláusulas contractuales tipo;
  - elegir la **región UE** en Supabase y Vercel.
- **Menores:** en Italia la edad para consentir servicios digitales es **14 años**. Hay que poner un aviso de edad en el registro.
- **Derechos:** acceso, rectificación y borrado. Ya está hecho en "Mi perfil", incluido el borrado total de la cuenta.
- **No compartir con autoridades** salvo obligación legal. Es clave para generar confianza.

## 2. Información vs. asesoramiento legal
- En Italia, la **defensa en juicio** y ciertos actos están reservados a los abogados. Hacerlos sin serlo es *esercizio abusivo della professione* (art. 348 del Código Penal).
- Además, la jurisprudencia considera que también puede ser abusivo dar consultas legales de forma **continua, organizada y retribuida** si se presenta como actividad profesional.
- **Nuestra línea:** A posto explica procedimientos públicos con fuentes oficiales. **No** estudia casos concretos ni redacta recursos, y **deriva** a abogados, Patronatos (gratis) o ASGI cuando hay consecuencias legales: denegación, expulsión, recursos o plazos.
- Ya está en el código: aviso legal en cada página y reglas en las instrucciones del asistente (`src/lib/assistant-prompt.ts`).
- **Gestión de trámites por terceros:** si algún día A posto *tramita* expedientes en nombre de usuarios, podría hacer falta una licencia de agencia de gestiones (art. 115 TULPS). Hay que confirmarlo con el abogado antes de ofrecer algo así.

## 3. Inteligencia artificial
- **AI Act, art. 50** (aplicable desde el 2/8/2026): hay que informar de que se habla con una IA. Ya está hecho, con un aviso visible en el chat.
- **Alto riesgo (Anexo III, punto 7):** se refiere a la IA que usan las **autoridades** en migración y asilo. Una app privada de información **no** entra ahí. Aun así:
  - A posto no toma decisiones automatizadas con efectos jurídicos (art. 22 RGPD);
  - todo es orientativo.
- **Ley italiana 132/2025 sobre IA:** exige transparencia con información clara y sencilla, y limita la IA a tareas de apoyo en el ámbito profesional ([CFNews](https://www.cfnews.it/diritto/ai-act-e-avvocati-cosa-cambia-dal-2-agosto-2026/)).
- **Errores de la IA:** el riesgo principal es que el asistente invente datos. Lo mitigamos así:
  - responde a partir de una base de conocimiento **verificada y con fecha**;
  - tiene instrucción de **no inventar** precios, plazos ni teléfonos;
  - remite siempre a la fuente oficial.

## 4. Foro y DSA (Ley de Servicios Digitales de la UE)
El foro nos convierte en **prestador de alojamiento**. Las obligaciones mínimas son:
- **mecanismo de notificación** de contenido ilegal (art. 16). Ya está: botón de denunciar, con ocultación automática tras 3 denuncias;
- **explicar por qué** se oculta un contenido (art. 17). Falta: mensaje al autor;
- **punto de contacto** para autoridades y usuarios (art. 11-12). Falta: página de contacto;
- reglas claras del foro. Ya están publicadas y prohíben vender contratos o documentos;
- las microempresas y pequeñas empresas están exentas de varias obligaciones adicionales de las plataformas en línea.

## 5. Videos y derechos de autor (ley 633/1941)
- **Insertar** un video de YouTube con su reproductor oficial está permitido por las condiciones de YouTube cuando el autor lo habilita. Es lo que hacemos.
- **Descargar, volver a subir o crear subtítulos propios** (una traducción) es una **obra derivada**: hace falta **permiso** del autor, también si es el INPS o la Agenzia delle Entrate, salvo que publiquen con una licencia abierta. No encontré una licencia abierta declarada para sus videos.
- **Solución actual:** activamos los subtítulos de YouTube en el idioma del usuario, que pueden ser traducción automática de YouTube.
- **Siguiente paso:**
  1. escribir al INPS, a la Agenzia delle Entrate y a la Polizia di Stato pidiendo permiso para subtitular;
  2. **mejor todavía:** producir **nuestros propios videos** en español e inglés. Son un activo propio y además sirven como canal de YouTube y TikTok para conseguir usuarios.

## 6. Redes sociales (Facebook, Instagram, TikTok)
- **Prohibido:** extraer perfiles, comentarios o datos personales con *scraping*. Va contra las condiciones de Meta y TikTok y contra el RGPD. Un perfil público **no** significa que sus datos se puedan reutilizar ([Garante, informe anual](https://www.tuttotech.net/news/2025/07/17/garante-privacy-relazione-2024.html/amp)).
- **Permitido:**
  - seguir **temas** (no personas) con herramientas oficiales o de terceros que usan las API autorizadas;
  - revisar manualmente las cuentas **oficiales**;
  - recibir **denuncias de bulos** de los usuarios.

## 7. Monetización: límites (para cuando lo veamos)
- **Abogados:** el código deontológico forense prohíbe captar clientes de forma incorrecta (*accaparramento di clientela*), y pagar a terceros por cada cliente que te envían está mal visto o prohibido. → **No cobres comisión por cliente.** Sí se puede cobrar una **cuota fija** por aparecer en el directorio, como publicidad informativa, veraz y no comparativa. Hay que validarlo con el abogado.
- **Dentistas y médicos:** su código deontológico también limita la publicidad sanitaria. → Cuota fija por aparecer y, además, **verificar** su inscripción en el Ordine.
- **Publicidad:** prohibido anunciar préstamos abusivos, "agencias de visados" o "contratos de trabajo". El público es vulnerable y la reputación lo es todo.
- **Fondos públicos:** encajamos en convocatorias de integración. El Fondo FAMI de la UE financia proyectos de integración de personas de terceros países. Es una vía de ingresos que **no** cobra al migrante.

## 8. Tu situación personal como fundador
- Si eres ciudadano no comunitario, comprueba que tu permiso te permite el **trabajo autónomo o crear una empresa** antes de facturar (partita IVA o una S.r.l.).
- Consulta con un *commercialista* qué forma jurídica te conviene. Una opción interesante es la *impresa sociale*, que da acceso a fondos públicos.
