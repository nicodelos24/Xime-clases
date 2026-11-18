# Cobros

Pantalla Cobros con Aurora (W7 de Fina): pestañas Por vencer / Vencidas /
Adeudadas / Historial + resumen del mes, en familia visual con Hoy (KPI blancos,
filas tint por modalidad, acento lateral).

**I1: no registra ni anula pagos.** No hay montos inventados: cobrado/por cobrar
quedan en «—» con nota de límite; el historial muestra su estado vacío real
«El historial llega con pagos reales (I2)»; la anulación se nombra como acción
futura de W10/I2–I3. La deuda que se lista viene solo del estado visual I1
«dada» (clases sueltas dadas sin cobrar, marcadas en Hoy) y lo dice («demo»).

Lógica pura en `screens/estadosCobros.ts` (tests en `test/cobros.test.ts`): la
deriva de clases adeudadas, el texto relativo de vencimientos y las pestañas.
El estado de mensualidad real (ciclos, renueva) lo calcula `packages/dominio`;
entra a esta pantalla con I2 junto a los pagos.

La verificación de tipos corre con `npx tsc --noEmit -p modules/cobros/tsconfig.json`
desde `v2/`. La barrera de imports entre módulos está en `v2/test/fronteras.test.ts`.

## Decisión visual

- Resumen del mes: 2 KPI (Cobrado/Por cobrar) blancos con ícono en tint+ink, como
  las KPI de Hoy; los montos «—» son límite explícito, no número faltante.
- Pestañas: chips segmentados (misma familia que los de Alumnos), con contador.
- Filas de cobro: tarjeta blanca con acento lateral de modalidad, avatar-iniciales,
  badge de modalidad + chip de estado (Por vencer ámbar/Vencida roja/Adeudada magenta,
  siempre ícono + texto, nunca solo color), detalle textual y chevron; toca → ficha.
- Íconos: solo SVG propios (`packages/ui/Icono`), cero emoji (regla de Nico).
