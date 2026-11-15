# ENC-07A · Agenda como destino principal

**Fina · 15/11/2026 · especificación UX para implementación posterior por Reina externa.** Estado: propuesta concreta, **NO IMPLEMENTADA / NO FUNCIONAL** en ENC-06. No es una aprobación de producto, ni habilita app, BD o producción. Esta entrega solo agrega este documento y recados en buzones; no modifica prototipo, visual ni PLAN.

## 1. Fuentes, precedencia y límite

- Base inspeccionada: `master`, HEAD `e553ac0178c3f6b9a58205f54f3040f7ed5f0872` (integración de ENC-06). Git inicial: solo `.apc/` sin seguimiento; se preserva.
- [PLAN](../../../PLAN.md) §1, §3.1–3.7, §4, §7, §8.1: reglas de negocio y límites. Encargo de Ada ENC-07A: agregar Agenda mensual/semanal mobile-first, sin cambiar código ni inventar Q2/Q3.
- ENC-01: [mapa y F1–F9](01-mapa-y-flujos.md), [W1–W14](02-wireframes.md), [estados/copy/a11y](03-estados-copy-a11y.md).
- ENC-02: [identidad](../visual/README.md), [componentes](../visual/componentes.md), tokens existentes claro/oscuro. No hay nuevos colores, tipografía ni identidad en este encargo.
- ENC-06: [alcance](prototipo/README.md) y [handoff](prototipo/HANDOFF.md). Fechas, importes y alumnos ficticios; memoria de sesión, no API/persistencia.
- Durante la redacción Ada integró `dc82ad2a480cb4f7c698a1bf9b26cc80d7e9796b`: releí PLAN §8 y [HOJA-DE-RUTA](../../HOJA-DE-RUTA.md), D1–D4/I1–I5. D3 asigna a Ada la integración/publicación de demo; I1 a Reina externa la base Expo posterior. D4 difiere la sesión con dueña, sin presumir aprobación. Mi alcance sigue siendo documental.
- Leí la entrega paralela [ENC-07B de Vito](../visual/agenda-iconografia.md): su alternativa de acceso a Hoy no fija UX. Acá se concreta su opción (b), **calendario separado**, sin cambiar sus SVG/tokens. Ada concilia la tarjeta destacada de Hoy si la integra; no sustituir el calendario mensual/semanal por esa tarjeta.

**Cambio acotado respecto de PLAN §4/ENC-01/ENC-02:** se propone sustituir el acceso inferior «Asistencia» por «Agenda», conservando cinco destinos y la pantalla de asistencia como subruta. Es el delta de navegación solicitado por Ada, no una reescritura de PLAN ni una decisión de Nico sobre la app definitiva. Si se integra, Ada concilia esos documentos; Reina no debe agregar un sexto botón ni borrar los flujos anteriores.

**Objetivo observable:** que una dueña encuentre cuándo hay clase, abra la lista correcta y vea qué mensualidades vencen en una fecha, sin entender ciclos, filtros avanzados o gestos ocultos. No se promete facilidad validada: no hubo sesión con una usuaria.

## 2. Arquitectura de información

```text
Hoy · Alumnos · Agenda · Cobros · Más     (cinco destinos)
                    └── Semana [inicial] / Mes
                        ├── Clase: fecha + hora → Asistencia de esa ocurrencia
                        │                           └── Cobro existente → volver a esa lista
                        ├── Vencimientos del día → ficha → renovar / WhatsApp simulado
                        └── Ver horario → explicación de función no disponible en la demo
Hoy → Clase de hoy → misma Asistencia (sin desvío obligatorio por Agenda)
Ficha → Ver asistencia → conserva acceso actual
Más → Horario/clases → Agenda (sin duplicar un segundo calendario)
```

- **Agenda es principal por estar visible en la barra**, no por reemplazar el inicio Hoy. La apertura sin hash sigue en Hoy. Hoy conserva lista Por vencer y todos sus indicadores; no se rediseña.
- «Asistencia» sigue como título de la lista y en acciones «Pasar lista». Desde ella se marca Agenda como destino activo; no se exige que la dueña aprenda un nombre nuevo para pasar lista.
- Primera entrada a Agenda: **Semana**, fecha seleccionada hoy del instituto. Retorno durante la sesión: conservar vista, fecha, posición y origen. No persistir preferencias fuera de la sesión en la demo.
- Solo dos opciones: **Semana / Mes**, con etiquetas visibles y selección explícita. Sin vista anual, grupos, profesores, arrastrar eventos ni agenda de cada alumno.
- Acción + Pago conserva el comportamiento contextual de ENC-06 en Hoy/Alumnos/Cobros; no se agrega flotando sobre el calendario. El cobro desde Agenda pasa por ficha o asistencia, nunca tocando una fecha.

## 3. Modelo mental y contenido

**Tres conceptos distintos:** horario previsto, asistencia registrada y ciclo pagado. Ver una clase programada no la realiza, no marca presentes y no inicia una mensualidad (Q1). Ver un vencimiento no crea deuda ni cobro. El calendario no es un motor de reglas.

| Elemento | Contenido visible | Lo que NO significa |
|---|---|---|
| Clase programada | «Danza · 18:00–19:00», fecha en contexto; «Sin pasar lista» si se conoce que no hay marcas | No significa que ocurrió ni que alguien asistió |
| Resumen de asistencia | «3 presentes · 1 ausente · 2 sin marcar», solo si se conoce lista completa; «Abrir lista» si hay registros, «Pasar lista» si no hay ninguno | No usar «Completa» ni porcentaje si no se conoce el padrón; una pendiente no es ausencia |
| Clase cancelada | «Cancelada por el instituto», fecha/hora conservadas; sin CTA de nueva asistencia/cobro | No borra registros previos, no devuelve dinero ni alarga ciclos |
| Vencimiento | «Mensualidades que vencen» + nombre + «Vence el DD/MM» + «Próxima renovación DD/MM» | Es el último día cubierto, no la fecha de pago ni el primer día siguiente |
| Vencimiento pasado | «Venció el DD/MM»; estado actual devuelto por fuente, si se conoce | La fecha histórica no prueba que siga impaga hoy |
| Renovación futura | Se explica en ficha junto al vencimiento | No duplicar como otro evento cobrable ni prometer que se cobró |
| Pagada, sin iniciar / Sin mensualidad | Sin evento de vencimiento fechado; desde ficha se explica el estado | No colocar una fecha calculada a partir del horario |

Fechas es-UY; encabezados con mes en letras y año; detalle completo cuando hay cruce de año. Horas de 24 h, zona **America/Montevideo**. «Hoy» usa fecha del instituto, no la zona del celular; en la demo se mantiene **15/11/2026**. No deducir la fecha local con `toISOString()` de medianoche del dispositivo. La semana va de **lunes a domingo como propuesta de presentación**, no es una regla sobre días de clase. No fijar «dos clases semanales» como recurrencia: PLAN dice normalmente dos, no cuáles ni que siempre se cumpla.

## 4. Pantallas mobile-first

### A1 · Semana (entrada preferida para operar)

No usar una grilla de horas de siete columnas en móvil. Mostrar una **lista vertical de siete días**, encabezados y ocurrencias ordenadas por hora. Cada día conserva su fecha aunque no tenga clases; no esconder días vacíos ni juntar vencimientos en un contador global.

```text
Agenda
[Semana ✓] [Mes]
[← Semana anterior]  [Hoy]  [Semana siguiente →]  (refluye)
9–15 de noviembre de 2026 · Montevideo
[Ir al día de hoy]   (solo si quedó fuera del área visible)

Lunes 9 de noviembre
No hay clases ni vencimientos este día.
…
Domingo 15 de noviembre · HOY
Danza · 18:00–19:00
Sin pasar lista
[Pasar lista]
[1 mensualidad vence este día ▾]
  Rosa Méndez
  Vence el 15/11 · Próxima renovación 16/11
  [Ver ficha]

Hoy  Alumnos  Agenda  Cobros  Más
```

- Orden cronológico de lunes a domingo. En entrada nueva, encabezado/controles visibles arriba; «Ir al día de hoy» desplaza y enfoca el encabezado de ese día, sin cambiar rango. No autoscroll al abrir que oculte título y controles. En retorno, recuperar posición anterior.
- Encabezado de cada día: fecha, «Hoy» si corresponde y contenido. Días sin contenido: una línea de vacío, no tarjetas altas. Las clases aparecen directamente; no requieren expandir día.
- Vencimientos se agrupan en botón **«N mensualidades vencen este día»**, cerrado inicialmente; expandir muestra todas las filas del día. Para fechas pasadas: «N mensualidades vencieron este día». No se confunden con impagos actuales. Botón anuncia expandido/contraído y controla esa sección.
- Si no se conoce una sección por error, su espacio dice error/carga, jamás «sin vencimientos» o «sin clases».
- Navegar semana avanza/retrocede siete días de calendario local y desplaza también la fecha seleccionada siete días, conservando el día de semana. Siempre rotular el rango con ambos meses/años cuando difieran. «Hoy» vuelve a la semana de hoy y ofrece/enfoca el día de hoy; no modifica asistencias. Abrir una clase o un vencimiento selecciona su fecha para que al alternar a Mes se conserve ese contexto.

### A2 · Mes (orientarse y elegir fecha)

```text
Agenda
[Semana] [Mes ✓]
[← Mes anterior] [Hoy] [Mes siguiente →]
Noviembre de 2026 · Montevideo
Clases: icono calendario + número
Vencimientos: icono reloj + número
Lu  Ma  Mi  Ju  Vi  Sá  Do
… días del mes …
[15 seleccionado · Hoy]

Domingo 15 de noviembre de 2026
Danza · 18:00–19:00 · Sin pasar lista
[Pasar lista]
[1 mensualidad vence este día ▾] → filas iguales a A1
```

- Grilla lunes–domingo con **fecha + dos indicadores distintos**, calendario/número de clases y reloj/número de mensualidades que vencen. Iconos con leyenda escrita; no puntos de colores sin significado. Número de día 16 px; contadores al menos 14 px, nunca única forma de obtener el dato. El detalle usa texto completo de 16 px.
- El conteo «clases» comprende ocurrencias del día, incluidas canceladas, **no equivale a clases a realizar**; al abrir se identifica cada cancelada. Etiqueta accesible incluye el desglose si hay canceladas. No sumar asistencia ni dinero a ese número.
- Día seleccionado: borde/marca + estado accesible; hoy: texto/marca diferente. Una selección no se indica solo por el acento. Días sin eventos siguen seleccionables; cero real no se reemplaza por error.
- Solo se seleccionan fechas del mes actual; espacios de meses vecinos no tienen botones. Evita salir de mes por un toque accidental. Anterior/Siguiente cambia mes, manteniendo número del día seleccionado si existe, o último día disponible; esta elección de presentación **no recalcula anclas de mensualidad**. «Hoy» restablece mes y fecha de hoy.
- Tocar una fecha **solo actualiza el panel de ese día**, no abre un pago ni un modal. Anunciar «Domingo 15 de noviembre, 1 clase, 1 mensualidad vence; detalle actualizado». Mantener foco en el botón; acceso visible «Ver detalle del día» desplaza/enfoca el encabezado cuando quede bajo el pliegue.
- Botones de fecha mínimo 44×44 px (preferencia 48); celda crece verticalmente para indicadores. **Si siete objetivos de 44 px + márgenes no entran** (p. ej. 320 px) o texto ampliado rompe composición, sustituir grilla por lista «Días de noviembre»: una fila/fecha de ancho completo, misma selección y panel. Sin scroll horizontal ni controles apretados; el modo Mes sigue disponible. El umbral se mide sobre el ancho real del contenido, no se presupone por modelo de teléfono.
- No meter nombres, montos o toda la lista en la celda. Nada de doble toque, swipe, pulsación larga o drag como única acción.

### A3 · Asistencia desde Agenda (pantalla existente, contexto nuevo)

Encabezado obligatorio: **«Asistencia · Danza · domingo 15/11/2026 · 18:00–19:00»**, más «Volver a Agenda». No reutilizar el rótulo fijo «15/11» al abrir otra ocurrencia. La lista se identifica por ocurrencia, no solo por alumno.

Reutilizar F2/W4–W6 de ENC-01 y recorrido ENC-06. Devolver al mismo día/rango/vista tras cerrar/cobrar. Si entró desde Hoy/ficha, conservar ese origen. Una ocurrencia futura se puede consultar; en esta extensión de demo **no se habilitan nuevas marcas ni cobros futuros**, por falta de escenario/regla de operación: explicar «La demo no registra asistencia de clases futuras». No presentarlo como prohibición definitiva del negocio.

Si la lista no está disponible para esa fecha, mostrar «Esta clase todavía no tiene lista en la demo», no cargar silenciosamente la lista del 15/11. Los registros y contadores de cada ocurrencia permanecen separados. Q2/Q3 siguen sin ejecución.

### A4 · Horario sin editor ficticio

«Ver horario» es acceso secundario textual. En una implementación posterior de **esta demo**, mostrar explicación: «Edición de horario no disponible en este prototipo. Las clases son ejemplos y no se guardan». Cerrar devuelve a la misma Agenda. No mostrar «Crear clase», recurrencia, feriados, arrastre o confirmación de guardado que todavía no tengan especificación y fuente de datos. No está definido cómo se editan series/excepciones; queda fuera de ENC-07A, no se inventa un CRUD.

## 5. Flujos y consecuencias

| ID | Entrada y pasos | Resultado / retorno | Salvaguarda |
|---|---|---|---|
| AG-F1 Planificar | Barra Agenda → Semana → Semana siguiente → leer fecha/hora; alternar Mes → elegir día | Panel del día; al volver a Semana, contiene la fecha seleccionada | Cambiar vista conserva fecha; no crea ni inicia clases/ciclos |
| AG-F2 Operar hoy | Agenda → Hoy → Pasar lista de una clase → marcar/cobrar con flujo existente | Estado de la ocurrencia actualizado **solo en demo/memoria**; volver conserva contexto | Confirmación siempre rotulada simulada; en producto solo datos de servidor |
| AG-F3 Revisar vencimiento | Mes → fecha con reloj → expandir vencimientos → Ver ficha → Renovar o WhatsApp | Flujos existentes; Volver recupera día/vista y sección expandida | Calendario no cobra ni envía. WhatsApp editable/simulado; abrir no prueba envío |
| AG-F4 Consultar cancelada | Agenda → clase con etiqueta Cancelada → ver información si hay registros | Mensaje visible sin nuevos cambios | No anular pagos, corregir presencia ni reintegrar. Q2 pendiente |
| AG-F5 Volver tras error | Falla de clases o vencimientos → Reintentar sección | Mismo rango, fecha y expansión; resto de contenido permanece | No convertir error en cero; no repetir mutación incierta |
| AG-F6 Cambiar modalidad | Ficha desde vencimiento → cambio normal existente | Fechas/estado se refrescan desde fuente; retorno al calendario | «Terminar mensualidad hoy» solo aviso Q3; no cortar ni decidir qué clase cubre |

**Bordes de negocio inalterados:** por vencer según N configurado en el instituto (7 por defecto, 10 o vence hoy conforme PLAN); no usar el rango visible de Agenda como nueva ventana de notificación. Calendario muestra vencimientos fechados de todo su rango, aunque estén fuera de N. No dispara push, WhatsApp, renovación ni cobro. Si un ciclo futuro está confirmado, conservar el vencimiento del actual y mostrar su próxima cobertura en ficha; el evento del calendario no afirma deuda. Deuda de clase anterior no se condona (Q4); no hay segundo cobro anticipado para el mismo ciclo (Q5). En Q2/Q3 usar el aviso de política pendiente de ENC-06: sin ajustes, fechas efectivas ni éxito inventado.

## 6. Estados y copy específicos

Aplicar también la matriz general de ENC-01. Estados independientes para clases, vencimientos y detalle de asistencia. La demo podrá seleccionarlos en «Pruebas»; nunca se presentan como fallos reales de red.

| Estado | Contenido y acción | Conducta |
|---|---|---|
| Sin clases en todo el rango (confirmado) | «No hay clases programadas esta semana/este mes» · «Ver horario» | Calendario/fechas y vencimientos siguen disponibles; sin falsa invitación a guardar un horario |
| Día vacío confirmado | «No hay clases ni vencimientos este día» | Solo si ambas consultas finalizaron correctamente; en otro caso mensaje por sección |
| Sin vencimientos en rango | «No hay mensualidades que venzan en este período» | No significa «No hay deuda» ni «Todos pagaron» |
| Sin alumnos | «Todavía no hay alumnos» · «Agregar alumno» | Las clases pueden existir: conservarlas; no suponer agenda vacía por falta de alumnos |
| Primera carga | Encabezado/rango visibles; «Cargando clases…» y «Cargando vencimientos…», skeleton estático con movimiento reducido | Sin contadores 0 ni estado «Sin pasar lista» hasta conocer datos |
| Cambio de rango / actualización | «Actualizando…» en sección, selección conservada | No mostrar datos del mes anterior bajo el nuevo título; contenido previo solo con rango/sello propios y rotulado anterior |
| Error de clases | «No pudimos cargar las clases de este período» · «Reintentar clases» | Mantener vencimientos correctos. Error no elimina la fecha elegida |
| Error de vencimientos | «No pudimos cargar los vencimientos» · «Reintentar vencimientos» | Mantener clases; indicadores desconocidos como «—», con etiqueta «Sin datos», no 0 |
| Error de lista | «No pudimos abrir la asistencia de esta clase» · «Reintentar» / «Volver a Agenda» | No sustituir por otra clase ni por lista vacía |
| Sin conexión | «Sin conexión. Necesitás internet para guardar asistencia o pagos» | Consulta anterior solo si realmente existe, rotulada con fecha/hora/rango. En demo, aclarar que es escenario simulado, no cache real |
| Guardado simulado | «Guardando en la demo…» → «Asistencia registrada solo en esta sesión de prueba» | Bloqueo de doble toque local, no prueba de idempotencia ni auditoría |
| Guardado real incierto (futura app) | «Estamos comprobando si se registró» | Consultar misma operación antes de repetir; no declarar fracaso ni éxito. Fuera de la demo sin API |
| Otro dueño cambió datos (futura app) | «La información cambió. Revisala antes de continuar» | Refrescar desde servidor autorizado, sin sobrescribir ni simular sincronización |
| Q2/Q3 / edición no disponible | Explicación específica + «Entendido» | Nada de toast «Guardado», nueva fecha efectiva o cambio financiero |

No se filtra por nombre del alumno en esta versión: la entrada principal es fecha. La búsqueda de alumnos sigue en Alumnos/Cobros; evita sumar controles sin necesidad observada.

## 7. Datos y funcionalidad: contrato de handoff, no API creada

### Inventario explícito de capacidades

| Interacción | ENC-06 actual | Extensión posterior de prototipo | Producto real |
|---|---|---|---|
| Entrar Agenda, cambiar Semana/Mes, navegar fechas | **No funcional: no existe** | Navegación local con fixtures, sin efectos de negocio | Consulta autorizada de rango, reloj del instituto |
| Ver clases/horas y vencimientos por fecha | **No funcional como calendario** | Fixtures sintéticos coherentes con fichas | Datos de ocurrencias/ciclos; no derivar reglas en UI |
| Pasar lista/cobrar del 15/11 | Simulación en memoria existente | Mantenerla; enlazar por ocurrencia sin perder contexto | API transaccional, autorización, auditoría/idempotencia pendientes |
| Otras ocurrencias | No existen listas por fecha | Consulta de fixtures; marcas solo donde haya escenario explícito | Contrato y reglas de operación pendientes |
| Alta/edición/cancelación de horario | No funcional | Solo explicación; no mutación | Especificación aparte, Q2 si hay impacto |
| WhatsApp/push/sincronización/offline | Envío/push/sync/offline real no funcionales | Mantener simulaciones y etiquetas existentes | Implementación y pruebas posteriores; sin envío automático a alumno |

**Toda navegación nueva está especificada, no construida por esta entrega.** No confundir el hecho de que la asistencia actual responda a clics con datos, deuda o pagos reales.

### Campos mínimos para representar (nombres orientativos, no esquema SQL)

- Contexto: fecha de hoy del instituto, zona `America/Montevideo`, rango consultado, origen y fecha de actualización. Autorización real de instituto por servidor, nunca por un ID enviado libremente desde UI.
- Ocurrencia: identificador estable, fecha local, inicio/fin de horario, título de clase, estado programada/cancelada; disponibilidad de lista; resumen presente/ausente/sin marcar **o desconocido**. No inventar hora final ni contador si faltan.
- Vencimiento: referencia estable de ciclo y alumno, nombre sintético/permitido, último día cubierto, próxima renovación si confirmada, estado actual confirmado y referencia a ficha. Una ocurrencia de clase y un ciclo mensual no comparten identidad.
- Datos incompletos/error son estados, no listas `[]` por defecto. Contadores pertenecen al rango/sección correctos. Orden: clases por hora, vencimientos por nombre dentro de fecha; cada ciclo una sola vez por su último día cubierto.
- Lista por **(ocurrencia, alumno)**. El booleano global `p.presente` de ENC-06 no sirve para varias fechas: reutilizarlo mostraría presencia en todas las clases. Debe aislarse en el prototipo si se amplían marcas; o mantener las otras fechas explícitamente de consulta.
- Ciclos, N, tarifas y estado provienen de dominio/servidor en producto. El agrupamiento de fechas para dibujar un mes es presentación, no recalcula vencimientos, anclas o precios. No copiar fixtures como cálculo de meses.

### Fixture mínimo para la extensión (todo sintético, sin imponer horario real)

| Identidad orientativa | Fecha y contenido | Uso |
|---|---|---|
| `demo-clase-2026-11-15-1800` | Danza 15/11/2026, 18:00–19:00, lista del recorrido actual | Enlace de Agenda/Hoy a misma ocurrencia; conservar simulación ENC-06 |
| `demo-clase-2026-11-17-1800` | Danza 17/11, 18:00–19:00 | Semana siguiente/Mes; consulta, no marcas futuras |
| `demo-clase-2026-11-19-1800` | Danza 19/11, 18:00–19:00 | Segundo ejemplo de horario; no definir recurrencia semanal |
| Ciclos de Rosa, Ana e Inés de ENC-06 | Vencen 15/11, 17/11 y 30/11 respectivamente; próximas renovaciones 16/11, 18/11 y 01/12 | Copiar salida ya ficticia de sus fichas, no generar pagos ni nuevas reglas |
| Ciclo histórico de Marcos | Venció 14/11, ficha actual Vencida; sin renovación confirmada | «Venció», no evento en todos los días posteriores |
| Fixture adicional de cancelada (Pruebas) | Una ocurrencia rotulada cancelada con fecha/hora conocida | Ver estado sin cancelar realmente ni corregir cobros |
| Fixture adicional pendiente de inicio (Pruebas) | Pagada, sin iniciar; sin fechas definitivas | No aparece un vencimiento calculado por horario |

No dar números de teléfono reales ni generar wa.me real. Noviembre 2026 empieza en domingo y termina en lunes: Mes debe admitir **seis filas** cuando la semana empieza en lunes. El fixture vacío no borra alumnos/pagos de otras pantallas; es escenario visible de prueba.

## 8. Accesibilidad y continuidad con ENC-02

- Reusar Boton, IconButton, FilaClase, ChipEstado, Banner, estados y tokens de Vito. Agenda agrega composición, no paleta. Acento ciruela = acción, nunca sinónimo de deuda. Claro/oscuro; texto crítico ≥4,5:1 y controles/foco ≥3:1; medir combinaciones finales, no declarar contraste por herencia.
- Cuerpo 16 px, fechas/horas legibles, ayudas ≥14 px. Objetivos 48 px preferidos, 44 mínimo; separación 8 px en acciones contiguas cuando corresponda. Navegación no se convierte en seis ítems ni oculta texto «Agenda».
- Grilla web con tabla semántica + botones nativos de fecha y encabezados de día; no asignar `role=grid` sin implementar su teclado completo. Todos los botones alcanzables con Tab/Enter/Espacio. Alternativa lineal por lista para ancho/texto grande. Equivalente accesible en RN se diseña sobre componentes reales, no copiando ARIA.
- Etiqueta de fecha: «Domingo 15 de noviembre de 2026, hoy, seleccionado, 1 clase, 1 mensualidad vence». Cancelada: aclararla en descripción. Los íconos decorativos no se anuncian otra vez; no leer solo «15, 1, 1».
- Estado seleccionado de Semana/Mes y fecha programático y visible. Expandir vencimientos tiene `aria-expanded`/equivalente. Cambios de rango/detalle anunciados en región de estado una vez, sin leer todo el mes ni alertas por cada skeleton.
- Al cambiar rango, foco permanece en su control. Al abrir ficha/lista, foco al título; Volver recupera disparador/contexto, incluso tras cobro simulado. Si desaparece un vencimiento por datos nuevos, volver al encabezado del día, no al inicio genérico.
- Texto al 200 %, 320/360/390 px, sin truncar nombres, fechas, estados, horas ni acciones. Safe area y margen inferior para que barra no tape última fila; teclado no tapa formularios existentes. Sin exigir swipe ni precisión sobre puntos pequeños. Movimiento reducido: sin transición obligatoria.
- Lector de pantalla, teclado, teléfono físico y contraste del calendario final **NO VERIFICADOS**: esta entrega no contiene pantalla nueva ejecutable.

## 9. Tareas observables / aceptación para implementación posterior

Son casos sintéticos de comprobación, **no una sesión realizada con la dueña**, ni autorización para reclutarla. Reina implementa el prototipo cuando Ada asigne; Gino verifica independientemente el candidato que se le entregue.

| ID | Tarea o estímulo | Resultado observable que debe entregar el candidato |
|---|---|---|
| AG-01 | Abrir demo sin hash; luego Agenda | Inicio Hoy intacto; cinco destinos con Agenda, Semana contiene 15/11 y Hoy local fijo. Asistencia sigue accesible desde Hoy/ficha |
| AG-02 | Encontrar la clase de hoy y abrir lista | Fecha/hora exactas 15/11 18:00–19:00; ninguna marca solo por navegar; un acceso visible Pasar lista |
| AG-03 | Consultar semana siguiente | Rango 16–22/11; clases 17 y 19 con horas. Volver a Hoy restablece fecha; nada inicia mensualidad |
| AG-04 | Mes → 17/11 → vencimiento de Ana → ficha → Volver | Panel 17/11, vence 17/11 y renovación 18/11; retorno al mismo Mes/día/expansión |
| AG-05 | Seleccionar día sin eventos | Mensaje de vacío confirmado, no error ni «todos pagaron». Elegirlo no navega a otro mes ni abre pago |
| AG-06 | Pasar de noviembre a diciembre/enero y atrás; alternar Semana/Mes | Meses/años correctos, seis filas en noviembre, selección coherente y sin trasladar día ancla financiero. Semana incluye fecha elegida |
| AG-07 | Simular presencia/cobro en la clase actual | Solo afecta la ocurrencia de hoy en memoria; no cambia otras fechas; rotulado simulado y retorno correcto. No pérdida de deuda histórica |
| AG-08 | Abrir futura/cancelada; probar Q2/Q3 | Consulta/explicación sin nuevas marcas futuras, cobros de cancelada, reintegros, corte o correcciones con impacto desconocido |
| AG-09 | Ver mensualidad Pagada, sin iniciar | Sin vencimiento definitivo en ninguna fecha del calendario; no iniciar por mirar la clase programada |
| AG-10 | Fallar solo vencimientos, luego solo clases, reintentar | Sección sana visible; error no cuenta 0; rango/fecha se conservan; datos de mes anterior no se rotulan como nuevos |
| AG-11 | Activar carga, vacío y sin conexión en Pruebas | Copy específico, sin comprobante optimista, mutaciones bloqueadas offline simulado; queda explícito que no hay API/cache |
| AG-12 | Consultar vencimiento pasado y próximo fuera de N | Marcos solo en 14/11 como «Venció», no deuda repetida cada día; Inés el 30/11 aunque no esté en Por vencer (7 días); ningún push nuevo |
| AG-13 | Revisar teclado/320 px/texto 200 %/temas | Foco/etiquetas correctos, todos los controles alcanzables, lista alternativa si no entran siete objetivos, sin desborde o clipping; capturas de ambos temas |
| AG-14 | Abrir Ver horario / Más | Límite visible, no editor/guardado falsos. Enlaces antiguos de asistencia siguen válidos |
| AG-15 | Comprobar consola y regresión ENC-06 | Sin nuevos errores JS; alta→ficha→asistencia→cobro, renovación y políticas pendientes conservadas; evidencias ligadas al SHA del candidato |

Para una futura observación autorizada, tareas en lenguaje cotidiano: «¿Cuándo son las clases de la semana que viene?», «Abrí la lista de la clase de hoy», «¿Qué mensualidades terminan el martes 17?», «Volvé a lo que estabas viendo». Registrar éxito sin ayuda, confusiones fecha/renovación y errores; **sin inventar tiempos, métricas ni resultados de usuarias**. No ejecutadas aquí.

## 10. Handoff para Reina externa y responsables

1. **Secuencia según HOJA-DE-RUTA:** Ada integra esta UX + ENC-07B en la demo (D3); Reina recibe luego el handoff para su sesión externa (I1). Los puntos 2–5 describen cómo trasladar esta especificación al prototipo; en Expo se reutilizan contratos/copy/estados, no HTML ni mutaciones del JS. Cada responsable verifica rama/HEAD y cambios concurrentes al recibir su encargo. Este documento no inicia sesiones ni autoriza SQL/app/publicación. El área del prototipo es `docs/diseno/ux/prototipo/`; usa tokens/SVG entregados por Vito, sin fijar nuevas reglas. Las seis rutas nombradas en I1 (incluida Asistencia) no exigen seis ítems inferiores: Asistencia es subruta de Agenda en esta propuesta.
2. Ajustar navegación en `prototipo.js` (`iconos`, `navegar`, rutas) conservando cinco destinos; agregar ruta Agenda con estado de vista/fecha/origen y links profundos. **Esquema propuesto**, todavía inexistente: `#agenda/semana/2026-11-15`, `#agenda/mes/2026-11-15`; `#asistencia` antiguo sigue siendo la demo actual. Un ID explícito de ocurrencia para rutas nuevas evita cargar una clase distinta. Validar hashes inválidos con mensaje y «Volver a Agenda», no fallar ni inventar datos.
3. Separar ocurrencias/estado de lista y ciclos en memoria; no duplicar `p.presente` entre fechas. Crear fixtures de §7 y componer Semana/Mes/detalle. No copiar aritmética financiera a la UI. Renderizar ambas vistas con un mismo origen de datos de ejemplo para que conteos y detalle coincidan.
4. Conectar a asistencia/ficha/cobro existentes conservando contexto de origen. No reescribir reglas ni habilitar Q2/Q3. Editor de horario, canales externos y API permanecen explícitamente no funcionales.
5. Extender los controles «Pruebas», README/HANDOFF y comprobaciones de navegación con AG-01–15 cuando ese trabajo se asigne; actualizar evidencia del candidato con capturas, consola, viewport, SHA y límites. Revisar realmente lo modificado en MCP Chrome, no presentar el ASCII de este documento como pantalla probada.

**Dependencias fuera de esta entrega:** Ada concilia navegación/alcance y asigna implementación a Reina externa (`7e0c8d1df108-developer`, sin abrirle sesión APX). Vito (`7e0c8d1df108-vito`) atiende cualquier decisión visual nueva si Ada la encarga; no se modifican sus archivos acá. Gino (`7e0c8d1df108-qa-engineer`) verifica el candidato posterior; Emma (`7e0c8d1df108-security`) revisa permisos/privacidad cuando haya datos reales. Q2/Q3 requieren definición de Ada con Nico/clienta antes de ejecutar esos bordes. No bloquean la consulta de Agenda con fixtures.

## 11. Evidencia de esta especificación y límites

- Leí protocolo, PLAN, ENC-01, ENC-02 y README/HANDOFF/fuente de ENC-06 contra HEAD citado. **Chrome real MCP Kaia**, contexto aislado `fina-enc07a`, viewport 360×780, servido temporalmente en loopback `127.0.0.1:8779/ux/prototipo/index.html`.
- Inspeccioné Hoy, entré con clic a Asistencia y luego Más. El snapshot confirma cinco destinos actuales con Asistencia; **Agenda no existe**. Asistencia muestra Danza 15/11/2026 18:00 y marcas en memoria; Más declara que horario/configuración no son recorridos implementados. Consola de esas vistas: 0 errores / 0 advertencias. No ejecuté pagos ni cambié datos reales.
- Captura de referencia **solo del prototipo base, no de Agenda**: `/home/nico/.cache/kaia-mcp-output/enc07a-base-hoy-360.png` (evidencia local auxiliar, fuera del repo). Inspección visual: a 360×780, tarjetas de cobro/vencimiento ocupan el primer pliegue y la clase queda más abajo; justifica acceso directo visible sin rediseñar Hoy. El calendario propuesto no fue renderizado ni medido.
- Comprobación documental al cierre: enlaces locales y secciones/casos AG-01–15; whitespace de diffs y archivo nuevo, alcance de archivos y comparación de prototipo/PLAN contra HEAD de cierre. Vito agregó en paralelo README/iconografía/SVG visuales y su buzón: **esos cambios son ajenos**, se preservan y no se declaran como míos ni como árbol visual sin cambios. HEAD avanzó por Ada a `dc82ad2a480cb4f7c698a1bf9b26cc80d7e9796b`; no hice commit. No son tests de producto ni QA independiente.
- **NO VERIFICADOS:** pantalla Agenda, contraste/reflow final, lector de pantalla, teléfono físico, teclado nativo, API, persistencia, concurrencia, push/WhatsApp, reglas financieras ejecutadas desde Agenda, validación con usuaria o producción. Sin commit, push, deploy ni cambios de configuración.
