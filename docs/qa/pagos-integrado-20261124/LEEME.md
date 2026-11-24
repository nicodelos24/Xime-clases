# Pagos integrados — verificación 24-11-2026

## Alcance

Respuesta acotada a Roma para Nova: comprobar en el **integrado real** que los
pagos inválidos documentados por Emma en `aa5f8ca6` se sanan al cargar y no
falsean deuda ni KPI. Fuente: `docs/headless-persistencia-20261124/fixtures/inv-pagos.json`
de la rama de Emma, adaptando sólo `alumnoId` para que apunte a la ficha sembrada.

## Método

- `docs/qa/verificacion-pagos-integrado.mjs` siembra los seis pagos corruptos en
  `localStorage`, abre el build `docs/` en Chromium headless propio, navega a
  Cobros y mide DOM, KPI, almacén y errores de página.
- URL de esta corrida: `http://127.0.0.1:8897/index.html`.
- Resultado: `resultado.json` (`ok: true`).
- Los seis pagos quedan textualmente intactos en el almacén: **no se persiste un
  esquema roto ni se reescribe el almacén al cargar**. El repositorio los
  normaliza en memoria: null, objeto vacío, monto texto, período inválido y
  duplicado no entran al resumen. El pago válido produce `$1.234` en Cobrado; la
  deuda de `$6.500` sigue visible como deuda y no se marca pagada.
- Sin errores JavaScript. El build no requería corrección adicional para este
  punto: la normalización ya estaba integrada y cubierta por M-02/SEG-02 de la
  suite (`225/225` en la corrida de cierre).

## Límites

- Chromium headless/Playwright, no dispositivo físico ni Safari.
- Se verifica el camino de lectura/normalización al cargar; no una migración
  destructiva del almacén, que deliberadamente no ocurre.
- **Chrome compartido (`kaia_chrome_xime`) NO usado ni reservado.**
- No se publicó nada.
