# 6. Monetización y publicidad

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
