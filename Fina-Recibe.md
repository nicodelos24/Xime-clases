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
