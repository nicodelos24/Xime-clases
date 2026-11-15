# ENC-04 — Resultados de ejecución

**Dictamen del paquete de dominio:** APPROVED para las reglas implementadas/cubiertas en `packages/dominio/`; **NO VERIFICADO** para flujos de app/BD fuera del paquete. No se corrigió producto.

- Candidato: `master`, `41e12607f7d2060dd37241585fc19d4d5f5c2caa` (el dominio está versionado en este candidato; ruta del worktree `.worktrees/enc-03-dominio/` reportada por Reina no fue la base probada).
- `npm test --prefix packages/dominio` — 22/22 pasan, 0 fallos.
- Matriz independiente: `CASE-MATRIX.md`, redactada antes de inspeccionar el código.

| ID | Resultado observado | Evidencia / límite |
|---|---|---|
| M01 | Pasa | Test mensualidad nombra pago 10/04, inicio 12/04, último día 11/05 y aviso 04/05. |
| M02 | Pasa | Test de ancla 31: 31/01/2027 → 28/02 → 31/03; último cubierto 27/02. |
| M03 | Pasa | Test bisiesto: 31/01/2028 → 29/02 → 31/03; último cubierto 28/02. |
| M04 | Pasa | Test de cuatro renovaciones: 31/01, 28/02, 31/03, 30/04, 31/05; ancla conserva 31. |
| M05 | Pasa | Test ancla 29 verifica 29/02/2028, 29/03, 28/02/2029 y retorno a 29/03. |
| M06 | Pasa | Test paga 05/05 antes del último día 11/05; siguiente inicio 12/05. |
| M07 | Pasa | Test pago 20/05 resulta vencido/sin iniciar y fija nuevo ancla al iniciar 23/05. |
| M08 | No aplicable al paquete / no verificado | Dominio calcula ciclo/estado; no implementa flujo de asistencia, ofertas de cobro ni bloqueos de app. |
| M09 | No aplicable al paquete / no verificado | No existe módulo de asistencia/deuda de clase suelta aquí. |
| M10 | No aplicable al paquete / no verificado | No existe registro de asistencia/cancelaciones aquí. |
| M11 | No verificado | La regla figura en la matriz; no hay pagos persistidos ni flujo de modalidad en este paquete. |
| M12 | No verificado | Idempotencia de doble toque requiere app/BD; no hay almacenamiento de pagos en el paquete. |
| M13 | No verificado | Anulación, contra-registro y auditoría requieren pagos persistidos; fuera de alcance del paquete. |
| M14 | No verificado | No hay transiciones de modalidad ni pago/asistencia en el paquete. |
| M15 | No verificado | No hay cambio de modalidad/persistencia; la función `terminarHoy` solo devuelve fecha fin y no muta ciclo. |
| M16 | Parcial | `terminarHoy` valida fecha dentro del ciclo y devuelve el fin; motivo, auditoría y reflejo posterior en estado dependen de la app/BD y no se prueban aquí. |
| M17 | Pasa | Test evalúa 23:59 y medianoche local Montevideo mediante `hoyLocal` y `estadoDe`. |
| M18 | Pasa | Test calcula `fechaAviso(ciclo, 7)` = 04/05 para último día cubierto 11/05. |
| M19 | No verificado | La aritmética civil evita sumar duraciones de 24h, pero no hay caso de prueba DST. El PLAN fija Uruguay/Montevideo y el test del dominio declara UTC−3 todo el año; DST en zonas que cambian no es validable con este caso local. |
| M20 | Pasa | Tests de tarifas consultan vigencias históricas; cambiar lista no altera el monto de consultas de fecha anterior. La persistencia del monto dentro de un pago no se prueba. |

**Observaciones:** los casos soportados del dominio para ancla, renovaciones, estados, aviso y tarifa están alineados con los resultados esperados. El alcance no verifica UI móvil, dos dueños, idempotencia/persistencia, anulación/auditoría ni seguridad multi-tenant; no presentar estos resultados como aprobación de esos módulos. No ejecuté pruebas E2E ni staging. `git status` mostró cambios ajenos preexistentes; los preservé. No se hizo commit ni push.
