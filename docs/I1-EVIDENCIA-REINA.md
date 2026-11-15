# I1 · Evidencia de verificación (Reina, 15/11/2026)

Candidato: worktree `.worktrees/i1-base-movil`, rama `feat/i1-base-movil`. App verificada en ejecución vía export web (`npx expo export --platform web`) servida en localhost, recorrido con Chrome real a 320/360/390 px.

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `npm test` (apps/mobile) | 15/15 pruebas en verde (node --test, sin red) |
| `npx tsc --noEmit` (apps/mobile) | sin errores |
| `npx expo export --platform web` | bundle compilado sin errores |
| `npm test` (packages/dominio, regresión separada) | 22/22 en verde (~0,6 s) |
| Consola/red del navegador | 0 errores y 0 advertencias con el bundle de producción |

## Casos verificados en ejecución

- **Filtro y orden independientes** en Alumnos (tests + navegación).
- **Más recientes** mezcla modalidades; Rosa (dejó de venir) sigue visible; reagendar Rosa el 16/11 desde Agendar (captura `dia-tras-agendar-rosa.png`).
- **Agendar/retirar** no toca pagos, deuda, clase efectiva ni mensualidad (sin comandos financieros; tests de no-mutación).
- **Anti-duplicado**: doble toque → `PROGRAMACION_DUPLICADA` (test); fichas ya programadas se marcan preventivamente (`agendar-360-claro.png`).
- **Semana/Mes/día** conservan fecha y modo al volver de ficha/agendar; «Hoy» resalta el 15/11.
- **Ocurrencia cancelada** (20/11) no cuenta como «vienen»; no se agendar sobre ella.
- **Mes a 320 px**: lista lineal con resumen elegido primero, sin celdas <44 px ni scroll horizontal (`mes-320-lista-lineal.png`).
- **Texto 200 %**: etiquetas completas en la barra inferior tras el ajuste de REV-VIS-01 (`hoy-200-porc-oscuro.png`).
- **Claro/oscuro** por esquema del sistema (`semana-360-oscuro.png`); **reduced-motion** del sistema respetado (`reduced-motion-oscuro.png`).

## Capturas

`docs/diseno/ux/evidencia-i1-reina/*.png` — Semana vacía/ocupada, Mes, Día, Agendar, retorno tras agendar, 320 lineal, oscuro, 200 %, reduced-motion.

## NO VERIFICADO / límites

- No se usó teléfono físico ni lector de pantalla; lo anterior es navegador (web) con emulación.
- Sin persistencia entre sesiones: los cambios de Agenda viven solo en memoria de la app.
- Sin Supabase/Auth/SQL/cobros reales; datos 100 % ficticios; sin publicación ni push.
- La validación de usuaria y la aprobación estética de Nico no se realizaron.
