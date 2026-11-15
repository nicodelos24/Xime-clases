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
