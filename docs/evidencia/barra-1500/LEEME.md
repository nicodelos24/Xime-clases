# Evidencia · barra inferior reaparece a los 1,5 s (22-nov)

Pedido de Nico (22-nov, vía Nova): la barra de navegación vuelve a aparecer
**1,5 s (1500 ms)** después de dejar de scrollear, en vez de 2 s.

## Qué cambió

- `v5-diseno/src/barra-scroll.ts`: `REAPARECER_TRAS_MS = 1500`.
- Build publicado (`docs/`): `docs/src/barra-scroll.js` con el mismo valor y
  sello anti-caché nuevo `202611222310` en `index.html`, `propuesta.js` y los
  módulos que lo importan.
- Test ajustado: `v5-diseno/test/barra-scroll.test.ts` exige 1500.

## Verificación

- `node --test test/*.test.ts` → **161/161 en verde**.
- `tsc --noEmit` → limpio.
- En el sitio publicado (390 × 400, vista Clases › semana), bajando hasta el
  final: la barra se oculta y **vuelve sola a los ~1450 ms** medidos en el
  navegador (dos mediciones: 1450 y 1457 ms).

## Capturas

- `v5-barra-1500-oculta-vivo-390.png` — barra oculta en el sitio publicado.

Nota: a 390 × 400 el único scroll de la vista es de 131 px, así que la
captura del estado oculto y la del reaparecido se parecen; lo que distingue
el cambio es el tiempo medido, no el pixel.
