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
