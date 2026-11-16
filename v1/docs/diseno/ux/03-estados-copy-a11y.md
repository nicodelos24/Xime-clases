# 03 · Estados, copy y contratos UX

**ENC-01 · 15/11/2026 · especificación documental, no funcionalidad implementada.** Aplicar a `01` (F1–F9) y `02` (W1–W14). PLAN.md manda sobre esta propuesta. Las dudas Q1–Q5 del README no son reglas resueltas. Los colores y tamaños exportables pertenecen a ENC-02 de Vito; acá especifico semántica y comportamiento.

## 1. Estado global de operación

| Estado | Vista y acción | Regla de salida |
|---|---|---|
| Primera carga | Skeleton de la estructura; etiqueta accesible «Cargando…». No mostrar cero de deuda/cobro como sustituto de desconocido | Datos confirmados → contenido; error → explicación + Reintentar |
| Actualizando | Conservar contenido disponible; sello «Actualizando…». No saltar el foco ni recolocar la fila bajo el dedo | Sustituir con respuesta autorizada; si falla, identificar que son datos anteriores |
| Guardando | Botón «Guardando…» o «Registrando pago…», bloqueado; progreso anunciado una vez | Éxito solo con respuesta del servidor; fallo/timeout no equivale a operación rechazada |
| Confirmado | Resultado + detalle + actor nominal + acción para volver al origen | Refrescar ficha, listado, Hoy y Cobros afectados desde información confirmada |
| Validación | Error junto al campo, resumen si son varios, foco en el primero. Conservar formulario | Corregir sin perder lo ya escrito; nueva vista previa si cambia fecha/monto/inicio |
| Sin conexión antes de guardar | Banner «Sin conexión. Necesitás internet para guardar cambios»; no encolar operaciones. Botón Guardar/Confirmar inhabilitado con explicación accesible | Volver conexión → volver a validar y cargar preview; no enviar sin nueva confirmación |
| Resultado desconocido | «Estamos comprobando si se registró. No vuelvas a cargar el pago». Mantener identificador de la operación | Consultar la misma operación; si existe, mostrar su comprobante. Si no se confirma, conservar pendiente, no crear un intento nuevo |
| Reintento tras error comprobado | «No se registró. Revisá la conexión y reintentá» | Usar la **misma clave idempotente de la operación** según contrato del servidor. La UI no define unicidad por alumno/ciclo |
| Conflicto con otro dueño | «La información cambió mientras estabas operando. Revisala antes de confirmar»; detalle real si el servidor lo entrega | Actualizar y revisar; no sobrescribir ni afirmar pago duplicado sin respuesta del servidor |
| Sesión vencida / permiso revocado | «Tu sesión venció. Volvé a ingresar» / «Ya no tenés acceso a este instituto» | Sin mostrar datos de otro instituto ni conservarlos al cambiar cuenta. Autorización real no depende del botón |

Si se muestran datos previos sin conexión, indicar cuándo se actualizaron; no afirmar que existe cache/persistencia local (todavía no se diseñó ni construyó). No mostrar un comprobante nuevo con datos de un formulario local.

## 2. Matriz por pantalla

**Todas las filas tienen vacío, carga, error y sin conexión.** Los mensajes de cada sección pueden coexistir: fallo de una tarjeta de Hoy no borra el resto. En formularios, «vacío» significa estado inicial o falta de datos, no listado sin resultados.

| Pantalla / flujo | Vacío o faltante | Cargando | Error recuperable | Sin conexión |
|---|---|---|---|---|
| W1 Hoy / F7 | «Todavía no hay alumnos» → Agregar alumno; «No hay clases hoy» → Ver horario; Por vencer: «Nadie por vencer en este período». No equivale a cero deudas | Skeleton por sección; números desconocidos no son 0 | «No pudimos cargar los próximos vencimientos» → Reintentar sección | Banner; contenido anterior fechado si disponible. Cobros y asistencia requieren red |
| W2 Alumnos / entrada F1 | «Agregá tu primer alumno»; búsqueda: «No encontramos alumnos para “…”» → Borrar búsqueda | Skeleton de filas, búsqueda conservada | «No pudimos cargar alumnos» → Reintentar | Consulta anterior si disponible, sin altas/ediciones guardadas offline |
| W3 Alta / F1 | Campos requeridos con etiquetas visibles. Falta tarifa: «Configurá la tarifa antes de cobrar» → Ajustes; alta no equivale a pago | Guardando alumno; no abrir cobro antes de confirmarlo | Nombre faltante/inválido señalado. Error de guardado conserva los campos | Guardar inhabilitado, datos no enviados; advertir al salir si se perderán |
| W4 Lista / F2 | «No hay clases programadas para esta fecha» → Ver horario; clase sin alumnos: «No hay alumnos para pasar lista» → Alumnos | Skeleton o progreso por fila; sin checks falsos | Falla por fila: «No se guardó esta asistencia» → Reintentar tras comprobar estado | No nueva presencia/deuda ni cola. Distinguir «Pendiente de marcar» de «No guardada» |
| W5 Clase suelta / F2–F4 | Falta tarifa: «Configurá la tarifa para cobrar»; si la deuda fue confirmada, dejarla visible sin inventar un monto | Consultando tarifa / Registrando pago; no doble confirmación | «No pudimos cargar el cobro» → Reintentar; presencia ya confirmada se conserva | No cobrar. Si presencia se guardó, no borrarla al cerrar; mostrar la clase adeudada que informe servidor |
| W6 Vencida o sin pagar / F2 | «Sin mensualidad» (sin fecha inventada); o «Vencida · venció el DD/MM» | Cargando estado si aún no se conoce; no usar rojo por defecto | «No pudimos consultar la mensualidad» → Reintentar | No confirmar cambios; asistencia nunca se presume guardada. Con conexión, vencida no bloquea asistencia |
| W7 Ficha / F3–F7 | Sin pagos/asistencias: «Todavía no registraste pagos/asistencias». Sin teléfono: Agregar teléfono | Skeleton de ficha/fechas; no flash de Sin mensualidad | «No pudimos cargar la ficha» → Reintentar / Volver | Ficha anterior solo si disponible y fechada; sin cambiar modalidad/cobrar/inicio manual |
| W8 Mensualidad / F3–F6 | Sin alumno → Buscar; sin medio → Elegir; sin tarifa → Ajustes. Sin inicio confirmado → Pagada, sin iniciar / Pendiente de primera clase (Q1) | Consultando precio y ciclo; después Registrando pago | Campo y motivo inválidos; conflicto o resultado incierto según tabla global | Sin Confirmar; preservar formulario mientras siga abierto; no recibo optimista |
| W9 Clase / F4 | Sin clase adeudada elegida → Seleccionar clase. Ya pagada: Ver pago existente | Cargando concepto/tarifa → Registrando pago | Concepto ya cambiado/pagado por otro dueño: actualizar resultado real, no crear nuevo concepto | Sin cobro; preservar selección, volver a consultar al recuperar conexión |
| W10 Cobros / F3–F4–F8 | Mensajes independientes: «No hay mensualidades vencidas», «No hay clases adeudadas», «Todavía no registraste pagos» | Skeleton por filtro; conservar búsqueda y período | «No pudimos cargar los cobros» → Reintentar | Última consulta fechada si existe; no montos asumidos actuales ni anulaciones offline |
| W11 Modalidad / F5 | Si no hay ciclo vigente, no mostrar fechas de cobertura inventadas; solo opciones del dominio | Consultando impacto → Guardando cambio | No guardar si no se conoce impacto; motivo obligatorio al terminar hoy; Q3 pendiente | Sin confirmar. Conservar modalidad original; no programar cambio local |
| W12 WhatsApp / F7 | Sin teléfono → Agregar teléfono; texto vacío → «Escribí un mensaje» | Preparando enlace; sin mensaje automático en segundo plano | «No pudimos abrir WhatsApp» → Reintentar / Copiar mensaje | No envío garantizado: se puede copiar el texto visible; el registro de apertura solo se muestra si se guardó. No afirmar envío |
| W13 Comprobante / F3–F4 | No hay pago confirmado → no mostrar éxito; ver estado de operación | «Comprobando el pago…» | No se pudo consultar comprobante: Reintentar sobre el mismo pago; no abrir un cobro nuevo | Comprobante ya confirmado puede mostrarse si está disponible; nunca fabricar uno desde el formulario |
| W14 Anulación / F8 | Motivo vacío: «Contanos por qué anulás este pago» | Cargando impacto → Anulando… | Si ya se anuló, mostrar contra-registro real; si incierto, consultar la operación | Anular inhabilitado con motivo visible; no borrar el original |
| Ajustes / F9 | Tarifa no configurada: campo sin importe supuesto. Avisos: valor definido por instituto (7 por defecto) | Cargando configuración / Guardando… | Monto no entero, fecha inválida o fallo: conservar y explicar | Sin cambiar tarifas ni aviso en forma local |

### Boceto reusable para Vito (no es otra pantalla)

```text
[Cargando]             [Error de consulta]
Título                 Título
▧ ▧ ▧                  No pudimos cargar los cobros.
▧ ▧ ▧                  [Reintentar]
Cargando cobros…        [Volver]

[Vacío confirmado]     [Sin conexión]
No hay clases          Sin conexión · datos del DD/MM HH:mm
adeudadas.             Contenido anterior si disponible
[Ver historial]        [Confirmar] inhabilitado
                       Necesitás internet para guardar.
```

## 3. Estados de mensualidad y fechas

| Estado derivado | Ícono propuesto (Vito define dibujo) | Texto y acción contextual |
|---|---|---|
| Vigente | Check | «Vigente · Vence el DD/MM · Próxima renovación: DD/MM»; Ver ficha / Renovar según dominio |
| Por vencer | Reloj | Mismas fechas; Renovar / Avisar por WhatsApp |
| Vence hoy | Reloj con alerta | «Vence hoy · Último día cubierto: DD/MM · Próxima renovación: DD/MM»; hoy aún está cubierto |
| Vencida | Alerta | «Vencida · Venció el DD/MM»; siguiente ciclo aún sin iniciar hasta pago/primera clase. No prometer nueva cobertura en la fecha de renovación ya pasada |
| Pagada, sin iniciar | Pausa / calendario | «Pagó el DD/MM · Pendiente de primera clase»; fechas definitivas solo si inicio manual confirmado. Una estimación lleva «Previsto, sujeto al inicio» |
| Sin mensualidad | Guion / círculo vacío | «Sin mensualidad · Todavía no hay un ciclo pago»; Cobrar mensualidad. Si modalidad clase suelta, no usar esto como alerta de deuda |

**Sin fecha confirmada:** mantener rótulos en ficha «Vencimiento: pendiente de inicio», «Próxima renovación: pendiente de inicio». No usar `00/00`, la fecha actual ni el próximo mes como sustituto. Si vencida, distinguir «Renovación prevista del ciclo anterior: DD/MM» de «Próxima renovación: pendiente de nuevo inicio».

**Cambio programado:** además del estado del ciclo, «Clase suelta desde DD/MM»; no reemplazarlo por Vencida antes de terminar la cobertura. **Renovación adelantada:** mostrar ciclo vigente y siguiente ciclo pagado separados (inicio / último día / renovación de cada uno). Mantener «Vigente» hasta que corresponda el siguiente; no fingir dos mensualidades actuales ni ofrecer varios meses juntos.

### Fichas de aceptación de fechas para Vito/Gino

Ejemplos documentales de PLAN §3.5, no resultados de ejecución:

- Pago 10/04, inicio **confirmado** 12/04 → vence 11/05, renueva 12/05, aviso 04/05 para N=7. Antes de inicio: Pagada, sin iniciar.
- Inicio 31/01/2027 → vence 27/02 → renueva 28/02; ciclo siguiente vence 30/03 → renueva 31/03. Luego vence 29/04 → renueva 30/04 → vence 30/05 → renueva 31/05. Ancla 31.
- Inicio 31/01/2028 → vence 28/02 → renueva 29/02; siguiente renueva 31/03, no 29/03. Ancla 31.
- Inicio 29/02/2028 → vence 28/03 → renueva 29/03; febrero 2029 renueva 28/02 y marzo vuelve al 29/03. Ancla 29.
- Vence 11/05; paga 05/05 **o 11/05** → siguiente inicio 12/05 sin esperar clase. Paga 20/05 → Pagada, sin iniciar hasta primera clase o inicio manual.
- A las 23:59 de Montevideo del último día: Vence hoy; a las 00:00 siguiente: Vencida. Cambiar zona del celular no cambia el estado. Refrescar al volver del segundo plano y tras guardar.

## 4. Copy es-UY y errores financieros

- Acción primaria: **«Registrar pago» / «Confirmar pago $… UYU»**, no «Pagar ahora» (no procesamos dinero).
- Monto modificado: «Indicá el motivo del cambio de monto». Se registra el monto completo acordado como descuento puntual, no como parcial. No generar automáticamente saldo restante.
- Monto no entero: «Ingresá un monto en pesos uruguayos, sin decimales». No redondear silenciosamente; parsear entrada local con validación compartida. Precio no definido no equivale a cero. El tratamiento de beca total depende de validación de dominio, no se introduce un mínimo desde UX.
- Inicio manual: «Elegí la fecha de inicio. Revisá el último día cubierto y la próxima renovación antes de confirmar». Mostrar vista previa y guardar actor; no modificar pagos históricos.
- Anulación: «El pago original seguirá visible. Este ciclo quedará sin efecto. No se devuelve dinero automáticamente». Motivo obligatorio; botón secundario «Conservar pago».
- Modalidad: «La mensualidad sigue vigente hasta DD/MM. Desde DD/MM se cobra por clase». Para corte anticipado: «Terminar mensualidad hoy», motivo y fecha efectiva del dominio; no suponer mañana (Q3).
- WhatsApp por vencer: «Hola, Ana. Tu mensualidad vence el 17/11. Si ya pagaste, avisame. Gracias.» Plantilla propuesta editable por la dueña para ese alumno. Variante vencida: «Tu mensualidad venció el DD/MM». Sin envío automático ni texto «Enviado».
- Aviso interno: «Tenés mensualidades por vencer. Revisalas en Hoy». Abrir lista de su instituto; no poner nombres, deuda ni teléfonos en vista de bloqueo. Si permiso push denegado: «Activá notificaciones para recibir avisos. También podés verlos en Hoy» → Ajustes del sistema; no bloquear la app.
- Cero resultados no equivale a error ni «todo al día» global: cada sección informa solo el período/filtro consultado.
- Fecha: DD/MM en listas dentro del año; DD/MM/AAAA en historial, confirmaciones o cruce de año. Encabezado indica Montevideo donde el día operativo importe. Moneda: «$ 1.200 UYU» como ejemplo de formato, **no tarifa**.

## 5. Contratos UX de componentes (entregable 2, coordinado con Vito)

Contrato conceptual, no API implementada. Nombres visuales y tokens reales los exporta Vito; no se agregan paquetes ni lógica de dominio acá.

| Componente | Datos y acciones | Comportamiento exigido |
|---|---|---|
| Navegación inferior | 5 destinos / actual / badges confirmados | Etiqueta visible, estado seleccionado anunciado, zona segura. No comprimir a <44 px; usar 48 px de objetivo |
| Acción «+ Pago» | Origen + alumno/concepto opcionales | Contexto precargado; no tapar filas/teclado; visible por texto, no solo `+` |
| Tarjeta métrica | Rótulo / valor confirmado / filtro / estado de carga | Desconocido ≠ cero; una tarjeta abre el filtro correspondiente |
| Chip mensualidad | Uno de los seis estados **del dominio** / ícono / texto | No editable; anunciar texto, ícono decorativo para no duplicar lectura |
| Resumen de ciclo | Inicio confirmado o previsto / último cubierto / renovación / ancla | Separar tres fechas; etiquetar previsiones; mostrar valores pendientes sin inventar |
| Fila alumno | Nombre / modalidad / resumen / acciones | Fila principal abre ficha; botones independientes no anidados; orden accesible |
| Fila asistencia | Alumno / estado de presencia / guardado / mensualidad / opciones | Acción de un toque; pending por fila, éxito confirmado; nunca depender de swipe |
| Cobro manual | Alumno / concepto / importe Tarifas / medio / fecha / motivo | Botón con importe; cambio de monto requiere motivo; validación y preview; una operación idempotente |
| Hoja / confirmación | Título / consecuencia / contenido / primaria y cancelar | Foco dentro, cerrar accesible, Cancelar sin guardar. Puede ocupar pantalla completa si contenido crece |
| Campo de formulario | Etiqueta / requerido / valor / ayuda / error | Etiqueta no depende del placeholder; ayuda y error asociados; teclado adecuado |
| Lista filtrada | Filtro / elementos / vacío / error / carga | Filtro conservado al volver; acciones de recuperación específicas |
| Estado de sección | Carga / vacío / error / offline / actualización | Copy y acción de la matriz; lectores de pantalla reciben cambios, sin alertas repetidas |
| Editor WhatsApp | Destinatario / texto / fecha real del ciclo | Abrir enlace solo tras revisión; Copiar como alternativa; apertura no es envío |
| Comprobante / registro | Pago confirmado / ciclo o clase / actor / anulación | Interno, no DGI; pago original y contra-registro visibles, no botón Editar/Borrar |

Tokens semánticos requeridos (sin asignar colores): fondo/superficie, texto primario/secundario, acción principal y su texto, error, foco, borde de control, seis variantes de estado, deshabilitado. **Acento del instituto no reemplaza colores semánticos de pago/deuda.** Contraste se debe verificar sobre combinaciones reales de ambos temas, no deducir del nombre de un token.

## 6. Accesibilidad y layout: criterios a comprobar en alta fidelidad/app

- Texto normal ≥4,5:1, texto grande ≥3:1; bordes/íconos funcionales y foco ≥3:1 contra fondo contiguo. Medir claro/oscuro, focus/error/deshabilitado según corresponda, acento configurable. No usar texto tenue para fechas críticas.
- Cuerpo propuesto 16 px, escalado del SO sin truncar fechas, importes, nombre ni «Pagada, sin iniciar»; reflow a 360 px y texto al 200 %. Controles crecen; sin alturas rígidas para contener texto.
- Objetivos de 48×48 px preferidos (mínimo 44), separación 8 px donde haya acciones vecinas. En listas de estados largos, apilar acciones; no forzar todos los botones en una línea.
- Foco visible; orden título → resumen → acciones → contenido → navegación. Restaurar al disparador al cerrar hoja, y al título de comprobante tras confirmar. Teclado no tapa Confirmar; scroll hasta campo con error.
- TalkBack/VoiceOver: leer «Ana Pérez, Por vencer, vence el 17 de noviembre, próxima renovación 18 de noviembre»; acción de presencia «Marcar presente a Lucía Silva». Estado de guardado anunciado sin repetir toda la lista. No recitar guiones ni íconos decorativos.
- Fechas con nombres de mes para lector; UYU con unidad, no solo símbolo `$`. Sin depender únicamente de rojo/verde, orientación, posición o animación. Movimiento reducido respeta el SO.
- No borrar formulario al simple error. Si Volver pierde datos no guardados: «¿Descartar cambios?» con Conservar edición / Descartar; distinto de anular pago.
- Probar recorrido táctil y teclado, ambos temas, texto grande y lector en Android+iPhone. **Todo pendiente de verificación visual/funcional**, no probado por la existencia de estos documentos.

## 7. Límites del handoff

No hay nuevas funciones de condonación, reintegro, extensión por clase cancelada, cola offline, pagos parciales ni WhatsApp automático. No hay campo tutor ni UI de grupos. Las dudas de negocio se elevan a Ada (Q1–Q5); no se convierten en valores predeterminados. Vito puede resolver composición/estética y componentes sin fijar esas reglas.
