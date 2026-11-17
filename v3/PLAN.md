# Clases v3 — plan de producto (17/11/2026)

> Reemplaza a `../v2/PLAN.md`. La v2 queda commiteada como referencia (v1, v2 y v3 conviven en el repo).
> Lo que este plan no cambia **se hereda de la v1/v2 tal cual** — en especial las reglas de negocio §3 de la v1 (mensualidad con día ancla, clase suelta, pagos anulables, avisos N días, tarifas configurables, UYU/Montevideo, 2 dueños, un grupo, alumnos adultos).

## 1. Por qué una v3

Lo que dijo Nico el 17/11/2026 de la v2:
- **«Iba bien pero la cagaron»** — la v2 avanzó mucho (5 módulos, Aurora, 89 tests) pero el resultado visual **no convence**: sigue pareciéndose más a lo que no quería que a lo que pidió.
- La demo en Pages funciona y carga sin errores; el problema no es técnico, es de **diseño y resultado**.
- Por eso: **no se parchea la v2**. Se hace una **v3 en carpeta nueva**, tomando de la v2 solo lo que está bien resuelto.

## 2. Qué se conserva (copia directa, no se rediseña)

1. **Agenda en dos vistas — intocable.** Es lo único que Nico aprobó siempre:
   - **Mes compacto** (`v2/referencias/agenda-mes.png`): calendario limpio, círculo en hoy/día elegido, puntos ● mensual ◆ individual con leyenda, «Hoy» y «+ Agendar».
   - **Semana con horario** (`v2/referencias/agenda-semana.png`): tira de 7 días, línea de tiempo, tarjetas por alumno con inicial, hora y etiqueta de modalidad (violeta=Mensual, azul=Individual), «‹ Mes».
   - Estas capturas siguen siendo **criterio de aceptación visual**: si un cambio las altera, no se integra.
2. **Dominio y reglas de negocio:** `v2/packages/dominio` (mensualidad, tarifas, fechas) y `v2/packages/datos` pasan a la v3 **con sus tests**. Son TypeScript puro y no dependen del diseño: el diseño puede cambiar mil veces sin tocarlos.
3. **Reglas de negocio de la v1 §3** (heredadas de la v2): día ancla D3, ciclo `[inicio, próximo inicio)`, avisos N=7/10/hoy, anulación de pagos, cambio de modalidad §3.6, módulo Tarifas §3.7, casos de aceptación §3.5 como tests.
4. **Decisiones cerradas D1–D7** y pendientes Q2/Q3 (esperan a la clienta).
5. **Reglas de trabajo ya acordadas:**
   - Modular: módulos no se importan entre sí, test de fronteras.
   - Cero emoji: **íconos SVG propios** con color moderado.
   - Animaciones 150–350 ms, respetando movimiento reducido.
   - QA independiente (Gino) por entrega, avisos Telegram a Nico, todo commiteado y pusheado cuando convenga.

## 3. Qué se rehace y por qué (la lección de la v2)

| Se rehace | Por qué |
|---|---|
| **Sistema visual completo** | La v2 con Aurora quedó «más de lo mismo»: Nico no lo percibe como muy visual ni dopamínico. La v3 no hereda Aurora ni sus tokens: **nueva dirección visual**, con más color, contraste y vida, validada **con capturas reales en el celu** antes de escribir la app. |
| **Pantallas de Hoy, Alumnos, Cobros, Más** | Rehechas sobre el nuevo sistema visual. La Agenda se migra, no se rehace. |
| **Confirmación temprana con Nico** | Error de la v2: se construyeron 4 módulos antes de que Nico viera el resultado. En la v3, **cada módulo se aprueba en el celu antes del siguiente** (demo subida a Pages + Telegram). |

## 4. Tecnología

Se mantiene **Expo + React Native + TypeScript + Supabase** (v2 lo validó: anda en Pages, 89 tests, exporta a Android/iPhone por EAS). La tecnología no fue el problema de la v2.
- Animaciones: Reanimated (+ Moti si hace falta).
- Base de datos: Supabase en su fase (6).
- Estructura: igual que la v2 (apps/mobile, modules/*, packages/ui|dominio|datos) — funcionó y evita re-lear.

## 5. Fases

| # | Fase | Quién | Entrega | Sale cuando… |
|---|---|---|---|---|
| 1 | **Nueva dirección visual** | Vito (+Fina) | 2–3 propuestas visuales fuertes (no derivadas de Aurora), aplicadas a Hoy como ejemplo, mostradas a Nico **en el celu** | **Nico elige una** — puerta dura, no se escribe la app antes |
| 2 | **Cimiento v3** | Reina | Carpeta `v3/` con la misma estructura modular; dominio+datos portados con sus tests; **Agenda migrada sin un cambio visual** (capturas de referencia) | Gino: tests verdes y Agenda igual a la referencia |
| 3 | **Módulo a módulo, con aprov. de Nico en el celu** | Reina + Vito | Hoy → Alumnos → Cobros → Más, uno por vez: implementado con la dirección elegida, subido a Pages, avisado por Telegram, **aprobado por Nico** antes de seguir | Por cada módulo: visto de Nico + QA de Gino |
| 4 | Datos y seguridad | Ada + Emma + Reina | Supabase: tablas, login de 2 dueños, seguridad por instituto, auditoría de pagos | Gino prueba aislamiento, fechas y anulaciones |
| 5 | Piloto | Zaira + Gino | Builds de prueba (TestFlight / Play interno), backups | 1–2 ciclos mensuales sin diferencias |

**Diferencia clave con la v2 (fase 3):** Nico aprueba cada módulo **desde el celu** antes de que se construya el siguiente. Nada se construye en cascada sin verlo.

## 6. Riesgos

- **Que la v3 caiga en el mismo lugar que la v2:** mitigado por la fase 1 (propuestas mostradas en el celu ANTES de escribir la app) y la fase 3 (aprobación módulo a módulo).
- **Que la Agenda conservada cambie al migrarla:** capturas de `v2/referencias/` como criterio de aceptación, igual que en la v2.
- **Costo de repetir versión:** la v3 reusa dominio, datos y reglas probadas (89 tests); lo que se rehace es solo la capa visual, que es donde falló la v2. No se empieza de cero.
- **Q2/Q3 sin definir:** no bloquean hasta Cobros.

## 7. Estado de partida

- La v2 queda cerrada como referencia (HEAD master `29611f0`, worktree fase5 `9f3a4fd`).
- La carpeta `v3/` nace con este plan. Fase 1 arranca cuando Nico lo apruebe.
- Demo v2 en Pages sigue viva mientras tanto: https://nicodelos24.github.io/Xime-clases/
