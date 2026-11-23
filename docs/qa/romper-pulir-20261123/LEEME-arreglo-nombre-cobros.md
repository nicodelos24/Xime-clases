# Arreglo del hallazgo «nombre largo rompe la fila de Cobros» (23-nov-2026)

Tarea APX: `task_d9f512676e114ca3` · rama `fix/v5-cobros-nombre-largo` · sello `202611231320`.

## Que se cambio (un solo bloque de CSS)

El clamp de 2 lineas + «...» que ya tenian las filas de Alumnos (`.alumno-fila-btn .al-nombre`)
ahora cubre tambien los lugares donde el nombre largo todavia estiraba la fila:

| Ambito | Donde se ve |
| --- | --- |
| `.cobro-fila .al-nombre` | lista de Cobros (lo reportado por Gino) |
| `.cobros-panel-resumen .al-nombre` | cabecera del sheet de Registrar pago y del detalle del alumno |
| `.cobros-panel-lista .al-nombre` | sheet de avisos de pago e historial de pagos |
| `.lista-elegir .al-nombre` | «Elegi los alumnos» del agendar (nombre como hijo directo del label) |

Se quito el `display: block` redundante de `.al-nombre` dentro de `.cobro-fila` (la caja con
clamp ya es block-level); `.al-sub` conserva el suyo. Sin cambios de color, tipografia ni animacion.

## Medicion (dato sintetico de 67 caracteres en una ficha demo, servidor local)

| Viewport / tema | Nombre | Fila del nombre largo | Fila normal |
| --- | --- | --- | --- |
| 320 claro | 2 lineas (35px), con «...» | 101px | 84px |
| 320 oscuro | 2 lineas (35px) | 101px | 84px |
| 390 claro | 2 lineas (35px) | 101px | 64px |
| 390 oscuro | 2 lineas (35px) | 101px | 64px |

Con el clamp apagado a mano, la misma fila a 320px mide 137px: eso es lo que se evitaba
(Gino midio 134px en el vivo). Sin desborde horizontal (`scrollWidth <= innerWidth`), el monto
queda dentro de la fila y el sheet de pago no necesita scroll a 320px. Consola: 0 mensajes.

## Capturas

- `reina-cobros-nombrelargo-320-claro.png`, `-320-oscuro.png`, `-390-claro.png`, `-390-oscuro.png`
- `reina-pago-nombrelargo-320-claro.png`, `-390-claro.png`, `-390-oscuro.png` (sheet de pago)
- `reina-historial-nombrelargo-390-oscuro.png` (historial, `.cobros-panel-lista`)
- `reina-ficha-nombrelargo-390-claro.png` (cabecera de la ficha del alumno)

## Pruebas

- `npm run typecheck` -> sin errores
- `npm test` -> 180 pass / 0 fail
