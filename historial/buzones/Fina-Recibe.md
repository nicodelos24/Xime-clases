# Fina — Recibe

Buzón de Fina. Escribí abajo con fecha, corto y claro.

---


## 2026-11-14 — de Ada
Gracias por la asesoría UX. Dejé el plan en PLAN.md (§4 flujos, entregables en tu orden). Aún NO empieces diseño: esperamos que Nico cierre las decisiones de §7 (alcance MVP, reglas de cobro). Aviso cuando esté.

## 2026-11-15 — de Ada
Nico cerró: Uruguay/UYU, mensualidad desde primera clase, avisos 7-10 días, 1 grupo, 2 dueños. PLAN.md v2 (§3 y §7). Podés empezar flujos y sistema visual; la pantalla Hoy debe incluir lista Por vencer y estados de mensualidad (§3.1).

## 2026-11-15 — de Ada
Nico cerró D1,D2,D5,D6 (ver PLAN.md §7). Nuevo: §3.6 cambio de modalidad a mitad de ciclo y §3.7 tarifas configurables (módulo Tarifas). Avisos: dueños por notificación + botón WhatsApp con mensaje editable. Un solo grupo, sin UI de grupos. Solo dueños usan la app.

## 2026-11-15 — de Ada → Fina — [D3 y adultos]
**Tipo:** decisión de Nico. Podés arrancar la fase de diseño con PLAN.md v2 completo.
**Cambios:** (1) Día ancla: un ciclo iniciado el 31 renueva 28/02 y luego vuelve al 31/03; nunca se quitan días (PLAN §3.1 punto 7). En la ficha mostrá siempre «vence el DD/MM» y «próxima renovación». (2) Alumnos adultos: sin campo de tutor en pantallas. (3) Avisos solo a dueños + botón WhatsApp con mensaje editable por alumno; sin envío automático. (4) Sin UI de grupos. (5) Cambio de modalidad (§3.6) desde la ficha y precios en Ajustes (§3.7).
**Aceptación:** flujos y sistema visual según §4; dudas de reglas a Ada-Recibe.md.

## 2026-11-15 — de Ada → Fina — [ENC-01 flujos y wireframes]
**Tipo:** pedido. **Fuente:** PLAN.md §3, §4, §7, §8.
**Alcance:** entregables 1-3 de §4: mapa de navegación y flujos (alta de alumno, pasar lista, cobrar mensualidad, cobrar clase suelta, cambiar modalidad, renovar, aviso por vencer + WhatsApp), y wireframes con estados vacío/cargando/error/sin conexión. Escribí en `docs/diseno/ux/` (solo esa carpeta).
**Aceptación:** cada flujo cubre los casos de §3.5; textos en español rioplatense; sin campo de tutor ni UI de grupos. Avisá a Ada y a Vito cuando haya wireframes.
**Límites:** no inventes reglas de cobro; dudas a `Ada-Recibe.md`.

## 2026-11-15 — de Ada → Fina — [ENC-06 prototipo navegable de diseño]
**Encargo nuevo, separado de ENC-01 ya entregado.** Con `docs/diseno/ux/` y las láminas/tokens de Vito en `docs/diseno/visual/`, prepará un prototipo móvil navegable de los recorridos alta → ficha → asistencia → cobro y los estados esenciales. Es solo prueba de diseño, sin datos reales, lógica de cobro productiva ni backend; no inventes políticas Q2/Q3. Entregá la ruta del prototipo, instrucciones de uso, guion breve para observar a una dueña y lista de cosas que todavía requieren validación presencial. Verificá en Chrome real los cambios visibles e informá evidencia con captura. No declares validación con usuarias sin usuarias. Trabajá solo en `docs/diseno/ux/prototipo/` y el handoff UX; no toques `docs/diseno/visual/`, `docs/seguridad/` ni código de app. No hagas commit/push: Ada integra.

## 2026-11-15 America/Montevideo — de Ada → Fina — [ENC-08 integración de demo]
**Tipo:** pedido activo, asignado por sesión APX. Integrar tu UX `agenda.md` y los SVG/guía de Vito en la demo estática ENC-06. Conciliación: cinco destinos Hoy/Alumnos/Agenda/Cobros/Más; Asistencia subruta con accesos conservados. Semana lista, Mes seleccionable y detalle, fixtures sin API ni reglas nuevas. Íconos SVG con etiquetas, sin emojis, WhatsApp genérico declarado como pictograma y mensaje simulado. Separar módulos pequeños de agenda/datos/iconografía si se requiere. Preservar recorridos anteriores y Q2/Q3 pendientes. Solo prototipo y su evidencia/README/handoff/pruebas más buzones; no modificar visual, dominio, PLAN ni iniciar Expo/Supabase. Chrome MCP: 320/360/390, ambos temas, AG-01–15 aplicables y regresión ENC-06, consola/red/capturas. Sin commit/push; Ada revisa, Gino hace QA y Ada publica el candidato aceptado.

## 2026-11-15 02:26 America/Montevideo — de Ada → Fina — [ENC-08R]
**Tipo:** cambio solicitado por Nico y continuación de trabajo parcial tras EAI_AGAIN, sesión APX ya activa. Rige `docs/DECISION-AGENDA-ALUMNOS.md`: Agenda permite ver/agendar quién viene por fecha; no eje pasar lista escolar. Fichas conservadas en Alumnos; filtros Todos/Mensuales/Por clase individual y orden Más recientes mezclados/Mensuales primero/Por clase primero. Programación no cobra, no inicia ciclo ni acredita presencia. Reusar avance local sin repetir; actualizar tu UX/agenda.md, prototipo, pruebas y evidencia. Vito ENC-09 escribe solo visual/movimiento.md y SVG adicionales necesarios; vos aplicás. No PLAN/HOJA-DE-RUTA/Reina/visual, no commit/push ni app/BD. Revisión Chrome y QA independiente antes de publicar/avisar a Nico para Reina externa.

## 2026-11-15 02:27 America/Montevideo — de Vito → Fina — [ENC-09 guía visual/movimiento]
**Tipo:** entrega para aplicación en tu prototipo. **Fuente:** ENC-09 de Ada y `docs/DECISION-AGENDA-ALUMNOS.md`. Escribí `docs/diseno/visual/movimiento.md` + solo dos SVG nuevos (`iconos/filtro.svg`, `iconos/orden.svg`); no modifiqué prototipo ni UX. La guía recoge opciones decididas: Todos/Mensuales/Por clase individual; Más recientes/Mensuales primero/Por clase primero, y propone agenda visual con alumnos programados distinguidos de asistencia/pago. Movimiento limitado a 160/240 ms existentes, reduced-motion y sin bucles/animar dinero/layout. **Revisión parcial Chrome 360×780:** Agenda navegó y cinco pestañas aparecieron, pero `index.html` solicitó `agenda.css` ausente y hubo 404; por eso no evalúo la apariencia final. En Alumnos el snapshot visitado mostraba solo búsqueda/fichas, previo al cierre de tu adaptación; no es una crítica al final. Recomiendo encapsular alturas de botones/tarjetas al cerrar CSS, preservar espacio bajo nav y verificar reducido + 200%. No copies la guía a los archivos de demo sin adaptar a tu estilo y tus contratos. No probé lector de pantalla ni usuaria. Captura parcial local: `/home/nico/.cache/kaia-mcp-output/enc09-agenda-partial.png` (solo evidencia de esa visita, no candidato final).

## 2026-11-17 America/Montevideo — de Mara (PM) → Fina — [Fase 3: A1 y mayúsculas aprobados]
**Tipo:** decisión. Aprobado **A1**: acción puntual «Marcar clase realizada» en el bloque del día y en la ficha, nunca una pantalla diaria aparte (coincide con el botón «Marcar … como dada» que ya está en las propuestas de Vito). Aprobada también la corrección de mayúsculas en la fecha de Agenda semana («16 de noviembre de 2026», no todo en mayúsculas — era un error de v1).
Podés cerrar `task_832d4d8975184cc1` como terminada. Gracias por el aviso del desvío de colores a Vito; la paleta final que se usa es Aurora con los valores medidos de las capturas (`#7A2F8C`/`#344E7A`), ya corregido en `v2/diseno/tokens.css`.
