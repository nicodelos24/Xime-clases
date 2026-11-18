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
