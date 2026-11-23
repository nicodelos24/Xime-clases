# Ronda «romper y pulir» · 4 mejoras visuales de Fina (22-nov-2026)

Candidato SIN PUBLICAR, rama `fix/v5-romper-pulir` sobre `327d6b6b`
(9 cambios de Nico ya publicados). Revisión visual con Chrome del proyecto,
capturas reales en esta carpeta. Consola: 0 errores / 0 warnings.

## Hallazgo 1 — tarjeta «0 vencen hoy» como estado neutro
Antes: ícono de alerta ámbar con el valor en 0 = falsa alarma.
Ahora: cuando `vencenHoy.length === 0`, el aviso lleva la clase `vacio`:
ícono de check, fondo `--tq-50` (claro) / `--bg-alt` (oscuro) y texto
`--tinta-2`. Con vencimientos reales se conserva el alerta ámbar original.
Ver: `reina-hoy-claro-390-vacio.png`, `reina-hoy-oscuro-390-vacio.png`,
`reina-hoy-oscuro-390-alerta.png` (estado con alerta forzado para medir).

## Hallazgo 2 — contraste del aviso en oscuro
Antes: `--ambar-suave` #7A5A00 sobre `--ambar-suave-tinte` #3A3020 = **2.03:1**.
Ahora (solo `[data-tema="oscuro"]`): `--ambar-pastel` #F2C48D sobre #3A3020
= **8.04:1**, token v5 existente; colores base claros intactos.
Medido en Chrome: `color rgb(242,196,141)` sobre `background rgb(58,48,32)`.

## Hallazgo 3 — chips Mensual/Individual en Alumnos y en la ficha (solo oscuro)
Antes: `--lila` #5E4285 / #2E2542 = **1.78:1**; `--azul` #34607F / #1E3546 = **1.89:1**;
chip activo de la ficha `--tq-900` #08454A / #1C3A3B = **1.14:1**.
Ahora:
- `.et-mensual` → #C9B6E8 sobre #2E2542 = **7.77:1** (color ya usado en v5)
- `.et-individual` → #A8CDEA sobre #1E3546 = **7.61:1**
- `.ficha-grupo.activo` → `--tq-700` #7BE0D6 sobre #1C3A3B = **7.84:1**
Ver: `reina-alumnos-oscuro-390.png`, `reina-ficha-oscuro-390.png`.

## Hallazgo 4 — overlap «noviembre 2026» / «Ver semana» a 320px
Antes: solape de ~40px (ambos en la misma fila flex sin wrap).
Ahora: `@media (max-width: 360px)` aplica `flex-wrap: wrap` con `gap: 8px 0`
al header de Vista Mes; «Ver semana» baja de línea. Medido en Chrome a 320px:
título y link en líneas distintas, solape vertical 0px. A 390px se conserva
la fila única original (sin regresión).
Ver: `reina-mes-oscuro-320-final.png`.

## Verificación
- `npm test` → 161/161 en verde
- `npm run typecheck` → sin errores
- Sin datos reales ni secretos: solo fixtures sintéticos del prototipo v5.
