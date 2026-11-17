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

## 2026-11-15 21:30 America/Montevideo — de Reina — [QA I1 solicitado]
**Tipo:** pedido de QA independiente. Candidato: `feat/i1-base-movil`, commit `2897387` (worktree `.worktrees/i1-base-movil`), app en `apps/mobile/` (Expo RN/TS + fixtures).
**Qué probar:** filtro/orden independientes en Alumnos (incluida Rosa que dejó de venir), Agendar/Retirar sin tocar pagos/estado, anti-duplicado por doble toque, ocurrencia cancelada 20/11 excluida, retorno a misma fecha/vista, Semana/Mes/Día/Agendar (adenda ENC-12), 320/360/390 + claro/oscuro + texto 200 % + reduced-motion, consola sin errores.
**Cómo:** `cd apps/mobile && npm test && npx tsc --noEmit && npx expo export -p web`; evidencia y límites en `docs/I1-EVIDENCIA-REINA.md`. Sin Supabase/Auth/pagos/persistencia; datos ficticios.

## 2026-11-15 America/Montevideo — de Reina — [ENC-13 QA independiente]
**Tipo:** candidato actualizado. Commit `64c36b7`, rama `feat/i1-base-movil`, worktree `.worktrees/i1-base-movil`. ENC-13 reemplaza Agenda por Mes compacto default + Día expandido; detalle `/programacion/[id]` para editar/retirar con confirmación.
**Qué probar:** grilla Hoy/selección/indicadores, 320 fallback lineal, 360/390, tira semanal, horas y bloques, día vacío, agendar/editar/retirar y retorno a la misma fecha, anti-duplicado y ausencia de efectos económicos, temas, accesibilidad, consola. Testear texto 200 % nativo/lector pantalla si tu entorno lo permite; no quedaron verificados por Reina.
**Evidencia:** `docs/diseno/ux/evidencia-enc13/README.md` + capturas SHA-256; mobile 29/29, dominio 22/22, typecheck/export web correctos. Lint global: 4 errores heredados fuera del cambio. Sin backend, pagos ni publicación.

## 2026-11-17 13:22 America/Montevideo — de Reina → Gino — [Fase 5, módulo Hoy: nuevo commit con ajustes de review de Vito]
**Tipo:** entrega/revisión. Rama `feat/fase5-modulos` (worktree `.worktrees/fase5-modulos`), commit **d916997ddf588b5f37d4b5c9643f73ed096e101c** (encima de `538038c`, que ya tenías en QA).
**Alcance para ti:** 5 ajustes puntuales sobre lo que ya estabas probando en Hoy, pedidos por Vito tras su review visual:
1. Hero «Clases de hoy»: ahora lleva degradé real (`expo-linear-gradient`, 135°, `#7A2F8C→#9B3FB0→#B65AC4`) en modo claro; en oscuro sigue plano con el color de superficie del tema.
2. Campana del header: ahora es `Pressable` que navega a Cobros; el badge rojo usa `AURORA.vencida.solid` (antes hex suelto).
3. Las 3 tarjetas KPI («Cobrado hoy» / «Por cobrar» / «Vencen») son accionables: tocar cualquiera abre Cobros.
4. Aviso de «Vencimientos de la semana»: fila completa es `Pressable` hacia Cobros, con chevron (ícono SVG, no emoji) al final.
5. `Festejo` (confeti al marcar «Dada»): ya no usa `top:300` fijo; recibe `origenY` desde el `onLayout` de la lista de la agenda del día. El botón «Dada» además actualiza su `accessibilityLabel` según el estado (dada/no dada).
**Verificado de mi lado:** `npm test` 62/62 verde, `npm run typecheck` limpio, revisión visual en navegador real (MCP Kaia Chrome) sobre `http://localhost:8931/hoy` y `/cobros`: campana, 3 tarjetas y aviso navegan a Cobros correctamente; hero con degradé visible; sin errores de consola.
**Límites:** no verifiqué el festejo disparándose en vivo (no hay clases en fixtures para el día actual de la demo); el comportamiento de `origenY` es por revisión de código, no por captura en movimiento. Resto de Hoy (lo anterior al commit `538038c`) sigue bajo tu QA ya en curso, sin cambios.

## 2026-11-17 13:3x America/Montevideo — de Reina → Gino — [corrección: festejo/Dada sí verificado en vivo]
Corrijo el límite del mensaje anterior: probé «Dada» en Hoy con clases reales (día 16/11, 3 programaciones de fixtures) y confirmé que Agenda › Día refleja el cambio («La clase de Bruno S. ya fue dada»). El límite anotado era porque antes probé con el día vacío (15/11). Con datos reales el flujo Hoy↔Agenda anda bien; sigue sin capturarse el frame intermedio del confeti (dura 240-400 ms), eso sí queda solo verificado por código.

## 2026-11-17 13:0x America/Montevideo — de Reina → Gino — [Fase 5, módulo Alumnos: entregado para QA]
**Tipo:** entrega/revisión. Rama `feat/fase5-modulos`, commit **ececd71** (encima de `d916997` que ya tenías).
**Alcance:** módulo Alumnos completo con Aurora (paleta tokens de `v2/diseno/tokens.css`, corregidos AA), en 7 archivos (+432/−96):
1. Lista `v2/modules/alumnos/screens/alumnos.tsx`: buscador con lupa SVG, chips segmentados (Todos/Mensuales/Individual) y orden (Más recientes / Mensuales primero / Por clase primero) vía `filtrosAlumnos.ts` + repositorio; tarjetas con avatar-iniciales en tint de modalidad, acento lateral de color, chevron SVG, FAB «+» (SVG masAlumno).
2. Ficha `ficha-[id].tsx`: estado de mensualidad del dominio, próximas clases cableadas (agenda real, solo lectura).
3. Tests propios `modules/alumnos/test/alumnos.test.ts` (búsqueda acento-insensible, filtros, orden).
**Verificado de mi lado:** `npm test` 72/72 verde, `npm run typecheck` limpio, y en vivo con Chrome real a 460×900 sobre la app corriendo: búsqueda «rosa» → 1 resultado, «zzz» → estado vacío con copy «No encontramos alumnos para "zzz"», navegación por tabs OK, **0 errores de consola y 0 caracteres emoji en el DOM** (íconos todos SVG). Capturas: `v2/docs/evidencia-fase5-alumnos.png`, `-busqueda.png`, `-busqueda-vacia.png` (commit `64cef75`).
**Límites:** dark mode y pantalla 320 px sin verificar en vivo (solo tokens); búsqueda en el input real probada por teclado web, no por IME de teléfono.
**Regla anti-rotura:** Alumnos no importa de otros módulos (solo packages/*); prueba `npm test` incluye fronteras y sigue verde.

## 2026-11-17 13:25 America/Montevideo — de Reina → Gino — [Fase 5, módulo Cobros: entregado para QA]
**Tipo:** entrega/revisión. Rama `feat/fase5-modulos`, commit **0592670** (encima de los avisos anteriores).
**Alcance:** módulo Cobros completo con Aurora (W7), en 5 archivos (+481/−23):
1. Pestañas `Por vencer / Vencidas / Adeudadas / Historial` con contador (chips segmentados, familia de Alumnos), lógica en `screens/estadosCobros.ts` (pura, 9 tests).
2. Resumen del mes: 2 KPI blancos (Cobrado/Por cobrar) con ícono SVG en tint; montos «—» + nota «La demo no inventa dinero» (límite I2 explícito, no hay montos inventados).
3. Adeudadas: fila por alumno individual con clases «Dada» sin cobrar (estado de sesión compartido con Hoy); los mensuales nunca adeudan en I1. Estado Vencida/Por vencer preparado en tipos, listado real llega con ciclos+pagos (I2) — hoy las pestañas muestran su vacío honesto.
4. Bloque «Anular un pago» como límite I2–I3 con regla: el pago original nunca desaparece.
**Verificado de mi lado:** `npm test` 81/81, `npm run typecheck` limpio; en vivo con Chrome real a ~600px: marcar «Dada» en Hoy (Diego, individual) → pestaña Adeudadas con contador «1», fila «Diego V. — Debe 1 clase dada sin cobrar (demo)» → toque abre ficha; Historial con estado vacío honesto; 0 errores en log del bundler; 0 emoji (íconos SVG). Capturas: `v2/docs/evidencia-cobros-adeudada.png`, `-historial.png`.
**Límites:** sin dinero ni pagos reales (I2–I3); Vencidas/Por vencer sin datos hasta tener ciclos+pagos; dark mode no verificado en vivo para esta pantalla.
**Regla anti-rotura:** Cobros no importa de otros módulos (solo packages/*); `npm test` incluye fronteras, sigue verde. Nota operativa: si Metro queda stale tras un cambio, reiniciar `npm run web` — lo que viste como "Requiring unknown module" fue eso, no código.

## 2026-11-17 13:35 America/Montevideo — de Reina → Gino — [Fase 5, módulo Más: entregado para QA]
**Tipo:** entrega/revisión. Rama `feat/fase5-modulos`, commit **809907f** (último módulo de fase 5).
**Alcance:** módulo Más completo con Aurora (W11), en 4 archivos (+396/−35):
1. Precios desde el dominio `tarifas.ts` (enteros UYU, vigencia): Mensualidad $ 1.800, Clase por clase $ 700; edición con vigencia y revisión nombrada I2 — no hay editor de precio en I1 y ningún pago pasado cambia.
2. Avisos de vencimiento (§3.4): N seleccionable 7 / 10 / Vence hoy (chips segmentados, 7 por defecto); nota «El aviso real llega con cobros (I2)».
3. Cuentas: dos dueñas (Xime · Dueño 2), mismo rol; sin roles extra, sin selector de grupos ni tutores (fuera del MVP, ni fila tiene).
4. Filas límite (Horario, Reportes y CSV, Cerrar sesión) siempre visibles con detalle de cuándo llega — nada oculto.
**Verificado de mi lado:** `npm test` 89/89 (8 nuevos en `modules/mas/test/mas.test.ts`), `npm run typecheck` limpio; en vivo: render completo, cambio de N entre chips (estado activo por color, aria-selected), scroll hasta Cuentas y límites; 0 errores en log del bundler; 0 emoji. Capturas: `v2/docs/evidencia-mas.png` y `-3.png`.
**Límites:** precio no editable (I2), N no persiste (demo, estado local), sin login (I2).
**Anti-rotura:** Más no importa de otros módulos (solo packages/* y dominio); fronteras verde.
