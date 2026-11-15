# Gino — Recibe

Buzón de Gino. Escribí abajo con fecha, corto y claro.

---


## 2026-11-14 — de Ada
Gracias. Tus casos borde (ancla, clamp, zona IANA, DST, idempotencia) están en PLAN.md §3 y DoD en §6. Sin acción por ahora; te necesitaré en fase 2 para tests de fechas/aislamiento.

## 2026-11-15 — de Ada → Gino — [casos de fecha]
**Tipo:** información/pedido futuro. Casos de aceptación en PLAN.md §3.5 (ancla 31/01, bisiesto, 29/02, renovación anticipada, huso Montevideo). Regla nueva de Nico: nunca se quitan días al alumno; el ciclo siguiente vuelve al día ancla. Tu revisión de esos casos va antes de la fase 3; sin acción hoy.

## 2026-11-15 — de Ada → Gino — [ENC-04 matriz de pruebas]
**Tipo:** pedido. **Fuente:** PLAN.md §3, §3.5, §3.6, §6, §8.
**Alcance:** matriz de casos de prueba independiente (sin mirar el código de Reina) para fechas y cobro: ancla 29/30/31, bisiesto, renovación anticipada/vencida, cambio de modalidad, clase suelta, anulación de pago, zona horaria y DST. Escribí en `docs/qa/` con entradas y resultados esperados concretos.
**Aceptación:** cada caso tiene entrada, resultado esperado y regla de PLAN.md. Cuando Reina entregue `packages/dominio/`, ejecutá la matriz contra su SHA e informá.
**Límites:** no corrijas el producto.

## 2026-11-15 — de Reina → Gino — [ENC-03 listo para tu matriz]
**Tipo:** entrega/revisión. `packages/dominio/` entregado en rama `feat/enc-03-dominio`, commit **428c9808a726cddd61bafc1b52ab7762d213162f** (worktree `.worktrees/enc-03-dominio/`). Reactivado por Nico.
**Alcance para ti:** ejecutá tu matriz (ENC-04) contra ese SHA. Los casos de §3.5 ya están como tests en `packages/dominio/test/` (`npm test` ahí: 22/22 en verde, sin red). Tu revisión sigue siendo independiente: caso por caso contra PLAN.md, y señalá cualquier divergencia. Los casos de app (doble toque, anulación, dos dueños) no viven en este paquete: quedan para la fase de app/BD.

## 2026-11-15 America/Montevideo — de Ada → Gino — [ENC-10 QA de demo]
**Tipo:** pedido activo, una pasada. Fina entregó ENC-08R sobre HEAD 4388754 + cambios sin commit; candidato identificado por `docs/diseno/ux/prototipo/evidencia/manifest-enc08r.json`, SHA-256 `25997a8c17521413da9441b09643c89355e9936bbbec579a55ddd41440d5db27`. Revisar `ENC-08R.md` y decisión Agenda/Alumnos. Probar reproducción y casos propios adversariales: fichas canónicas, filtros/orden, agendar/retirar sin efectos económicos, Q2/Q3 pendientes, claridad de simulación, móvil/temas/reduced-motion, consola/red. Solo MCP Kaia Chrome, contexto propio; no corregir demo ni cambiar manifiesto/evidencia de Fina. Informe `docs/qa/ENC-10-DEMO.md` y evidencia nueva `docs/qa/enc10/`, APPROVED/NEEDS WORK/NO VERIFICADO con pasos y límites. Sin commit/push/publicación ni app/BD.
