# QA visual — Rediseño único v5 (Pieza 3), 23-nov-2026

Revisado por Gino (QA). Worktree `v5-rediseno-pieza2`, rama `feat/v5-rediseno-pieza2`,
sirvido en `http://localhost:8798/index.html` (sello `?v=202611232227`).
Chrome del proyecto usado en exclusiva, soltado al terminar.

## Qué se verificó
- Ficha del alumno (tap en un cobro): claro/oscuro, 320/390/1440 px.
- Cobros: filtros (Todos/Deben/Vencido/Por vencer/Pagado), orden (Vencimiento/Alumno A→Z),
  fila, estado vacío; claro/oscuro, 390/1440 px.
- Accesibilidad: `role="dialog"`, `aria-modal`, `aria-labelledby`, foco inicial,
  `aria-expanded`/`aria-controls` en burbujas, Escape.
- `npm test` 187/187 pass, `npm run typecheck` OK, 0 errores de consola.

## Funciona
- B7: tap en la fila abre la FICHA del alumno vinculada por ID (Carla T. → ficha a0), no el diálogo de pago directo.
- Chips de deuda/vencimiento en la ficha (rosa/ámbar/turquesa) y adaptación en 320 px sin desbordes.
- Filtros y ordenactúan, son exclusivos e independientes entre sí; A→Z ordena bien, «Pagado» deja lista vacía.
- Toggle de las burbujas: `aria-expanded` y `hidden` cambian; una sola abierta a la vez.

## Fallos (contra la spec `docs/diseno/rediseno-20261123/ESPECIFICACION.md`)
1. **A3 — WhatsApp no se ve como botón primario.** El `<a class="ficha-accion-wa">` tiene el SVG `#i-wa`, pero
   el CSS `.ficha-acciones .ficha-accion-wa { background: var(--tq-700) ... }` de la spec no está aplicado.
   Computado: `background: transparent`, `border-radius: 0`, `text-decoration: underline`, `min-height: 44px`
   (spec: 46px). El CSS fuente (líneas 658-665 y 755) sólo da color/subrayado, sin el bloque de acento.
   Rompe el pedido de «destacar WhatsApp con ícono SVG estilo .btn-wa». Ver `ficha-390-claro.png`,
   `ficha-390-oscuro.png`, `ficha-1440-claro.png`.
2. **A1 — burbuja «?» no es el carácter «?» literal y es chica.** El botón contiene `<svg #i-ayuda>` de 14px
   y mide 30×30 (spec §1.1: «?» literal, 32×32 visual, 44×44 de área táctil). Ver magnificación en
   `ficha-390-claro.png` y `ficha-320-claro.png`.
3. **A1 / §1.2 — texto no plegado.** «Los links abren WhatsApp con el mensaje escrito; el envío lo confirmás vos.»
   sigue visible al abrir la ficha (clase `al-sub`, sin burbuja). La spec pide plegarlo en «?» al lado de
   «Enviar WhatsApp». Ver `ficha-1440-claro.png`.
4. **§3.3 — fila sin jerarquía nueva.** La fila conserva el markup viejo: `<strong class="monto">`, sin
   `.cobro-importe`/`.cobro-vence`; el vencimiento se lee en `.al-sub` y el monto es un número rosado sin
   etiqueta «Debe/Pagado». A 390 px el grupo «Martes A/B» se parte en dos líneas. Ver `cobros-390-claro.png`,
   `cobros-390-oscuro.png`. Comparar con `docs/evidencia/cobros-rediseno/01-cobros-claro-390.png`.
5. **Menor / textos.** Estado vacío dice «Nada con este filtro» con clase `cobros-vacio`; la spec (§3.1/§3.5)
   pide «Ningún cobro con este filtro» y clase `pv-vacio`.
6. **Menor / tira de filtros.** A 1440 px los 7 chips no caben en los ~358px del panel (scrollWidth 585),
   «Pagado» queda a medias y Vencimiento/Alumno requieren scroll horizontal. Son alcanzables; es carrusel,
   no pérdida de función. Ver `cobros-1440-oscuro-top.png`.

## No se pudo verificar
- Registro/corrección/anulación de pagos: no se ejecutó para no mutar datos de la demo.
- Lectores de pantalla reales: sólo se revisaron atributos ARIA en el DOM.

## Capturas
Todas en esta carpeta: cobros-390-claro, cobros-390-oscuro, cobros-1440-oscuro,
cobros-1440-oscuro-top, ficha-320-claro, ficha-390-claro, ficha-390-oscuro, ficha-1440-claro.
