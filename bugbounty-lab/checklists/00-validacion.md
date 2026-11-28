# Módulo 4 — Validación de un hallazgo (antes de llamarlo "confirmado")

Un hallazgo pasa de `candidato` a `confirmado` solo si se cumple **todo** esto:

1. [ ] El activo está dentro del alcance (`scope_validator.py` ✅) y la política se verificó hace menos de 30 días.
2. [ ] Se reproduce **al menos 2 veces** desde cero, siguiendo solo los pasos escritos.
3. [ ] Se usaron **solo cuentas y datos propios** (cuenta A "atacante" y cuenta B "víctima", ambas tuyas).
4. [ ] El impacto está **demostrado**, no supuesto. Ejemplo: "la cuenta A leyó el nombre del documento de la cuenta B", no "podría leer todos los documentos".
5. [ ] Se descartaron los falsos positivos habituales:
   - la respuesta es un 200 con datos **propios** o vacíos, no ajenos;
   - el dato ya era público por diseño;
   - la caché o el CDN muestran contenido genérico;
   - el "XSS" no se ejecuta en el dominio de la víctima (sandbox, otro dominio) o solo afecta a uno mismo (self-XSS);
   - el escáner informa de una versión vulnerable pero la función afectada no se usa.
6. [ ] No está en la lista de exclusiones del programa.
7. [ ] Evidencia guardada en `evidence/` (capturas y petición/respuesta) con los **tokens censurados**.
8. [ ] Severidad calculada con `risk_classifier.py` y justificada métrica por métrica.

Si algo falla → el hallazgo se queda en `en-validacion` o pasa a `descartado`, con el motivo anotado.
