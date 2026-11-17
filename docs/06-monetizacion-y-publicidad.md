# 6. Monetización y publicidad

## Estado (17-11-2026): lo que ya funciona en la app

| Pieza | Dónde | Qué hace |
|---|---|---|
| **Banner de anuncio propio** | Inicio, lista de trámites y lista de ayudas (nunca dentro de un trámite) | Muestra un anuncio activo de la tabla `sponsors`, con la etiqueta «Publicidad». Al tocarlo cuenta el clic y abre la web del anunciante. Sin anuncios activos, no ocupa sitio. |
| **«Ver un anuncio = 1 pregunta»** | Asistente: botón «+1 pregunta» y, sin preguntas, «Ver un anuncio y ganar 1 pregunta» | Anuncio propio a pantalla completa durante 15 s. El servidor firma un justificante, comprueba el tiempo, aplica **3 premios cada 24 h** por cuenta y suma la pregunta con `grant_ai_credits` (motivo `ad_reward`). Cada justificante vale una vez. |

Código: `src/lib/ads-token.ts` (firma y tiempos, con pruebas), `src/lib/ads-server.ts`, `src/app/api/ads/route.ts`, `mobile/src/lib/ads.ts`, `mobile/src/ui/SponsorBanner.tsx`, `mobile/src/ui/RewardedAd.tsx`. Pruebas: `mobile/tests/ads.test.ts` y `mobile/tests/e2e/fase5.cjs`.

### Para activarlo (propietario)
1. **Vercel → proyecto → Settings → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY`** (Supabase → Project Settings → API Keys → *secret*). Es secreta: solo en Vercel. Sin ella el botón «+1 pregunta» no aparece; el banner sí funciona.
2. **Publicar anuncios** en `/admin` → *Publicidad* (título, texto, botón, enlace `https://`, ubicación).
3. **Cobrar a los anunciantes:** los clics están en la columna `clicks`; las visualizaciones completas con premio, en `ai_credit_ledger` (`reason = 'ad_reward'`, `ref = 'sponsor:<id>:…'`). Consulta para el informe mensual:
   ```sql
   select split_part(ref, ':', 2)::bigint as sponsor_id, count(*) as vistas_completas
   from public.ai_credit_ledger where reason = 'ad_reward' and created_at >= date_trunc('month', now())
   group by 1 order by 2 desc;
   ```
4. **Antes de facturar:** plan Pro de Vercel (el gratuito no admite uso comercial), *partita IVA* con un *commercialista* y comprobar que tu permiso permite trabajo autónomo.

### Siguiente paso: anuncios automáticos de Google (cuando haya dominio y tráfico)
- **App web y APK actual (PWABuilder):** AdSense (banners) y AdSense *Offerwall* con anuncio recompensado. Requiere dominio propio, aprobación de Google y el aviso de consentimiento certificado (CMP). Usar **solo anuncios no personalizados** y bloquear categorías (visados, préstamos, apuestas).
- **App nativa (Capacitor) en Google Play / App Store:** AdMob (banner y vídeo recompensado) con verificación de servidor a servidor (SSV) que llama a `grant_ai_credits(…, 'ad_reward', id_transacción)`. El límite diario y el libro de créditos ya están hechos.

---

## Lo que ya está construido: publicidad propia
- **Qué es:** anuncios de texto que tú vendes directamente y publicas desde `/admin` → *Publicidad*.
- **Dónde salen:** portada, lista de trámites y foro, siempre con la etiqueta «Publicidad».
- **Qué mides:** los clics de cada anuncio (columna `clicks`), para enseñárselos al anunciante.
- **Privacidad:** sin cookies ni rastreadores de terceros. No hace falta banner de cookies y cumple el RGPD sin más trámites.
- **Seguridad:** solo el admin crea anuncios, el enlace debe ser `https://` y los clics no se pueden inflar a mano.

### A quién vendérsela (clientes naturales)
| Tipo | Por qué les interesa |
|---|---|
| Envío de dinero (remesas) y bancos para extranjeros | Su cliente es exactamente tu usuario |
| Operadores de telefonía con tarifas internacionales | Igual |
| Escuelas de italiano y certificación B1 | La piden para la ciudadanía y el permiso UE |
| Traductores jurados, autoescuelas, seguros | Necesidades recurrentes |
| CAF y patronatos privados, agencias de empleo autorizadas | Buscan volumen |

**Precio orientativo para empezar:** cuota fija mensual por anuncio (por ejemplo, 30–100 € al mes mientras el tráfico sea pequeño). Es más simple que cobrar por clic y no depende de comisiones.

### Lo que NO se debe anunciar
- «Contratos de trabajo», «visados garantizados» o «acelerar el permiso»: son las estafas que la app combate.
- Préstamos rápidos o de alto interés, apuestas y criptomonedas.
- **Abogados:** nunca a comisión por cliente (lo prohíbe su código deontológico). Una cuota fija por un anuncio informativo debe validarla antes un abogado. Ver `02-analisis-legal.md`, punto 7.

## Publicidad automática (Google AdSense): más adelante
Todavía no es posible. Requisitos:
1. **Dominio propio** (por ejemplo `emilly.it`): AdSense no acepta subdominios `vercel.app`. Cuesta unos 10–15 € al año y además es lo que más mejora la confianza.
2. **Plan Pro de Vercel:** el plan gratuito no permite uso comercial. En cuanto cobres un anuncio, propio o de Google, hay que cambiar.
3. **Banner de consentimiento certificado por Google** (CMP): obligatorio en la UE para anuncios personalizados.
4. **Tráfico:** AdSense rinde con miles de visitas diarias. Con poco tráfico da céntimos, y los anuncios automáticos pueden mostrar justo lo que no quieres («visados rápidos»). Habría que bloquear categorías.

**Recomendación:** empezar con la publicidad propia (control total, más ingreso por visita, sin trámites) y añadir AdSense solo cuando haya dominio propio y varios miles de visitas al día.

## Otras vías (ver `05-roadmap.md`)
- Licencias para Comunes, cooperativas y empresas que contratan con el Decreto Flussi.
- Fondos públicos de integración (FAMI).
- Directorio profesional verificado con cuota fija.
- Funciones premium opcionales (recordatorios avanzados, guarda de documentos).

## Antes de facturar
- Forma jurídica y *partita IVA* (consulta a un *commercialista*).
- Comprobar que tu permiso de residencia permite trabajo autónomo.
- Revisión legal de la política de privacidad y de los términos de uso.
