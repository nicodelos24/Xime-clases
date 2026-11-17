# 01 · Mapa de navegación y flujos (v2)

**Fina · 16/11/2026.** Fuente: `v2/PLAN.md` §3/§5, reglas v1 §3 y D1–D7, decisión Agenda/Alumnos (15/11 02:26) y `v2/docs/ARQUITECTURA.md`. La UI no calcula ciclos ni precios: estados, fechas y montos son salidas del dominio. Q2/Q3 sin política no se automatizan.

## Mapa

```text
Login (cuenta nominal, 2FA; fase 6) → instituto del piloto (sin selector)
└── Hoy [tab]
    ├── Tarjeta Cobrado hoy → Cobros › Historial [hoy]
    ├── Tarjeta Por vencer → Cobros › Por vencer
    ├── Lista Por vencer → Ficha → Avisar WhatsApp / Cobrar
    ├── Tarjeta Vencidas → Cobros › Vencidas
    ├── Tarjeta Clases adeudadas → Cobros › Clases adeudadas
    └── Bloque Clases de hoy → Agenda › Día [esa fecha]
└── Alumnos [tab] → Buscar + filtros/orden → Ficha
    ├── + Alumno → Alta (F1) → [si mensual] Cobrar mensualidad (F3)
    ├── Ficha → Renovar (F6) / Cambiar modalidad (F5) / WhatsApp (F7)
    └── Ficha → Marcar clase realizada (F4, si corresponde)
└── Agenda [tab]
    ├── Mes compacto (referencia agenda-mes.png) → tap fecha → Día (agenda-semana.png)
    ├── Día → tap bloque → Editar programación → Retirar (confirmación)
    └── + Agendar (FAB) → elegir ficha → confirmar (F2)
└── Cobros [tab]
    ├── Secciones: Por vencer | Vencidas | Clases adeudadas | Historial
    ├── Fila → Cobrar (F3/F4) → Confirmar → Comprobante
    └── Historial → Detalle de pago → Anular (F8)
└── Más [tab]
    ├── Tarifas (mensual / clase suelta, con vigencia) (F9)
    ├── Días de aviso (7 / 10 / Vence hoy) (F9)
    ├── Cuentas (2 dueños) — sin selector de grupos
    └── Horario de clases (consulta; cancelar clase = Q2, con confirmación y motivo)
Acción contextual «+ Pago» → buscar alumno → concepto válido → confirmar
```

Sin navegación de grupos, tutores, recepción, profesores, portal de alumno, pago online ni suscripción SaaS entre los cobros. La barra inferior se oculta con teclado y en confirmaciones; el foco vuelve al elemento que abrió cada hoja.

## Flujos

### F1 · Alta de alumno — Alumnos › + Alumno

1. Nombre y apellido obligatorios; teléfono opcional (lo pide el botón WhatsApp); modalidad «Mensualidad» o «Por clase individual». **Sin campo de tutor.**
2. Se muestra la tarifa vigente en UYU. Para mensualidad: «Si registrás el pago ahora, el ciclo comienza en su primera clase posterior al pago. Podés fijar la fecha de inicio a mano». El horario previsto se etiqueta «Previsto, sujeto al inicio» (v1 §3.1.1 / Q1).
3. Guardar → ficha. El alta no registra pago: sin pagar, la ficha queda «Sin mensualidad» (mensual) o sin deuda (individual).
4. Si la dueña fija inicio a mano, se guarda quién y cuándo (Q1) y recién entonces la ficha muestra vencimiento y renovación definitivos.

### F2 · Agendar — Agenda › + Agendar o tap en fecha vacía

1. Muestra la fecha elegida y, si ese día tiene clase existente, su hora fija; si no, pide hora (HH:mm). Sin ocurrencia no se crea clase grupal: es una programación puntual de ese alumno ese día.
2. Busca la **ficha canónica** (con filtro Todas/Mensuales/Individuales y búsqueda por nombre). Si no existe, «Podés crear la ficha desde Alumnos» → alta canónica F1; nunca una ficha paralela del calendario.
3. Selección única; si el alumno ya está programado en ese horario se muestra «ya programado» y no se duplica. Confirmar → vuelve a la vista de origen con el día actualizado.
4. **Agendar no cobra, no inicia ciclo, no acredita presencia y no genera deuda.** Retirar una programación no borra alumno ni historial ni pago (decisión 02:26, puntos 3–4).

### F3 · Marcar clase realizada — puntual, no diaria

1. Acceso: bloque del alumno en Agenda › Día y fila de la ficha. Es una acción puntual de confirmación («¿Dió la clase?»), no un «pasar lista».
2. Mensualidad vigente: queda registrada la asistencia sin cobro ni efecto en el ciclo. Si faltó, nada cambia: sin recuperos ni penalización (decisión 02:26 punto 4).
3. Mensualidad vencida o sin pagar: «No tiene mensualidad vigente» + opciones «Cobrar mensualidad» (F3b) / «Cobrar clase suelta» (F4) / «Continuar sin cobrar»; **no bloquea** (v1 §3.1.4).
4. Clase suelta: propone «Cobrar clase $X» (F4) o «Dejar adeudada». Ausencia no cobra; clase cancelada por el instituto no cobra.
5. Corregir una clase ya cobrada exige vista previa del ajuste auditado; el impacto lo define el servidor y **Q2 está pendiente**: hasta cerrarse, la corrección muestra «Este ajuste depende de una definición pendiente» y no aplica cambios automáticos.

### F3b · Cobrar mensualidad — desde ficha, «+ Pago», sugerencias o Cobros

1. Alumno y concepto «Mensualidad» confirmados; monto precargado de Tarifas; cambiarlo exige motivo.
2. Se muestra la **vista previa del ciclo que devuelve el dominio**: fecha de inicio (hoy o primera clase posterior, etiquetada), «vence el DD/MM» y «renueva el DD/MM». Pago hasta el último día cubierto → nuevo ciclo arranca al día siguiente sin esperar clase; pago vencido → «Pagada, sin iniciar» hasta la próxima clase. Ancla conservada (31/01 → 28/02 → 31/03), nunca restada.
3. Medio efectivo/transferencia/otro, fecha, nota opcional. Confirmar una sola vez: botón bloqueado mientras espera, reintento con la misma clave idempotente (la unicidad la fija el servidor).
4. Comprobante interno (no factura DGI) con monto, fecha, medio, concepto, ciclo y dueña que registró. Ya renovado el ciclo, no se ofrece un segundo cobro del mismo período (Q5).

### F4 · Cobrar clase suelta — desde clase realizada o Clases adeudadas

1. Concepto «Clase suelta · DD/MM»; monto y vigencia de Tarifas; cambio con motivo. Pago manual + comprobante; la fila queda «Presente · pagada».
2. «Dejar adeudada» mantiene la clase realizada y crea la deuda visible en Cobros.
3. No cobrar dos veces el mismo concepto/ocurrencia; una clase suelta ya pagada no se reembolsa al pasar a mensualidad (§3.2.3, Q4).

### F5 · Cambiar modalidad — ficha › Cambiar modalidad

1. Explica el efecto antes de confirmar; el historial guarda quién, cuándo y de qué a qué.
2. Individual → mensual: «Las clases sueltas ya pagadas no se reembolsan automáticamente»; abre el cobro F3b; el ciclo arranca en la primera clase posterior al pago (la de hoy si la está haciendo).
3. Mensual → individual: «La mensualidad sigue vigente hasta DD/MM; desde DD/MM se cobra por clase». El ciclo pagado no se pierde.
4. «Terminar mensualidad hoy» es acción separada de alto impacto: motivo obligatorio + «La app no devuelve dinero automáticamente» (Q3 pendiente: no se asume día efectivo ni devolución).

### F6 · Renovar — ficha o Cobros › Por vencer/Vencidas → F3b

La vista previa distingue «Renovación continua: comienza el DD/MM siguiente al último día cubierto» de «Vencida: comienza en su próxima clase». El ancla persiste en ciclos continuos; nunca se deriva la próxima fecha sumando un mes al día recortado (28 → 31).

### F7 · Aviso por vencer + WhatsApp

1. El servidor calcula el aviso N=7 (o 10, o «vence hoy») con fecha de Montevideo; push a ambos dueños y lista «Por vencer» en Hoy (A4: push en fase 6, la lista desde el MVP).
2. Fila → ficha con «vence el DD/MM» y «renueva el DD/MM» → «Avisar por WhatsApp» abre el editor con mensaje editable. La dueña lo revisa y «Abrir WhatsApp» abre `wa.me`; queda constancia de apertura, no de envío.
3. Sin teléfono: el botón ofrece «Agregar teléfono». No se afirma que el alumno recibió el mensaje.

### F8 · Anular pago — Cobros › Historial › Detalle

«Anular» (nunca editar/borrar) → motivo obligatorio → confirmación «Se registra una anulación; el pago original sigue visible. Si era una mensualidad, el ciclo queda sin efecto» → contra-registro con fecha y dueña; se refrescan ficha, Cobros y Hoy. Sin reembolso automático.

### F9 · Tarifas, avisos y cuentas — Más

Tarifas: precio de mensualidad y de clase suelta en UYU enteros con fecha de vigencia; cambiar el precio no altera pagos pasados (§3.7). Días de aviso: 7 / 10 / Vence hoy. Cuentas: las dos dueñas, mismo rol. Horario: consulta del único grupo con «Cancelar clase» con confirmación + motivo (efecto económico = Q2, pendiente).

### F10 · Cobro contextual «+ Pago»

Buscar alumno → conceptos válidos según su modalidad y estado (mensualidad si corresponde; clase suelta si tiene clase adeudada) → mismo formulario de F3b/F4. Nunca ofrece dos cobros del mismo concepto (Q5).

## Cobertura de los casos de aceptación v1 §3.5

| Caso | Se observa en |
|---|---|
| Paga 10/04, primera clase 12/04 → vence 11/05, aviso 04/05 | F3b preview + ficha «Pagada, sin iniciar» → «Vigente» + Hoy/F7 |
| 31/01/2027 → 28/02 → 31/03 (ancla, bisiesto y retorno) | F6 preview + ficha (renovaciones del dominio) |
| 29/02/2028 → 29/03 → 28/02/2029 → 29/03 | F6 historial de ciclos |
| Vence 11/05; paga 05/05 → inicia 12/05 sin esperar clase; paga 20/05 → Pagada, sin iniciar | F3b/F6 preview |
| Clase suelta: presente cobra o queda adeudada | F3/F4 + Cobros |
| Doble toque en confirmar | F3b/F4: botón bloqueado; idempotencia del servidor |
| Anular | F8: original + contra-registro visibles |
| Dueña A y B | actor nominal en comprobantes y anulaciones |
| 23:59 Montevideo → 00:00 «Vencida» | chips de estado refrescados al volver del segundo plano |

## Reglas comunes a todos los flujos

Cancelar antes de confirmar no registra nada. Error de validación conserva los datos y lleva el foco al primer campo inválido. Error de red conserva el formulario y no muestra éxito; resultado incierto se consulta antes de reintentar (sin crear un intento nuevo). Confirmaciones vuelven al contexto de origen. Los estados y textos exactos están en `05-estados-a11y-copy.md`.
