# @xime/dominio — núcleo de dominio de Clases

Reglas de negocio puras de Clases (ENC-03, PLAN.md §3): TypeScript sin base de datos, sin UI y sin framework. Depende solo del runtime de Node (y de `Intl` para zonas horarias).

## Qué hace

- **Fechas locales** (`src/fechas.ts`): fechas `AAAA-MM-DD` en la zona del instituto (`America/Montevideo` por defecto), aritmética civil sin `Date`, **reloj inyectado** (`Reloj`), `hoyLocal(instante, zona)`.
- **Mensualidad** (`src/mensualidad.ts`): ciclos con **día ancla** y regla **«nunca quitar días»** (D3), renovación anticipada y vencida, estados derivados (`Vigente`, `PorVencer`, `VenceHoy`, `Vencida`, `PagadaSinIniciar`, `SinMensualidad`), fecha de aviso, «Terminar mensualidad hoy».
- **Tarifas** (`src/tarifas.ts`): módulo único de precios con interfaz estable `precio(alumno, concepto, fecha, lista)`; hoy devuelve el precio de lista con vigencias; mañana suma descuentos sin tocar pagos ni pantallas. **Dinero en enteros** de UYU.

## Reglas que aplica (fuente: PLAN.md §3, decisiones D1–D3 de Nico)

- El ciclo cubre `[inicio, próximo-inicio)`; el último día cubierto es el día anterior al «mismo día del mes siguiente». Inicio 17/04 → último día 16/05; el 17/05 ya renueva.
- El pago ocurre cuando paga el alumno; el ciclo **inicia en su primera clase posterior al pago**; hasta entonces el estado es *Pagada, sin iniciar*.
- Se guarda el **día ancla** (día del mes del inicio). Los inicios de ciclo son el ancla de cada mes; si el mes no lo tiene, cae en el último día del mes y **el siguiente ciclo vuelve al ancla** (31/01 → 28/02 → 31/03). El alumno nunca pierde días: ante duda, la fecha posterior.
- **Renovación anticipada** (paga hasta su último día cubierto): el nuevo ciclo empieza el día siguiente, sin esperar clase, mismo ancla.
- **Pago vencido**: queda *Pagada, sin iniciar* hasta su próxima clase y el **ancla se renueva** al día de esa primera clase.
- Los estados **se derivan** de fechas y pagos; no son editables. «Vencida» es informativa (sin bloqueos ni gracia en el MVP).
- Aviso N días antes del último día cubierto (`fechaAviso`), N configurable, 7 por defecto.
- Cambio de modalidad (§3.6): mensualidad → clase suelta mantiene el ciclo hasta su último día (corto antes solo con `terminarHoy`, sin devolver dinero); clase suelta → mensualidad es un `crearPrimerCiclo` en su primera clase. Los pagos viejos no se tocan.

## Qué expone

`fechas.ts`: `FechaLocal`, `InstanteMs`, `Reloj`, `ZonaHoraria`, `hoyLocal`, `sumarDias`, `diasEntre`, `diaSiguiente`, `diaAnterior`, `esFechaValida`, `diasDelMes`, `esBisiesto`, `ultimoDiaDeMes`.
`mensualidad.ts`: `Modalidad`, `Ciclo`, `CicloSinIniciar`, `EstadoMensualidad`, `crearPrimerCiclo`, `proximoInicio`, `ultimoDiaCubierto`, `renovar`, `iniciarCicloSinIniciar`, `estadoDe`, `diasRestantes`, `fechaAviso`, `terminarHoy`.
`tarifas.ts`: `AlumnoPrecio`, `VigenciaPrecio`, `ListaPrecios`, `precio`, `validarListaPrecios`.

## Cómo correr los tests (un comando, sin red)

```sh
cd packages/dominio
npm test          # node --test test/ — corre los 22 tests en ~0,6 s
```

Usa el runner nativo de Node con type-stripping: **cero dependencias**, no necesita `npm install` ni red.

## Cómo extenderlo

- **Descuentos/becas/packs (§3.7):** en `tarifas.ts`, dentro de `precio(...)`; la interfaz `precio(alumno, concepto, fecha, lista)` ya reserva el alumno. No tocar Pagos, Asistencia ni pantallas.
- **Gracia/bloqueo (fase futura):** la fecha de vencimiento ya es dato explícito (`ultimoDiaCubierto`); agregar la política en un módulo nuevo, no reescribir estados.
- **Pausas/varios meses (fuera del MVP, D4):** extender `renovar` o agregar constructores de ciclo; preservar el ancla y «nunca quitar días».
- **Zona horaria de otro instituto:** pasar la zona a `hoyLocal`; el resto del dominio trabaja con fechas locales y es agnóstico.

## Límites

- No hay persistencia, idempotencia de pagos, ni registro de anulaciones: eso vive en la capa de datos/servidor (fase 2). El dominio no procesa dinero ni llama APIs.
- No registra el historial de cambios de modalidad (quién/cuándo/de qué a qué): lo hace la app; el dominio provee el cierre (`terminarHoy`) y el inicio (`crearPrimerCiclo`).
- Un pago de mensualidad se asume completo (sin parciales, D4).
