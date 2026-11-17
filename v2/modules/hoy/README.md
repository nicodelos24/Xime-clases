# Hoy

Resumen Hoy basado en fixtures; sin facturación ni acciones productivas.

La verificación de tipos corre con `npx tsc --noEmit -p modules/hoy/tsconfig.json` desde `v2/`. La barrera de imports entre módulos está en `v2/test/fronteras.test.ts`.

## Decisión visual (consciente, revisión de Vito 17-nov-2026)

Las 3 tarjetas KPI (`TarjetaResumen`) van con fondo **blanco** (`#FFFFFF`) y acento
lateral; las filas de `FilaClase` van con **tint** por modalidad (violeta/azul claro).
Es a propósito, coincide con la captura `v2/diseno/capturas/a-hoy.png`: no
"uniformizar" esto sin volver a mirar la referencia.

El hero «Clases de hoy» usa degradé (`expo-linear-gradient`, stops
`#7A2F8C → #9B3FB0 → #B65AC4`, 135°) tomado 1:1 de
`v2/diseno/propuesta-a-aurora/estilo.css` (`.heroi`). En modo oscuro no lleva
degradé: usa el color de superficie plano del tema oscuro (ya tiene su propio
par de colores, no es una inversión del claro).

Las 3 tarjetas KPI y el aviso de vencimientos son **accionables** (tocan → Cobros):
en I1 Cobros es un placeholder, pero el toque ya está cableado para no dejarlas
"muertas" (patrón fintech del estándar de Vito).
