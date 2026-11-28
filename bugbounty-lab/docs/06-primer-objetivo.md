# 6. Propuesta de primer objetivo autorizado

## Recomendación: tu propia app, A Posto (repositorio `kevs030/app-emilly`)

**Por qué:** es el único objetivo para el que tenemos autorización total ahora mismo (es tu código), y tiene exactamente el tipo de superficie que pagan los programas reales:

| Superficie (vista en el código) | Fallos típicos que practicaríamos |
|---|---|
| 19 tablas en Supabase (`profiles`, `documents`, `reminders`, `ai_conversations`, `ai_messages`, `user_facts`…) y 9 migraciones; 7 de ellas activan RLS en alguna tabla (falta comprobar tabla por tabla, así que no es todavía un hallazgo) | **Broken Access Control / BOLA**: ¿hay alguna tabla sin RLS o con una política que deja leer datos de otros? |
| `ai_wallets`, `ai_credit_ledger` | **Lógica de negocio**: ¿se pueden conseguir créditos de IA gratis o gastar los de otro? |
| `/api/document`, `/api/points`, `/api/assistant`, `/api/ads` | **API Security, IDOR, SSRF**, límites de uso |
| Foro (`forum_posts`, `forum_comments`, `forum_reports`) | **XSS almacenado**, autorización para editar o borrar |
| Panel `/admin` (`AdminLogin.tsx`, `actions.ts`) | **Authentication / Authorization**: ¿las *server actions* comprueban de verdad que eres admin? |
| `proxy.ts`, sesiones de Supabase | **Session management**, redirecciones abiertas |
| App móvil (`mobile/`, Capacitor) | **Móvil**: claves incrustadas, almacenamiento local inseguro |

### Plan de la Fase 1 (análisis estático, sin pruebas activas)
- **Qué:** leer el código y las migraciones SQL para buscar fallos de las categorías anteriores.
- **Activo:** solo los archivos de tu repositorio. **No se envía ninguna petición** a apostoapp.app, a Vercel ni a Supabase.
- **Autorización:** eres el propietario de la app y del repositorio. *Necesito que me lo confirmes, y también que el proyecto de Supabase es tuyo.*
- **Riesgos:** ninguno para los sistemas. Si encuentro algo grave (p. ej. una tabla sin RLS), te lo digo antes de seguir, porque afectaría a usuarios reales de tu app.
- **Resultado:** hallazgos en `findings/a-posto/` con su estado honesto (`candidato` hasta validarlos), severidad CVSS y una corrección propuesta.

La Fase 2, que comprobaría los hallazgos con peticiones reales, se haría **en local o en una rama de Supabase**, nunca en producción, y te la explicaría antes, prueba por prueba.

## Después: primer programa de pago
Cuando acabemos la Fase 1, elegimos juntos 3 candidatos de la lista con:
```bash
python3 modules/program_finder.py list --bounty --web --platform hackerone
```
y verificamos su política siguiendo `03-verificar-politicas.md`. Algunos nombres de la lista comunitaria con muchos dominios (**sin verificar** recompensas, alcance ni estado actual):
- HackerOne: Spotify, Epic Games, Logitech
- Bugcrowd: Just Eat Takeaway.com, Linktree, Seek
- Intigriti: Yahoo!, Tweakers, Visma Public
- YesWeHack: BlaBlaCar, Doctolib, Dailymotion

Tener muchos dominios **no** significa que sea buena elección para empezar. La elección final depende de la verificación de la política y de los criterios de la sección 3.3.
