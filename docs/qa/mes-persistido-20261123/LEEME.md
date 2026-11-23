# Mes persistido que desincronizaba «Hoy» (23-nov-2026)

Hallazgo de la ronda «romper y pulir» de Gino (23-nov tarde), confirmado por
Roma en el vivo: al mirar otro mes en la Agenda (p. ej. enero 2027) y volver a
abrir la app en `#v-mes`, el calendario se veía en ese mes viejo mientras «Hoy»
seguía en la fecha real (lun 23 nov). Parecía que la app había perdido el día.

## Causa

El mes abierto es estado de pantalla (`mesSeleccionado` en `propuesta.ts`) y se
conservaba al volver a pintar y al reabrir. La fecha de «Hoy» sale siempre del
reloj, así que las dos vistas quedaban contando cosas distintas.

## Arreglo

- `v5-diseno/src/agenda-mes.ts` (nuevo, puro, 4 tests en
  `v5-diseno/test/agenda-mes.test.ts`): `mesDeHoy`, `diaSeleccionadoAlCargar`
  (el día elegido solo sobrevive si es del mes de hoy) y `primerDiaDeMes`
  (flechas con aritmética sin `Date`).
- `propuesta.ts`: al arrancar, el almanaque se ancla al mes de la fecha real;
  al restaurarse la página desde la caché del navegador (`pageshow` con
  `persisted`) vuelve al mes real. No se toca ningún dato guardado ni el
  auto-marcado por reloj (sigue descartado).
- Diseño v5 intacto: no cambia HTML ni CSS, solo el mes que se pinta.

## Verificación

- `npm run typecheck` 0 errores; `npm test` 184/184 (eran 180).
- Chrome (390×844, claro y oscuro), sello `202611231830`:
  - Clases → «Ver mes» (nov 2026) → 2 flechas adelante → enero 2027.
  - `#v-mes` + recarga: abre en **noviembre 2026** con el 23 marcado como hoy.
  - Entrada directa a `…?v=…&hash=#v-mes`: noviembre 2026.
  - 0 errores de consola.
- Capturas: `mes-persistido-fix-claro-390.png`, `mes-persistido-fix-oscuro-390.png`.
## Publicación en el vivo (23-nov, 18:15)

- Merge a `master` por fast-forward (`ac5b7eea..4466171f`) y push a `origin`;
  GitHub Pages sirve `master:/docs`.
- `docs/` regenerado con `node build-docs.mjs 202611231830` reproduce el árbol
  commiteado sin diferencias.
- Vivo sirviendo sello `202611231830`: `propuesta.js` incluye
  `alinearMesConHoy`, `diaSeleccionadoAlCargar` y `primerDiaDeMes`, y
  `src/agenda-mes.js` responde en el sitio público.
- Recorrido en Chrome (390×844) sobre el vivo: entrada directa a `#v-mes` →
  noviembre 2026 con el 23 marcado; 2 flechas adelante → enero 2027; recarga →
  vuelve a noviembre 2026 con el 23 marcado, en claro y en oscuro (toggle de la
  app, `data-tema="oscuro"`). 0 mensajes de consola.
- Capturas del vivo: `vivo-fix-claro-390.png`, `vivo-fix-oscuro-390.png`.
