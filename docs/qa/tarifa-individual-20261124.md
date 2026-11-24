# QA · Tarifa persistente y cobro individual (24-nov-2026)

Rama: `fix/tarifa-individual` (base `master` `7f53368e`). Worktree: `.worktrees/tarifa-individual`.
Sin Chrome compartido, sin publicar, sin datos reales: todos los fixtures son sintéticos.

## Hallazgo corregido

La tarifa `$6.500` de la demo quedaba atrapada en la UI: `alumnosParaCobros()` usaba
`montos.get(id) ?? 6500`, `AlumnoFicha` no persistía importe y `abrirPago()` no permitía
corregirlo. Una alumna individual sin tarifa proyectaba deuda mensual apenas se reservaba.

## Cambios

- `src/tarifas.ts` (nuevo): `precio(alumno, concepto, fecha)` devuelve la tarifa propia de la
  ficha o `null`; `precioDemo()` y `PRECIOS_DEMO` aíslan los precios de ejemplo.
- `src/alumnos.ts`: `tarifaUYU` en el contrato persistido (entero positivo o `null`), validada
  en alta/edición y saneada al leer. Las fichas viejas sin tarifa quedan en `null`.
- `src/cobros.ts`: `concepto`/`claseId` aditivos en `Pago`; los pagos históricos se leen como
  mensualidades sin reescribirlos. `resumenCobros()` excluye individuales. `cobrosIndividuales()`
  sólo devuelve clases `dada` con fecha `<= hoy`, una por `alumnoId|claseId`.
- `src/repositorio.ts`: `registrarPagoConTarifa()` guarda ficha y cobro en una sola
  persistencia: si el pago es inválido, la corrección de tarifa tampoco se guarda.
- `demo.ts` / `index.ts`: semilla demo usa precios explícitos; se exporta `tarifas.ts`.
- `propuesta.ts`: sin fallback demo; campo de tarifa en la ficha y en el diálogo de pago;
  lista de cobros individuales con su propio click. Sin rediseño visual v5.

## Verificación ejecutada

```
cd .worktrees/tarifa-individual/v5-diseno
npm ci                 # 31 paquetes, 0 vulnerabilidades (sesión anterior)
npm run typecheck      # 0 errores
npm test               # tests 236 / pass 236 / fail 0 / skipped 0
npm run build:check -- /tmp/apx-scratch-4f023747/th_6e25f04dbec148ed/build-final
git diff --check       # sin salida
```

Casos nuevos en `test/tarifas.test.ts` y `test/cobros.test.ts`:
tarifa propia vs. default demo; alta/recarga y corrección sobreviviendo `new RepositorioClases`;
ficha sin tarifa leída como `null`; pago histórico con monto intacto; reserva sin deuda;
clase dada generando un solo cobro individual; transacción rechazada sin escribir tarifa ni pago.

## Límites

- No se publicó. La app en `https://nicodelos24.github.io/Xime-clases/` sigue con el sello
  `202611240800`. Requiere integración y visto bueno antes de publicar.
- No se usó Chrome: el cambio visual (nuevo campo de tarifa y filas de cobro individual) no tiene
  captura, por la restricción de no usar el navegador compartido durante esta tarea.
- Los pagos históricos no se reescriben: se interpretan como mensualidades al leer.
