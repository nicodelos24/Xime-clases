# Clases — plan de producto y arquitectura (v2, decisiones de Nico del 15/11/2026 integradas)

**Fecha:** 14/11/2026. **Estado:** propuesta, no especificación aprobada ni orden de implementar. Consulté a Fina (UX), Reina (desarrollo), Gino (QA), Emma (seguridad) y Zaira (infra/billing). El repositorio todavía no tiene aplicación ni base de datos. **Secuencia acordada con Nico:** definición del producto y diseño visual primero; después modelo de datos e implementación. Las reglas del negocio se definen *antes* de dibujar pantallas, aunque el esquema SQL se haga después.

## 1. Objetivo y límites

Herramienta mobile-first para que un instituto de danza uruguayo inscriba alumnos, pase asistencia, registre cobros (mensualidad o clase suelta) y sepa qué vence y qué está impago, con **avisos de vencimiento**. Producto SaaS vendible a varios institutos aislados entre sí. El instituto cobra a sus alumnos; nuestra empresa cobra una suscripción **al instituto** (dos circuitos de dinero distintos).

**MVP (piloto con 1 instituto, 2 dueños, 1 solo grupo):** login por usuario (2 dueños), alumnos (adultos; el tutor queda como campo opcional apagado), horario de clases, asistencia, mensualidades con ciclo y vencimiento, clases sueltas cobradas al asistir, pagos manuales con anulación auditada, tablero «Hoy» (cobrado, por vencer, vencidos, clases del día), avisos de vencimiento (§3.4), reportes simples y exportación CSV, ajustes (precios, N de aviso).

**Fuera del MVP (con puntos de extensión, sin fingir que funcionan):** grupos múltiples, bloqueos/días de gracia, pagos parciales y saldo a favor, packs, pausas, recuperos, cobro online a alumnos, WhatsApp automático, portal/app del alumno, facturación electrónica DGI, datos de salud, offline para cobros. Suscripción SaaS de los primeros clientes: manual (transferencia + factura).

## 2. Usuarios y permisos (propuesta inicial)

| Rol | Puede | No puede |
|---|---|---|
| Dueño (puede haber varios; cuenta nominal y 2FA cada uno) | Configurar instituto, planes, personal, cobros, anulaciones, reportes y exportación | Ver otro instituto |
| Administrador | Operación y reportes; configuración delegada | Acceso global de plataforma |
| Recepción | Inscribir, asistir, registrar pagos y ver deuda necesaria | Anular pagos o exportar base completa sin autorización |
| Profesor | Ver sus clases y alumnos asignados; marcar asistencia | Ver montos/deuda detallada o datos de otros grupos |
| Alumno/tutor | **Fase 2:** solo su propio estado, comprobantes y avisos | Datos de otros alumnos |

Un usuario puede pertenecer a varios institutos con roles distintos; debe elegir contexto. Menores: se vinculan con responsable/tutor; no se habilita cuenta propia para un menor en MVP. Toda autorización real se impone en servidor/BD, no en botones ocultos. Acceso de soporte de plataforma separado y auditado.

## 3. Reglas de negocio (v2, según lo definido por Nico con la clienta)

**Mercado:** Uruguay, moneda UYU, zona `America/Montevideo`, formatos es-UY. Moneda y zona se guardan igual en el instituto (hoy todos iguales). Dinero en enteros.

**Piloto:** un solo grupo de clases (sin grupos en la UI) y **dos dueños con cuenta propia**, mismo rol, mismo instituto. Internamente existe un grupo por defecto invisible, para no migrar si un cliente futuro tiene varios.

**Entidades conceptuales (no tablas aún):** instituto, usuario/membresía, alumno, tutor (opcional, para el futuro), horario y ocurrencia de clase, mensualidad (ciclo), asistencia, pago, anulación, aviso, evento de auditoría. El estado de una mensualidad se deriva de fechas y pagos, no es editable.

### 3.1 Mensualidad
1. **El pago ocurre el día que el alumno paga; el ciclo comienza en su primera clase** posterior al pago y **termina al pasar un mes** desde ese inicio. Hasta esa primera clase el estado es *Pagada, sin iniciar*. La dueña puede fijar el inicio a mano.
2. **Fin del ciclo:** el ciclo cubre `[inicio, próximo-inicio)`. El **último día cubierto** es el día anterior al «mismo día del mes siguiente»: inicio 17/04 → próximo inicio 17/05 → último día cubierto 16/05 (decisión D1 de Nico: el 17/05 ya renueva).
3. **Renovación:** si paga hasta su último día cubierto, el nuevo ciclo empieza **el día siguiente** (sin perder ni regalar días y sin esperar clase), conservando el día ancla. Si paga después de vencida, queda *Pagada, sin iniciar* hasta su próxima clase.
4. Si asiste con la mensualidad vencida o sin pagar, la app avisa al pasar lista y ofrece «cobrar mensualidad» o «cobrar clase suelta». **No bloquea.**
5. Estados (siempre ícono + texto + color): Vigente · Por vencer (≤ N días) · Vence hoy (es el último día cubierto) · Vencida (desde el día siguiente) · Pagada, sin iniciar · Sin mensualidad.
6. **Sin bloqueos ni días de gracia en el MVP** (Nico aún no lo sabe). «Vencida» es informativa. La fecha de vencimiento es un dato explícito para poder agregar gracia/bloqueo luego.
7. **Día ancla y regla «nunca quitar días» (decisión D3 de Nico, 15/11/2026).** Se guarda el **día ancla** (el día del mes en que empezó el alumno: 31, por ejemplo). Los inicios de ciclo son siempre «el día ancla de cada mes»; si el mes no tiene ese día, el inicio cae en el último día del mes y **el ciclo siguiente vuelve al día ancla**. El alumno paga lo mismo que todos y **nunca pierde días por el calendario**: si hay duda entre dos fechas, se toma la que más le favorece (la posterior). Ejemplo: inicio 31/01 → renueva 28/02 (29/02 si es bisiesto) → renueva 31/03 → 30/04 → 31/05. El ciclo que empieza en un día recortado dura hasta el próximo día ancla (puede ser de 31 días). El ancla se renueva solo si el alumno queda sin ciclo continuo (paga vencido y empieza en una nueva primera clase) o si la dueña la edita a mano.

### 3.2 Clase suelta
1. Se cobra **al asistir**: al marcar presente, la app propone «Cobrar $X» en un toque. Si no paga en el momento, queda como **clase adeudada** visible en Cobros.
2. La ausencia no cobra; clase cancelada por el instituto no cobra. Corregir una asistencia ya cobrada genera un ajuste auditado.
3. Una clase suelta ya pagada no se reembolsa automáticamente al contratar mensualidad.

### 3.3 Pagos
- Solo **registro manual** (efectivo, transferencia, otro): monto, fecha, nota, usuario. La app no procesa dinero en el MVP.
- Precio por defecto vigente; la dueña puede cambiar el monto con motivo (descuento/beca). El monto queda congelado en el pago.
- Los pagos **no se editan ni se borran**: se **anulan** (contra-registro con usuario, fecha y motivo). Anular el pago de una mensualidad deja el ciclo sin efecto, con confirmación explícita.
- Doble toque o reintento: clave idempotente, un solo pago.
- Pagos parciales, saldo a favor y pagar varios meses juntos: fuera del MVP (D4). El recibo es comprobante interno, no factura DGI.

### 3.4 Avisos de vencimiento (requisito de Nico)
- Aviso **N días antes del último día cubierto**, N configurable por instituto, **7 por defecto** (opciones: 10 y «vence hoy»), con fecha local de Montevideo.
- **Dueños:** push en la app + lista «Por vencer» en Hoy, desde el MVP.
- **Alumno (D2):** sin envío automático. En la ficha hay un botón de **WhatsApp con mensaje editable** (`wa.me`: la dueña lo ve, lo ajusta y lo envía cuando le parece, un toque). WhatsApp automático, email y push al alumno: fase 2, solo si la clienta lo pide.
- Cada aviso queda registrado (a quién, cuándo, canal) para no repetirse ni perderse; si el servidor estuvo caído, se envía al recuperarse.

### 3.5 Casos de aceptación (se convierten en tests)
| Caso | Esperado |
|---|---|
| Paga 10/04, primera clase 12/04 | Inicia 12/04, último día 11/05, aviso (N=7) el 04/05 |
| Primera clase 31/01/2027 | Primer ciclo hasta 27/02/2027; renueva el 28/02; luego el 31/03 (vuelve al ancla) |
| Primera clase 31/01/2028 (bisiesto) | Último día 28/02/2028; renueva el 29/02; luego el 31/03 |
| Primera clase 31/01 y 4 renovaciones seguidas | Inicios 31/01, 28/02, 31/03, 30/04, 31/05: nunca hay días perdidos ni cobro extra |
| Primera clase 29/02/2028 | Ancla 29: último día 28/03/2028; renueva el 29/03; en 2029 renueva el 28/02 y luego el 29/03 |
| Último día 11/05; paga el 05/05 | Nuevo ciclo inicia 12/05, sin esperar clase |
| Último día 11/05; paga el 20/05 | *Pagada, sin iniciar*; inicia en su próxima clase |
| Presente de alumno por clase | Propone cobrar; si no, queda adeudada |
| Doble toque en «Confirmar pago» | Un solo pago |
| Anular un pago | Contra-registro; el original sigue visible |
| Dueño A y Dueño B | Ambos operan el mismo instituto; cada acción lleva su usuario |
| Último día cubierto, 23:59 Montevideo | «Vence hoy»; a las 00:00 siguiente «Vencida», aunque el celular esté en otra zona |

### 3.6 Cambio de modalidad a mitad de ciclo (incluido en el MVP)
Se hace desde la ficha del alumno con «Cambiar modalidad», sin tocar pagos viejos.
- **Clase suelta → mensualidad:** la dueña cobra la mensualidad (§3.1). Las clases sueltas ya pagadas quedan como están, sin reembolso automático. El ciclo empieza en su primera clase posterior al pago (la de hoy, si está asistiendo hoy).
- **Mensualidad → clase suelta:** el ciclo ya pagado **sigue hasta su último día cubierto** (no se pierde lo pagado). Desde el día siguiente pasa a clase suelta. Si la dueña quiere cortar antes, usa «Terminar mensualidad hoy», con motivo; la app no devuelve dinero sola (si hay reintegro, lo maneja ella fuera de la app y lo anota).
- Cada cambio queda en el historial (quién, cuándo, de qué a qué).

### 3.7 Tarifas y descuentos: configurables y extensibles
- La dueña carga en Ajustes el **precio de la mensualidad** y el **precio de la clase suelta** (aún no se conocen; no van fijos en el código). Se guarda con fecha de vigencia: cambiar el precio no altera pagos pasados.
- En cada cobro puede cambiar el monto con un motivo (descuento puntual). Todavía no hay reglas de descuento automáticas.
- **Diseño modular:** el cálculo del precio vive en un único módulo «Tarifas» con una interfaz estable (`precio(alumno, concepto, fecha)`). Hoy devuelve el precio de la lista; mañana ese mismo módulo puede sumar descuentos (hermanos, promociones, becas, packs) sin tocar Pagos, Asistencia ni las pantallas.

## 4. Flujos y diseño visual (trabajo inmediato, antes de SQL)

**Mapa de navegación:** barra inferior «Hoy · Alumnos · Asistencia · Cobros · Más» y acción destacada «+ Pago». «Hoy»: clases del día, cobrado hoy, **Por vencer (próximos 7/10 días)**, Vencidas y clases adeudadas; cada número abre un listado filtrado. Ficha de alumno: datos del alumno (adulto; sin tutor en el MVP), modalidad (mensualidad / clase suelta), estado de mensualidad con inicio y último día cubierto explícitos (inicio 17/04: «vence el 16/05», «próxima renovación 17/05»), historial de pagos y asistencia, botón «Avisar por WhatsApp». Alta: datos → modalidad → (si mensualidad) cobrar ahora y mostrar «comienza en su primera clase». Cobro: alumno → concepto (mensualidad o clase suelta) → monto precargado (editable con motivo) → medio → confirmar → comprobante. Asistencia: elegir clase → lista de un toque; al marcar presente a un alumno por clase o con mensualidad vencida, ofrecer cobrar. Reportes: cobrado por período/medio, vencimientos, deudas, CSV. Ajustes: precios, días de aviso, usuarios (dos dueños).

**Entregables de diseño (en este orden):** 1) Fina: mapa de tareas y flujos con reglas confirmadas; 2) Fina: wireframes de Hoy, alta, asistencia, ficha y cobro y especificación de estados/copy/accesibilidad; 3) Vito: tokens, componentes y alta fidelidad móvil en temas claro/oscuro; 4) prototipo navegable validado con al menos una dueña (y una persona de recepción solo si la clienta trabaja con recepción); 5) handoff conjunto de componentes, interacciones, copy y estados para Reina, después de cerrar el diseño. Diseño de marca cálido, moderno, austero y profesional; logo/acento configurable por instituto sin perder contraste. Estados con texto e ícono además de color; contraste WCAG AA, objetivos táctiles ≥44–48 px, tipografía escalable, lectores de pantalla, formatos de moneda y fecha localizados. Evitar gestos ocultos como único acceso a acciones críticas. En MVP conexión requerida para pagos y cambios de deuda; si falla la red no mostrar confirmación ni duplicar, se ofrece reintentar con la misma clave. Asistencia offline, si se necesita, se especifica y prueba como fase separada.

## 5. Tecnología y arquitectura propuesta

**Cliente:** React Native + Expo + TypeScript + Expo Router. Un código para Android/iPhone, builds con EAS y módulos compatibles con cámara/push si se agregan. PWA pura es viable para piloto web pero menos sólida para una app móvil de operación; Flutter agregaría Dart y dificulta compartir dominio TypeScript. Si el piloto exige panel de escritorio con tablas densas, agregar una web administrativa responsive en el mismo monorepo; no obligar a que reportes complejos vivan en una pantalla pequeña.

**Backend inicial:** Supabase (PostgreSQL, Auth, Storage y RLS) con lógica transaccional de dinero, generación de cargos e idempotencia del lado servidor (RPC SQL con permisos mínimos o Edge Functions; nunca solo cálculo confiado al móvil). No iniciar NestJS hasta que integraciones/complejidad justifiquen un servicio propio. Compartir validaciones y reglas puras en TypeScript pero dejar al servidor como autoridad; evitar dos implementaciones divergentes de cálculo de fechas. Estructura orientativa: `apps/mobile`, futuro `apps/admin`, `packages/domain` (reglas puras y tests), `packages/ui` (tokens/componentes), `packages/data` (repositorios/clientes), `supabase/` (migraciones y tests). Dependencias hacia dominio; UI no depende de datos, ni el dominio de React/Supabase. Versionar esquema/migraciones solo en la fase de datos. No guardar secretos de servidor en cliente.

**Aislamiento y seguridad:** `institute_id` en todos los recursos de tenant, membresía servidor-validada, RLS en cada tabla, storage segregado por instituto y claves/índices compuestos pertinentes. No confiar en un `institute_id` provisto por el cliente para autorizar. Servicio de soporte y claves privilegiadas nunca en móvil; probar que A no lee, edita, exporta ni sube archivos de B. Auth gestionada; segundo factor para dueños/admins si el proveedor lo permite; sesiones en Keychain/Keystore; controles de invitaciones, revocación, rate limits y logs sin secretos/PII innecesaria. Registrar actor, fecha, monto y razón de anulaciones. Minimizar datos de menores; no guardar datos de salud en MVP. Respaldos cifrados, restauración probada, ambientes dev/staging/prod separados, CI de tests/lint y despliegue a producción controlado. **Uruguay (Emma, de memoria; validar con abogado local):** Ley 18.331 y Decreto 414/009; cada instituto es responsable de su base y la inscribe en la URCDP; nosotros somos encargados de tratamiento (contrato por instituto); consentimiento del tutor para menores; derechos ARCO (5 días hábiles: exportación y anonimización por alumno); brechas a la URCDP en 72 h; **transferencia internacional:** usar región UE del hosting o validar con abogado. Dos dueños: cuentas nominales, 2FA, auditoría por usuario. Fiscalidad propia (IVA/DGI) con contador.

**Infraestructura inicial:** despliegue gestionado, BD Postgres con backups/PITR según plan contratado, almacenamiento privado de comprobantes, monitoreo de errores y uptime. Estimar por cotización vigente, no prometer presupuesto fijo: Zaira estimó orientativamente USD 25–60/mes al inicio, sin tiendas, mensajería ni costos variables. Cobro de suscripción del SaaS separado del cobro a alumnos, detrás de adaptador de proveedor; en Uruguay Stripe no opera localmente: transferencia + factura al inicio, luego Mercado Pago UY o dLocal/Plexo (por verificar tarifas); precio SaaS en UYU con ajuste semestral (decisión de Nico). Avisos: push (gratis), email (casi gratis), wa.me manual (gratis); WhatsApp API ~USD 0,01–0,05/mensaje (por verificar). Apple/Google: contratar por web, sin precios ni botones de contratación en la app (verificar). No almacenar tarjetas. Mercado Pago o enlaces de pago podrían entrar en fase 2 con cuenta del instituto y webhooks verificados, nunca haciendo pasar fondos de los alumnos por nuestra cuenta por omisión.

## 6. Fases, responsables y puerta de salida

| Fase | Entrega | Sale cuando… |
|---|---|---|
| 0. Descubrimiento / decisiones | País/moneda, entrevista con 1–3 institutos, reglas de cobro, matriz de permisos y alcance MVP firmados | Nico valida supuestos y casos borde con usuaria real |
| 1. Diseño visual (Fina + Ada) | Sistema visual, wireframes, prototipo móvil, estados y handoff | Una usuaria completa alta, asistencia y cobro sin ayuda; se corrigen tropiezos; Nico aprueba estética |
| 2. Datos y seguridad (Ada + Emma + Reina) | Diagrama de entidades, migraciones, RLS, auditoría, retención, contrato API | Gino prueba aislamientos, bordes de fechas y reversos en staging |
| 3. Implementación por verticales (Reina) | Auth/tenancy → alumnos/tutores → clases/inscripciones → cargos/asistencia → pagos → tablero/reportes | Cada vertical tiene historias, tests y demo móvil, sin simular persistencia |
| 4. Piloto y operación (Gino + Zaira) | Staging/prod, backups probados, tiendas, soporte y métricas, onboarding piloto | 1–3 institutos operan pagos reales registrados durante 1–2 ciclos mensuales sin diferencias de saldo |
| 5. Escala | Suscripción automatizada, portal, pagos online y notificaciones según evidencia | Se evalúan costos, cumplimiento y demanda de cada módulo |

**Definition of Done por historia:** criterio observable, permisos y aislamiento, casos de borde, error/offline, accesibilidad móvil, pruebas unitarias e integración, flujo E2E Android+iOS en dispositivos o emuladores y revisión visual en ambos temas. Fechas con reloj inyectado y casos 29/30/31, año bisiesto, zona y DST; dinero en enteros; concurrencia e idempotencia; rollback/restore ensayado. Un cambio visible se revisa corriendo en pantallas reales antes de entregarlo. Nadie implementa pagos con lógica solo en frontend.

## 7. Decisiones

**Cerradas por Nico (15/11/2026):**
- Uruguay/UYU. Un solo grupo (sin grupos en pantalla). Dos dueños con cuenta propia; solo ellos usan la app (D6).
- La mensualidad comienza en la primera clase posterior al pago y termina al cumplirse un mes; con inicio 17/04, el 17/05 ya renueva (D1).
- **D3:** se conserva el día ancla; tras un mes corto (31→28) el siguiente vuelve al 31; el alumno nunca pierde días, si pasa algo se le agrega (§3.1 punto 7).
- Avisos de vencimiento solo a los dueños por notificación (7 días por defecto, configurable a 10), más botón de WhatsApp con mensaje editable en cada alumno (D2). No hay envío automático a alumnos ni email.
- Sin bloqueos ni días de gracia por ahora. La clase suelta se paga al asistir.
- Cambio de modalidad a mitad de ciclo incluido (§3.6). Precios configurables por la dueña, sin descuentos automáticos pero con módulo «Tarifas» preparado (§3.7). Normalmente 2 clases por semana (D5).
- **Alumnos adultos, sin menores por ahora.** El MVP no pide datos de tutor; el modelo deja el vínculo tutor-alumno previsto como extensión futura (no se construye pantalla).

**Decididas por Ada por defecto (se cambian cuando haga falta):** pagos parciales, pagar varios meses juntos y pausas quedan fuera del MVP (D4); trámites de la empresa (contador, abogado, DGI) no frenan el diseño ni el piloto (D7).

**Sin definir (esperan a la clienta, no bloquean):** precios, descuentos, y reglas de gracia/bloqueo.

**Documentación y modularidad (requisito de Nico):** cada módulo (Alumnos, Asistencia, Mensualidades, Pagos, Tarifas, Avisos, Ajustes) tiene su carpeta con un `README` que dice qué hace, qué expone, qué reglas aplica y cómo extenderlo; las reglas de §3 viven en un único lugar de código con tests (§3.5); las decisiones se anotan en `docs/decisiones/`. Se revisa al cerrar cada módulo.

Siguiente: Fina (flujos y diseño visual); luego base de datos con Reina, Emma y Gino.

## 8. Encargos vigentes (15/11/2026)

Orden de Nico: diseño visual primero, base de datos después. Se lanzan en paralelo solo trabajos que no dependen de ninguno de los dos y que no tocan los mismos archivos.

| Responsable | Encargo | Carpeta propia | Depende de |
|---|---|---|---|
| Fina | **ENTREGADO (documental).** 9 flujos, 14 wireframes ASCII y estados/copy/accesibilidad; faltan prototipo y validación con dueña | `docs/diseno/ux/` | §3 y §7 |
| Vito | **ENTREGADO (propuesta visual estática).** Identidad «Ritmo sereno», tokens RN/CSS, contratos de componentes y ocho láminas de Hoy, ficha, asistencia y cobro (claro/oscuro). Verificó contraste de pares AA y láminas en Chrome 360×780; faltan prototipo navegable y prueba con dueña | `docs/diseno/visual/` | Fina (wireframes) para alta fidelidad |
| Reina | **ENTREGADO (15/11, sesión externa).** Núcleo de dominio puro en TypeScript (ciclos, ancla, estados, tarifas); 22/22 tests con `npm test` en `packages/dominio/`. Matriz independiente de Gino aprobó el alcance cubierto; app/BD no verificados | `packages/dominio/` | §3 |
| Gino | **ENTREGADO.** Matriz independiente y resultados: 22/22 tests del dominio pasan; flujos app/BD aún no verificados | `docs/qa/` | §3, §3.5 |
| Emma | Modelo de amenazas y especificación de aislamiento/RLS/auditoría (documento, sin SQL aún) | `docs/seguridad/` | §2, §5 |

Después (no empezar antes): base de datos (Reina + Emma + Gino), luego módulos de la app. Zaira queda en espera hasta definir entornos (fase base de datos). Reina no recibe nuevas tareas por APX: Nico la usa en una sesión externa de OpenCode.

### 8.1 Bordes de UX pendientes de conciliación (Fina, 15/11)

Estas precisiones **no sustituyen decisiones de Nico o la clienta**. El recorrido normal de diseño sigue; los bordes sin regla no se implementan hasta cerrar su política.

| ID | Lectura del plan y límite | Estado |
|---|---|---|
| Q1 | El horario previsto no inicia por sí solo la mensualidad. Se confirma con asistencia real en la primera clase posterior al pago o con fecha manual fijada por la dueña (§3.1.1); si no ocurre, permanece «Pagada, sin iniciar». Guardar quién y cuándo fijó la fecha. | Aclaración operativa para diseño, sin nuevas reglas de cobro |
| Q2 | Corregir presencia ya cobrada o cancelar clase cobrada exige ajuste auditado (§3.2.2), pero no están definidos devolución, reimputación ni efecto en un ciclo que comenzó con esa clase. No automatizar cambios ni confirmar una corrección con impacto económico desconocido. | **Pendiente de la clienta antes de implementar este borde** |
| Q3 | «Terminar mensualidad hoy» lleva motivo y no devuelve dinero automáticamente (§3.6). El plan aún no fija si cubre la clase de hoy ni el día exacto desde el que pasa a clase suelta. | **Pendiente de la clienta antes de implementar el corte anticipado** |
| Q4 | Una clase suelta adeudada antes de una mensualidad permanece deuda histórica; la mensualidad no la condona ni convierte automáticamente. Corregirla solo mediante operación auditada explícita, no en el cambio de modalidad (§3.2.3, §3.6). | Interpretación conservadora, sin saldo a favor |
| Q5 | No cobrar dos renovaciones anticipadas para el mismo ciclo: §3.3 excluye pagar varios meses juntos y exige idempotencia. La UI muestra el pago ya programado y no ofrece otro cobro hasta que corresponda. | Interpretación conservadora; validar unicidad en capa de datos |

**QA:** `docs/qa/RESULTS.md` aprueba solo lo cubierto por `packages/dominio/` (22/22); asistencia, pagos persistidos, anulación, auditoría, cambios de modalidad y aislamiento de institutos siguen sin pruebas. **Diseño:** los documentos de Fina son wireframes, no pantallas ni prototipo validado. Ninguna fase posterior queda habilitada por ese resultado aislado.
