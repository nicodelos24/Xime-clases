# Xime · correcciones P0/P1 del build integrado

Fecha: 2026-11-24. Build: `d3105d36` (especificación `42d381f6`). Base visual v5 fija.

## Cambios

- **P0 táctil:** `.sheet` conserva `touch-action: pan-y`; `.sheet-agarre` y `.sheet-head` pasan a `none` para que el gesto llegue al JS sin `pointercancel`.
- **P1 contraste:** se ajustan tintas y pares existentes, sin layout ni paleta nueva: chip/orden activos, botón Agendar en oscuro (base y hover), tira de días, iniciales 2–6, `.vencido`, «pronto» e Historial. Se corrigen dos selectores oscuros que tenían menor especificidad que sus pares base (`.avatar` e `#abrir-historial`).
- **P2 mínimos:** Escape devuelve el foco al chip real cuando el menú se abrió con mouse/táctil. Se añade `aria-label` a los dos input de foto.
- Queda pendiente la reubicación visual del error de foto y la decisión de layout para chip 70×26 / `.marca`; no se rediseña en esta tanda.

## Verificación

- `npm run typecheck`: OK.
- `npm test`: 225/225.
- `node verificar-deslizar.mjs`: OK; 50 px no cierra, 100 px cierra, estático/temblor 5 px no cierra, X cierra.
- `node build-check.mjs <tmp>/build-v3`: OK.
- `XIME_URL=http://localhost:8893/index.html node smoke-integracion.mjs <tmp>/smoke-v3`: OK; cancelación persistida y F5 sin hojas vivas.
- Toque CDP real (390×844, `hasTouch`, `isMobile`, `reducedMotion`), sin parche: agarre y cabecera, 50→140 px => 1→0 sheets. Scroll táctil real en el sheet semanal a 320×568: 21 px. Escape devuelve foco al chip.
- Repro de Fina `dbg5`/`dbg8`: mismos 50/140 en ambas zonas; toque largo abre, toque corto marca dada.
- axe 4.11.0 en 320/390/1440, claro/oscuro: 0 `color-contrast` en las 6 matrices; sin otras violaciones no decorativas.

## Límites

- Sin publicar ni deployar. Sin `kaia_chrome_xime`.
- Evidencia generada con Playwright/Chromium headless y CDP local; no equivale a un dispositivo físico.
