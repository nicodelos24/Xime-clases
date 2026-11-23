# Investigación — qué debería tener una app de clases como Xime (base para la futura BD)

**Autor:** Tama (investigación). **Fecha:** 22/11/2026. **Encargo:** Nico vía Nova (22-nov, punto 6), tarea `task_b6e87a8afb3a4b7f`.

> **Alcance: SOLO planificación.** No se tocó ni activó ninguna base de datos, ni se abrieron proveedores, ni se leyeron datos reales de clientas. Las fichas y clases citadas son los contratos y datos ficticios del prototipo v5. Lo que acá se propone es una **propuesta a validar**, no un esquema aprobado ni una orden de implementar.

## 0. Resumen y recomendación

El prototipo v5 ya tiene el modelo conceptual casi completo, expresado en TypeScript puro y persistido en `localStorage` ([repositorio.ts](../v5-diseno/src/repositorio.ts), [PLAN.md §7](../v5/PLAN.md)). La futura BD debería **trasladar esos contratos casi 1:1**, no rediseñarlos: separar alumna, programación, clase efectiva y pago en entidades distintas ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)), mantener IDs estables y auditoría *append-only*, y **derivar** los estados (vencimiento, ciclo, KPIs) en vez de guardarlos ([clases.ts](../v5-diseno/src/clases.ts), [cobros.ts](../v5-diseno/src/cobros.ts)). Esto coincide con la práctica recomendada para sistemas de alumnos: una tabla por entidad, IDs en vez de copiar datos, dinero como *ledger* inmutable y auditoría con `changed_by`/`changed_at`/`motivo` ([DEV Community — Student Management System DB](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)).

Recomendación: **no crear la BD todavía**. Primero cerrar las preguntas abiertas del §D (especialmente precios, gracia/bloqueo y cuál regla de vencimiento manda), porque son decisiones de producto que cambian columnas.

---

## A. Entidades y campos sugeridos

Los tipos y nombres salen de los contratos reales del prototipo ([alumnos.ts](../v5-diseno/src/alumnos.ts), [clases.ts](../v5-diseno/src/clases.ts), [agendar.ts](../v5-diseno/src/agendar.ts), [cobros.ts](../v5-diseno/src/cobros.ts), [repositorio.ts](../v5-diseno/src/repositorio.ts)). `TEXT` = texto, `INT` = entero, `DATE` = fecha civil `AAAA-MM-DD`, `TS` = instante UTC.

### Instituto (raíz de aislamiento)
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Define el límite de datos; hoy hay **un solo instituto** del piloto ([v1/PLAN.md §3](../v1/PLAN.md)). |
| `moneda`, `zona_horaria` | TEXT | `UYU` y `America/Montevideo`, fijos por instituto ([v1/PLAN.md §3](../v1/PLAN.md)). |
| `dias_aviso` | INT | Umbral de aviso: 7 por defecto, opciones 10 y «vence hoy» ([v1/PLAN.md §3.4](../v1/PLAN.md)). |

> Aunque el piloto es de un solo instituto, conviene la columna `instituto_id` en **todas** las tablas desde el primer día: la seguridad exige validar autorización y pertenencia en servidor/BD, no ocultando botones ([Clases-Emma.md](../Clases-Emma.md)).

### Usuario / membresía
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Identidad autenticada; en el prototipo es el actor local único `dueño` ([PLAN.md §7.1](../v5/PLAN.md)). |
| `instituto_id` | TEXT FK | Dos dueños nominales, mismo rol, mismo instituto ([v1/PLAN.md §3](../v1/PLAN.md)). |
| `nombre`, `email` | TEXT | Datos de la cuenta, no de la alumna. |
| `rol` | TEXT | `dueño` hoy; separar de «administrador global» de plataforma ([Clases-Emma.md](../Clases-Emma.md)). |

### Alumna (ficha canónica) — contrato `AlumnoFicha`
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Estable, prefijo `al-`; lo referencian pagos y agenda ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `nombre` | TEXT | Obligatorio, 2–80 caracteres; se normaliza acentos para iniciales ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `modalidad` | TEXT | `mensual` \| `individual`; es la **modalidad actual**, no el historial ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `grupo` | TEXT | Dato heredado de la demo; la UI ya no lo pide ni edita ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `ancla` | INT 1–31 | Día ancla del ciclo para Cobros; default 21 si no se da ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `fecha_alta` | DATE | Inmutable en edición; ordena «más recientes» ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `activo` | BOOL | La ficha se conserva aunque deje de venir; hoy no se da de baja desde la UI ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `contacto` | TEXT | Opcional y apagado por defecto (tutor/teléfono, previsto a futuro) ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `pagado` | BOOL | Informativo del primer pago; **el ledger manda**, no este flag ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |
| `color` | TEXT | Token de avatar derivado del ID, estable ([alumnos.ts](../v5-diseno/src/alumnos.ts)). |

### Grupo / plantilla de clase
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Grupo interno por defecto, sin UI de grupos en el piloto ([v1/PLAN.md §3](../v1/PLAN.md)). |
| `nombre` | TEXT | Ej. «Martes A», «Viernes» ([alumnos.ts · GRUPOS_DEMO](../v5-diseno/src/alumnos.ts)). |

### Rutina semanal (plantilla) — contrato `RutinaSemanal`
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Prefijo `rut-` ([agendar.ts](../v5-diseno/src/agendar.ts)). |
| `nombre` | TEXT | Nombre de la clase. |
| `dias` | INT[] | 0=lunes … 6=domingo, al menos uno, sin duplicados ([agendar.ts](../v5-diseno/src/agendar.ts)). |
| `desde` | DATE | Inicio visible; no se inventa pasado ([agendar.ts](../v5-diseno/src/agendar.ts)). |
| `hora` | TEXT | `HH:MM` en Montevideo ([agendar.ts](../v5-diseno/src/agendar.ts)). |
| `duracion_min` | INT | Por defecto 60 ([agendar.ts](../v5-diseno/src/agendar.ts)). |
| `excepciones` | JSON/TEXT | `fecha → 'cancelada' \| 'movida'`; la reconciliación no regenera esas fechas ([agendar.ts](../v5-diseno/src/agendar.ts)). |

> Este patrón (regla + ocurrencias + excepciones) es el recomendado para agendas recurrentes: separar «cuándo se espera», «qué pasó con cada ocurrencia» y «cambios» ([DB Designer — Recurring Appointment Design](https://www.dbdesigner.net/recurring-appointment-database-design-a-practical-guide/)). El `RECURRENCE-ID` de iCalendar identifica una instancia por su **fecha original**, aunque se mude — igual que `fechaRutina` acá ([RFC 5545 §3.8.4.4](https://www.icalendar.org/iCalendar-RFC-5545/3-8-4-4-recurrence-id.html), [RFC 5545](https://www.rfc-editor.org/info/rfc5545/)).

### Clase / ocurrencia — contrato `Clase`
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Estable: `rutinaId@fecha` en series; `suelta-…` en sueltas ([agendar.ts](../v5-diseno/src/agendar.ts), [README-funcionamiento.md](../v5-diseno/README-funcionamiento.md)). |
| `nombre` | TEXT | — |
| `fecha` | DATE | Día civil de la clase ([clases.ts](../v5-diseno/src/clases.ts)). |
| `minutos` | INT | Minutos desde 00:00 en Montevideo (15:00 → 900) ([clases.ts](../v5-diseno/src/clases.ts)). |
| `duracion_min` | INT | Puede cruzar medianoche; se calcula con el offset del día de fin ([clases.ts](../v5-diseno/src/clases.ts)). |
| `rutina_id`, `fecha_rutina` | TEXT, DATE | Plantilla y fecha original antes de mover ([clases.ts](../v5-diseno/src/clases.ts)). |
| `estado` | TEXT | `programada` \| `dada` \| `cancelada` ([clases.ts](../v5-diseno/src/clases.ts)). |
| `marcada_en` | TS \| null | Instante en que pasó a «dada» ([clases.ts](../v5-diseno/src/clases.ts)). |
| `cancelacion` | JSON \| null | `{fecha, minutos, motivo, quien, mensajes_enviados}` ([clases.ts](../v5-diseno/src/clases.ts)). |
| `eventos` | JSON[] | Auditoría *append-only*: canceló, revirtió, reprogramó, mensajes ([clases.ts](../v5-diseno/src/clases.ts)). |
| `alumnos` | ver §Programación | Hoy es un array embebido; en BD conviene tabla de relación ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)). |

### Programación (relación alumna–ocurrencia)
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | — |
| `clase_id` | TEXT FK | → clase/ocurrencia. |
| `alumna_id` | TEXT FK | → alumna, sin copiar su ficha ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)). |
| `telefono` | TEXT | Normalizado para el deep link de WhatsApp ([clases.ts · AlumnoDeClase](../v5-diseno/src/clases.ts)). |
| **unicidad** | — | Evitar dos programaciones activas de la misma alumna en la misma ocurrencia ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)). Agendar = intención, **no** presencia, deuda ni inicio de ciclo. |

### Pago (ledger) — contrato `Pago`
| Campo | Tipo | Nota |
|---|---|---|
| `id` | TEXT PK | Clave idempotente: un solo pago por doble toque ([cobros.ts](../v5-diseno/src/cobros.ts), [v1/PLAN.md §3.3](../v1/PLAN.md)). |
| `alumna_id` | TEXT FK | → alumna. |
| `periodo` | TEXT `AAAA-MM` | Mes de referencia (hoy: mes del último día cubierto) ([PLAN.md §7.2](../v5/PLAN.md)). |
| `monto_uyu` | INT | Entero positivo, congelado en el pago ([cobros.ts](../v5-diseno/src/cobros.ts)). |
| `fecha` | DATE | Día local en Montevideo en que se pagó ([cobros.ts](../v5-diseno/src/cobros.ts)). |
| `quien` | TEXT | Usuario que registró ([cobros.ts](../v5-diseno/src/cobros.ts)). |
| `anulado` | JSON \| null | `{fecha, motivo, quien}`; si no es null el pago está anulado ([cobros.ts](../v5-diseno/src/cobros.ts)). |
| **unicidad** | — | No dos pagos **activos** para la misma `(alumna_id, periodo)` ([cobros.ts](../v5-diseno/src/cobros.ts)). |

> Modelar el dinero como *ledger* de filas inmutables, nunca como un `saldo` editable, permite responder «quién cambió qué y cuándo» ([DEV Community](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)).

### Ciclo / mensualidad — **derivado, no tabla**
Estado (`vigente`, `por vencer`, `vence hoy`, `vencida`, `pagada sin iniciar`, `sin mensualidad`), vencimiento y KPIs se calculan de fechas + pagos; **no se guardan como dato editable** ([v1/PLAN.md §3.1](../v1/PLAN.md), [cobros.ts · resumenCobros](../v5-diseno/src/cobros.ts)).

### Aviso / notificación
| Campo | Tipo | Nota |
|---|---|---|
| `id`, `alumna_id`, `fecha`, `canal`, `vencimiento` | — | Cada aviso se registra para no repetirlo; hoy solo a los dueños, sin envío automático a alumnas ([v1/PLAN.md §3.4](../v1/PLAN.md), [whatsapp.ts](../v5-diseno/src/whatsapp.ts)). |

### Tarifa (config)
| Campo | Tipo | Nota |
|---|---|---|
| `id`, `concepto` (`mensual` \| `suelta`), `monto_uyu`, `vigente_desde` | — | Precio configurable por la dueña con fecha de vigencia; cambiarlo no altera pagos pasados ([v1/PLAN.md §3.7](../v1/PLAN.md)). Precios hoy desconocidos. |

### Preferencias / configuración del instituto
| Campo | Tipo | Nota |
|---|---|---|
| `dias_aviso` | INT | 7 / 10 / 0 ([v1/PLAN.md §3.4](../v1/PLAN.md)). |
| `plantilla_whatsapp` | TEXT | Texto editable precargado al cancelar ([PLAN.md §2.2](../v5/PLAN.md)). |
| `moneda`, `zona`, `formato` | TEXT | `UYU`, `America/Montevideo`, `es-UY` ([v1/PLAN.md §3](../v1/PLAN.md)). |

---

## B. Relaciones y reglas clave ya vigentes en v5

1. **ID estables, nunca basados en un campo editable.** La identidad de una clase no depende de su fecha actual: `rutinaId + fechaRutina` y prefijos `al-`/`rut-`/`suelta-` ([clases.ts](../v5-diseno/src/clases.ts), [agendar.ts](../v5-diseno/src/agendar.ts)). Mover o reprogramar conserva el ID, la hora, la duración, las alumnas y la auditoría ([README-funcionamiento.md](../v5-diseno/README-funcionamiento.md)). Esto es exactamente lo que recomienda el patrón de ocurrencias recurrentes: «la identidad no debe depender de un atributo que el usuario puede cambiar» ([DB Designer](https://www.dbdesigner.net/recurring-appointment-database-design-a-practical-guide/)) y el `RECURRENCE-ID` de RFC 5545 ([iCalendar.org](https://www.icalendar.org/iCalendar-RFC-5545/3-8-4-4-recurrence-id.html)).

2. **Ancla de vencimiento (regla confirmada por la clienta el 22-nov-2026).** El vencimiento es el **mismo día del mes siguiente** al del alta: 1-feb → 1-mar, 1-may → 1-jun. Si el día no existe en el mes destino (31, 30, 29 en febrero no bisiesto), *default seguro*: `clamp` al último día de ese mes ([cobros.ts · vencimientoDelMes](../v5-diseno/src/cobros.ts)). `periodo` es `AAAA-MM`, mes de referencia — no una fecha de cobro ([PLAN.md §7.2](../v5/PLAN.md)). **Atención:** esta regla difiere de la vieja regla D3 de [v1/PLAN.md §3.1](../v1/PLAN.md) («ciclo = primera clase posterior al pago», día ancla que vuelve al 31); ver §D.

3. **Modalidad mensual / individual.** `modalidad ∈ {mensual, individual}` en la ficha ([alumnos.ts](../v5-diseno/src/alumnos.ts)); el cambio a mitad de ciclo está incluido y no reescribe pagos viejos ([v1/PLAN.md §3.6](../v1/PLAN.md)). Una clase suelta se cobra al asistir; una falta mensual **no prorroga ni penaliza** ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)).

4. **Ledger de pagos con anulaciones, nunca borrar.** Los pagos no se editan ni se borran: se anulan con `fecha`, `motivo` y `quien` ([cobros.ts · anularPago](../v5-diseno/src/cobros.ts), [v1/PLAN.md §3.3](../v1/PLAN.md)). Corregir la fecha no sobrescribe: anula la versión anterior y registra la corregida con el mismo ID ([cobros.ts · corregirFechaPago](../v5-diseno/src/cobros.ts)). Si falla el guardado, la UI no confirma y no se aplica cambio parcial ([PLAN.md §7.2](../v5/PLAN.md)). Es el mismo principio de *ledger* inmutable + auditoría recomendado en la literatura ([DEV Community](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)).

5. **Estado de clase y auditoría.** `programada → dada` automáticamente al terminar `inicio + duración` (zona Montevideo, reloj inyectado); o `cancelada` a mano con motivo obligatorio; cancelar una ya dada revierte a `programada` ([clases.ts](../v5-diseno/src/clases.ts), [PLAN.md §2](../v5/PLAN.md)). Nunca se borra una clase; cada acción agrega un evento a `eventos` ([clases.ts](../v5-diseno/src/clases.ts)). El envío de WhatsApp se **registra como preparado**, nunca como enviado ([PLAN.md §7.1](../v5/PLAN.md)).

6. **Alumna ≠ modalidad ≠ programación ≠ clase efectiva ≠ pago** ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)). No duplicar la ficha en cada evento; no convertir una reserva en cobro ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)). Esto evita las «muchas versiones de la misma alumna» que genera el anti-patrón de una tabla única ([DEV Community](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)).

7. **Fechas: zona nombrada, no offset fijo.** Horario de verano cambia el UTC de una misma hora local; hay que guardar la hora local + zona IANA (`America/Montevideo`) y derivar el instante ([DB Designer](https://www.dbdesigner.net/recurring-appointment-database-design-a-practical-guide/), [clases.ts · desplazamientoUtcMin](../v5-diseno/src/clases.ts)). El prototipo ya deriva el offset del propio `Intl` para no tocar nada si cambia el horario ([clases.ts](../v5-diseno/src/clases.ts)).

---

## C. Funciones que la app ya hace y la futura BD debería soportar

| Función hoy | Fuente | Implicancia para la BD |
|---|---|---|
| Alta y edición de fichas (nombre, modalidad, alta inmutable, sin borrar) | [alumnos.ts](../v5-diseno/src/alumnos.ts) | `INSERT`/`UPDATE` con `activo`, sin `DELETE`; índice por `fecha_alta` y `modalidad`. |
| Filtros Todos/Mensuales/Individuales y órdenes (recientes, mensuales primero, individuales primero, por vencimiento) | [alumnos.ts · OrdenAlumnos](../v5-diseno/src/alumnos.ts), [DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md) | Consultas sobre columnas persistidas + desempate estable por ID; orden por vencimiento se deriva de pagos ([DEV Community](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)). |
| Agendar rutina semanal y clase suelta; generar ocurrencias por rango consultado | [agendar.ts](../v5-diseno/src/agendar.ts), [README-funcionamiento.md](../v5-diseno/README-funcionamiento.md) | Materializar ocurrencias del mes/semana visible, sin duplicar IDs ni inventar pasado ([DB Designer](https://www.dbdesigner.net/recurring-appointment-database-design-a-practical-guide/)). |
| Cancelar / revertir / reprogramar «cambiar de día» conservando ID e historial | [clases.ts](../v5-diseno/src/clases.ts), [README-funcionamiento.md](../v5-diseno/README-funcionamiento.md) | Excepción por `(rutina_id, fecha_rutina)` + evento de auditoría en una sola escritura atómica ([README-funcionamiento.md](../v5-diseno/README-funcionamiento.md)). |
| Auto-marcado por reloj y reconciliación al abrir / volver de segundo plano | [clases.ts](../v5-diseno/src/clases.ts), [PLAN.md §7](../v5/PLAN.md) | Guardar `marcada_en`; un job/reconciliación idempotente, no marcar antes de `inicio+duración` ([PLAN.md §5](../v5/PLAN.md)). |
| Registrar / anular / corregir pago; KPIs y avisos con umbral 7/10/0 | [cobros.ts](../v5-diseno/src/cobros.ts), [resumen.ts](../v5-diseno/src/resumen.ts) | Ledger inmutable, unicidad `(alumna_id, periodo)` activo, índice por alumna y período ([DEV Community](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)). |
| Deep links `wa.me` con texto editable (masivo / individual / ninguno), sin envío automático | [whatsapp.ts](../v5-diseno/src/whatsapp.ts), [PLAN.md §3](../v5/PLAN.md) | Guardar la plantilla y el registro del canal preparado, no un «enviado» ([PLAN.md §7.1](../v5/PLAN.md)). |
| Persistencia atómica: si falla el disco, nada avanza | [repositorio.ts](../v5-diseno/src/repositorio.ts), [PLAN.md §7](../v5/PLAN.md) | Transacciones en la BD; escritura obligatoria de estado + auditoría + excepción juntas ([README-funcionamiento.md](../v5-diseno/README-funcionamiento.md)). |
| Auditoría de cancelación, reversión, reprogramación y mensajes | [clases.ts · EventoClase](../v5-diseno/src/clases.ts) | Tabla de eventos *append-only*; la Fase 4 la convierte en tabla sin cambiar la UI ([clases.ts](../v5-diseno/src/clases.ts)). |
| Vistas Hoy / Día / Semana / Mes / Alumnos / Cobros (demo) | [resumen.ts](../v5-diseno/src/resumen.ts), [index.html](../v5-diseno/index.html) | Derivar resúmenes en lectura; indexar por fecha para las consultas calientes ([DEV Community](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12)). |

---

## D. Brechas y preguntas abiertas para Nico

1. **¿Cuál regla de vencimiento manda?** La clienta confirmó el 22-nov el «mismo día del mes siguiente» ([cobros.ts](../v5-diseno/src/cobros.ts)), pero la regla histórica D3 decía que el ciclo arranca en la **primera clase posterior al pago** y el ancla vuelve al 31 ([v1/PLAN.md §3.1](../v1/PLAN.md)). Son modelos distintos: uno afecta solo la fecha de vencimiento, el otro el inicio/cobertura del ciclo. Confirmar si la regla vieja quedó **reemplazada** del todo (incluido «pagada, sin iniciar») o convive. *Esto decide si `ciclo` es tabla o derivado y qué guardamos por alumna.*
2. **Precios y tarifas:** no se conocen el monto de la mensualidad ni el de la clase suelta; hoy no van fijos en código ([v1/PLAN.md §3.7](../v1/PLAN.md)). ¿Con cuánto se carga la tabla `tarifa`?
3. **Gracia / bloqueo:** sin definir. «Vencida» es informativa; Nico aún no sabe cómo lo quiere la clienta ([v1/PLAN.md §3.1.6](../v1/PLAN.md)). ¿Guardamos columnas `dias_gracia` y `bloquear` desde ya, o esperamos?
4. **Recuperos y política de cancelación:** explícitamente fuera del MVP ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)). ¿Se descarta para siempre o se deja espacio en el modelo de clase?
5. **Q2/Q3 sin automatizar:** ajuste de asistencia ya cobrada y efecto de «Terminar hoy» requieren definición de la clienta ([Clases-Ada.md](../Clases-Ada.md)).
6. **Menores y tutores:** alumnos adultos en el MVP, vínculo de tutor previsto a futuro ([v1/PLAN.md §3](../v1/PLAN.md), [Clases-Emma.md](../Clases-Emma.md)). ¿La BD ya incluye `tutor` como tabla separada o se agrega cuando haya menores?
7. **Multi-instituto:** hoy uno solo, pero la seguridad pide aislamiento por instituto y contemplar que una persona pertenezca a varios en fases posteriores ([Clases-Emma.md](../Clases-Emma.md)). ¿Diseñamos multi-tenant desde el inicio? (Recomendación: sí, columna `instituto_id` en todas las tablas.)
8. **WhatsApp automático (Opción B):** manual con deep link es la decisión del MVP; la API oficial queda como fase futura si Nico quiere envío automático con costo ([PLAN.md §3](../v5/PLAN.md)).
9. **Migración de datos:** los datos del prototipo son ficticios y viven en `localStorage` ([PLAN.md §7.4](../v5/PLAN.md)). ¿Se migran las fichas reales que la dueña cargó en la demo o se arranca vacío? (Mover datos reales está **fuera** de este encargo.)
10. **Facturación / DGI:** el recibo es comprobante interno, no factura ([v1/PLAN.md §3.3](../v1/PLAN.md)); contador externo ([Clases-Ada.md](../Clases-Ada.md)). Confirmar que la BD no necesita campos fiscales ahora.
11. **Verano / horario:** Uruguay hoy es UTC−3 fijo y el código deriva el offset ([clases.ts](../v5-diseno/src/clases.ts)); si vuelve el horario de verano, hay que decidir la política para horas ambiguas/inexistentes ([DB Designer](https://www.dbdesigner.net/recurring-appointment-database-design-a-practical-guide/)).

---

## E. Lo que NO se pudo verificar / límites

- **No hay BD ni app productiva.** Es todo un prototipo con datos ficticios, sin login, sin RLS, sin auditoría real en servidor ([README-funcionamiento.md](../v5-diseno/README-funcionamiento.md), [Clases-Ada.md](../Clases-Ada.md), [Clases-Emma.md](../Clases-Emma.md)). Ninguna afirmación de seguridad de producción está demostrada ([Clases-Emma.md](../Clases-Emma.md)).
- **La sesión con una dueña sigue diferida**: ningún recorrido sintético equivale a validación con usuaria real ([DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md)).
- **Regla de vencimiento en disputa** entre la confirmación del 22-nov y el plan v1 §3.1 (ver §D.1): no pude resolverla con las fuentes disponibles; requiere decisión de Nico/clienta.
- Las fuentes web son referencias de **práctica general**, no requerimientos del proyecto; se citan para respaldar los patrones propuestos, no para introducir reglas nuevas.

---

## F. Fuentes consultadas

**Internas (repositorio Xime-clases):**
- [v5/PLAN.md](../v5/PLAN.md) — reglas v5, piezas A/B/C, contrato `Pago`, publicación.
- [v5-diseno/README-funcionamiento.md](../v5-diseno/README-funcionamiento.md) — funcionamiento del prototipo, agendar/reprogramar, persistencia.
- [v5-diseno/src/alumnos.ts](../v5-diseno/src/alumnos.ts), [clases.ts](../v5-diseno/src/clases.ts), [agendar.ts](../v5-diseno/src/agendar.ts), [cobros.ts](../v5-diseno/src/cobros.ts), [whatsapp.ts](../v5-diseno/src/whatsapp.ts), [resumen.ts](../v5-diseno/src/resumen.ts) — contratos y reglas de dominio.
- [v5-diseno/src/repositorio.ts](../v5-diseno/src/repositorio.ts) — interfaz de comandos y adaptador de persistencia (el punto que cambia en Fase 4).
- [v1/PLAN.md §3](../v1/PLAN.md) — reglas de negocio históricas (mensualidad, día ancla, clase suelta, pagos, avisos, modalidad, tarifas).
- [Clases-Ada.md](../Clases-Ada.md), [Clases-Emma.md](../Clases-Emma.md) — decisiones vigentes y criterios de seguridad/privacidad.
- [DECISION-AGENDA-ALUMNOS.md](../.worktrees/i1-base-movil/docs/DECISION-AGENDA-ALUMNOS.md) — decisión de Nico del 15-nov: separación alumna/programación/clase/pago.

**Web:**
- [DEV Community — How a Student Management System Database Is Structured](https://dev.to/clast/how-a-student-management-system-database-is-structured-tables-ids-and-relationships-3k12) — una tabla por entidad, IDs, *ledger* inmutable, auditoría, *soft-delete*, índices.
- [DB Designer — Recurring Appointment Database Design](https://www.dbdesigner.net/recurring-appointment-database-design-a-practical-guide/) — regla vs. ocurrencia vs. excepción, ID estable, zonas horarias, `RECURRENCE-ID`.
- [RFC 5545 §3.8.4.4 — Recurrence ID](https://www.icalendar.org/iCalendar-RFC-5545/3-8-4-4-recurrence-id.html) y [RFC 5545 (iCalendar)](https://www.rfc-editor.org/info/rfc5545/) — estándar para identificar instancias de una serie recurrente por su fecha original.
