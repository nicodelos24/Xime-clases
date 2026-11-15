# Diseño UX — Clases (ENC-01)

**Autora:** Fina · **Fecha:** 15/11/2026 · **Estado:** propuesta para revisión de Ada y base para Vito (alta fidelidad). Cubre los entregables 1–3 de PLAN.md §4 (mapa y flujos, wireframes, estados).
No hay código ni prototipo: todo lo de acá es papel. Nada se probó con usuarias reales.

## Contenido

| Archivo | Qué trae |
|---|---|
| [`01-mapa-y-flujos.md`](01-mapa-y-flujos.md) | Mapa de navegación, reglas de presentación, los 9 flujos y la tabla de cobertura de los casos de PLAN §3.5 |
| [`02-wireframes.md`](02-wireframes.md) | 14 wireframes de baja fidelidad (ASCII, móvil 360×780) con variantes de estado |
| [`03-estados-copy-a11y.md`](03-estados-copy-a11y.md) | Catálogo de estados (vacío / cargando / error / sin conexión / confirmación), copy es-UY, accesibilidad, contrato de datos UI↔dominio |

## Principios (guían todo el resto)

1. **La UI no calcula reglas de cobro.** Fechas de ciclo, estado, ancla y precio los devuelve el dominio (`packages/dominio`, módulo Tarifas). La pantalla muestra una **vista previa** devuelta por el dominio antes de confirmar. Si el dominio no responde, no se muestra una fecha inventada.
2. **Siempre dos fechas explícitas** en cualquier lugar donde aparezca una mensualidad: «vence el DD/MM» (último día cubierto) y «renueva el DD/MM».
3. **Estado = ícono + texto + color**, nunca solo color. No hay estados editables a mano.
4. **Pago en ≤ 3 toques desde donde estés** (alumno → confirmar con monto precargado), sin teclado salvo que se cambie el monto.
5. **Sin gestos como único camino** para acciones críticas (el swipe, si existe, duplica un botón visible).
6. **Acciones irreversibles dicen su consecuencia** en la confirmación («Anular pago» deja el ciclo sin efecto).
7. **Sin conexión no hay pagos ni cambios de deuda** (PLAN §4): se muestra el motivo y «Reintentar»; nunca una falsa confirmación.
8. **Un solo grupo, adultos, dos dueños:** no hay pantallas de grupos, tutor, ni roles de recepción/profesor en el MVP. Cada acción muestra «registrado por <dueño>».

## Decisiones de diseño tomadas (propuestas por mí; Ada confirma o corrige)

| # | Decisión | Por qué |
|---|---|---|
| U1 | Navegación inferior de 5 ítems + botón flotante «+ Pago» (visible en Hoy, Alumnos, Cobros; oculto en Asistencia y en formularios) | Plan §4; evita tapar la lista de asistencia |
| U2 | «Cobros» = bandeja de trabajo (Vencidas · Por vencer · Clases adeudadas · Historial), no solo historial | Es la pregunta diaria de las dueñas: «¿a quién le cobro?» |
| U3 | El cobro es una **hoja inferior (bottom sheet)** de un solo paso con resumen + «Confirmar», no un asistente de varias pantallas | Menos toques; el concepto y el monto ya vienen sabidos desde el contexto |
| U4 | «Avisado por WhatsApp» se registra al abrir wa.me (no sabemos si lo envió); se muestra como «Aviso abierto el DD/MM» | Honesto con lo que la app sabe (PLAN §3.4) |
| U5 | Hoy tiene dos tarjetas-número que abren listas filtradas: «Por vencer» y «Vencidas» (+ «Clases adeudadas»), más la lista «Por vencer» visible directamente | Pedido de Ada §3.1 |
| U6 | Vista previa del ciclo en un componente único `CicloPreview` usado en alta, cobro, renovación y cambio de modalidad | Un solo lugar para mostrar «comienza / último día / renueva» |

## Dudas abiertas para Ada (no inventé la regla; el diseño marca la hipótesis)

| # | Duda | Hipótesis usada en los wireframes | Impacto si cambia |
|---|---|---|---|
| Q1 | «Primera clase posterior al pago»: ¿se toma la **próxima clase del horario** o la **primera asistencia registrada**? | Próxima clase del horario (el dominio la devuelve en la vista previa); la dueña puede fijar el inicio a mano | Cambia la vista previa en alta/cobro |
| Q2 | Si no hay clase futura en el horario (horario vacío o fin de año), ¿qué inicio se muestra? | «Sin clases en el horario: cargá el horario o fijá el inicio a mano»; el pago se puede registrar igual como *Pagada, sin iniciar* | Flujo F3 estado de error |
| Q3 | Mensualidad vigente y ya **renovada por adelantado**: ¿se permite pagar otra más? (D4 deja «varios meses juntos» fuera) | Se bloquea con aviso «Ya tiene la renovación pagada (renueva el DD/MM)» | Flujo F6 |
| Q4 | **Clase cancelada por el instituto** (§3.2): ¿hay acción en la app? ¿Mueve fechas de ciclo? | Acción «Cancelar clase» en Asistencia; no cobra y **no** extiende ciclos | Flujo F2 |
| Q5 | **«Terminar mensualidad hoy»** (§3.6): ¿qué estado queda, y qué pasa con los días ya cubiertos? | Queda «Sin mensualidad» desde mañana, con motivo; sin devolución en la app | Flujo F5 |
| Q6 | **Teléfono** del alumno: ¿obligatorio? Sin teléfono no hay wa.me | Opcional; el botón WhatsApp queda deshabilitado con el motivo «Cargá su teléfono» | Alta y ficha |
| Q7 | **Plantilla del mensaje de WhatsApp**: ¿texto por defecto lo define Ada/Nico? | Propongo uno (ver 03), editable por alumno antes de enviar | Copy |
| Q8 | **Dos dueños a la vez**: si el otro ya cobró lo mismo, ¿qué ve el segundo? | Al confirmar, el servidor responde «ya registrado por <Dueño B>» y no duplica (idempotencia por alumno+concepto+ciclo) | Estado de error en cobro |
| Q9 | **Clase adeudada con alumno que luego paga mensualidad**: ¿se cancela la deuda? §3.2.3 dice que las pagadas no se reembolsan; las adeudadas no están dichas | Se mantienen adeudadas hasta cobrarlas o **condonarlas** (acción nueva con motivo, auditada) | Aparece una acción «Condonar» no prevista en el plan |
| Q10 | **Aviso a dueños para «Pagada, sin iniciar»** que lleva muchos días sin iniciar (no vino a clase) | No hay aviso; chip informativo | — |
| Q11 | Rol de recepción/profesor (PLAN §2) vs D6 («solo dueños usan la app») | Sin UI de roles en el MVP | Si vuelve, hay que diseñar vistas sin montos |

## Dónde sigue

- **Ada:** responder Q1–Q11 (o confirmar hipótesis) en `Fina-Recibe.md`.
- **Vito (ENC-02):** pasar a alta fidelidad desde `02-wireframes.md`; los nombres de tokens semánticos que uso están en `03`.
- **Fina (siguiente):** componentes con nombre y contrato (entregable 2 de §4) y revisión de contraste cuando Vito entregue tokens.
