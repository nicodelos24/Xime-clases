# Hoja de ruta modular · Xime-clases

> **Actualización de Nico, 15/11/2026 02:26:** rige [DECISION-AGENDA-ALUMNOS.md](DECISION-AGENDA-ALUMNOS.md). La integración parcial ENC-08 se interrumpió por fallo de conexión del motor, no se publicó. ENC-08R adapta lo pendiente: calendario con alumnos agendados (no lista escolar), fichas conservadas, filtros por modalidad y orden de alta o modalidad. ENC-09 incorpora guía de movimiento ligero e iconos. D3 aún no cumple la puerta para iniciar I1; Ada avisa a Nico al verificarla.

**15/11/2026 · Encargo de Nico.** La prueba con una dueña no se puede coordinar por ahora: no se inventa una aprobación UX. En su lugar se comparte una **demo pública con datos ficticios** para revisión visual y se avanza con las reglas ya acordadas. Q2 (corregir clase cobrada) y Q3 (corte anticipado de mensualidad) permanecen sin automatizar hasta una decisión de la clienta. La demo no es la app de producción.

## Prioridad y dependencias

| ID | Responsable | Prioridad | Entrega verificable | Depende de |
|---|---|---|---|---|
| D1 | Fina | Alta | Agenda como destino principal: calendario mobile-first, navegación clara, estados vacío/carga/error y tareas observables (`docs/diseno/ux/agenda.md`) | ENC-01/06, PLAN §3 |
| D2 | Vito | Alta | Lenguaje visual más guiado y colorido, íconos SVG reutilizables y WhatsApp SVG, sin emojis, contraste y licencias (`docs/diseno/visual/agenda-iconografia.md`) | ENC-02/06 |
| D3 | Ada | Alta | Integrar D1/D2 sin conflictos, convertir el prototipo estático en demo visual navegable de Agenda y publicarlo por GitHub Pages, comprobar ruta, vistas y errores en Chrome | D1 + D2 |
| D4 | Nico y una dueña cuando se pueda | Media, diferida | Revisar demo compartida, anotar problemas y elegir política Q2/Q3; no atribuirles pruebas que no hicieron | D3 y disponibilidad |
| I1 | Reina (sesión externa OpenCode, **no iniciar por APX**) | Alta, después del diseño demo | Base Expo/React Native TypeScript con cinco destinos Hoy, Alumnos, Agenda, Cobros, Más; detalle de día con alumnos agendados y alta desde calendario, filtros y orden en Alumnos, componentes/tokens/SVG y movimiento reducido; fixtures sin fingir persistencia ni cobros reales | D3, handoff visual/UX |
| I2 | Reina + Emma; Gino prueba | Alta, después de I1 o en unidad aislada | Supabase esquema/migraciones, Auth de dos dueños con MFA, RLS multi-tenant, roles, auditoría y pruebas negativas; contrato de datos | PLAN §3, docs/seguridad/, I1; Q2/Q3 excluidos |
| I3 | Reina; Gino prueba | Alta | Registro durable de alumnos adultos e historial, horario/ocurrencias y programación alumno–ocurrencia, confirmación puntual de clase efectiva separada de reserva y mensualidad según `packages/dominio`, pruebas de fecha y estados | I2, dominio; calendario no infiere asistencia del horario |
| I4 | Reina; Emma revisa, Gino prueba | Alta | Cobros manuales e idempotentes, deuda de clase suelta, ajustes de monto con motivo, anulación auditable, aviso de vencimiento a dueños y enlace WhatsApp **editable/manual** | I2–I3; Q2/Q3 aislados sin automatizar |
| I5 | Gino + Ada | Alta, puerta de release | Pruebas end-to-end y RLS A/B, dinero/fechas, navegación y accesibilidad móvil, sin errores ni promesas falsas; evidencia de staging | I1–I4; legal/infra por responsables externos antes de producción |

**Trabajo diferido, no borrado:** D4; Q2/Q3; validación legal/contable; pantalla real con teléfono físico/lector/texto 200 %; Zaira configura entornos, backups y restauración en la fase de datos. No implementar tutor, grupos visibles, pagos online, WhatsApp automático, bloqueo o días de gracia sin nueva decisión. Los 22 tests del dominio y los 28 checks del prototipo no prueban la app ni la BD.

## Límites de módulos para Reina

- `packages/dominio/` permanece puro: fechas, ciclos y estados sin Expo, UI, Supabase ni reloj global; ampliar con pruebas primero y no copiar su lógica en componentes.
- `apps/mobile/` (al crearla) agrupa rutas y pantallas, `components/` accesibles y tema visual; los SVG como componentes/assets versionados, sin emojis para acciones. Los íconos de estado acompañan texto; el color nunca es señal única.
- `services/` o `data/` es frontera: contratos tipados + repositorios de alumnos, agenda/asistencia, ciclos/pagos, avisos. Un proveedor de fixtures puede alimentar la demo; el proveedor Supabase implementa el mismo contrato sin reescribir pantallas. No mezclar respuestas de API con estado de componente.
- `packages/` por dominio solo si un segundo consumidor real lo necesita; no crear monorepo artificial ni generalizar pantallas por adelantado. El calendario recibe ocurrencias con `id`, instituto, fecha/hora en `America/Montevideo`, estado y acciones autorizadas; no convierte eventos en pagos o asistencias por sí mismo.
- Autorización en servidor/BD: contexto firmado, membresía vigente, MFA, RLS y pruebas multi-tenant según `docs/seguridad/`; ocultar un botón no autoriza ni protege datos. Pagos/anulaciones son comandos transaccionales, no updates de filas desde el móvil.
- WhatsApp: botón con SVG reconocible y texto editable antes de abrir enlace externo manual; nunca autoenvío, scraping de números ni confirmación falsa de entrega.
- Una unidad por PR/commit verificable: README de módulo, tipos/contrato, fixtures sintéticos, tests de comportamiento/errores y captura revisada cuando cambia UI. Reina trabaja por OpenCode externo a elección de Nico; este documento **no inicia su sesión**.

## Puertas visibles

1. **Demo GitHub Pages:** sitio público, solo datos inventados; verificar `index.html`, CSS/JS/SVG, navegación y consola en Chrome. El visitante no debe confundirse con una app operativa.
2. **Diseño listo para código:** Agenda, iconografía y flujos recibidos, integrados y mostrados a Nico; ausencia de test con dueña se registra, no se presenta como aprobado por usuaria. La petición actual de Nico permite avanzar con reglas conocidas sin esperar esa sesión; Q2/Q3 quedan fuera de los comandos hasta decidirse.
3. **Staging funcional:** QA independiente con evidencia de persistencia, aislamiento y seguridad; nada de esto se deduce de GitHub Pages ni del prototipo.
