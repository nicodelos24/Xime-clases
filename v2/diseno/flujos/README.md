# Fase 3 · Flujos y wireframes de las pantallas (v2)

**Fina · 16/11/2026.** Especificación UX para aprobación de Nico. Es diseño/definición, no implementación: no afirma backend, persistencia ni accesibilidad probada. La dirección visual final la define Vito en la fase 1 (en curso, `v2/diseno/tokens.css`); acá se especifica estructura, jerarquía y estados con roles semánticos, no paleta cerrada.

## Qué hay en esta carpeta

| Archivo | Contenido |
|---|---|
| `01-mapa-y-flujos.md` | Mapa de navegación de las 5 secciones y flujos F1–F10 con reglas de negocio citadas |
| `02-wireframes-hoy-alumnos-ficha.md` | Wireframes W1–W6: Hoy, Alumnos, Alta, Ficha, Cambiar modalidad, WhatsApp |
| `03-wireframes-cobros-mas.md` | Wireframes W7–W11: Cobros, Cobro (hoja), Comprobante, Anular, Más/Ajustes |
| `04-agenda-migracion-1a1.md` | Agenda: especificación 1:1 desde `v2/referencias/` (sin cambios de diseño) + checklist de aceptación |
| `05-estados-a11y-copy.md` | Estados por pantalla, copy es-UY y requisitos de accesibilidad |

## Fuentes que rigen

- `v2/PLAN.md` §2 (principios), §3 (alcance MVP) y §5 fase 3.
- Reglas de negocio heredadas de la v1: `v1/PLAN.md` §3 (§3.1 mensualidad, §3.2 clase suelta, §3.3 pagos, §3.4 avisos, §3.5 casos de aceptación, §3.6 cambio de modalidad, §3.7 tarifas) y decisiones D1–D7.
- `v1/docs/DECISION-AGENDA-ALUMNOS.md` (Nico, 02:26; copia en `.worktrees/integracion-enc13/docs/`): Agenda = ver/agendar quién viene por fecha, fichas conservadas en Alumnos, filtros Todos/Mensuales/Por clase individual y orden Más recientes/Mensuales primero/Por clase primero.
- Referencia visual aprobada de Agenda: `v2/referencias/agenda-mes.png` y `agenda-semana.png` (criterio de aceptación de la migración).
- Arquitectura de referencia: `v2/docs/ARQUITECTURA.md` (worktree `.worktrees/arquitectura-v2`, rama `docs/arquitectura-v2`): módulos independientes, navegación por contratos, cálculos solo en `dominio`.
- Trabajo previo propio heredado: `docs/diseno/ux/` de la v1 (01 mapas, 02 wireframes, 03 estados/copy, agenda-enc13). Los flujos de la v1 se corrigen acá al modelo Agenda/Alumnos; esa documentación histórica no se toca.

## Decisiones cerradas que aplica esta spec

- Uruguay, UYU enteros, `America/Montevideo`; solo 2 dueños usan la app; un solo grupo (sin UI de grupos); alumnos adultos (sin campo de tutor).
- Barra inferior de 5 destinos: **Hoy · Alumnos · Agenda · Cobros · Más** (como en `agenda-mes.png`).
- La mensualidad inicia en la primera clase posterior al pago (o fecha manual de la dueña); día ancla con «nunca quitar días» (D3); estados derivados del dominio, nunca calculados por la UI.
- Pagos manuales anulables (nunca editados ni borrados); sin descuentos automáticos, monto editable con motivo; Q2/Q3 no se implementan.
- Avisos: push a dueños + lista «Por vencer» en Hoy + botón WhatsApp con mensaje editable por alumno. Sin envío automático a alumnos.
- Agendar no cobra, no inicia ciclo, no marca asistencia y no borra ficha al retirar.

## Dudas abiertas (no bloquean esta spec; conciliar con Ada)

| ID | Duda | Dónde impacta |
|---|---|---|
| A1 | **Cómo se confirma una «clase realizada».** v1 §3.2 cobra la clase suelta «al asistir» y §3.1.1 inicia el ciclo en la primera clase real, pero la decisión del 15/11 02:26 quitó «pasar lista» como eje. Propuesta acá (F4): acción puntual «Marcar clase realizada» desde el bloque del día (Agenda) y desde la ficha; nunca obligatoria a diario ni automática. Necesita OK de Nico/Ada. | F3, F4, W4 |
| A2 | Hora de fin de cada clase: las referencias muestran solo hora de inicio. Se muestra inicio y, si el dominio la tiene, el fin; no se inventa duración. | 04 |
| A3 | Q2 y Q3 (ajuste por corrección de asistencia ya cobrada; «Terminar mensualidad hoy») esperan a la clienta: se especifica la pantalla con confirmación y motivo, sin política de dinero. | F4, F5, W5 |
| A4 | Push a dueños: depende de infraestructura (fase 6). Hoy lo especifica como lista + sección visible sin prometer push. | F7, W1 |
