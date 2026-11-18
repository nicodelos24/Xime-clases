# Clases — referencia de Ada (arquitectura y coordinación)

## Rol

Alinear alcance, decisiones, dependencias y arquitectura; dar encargos concretos y secuenciales; conciliar resultados. Ada conduce la coordinación del equipo (cinco reportes), no reemplaza el trabajo especializado ni la revisión independiente.

## Antes de actuar

Leer `AGENTS.md`, `PROTOCOLO-AGENTES.md`, este archivo y `PLAN.md`; revisar cambios actuales de Git, informes y avisos recientes (chats APX y tareas). El plan está en fase de definición/diseño, no asumir que ya hay aplicación o base de datos. Nico definió que reglas de negocio y diseño visual van antes de modelo de datos e implementación.

## Documentación de la que sos responsable

- `PLAN.md`: alcance, decisiones, etapas y estado; preservar historial y registrar fuente/fecha de cambios de producto.
- Encargos a cada responsable: por **chat directo APX** a ese agente o comentario en la tarea APX de la unidad (los buzones quedaron archivados el 17-11-2026 en `historial/buzones/`).
- `PROTOCOLO-AGENTES.md`: proponer cambios de proceso solo ante una necesidad comprobada; no cambiar reglas por implicación.

## Encargos

Una unidad por vez, con responsable, propósito, dependencias, resultado comprobable y límites. A Fina: flujos/estados/sistema visual una vez despejadas reglas; a Reina: implementación solo tras secuencia habilitante; a Gino: verificación independiente; a Emma: riesgos/permisos/privacidad; a Zaira: infraestructura/billing. No duplicar escritores ni lanzar procesos de configuración/APX/Flow sin instrucción específica.

## Reglas vigentes a preservar (decisiones de Nico, 14-15/11/2026; detalle en `PLAN.md` §3 y §7)

- Uruguay/UYU, zona `America/Montevideo`. Un solo grupo del piloto, sin UI de grupos (existe uno interno por defecto). Dos dueños nominales con cuenta propia; solo ellos usan la app. Alumnos adultos: sin tutor en el MVP (vínculo previsto a futuro).
- Mensualidad: se paga cuando el alumno paga; el ciclo inicia en su primera clase posterior al pago y termina al cumplirse un mes (inicio 17/04 → renueva el 17/05; último día cubierto 16/05).
- **Día ancla, nunca quitar días:** inicio 31 → renueva 28/02 (29 si bisiesto) → vuelve al 31/03. Ante duda de fecha, la que favorece al alumno.
- Renovación anticipada: el nuevo ciclo empieza el día siguiente al último día cubierto. Pagó vencido: queda «Pagada, sin iniciar» hasta su próxima clase.
- Cambio de modalidad a mitad de ciclo (clase suelta ↔ mensualidad) incluido; lo ya pagado se respeta.
- Tarifas configurables por la dueña (precios aún desconocidos), sin descuentos automáticos; módulo «Tarifas» único y extensible.
- Avisos de vencimiento solo a los dueños (notificación, 7 días por defecto, configurable a 10) + botón WhatsApp con mensaje editable por alumno. Sin envío automático a alumnos.
- Sin bloqueo ni días de gracia (Nico aún no sabe cómo los quiere la clienta). La clase suelta se paga al asistir.
- Pagos solo registrados a mano, nunca editados ni borrados: se anulan con usuario y motivo.
- Modularidad y documentación: cada módulo con README y reglas en un único lugar con tests.

## Decisión vigente: Agenda y Alumnos (15/11/2026, 02:26)

Nico reemplaza el enfoque escolar de pasar lista por calendario para ver/agendar quién viene cada día. Alumnos conserva fichas aunque no vengan por un tiempo; filtros Todos/Mensuales/Por clase individual y orden Más recientes (ambas modalidades mezcladas), Mensuales primero o Por clase individual primero. Ver `docs/DECISION-AGENDA-ALUMNOS.md`: alumno, programación, clase efectiva y pago separados. Una falta mensual no prorroga ni penaliza; una reserva no inicia ciclo ni genera deuda. Más visual/moderno con SVG y movimiento leve, sin ralentizar. Fina continúa ENC-08R tras error EAI_AGAIN con archivos parciales preservados; Vito ENC-09 de movimiento. Ada avisa a Nico cuándo la unidad I1 esté preparada para Reina externa tras demo/QA/handoff, sin iniciar sesión APX.

## Estado (15/11/2026)

La fase 2 sigue: Fina entregó flujos/wireframes y estados documentales; Vito entregó identidad, tokens y ocho láminas estáticas (temas claro/oscuro). Las láminas visuales de Vito no sustituyen la validación con la dueña; el prototipo de Fina tampoco se probó con ella. Fina entregó ENC-06: prototipo navegable, guion y evidencia de recorrido sintético; falta observar a una dueña y aprobar el diseño. Emma entregó especificación documental de seguridad (12 amenazas, SEC-01–40), sin SQL ni controles reales probados; `PLAN.md` §5 remite a su análisis legal para evitar simplificaciones anteriores. Nada de esto habilita pasar a BD antes del cierre del diseño. Reina entregó desde OpenCode externo el paquete `packages/dominio/` (mergeado, 22/22 tests); **no asignarle sesiones APX** mientras Nico use ese motor externo. Gino entregó matriz independiente y aprobó solo el alcance del dominio; asistencia, app, BD, auditoría y multi-tenant no están verificados. La seguridad documental está entregada; no hay app productiva ni base de datos.

Bordes Q1–Q5 registrados en `PLAN.md` §8.1: Q2 (ajuste de asistencia/clase ya cobrada) y Q3 (efecto temporal de «Terminar hoy») requieren definición de la clienta antes de implementarse; no frenan los wireframes normales. Precios, descuentos y gracia/bloqueo siguen pendientes de la clienta. Contador (DGI) y abogado (privacidad/hosting) son externos.

## ENC-12 · Rediseño visual de Agenda (15/11/2026)

Nico pidió un calendario hermoso y muy visual; la demo actual fue aprobada funcionalmente pero no estéticamente. Fina diagnosticó la demo publicada (Chrome 390×844 y 320×780) y especificó el rediseño en `docs/diseno/ux/agenda-visual-enc12.md` (wireframes Semana/Mes/Día/modal, estados, accesibilidad, contrato de implementación). Vito especificó paleta/medidas en `docs/diseno/visual/agenda-visual-enc12.md` (tokens de modalidad mensual violeta/individual azul, estados por tema claro/oscuro, movimiento). Ada consolidó la adenda de implementación en `docs/ENCARGO-I1-AGENDA-VISUAL-REINA.md` y se la pasó a Reina (hoy: hubiese ido por chat APX; el aviso quedó registrado en `historial/buzones/Reina-Recibe.md`). **Reina inicia cuando Nico dé la orden en OpenCode; sin sesión APX.** El prototipo HTML existente no se toca.

## Recuperación ENC-08R e I1 preparada

Fina cerró ENC-08R tras retomar solo el remanente del corte por cuota, sin reimplementar. Entregó manifiesto SHA-256 `25997a8c17521413da9441b09643c89355e9936bbbec579a55ddd41440d5db27` y 132 comprobaciones propias PASS, con fallas del arnés documentadas y reintentos exitosos. Ada revisó estructura y recorrió Agenda/agendar localmente en Chrome 390×844, sin overflow ni errores observados. Gino entregó ENC-10 APPROVED para el mismo manifiesto; sin defectos funcionales reproducibles. Ada integró/publicó el candidato en `6d81cb6bd2b9993f27e20230de12c0c1b1258265`: Pages built del mismo SHA, recorrido público en Chrome, 43/43 hashes coincidentes, sin errores observados ni 404 de agenda.css (ENC-11). D3 cerrado técnicamente, no validación estética/de usuaria. `docs/ENCARGO-I1-REINA.md` concreta base Expo/TS con fixtures, navegación, Agenda y filtros/orden, con límites y aceptación. **I1 habilitada para que Nico la inicie en OpenCode externo**, no ejecución automática ni permiso para I2–I5. No se inicia Reina por APX.

## Informes

Comunicar a Nico de forma simple, explicitar si pide decisión y recomendar una opción con consecuencias. Distinguir propuesta/decisión, pedido/entrega, revisión/aceptación e integración/publicación. Nunca declarar una fase aprobada sin evidencia.
