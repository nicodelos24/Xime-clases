# Filtros de Alumnos · pista de scroll (23-nov-2026)

Hallazgo de QA (ronda «romper y pulir», Gino): a 320 px la tira de chips daba
`scrollWidth 792 / clientWidth 268`, con la barra de scroll oculta por diseño y
sin ninguna señal de que hubiera más chips a la derecha.

## Qué se cambió

- `v5-diseno/src/scroll-pista.ts` (+ `test/scroll-pista.test.ts`): política pura
  `pistaDeTira({scrollLeft, scrollWidth, clientWidth})` → qué bordes insinuar.
  Sin desborde real no hay pista; tolerancia de 1 px para sub-píxeles y rebote
  elástico.
- `v5-diseno/propuesta.css`: `.tira-filtros` (envoltorio `position:relative`) con
  dos degradados del color del fondo (`.pista-inicio` / `.pista-fin`),
  `pointer-events:none` y `--fondo-tira` por tema (claro y oscuro).
- `v5-diseno/index.html`: los chips siguen en `#filtros-alumnos` (mismo scroll);
  se envuelven con los dos `<span class="pista">`.
- `v5-diseno/propuesta.ts`: `actualizarPistaFiltros()` al abrir Alumnos, al hacer
  scroll en la tira, en `resize` y al volver a la pestaña.
- `v5-diseno/build-docs.mjs`: script que regenera `docs/` (§7.3 del PLAN) con el
  sello de cache-busting, para no repetirlo a mano.

Sin rediseño: mismos chips, mismo orden, mismo alto; solo se agrega el degradado
de borde cuando hay contenido escondido.

## Verificado (Chrome real, `docs/` local)

- 320 px, inicio: `pista-fin` encendida (30 px, opacidad 1), `pista-inicio`
  apagada. `scrollWidth 792 / clientWidth 268` sin cambios.
- 320 px, medio (`scrollLeft 260`): las dos encendidas.
- 320 px, final (`scrollLeft 524`): solo `pista-inicio`.
- 390 px: `clientWidth 338`, también desborda → `pista-fin` encendida.
- Oscuro: `--fondo-tira` toma `rgba(14,27,30,1)` y el degradado sigue visible.
- Rueda horizontal sobre la tira: `0 → 524`; el clic en «Al día» al final de la
  tira lo marca `aria-pressed="true"`. El degradado no intercepta el toque
  (`elementFromPoint` sobre la pista devuelve la tira de chips).
- 0 errores de consola recorriendo Hoy · Semana · Alumnos · Cobros.
- `tsc --noEmit` limpio, `npm test` 180/180 (5 nuevas de la pista).

Capturas: `320-inicio-claro.png`, `320-medio-claro.png`, `320-fin-claro.png`,
`390-inicio-claro.png`, `320-inicio-oscuro.png` y `contacto.png` (las cinco
apiladas). Se tomaron recortadas a la tira: en la pantalla completa el degradado casi no se percibe, justamente porque
se desvanece sobre el mismo fondo.
