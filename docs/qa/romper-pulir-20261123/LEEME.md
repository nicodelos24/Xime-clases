# Fix QA 23-nov · nombre largo en Cobros (320 px)

Hallazgo de Gino (ronda romper y pulir): en la vista Cobros un nombre de ~68
caracteres estiraba la fila a 134 px y desplazaba el monto, porque
`.cobro-fila .al-nombre` no tenía el clamp que sí traía `.alumno-fila-btn .al-nombre`.

## Cambio

`v5-diseno/propuesta.css`: el clamp de 2 líneas + «…» (`line-clamp: 2`,
`overflow: hidden`, `overflow-wrap: anywhere`, `line-height: 1.22`) pasa a un
rule único que cubre:

- `.alumno-fila-btn .al-nombre` (ya existía, sin cambios de comportamiento)
- `.cobro-fila .al-nombre` (la fila de Cobros: el hallazgo)
- `.cobros-panel-resumen .al-nombre` (cabecera de la ficha y del sheet de pago)
- `.cobros-panel-lista .al-nombre` (historial de pagos, avisos de vencimiento,
  lista de rutinas semanales)

- `.lista-elegir .al-nombre` (lista de alumnos al agendar una clase suelta, ya
  existente en la rama; ahí el nombre es hijo directo del `label`)

En `.cobro-fila` se quita `.al-nombre` del `display: block` (el clamp ya es
block-level) y queda solo el `.al-sub`.

Solo CSS: nada de rediseño, ni datos reales (nombre sintético de 67 caracteres).

## Verificación (Chrome, servidor propio localhost:8821, sello 202611231320)

Con el nombre sintético de 67 caracteres en la primera fila de Cobros:

| Vista | Ancho | Fila | Nombre | Monto | Solape | scrollX |
|---|---|---|---|---|---|---|
| Cobros | 320 | 101 px (antes 134) | 35 px = 2 líneas | a la derecha, `$6.500`/`Pagado` | no | 320 |
| Cobros | 390 | 100 px | 35 px = 2 líneas | a la derecha | no | 390 |
| Cobros (clamp anulado a mano) | 320 | 119 px | 4 líneas | — | — | — |
| Historial de pagos (sheet) | 320 | — | 35 px | `$6.500` al lado, sin solape | no | 320 |
| Sheet de pago (resumen) | 320 | — | 35 px | monto a la derecha, sin solape | no | 320 |
| Alumnos (fila y ficha) | 320 / 390 | 120 / 96 px | 35 px | — | no | 320 / 390 |
| Agendar › Cancelar clase › Individual (`.lista-elegir`) | 320 / 390 | — | 35 px (66 caracteres) | — | no | 320 / 390 |

Fila normal (nombre corto): 84 px, idéntica a antes. 0 errores y 0 warnings de
consola. Claro y oscuro.

## Capturas

- `cobros-nombrelargo-320-fix-claro.png`
- `cobros-nombrelargo-320-fix-oscuro.png`
- `cobros-nombrelargo-390-fix-claro.png`
- `cobros-nombrelargo-390-fix-oscuro.png`
- `cobros-historial-nombrelargo-320-fix.png`
- `cobros-sheet-pago-nombrelargo-320.png`
- `alumnos-ficha-nombrelargo-390-fix.png`
- `agendar-lista-nombrelargo-320-fix.png`
- `agendar-lista-nombrelargo-390-fix.png`

Las fotos del hallazgo original (Gino) siguen en el repo:
`cobros-nombrelargo-320-centrado.png`, `cobros-nombrelargo-320-claro.png`.

## Chequeos

- `npx tsc --noEmit -p tsconfig.json` → limpio
- `npm test` → 180/180 en verde
- `node build-docs.mjs 202611231320` → docs/ regenerado (solo CSS + sello; el TS no cambió)
