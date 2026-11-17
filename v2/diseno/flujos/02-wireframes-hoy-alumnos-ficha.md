# 02 · Wireframes: Hoy, Alumnos, Alta, Ficha, Modalidad, WhatsApp

**Móvil 390×844 (verificar también 360 y 320).** Baja fidelidad: los recuadros marcan jerarquía y texto, no medidas finales ni paleta (Vito, fase 1). Datos ficticios (`v2/diseno/datos.js`). Convenciones: `[acción]` botón ≥ 44 px; `◉` estado = ícono + texto + color; todo dato derivado (estado, vence, renueva, monto) lo entrega el dominio. Pie común de las 5 secciones: **Hoy · Alumnos · Agenda · Cobros · Más** (misma barra que `agenda-mes.png`, con la sección activa marcada). Cada sección es un módulo independiente: no importa pantallas de otra, se enlaza por rutas.

**Jerarquía del sistema** (la misma familia que Agenda): título de pantalla 24 px bold a la izquierda, acción secundaria a la derecha (botón con borde fino, como «Hoy» de Agenda), contenido sobre fondo lila muy claro, tarjetas blancas con borde fino, botón primario relleno color de marca con texto blanco, un solo FAB «+» por pantalla donde corresponda. Modalidad: violeta = Mensual (●), azul = Individual (◆), siempre con texto.

## W1 · Hoy (tablero)

Pregunta que responde: «¿qué tengo que hacer hoy?». Orden por urgencia: dinero que vence → clases de hoy.

```text
┌────────────────────────────────────────┐
│ Hoy                       [Avisos (2)]  │  título + acceso a avisos
│ Lunes 16 de noviembre                   │
│                                         │
│ ┌ Cobrado hoy ─┐ ┌ Por cobrar ──────┐   │  2 números grandes
│ │  $ 14.400    │ │  $ 5.400        │   │  (tocables → Cobros)
│ └──────────────┘ └──────────────────┘   │
│ [Por vencer 2] [Vencidas 1] [Adeudadas 1]│  chips con ícono + número
│                                         │
│ Por vencer (próximos 7 días)  [Ver todas]│  ← lista SIEMPRE visible
│ ┌─────────────────────────────────────┐ │
│ │ (E) Elena M.  ● Mensual             │ │
│ │ ◷ Vence hoy · renueva 19/11         │ │
│ │ [Avisar por WhatsApp]  [Cobrar]     │ │
│ ├─────────────────────────────────────┤ │
│ │ (F) Facundo R. ● Mensual            │ │
│ │ ◷ Vence en 4 días · 20/11           │ │
│ │ [Avisar por WhatsApp]  [Cobrar]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Clases de hoy                [Ver Agenda]│
│ 16:00  (B) Bruno S.   ● Mensual         │  mismas tarjetas que Agenda › Día
│ 16:00  (C) Carla T.   ● Mensual         │
│ 18:30  (D) Diego V.   ◆ Individual      │
│                                         │
│ Hoy  Alumnos  Agenda  Cobros  Más       │
└────────────────────────────────────────┘
```

- **Los chips y números abren listas filtradas**; la lista «Por vencer» nunca queda detrás de un número (v1 §3.4). Chips: Por vencer (ámbar), Vencidas (rojo), Adeudadas (rosa), cada uno con ícono + texto.
- «Cobrado hoy» solo suma pagos confirmados vigentes (no anulados). Ningún total muestra `0` mientras carga: skeleton (ver 05).
- «Clases de hoy» reusa la tarjeta del Día de Agenda (inicial, nombre, hora, etiqueta de modalidad) y tocarla abre **Agenda › Día** (no edita aquí). Sin clases: «Hoy no hay alumnos agendados» + [Agendar].
- Hoy puede traer la celebración breve (150–350 ms) al cobrar desde acá; con movimiento reducido no hay animación.

## W2 · Alumnos (lista con filtros y orden)

```text
┌────────────────────────────────────────┐
│ Alumnos                     [+ Alumno]  │
│ [ Buscar por nombre  (lupa SVG)     ]    │
│ [Todos] [Mensuales] [Por clase individual]  segmentado 44 px
│ Orden: [Más recientes ▾]                │  ← Más recientes mezclados /
│                                         │     Mensuales primero / Por clase primero
│ ┌─────────────────────────────────────┐ │
│ │ (E) Elena M.                      > │ │
│ │ ● Mensual · ◷ Vence en 2 días 18/11 │ │
│ ├─────────────────────────────────────┤ │
│ │ (G) Gabriela L.                   > │ │
│ │ ◆ Individual · ◉ Debe 3 clases      │ │
│ ├─────────────────────────────────────┤ │
│ │ (H) Hugo P.                       > │ │
│ │ ● Mensual · ⚠ Venció el 11/11       │ │
│ ├─────────────────────────────────────┤ │
│ │ (B) Bruno S.                      > │ │
│ │ ● Mensual · ✓ Al día · renueva 3/12 │ │
│ └─────────────────────────────────────┘ │
│ Hoy  Alumnos  Agenda  Cobros  Más       │
└────────────────────────────────────────┘
```

- Orden independiente del filtro; dentro de cada grupo, alta descendente con desempate estable por id. «Más recientes» mezcla modalidades por fecha de alta; no es último pago ni próxima clase (decisión 15/11).
- Cada fila: avatar con inicial en color de modalidad, nombre, **etiqueta de modalidad + estado de pago** (siempre texto + ícono). 64 px mínimo de alto.
- Alumnos no se borran: alumno sin clases hoy sigue en la lista; no hay estado «inactivo editable arbitrario».
- Vacío total: ilustración + «Agregá tu primer alumno» + [+ Alumno]. Búsqueda sin resultados: «No encontramos alumnos para “…”» + [Borrar búsqueda].

## W3 · Alta de alumno

```text
┌────────────────────────────────────────┐
│ ← Nuevo alumno                          │
│ Nombre *     [                       ]  │
│ Apellido *   [                       ]  │
│ Teléfono     [+598 …                 ]  │  «Para avisarle por WhatsApp»
│ Modalidad    (●) Mensualidad  ( ) Por clase individual │
│ ─ si Mensualidad ─                      │
│ Tarifa vigente: $ 1.800                 │
│ ⓘ El ciclo empieza en su primera clase  │
│   posterior al pago.                    │
│ Inicio: pendiente de primera clase      │
│ [Fijar fecha de inicio a mano]          │
│ ─ si Por clase individual ─             │
│ Tarifa por clase: $ 700 · se cobra al   │
│ marcar la clase realizada               │
│ [Guardar alumno]                        │
└────────────────────────────────────────┘
```

Guardar no registra pago. Tras guardar abre la ficha; si es mensual, CTA «Cobrar mensualidad». Sin tarifa configurada: «Configurá la tarifa antes de cobrar» → Más › Tarifas. Sin campo de tutor.

## W4 · Ficha de alumno

La ficha es la pantalla «madre» del alumno: estado, fechas, acciones y los dos historiales. Se conserva siempre, aunque deje de venir.

```text
┌────────────────────────────────────────┐
│ ← Elena M.                    [Editar]  │
│ (E)  Elena M.   ● Mensual               │
│ ┌ Estado ─────────────────────────────┐ │
│ │ ◷ Vence en 2 días                   │ │  chip con color de estado
│ │ Inicio 18/10 · Vence el 18/11       │ │  fechas del dominio
│ │ Próxima renovación: 19/11           │ │
│ └─────────────────────────────────────┘ │
│ [Renovar mensualidad]                   │  primario
│ [Avisar por WhatsApp]  [Cambiar modalidad]│ secundarios
│                                         │
│ Próximas clases       [Agendar]         │  de Agenda, solo lectura
│  Mié 18/11 · 16:00 · ● Mensual          │
│ Pagos                 [Ver todos]       │
│  18/10 · Mensualidad · $ 1.800        > │
│ Clases realizadas     [Ver todas]       │
│  16/11 · Realizada                    > │
│ Historial de cambios                    │
│  quién · cuándo · de → a                │
└────────────────────────────────────────┘
```

Variantes del bloque «Estado» (texto exacto en 05):

| Estado derivado | Muestra |
|---|---|
| Vigente | «Vigente · vence el DD/MM · renueva el DD/MM» |
| Por vencer / Vence hoy | idem con ámbar; «Vence hoy» es el último día cubierto |
| Vencida | «Venció el DD/MM»; sin prometer nueva cobertura |
| Pagada, sin iniciar | «Pagó el DD/MM · Pendiente de primera clase» + [Fijar inicio a mano]; horarios estimados llevan «Previsto, sujeto al inicio» |
| Sin mensualidad | «Todavía no hay un ciclo pago» + [Cobrar mensualidad] |
| Individual | «Por clase individual · N clases adeudadas · última clase DD/MM» + [Cobrar clase] si hay deuda |

Adultos: sin datos de tutor. Cambio programado: «Clase individual desde DD/MM» además del estado, sin reemplazarlo. Renovación adelantada: ciclo vigente y siguiente ciclo pagado en bloques separados.

## W5 · Cambiar modalidad (hoja)

```text
┌────────────────────────────────────────┐
│ Cambiar modalidad                [Cerrar]│
│ Elena M. · hoy: ● Mensual                │
│ ( ) Pasar a Por clase individual         │
│   La mensualidad sigue vigente hasta el  │
│   18/11. Desde el 19/11 se cobra por     │
│   clase. No se pierde lo pagado.         │
│ Motivo (opcional)  [                   ] │
│ [Confirmar cambio]                       │
│ ─────────────────────────────            │
│ Terminar mensualidad hoy  (alto impacto) │
│ Motivo * [                             ] │
│ La app no devuelve dinero. Pendiente de  │
│ definir con la clienta.   [Terminar…]    │
└────────────────────────────────────────┘
```

Individual → mensual: texto «Las clases ya pagadas no se reembolsan automáticamente» y abre el cobro (W7). Si abandona antes de confirmar se conserva la modalidad previa. «Terminar hoy» exige confirmación en segundo paso y queda marcado «pendiente de política (Q3)».

## W6 · Aviso por WhatsApp (hoja con mensaje editable)

```text
┌────────────────────────────────────────┐
│ Avisar a Elena M.                [Cerrar]│
│ Para: +598 9X XXX XXX                    │
│ Mensaje (podés editarlo):                │
│ ┌──────────────────────────────────────┐ │
│ │ Hola Elena, tu mensualidad vence el  │ │
│ │ 18/11. ¿Querés renovarla? ¡Gracias!  │ │
│ └──────────────────────────────────────┘ │
│ [Abrir WhatsApp]   [Copiar mensaje]      │
│ No se envía solo: lo enviás vos.         │
└────────────────────────────────────────┘
```

Un mensaje por alumno, editable cada vez; «Abrir WhatsApp» abre `wa.me` y registra la apertura, **no** el envío. Sin teléfono: «Agregá un teléfono para avisar» + [Agregar teléfono]. WhatsApp = pictograma genérico + etiqueta, no logo oficial.
