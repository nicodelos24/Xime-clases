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

## v5 · Pieza C (20/11/2026)

Alta y edición de fichas de Alumnos sobre datos sintéticos, en la rama
`feat/v5-alumnos` (base `dc951032`), con el diseño visual v5 intacto.

- `v5-diseno/src/alumnos.ts`: contrato `AlumnoFicha` (ID estable, modalidad,
  grupo existente, ancla, fecha de alta, contacto opcional), validación y
  proyección de la vista (búsqueda acento-insensible, filtros, orden).
  El contacto queda opcional y apagado: el contrato v1 no habilita tutor.
- `src/repositorio.ts`: `VERSION_ESTADO` 1→2 con migración en lectura; un
  estado v1 conserva clases, pagos y anulaciones tal cual y solo agrega
  `alumnos`. Ninguna pestaña resembra sobre datos guardados; alta/edición
  persisten antes de confirmar.
- `src/demo.ts`: `fichasDemo` reutiliza los IDs de `alumnosCobrosDemo` (`a0`…
  `b8`), así los pagos de A/B siguen vinculados por ID. Cobros resuelve el
  nombre vigente de la ficha y no crea cargos por el solo alta; los
  vencimientos de Alumnos se derivan de Cobros.
- UI: «Nuevo alumno» y ficha táctil al tocar la fila, con los paneles/tokens
  v5 de Cobros; estados vacíos claros y validación visible. Se mantuvieron
  búsqueda/filtros/orden y el conteo calculado.
- Verificado: `npm run typecheck` 0 errores, `npm test` 79/79 (era 63),
  `git diff --check` limpio; en Chrome 390 px: alta, edición, validación,
  persistencia F5 y coherencia Cobros por ID, 0 errores/warnings de consola.
  Evidencia: `v5-diseno/v5-alumnos-c.png`, `v5-diseno/v5-alumnos-ficha.png`.
  No se agregó BD, login ni datos de terceros; `serve.mjs`/8797 intactos.

Corrección post-revisión (Roma, 20/11): al editar se conservan los campos
opcionales no editados (ancla y contacto); los defaults 21/vacío se aplican
solo al crear, y la migración no inventa datos — guardar a2 sin tocar nada
mantiene su ancla 26. La vista distingue «al día» (sin deuda, punto verde, lo
muestra el chip), «vence hoy» (días=0, punto ambar, NO lo oculta el chip),
«vencido» (punto rosa) y «vence en N días» (punto ambar), con texto/punto/chip
coherentes y sin tocar las reglas de Cobros. Verificado en UI + F5 y con 84/84
tests; evidencia en `v5-diseno/v5-alumnos-fix-regresiones.png`.

Interacciones de Agenda (20/11, task `task_1a281434abba46e0`): en «Ver mes»,
un toque en una fecha muestra sus clases debajo de la leyenda sin salir del
almanaque (día vacío = «Sin clases ese día»); dos toques en la MISMA fecha
abren «Ver semana» en esa fecha, incluso sin clases o en límite de mes. Regla
pura en `src/agenda.ts` (`registrarToqueFecha`, 350 ms), con `Enter`/doble clic
y `touch-action: manipulation` para no pelear con el zoom global. Se retiró el
botón rojo «Cancelar clase»: el chip «Por dar» abre el cuadro con Marcar dada
(aprobado por Nico), Cancelar y Cambiar de día, con auditoría append-only,
deshacer y persistencia F5. Sin tocar BD, FAB ni scroll de barra. Verificado:
94/94 tests, typecheck 0, `git diff --check` limpio, Chrome 390 px claro/oscuro
y `docs/` por HTTP con 0 errores de consola; capturas en `docs/qa/v5-agenda-*.png`.
  Corrección post-revisión (Roma): el enlace «Ver mes» se convierte en botón sin
  `href` y el handler genérico de `a.link-suave` accedía a `href.slice(1)` →
  TypeError en consola. Política en `src/navegacion.ts` que ignora enlaces sin
  destino, con test de regresión (95/95 tests); 0 errores reverificados en
  fuente y `docs/`, cache-busting `?v=202611200915`.

Agendar clases (20/11, task `task_2a5b01fab0944d6e`, rama
`feat/v5-agendar-clases`): Nico pidió dos formas de agregar clase desde el
móvil y un «Cambiar de día» con fecha concreta legible. Reemplacé el toast
del FAB por «Clase semanal» / «Clase suelta»: la semanal toma nombre, días,
inicio visible (hoy por defecto), hora y duración (60 min default), con
horarios distintos como rutinas separadas; la suelta toma nombre, fecha
exacta, hora y duración. Nuevo `src/agendar.ts` con ocurrencias de rutina de
ID estable y horizonte deslizante: repiten sin duplicados ni corte fijo, y
cancelar/mover una ocurrencia no altera el resto de la serie. Regla «Dada»
unificada en `src/clases.ts`: «Por dar» hasta inicio + duración en
Montevideo (cruza medianoche), reconciliada al abrir/volver/con app abierta,
sin pisar marcas manuales, canceladas ni historial. «Cambiar de día» usa un
selector día/mes/año accesible con fecha original legible; mueve solo esa
clase conservando ID, hora, duración, participantes y auditoría
(`reprogramada`), muestra el destino aunque cruce mes y lo saca del origen
tras F5. Flechas del almanaque v5 operativas, toque/doble toque y estilo
intactos. Sin cambios al diseño v5, sin BD, sin barra inferior ni
`serve.mjs`/8797.

Segunda ronda (misma tarea, correcciones de Roma y pedido de Nico): el
horizonte de ocurrencias pasó a generarse por el rango consultado
(`generarOcurrenciasEnRango` + `repo.materializarHasta`), así un mes lejano
como febrero 2027 muestra sus clases sin duplicar ni inventar días previos
al inicio, y sin usar esa fecha como «hoy». La vuelta de segundo plano
reconcilia al instante (`visibilitychange`/`pageshow`), verificado con una
clase 23:00–00:00 que pasa a «Dada» justo en medianoche sin recargar.
`reprogramar()` hace una sola escritura obligatoria (estado + auditoría +
excepción): con cuota llena el cuadro queda abierto con error, sin falso
éxito ni cambios parciales, y origen/destino se leen con año completo.
**Riesgo de datos resuelto**: el estado se escribe como `version: 2` con
`rutinas` aditivo (el build v2 anterior descartaba v3 y resembraba la
demo), el lector acepta v1/v2/v3 sin resembrar sobre clases y hay respaldo
en `xime.v5.rutinas`; imports de `docs/src/` con cache-bust individual.
Nico además pidió flechas de mes junto al título mes+año (44×44 px,
aria-labels con el mes concreto) y «Agendar acá» desde el día elegido en
otro mes, incluso vacío, con la fecha exacta precargada; al guardar se
permanece en el mes/día destino y persiste tras F5. Verificado en Chrome
390 px claro/oscuro, fuente y `docs/`: nov→dic→ene 2027, suelta desde día
vacío de otro mes, F5, 0 errores. typecheck 0, 118/118 tests,
`git diff --check` limpio, cache-bust `?v=202611201755`, `origin/master`
revalidado en `9ca26108`.

## 23-nov · Lote de cambios de Nico (rama `feat/v5-lote-cambios`)

Lo que pidió Nico y cómo quedó (diseño v5 intacto: solo texto, un pill y una
media query ≤360px; sin BD, sin barra inferior).

1. **Clases semanales.** El auto-marcado por reloj quedó **descartado**
   (decisión de Nico, 21/11) y ya no hay código que lo haga: `reconciliar()`
   no toca estados, el repositorio solo genera ocurrencias, y la demo se
   siembra «dada» para lo ya dictado. «Dada» es siempre manual (chip «Por dar»
   → «Marcar dada», con Deshacer). Se agregó lo que faltaba de verdad: las
   rutinas configuradas se listan en el cuadro de «Clase semanal» (días, hora,
   desde) y se pueden **dar de baja**, cancelando en una sola escritura sus
   ocurrencias futuras «Por dar» y conservando dadas, canceladas y movidas
   (`repo.eliminarRutina`).
2. **Clase suelta.** Ya existía; verificado de punta a punta en Chrome (alta,
   fecha exacta, hora, persiste tras F5).
3. **Cambiar de día con fecha concreta.** La tira semanal pasó de «LU 23» a
   «LU nov / 23» y el título dice el rango real («Esta semana · 23 nov–29 nov»,
   «Semana del 7 dic–13 dic») con «Volver a hoy» cuando se mira otra semana.
   Hueco real encontrado y corregido: el «Hacia:» del cuadro de cambio solo se
   actualizaba al cambiar mes/año, no el día → se movía a ciegas.
4. **Día del mes / doble toque.** Ya funcionaba: un toque selecciona el día y
   muestra sus clases, doble toque abre la semana (verificado en nov y dic).
5. **Chip «Por dar».** Ya abría Marcar dada / Cancelar / Cambiar de día. Se
   corrigió el aviso de cancelar, que decía el estado interno «(programada)».
6. **Grupos (alcance mínimo, 1 grupo).** La ficha tiene «Grupo (opcional)» con
   sugerencias de los grupos reales (etiquetas de fichas + nombres de clases,
   sin el prefijo «Grupo »); escribir uno nuevo lo crea, repetirlo agrupa. Es
   solo una etiqueta: no crea salones ni envía nada.
7. **Avisos.** Se sacó el texto «simulación; el envío real llega con la base de
   datos» (falso: los links `wa.me` son reales y el envío lo confirma la
   dueña). La campana lista los 3 vencimientos con su link.

Verificado: `tsc` limpio, **175/175** pruebas, recorrido en Chrome local a
390 px y 320 px (rutina alta y baja, clase suelta, cambiar día, mes → semana,
chip Por dar + cancelar, grupos en ficha, avisos), 0 errores de consola. Dos
commits en `feat/v5-lote-cambios` (`34c3a229`, `f1d9f56d`). Pendiente de
publicación: el sello `?v=` y `docs/` no se tocaron; subir al vivo es un paso
aparte con aviso previo a Nova.


## 23-nov · Pista de scroll en los filtros de Alumnos a 320 px (rama `fix/v5-filtros-alumnos-320`)

Hallazgo de QA (Gino, ronda «romper y pulir»): a 320 px `#filtros-alumnos`
mide 792 px sobre 268 visibles y, con la barra de scroll oculta por diseño,
nada indicaba que hubiera más chips a la derecha. No rompe funcionalidad.

- `v5-diseno/src/scroll-pista.ts` (+ 5 tests): `pistaDeTira` decide qué borde
  insinuar según `scrollLeft/scrollWidth/clientWidth`; tolerancia de 1 px para
  sub-píxeles y rebote elástico; sin desborde real no hay pista.
- `propuesta.css`: envoltorio `.tira-filtros` con dos degradados del color del
  fondo (`--fondo-tira` por tema, claro y oscuro), `pointer-events:none`.
  Chips, orden, tamaño y radios intactos: no es un rediseño.
- `index.html`: chips dentro de `#filtros-alumnos` como estaban, envueltos con
  los dos `<span class="pista">`; `propuesta.ts` los prende al abrir Alumnos,
  al hacer scroll, en resize y al volver a la pestaña.
- `v5-diseno/build-docs.mjs`: deja en script la regeneración de `docs/` del
  §7.3 (copias + transpilado + imports con sello), para no repetirla a mano.

Verificado en Chrome: 320 px inicio → solo borde derecho; medio → los dos;
final → solo izquierdo; 390 px también desborda (338 visibles) y muestra el
derecho; oscuro toma `rgba(14,27,30,1)`. Rueda horizontal 0→524 y «Al día»
responde al final de la tira; `elementFromPoint` sobre la pista devuelve los
chips (no intercepta toques). 0 errores de consola en Hoy·Semana·Alumnos·Cobros,
`tsc` limpio, 180/180 tests. Commits `75cb9a72`. Evidencia en
`docs/qa/filtros-320-20261123/`.

**Publicado el 23-nov 11:2x** (orden de Roma, autorización general de Nico
22-nov): `npm test` 180/180 y `tsc` reconfirmados, `docs/` regenerado con
`build-docs.mjs 202611231100`, `git diff --check` limpio, merge fast-forward de
`fix/v5-filtros-alumnos-320` sobre master `ac0c3b11` → `ffb9c11a` y push a
`origin/master`. Verificado en el vivo: HTTP 200 con `?v=202611231100` en
tokens/propuesta/icons/propuesta.js y en `src/scroll-pista.js`; a 320 px la
pista derecha aparece en reposo, las dos en el medio (260) y solo la izquierda
al final (524); 0 errores de consola; sin secretos ni datos personales en lo
subido (grep de claves/teléfonos sobre el diff; los tests usan teléfonos y
nombres sintéticos).
