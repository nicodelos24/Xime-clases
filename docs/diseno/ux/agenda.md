# Agenda y Alumnos · ENC-08R

**Fina · 15/11/2026. Candidato de demo estática, no app productiva.** Reemplaza el enfoque escolar de ENC-07A por la [decisión de Nico del 15/11 a las 02:26](../../DECISION-AGENDA-ALUMNOS.md). ENC-07A queda en el historial Git; los casos AG conservan sus IDs con los deltas indicados abajo. La recuperación ENC-08R continúa los archivos parciales de ENC-08 tras una falla de conexión del motor; no es otra implementación paralela.

## 1. Fuentes y alcance

Precedencia: decisión reciente de Nico → PLAN en lo no sustituido → encargo de Ada → propuestas anteriores. Leí AGENTS/PROTOCOLO/PLAN/HOJA-DE-RUTA, ENC-01/02/06/07, guía de [iconografía](../visual/agenda-iconografia.md), [movimiento ENC-09](../visual/movimiento.md) y la decisión nueva. Base recibida `0cfd74eb40203e8021598c205fc74bce8e19faf6`, `master`, con cambios concurrentes preservados. Ver candidato exacto, pruebas y hashes en [evidencia ENC-08R](prototipo/evidencia/ENC-08R.md).

Se implementa **solo la demo HTML/CSS/JS y este handoff UX**. No Expo, dominio productivo, Supabase, producción, publicación, commit ni push. Ada revisa/integra; Gino hace QA independiente del mismo candidato. La sesión con una dueña sigue diferida: no se declara validación con usuaria.

## 2. Modelo mental acordado

**Ficha de alumno ≠ modalidad actual ≠ programación de una fecha ≠ clase realizada ≠ pago.**

- **Alumnos:** registro canónico, ID y fecha de alta estables. La ficha permanece aunque no venga durante un tiempo. No se elimina al retirar una fecha ni se clona al volver a agendar. En esta demo se conserva **dentro de la sesión**, no después de recargar.
- **Programación:** relación `reserva.id / alumnoId / claseId`. El evento muestra nombre/modalidad desde la ficha, no una copia independiente de sus datos. Evitar dos programaciones activas del mismo alumno en la misma ocurrencia. Clases individuales pueden ser salteadas.
- **Clase realizada:** hecho confirmado puntualmente de una ocurrencia; nunca inferido del calendario. En la demo los hechos se guardan por clave `claseId:alumnoId`, separados de las reservas, sin booleano global de presencia del alumno.
- **Mensualidad:** el horario o la reserva **no inicia** el ciclo. Sigue primera clase efectiva posterior al pago o fecha manual de la dueña. La fecha manual no se ejecuta aquí. Si un mensual falta, Agenda no pausa/prorroga/descuenta ni agrega cargos.
- **Clase individual:** se cobra por clase efectivamente realizada. Reservar o no venir no genera deuda. El recorrido financiero heredado solo simula la ocurrencia fija del 15/11; no se generaliza a nuevas fechas.
- **Retirar programación:** elimina solo esa relación activa; conserva ficha, hechos realizados e historial financiero. No cancela una clase cobrada, no devuelve ni anula pagos. Corregir hechos/pagos sigue fuera de esta acción y Q2 permanece pendiente.

No hay recurrencias automáticas, cupos, lista de espera, docentes, grupos visibles, portal del alumno ni recuperos. La semana lunes–domingo es presentación, no regla de días de clase. «Ver horario» explica el límite: no editor general ni configuración guardada.

## 3. Navegación

```text
Hoy · Alumnos · Agenda · Cobros · Más
                 ├── Semana / Mes → día → quién viene
                 │                        ├── Agendar alumno → buscar / modalidad / ficha existente
                 │                        │                      └── Crear ficha nueva → alta canónica → selector
                 │                        ├── Ver programación → ficha / retirar programación
                 │                        └── Vencimientos → ficha → renovación / WhatsApp simulado
                 └── subruta histórica #asistencia: registro puntual de clase realizada
Hoy / ficha → Registrar clase realizada (recorrido de prueba, no pasar lista obligatorio)
Más → Horario y clases → Agenda
```

Cinco destinos, sin sexta pestaña. Apertura sin hash en Hoy; Agenda es visible en barra y con entrada lavanda en Hoy. Hoy conserva métricas, Por vencer y accesos de cobro. `#asistencia` sigue válido, presentado como **Clase realizada**, no actividad central escolar. Activa Agenda en la barra.

Al volver desde ficha, detalle, programación o cobro se conserva vista, fecha, expansión de vencimientos y posición/origen durante la sesión. El botón Volver a Agenda restaura foco al disparador cuando existe; si fue retirado, al detalle/título. Navegación de rango mantiene foco en su control; anuncios breves en una región de estado. Altas, búsqueda y filtros de formularios usan borrador de sesión; recargar/reiniciar borra todo.

## 4. Semana y Mes

### Semana, entrada inicial

Lista vertical de siete días, lunes a domingo. La selección inicial es **15/11/2026** del instituto (fecha fija de la demo). Encabezado con rango completo y año, zona Montevideo y controles Semana anterior / Hoy / Semana siguiente. No grilla horaria de siete columnas ni gestos obligatorios. Navegar avanza siete días y conserva día de semana; no autoabre ni realiza clases.

Cada día muestra fecha, Hoy si corresponde, clase/hora y **personas programadas** (nombre/modalidad), acceso Ver programación y Agendar alumno. El día vacío lo declara y permite agendar. Primera entrada no hace autoscroll que oculte controles; Ir al día de hoy lleva al encabezado de ese día.

Vencimientos agrupados, inicialmente contraídos: «N mensualidades vencen este día», con singular y pasado correctos. Al expandir: nombre, Vence/Venció el DD/MM y Próxima renovación DD/MM → Ver ficha. Es un evento de fin de cobertura, **no prueba de impago**; el estado actual se explica por separado. No mostrar renovaciones como nuevos cobros ni fecha de vencimiento para Pagada, sin iniciar.

### Mes, fecha seleccionable con detalle

Tabla semántica lunes–domingo con botones de fecha, `scope=col`, selección programática y etiqueta completa. Leyenda distingue icono calendario + cantidad de clases e icono reloj + vencimientos. Las canceladas están incluidas en el conteo de clases y la etiqueta lo aclara. Hoy tiene texto propio; seleccionado, contorno y estado accesible. Noviembre de 2026 tiene seis filas.

El detalle del día elegido muestra las mismas personas/acciones que Semana. Cambiar fecha no abre cobro ni muta reservas. Cambio de mes conserva día si existe; si no, último día de ese mes, **solo presentación**, sin cambiar ancla de mensualidad. El rango incluye años y resuelve cruces de diciembre/enero.

Cuando no entran siete objetivos de 44 px (320 px en la composición actual), se usa lista lineal de días. Con texto ampliado también. **En esa alternativa el detalle seleccionado se coloca primero**, para no exigir atravesar los treinta días antes de ver quién viene. Semana continúa siendo la vista de operación preferida. La tabla oculta no queda en el árbol accesible.

## 5. Agendar, retirar y reutilizar

1. En un día, Agendar alumno abre pantalla completa con fecha explícita.
2. Buscar alumno para agendar y Modalidad para agendar (Todos / Mensuales / Por clase individual). Las opciones provienen de la misma colección canónica de Alumnos, también las fichas antiguas.
3. Elegir alumno y clase/horario de ese día. Si el día no tiene clase, la demo exige **hora explícita para una ocurrencia de ese día**, sin crear una serie ni asumir duración/cupo. No es editor general de horario. Una cancelada no puede recibir reservas.
4. Confirmar programación muestra confirmación de sesión y vuelve al día/vista elegidos. No cambia presencia, deuda, pago, inicio o vencimiento. El doble intento sobre alumno–ocurrencia se rechaza con mensaje, no se duplica.
5. Si falta ficha: Crear ficha nueva → mismo formulario canónico de Alumnos → vuelve al selector con esa ficha, pero **aún requiere confirmar programación**. Cancelar alta puede volver al selector. No se duplica un alumno por evento; un nombre igual no se usa como identidad.
6. Ver programación muestra persona, modalidad, fecha/hora, vínculo a ficha y Retirar programación. Confirmación explica que solo retira reserva. Luego vuelve a Agenda y la ficha sigue disponible para agendarla otra vez.

En modo offline simulado no se confirma alta, programación, retiro ni cobro. No cola offline ni guardado optimista. Los avisos superiores y el pie declaran datos ficticios y ausencia de guardado real.

## 6. Alumnos: filtro y orden independientes

| Control | Opciones / comportamiento |
|---|---|
| Modalidad de alumnos | Todos / Mensuales / Por clase individual |
| Orden de alumnos | Más recientes (fecha de alta) / Mensuales primero / Por clase individual primero |
| Más recientes | Alta descendente mezclando modalidades; **nunca último pago o próxima clase** |
| Orden por modalidad | Agrupar modalidad elegida primero; dentro de cada grupo alta descendente |
| Desempate | ID ascendente, estable |
| Buscar por nombre | Se combina con filtro y orden; sin resultados muestra Borrar búsqueda |

Labels visibles + SVG decorativo de filtro/orden; select nativo con opción seleccionada. Se mantienen filtro y orden al buscar o volver durante la sesión. La fecha de alta se presenta DD/MM/AAAA; el ID/fecha no se reescribe al reservar, pagar o faltar. La modalidad de ficha es actual; no modifica el concepto de pagos anteriores.

## 7. Estados e interacción visual

- **Normal:** clases y personas de la fecha, vencimientos a demanda; no métricas de deuda dominando Agenda.
- **Vacío:** sin clases/vencimientos confirmado, no «todos pagaron»; no borra los alumnos de la sesión.
- **Cargando:** secciones de clases y vencimientos rotuladas cargando, skeleton estático, salida manual de prueba.
- **Error parcial:** falla solo clases o vencimientos. La sección sana permanece; la otra dice sin datos, nunca 0. Reintentar conserva vista/fecha.
- **Sin conexión:** banner simulado y mutaciones bloqueadas; sin API/cache real.
- **Cancelada:** fecha/hora conservadas, texto Cancelada por el instituto y sin acciones de reserva/cobro en esa clase. No ejecuta Q2.
- **Políticas Q2/Q3:** explicación pendiente sin corrección de cobro, reintegro, reimputación ni corte automático.

Tokens claro/oscuro de Vito sin cambiar su paleta. SVG locales `currentColor`, decorativos y acompañados por texto; estados usan SVG semántico, no emoji. WhatsApp usa el pictograma genérico original **no un logo oficial**, con acción etiquetada, editor previo y apertura únicamente simulada. No números reales ni solicitudes externas.

Movimiento conforme ENC-09: 160 ms, opacity/translate máximo 4 px en regiones acotadas y 1 px de feedback de presión; sin cascadas, librerías, altura animada ni efecto obligatorio. Reduced-motion quita animación y transición. Foco visible inmediato, objetivos ≥44 px (48 preferidos), ayudas legibles, ningún color como única señal.

## 8. Aceptación AG-01–15 conciliada

Los IDs históricos se conservan; **AG-02/07/08 cambian el eje escolar** por programación y registro efectivo separado. Los 28 checks de ENC-06 usan los nombres nuevos sin borrar sus escenarios económicos sintéticos.

| ID | Resultado exigido en ENC-08R |
|---|---|
| AG-01 | Hoy inicial, cinco destinos, Semana inicial con 15/11; subruta histórica accesible desde Hoy/ficha |
| AG-02R | Ver horario y quién viene hoy → detalle de programación; no registrar realización por consultar |
| AG-03 | Semana siguiente 16–22/11, clases 17/19 y personas; sin recurrencias automáticas |
| AG-04 | Mes → 17/11 → Ana vence 17/11, renueva 18/11 → ficha → retorno con fecha/vista/expansión/foco |
| AG-05 | Día vacío declarado, Agendar alumno disponible, sin inferir pagos |
| AG-06 | Seis filas noviembre; diciembre/enero; alternancia Semana/Mes conserva fecha; sin tocar ancla financiera |
| AG-07R | Programación y hechos por ocurrencia separados. Registro efectivo de hoy/cobro sigue en regresión ENC-06, no contamina futuras |
| AG-08R | Cancelada sin reserva/cobro; futura sin marcas de hoy; Q2/Q3 siguen explicativos |
| AG-09 | Pagada, sin iniciar sin vencimiento inventado; reservar no inicia ciclo |
| AG-10 | Error parcial conserva sección sana, no muestra cero falso, reintento conserva rango |
| AG-11 | Carga/vacío/offline claros, confirmación offline bloqueada, sin cache/API ficticia |
| AG-12 | Marcos solo el 14/11 como Venció; Inés el 30/11 fuera de Por vencer 7 días |
| AG-13 | 320/360/390 claro/oscuro, texto ampliado, teclado y foco, alternativa lineal, última acción fuera de barra |
| AG-14 | Ver horario explica límite; Más enlaza Agenda; hashes históricos preservados |
| AG-15 | Sin errores JS/red y regresión 28 pertinente; fuente/pruebas/capturas atadas a manifiesto |

Casos añadidos **PG-01–09 / AL-01–08**: ficha antigua vuelve, no autoagenda, retiro conserva ficha, individual salteado, anti-duplicado, alta canónica, hora explícita, sin efecto financiero por reservar/faltar, filtros, orden por alta y desempate estable. Ver callbacks y resultados en [evidencia](prototipo/evidencia/ENC-08R.md).

## 9. Handoff y límites

[Demo / instrucciones](prototipo/README.md) · [handoff modular](prototipo/HANDOFF.md). Reina externa puede reutilizar jerarquía/copy/contratos y recursos visuales, **no las mutaciones financieras fijas del prototipo**. La programación real requiere repositorio persistente, autorización e idempotencia; la demo no demuestra conservación durable, RLS, concurrencia ni seguridad.

Validación con dueña, teléfono físico, lector de pantalla, texto nativo del SO, WhatsApp real, app/BD y publicación siguen **NO VERIFICADOS**. Fecha manual e interacción productiva definitiva de confirmación efectiva quedan para una unidad futura; no se inventa inicio por reserva. Ada concilia el plan y entrega a Gino el mismo candidato antes de integrar/publicar; esta revisión de Fina no los reemplaza.
