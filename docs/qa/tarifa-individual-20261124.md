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

## Rework D1 (misma rama, 24-nov 14:xx)

Fina detectó en pantalla que la fila «Diego G. · Clase individual · $2.500 · Debe» abría el
diálogo con `$0 UYU` y el campo vacío. Causa: `abrirPagoIndividual()` llamaba `precio()` sobre
la fila de `alumnosParaCobros()`, que trae `montoUYU` pero no `tarifaUYU` → `null` → 0.

- `src/tarifas.ts`: nueva `precioPrecargado(alumno, concepto, fecha, pago)`. Con pago,
  manda su monto; sin pago, usa la tarifa propia; si la fila no declara `tarifaUYU`, usa su
  `montoUYU` como respaldo; si declara una tarifa inválida, devuelve 0 (no inventa precio).
- `propuesta.ts`: `abrirPagoIndividual()` usa esa función; M2 (foco al primer campo con error
  en ficha y en ambos diálogos de pago) y M3 (unificar «Clase individual», redacción de la
  nota) aplicados sin tocar M1 ni el v5 visual.
- Tests nuevos: `test/tarifas.test.ts` y `test/precarga-cobro.test.ts` cubren fila sin
  `tarifaUYU` → 2500, ficha corregida a 3100, pago existente → 2800 y tarifa inválida → 0.

Verificación del rework: `npm run typecheck` 0 errores, `npm test` **240/240** (0 fail),
`npm run build:check` OK, `git diff --check` limpio.

## Límites

- No se publicó. La app en `https://nicodelos24.github.io/Xime-clases/` sigue con el sello
  `202611240800`. Requiere integración y visto bueno antes de publicar.
- No se usó Chrome: el cambio visual (nuevo campo de tarifa, filas de cobro individual y el
  importe precargado corregido) no tiene captura propia; Fina reverificará en pantalla los
  3 tamaños (390/320/escritorio) antes de publicar.
- Los pagos históricos no se reescriben: se interpretan como mensualidades al leer.
