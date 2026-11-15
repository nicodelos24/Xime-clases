# 02 · Wireframes low-fi · móvil 360×780 (contenido desplazable)

Los recuadros son jerarquía y texto, **no** layout pixel-perfect. Datos de ejemplo sintéticos: Ana Pérez, Lucía Silva; números ficticios sin teléfono real. Convención: `[acción]` botón táctil ≥48 px, `◉` estado con ícono+texto+color semántico (Vito definirá paleta). Las fechas son salidas de ejemplo de PLAN §3.5; no son cálculos de UI. Pie común: `Hoy  Alumnos  Asistencia  Cobros  Más` y `+ Pago` donde no tape acciones. La barra inferior deja margen seguro de iOS/Android; se oculta con teclado/modal. Botones largos se apilan y hojas crecen a pantalla completa con texto ampliado; no se recortan para entrar en el ASCII. En cada pantalla el encabezado tiene botón «Volver» y título, salvo tabs raíz.

## W1 · Hoy (cargado, con lista visible)

```text
┌──────────────────────────────────────┐
│ Hoy                    [Notificaciones]│
│ Domingo 15 de noviembre · Montevideo │
│ [Cobrado hoy $…]  [Clases de hoy 2]  │
│ [Por vencer 3]    [Vencidas 1]       │
│ [Clases adeudadas 2]                 │
│                                      │
│ Por vencer (7 días)    [Ver todas →] │
│ ◷ Por vencer · Ana Pérez             │
│ Vence el 17/11 · Renueva el 18/11    │
│ [Ver ficha] [Avisar por WhatsApp]    │
│ ◷ Vence hoy · Lucía Silva             │
│ Vence el 15/11 · Renueva el 16/11    │
│ [Ver ficha] [Avisar por WhatsApp]    │
│                                      │
│ Clases de hoy                        │
│ 18:00 Danza        [Pasar lista →]  │
│                         [+ Pago]     │
│ Hoy Alumnos Asistencia Cobros Más    │
└──────────────────────────────────────┘
```
**Tocar número** abre lista filtrada; no esconder lista Por vencer detrás del número. Si el dominio devuelve inicio ancla recortado, mostrar dos fechas devueltas, sin reconstruirlas acá.

## W2 · Alumnos (búsqueda)

```text
┌──────────────────────────────────────┐
│ Alumnos                  [+ Alumno]  │
│ [Buscar por nombre                 ] │
│ [Todos] [Mensualidad] [Clase suelta]│
│ Ana Pérez                         > │
│ ◉ Por vencer · vence 17/11           │
│ Próxima renovación: 18/11            │
│ Lucía Silva                       > │
│ ◉ Clase suelta · 1 clase adeudada     │
│                         [+ Pago]     │
│ Hoy Alumnos Asistencia Cobros Más    │
└──────────────────────────────────────┘
```

## W3 · Alta (formulario / variante mensualidad)

```text
┌──────────────────────────────────────┐
│ ← Nuevo alumno                       │
│ Nombre * [                         ] │
│ Apellido * [                       ] │
│ Teléfono  [                       ]  │
│ Modalidad [Mensualidad] [Clase suelta]│
│ Tarifa mensual vigente: $… UYU       │
│ [i] El ciclo empieza en la primera  │
│     clase posterior al pago.         │
│ Inicio: pendiente de primera clase  │
│ Si hay estimación de horario:       │
│ 12/04 (previsto, sujeto al inicio)   │
│ Vencimiento: aún sin confirmar      │
│ [Fijar fecha de inicio a mano]       │
│ [Guardar alumno]                     │
└──────────────────────────────────────┘
```
Variante clase suelta: no vista de ciclo; texto «Se cobra al marcar presente». Tras guardar mensualidad, ficha con «Sin mensualidad» y CTA «Cobrar mensualidad». Sin horario: «Pendiente de primera clase» y acceso a fecha manual (Q1). Una vez confirmado inicio 12/04: vence 11/05, próxima renovación 12/05. Guardar alta no registra un pago.

## W4 · Asistencia (lista de clase)

```text
┌──────────────────────────────────────┐
│ ← Asistencia           [Fecha 15/11] │
│ Danza · 18:00     [Cambiar clase]    │
│ 5 presentes · 1 ausente · 1 pendiente│
│ [Buscar alumno]                      │
│ Ana Pérez · ◉ Vigente                │
│ [Presente ✓] [Ausente]  Guardada      │
│ Lucía Silva · ◉ Clase suelta          │
│ [Presente] [Ausente]   Pendiente      │
│ Marcos Díaz · ◉ Vencida              │
│ [Presente] [Ausente]   Pendiente      │
│ [Cancelar clase] (confirmación)      │
│ Hoy Alumnos Asistencia Cobros Más    │
└──────────────────────────────────────┘
```
Tap presente de Lucía → W5; Marcos → W6. Tap sobre presente guardada para corregir, con vista previa del ajuste del servidor si ya cobrada (Q2); no se modifica ni elimina el pago original.

## W5 · Sugerencia tras presente de clase suelta

```text
┌──────────────────────────────────────┐
│ Lucía Silva: asistencia registrada   │
│ Clase suelta · 15/11 · Tarifa $… UYU│
│ [Cobrar clase $…]                    │
│ [Dejar adeudada]                     │
│ [Volver a la lista]                  │
└──────────────────────────────────────┘
```
La deuda se crea al marcar presente si no paga; no confundir cerrar la hoja con borrar presencia. Hasta confirmar cobro, la fila dice «Clase adeudada». Si la operación de presencia está pendiente, no ofrecer cobro todavía.

## W6 · Presente con mensualidad vencida / sin pagar

```text
┌──────────────────────────────────────┐
│ Asistencia registrada · Marcos Díaz │
│ ◉ Vencida · venció el 14/11           │
│ No se bloquea la asistencia.         │
│ [Cobrar mensualidad]                 │
│ [Cobrar clase suelta]                │
│ [Continuar sin cobrar]               │
└──────────────────────────────────────┘
```
Si elige clase suelta, se ofrece el cobro de la ocurrencia según §3.1.4. Cambiar modalidad es un flujo explícito aparte, no un efecto oculto del botón de cobro.

## W7 · Ficha de alumno (mensualidad)

```text
┌──────────────────────────────────────┐
│ ← Ana Pérez                  [Editar] │
│ ◉ Por vencer · Mensualidad           │
│ Inicio: 18/10 · Vence el 17/11      │
│ Próxima renovación: 18/11            │
│ Día ancla: 18 (si aplica)           │
│ [Renovar mensualidad]                │
│ [Avisar por WhatsApp]                │
│ [Cambiar modalidad]                  │
│ Últimos pagos     [Ver todos]        │
│ 18/10 · Mensualidad · $…     >       │
│ Asistencia       [Ver todas]         │
│ 15/11 · Presente             >       │
└──────────────────────────────────────┘
```
Variantes `Pagada, sin iniciar`: «Pagó el 10/04 · Pendiente de primera clase». Si se indica 12/04 del horario, etiquetar «Previsto, sujeto al inicio»; sin vencimiento definitivo hasta confirmar el inicio (Q1). Con inicio confirmado 12/04: vence 11/05, renueva 12/05; `Sin mensualidad`: sin fechas inventadas, CTA Cobrar. Si clase suelta, «Clase suelta», saldo de clases adeudadas y última asistencia. Cambio programado: «Clase suelta desde DD/MM», sin borrar fechas vigentes.

## W8 · Cobrar mensualidad / renovar (hoja inferior)

```text
┌──────────────────────────────────────┐
│ Registrar pago               [Cerrar]│
│ Ana Pérez · Mensualidad              │
│ Tarifa vigente: $… UYU              │
│ Monto [$…] [Motivo si se modificó]   │
│ Fecha [hoy]   Medio [Efectivo ▼]    │
│ Nota [Opcional]                      │
│ Vista previa del ciclo (dominio):    │
│ Al confirmar: nuevo inicio 12/05     │
│ Último día cubierto 11/06            │
│ Renueva el 12/06                     │
│ [Confirmar pago $…]                  │
│ «Se registra un pago manual».        │
└──────────────────────────────────────┘
```
Si vencida y se paga tarde: «Pagada, sin iniciar; próxima clase prevista DD/MM»; si no hay inicio confirmado, «Pendiente de primera clase» (Q1), no vencimiento definitivo. El monto en blanco/negativo/no entero no confirma. Botón deshabilitado durante envío, reintento conserva idempotencia.

## W9 · Cobrar clase suelta / adeudada

```text
┌──────────────────────────────────────┐
│ Registrar pago                       │
│ Lucía Silva · Clase suelta 15/11     │
│ Tarifa $… UYU · [Cambiar monto]      │
│ Fecha [hoy] · Medio [Transferencia]  │
│ [Confirmar pago $…]                  │
└──────────────────────────────────────┘
```
No aparece acción si la clase estaba ausente/cancelada/ya pagada. Si monto editado, campo Motivo obligatorio. El concepto conserva fecha de la clase.

## W10 · Cobros (bandeja)

```text
┌──────────────────────────────────────┐
│ Cobros                    [+ Pago]    │
│ [Vencidas][Por vencer][Adeudadas]    │
│ [Historial]                          │
│ [Buscar alumno]                      │
│ Ana Pérez · vence 17/11              │
│ Renueva 18/11 · ◷ Por vencer         │
│ [Renovar] [Ver ficha]                │
│ Lucía Silva · clase 12/11            │
│ ◉ Clase adeudada [Cobrar]             │
│ Hoy Alumnos Asistencia Cobros Más    │
└──────────────────────────────────────┘
```
Cada pestaña tiene encabezado y contador; Vencidas/Por vencer usan fecha del dominio. Historial muestra pago + anulación visible, con filtros período/medio.

## W11 · Cambio de modalidad (hoja de confirmación)

```text
┌──────────────────────────────────────┐
│ Cambiar modalidad · Ana Pérez        │
│ De Mensualidad → Clase suelta        │
│ La mensualidad sigue cubierta hasta │
│ el 17/11. Clase suelta desde 18/11.  │
│ El pago anterior permanece.          │
│ [Confirmar cambio] [Cancelar]        │
│ [Terminar mensualidad hoy]           │
└──────────────────────────────────────┘
```
Inversa: «De Clase suelta → Mensualidad. Lo ya pagado por clase no se reembolsa automáticamente. [Continuar a cobrar mensualidad]». Terminar hoy abre **otra confirmación** con motivo obligatorio y advertencia de no devolución automática (Q3). Mostrar la fecha efectiva que devuelva el dominio; no asumir que termina mañana.

## W12 · WhatsApp (editor antes de salir)

```text
┌──────────────────────────────────────┐
│ Avisar a Ana Pérez por WhatsApp      │
│ Destino: teléfono cargado [Editar]   │
│ Mensaje [Hola, Ana. Tu mensualidad   │
│ vence el 17/11. Si ya pagaste,       │
│ avisame. Gracias.]                   │
│ [Abrir WhatsApp] [Cancelar]          │
│ Aviso manual: podés revisar y editar│
│ el mensaje antes de enviarlo.        │
└──────────────────────────────────────┘
```
La app **abre** WhatsApp; no afirma envío. Si falta teléfono, mostrar «Agregá teléfono en la ficha» con acción Editar. No mostrar número en notificaciones push.

## W13 · Confirmación de pago / comprobante

```text
┌──────────────────────────────────────┐
│ ✓ Pago registrado                    │
│ Ana Pérez · Mensualidad              │
│ $… UYU · 15/11/2026                 │
│ Efectivo · registrado por Dueño A    │
│ Ciclo: 18/11 → 17/12                │
│ Renueva el 18/12                     │
│ Comprobante interno (no factura DGI)│
│ [Ver ficha] [Cerrar]                 │
└──────────────────────────────────────┘
```
Si pago clase suelta, mostrar fecha de clase, no ciclo. No cerrar hasta que el servidor confirme. No mostrar confirmación optimista.

## W14 · Anulación de pago (impacto explícito)

```text
┌──────────────────────────────────────┐
│ Anular pago de Ana Pérez             │
│ Mensualidad · $… · 15/11             │
│ El pago original seguirá visible.    │
│ Este ciclo quedará sin efecto.        │
│ No se devuelve dinero automáticamente│
│ Motivo de anulación * [           ]  │
│ [Anular pago] [Conservar pago]        │
└──────────────────────────────────────┘
```
Si el impacto es incierto, no confirmar: cargar primero la vista previa del servidor. Acción destructiva separada del cobro habitual. Luego detalle con pago y contra-registro, usuario y fecha.

## Variantes obligatorias (ver matriz de 03)

- W1 sin alumnos: «Todavía no hay alumnos. [Agregar alumno]»; sin clases hoy: «No hay clases hoy. [Ver horario]»; cero vencimientos: «Nadie por vencer en los próximos 7 días» (no confundir con cero deuda); cero deudas: «No hay pagos pendientes».
- W2 sin resultados de búsqueda: «No encontramos alumnos para “…” [Borrar búsqueda]».
- W4 sin clase: «No hay clases programadas para esta fecha [Ver horario]». Sin conexión: botón de marcar inhabilitado, última lista cacheada si existe con sello «Datos no actualizados» (sin asumir cache disponible).
- W8/W9 cargando: skeleton en vista previa y botón «Cargando…» deshabilitado; error/offline: conservar formulario, no mostrar comprobante, reintentar misma operación; incertidumbre: consultar servidor antes de repetir.
- W12 si no se pudo abrir el enlace externo: ofrecer «Copiar mensaje» o reintentar; no afirmar que se detectó la app instalada ni marcar como enviado.
- W10 historial vacío: «Todavía no registraste pagos»; error: «No pudimos cargar los cobros» y «Reintentar».
