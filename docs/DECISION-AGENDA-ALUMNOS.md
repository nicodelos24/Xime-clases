# Agenda y Alumnos · decisión de Nico del 15/11/2026

**Fuente:** pedido directo de Nico, 02:26 de la sesión. **Estado:** decisión de producto registrada; adaptación de demo en curso, no publicada ni verificada todavía. Este cambio prevalece sobre las propuestas anteriores de asistencia como operación principal en PLAN, ENC-01, ENC-07A y los handoffs históricos. No inicia a Reina por APX ni autoriza producción.

## Experiencia acordada

- La sección antes presentada como Asistencia debe ser **Agenda/calendario**: ver quién viene qué día y agendar alumnos desde allí. No es un colegio ni exige pasar lista como actividad central.
- La ficha de cada alumno se conserva en **Alumnos**, aunque deje de venir temporalmente; quien vuelve o toma clases individuales salteadas reutiliza la misma ficha y su historial. No borrar ni duplicar la ficha al terminar un ciclo, retirar una fecha o volver a agendar.
- Alumnos permite **filtrar** Todos / Mensuales / Por clase individual y **ordenar**, independientemente del filtro: Más recientes (mezcla modalidades por fecha de alta), Mensuales primero o Por clase individual primero. Dentro de los grupos se conserva orden de alta descendente y desempate estable por identificador. No confundir fecha de alta con último pago o próxima clase.
- Desde un día de Agenda se consulta la lista programada, se busca/elige una ficha existente y se agenda. Si se necesita crear alumno, se usa el alta canónica, no una ficha paralela exclusiva del calendario. Retirar una programación no borra alumno, historial ni pago.
- Más visual, moderno, colorido y fluido: SVG acompañados de texto, microinteracciones livianas y breves, sin emojis ni efectos exagerados; respetar reducción de movimiento y no agregar dependencias pesadas.

## Límites de arquitectura y dinero

**Alumno ≠ modalidad actual ≠ programación de una fecha ≠ clase realizada ≠ pago.**

1. Alumnos es el registro canónico del instituto: identificador estable, fecha de alta, datos de ficha y modalidad actual. El historial financiero no se reescribe al cambiar modalidad.
2. Agenda guarda la relación alumno–ocurrencia, con identificadores estables; evitar dos programaciones activas del mismo alumno en la misma ocurrencia. No almacenar copias independientes de la ficha en cada evento. La relación permite clases individuales en días salteados sin crear alumnos nuevos.
3. Ver o agendar una clase expresa intención, **no presencia efectiva**, deuda, pago ni inicio de mensualidad. Retirar programación tampoco devuelve dinero ni anula un pago. No convertir automáticamente una reserva en cobro.
4. Que un mensual falte no extiende ni pausa el ciclo, ni causa penalización o cargo nuevo. Esto no inventa recuperos ni reglas de cancelación; permanecen fuera del MVP según PLAN.
5. Se conserva por ahora la regla explícita existente de primera clase efectiva posterior al pago o fecha manual fijada por la dueña para iniciar el ciclo. No inferir ese inicio de una reserva. La confirmación operativa debe ser puntual, no una obligación de pasar lista diaria. **Si Nico quisiera iniciar por primera fecha agendada aunque falte, requeriría cambiar explícitamente esa regla.**
6. Clase individual continúa cobrándose por clase efectivamente realizada; mientras se redefine su interacción, no cargar deuda por una programación ni ausencia. Q2/Q3 siguen sin automatizar.
7. La conservación durable de alumnos y programación en la app exige repositorio persistente/BD, autorización y pruebas; la demo pública solo tiene datos ficticios y debe explicar el alcance de su guardado. No presentarla como base de alumnos real.

## Alcance de esta adaptación

Sin portal del alumno, cupos, listas de espera, asignación de profesor, grupos visibles, recurrencias automáticas, recuperos ni nueva política de cancelación. No deducirlos del verbo «agendar». Una fecha concreta es suficiente para probar el flujo de la demo sin inventar esas reglas.

- **Fina · ENC-08R:** continuar archivos parciales de ENC-08 tras fallo de conexión del motor; adaptar Agenda, Alumnos, especificación UX, fixtures, prueba sintética y evidencia Chrome. Una escritora de UX/prototipo; sin commit/push.
- **Vito · ENC-09:** guía acotada de movimiento/modernidad y pictogramas adicionales si hacen falta, solo visual. No reimplementar prototipo.
- **Ada:** conciliar arquitectura y fuentes/handoff de Reina, revisar candidato y publicar únicamente tras QA independiente de Gino.
- **Reina externa:** esperar aviso de unidad lista. No portar la pantalla escolar anterior ni tratar el handoff histórico como autorización de iniciar. I1 será base visual/contratos con fixtures; no implementación financiera ni Supabase en esa primera unidad.

## Puerta para avisar a Nico que Reina puede continuar

1. UX y demo adaptadas a ver/agendar alumnos por fecha y a filtros/orden de Alumnos, sin perder fichas ni regresiones de cobro.
2. Revisión estructural: límites entre alumnos, programación, clases efectivas y pagos; sin regla económica implícita ni acoplamiento UI–cálculos.
3. QA independiente del mismo candidato, navegación/errores y evidencia en Chrome móvil; publicación comprobada con datos ficticios.
4. Handoff I1 actualizado con base/archivos, alcance exacto, aceptación y exclusiones. Entonces Ada avisa a Nico; Nico inicia Reina en OpenCode externo.

La sesión con una dueña sigue diferida: ninguna prueba sintética equivale a validación con usuaria, teléfono físico, persistencia real, seguridad multi-tenant ni producción.
