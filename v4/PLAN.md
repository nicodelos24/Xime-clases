# Clases v4 — plan de producto (17/11/2026, 21:30)

> Reemplaza a `../v3/PLAN.md` en lo visual. La v1/v2/v3 quedan commiteadas como referencia. Este plan lo escribe Roma (orquestador) con la decisión directa de Nico del 17/11 21:28.

## 1. Por qué una v4

Lo que dijo Nico el 17/11/2026 de los rediseños de la v3 (Pop coral suave y su reanclaje en las 3 capturas):
- **«Deshagamos todo, volvamos a empezar en limpio.»** Los rediseños v3 vistos en el celu **quedaron feos** (palabra de Nico).
- **No basarse en ningún diseño anterior.** El sistema visual v4 se escribe **desde cero**, sin heredar Aurora, Pop coral ni los rediseños de la v3.
- Lo técnico sí se conserva: la estructura modular anduvo (Pages, 89 tests), la tecnología nunca fue el problema.

## 2. Qué se conserva y qué se rehace

**Se conserva (no se toca):**
1. **Agenda en dos vistas** — lo único visual que Nico aprobó siempre; sus capturas viven ahora en `v4/referencias/`:
   - `agenda-mes.png` — mes compacto: círculo violeta en el día elegido, puntos ● mensual ◆ individual, leyenda abajo.
   - `agenda-semana.png` — «‹ Mes» arriba, tira de 7 días, línea de tiempo, tarjetas por alumno con inicial, hora y chip de modalidad (violeta=Mensual, azul=Individual), «+ Agendar».
   - Son **criterio de aceptación visual** de la Agenda: si la implementación las altera, no se integra.
2. **Reglas de negocio v1 §3** (heredadas de la v2 y v3): UYU/Montevideo, dinero entero, día ancla D3, ciclo `[inicio, próximo inicio)`, avisos N=7/10/hoy, clase suelta, pagos anulables con trazabilidad, tarifas configurables, 2 dueños, un grupo, alumnos adultos.
3. **Dominio y datos**: `v2/packages/dominio` y `v2/packages/datos` se portan **con sus tests** (TypeScript puro, no dependen del diseño).
4. **Decisiones cerradas D1–D7** y pendientes Q2/Q3 (esperan a la clienta).
5. **Reglas de trabajo acordadas**: módulos que no se importan entre sí + test de fronteras; cero emoji (íconos **SVG propios**); animaciones 150–350 ms con movimiento reducido; QA independiente (Gino) por entrega; aviso a Nico por Telegram en cada cambio visual; todo commiteado.

**Se rehace desde cero (la lección de las 3 versiones):**

| Se rehace | Cómo |
|---|---|
| **Sistema visual completo** | Nueva paleta: **turquesa + colores pastel**, pensada para una clienta mujer. Nada de neón ni coral. Animaciones «dopamínicas» pero sobrias y que no cansen la vista; nada saturado. Íconos y emoticones **solo SVG propios**, look profesional. |
| **Pantallas Hoy, Alumnos, Cobros, Más** | Diseñadas primero (Fase 1), aprobadas por Nico, implementadas una a una (Fase 3). |
| **Proceso de aprobación** | Nico aprueba el diseño **en el celu antes** de que se escriba la app; cada módulo implementado se aprueba en el celu antes del siguiente. |

## 3. Tecnología

Se mantiene **Expo + React Native + TypeScript + Supabase** (exporta a Android y iPhone por EAS; en su fase 5 van los datos de clientes). Animaciones: Reanimated (+ Moti si hace falta). Estructura modular igual a la v2: `apps/mobile`, `modules/*`, `packages/ui|dominio|datos`.

## 4. Fases

| # | Fase | Quién | Entrega | Sale cuando… |
|---|---|---|---|---|
| 1 | **Dirección visual desde cero** | Vito (+Fina) | Paleta turquesa+pastel definida con tokens; pantalla Hoy y Agenda de referencia en un demo con animaciones sobrias; AA medido; mostrado a Nico en el celu (túnel + Telegram con captura) | **Nico aprueba** — puerta dura, no se escribe la app antes |
| 2 | **Cimiento modular** | Reina | `v4/` con estructura modular; dominio+datos portados con sus tests; **Agenda migrada sin un cambio visual** | Gino: tests verdes + Agenda igual a la referencia |
| 3 | **Módulo a módulo** | Reina + Vito | Hoy → Alumnos → Cobros → Más, uno por vez, cada uno aprobado por Nico en el celu antes del siguiente | Por cada módulo: visto de Nico + QA de Gino |
| 4 | **Datos y seguridad** | Ada + Emma + Reina | Supabase: tablas de clientes, login de 2 dueños, aislamiento, auditoría de pagos | Gino prueba aislamiento, fechas y anulaciones |
| 5 | **Piloto** | Zaira + Gino | Builds de prueba (TestFlight / Play interno), backups | 1–2 ciclos mensuales sin diferencias |

## 5. Riesgos

- **Cuarta iteración visual:** mitigado con una única propuesta fuerte (no menú de alternativas) anclada a la paleta turquesa+pastel que Nico fijó, y aprobación en el celu antes de escribir la app.
- **Que la Agenda conservada cambie:** capturas de `v4/referencias/` como criterio de aceptación.
- **Costo de repetir versión:** dominio, datos y reglas probados se portan con tests; lo que se rehace es solo la capa visual.

## 6. Estado de partida

- Las v1/v2/v3 quedan cerradas como referencia (master `f7f3c59`).
- La carpeta `v4/` nace con este plan y las capturas de la Agenda. La Fase 1 arranca con la aprobación de este plan por Nico.
- Reglas de canales: avisos a Nico por Telegram; si el canal está sin arrancar, queda en cola y se reintenta.
