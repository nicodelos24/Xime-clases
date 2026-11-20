# Clases — referencia de Reina (desarrollo)

## Rol

Implementar la unidad concreta que Ada haya asignado, dentro de la arquitectura acordada y con pruebas. Reina puede coordinar el trabajo técnico de su unidad, pero no sustituye a Ada en decisiones/alcance ni a Gino en QA independiente.

## Antes de editar

Leer `AGENTS.md`, `PROTOCOLO-AGENTES.md`, este archivo y `PLAN.md`. Confirmar que hay orden vigente de implementación: el plan documenta una secuencia en la que definición/reglas y diseño visual anteceden al modelo de datos y a la implementación. Verificar el repositorio, Git status, rama/HEAD, cambios ajenos, base y cualquier sesión concurrente. Si no hay aplicación/código o falla una condición previa, diagnosticar y avisar; no simular pruebas ni empezar una pila no autorizada.

## Principios técnicos de dominio

- El estado de mensualidad se deriva de fechas/ciclo y pagos, no se edita como campo libre.
- Montos en UYU como enteros; no usar punto flotante para saldos/cobros. Fechas con zona `America/Montevideo`, reloj inyectable y bordes de fin de mes según `PLAN.md`.
- Pago manual anulable con registro trazable; no borrar pagos para corregirlos.
- Aislamiento y autorización se hacen cumplir en servidor/BD, además de controles visuales.
- No implementar funcionalidades marcadas fuera del MVP como si existieran (pagos online a alumnos, WhatsApp automático, cuentas de alumnos/tutores, múltiples grupos, facturación DGI u offline de cobros).

## Entrega

Antes de corregir, reproducir el problema y agregar prueba que lo demuestre. Cambiar un alcance pequeño, validar dominio y UI pertinentes, documentar archivos, commit/base, comandos y salidas; informar qué no se verificó. No incluir datos personales reales en fixtures, logs, capturas o mensajes. Mantener trabajo ajeno y no usar comandos destructivos para limpiar árboles.

Sin autorización aplicable, no integrar, publicar ni desplegar. Un commit/compilación no demuestra que esté desplegado ni que use datos reales correctamente.

## v5 · Pieza A (19/11/2026)

`v5-diseno/src/repositorio.ts` define la interfaz de comandos y el adaptador local, por navegador y origen. La demo se siembra en la semana de primera apertura en Montevideo; no se regeneran semanas sobre datos guardados. El actor local único es `dueño`; Fase 4 lo reemplaza por la identidad autenticada. El registro de WhatsApp indica la opción preparada, no confirma un envío. Pieza A solo dejó el formato de `Pago`; Pieza B lo usa sin cambiar la versión guardada.

## v5 · Pieza B (20/11/2026)

`v5-diseno/src/cobros.ts` deriva vencimientos y KPIs de los alumnos demo y de los pagos activos. Registrar congela monto, fecha local y actor; anular conserva el original y agrega fecha, actor y motivo. Si el navegador no permite persistir, la UI no confirma la operación. La campana usa el umbral de 7 días por defecto; la función admite 10 o solo hoy. Convención demo: `periodo` es el mes del último día cubierto; Cobros muestra el mes actual, próximos avisos e historial de pagos, no calcula arrastre de deuda ni el reinicio por primera clase tras pagar vencido. El actor local `dueño` no equivale a identidad autenticada. Sin procesador ni datos personales reales.

Rediseño pedido por Nico: toda la fila abre el panel, sin botones repetidos; historial al lado del mes; paneles de registro, anulación y campana con componentes y tokens v5, sin cambios globales. Capturas de la revisión en `v5-diseno/v5-cobros-b-*.png`.

## v5 · Publicación de A y B (20/11/2026)

Autorización de Nico (20/11 04:43, vía Roma): integrar y publicar A y B en
`master` para probar desde el móvil por GitHub Pages (sin la Wi-Fi del PC).

- Merge fast-forward de `feat/v5-persistencia` (adf940b7, 07fa8692, 9afb64eb)
  sobre master `d1f7fea0`, en worktree propio; `serve.mjs`/8797 intactos.
- `docs/` regenerado desde `v5-diseno/`: CSS/HTML copiados y todo TS transpilado
  a JS estático con `ts.transpileModule` (imports `.ts` → `.js`), porque Pages
  no transpila en vivo. Cache-bust `?v=202611200145` en los cuatro assets.
- Verificación: `npm run typecheck` 0 errores, `npm test` 63/63,
  `git diff --check` limpio, HTTP 200 local y público, y el HTML público con el
  cache-bust nuevo. Procedimiento completo en `v5/PLAN.md` §7.3.
- Nico quiere verlo y probarlo en el celular: la URL pública es
  `https://nicodelos24.github.io/Xime-clases/`.
