# 2. Herramientas gratuitas

Regla: **no instalamos nada hasta que una tarea concreta lo necesite y tú lo apruebes.**

| Herramienta | Para qué | Dónde | ¿Cuándo? | Coste |
|---|---|---|---|---|
| **Claude Code** | Razonar, leer código y políticas, redactar informes | Nube (ya está) | Ya | Incluido |
| **Python + Git** | Módulos del laboratorio, historial | Nube (ya está) | Ya | 0 € |
| **Burp Suite Community** | Proxy: ver y modificar tus propias peticiones (clave para IDOR, autorización, lógica de negocio) | Tu PC | Etapa 2 | 0 € |
| **OWASP ZAP** | Alternativa libre a Burp; su escaneo *pasivo* no envía ataques | Tu PC | Opcional | 0 € |
| **Postman** | Ordenar y repetir llamadas a una API con tus cuentas A y B | Tu PC | Etapa 3 | 0 € (plan gratis) |
| **Semgrep** (CE) | Análisis estático de código fuente | Nube (pip) | Etapa 1, si lo apruebas | 0 € |
| **Gitleaks** | Buscar secretos filtrados en repositorios | Nube | Etapa 1, si lo apruebas | 0 € |
| **Nmap** | Descubrir puertos | — | **Casi nunca.** Muchos programas prohíben escanear puertos, y para web/API rara vez aporta. Solo si la política lo permite. | 0 € |
| **PortSwigger Web Security Academy** | Laboratorios en línea legales de todos los fallos de la lista | Navegador | Etapa 1 | 0 € |

## Lo que NO usaremos

- **Escáneres masivos** (nuclei con plantillas a lo bruto, sqlmap sin control, fuzzing intensivo): generan ruido, suelen estar prohibidos y producen falsos positivos. Además, los fallos que pagan bien (IDOR, lógica de negocio, control de acceso) **no los encuentra un escáner**: se encuentran entendiendo la aplicación.
- **Herramientas de pago** (Burp Pro, etc.): no hacen falta para empezar.
