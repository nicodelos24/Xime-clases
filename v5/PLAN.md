# Clases v5 — plan de producto (18/11/2026)

> Reemplaza a `../v4/PLAN.md` en lo visual y de funcionamiento. La v4 queda commiteada como referencia (respaldo: rama `backup/v4-antes-rediseño-20261118`, tag `backup-v4-20261118`). Este plan lo escribe Roma (orquestador) con la decisión de Nico del 18/11.

## 1. Qué cambia contra v4

**Se conserva (no se toca):**
1. **Diseño visual v5 — FIJO.** Aprobado por Nico el 18/11 ("Está perfecto el diseño visual, quiero que sea exactamente así"). Propuesta en `v5-diseno/` (tokens, pantallas, animaciones 150/220/320 ms, AA verificado). No se rediseña nada.
2. **Modelo de dos clases grupales semanales** (propuesta v5): sin marca por alumno, un botón por clase.
3. **Reglas de negocio v1 §3** de la v4 (UYU/Montevideo, ciclo de mensualidad, día ancla, avisos N=7/10/hoy, pagos anulables, 2 dueños, un grupo, alumnos adultos) — salvo lo que este plan cambia abajo.
4. **Stack**: Expo + React Native + TypeScript + Reanimated/Moti, estructura modular, portación de `v2/packages/dominio|datos` con tests.

**Se cambia (funcionamiento — encargo de Nico 18/11):**

| v4 (dejar de hacer) | v5 (hacer) |
|---|---|
| Marcar "Dada" a mano por alumno/clase | **Auto-marcado**: cada clase se marca "dada" sola al pasar su fecha y hora asignada (cron/timer local, re-alineado al abrir la app). El dueño no toca nada para registrar asistencia. |
| Botón "Marcar dada" como acción manual | **"Cancelar clase"**: la única acción manual sobre una clase es cancelarla. |
| Aviso solo con WhatsApp por alumno de mensualidad vencida | **WhatsApp desde la cancelación**: al cancelar una clase, opción "Enviar WhatsApp a los alumnos de la clase de hoy" (masivo) con **texto editable**, y opción de envío **individual**. |

## 2. Nuevas reglas de funcionamiento

### 2.1 Estado de clase

- **Programada** → (hora pasada) → **Dada** (automática) → o **Cancelada** (manual).
- Cancelar estando programada: queda Cancelada (no cuenta como dada). Cancelar una ya dada (error del dueño): permite revertir a Programada con motivo.
- La clase cancelada genera el flujo de WhatsApp (abajo); no genera deuda ni prórroga (regla vigente: una falta no prorroga ni penaliza — `docs/DECISION-AGENDA-ALUMNOS.md`).
- El auto-marcado corre con el reloj del dispositivo (`America/Montevideo`); al abrir la app se reconcilian las clases entre última ejecución y ahora. Prueba de caja con reloj simulado.

### 2.2 Cancelar clase → WhatsApp

Al tocar "Cancelar clase" en cualquier vista:
1. Confirmación (deshacer disponible unos segundos).
2. Opciones: **(a)** Enviar WhatsApp a los alumnos de la clase, **(b)** Enviar individual (elegir alumnos), **(c)** No enviar ahora.
3. Texto pre-cargado y **editable** (plantilla por defecto configurable por el dueño, p. ej. "Hola, la clase de hoy se canceló. La reprogramamos.")
4. El envío **no es automático**: la app abre el canal con el mensaje listo y el dueño confirma el envío (ver §3).

### 2.3 Invariante de datos

- La clase cancelada queda registrada (fecha, hora, motivo, quién canceló, mensajes enviados sí/no) para auditoría. Nunca se borra.

## 3. WhatsApp: opciones y recomendación

**Opción A — Deep links wa.me / `whatsapp://send?phone=&text=` (RECOMENDADA para el MVP)**
- La app genera el mensaje editable y abre WhatsApp con los destinatarios precargados. El dueño confirma y envía.
- **Pros**: gratis (0 costo, 0 cuenta Meta, 0 verificación), privado (los números no salen de la app salvo el deep link), cumple la regla vigente de "botón manual con mensaje editable" (`Clases-Zaira.md`), funciona hoy, sin dependencia externa.
- **Contras**: no es 100% automático (el dueño aprieta enviar por cada uno o pega en el grupo), no sirve para reenviar sin que el dueño toque WhatsApp. "Masivo" = abrir con los alumnos del día (ideal: un grupo de WhatsApp ya creado por el dueño, o envío uno por uno).
- Límite práctico: los alumnos del grupo del piloto caben en una conversación; para el caso real de "enviar a todos los alumnos de hoy" conviene que el dueño tenga un grupo por clase.

**Opción B — WhatsApp Business Platform / API (Cloud API)**
- Cuenta Meta verificada, número oficial, plantillas aprobadas, cobro por conversación (utility≈0,008 USD; marketing más caro; verificado en USD, hay que cotizar para UYU), proveedor BSP opcional (Twilio, 360dialog…) con fee mensual.
- **Pros**: 100% automático (envío programado tras cancelar, confirmaciones de entrega), plantillas aprobadas, escala a muchos alumnos.
- **Contras**: costo real (USD/mes + por conversación), verificación de negocio en Meta (trámite con semanas), plantillas que hay que aprobar y no se editan libremente en el envío, complejidad de backend (nuevos secretos, webhooks, auditoría de envíos), dependencia de terceros. La clienta es un instituto chico: el volumen no justifica el costo.
- **Dónde aplica**: fase de piloto/escala si el dueño pide "que salga solo", no en el MVP.

**Opción C — WhatsApp Web automatizado (web.js, Puppeteer)**
- **No viable**: automatizar WhatsApp Web viola los términos de servicio de Meta (riesgo de bloqueo del número del instituto). Descartada por riesgo operativo.

**Recomendación**: **Opción A en el MVP** (gratis, hoy, cumple la regla vigente de mensaje editable). Dejar la Opción B especificada como fase futura (§4 Fase 5b) para que Nico decida si la quiere. Pregunta concreta para Nico (una sola): **¿te sirve el envío manual con mensaje precargado (gratis, lo confirmás vos), o querés que el mensaje salga solo aunque tenga costo (API oficial, fase futura)?**

## 4. Fases

| # | Fase | Quién | Entrega | Sale cuando… |
|---|---|---|---|---|
| 1 | Dirección visual v4 | Vito | (CERRADA en v4) | — |
| 1b | **Rediseño v5** | Roma + Vito | Propuesta en `v5-diseno/`, verificada en Chrome, aprobada por Nico | **Aprobada 18/11 — FIJA** |
| 2 | Cimiento modular | Reina | (CERRADA en v4: `c8828121`, Gino APPROVED) | — |
| 3 | **Reescritura v5** | Reina + Vito | Sobre `v5-diseno/`: modelo de clase, auto-marcado por hora, Cancelar clase, flujo WhatsApp (A). Diseño intocado. | Gino QA + visto de Nico |
| 4 | Datos y seguridad | Ada + Emma + Reina | Firebase/Supabase (comparar al llegar), login 2 dueños, aislamiento, auditoría de cancelaciones/envíos | Gino: aislamiento, fechas, anulaciones |
| 5 | Piloto | Zaira + Gino | Builds de prueba, backups | 1–2 ciclos mensuales sin diferencias |
| 5b | (opcional) **WhatsApp automático** | Zaira + Reina | Cloud API: cuenta Meta, plantillas, envío programado tras cancelación | Solo si Nico decide que salga solo (§3) |

## 5. Riesgos

- **Auto-marcado con reloj incorrecto**: mitigado con re-alineación al abrir + tests con reloj simulado; la clase nunca se marca dada antes de su hora.
- **WhatsApp automático (fase 5b)**: costo y trámite de Meta; por eso no va al MVP.
- **Que el dueño se sienta a escribir menos**: el criterio de éxito es "abrir la app, ver quién viene, cancelar si hace falta, mandar un mensaje y cerrar" — sin registrar asistencia.
- **Que la estética se mueva**: invariante v5 — cualquier cambio funcional usa los tokens y animaciones de `v5-diseno/`; Gino verifica el contraste AA y las animaciones en cada entrega.

## 6. Estado de partida

- Respaldo v4: rama `backup/v4-antes-rediseño-20261118` + tag `backup-v4-20261118` (master `5326ac23`).
- `v5-diseno/` es el diseño aprobado y vivo (localhost:8797 o túnel `ximeclasesv5.loca.lt`).
- La Fase 3 arranca con la decisión de Nico sobre WhatsApp (§3) — todo lo demás (modelo de clase, auto-marcado, Cancelar clase, estética) no depende de esa decisión y puede arrancar ya.

## 7. Piezas A y B — prototipo persistente (A 19/11, B 20/11/2026)

> Implementadas en `v5-diseno/`, integradas en master y publicadas en GitHub Pages.
> No cambian el diseño visual aprobado ni las reglas de negocio v1 §3; son el
> cimiento local del funcionamiento de la Fase 3 (la app real sigue en Fase 4).

### 7.1 Pieza A · persistencia local y auditoría

- `src/repositorio.ts`: interfaz de comandos sobre clases y pagos; adaptador
  `localStorage` por origen (`almacenLocalStorage`), con caída a memoria si el
  navegador no permite guardar. Formato de `Pago` reservado sin uso en A.
- Los datos demo se siembran una sola vez, anclados a la semana de la primera
  apertura en `America/Montevideo`; no se regeneran sobre datos guardados.
- Actor local único `dueño` (Fase 4 lo reemplaza por identidad autenticada).
- Cancelar/reprogramar/registrar WhatsApp quedan en la auditoría; registrar un
  mensaje dice qué opción se preparó, nunca que el envío se concretó.

### 7.2 Pieza B · Cobros y contrato de Pago

- `src/cobros.ts` deriva vencimientos, avisos y KPIs de los alumnos y los pagos
  activos; no hay deuda acumulada ni cálculo de arrastre en el prototipo.
- **Contrato `Pago`** (en `src/cobros.ts`): `{ id, alumnoId, periodo (AAAA-MM),
  montoUYU (entero positivo), fecha (AAAA-MM-DD local), quien, anulado }`.
  `registrarPago` valida y congela monto/fecha/actor, y rechaza duplicar el par
  alumno-período entre pagos activos. `anularPago` conserva el original y
  agrega `{ fecha, motivo, quien }`; ningún pago se borra. Si no se puede
  persistir, la UI no confirma la operación.
- **Convención demo — `periodo` = mes del último día cubierto** (coherente con
  `PLAN.md` §3.1 / ciclo day-anchor: inicio 17/04 → último día cubierto 16/05 →
  `periodo` 2026-05). Cobros muestra el mes actual, próximos avisos (umbral 7
  días, configurable a 10 o solo hoy) e historial. No calcula reinicio de ciclo
  ni prórroga por primera clase tras pagar vencido.
- Nico pidió (20/11)filas de Cobros que abren el panel completas, sin botón
  repetido, con historial al lado del mes y paneles de registro/anulación y
  campana con tokens v5. Capturas: `v5-diseno/v5-cobros-b-*.png`.

### 7.3 Procedimiento de publicación (Pages, master:/docs)

1. Integrar la rama de trabajo en master con merge fast-forward (nunca pelear
   con cambios ajenos ni tocar `serve.mjs`/puerto 8797, que es de otro agente).
2. En `v5-diseno/`: `npm install --offline` si falta `node_modules`,
   `npm run typecheck` y `npm test` (63 tests, 0 fallos).
3. Copiar `index.html`, `propuesta.css`, `tokens.css`, `icons.js` a `docs/`.
4. Transpilar cada `src/*.ts` y `propuesta.ts` a `.js` en `docs/` con
   `ts.transpileModule` del TypeScript del proyecto (mismas opciones que
   `serve.mjs`: ES2023, ESNext, Bundler, `isolatedModules`), reemplazando los
   imports relativos `.ts` por `.js`. GitHub Pages sirve JS estático: no puede
   servir la transpilación en vivo ni módulos `.ts`.
5. Reemplazar en `docs/index.html` Cache-Busting `?v=AAAAMMDDHHMM` de todos los
   assets (tokens.css, propuesta.css, icons.js, propuesta.js) por el instante
   de la publicación. En `v5-diseno/index.html` se actualiza el mismo valor
   (segue sirviendo `propuesta.ts`).
6. Verificar `git diff --check`, HTTP 200 local, commit y push a origin/master.
7. Confirmar `https://nicodelos24.github.io/Xime-clases/` HTTP 200 con el
   `?v=` nuevo en el HTML público antes de avisar que está listo.

### 7.4 Pieza C · alta y edición de fichas de Alumnos

> Implementada en `v5-diseno/`, sobre la base publicada `dc951032`. No cambia
> el diseño visual aprobado ni las reglas de negocio: solo permite cargar y
> corregir fichas sintéticas desde la vista Alumnos y preserva lo guardado.

- **UI**: «Nuevo alumno» en el encabezado y ficha táctil al tocar una fila, con
  los mismos paneles/tokens v5 de Cobros (`sheet.cobros-panel`). Campos: nombre
  (obligatorio, 2–80 caracteres, letras/acentos/apóstrofos/guiones), modalidad
  (Mensual/Individual), grupo existente (selección de los 5 de la demo) y
  contacto **opcional y apagado por defecto** (contrato v1: tutor queda como
  campo opcional no habilitado). Sin borrar fichas, sin cambiar chips, sin
  envíos. La lista sale del repositorio: búsqueda/filtros/orden se mantienen,
  el conteo se calcula y hay estado vacío claro.
- **Contrato `AlumnoFicha`** (`src/alumnos.ts`): `{ id, nombre, modalidad,
  grupo, ancla, fechaAlta, activo, color, contacto }`. ID estable con prefijo
  `al-` (generado, nunca derivado del nombre); `fechaAlta` y `activo` se
  congelan al dar de alta; editar conserva ID/alta/activo/color. Ancla por
  default 21; `validarAlumno` rechaza grupos inventados y contactos >120.
- **Repositorio v2** (`src/repositorio.ts`): `VERSION_ESTADO` 1→2 con
  **migración en lectura**: un estado v1 se lee conservando `clases` y `pagos`
  tal cual (incluidas anulaciones y agenda histórica) y se le agrega `alumnos`
  sembrados; nunca se resembra sobre datos guardados. Altas/ediciones persisten
  antes de confirmar; si falla `storage`, la UI no confirma.
- **Identidad por ID, nunca por nombre**: `fichasDemo` usa los mismos IDs que
  `alumnosCobrosDemo` (`a0`…`a11`, `b8`), así los pagos de A/B siguen
  vinculados. Cobros resuelve el nombre **vigente** desde la ficha por ID
  (`alumnosParaCobros`/`nombrePago`). Un alumno nuevo no entra en la tarifa de
  Cobros: el alta **no crea cargos**. Vencimientos de la vista Alumnos se
  derivan de Cobros (no se editan a mano).
- **Verificación**: `npm run typecheck` 0 errores, `npm test` 79/79 (era 63),
  `git diff --check` limpio, alta/edición/validación/persistencia F5 y
  coherencia Cobros por ID comprobadas en Chrome 390 px, 0 errores de consola.
  Capturas: `v5-diseno/v5-alumnos-c.png`, `v5-diseno/v5-alumnos-ficha.png`.
- **Corrección post-revisión (Roma, 20/11)**: dos regresiones detectadas en Pages
  y corregidas antes de republicar. (1) Guardar la ficha sin tocar nada ya no
  resetea el ancla al default 21: `editarAlumno` conserva `ancla`/`contacto`
  cuando el input no los trae; los defaults se aplican SOLO al crear y la
  migración v1→v2 no inventa datos. (2) Se diferencian tres estados de cobro:
  `aldia` (sin deuda pendiente → texto «al día», punto verde, lo muestra el
  chip «Al día»), `hoy` (vence hoy → «vence hoy», punto ambar, NO lo oculta el
  chip), `vencido` («vencido», punto rosa) y `pendiente` («vence en N días»,
  punto ambar). Sin cambiar chips/diseño ni las reglas de Cobros. Cubierto con
  edición desde UI + F5 (no solo input de dominio): typecheck 0, 84/84 tests,
  0 errores de consola. Evidencia: `v5-diseno/v5-alumnos-fix-regresiones.png`.

### 7.5 Pieza D · interacciones de Agenda (20/11)

> Pedido de Nico por Telegram, task `task_1a281434abba46e0`. Sin tocar BD,
> FAB «Agendar», scroll de barra ni diseño visual: solo interacciones v5.

- **Un toque en el almanaque**: selecciona el día y muestra debajo de la leyenda
  las tarjetas v5 de ese día, ordenadas por hora, desde el repositorio vigente.
  Día sin clases = «Sin clases ese día», sin restos del anterior. El primer
  toque no se demora. `touch-action: manipulation` evita el zoom del doble
  toque en la celda sin bloquear el zoom global. Acceso explícito «Ver semana».
- **Doble toque en la MISMA fecha**: abre «Ver semana» con esa fecha activa en
  la tira y la línea, aunque esté vacía o sea límite de mes. Fechas distintas no
  cambian de vista; tras el doble se consume la secuencia. `Enter` una vez =
  seleccionar, dos veces = semana. Lógica pura en `src/agenda.ts`.
- **«Por dar» sin botón rojo**: desaparece «Cancelar clase» de las tarjetas
  programadas; el chip «Por dar» (y «Dada») abre el cuadro con Marcar dada,
  Cancelar (motivo opcional) y Cambiar de día. Nico aprobó **Marcar dada manual**
  (Opción A) con auditoría append-only (`marcada-manual` /
  `marca-manual-deshecha`), persistencia y deshacer desde el toast; «Volver a
  Por dar» revierte la marca. Abrir el cuadro no modifica el estado.
- **Verificación**: 94/94 tests (antes 84), typecheck 0 errores, `git diff
  --check` limpio. Chrome 390 px claro/oscuro, fuente y `docs/` por HTTP:
  toque simple/doble emulado, clic, teclado, día vacío, límite de mes (01/11 y
  30/11), marcar/deshacer con F5, 0 errores de consola. Capturas en
  `docs/qa/v5-agenda-*.png`. Cache-busting `?v=202611200510`.
