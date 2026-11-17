# Alumnos

Lista de fichas canónicas con búsqueda (acento-insensible), filtro y orden
independientes, estética Aurora (`v2/diseno/capturas/a-alumnos.png`). FAB «+»
recuadrado como límite I1: el alta real llega con I2; tocar una fila abre la
ficha por ruta (`/ficha/[id]`), sin importar nada de otro módulo.

La verificación de tipos corre con `npx tsc --noEmit -p modules/alumnos/tsconfig.json`
desde `v2/`. La barrera de imports entre módulos está en `v2/test/fronteras.test.ts`.

## Estados de pago en la lista (I1)

Las capturas de referencia muestran chips «Al día / Vence pronto / Debe / Vencida»
por fila. En I1 **no se muestran**: el dominio v1 (`packages/dominio`) deriva
estados de ciclo, pero `packages/datos` todavía no modela pagos ni ciclos por
alumno, y la regla de esta base es mostrar límites, nunca datos inventados.
Los chips de pago entran con I2 reusando los tokens `AURORA.aldia/pronto/debe/vencida`.

## Tests

`modules/alumnos/test/alumnos.test.ts` (node:test): búsqueda acento-insensible,
búsqueda vacía, filtro+orden con el repositorio (incluye que Rosa M. sigue
visible aunque dejó de venir), y que «Mensuales primero» no pierde alumnos.
Se corren con `npm test` desde `v2/`.
