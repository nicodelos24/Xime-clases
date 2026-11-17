# Clases v2 — Arquitectura (fase 2, 16/11/2026)

> Nota corta para aprobación de Nico. Fuente: `v2/PLAN.md` §2/§4, `v1/PLAN.md` §5/§7, entregas ENC-03/I1 de Reina y QA de Gino. Nada aquí reabre decisiones cerradas de Nico.

## 1. Tecnología: confirmada

**Expo + React Native + TypeScript + Expo Router + Supabase.** No Flutter.

- Una sola base de código para Android e iPhone, builds por EAS; es lo que la v1 ya usaba y el problema de la v1 **no fue la tecnología, fue el acoplamiento entre pantallas** (se tocó el calendario y se rompió el resto).
- **Flutter queda descartado** porque obliga a reescribir en Dart el dominio que ya está escrito, probado y aprobado en TypeScript (22/22 tests, QA APPROVED de Gino). Perder eso es el único costo real de esa alternativa y no trae ninguna capacidad que Expo no cubra.
- Animaciones: **Reanimated 4 + Moti** (duraciones 150–350 ms, respetando «movimiento reducido» del teléfono), Lottie solo para el festejo de pago. La definición exacta vive en el sistema de diseño de Vito (fase 1).
- Datos: **Supabase** (Postgres + Auth + RLS + Storage). La lógica de dinero (idempotencia, anulaciones, unicidad de renovación Q5) es **servidor**, vía RPC SQL con permisos mínimos; el móvil nunca es autoridad de cálculo ni de permisos. Lo de seguridad ya está especificado por Emma (`v1/docs/seguridad/`) y se aplica en la fase 6.

## 2. Estructura del monorepo

```
v2/
  apps/mobile/                  App Expo: solo navegación, tema y composición de módulos.
  modules/
    hoy/        tablero del día
    alumnos/    lista, filtros y ficha
    agenda/     mes + semana + agendar (el diseño conservado)
    cobros/     pagos, anulaciones, adeudadas
    mas/        ajustes, precios, avisos, dueños
    auth/       login de los 2 dueños
  packages/
    ui/         sistema de diseño: tokens, íconos, componentes, animaciones
    dominio/    reglas de negocio puras, sin React ni red
    datos/      repositorios Supabase; los módulos no tocan la BD directo
  supabase/     migraciones, RLS y RPC (fase 6)
```

- Cada `modules/<x>/` lleva su `README.md` (qué hace y qué no), sus pantallas y sus tests.
- Cada módulo tiene un contrato interno (pantallas, estados y datos que pide), de modo que Fina diseña cada sección sin esperar a las demás y Reina las implementa de a una.

### Reglas de dependencia (estrictas)

| Paquete | Puede importar | Nunca importa |
|---|---|---|
| `modules/*` | `packages/ui`, `packages/dominio`, `packages/datos` | otro `modules/*` |
| `packages/ui` | nada de negocio | `dominio`, `datos`, módulos |
| `packages/dominio` | nada (TS puro) | React, Supabase, `ui`, `datos` |
| `packages/datos` | `dominio` (tipos), Supabase | `ui`, módulos |
| `apps/mobile` | todos los módulos y paquetes | — |

- Comunicación entre secciones (ej.: Cobros abre la ficha de un alumno) es por **contratos compartidos**: tipos del dominio y rutas de navegación definidas en `apps/mobile`, nunca import directos de pantallas de otro módulo. Así, cambiar Agenda no puede compilar-romper Alumnos.
- Flujo de datos en pantalla: **módulo → datos (repositorio) → Supabase**; el repositorio devuelve tipos del dominio. Los cálculos de negocio (estados de mensualidad, precios, avisos) ocurren solo en `dominio`, con reloj inyectado.

## 3. Regla anti-rotura (nueva; vence el problema de la v1)

1. **Tests por módulo:** cada `modules/<x>` y cada paquete corre sus tests con el runner nativo de Node (cero dependencias, como el dominio de la v1); CI corre todos.
2. **Capturas de referencia por módulo:** de cada pantalla, en claro y oscuro, a 390×844 y 320×780 (las medidas que venimos verificando). Un cambio que altere la captura de **otro** módulo **no se integra**: se muestra por qué y se ajusta a mano, nunca se aceptan diferencias en cascada.
3. **Typecheck estricto de todo el monorepo:** un cambio no integra si `tsc --noEmit` no pasa también en los módulos que no tocó; es la barrera automática contra el acoplamiento oculto.
4. **QA independiente por módulo (Gino):** cada entrega se verifica sin regresiones en los demás; ya es la puerta de salida de las fases 4–7 del plan.

## 4. Qué se porta de `v1/packages/dominio`

**Se porta el paquete entero tal cual** (`@xime/dominio` → `v2/packages/dominio`):

- `fechas.ts`, `mensualidad.ts`, `tarifas.ts` + sus 22 tests: verificado hoy, 22/22 en ~0,6 s, cero dependencias, sin red.
- Cubre las decisiones cerradas de Nico: día ancla (D3), «nunca quitar días», renovación anticipada y vencida, estados derivados, fecha de aviso, «Terminar hoy», precios con vigencias, dinero en enteros, zona `America/Montevideo` con reloj inyectado.

**De la v1 no se porta nada más:** ni UI, ni pantallas, ni la demo HTML. La única otra pieza reutilizable es el **conocimiento documental** (reglas §3, bordes Q1–Q5, seguridad de Emma), que ya vive en `v1/docs/` y se consulta, no se copia.

**Notas para las fases siguientes:**
- Q2 y Q3 siguen pendientes de la clienta; el dominio ya los modela sin fijar política (ajustes auditados, `terminarHoy` sin devolución), así que no bloquean.
- Si la fase de datos exige la lógica de ciclos dentro del servidor (RPC SQL), se evalúa portarla en fase 6; decisión de esa fase, no ahora. Mientras, el dominio TS con sus tests es la referencia de verdad.

## 5. Qué habilita esta nota

Fase 3 (Fina: flujos y pantallas, Agenda migrada sin cambiar su diseño) y fase 4 (Reina: esqueleto Expo modular + Agenda con datos de prueba) pueden arrancar cuando Nico apruebe. La estructura y las reglas de dependencia de este documento son las que Reina sigue en el esqueleto.
