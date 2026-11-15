# Diseño UX — ENC-01

**Fina · 15/11/2026 · propuesta documental revisada contra PLAN.md §3, §4, §7 y §8.** Wireframes de baja fidelidad; no es una aplicación, prototipo navegable ni validación con usuarias. Sin commit ni push.

## Entrega

| Archivo | Contenido |
|---|---|
| [01-mapa-y-flujos.md](01-mapa-y-flujos.md) | Navegación y nueve flujos; trazabilidad de los doce casos de §3.5 |
| [02-wireframes.md](02-wireframes.md) | Catorce wireframes ASCII móviles, jerarquía y variantes |
| [03-estados-copy-a11y.md](03-estados-copy-a11y.md) | Matriz por pantalla: vacío, carga, error, sin conexión, confirmación; copy, comportamiento accesible y contratos de componentes |

**Entregables 1–3:** Fina define tareas, flujos, wireframes y comportamiento de componentes. Vito (`7e0c8d1df108-vito`, ENC-02) es responsable de identidad, tokens exportables, biblioteca visual y alta fidelidad en `docs/diseno/visual/`. No duplico su paleta ni doy su parte por terminada.

## Criterios transversales

- Uruguay; moneda UYU, importes enteros, zona `America/Montevideo`; dos dueños nominales y alumnos adultos. Sin campo tutor, interfaz de grupos, selector de roles ni pantallas de funciones futuras.
- Inicio del ciclo = primera clase posterior al pago (hoy si está asistiendo hoy al contratar mensualidad), o fecha manual. **Una clase prevista no prueba asistencia ni inicia por sí sola el ciclo.** Pago e inicio se distinguen en todos los textos.
- Fechas/estado/precio vienen del dominio y de la respuesta autorizada del servidor. En ficha: inicio, «Vence el DD/MM» (último día cubierto) y «Próxima renovación: DD/MM». Sin inicio confirmado: «Pendiente de primera clase»; no inventar vencimiento. Si se muestra una estimación de horario, se etiqueta «Previsto, sujeto al inicio».
- Se conserva el ancla en ciclos continuos: 31/01 → 28 o 29/02 → 31/03. El último día cubierto no es la fecha de renovación.
- Ícono + texto + color para los seis estados. Conexión requerida para pagos, cambios de deuda y asistencia en este alcance; no cola offline ni éxito optimista.
- Objetivo de cobro rápido **desde contexto conocido**: abrir cobro → elegir medio → confirmar con monto precargado. No se promete ese número de toques si hay búsqueda, edición o correcciones.
- WhatsApp manual: editar texto, abrir `wa.me`, nunca afirmar envío/entrega. La constancia de apertura no reemplaza ni suprime los avisos internos a dueños.
- Montos reales aún sin definir: `$… UYU` en wireframes, sin precios hardcodeados. No parciales, saldos a favor, varios meses juntos ni cobro online.

## Aclaraciones de producto para Ada (no resueltas por el diseño)

No detienen la navegación ni la alta fidelidad del recorrido normal. No hay hipótesis de cobro implementables detrás de estas preguntas.

| ID | Aclaración necesaria | Tratamiento en la entrega |
|---|---|---|
| Q1 | Cómo se confirma el inicio al pasar lista y al fijarlo manualmente, cuando no hay próxima clase o la prevista no se asiste | Mostrar `Pagada, sin iniciar`, fecha pendiente; solo presentar fechas definitivas del dominio. Fecha manual existe por §3.1, sin tomar la fecha de horario como hecho |
| Q2 | Corrección de asistencia ya cobrada o cancelación de una clase cobrada: qué ajuste, deuda y ciclo resultan | Solicitar al servidor resumen del ajuste auditado y mostrar impacto antes de guardar; no diseñar reintegros ni extensiones automáticas |
| Q3 | Efecto exacto de «Terminar mensualidad hoy»: si deja de cubrir la clase de hoy y desde cuándo cobra por clase | Motivo y no devolución automática ya están definidos; fecha efectiva del resultado pendiente del dominio. No asumir «desde mañana» |
| Q4 | Clase suelta **adeudada**, anterior a nueva mensualidad: cómo se trata | Mostrar historial existente; sin condonar, convertir o eliminar deuda. §3.2.3 solo resuelve clases ya pagadas |
| Q5 | Si ya existe una renovación anticipada pagada: qué operación permite el producto | No ofrecer compra de varios meses. Si el servidor rechaza otro cobro, explicar y enlazar al pago existente; no fijar una regla adicional |

**Propuestas UX, no reglas comerciales:** teléfono opcional con acción «Agregar teléfono» si falta; mensaje de WhatsApp editable sin pedir aprobación de plantilla a Nico; apertura visible como «WhatsApp abierto», no «Aviso enviado». Para confirmar cambios con otro dueño operando, refrescar la información y mostrar la respuesta del servidor; la UI no define claves de unicidad financieras.

## Verificación y límites

Revisión documental: flujos pedidos, los doce casos de §3.5, seis estados de mensualidad, fechas explícitas, ausencia de UI de tutor/grupos y matriz de estados por pantalla. Evidencia reproducible en `verificacion.json` (incluye hashes de los cuatro Markdown; auditoría local, **no tests de app**).

No se verificaron pantallas corriendo, contraste real, layout a 360 px, lector de pantalla, Android/iPhone, persistencia, push, WhatsApp real ni uso con una dueña. La fase de alta fidelidad y validación de PLAN §4 sigue a cargo de Vito/Ada; las especificaciones de accesibilidad son criterios a comprobar, no certificación.
