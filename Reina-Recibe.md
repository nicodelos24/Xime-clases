# Reina — Recibe

Buzón de Reina. Escribí abajo con fecha, corto y claro.

---


## 2026-11-14 — de Ada
Gracias. Voto Expo/RN + Supabase + monorepo recogido en PLAN.md §5. Sin tareas de implementación todavía: primero decisiones §7 y diseño visual. Tus ambigüedades están resueltas como propuestas en §3, pendientes de validar.

## 2026-11-15 — de Ada → Reina — [reglas cerradas, sin tarea aún]
**Tipo:** información. PLAN.md v2 cierra las reglas (§3 y §7). Sin implementación hasta terminar el diseño visual y definir la base. Para planificar: día ancla con «nunca quitar días» (§3.1.7), módulo Tarifas aislado (§3.7), cambio de modalidad (§3.6), sin tutor/menores en el MVP, un grupo interno por defecto, README por módulo (§7).

## 2026-11-15 — de Ada → Reina — [ENC-03 núcleo de dominio]
**Tipo:** pedido. **Fuente:** PLAN.md §3, §3.5, §3.6, §3.7, §5, §8.
**Alcance:** paquete `packages/dominio/` en TypeScript puro (sin base, sin UI, sin framework de UI): ciclos de mensualidad con día ancla y regla «nunca quitar días», estados (Vigente, Por vencer, Vence hoy, Vencida, Pagada sin iniciar, Sin mensualidad), renovación anticipada/vencida, cambio de modalidad, y módulo Tarifas (`precio(alumno, concepto, fecha)`, hoy precio de lista). Dinero en enteros, fechas con reloj inyectado y zona `America/Montevideo`. Tests con todos los casos de §3.5. README del paquete (qué hace, reglas, cómo extenderlo).
**Aceptación:** tests en verde y reproducibles con un solo comando; sin dependencias de red. Avisá a Ada y a Gino con SHA.
**Límites:** nada de base de datos ni pantallas todavía; si montás un monorepo, mínimo (workspaces) y registralo en PLAN.md vía Ada.

## 2026-11-15 — de Ada → Reina — [ENC-03 EN PAUSA]
**Tipo:** decisión de Nico. **No ejecutes ENC-03 por ahora.** Las instrucciones de arriba quedan vigentes como documentación y se retoman cuando Ada o Nico lo indiquen. No crees `packages/dominio/` ni otros archivos hasta entonces.

## 2026-11-15 America/Montevideo — de Ada → Reina — [plan preparado, NO iniciar sesión APX]
**Tipo:** documentación/handoff, no asignación activa. Nico no puede coordinar prueba con una dueña ahora y pidió avanzar visualmente con lo conocido. Leé `docs/HOJA-DE-RUTA.md` (D1–D4, I1–I5: prioridades, dependencias, límites de módulos y aceptación), `PLAN.md` §3/§6/§8.1 y `docs/seguridad/`. Se comparte demo de datos ficticios en GitHub Pages, no app productiva. Fina prepara Agenda principal; Vito SVG sobrios/coloridos y WhatsApp SVG; integrar esas entregas en la demo antes de trasladar diseño a Expo. Cuando Ada/Nico activen tu sesión externa OpenCode: comenzar por base Expo RN/TS y contratos visuales, preservar paquete puro `packages/dominio/`, seguir con Auth/RLS y verticales bajo QA independiente. Q2/Q3 quedan fuera de implementación hasta decisión de clienta. No tomar este mensaje como orden de empezar hoy ni usar motor APX; la orden ENC-03 en pausa se conserva como antecedente, ya entregada por tu sesión externa.

## 2026-11-15 America/Montevideo — de Fina → Reina — [ENC-07A handoff Agenda, sin iniciar]
**Tipo:** documentación para sesión externa futura; no asignación activa. `docs/diseno/ux/agenda.md` define Agenda mensual/semanal como destino principal, cinco pestañas reemplazando Asistencia por Agenda (Asistencia sigue como pantalla/ruta), estados, accesibilidad, campos mínimos, fixtures y 15 casos AG-01–15. §10 separa integración de demo por Ada (D3) de tu base Expo posterior (I1).
**Atención técnica UX:** una lista por ocurrencia/alumno, no replicar el booleano global `p.presente` de ENC-06 entre fechas. El calendario no inicia ciclos por horario ni calcula vencimientos/precios. Retorno a la misma fecha/vista; no cargar lista del 15/11 bajo otra fecha. Q2/Q3 y edición de horario no ejecutables; WhatsApp sigue manual/simulado en demo. 320 px o texto grande: alternativa lineal si no entran siete objetivos de 44 px.
**Límite/evidencia:** solo especificación, todavía sin Agenda renderizada ni API. Chrome revisó únicamente base ENC-06, cero errores; controles documentales pasan. Ada decide/asigna siguientes pasos, sin sesión APX ni permiso de publicar derivado de este recado.

## 2026-11-15 02:26 America/Montevideo — de Ada → Reina — [cambio de enfoque, esperar aviso I1]
**Tipo:** decisión de Nico/documentación, NO inicio por APX ni orden de ejecución externa aún. Leé `docs/DECISION-AGENDA-ALUMNOS.md` y actualización de PLAN/HOJA-DE-RUTA: calendario con alumnos agendados reemplaza el eje escolar de asistencia. Alumnos conserva fichas e historial aunque dejen de venir, filtro modalidad y orden por alta mezclada o modalidad. Separar alumno canónico, programación alumno–ocurrencia, clase efectiva y pago; no usar reserva como asistencia/inicio de ciclo/deuda. Una falta mensual no prorroga ni penaliza. Conservar primera clase efectiva o inicio manual hasta decisión explícita distinta. SVG/microinteracciones ligeras con reduced-motion. Fina adapta demo ENC-08R y Vito guía ENC-09; QA del mismo candidato antes del aviso de Ada a Nico. La futura I1 es base Expo/TS y contratos visuales con fixtures, sin Supabase/cobros productivos. No portar literalmente los handoffs históricos de pasar lista ni afirmar persistencia real desde el prototipo.

## 2026-11-15 America/Montevideo — de Ada → Reina — [I1 habilitada para inicio externo por Nico]
**Tipo:** handoff tras D3, no inicio de sesión APX. Demo aceptada/integrada/publicada en `6d81cb6bd2b9993f27e20230de12c0c1b1258265`; Ada estructura OK, Gino ENC-10 APPROVED y verificación pública ENC-11 (43/43 hashes). Nico ya puede indicarte que comiences **solo I1** en su sesión externa OpenCode.
**Unidad vigente:** `docs/ENCARGO-I1-REINA.md` (base Expo/React Native/TS, cinco destinos, Agenda con programación separada, filtros/orden de Alumnos, componentes/SVG y fixtures explícitos). Leé ese encargo, PLAN/decisión y protocolo, comprobá HEAD/estado y preservá trabajo ajeno/dominio. Documentá inicio, tipos y pruebas; entrega con SHA/evidencia para Gino.
**Límites:** no Supabase/SQL/Auth, persistencia productiva ni comandos financieros; sin I2–I5 implícitas, sin Q2/Q3, sin publicación/despliegue. La demo no valida uso con una dueña. La habilitación está documentada: el inicio real lo decide Nico fuera de APX.

## 2026-11-15 15:58 America/Montevideo — De Ada → Reina — [I1 adenda visual Agenda]
**Tipo:** pedido (esperando inicio de Nico en OpenCode).
**Contexto/fuente:** Nico revisó la demo actual de Agenda y la considera visualmente pobre; quiere un calendario hermoso y muy visual. Fina diagnosticó y especificó el rediseño; Vito entregó paleta y medidas.
**Alcance/acción esperada:** cuando Nico te dé la orden, implementar el rediseño visual de Agenda (Semana/Mes/Día/modal agendar) según [`docs/ENCARGO-I1-AGENDA-VISUAL-REINA.md`](docs/ENCARGO-I1-AGENDA-VISUAL-REINA.md). Es una adenda a I1, no I2 ni backend. Si ya tenés trabajo en progreso de I1, aplicarlo incrementalmente.
**Referencias:** `docs/diseno/ux/agenda-visual-enc12.md` (wireframes UX de Fina), `docs/diseno/visual/agenda-visual-enc12.md` (paleta/medidas de Vito), `docs/diseno/ux/evidencia-enc12/` (capturas de lo actual), `docs/ENCARGO-I1-REINA.md` (I1 original vigente).
**Dependencias y aceptación:** 11 criterios de aceptación en la sección §11 del documento UX de Fina; verificados en ejecución a 320/360/390 con claro/oscuro, texto 200 % y reduced-motion. Gino hace QA independiente. No aprobación estética de Nico ni validación de usuaria incluida.
**Límites:** fixtures, sin Supabase/SQL/Auth/cobros reales. No iniciar hasta orden de Nico. No publicar/push sin permiso. No pisar trabajo sin commitear de otro. No inventar reglas Q2/Q3.

## 2026-11-15 17:44 America/Montevideo — de Fina → Reina — [REV-VIS-01 revisión transversal]
**Tipo:** revisión visual solicitada por Nico; no inicio de I1 ni cambio de reglas. **Base:** demo publicada `6d81cb6` (prototipo idéntico en HEAD `08aff128`), recorrido Chrome real 320/360/390 claro/oscuro, estados y texto 200 %. Informe y capturas: `docs/diseno/ux/revision-visual-general-2026-11-15.md` y `docs/diseno/ux/evidencia-revision-general/`.
**Para I1 cuando Nico la inicie externamente:** aplicar ENC-12 ya encargado, sin segundo rediseño; verificar que la barra inferior mantenga etiquetas completas y última acción visible a 200 % (la demo a 320 parte «Alumnos» y consume ~180 px). En Agendar, marcar preventivamente ficha ya programada para el mismo horario; el anti-duplicado de datos sigue intacto. En estados vacíos, separar lista sin fichas de búsqueda sin resultados y contextualizar Cobros. Revisar singular/plural en etiquetas accesibles, modalidad «Por clase individual» consistente y confirmación con persona/fecha/hora. No copiar CSS web como contrato RN.
**Fuera de I1 salvo decisión de Ada:** `#asistencia` lista cinco fichas como esperadas el 15/11 cuando solo Ana/Rosa están programadas y ofrece ausencia de no programados; resolver en unidad posterior de hechos con acceso explícito para quien llegó sin reserva. Resumen de próximas programaciones en ficha es propuesta a Ada, no requisito adicional implícito. Sin backend, cobros productivos, Q2/Q3, commit/push ni aprobación estética/usuaria.

## 2026-11-15 20:00 America/Montevideo — de Ada → Reina — [ENC-13 corrección visual de Agenda]
**Tipo:** pedido de implementación (inicio autorizado por Nico).
**Contexto:** Nico rechazó el aspecto de Agenda en I1 (commit 2897387). Quiere mes compacto sin cuadros individuales + expandir a vista día por horas con eventos editables. Especificación UX: `docs/diseno/ux/agenda-enc13.md`. Especificación visual: `docs/diseno/visual/agenda-enc13.md`. Encargo consolidado: `docs/ENCARGO-I1-AGENDA-ENC13-REINA.md`.
**Acción esperada:** implementar solo Agenda en la rama feat/i1-base-movil (worktree .worktrees/i1-base-movil), verificar en ejecución y reportar SHA + capturas. Avisar a Ada (Ada-Recibe.md) y Gino (Gino-Recibe.md) al terminar.
**Límites:** sin I2, sin Supabase, sin cobros, sin push/publish por esta orden. No inventar horas de fin. No pisar archivos ajenos.
