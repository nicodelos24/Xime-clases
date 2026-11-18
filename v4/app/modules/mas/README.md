# Más

Pantalla Más con Aurora (W11 de Fina): precios con vigencia, días de aviso,
cuentas y límites. Misma familia visual: tarjetas blancas con borde, íconos SVG
en tint, chips segmentados para el N de aviso.

**I1: lista, no edición.** Los precios se muestran desde el dominio
(`packages/dominio/tarifas.ts`, enteros UYU con fecha de vigencia); cambiar el
precio exige vigencia y pantalla de revisión: I2. Los pagos pasados nunca
cambian por un precio nuevo (regla del dominio). El N de aviso (§3.4 de
v1/PLAN: 7 por defecto, opciones 10 y «vence hoy») es seleccionable en la demo
(estado local); la persistencia y el envío de avisos llegan con I2.

Lógica pura en `screens/ajustesMas.ts` (tests en `test/mas.test.ts`): lista de
precios demo, formato UYU, opciones de aviso y filas con su detalle de límite.
Cuentas: las dos dueñas del piloto (mismo rol, sin recepción ni profesores).

La verificación de tipos corre con `npx tsc --noEmit -p modules/mas/tsconfig.json`
desde `v2/`. La barrera de imports entre módulos está en `v2/test/fronteras.test.ts`.

## Decisión visual

- Filas de precio con ícono en tint de modalidad y valor en bold a la derecha.
- Chips de aviso idénticos a los de Alumnos/Cobros (familia).
- Filas no disponibles: ícono neutral + detalle de cuándo llega, nunca ocultas.
- Íconos: solo SVG propios (`packages/ui/Icono`), cero emoji (regla de Nico).
