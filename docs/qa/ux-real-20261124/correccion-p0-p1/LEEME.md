# Corrección P0/P1 · build integrado

Fecha: 24-11-2026. Rama `feat/integracion-avatar-seguridad-20261124`.
Base: `67880976`. Build revisado: `d3105d36`. Spec: `42d381f6`.
Base visual v5 fija. Sin publicar.

## Correcciones

- **P0:** `.sheet` mantiene `touch-action: pan-y`; `.sheet-agarre` y `.sheet-head` usan `none`. Así el arrastre de cierre no lo intercepta el scroll del documento.
- **P1:** pares existentes ajustados a AA: chip y orden activos, FAB y hover, tira de días, iniciales 2–6, `.vencido`, «pronto», botones de foto e Historial. Sin colores nuevos ni cambios de layout. Se corrigió la especificidad de dos selectores oscuros (`.avatar` e `#abrir-historial`) que perdían contra sus pares base.
- **P2:** Escape devuelve foco al chip real al abrir con mouse/táctil; `aria-label` en ambos input de foto.
- **Pendiente:** reubicación visual del error de foto y decisiones de layout para chip 70×26 / `.marca`; quedan documentados, sin rediseño.

## Evidencia

Carpeta: `docs/qa/ux-real-20261124/correccion-p0-p1/`.

| Verificación | Resultado |
|---|---|
| `npm run typecheck` | verde |
| `npm test` | 225/225 |
| `node verificar-deslizar.mjs` | verde; 100 cierra, estático/temblor 5 no cierran |
| `node build-check.mjs <tmp>/build-final` | verde |
| `node smoke-tactil.mjs <URL> <capturas>` | verde; agarre/cabecera 50→1, 140→0; scroll=21 px; Escape al chip; 0 errores JS |
| Repro de Fina (`dbg5`/`dbg8`, CDP) | 50 abierto, 140 cerrado en agarre y cabecera; toque largo/corto OK |
| `XIME_URL=... node smoke-integracion.mjs docs/qa/integracion-avatar-seguridad-20261124` | `ok:true`; 13 alumnas; cancelación persistida; F5 con 0 hojas |
| axe 4.11.0, 320/390/1440 × claro/oscuro | 0 `color-contrast`; sólo `region` preexistente en `.marca` |

Capturas táctiles: `capturas-tactil/agarre-50.png`, `cabecera-50.png`, `contenido-scroll.png`.

El intento anterior de `smoke-tactil` quedó registrado en `docs/qa/integracion-avatar-seguridad-20261124/resultado.json` del commit `595654f8`: `ok:false` por `TypeError: Assignment to constant variable` del harness, no de la app. La repetición final reemplaza esa evidencia por un `ok:true` y no deja `fallo.png`.

## Límites

- Chromium headless + CDP local; no dispositivo físico ni Safari.
- No se usó ni reservó `kaia_chrome_xime`.
- URL local efímera: no evidencia de publicación.
- Build aislado en `/tmp/apx-scratch-4f023747/th_121ed8f126374ef8/build-final`.
