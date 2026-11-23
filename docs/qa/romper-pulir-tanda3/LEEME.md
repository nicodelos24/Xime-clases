# Ronda romper y pulir · tanda 3 (Reina, 22-nov-2026)

Rama `fix/v5-pulir-tanda3`, **commit local, sin publicar**. Tres ajustes
menores pedidos por Roma (no son pedidos de Nico), diseño v5 intacto: no se
tocaron colores base, tipografías base ni animaciones.

## Qué cambia

1. **Nombre largo en Alumnos** (`task_c2b09302238d45e7`) — `.alumno-fila-btn .al-nombre`
   se limita a 2 líneas con «…» (`-webkit-line-clamp: 2`, `overflow-wrap: anywhere`,
   `line-height: 1.22`). No se reserva alto: las filas normales quedan idénticas.
   Medido a 320px: nombre 35px de alto (antes 63px = 3 líneas), fila 114px (antes 119px).
2. **Contador «13 alumnos» a 320px** (`task_bbaf156b2a744855`) — solo `≤360px`:
   `white-space: nowrap` + 11.5px (contador 64×14, antes 51×28 partido en dos líneas)
   y se oculta el icono decorativo «+» del botón «Nuevo alumno», que es lo que
   libera el ancho sin comprimir el botón (queda 108×37 con 11px de aire contra
   el contador; antes 128×37 con 0px). El padding y el alto no cambian.
   A 360px: contador 64×14 con 35px de aire. A 390px: idéntico a antes.
3. **Jerarquía del dato de cobro en la ficha** (`task_e11b4ab38008499b`) —
   `textoCobroFicha()` en `propuesta.ts` envuelve estado e importe en spans;
   el estado toma acento (rosa si venció, ámbar si está por vencer) y el importe
   peso 700 en tinta. El paréntesis «(vence …)», la nota de cabecera y el texto
   de simulación quedan en 13px/400/`--tinta-2`. Contraste: rosa 7,55:1 y ámbar
   5,91:1 en claro; rosa-pastel 8,17:1 y ámbar-pastel 9,61:1 en oscuro (AA).

## Cómo probarlo

- `docs/alumnos.html` (o la vista Alumnos): 320 y 390px, claro y oscuro.
  Nombre largo = inyectar un `alumno.nombre` largo en `xime.v5.estado` y recargar.
- Ficha de una alumna con deuda: tocar su fila en Alumnos; revisar el párrafo
  `.ficha-cobro` en claro y oscuro (estado + importe destacados, resto igual).

## Capturas

Tomadas con Chrome headless propio (no el Chrome compartido del equipo) sobre
una copia del build de `docs/` en `/tmp`, sin tocar el repo del dueño:

- `reina-alumnos-320-claro.png`, `reina-alumnos-320-oscuro.png`: encabezado de
  Alumnos + primera fila con nombre largo a 320px.
- `reina-ficha-cobro-320-claro.png`, `reina-ficha-cobro-320-oscuro.png`: ficha
  de edición con el dato de cobro jerarquizado.

## Verificación

- `npm run typecheck` — sin errores.
- `npm test` — 161/161.
- `git diff --check` — limpio.
- Medidas y colores leídos del DOM renderizado (getBoundingClientRect /
  getComputedStyle) en Chrome headless a 320, 360 y 390px.
