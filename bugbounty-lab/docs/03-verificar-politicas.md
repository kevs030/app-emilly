# 3. Cómo encontrar programas y verificar su política y alcance

## 3.1 Dónde están los programas públicos con recompensa

| Plataforma | Directorio oficial |
|---|---|
| HackerOne | https://hackerone.com/directory/programs (filtra por programas con recompensa) |
| Bugcrowd | https://bugcrowd.com/engagements |
| Intigriti | https://www.intigriti.com/public/ (y app.intigriti.com tras registrarte) |
| YesWeHack | https://yeswehack.com/programs |

**Atajo:** `python3 modules/program_finder.py update` descarga la lista comunitaria de ProjectDiscovery. El 2026-11-28 tenía **804 programas, 530 marcados como de pago** (HackerOne 190, HackenProof 94, Bugcrowd 77, YesWeHack 23, Intigriti 10, otros 136).

> ⚠️ Esa lista la mantiene la comunidad, **no es una autorización** y puede estar desactualizada. Que diga "paga" no garantiza importes ni que el programa siga activo. Todo se confirma en la página oficial.

## 3.2 Lista de verificación de la política (hazla SIEMPRE, programa por programa)

Abre la página oficial del programa y anota en `programs/<programa>/scope.json`:

1. **¿Está activo y es público?** Debe aceptar informes ahora, no estar en pausa.
2. **¿Paga?** Anota la tabla de recompensas por severidad, tal cual aparece.
3. **Activos dentro del alcance (`in_scope`):** cópialos exactos. Fíjate en:
   - `*.empresa.com` suele cubrir subdominios, pero **no siempre** el dominio raíz.
   - Las apps móviles se identifican por el ID del paquete o de la tienda.
   - Algunos activos están en el alcance pero **sin recompensa** ("no eligible for bounty").
4. **Fuera del alcance (`out_of_scope`):** dominios, terceros (Zendesk, Shopify…) y tipos de fallo excluidos. Casi siempre se excluyen: self-XSS, falta de cabeceras, clickjacking sin impacto, CSRF en el logout y la enumeración de usuarios.
5. **Reglas de prueba (`rules`):**
   - límite de peticiones por segundo,
   - si se permite automatización o escaneo,
   - cabeceras obligatorias (p. ej. `X-Bug-Bounty: tu_usuario`),
   - cómo crear cuentas de prueba (a veces piden un alias de correo de la plataforma),
   - qué está prohibido (DoS, ingeniería social, acceso a datos de otros…).
6. **Safe harbor:** comprueba que el programa protege legalmente a quien investiga de buena fe.
7. **Divulgación:** si se puede publicar o no después.
8. Pon `verified_by_human: true` y la fecha en `verified_on`. **Hasta entonces, el Scope Validator lo bloquea todo.**

Repite la verificación si pasan más de 30 días: las políticas cambian.

## 3.3 Cómo elegir un programa (criterios para principiantes con presupuesto cero)

- ✅ Paga desde severidad baja o media.
- ✅ Alcance amplio de aplicación web o API (comodines `*.`), con **registro de cuentas gratis**. Sin cuentas propias no se pueden probar IDOR ni autorización.
- ✅ Aplicación con roles y objetos: pedidos, equipos, documentos, facturas… Ahí viven los IDOR y los fallos de lógica.
- ✅ Buenas métricas de respuesta (HackerOne muestra el tiempo de triage y de pago).
- ✅ Política clara y safe harbor explícito.
- ⚠️ Evita al principio los programas enormes y muy concurridos: casi todo lo fácil ya está reportado y te tocarán duplicados.
- ⛔ Descarta los que solo dan "puntos" o "swag" si buscas dinero, y los que exigen KYC o pagos con tarjeta real para crear cuentas.

## 3.4 Comprobar un objetivo antes de cada prueba

```bash
python3 modules/scope_validator.py <programa> https://sub.empresa.com/ruta
```
Si responde ⛔, **no se prueba.**
