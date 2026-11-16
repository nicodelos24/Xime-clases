# Clases v2 — plan de producto (16/11/2026)

> Reemplaza al plan de la v1 (`../v1/PLAN.md`), que queda como archivo. Lo que acá no se cambia **se hereda de la v1 tal cual**, en especial las reglas de negocio que decidió Nico (§3 de v1).

## 1. Por qué una v2

Problemas de la v1 que dijo Nico:
- **Era monócroma:** casi no tenía referencias visuales y le faltaba vida.
- **No era modular:** se pidió una mejora del calendario y al aplicarla se rompió el resto de la app.
- **Había dudas sobre la tecnología.** La app tiene que andar en Android y en iPhone y después va a tener una base de datos de clientes.

Lo que se conserva de la v1:
- **El diseño de Agenda en dos vistas** (ver `referencias/`):
  - **Mes compacto** (`agenda-mes.png`): calendario limpio, círculo en el día de hoy o el elegido, puntos de color por tipo (● mensual, ◆ clase individual) con leyenda, botón «Hoy» y botón flotante «+ Agendar».
  - **Semana con horario** (`agenda-semana.png`): tira de 7 días, línea de tiempo por hora y tarjetas por alumno con inicial, hora y etiqueta de modalidad (violeta = Mensual, azul = Individual). Volver con «‹ Mes».
- **Las reglas de negocio de la v1** (§3): mensualidad con día ancla, clase suelta, pagos manuales anulables, avisos de vencimiento y casos de aceptación §3.5. También se conservan sus decisiones cerradas: D1–D7, Uruguay/UYU, 2 dueños, un solo grupo y alumnos adultos.
- **Las decisiones pendientes:** Q2/Q3 siguen esperando a la clienta.

Todo lo demás se rehace: interfaz, sistema visual y código.

## 2. Principios de la v2

1. **Modular de entrada.**
   - Cada sección (Hoy, Alumnos, Agenda, Cobros, Más) es un módulo independiente.
   - Un módulo no importa nada de otro: comparte solo el sistema de diseño y el dominio.
   - Cambiar Agenda no puede romper Alumnos. Eso se comprueba con tests y capturas de cada módulo en cada cambio.
2. **Muy visual.**
   - Paleta con varios colores y significado: cada modalidad, estado y sección tiene su color.
   - Íconos e ilustraciones propias, avatares con color y estados vacíos ilustrados.
   - Jerarquía clara.
   - Nada de pantallas grises.
3. **Animaciones que den gusto, sin exagerar.**
   - Micro-interacciones al tocar, transiciones suaves entre Mes y Semana, tarjetas que entran escalonadas y un pequeño festejo al registrar un pago.
   - Todo dura 150–350 ms y respeta el «movimiento reducido» del teléfono.
4. **La Agenda aprobada es la referencia visual.** El resto de las pantallas se diseña en su misma familia.
5. **Accesible:** contraste AA, objetivos táctiles de 44 px o más y estados con ícono + texto, no solo color.

## 3. Alcance

**MVP (igual que la v1, rehecho):**
- Hoy (tablero).
- Alumnos (lista con filtros y ficha).
- Agenda (mes y semana, y agendar).
- Cobros (registrar y anular pagos, mensualidades, clases adeudadas).
- Avisos de vencimiento a los dueños y botón de WhatsApp editable.
- Más (ajustes de precios y días de aviso, dos dueños).
- Login y base de datos en la nube.

**Fuera del MVP:** lo mismo que en la v1 (§1 de v1).

## 4. Tecnología (a confirmar por Ada en la fase 2)

**Propuesta: seguir con React Native + Expo + TypeScript**, pero bien armado.
- **Por qué seguir:** es una sola base de código para Android y iPhone, con builds para las tiendas por EAS. El problema de la v1 no fue Expo: fue el acoplamiento entre pantallas.
- **Animaciones:** Reanimated + Moti, más Lottie para los momentos especiales.
- **Base de datos:** Supabase (Postgres, login y seguridad por instituto), como estaba previsto en la v1.
- **Alternativa que Ada debe evaluar:** Flutter. Anima muy bien, pero obliga a reescribir el dominio en Dart.
- **Estructura:**

```
v2/
  apps/mobile/            app Expo; solo arma la navegación y une los módulos
  modules/hoy|alumnos|agenda|cobros|mas/   cada uno con su README, pantallas y tests
  packages/ui/            sistema de diseño: tokens, componentes, animaciones
  packages/dominio/       reglas de negocio puras con tests (se puede portar de v1 si pasa sus tests)
  packages/datos/         acceso a Supabase; los módulos no tocan la BD directo
  supabase/               migraciones y seguridad (fase de datos)
```

**Regla anti-rotura:** cada módulo tiene sus tests y sus capturas de referencia. Si un cambio altera la captura de otro módulo, no se integra.

## 5. Fases y responsables

| # | Fase | Quién | Entrega | Sale cuando… |
|---|---|---|---|---|
| 1 | Dirección visual | Vito (+ Fina) | Paleta con color, tipografía, íconos e ilustraciones, guía de animación; 2 propuestas aplicadas a Hoy + Alumnos, en la familia de la Agenda conservada | Nico elige una |
| 2 | Arquitectura | Ada | Confirma la tecnología, define la estructura modular y la regla anti-rotura, y decide qué se porta de `v1/packages/dominio` | Nota corta aprobada por Nico |
| 3 | Flujos y pantallas | Fina | Wireframes y alta fidelidad de Hoy, Alumnos, Ficha, Cobros y Más; Agenda migrada sin cambiar su diseño | Nico aprueba el prototipo navegable |
| 4 | Base de la app | Reina | Esqueleto Expo modular, `packages/ui` con animaciones y Agenda funcionando con datos de prueba | Gino: anda en Android e iPhone (emulador) y pasan los tests por módulo |
| 5 | Resto de módulos | Reina | Hoy, Alumnos, Cobros y Más, de a un módulo por entrega | Gino aprueba cada módulo sin regresiones en los otros |
| 6 | Datos y seguridad | Ada + Emma + Reina | Supabase: tablas, seguridad por instituto, login de 2 dueños, auditoría de pagos | Gino prueba aislamiento, fechas y anulaciones |
| 7 | Piloto | Zaira + Gino | Builds de prueba (TestFlight / Play interno), backups, el instituto lo usa | 1–2 ciclos mensuales sin diferencias |

Las fases 1 y 2 pueden ir en paralelo.

## 6. Riesgos

- **Que el rediseño se vuelva «demasiado»:** la guía de animación fija duraciones y dónde se anima. Nico valida en la fase 1.
- **Que la Agenda conservada cambie sin querer al migrarla:** las capturas de `referencias/` son el criterio de aceptación.
- **Que se arrastren problemas de la v1 al reusar código:** solo se porta el dominio, y solo si pasa sus tests. La UI de la v1 no se reutiliza.
- **Q2/Q3 sin definir:** no bloquean hasta Cobros (fase 5).
- **Demo pública de GitHub Pages caída:** se reconfigura cuando haya un prototipo de la v2.
