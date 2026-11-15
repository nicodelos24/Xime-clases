# 01 · Mapa de navegación y flujos

Fuente: PLAN.md v2 §3, §4, §7, §8 (15/11/2026). Alcance: dos dueños nominales, adultos, un instituto/uno solo grupo invisible, UYU, America/Montevideo. Las pantallas no calculan ciclos ni precios: consultan el dominio. Los casos sin regla cerrada están en README Q1–Q5 y **no** se implementan por inferencia.

## Mapa

```text
Login (cuenta nominal; 2FA) → instituto del piloto (sin selector adicional)
└── Hoy [tab]
    ├── Tarjeta Cobrado hoy → Cobros > Historial [hoy]
    ├── Tarjeta Por vencer → Cobros > Por vencer [N configurado]
    ├── Lista Por vencer → Ficha alumno > Avisar WhatsApp / Cobrar
    ├── Tarjeta Vencidas → Cobros > Vencidas
    ├── Tarjeta Clases adeudadas → Cobros > Clases adeudadas
    └── Clases del día → Asistencia [clase]
└── Alumnos [tab] → Buscar/filtrar → Ficha → Historial/Asistencia
    ├── + Alumno → Alta → Cobro mensualidad (opcional según modalidad)
    ├── Cambiar modalidad → Confirmación → (si mensualidad) Cobro
    └── Avisar por WhatsApp (edición previa)
└── Asistencia [tab] → Elegir clase/fecha → Lista → Marcar presente/ausente
    ├── Clase suelta → Cobrar clase / Dejar adeudada
    └── Mensualidad vencida o sin pagar → Cobrar mensualidad / Cobrar clase suelta / Continuar
└── Cobros [tab] → Vencidas | Por vencer | Clases adeudadas | Historial
    ├── Cobrar desde fila → Confirmar pago → Comprobante interno
    └── Historial → Detalle pago → Anular (motivo + confirmación)
└── Más [tab] → Horario/clases (incl. cancelar clase) | Reportes/CSV | Ajustes
    └── Ajustes → Tarifas (mensualidad/clase suelta + vigencia) | Días de aviso (7 por defecto / 10 / Vence hoy según §3.4) | Cuentas (2 dueños)
Acción contextual «+ Pago» → Buscar alumno → Elegir concepto válido → Confirmar pago
```

No hay navegación de grupos, menores/tutores, recepcionistas, profesores, portal de alumno, pago online ni suscripción SaaS. La barra inferior se esconde con teclado y en confirmaciones; salida siempre visible arriba. Foco regresa al elemento que abrió una hoja.

## F1 · Alta de alumno

1. **Alumnos → + Alumno.** Nombre y apellido (obligatorios); teléfono (opcional, propuesta UX); modalidad «Mensualidad» o «Clase suelta». No se piden datos de tutor.
2. Mostrar tarifa vigente en UYU; para mensualidad, explicar «Si registrás el pago ahora, el ciclo comienza en su primera clase posterior al pago. Podés fijar la fecha de inicio a mano». Una fecha de horario es solo estimación: «Previsto, sujeto al inicio». Si no hay inicio confirmado, no hay vencimiento definitivo (Q1). Para clase suelta: «Se cobra al marcar presente».
3. Guardar alumno → ficha. Si mensualidad, acción visible «Cobrar mensualidad». El alta **no equivale** a un pago; si se abandona, ficha «Sin mensualidad».
4. En cobro, monto predeterminado de Tarifas; si cambia, requiere motivo. Medio efectivo/transferencia/otro, fecha, nota opcional. Confirmar → comprobante interno (no DGI), estado *Pagada, sin iniciar* hasta la primera clase o inicio manual confirmado. Mostrar «Pendiente de primera clase» si aún no tiene fecha definitiva (Q1). Registrar usuario.

## F2 · Pasar lista

1. **Hoy → Clase del día** o **Asistencia → elegir clase/fecha**. Lista con nombre, modalidad/estado, acción «Presente»/«Ausente» de 48 px y estado de guardado por fila.
2. Marcar presente: mensualidad vigente → «Presente» confirmado; *Por vencer* o *Vence hoy* se muestra vencimiento, no se cobra automáticamente. Mensualidad vencida o sin pagar → aviso «No tiene mensualidad vigente» y opciones «Cobrar mensualidad», «Cobrar clase suelta» o «Continuar»; no bloquea asistencia. Si cambia de modalidad, usar F5.
3. Clase suelta → propuesta «Cobrar clase $X» (F4) o «Dejar adeudada»; si adeudada, fila marca «Clase adeudada» y aparece en Cobros.
4. Ausente no cobra; clase cancelada por instituto no cobra. Cambiar una asistencia ya cobrada requiere vista previa del ajuste auditado (no elimina pago); el impacto concreto lo devuelve el servidor, pendiente Q2.
5. Sin conexión: no se marca como guardada ni se pone en cola en MVP. «Necesitás conexión para guardar la asistencia». Si la petición queda incierta, recargar la fila desde servidor antes de reintentar.

## F3 · Cobrar mensualidad

Desde ficha, «+ Pago» o sugerencia de Asistencia/Por vencer/Vencidas. Buscar/seleccionar alumno → confirmar concepto «Mensualidad» y monto precargado. Mostrar **fecha de pago elegida** (hoy por defecto), fecha de inicio confirmada o prevista debidamente etiquetada, «vence el DD/MM» y «renueva el DD/MM» del dominio. Si paga hasta su último día cubierto inclusive, nuevo ciclo comienza al día siguiente de ese límite, sin esperar clase; si paga después del vencimiento, queda *Pagada, sin iniciar* hasta la próxima clase (o fecha manual). Cambiar monto exige motivo. Elegir medio/fecha, confirmar una sola vez; bloquear botón mientras se espera, misma clave idempotente en reintento. Comprobante interno muestra monto, fecha, medio, concepto, ciclo y usuario. Si el inicio no está confirmado, mostrar «Pendiente de primera clase», no fechas definitivas del horario (Q1). Ya renovada: no ofrecer varios meses juntos; mostrar solo operaciones válidas devueltas por servidor (Q5). Si el precio aún no está configurado: «Configurá la tarifa antes de cobrar», acceso a Ajustes; no usar cero como precio predeterminado.

## F4 · Cobrar clase suelta

Desde presencia recién marcada (acción principal) o Cobros > Clases adeudadas. Concepto «Clase suelta · DD/MM» y monto y vigencia devueltos por Tarifas para la operación (la UI no elige la política de precio retroactivo); cambio de monto exige motivo. Confirmar pago manual y comprobante; al salir, asistencia queda «Presente · pagada». Si no paga, «Dejar adeudada» mantiene presencia y agrega la deuda. Ausente o clase cancelada: sin cobro. No cobrar dos veces por el mismo concepto/ocurrencia.

## F5 · Cambiar modalidad

Ficha → «Cambiar modalidad» → explicar efecto antes de confirmar → motivo de cambio opcional si no implica cortar ciclo (historial guarda quién/cuándo/de→a).
- **Clase suelta → mensualidad:** mostrar clases pagadas anteriores «No se reembolsan automáticamente»; abrir F3 para revisar cambio y cobro; confirmar solo con éxito del servidor, sin estado de modalidad parcialmente guardado por cerrar la hoja. El ciclo comienza con primera clase posterior al pago (la de hoy si está asistiendo hoy), o fecha manual. Si abandona antes de confirmar, conservar modalidad previa; no inventar deuda. Clases anteriores adeudadas: pendiente Q4; no aparece acción de condonar.
- **Mensualidad → clase suelta:** mostrar «La mensualidad sigue vigente hasta DD/MM; desde DD/MM [día siguiente] se cobra por clase». Confirmar programa el cambio; ficha presenta la modalidad actual y «Clase suelta desde DD/MM». Historial conserva pago.
- **Terminar mensualidad hoy** (acción separada, de alto impacto): requiere motivo; confirmar con «La app no devuelve dinero automáticamente». No anula pago anterior. Fecha efectiva y estado posterior sujetos a Q3, no asumir mañana ni anular pagos.

## F6 · Renovar

Ficha de alumno o Cobros > Por vencer/Vencidas → «Renovar mensualidad» → F3. Vista previa distingue «Renovación continua: comienza el DD/MM siguiente al último día cubierto» de «Vencida: comienza en la próxima clase». Día ancla original persiste en ciclos continuos, aunque febrero recorte a 28/29; vuelve al 31 en marzo. Ejemplo 31/01/2027 → último cubierto 27/02 → renueva 28/02 → renueva 31/03. Inicio manual o pago vencido pueden cambiar el ancla conforme §3.1. Nunca derivar la siguiente fecha sumando un mes al **día recortado**.

## F7 · Aviso por vencer + WhatsApp

Servidor calcula N=7 por defecto (o 10; «Vence hoy» opción definida en §3.4). Al entrar **Hoy**, lista Por vencer ordenada por último día cubierto; etiqueta «Vence hoy» el último día (zona Montevideo). Tap en fila → ficha con «vence el DD/MM» + «renueva el DD/MM». Botón «Avisar por WhatsApp» abre editor de mensaje (nunca envío automático). Dueña revisa destinatario y texto, luego «Abrir WhatsApp» abre `wa.me`; vuelve a la ficha con constancia de intento/apertura, no comprobante de envío (la apertura no acredita envío). Si no hay teléfono, botón accesible con acción «Agregar teléfono». Push a **ambos dueños** y lista en Hoy según servidor; no duplicar avisos y recuperar los pendientes tras caída (§3.4). No fingir que el alumno recibió el mensaje.

## F8 · Anular pago

Cobros > Historial > Detalle pago → «Anular» (no editar ni borrar) → motivo obligatorio → confirmación explícita «Se registra una anulación; el pago original seguirá visible. Si era una mensualidad, el ciclo queda sin efecto». Guardar → detalle con contra-registro, fecha y usuario; refrescar estado/deuda del dominio. No hay reembolso automático.

## F9 · Tarifas y horario

Más > Ajustes > Tarifas → precio mensualidad y clase suelta en UYU (enteros), fecha de vigencia, revisión antes de guardar. No alterar cobros anteriores. Más > Horario/clases → horario del **único grupo, sin selector**; lista de ocurrencias con acción «Cancelar clase» (con ajuste auditado si corresponde, Q2). Más > Reportes: total cobrado por período/medio, vencimientos, deudas y exportar CSV, solo cuentas dueñas. No mostrar la suscripción SaaS entre cobros del instituto.

## Cobertura de PLAN §3.5 (casos observables)

| Caso | En qué pantalla se comprueba |
|---|---|
| 10/04 paga, primera clase 12/04; último cubierto 11/05; aviso 04/05 (N=7) | F3 preview + ficha `Pagada, sin iniciar` → `Vigente` + Hoy/F7 |
| 31/01/2027 → 28/02 → 31/03 | F6 preview y ficha (ancla 31, no 28) |
| 31/01/2028 bisiesto → 29/02 → 31/03 | F6 preview y ficha |
| Cuatro renovaciones 31/01→28/02→31/03→30/04→31/05 | F6 historial de ciclos |
| 29/02/2028 → 29/03 → 28/02/2029 → 29/03 | F6 historial de ciclos |
| Último día 11/05; paga 05/05 | F3/F6 preview: renueva 12/05 sin esperar clase |
| Último día 11/05; paga 20/05 | F3/F6 preview: Pagada, sin iniciar → próxima clase |
| Presente de clase suelta; paga o no | F2 → F4 o Clase adeudada en Cobros |
| Doble toque Confirmar pago | F3/F4: botón bloqueado, reintento con misma clave; **servidor** idempotente |
| Anular pago | F8: original + contra-registro visibles |
| Dueño A y B | F1–F9: misma institución, autor nominal en acciones |
| 23:59 Montevideo último día → 00:00 vencida | F7/F3 chip «Vence hoy»→«Vencida», zona definida por servidor |

## Salidas y recuperación comunes a F1–F9

La matriz `03-estados-copy-a11y.md` aplica a **todos** los pasos. Cancelar antes de confirmar no registra pagos ni cambios. Error de validación conserva los datos y lleva el foco al primer campo inválido. Error de red conserva formulario, no muestra éxito; estado incierto consulta el resultado de la misma operación antes de reintentar. Confirmaciones vuelven al contexto de origen y actualizan solo con datos confirmados. Sin conexión no se encolan cambios; consulta previa solo si hay datos disponibles con fecha de actualización.

**Nota de implementación:** las fechas/estados son salidas esperadas del dominio, no valores calculados por el móvil. No se verificaron con software.
