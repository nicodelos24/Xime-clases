# 05 · Estados, copy es-UY y accesibilidad

**Fina · 16/11/2026.** Aplica a `02`, `03` y `04`. Especificación, no verificación: contraste de la Agenda medido sobre las capturas (ver 04 §1); lo demás requiere prueba sobre el candidato real (Chrome 320/360/390, claro/oscuro, 200 % de texto, VoiceOver/TalkBack, teléfono físico), todavía **no hecha**.

## 1. Estados por pantalla

Cada pantalla tiene los cuatro: **vacío, cargando, error y sin conexión**. En listas con secciones (Hoy, Cobros) cada sección falla o carga por separado.

| Pantalla | Vacío | Cargando | Error recuperable | Sin conexión |
|---|---|---|---|---|
| Hoy | «Todavía no hay alumnos» → [Agregar alumno]; «Hoy no hay alumnos agendados» → [Agendar]; Por vencer: «Nadie por vencer en estos días» | Skeleton por bloque; los números no se muestran como 0 | «No pudimos cargar los vencimientos» → [Reintentar] en esa sección | Banner fechado «Sin conexión · datos del DD/MM HH:mm»; cobrar y agendar deshabilitados con explicación |
| Alumnos | «Agregá tu primer alumno»; filtro sin coincidencias: «No hay alumnos Mensuales» ; búsqueda: «No encontramos alumnos para “…”» → [Borrar búsqueda] | Skeleton de filas, búsqueda y filtro conservados | «No pudimos cargar los alumnos» → [Reintentar] | Última lista fechada; sin altas ni ediciones |
| Alta | Campos con etiqueta visible; sin tarifa: «Configurá la tarifa antes de cobrar» → Más | «Guardando…» | Error junto al campo; foco al primero; datos conservados | Guardar deshabilitado + «Necesitás internet para guardar» |
| Ficha | Sin pagos: «Todavía no registraste pagos»; sin clases: «Todavía no hay clases realizadas»; sin teléfono: [Agregar teléfono] | Skeleton de estado y fechas; nunca flash de «Sin mensualidad» | «No pudimos cargar la ficha» → [Reintentar] / [Volver] | Ficha previa fechada; sin cobrar, cambiar modalidad ni fijar inicio |
| Agenda (Mes/Día) | Día vacío: «No hay alumnos agendados para este día» + FAB | Skeleton de grilla / de franjas | «No pudimos cargar la agenda» → [Reintentar] | Último mes cargado fechado; «+ Agendar» deshabilitado con motivo |
| Agendar | Sin fichas: «Sin resultados. Podés crear la ficha desde Alumnos» | Lista en skeleton | Error de guardado conserva borrador (ficha elegida y hora) | Confirmar deshabilitado; sin cola |
| Cobros | «No hay mensualidades vencidas» / «No hay clases adeudadas» / «Todavía no registraste pagos» | Skeleton por pestaña | «No pudimos cargar los cobros» → [Reintentar] | Última consulta fechada; sin cobrar ni anular |
| Registrar pago | Sin alumno → buscar; sin medio → elegir; sin tarifa → Más | «Consultando precio y ciclo…» → «Registrando pago…» | Validación o conflicto («La información cambió mientras estabas operando. Revisala antes de confirmar») | [Confirmar] deshabilitado; formulario conservado |
| Comprobante | Si no hay pago confirmado no se muestra éxito | «Comprobando el pago…» | «No pudimos consultar el comprobante» → [Reintentar] sobre el mismo pago | Solo comprobantes ya confirmados |
| Anular | Motivo vacío: «Contanos por qué anulás este pago» | «Anulando…» | Si ya se anuló, mostrar el contra-registro real | Anular deshabilitado; nunca se borra el original |
| Más | Tarifa no configurada: campo sin importe supuesto | «Cargando configuración…» | Monto no entero o fecha inválida: conservar y explicar | Sin cambiar tarifas ni avisos |

Reglas: no se encolan operaciones sin conexión; éxito solo con respuesta del servidor; resultado incierto = «Estamos comprobando si se registró. No vuelvas a cargar el pago» y se reintenta la **misma** operación. Sesión vencida: «Tu sesión venció. Volvé a ingresar». Los datos previos solo se muestran con su fecha de actualización; no se afirma caché ni persistencia local.

## 2. Estados de mensualidad (siempre ícono + texto + color)

| Estado | Rol de color | Texto |
|---|---|---|
| Vigente | verde (al día) | «Vigente · vence el DD/MM · renueva el DD/MM» |
| Por vencer | ámbar | «Vence en N días · DD/MM» |
| Vence hoy | ámbar fuerte | «Vence hoy · último día cubierto DD/MM» |
| Vencida | rojo | «Vencida · venció el DD/MM» |
| Pagada, sin iniciar | azul-gris | «Pagó el DD/MM · Pendiente de primera clase» |
| Sin mensualidad | neutro | «Sin mensualidad · todavía no hay un ciclo pago» |
| Debe clases (individual) | rosa | «Debe N clases · $ X» |

Sin inicio confirmado: «Vencimiento: pendiente de inicio» y «Próxima renovación: pendiente de inicio» (nunca `00/00` ni la fecha de hoy). El estado es derivado del dominio; no hay selector manual. 23:59 → «Vence hoy», 00:00 → «Vencida», por hora de Montevideo; se refresca al volver del segundo plano.

## 3. Copy (rioplatense, voseo)

- Acción de cobro: «Registrar pago» / «Confirmar pago $ X» (no «Pagar»: la app no procesa dinero).
- Dinero: «$ 1.800», enteros; error «Ingresá un monto en pesos uruguayos, sin decimales».
- Cambio de monto: «Indicá el motivo del cambio de monto».
- Agendar: «Agendar no confirma asistencia ni toca pagos». Retirar: «Se retira solo la programación de [nombre]. No se borra su ficha ni cambia ningún pago».
- Anular: «Se registra una anulación; el pago original sigue visible».
- Modalidad: «La mensualidad sigue vigente hasta DD/MM».
- WhatsApp: «No se envía solo: lo enviás vos». La apertura queda registrada; no se afirma envío.
- Etiquetas: siempre «Mensual» y «Por clase individual» (abreviable a «Individual» en tarjetas estrechas, con nombre accesible completo). Sin «tutor», sin «grupo».

## 4. Accesibilidad (requisitos de diseño)

1. **Contraste AA** (4,5:1 texto, 3:1 componentes) en ambos temas; los pares de modalidad de la Agenda ya cumplen (04 §1). Los colores de estado de Vito deben pasar la misma medición antes de aprobarse.
2. **Objetivos táctiles ≥ 44×44 px** (preferir 48): botones, chips de filtro, celdas del Mes, tira de días, filas. A 320 px, 7×44 = 308 px: si no entran, fallback lineal del Mes en vez de achicar.
3. **Nunca solo color:** estado = ícono + texto; modalidad = forma (● / ◆) + etiqueta textual.
4. **Foco y teclado:** orden lógico, foco visible (anillo independiente del color de selección), regreso del foco al elemento que abrió una hoja o diálogo, enfocado del primer campo inválido. Gestos opcionales (swipe, long-press) siempre con alternativa en botón o menú.
5. **Texto ampliable hasta 200 %** sin recortes ni solapamientos: etiquetas de la barra completas, botones largos se apilan, hojas crecen a pantalla completa.
6. **Lector de pantalla:** cada fila y bloque con nombre accesible completo (p. ej. «Editar programación de Bruno S., lunes 16 de noviembre, 16:00, Mensual»); los marcadores del Mes no se leen como color sino en la etiqueta de la fecha («2 alumnos programados, mensual e individual»).
7. **Movimiento:** 150–350 ms, entradas escalonadas ≤ 4 px de desplazamiento, festejo de pago de 700 ms máx.; con «reducir movimiento» todo es instantáneo y sin confeti.
8. **Acciones irreversibles** (anular pago, terminar mensualidad hoy, retirar programación, cancelar clase) tienen texto de consecuencia, motivo cuando afecta dinero, botón de peligro distinto del de confirmar cobro y siempre «Cancelar» visible.
9. **Íconos:** SVG con etiqueta, sin emojis (las capturas usan íconos de la v1 en la barra, que se reemplazan por la familia de Vito sin cambiar posición ni tamaño).

## 5. No verificado

Estados reales en pantalla, lector de pantalla, teléfono físico, contraste de los colores de estado de Vito (en definición), comportamiento sin conexión, y cualquier prueba con una dueña. Nada acá equivale a aprobación de Nico, QA de Gino ni validación de usuaria.
