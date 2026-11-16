# ENC-09 · Movimiento, Agenda y foco en alumnos

**Vito · guía visual para implementar; no es funcionalidad ni aprobación de producto.** Basada en ENC-02 (`tokens.ts`, `tokens.css`, `ui.css`), ENC-07A (`docs/diseno/ux/agenda.md`) y la identidad «Ritmo sereno». Revisión parcial del demo en `master`, HEAD `0cfd74eb40203e8021598c205fc74bce8e19faf6`; prototipo modificado y en progreso por Fina (preservado). No modifico su demo ni `PLAN.md`. La única guía nueva de este encargo es este documento; los únicos archivos de recurso nuevos, por cubrir necesidades aún no dibujadas, son dos SVG en `iconos/`.

## Intención

Movimiento breve y útil: confirmar que una acción táctil se recibió, explicar qué contenido cambió y evitar un salto brusco al cambiar semana/mes. La modernidad viene de una interfaz fluida, legible y con jerarquía, no de animar cada cosa. Priorizar **Agenda** (orientación y próximo paso) y **Alumnos** (encontrar, ordenar, filtrar y agendar), no la prominencia de deuda.

Conservar sin redefinir las decisiones de Fina para Agenda: cinco destinos Hoy · Alumnos · Agenda · Cobros · Más; Semana inicial de siete días en lista vertical; Mes con día seleccionado y detalle; los vencimientos son datos vinculados a cada día, no una tarjeta de cobro protagonista. «Agendar» muestra quién viene en un día como evento previsto y **no** equivale a asistencia registrada. No agregar tarifas, cupos, reglas de horarios, recurrencias, filtros de negocio, orden predeterminado ni cambios de ciclo desde una decisión visual.

## Jerarquía y composición recomendadas

### Agenda

- Título **Agenda**, selector «Semana / Mes» con ambos nombres visibles y `aria-pressed` o radio accesible; semana activa al entrar, como ya propone Fina. Controles «Semana anterior», «Hoy», «Semana siguiente» en el mismo grupo, con texto completo para accesibilidad aunque un futuro layout use flechas visuales.
- La semana se presenta como siete filas de días, no siete columnas. Encabezado de día con fecha completa contextual, «HOY» en texto y un marcador de color de marca sutil; la selección de fecha se distingue por borde/estado y etiqueta, no solo color. Días vacíos son renglones bajos, no tarjetas decorativas ni animaciones de entrada.
- Priorizar **clases/personas programadas**: nombre de la clase y hora, luego personas agendadas en filas compactas con nombre legible. Acción «Agendar alumno» clara en el contexto de una fecha. La acción es independiente de «Pasar lista»/«Abrir lista» y nunca cambia asistencia por sí sola. Si el flujo aún no existe, no simular su guardado.
- Vencimientos quedan agrupados en el área de ese día y expandidos a demanda según ENC-07A; no colorear el encabezado diario como cobro, ni colocar totales de dinero/números grandes por encima de clases y personas. Estados de mensualidad siguen siendo los semánticos de tokens (`estado`), con su icono/texto/color; no reutilizar la marca de Agenda para decir «vencida».
- Mes: celdas sobrias, nombre de día corto con `scope="col"` y fecha accesible completa; día elegido con contorno + indicador de selección, hoy con etiqueta/marker distinguible. Indicadores de clases y vencimientos usan símbolos distintos (agenda-calendario/reloj existente) y leyenda textual visible. No mostrar número/estado sin una leyenda que explique su significado. Mantener la lista lineal alternativa de la especificación UX cuando cuadrícula, tamaño de texto o controles no quepan.
- Usar las superficies y tokens existentes: fondo marfil/lavanda, texto de alto contraste; oscuro con lavanda clara sobre superficie oscura. Lavanda es guía/foco de Agenda; colores semánticos de estados conservan significado. Reutilizar `agenda-calendario.svg`, `agenda-hoy.svg`, `estudiantes.svg` y `lista-asistencia.svg` existentes, no agregar otro calendario ni emoji.

### Alumnos

- Decisión vigente de Nico en `docs/DECISION-AGENDA-ALUMNOS.md`: filtros **Todos / Mensuales / Por clase individual** y orden **Más recientes / Mensuales primero / Por clase individual primero**, independientes. «Más recientes» ordena por fecha de alta, mezclando modalidades; los grupos conservan alta descendente y desempate estable por ID. No usar último pago ni próxima clase como orden implícito.
- Encabezado, «+ Alumno» y búsqueda con label visible. Los botones de filtro y control de orden muestran sus etiquetas/selecciones en texto; el icono complementa, no sustituye. Mantener filtros simples y visibles, no depender de una hoja oculta o gesto para descubrirlos.
- Filtros activos pueden leerse como chips con texto y acción «Quitar filtro»; mantener «Limpiar filtros» cuando aplica. El contador de resultados solo si el dato está disponible y correcto. Al cambiar de orden con filtro aplicado, conservar el filtro.
- No trasladar deuda/cobro al mismo nivel de filtrado. Mostrar ficha canónica del alumno y modalidad, sin duplicar/quitar ficha al dejar de venir; toda programación conserva relación a esa misma ficha. Objetivos táctiles ≥48 px.
- «Agendar alumno» desde Agenda/Alumnos usa `estudiantes.svg` o calendario existente como pista, label completo visible y destino perceptible. No confundir «agendar» con enviar mensaje, «marcar presente» o cobrar.

## Recursos añadidos: filtros/orden

ENC-02/ENC-07B no tenían pictogramas específicos de filtro y orden, y el encargo explícitamente prioriza esos controles en Alumnos; por eso añado solo estos dos en `iconos/`:

| Recurso | Uso propuesto | Etiqueta obligatoria |
|---|---|---|
| [`iconos/filtro.svg`](iconos/filtro.svg) | Entrada «Filtrar alumnos»; puede acompañar filtros activos | «Filtrar alumnos» / «Filtros» según el control y su contexto |
| [`iconos/orden.svg`](iconos/orden.svg) | Ordenamiento de filas; no implica qué criterio está activo | «Ordenar alumnos» y el criterio/selección anunciado aparte |

SVG originales locales, 24×24, `currentColor`, trazo 1.8, sin dependencia, sin marca ni texto incrustado. Son decorativos si el texto visible ya nombra la acción (`aria-hidden="true" focusable="false"`); el botón recibe nombre accesible y estado cuando corresponda. Usar 20–24 px dentro de objetivo ≥48×48. No usar un icono aislado como sustituto de filtros u orden seleccionables.

## Sistema de movimiento: corto, discreto y no bloqueante

Los tokens actuales ya establecen `cortaMs: 160`, `mediaMs: 240`, `reducidaMs: 0` en `docs/diseno/visual/tokens.ts`. Mantener esos tiempos: no crear una segunda escala ni agregar paquetes, Lottie, video, autoplay o animación continua. No hay tokens de curva definidos; usar easing CSS estándar corto y sobrio (p. ej. `ease-out` para salida de estado, `ease-in-out` para transición de contenido), no elastic/spring.

| Acción | Tratamiento recomendado | Límite |
|---|---|---|
| Hover/foco/pressed de botón | `color`, `background-color`, borde y/o `transform: scale(.98)` a 100–160 ms | No desplazar controles, mover el foco ni cambiar el área táctil; foco visible es inmediato y no animado |
| Semana ↔ Mes / cambiar periodo | Fade del contenido de días (opacity) o traslación horizontal máxima 4 px, 160 ms; mantener selector, encabezado y alto/layout estable | No animar cada celda/filas en cascada, no mover barra inferior ni usar fade que oculte rango/fecha o lector de pantalla |
| Expandir/contraer vencimientos o detalles | Cambiar el estado semántico inmediatamente; si hay transición, solo `opacity` y/o recorte dentro de región estable hasta 160 ms | El control anuncia expandido/contraído al instante; no retrasar lectura, no animar altura de miles de elementos |
| Abrir ficha/formulario/modal | Entrada/salida corta de opacity + `translateY(4px)` como máximo, 160 ms; navegación conserva foco y origen | No hacer zoom desde el borde, giro ni confeti; no impedir atrás/escape/cerrar |
| Feedback de agenda guardada | Confirmación textual o live region inmediatamente; breve cambio de superficie/borde hasta 240 ms | Nunca confirmación solo animada; no usar éxito visual si la operación real no lo confirmó |
| Carga | Skeleton estático por defecto o pulso suave de opacidad si se mantiene el token y el usuario no reduce movimiento | No shimmer perpetuo, spinner grande, efecto de reloj, ni placeholder que parezca dato definitivo |

### CSS de referencia (no copiar con nuevos valores en dos lugares)

```css
:root {
  --duracion-corta: 160ms; /* identidad.animacion.cortaMs */
  --duracion-media: 240ms; /* identidad.animacion.mediaMs */
}
.boton-accion { transition: color var(--duracion-corta) ease-out,
  background-color var(--duracion-corta) ease-out,
  border-color var(--duracion-corta) ease-out; }
.boton-accion:active { transform: scale(.98); }
.transicion-contenido { transition: opacity var(--duracion-corta) ease-in-out,
  transform var(--duracion-corta) ease-in-out; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
  .transicion-contenido { transform: none !important; }
}
```

En integración, los valores CSS deben exportarse del token fuente (no mantener duplicado sincrónico). Para `reducidaMs: 0`, equivalente práctico `0ms`; evitar `0.01ms` si el exportador puede expresar 0 directo. El snippet enseña el tratamiento general; tokens siguen siendo fuente de verdad. El CSS actual de la demo tiene un reset `prefers-reduced-motion` pero no se pudo verificar íntegramente porque falta el stylesheet referenciado de Agenda en el candidato parcial (ver revisión). En producción probar `matchMedia('(prefers-reduced-motion: reduce)')` y validar que no haya transición estructural ni scroll suave.

### Nunca animar continuamente

- Importes, saldo, indicadores de vencimiento, números de mensualidades o contadores: sin count-up, rebote, parpadeo, pulso, rojo intermitente ni animación de ticker.
- Grilla, orden de filas o posiciones de controles: no animar layout en cada render/actualización; no hacer auto-scroll al cambiar pantalla si oculta título/contexto. La única excepción de desplazamiento es el salto explícito a «Ir al día de hoy», por acción directa y respetando movimiento reducido.
- Navegación inferior, marca, calendario en reposo, chips, focus ring, skeleton de reduced motion, notificaciones o resultados desconocidos: sin loops, shimmer o autoplay.
- No animar el número de alumnos para llamar la atención, ni estados financieros como estímulo de urgencia.

## Accesibilidad visual y comportamiento

- Todo control incluye verbo/contexto en label visible: «Filtrar alumnos», «Ordenar alumnos», «Agendar alumno» y «Pasar lista». Iconos son apoyo, no el único nombre.
- Área táctil mínima **48×48 px** para controles; iconos 20–24 px con separación suficiente. Evitar poner dos controles estrechos juntos cuando una etiqueta larga los fuerza a envolverse.
- Selección de fecha/lista y estado activo se distinguen con texto + forma/borde + color; contraste de texto ≥4.5:1, iconos/bordes informativos ≥3:1 contra la superficie real en claro y oscuro. Mantener foco visible 2 px con token `foco`, sin transición.
- Al cambiar rango o vista, anunciar rango nuevo una vez en región `aria-live="polite"`; no añadir live announcement por cada fila o icono. Movimiento visual no puede preceder ni reemplazar la semántica de fecha, selección o estado.
- Respeta 200 % de texto: no fijar alturas de botones o días a un único renglón, no cortar etiquetas, no solapar la navegación inferior; si Mes no entra, mostrar lista lineal como alternativa prevista por UX.
- Reduced motion: transición inmediata/opacity opcional 0 ms, sin desplazamiento auto; no omitir foco/feedback por desactivar movimiento.

## Inspección de demo parcial y recomendaciones a Fina

Consulté la revisión local MCP Kaia Chrome a 360×780 en `#agenda/semana/2026-11-15` y `#alumnos`. Al abrir el candidato en progreso (HEAD base indicado arriba), Agenda y las cinco pestañas aparecen, selector Semana/Mes y controles tienen etiquetas y 48 px de altura en el snapshot. El calendario semanal se lee como lista, con una tarjeta de clase y grupos de vencimiento. La pantalla Alumnos mantiene «+ Alumno» y búsqueda visible.

**Observación no final / causa concreta:** `index.html` incluye `agenda.css`, pero ese archivo todavía no está presente en el árbol de trabajo consultado. Chrome devolvió **404** para `/ux/prototipo/agenda.css`; por eso la tarjeta «Pasar lista» ocupó casi toda la altura visible y controles/tarjetas de Alumnos se extendieron de manera desproporcionada. El CSS base `prototipo.css` no contiene aún el estilo de Agenda ni transición terminada. Esto **rompe la revisión visual del candidato parcial**, no demuestra un fallo del diseño final. No corregí archivos de Fina. Recomiendo que al cerrar CSS: encapsule Agenda en columna/gap igual a otras tarjetas, `button` no crezca en flex del artículo, límite de texto de horario, semanas más compactas con día vacío de una línea, y repetir inspección al incorporar estilos; no animar la corrección de layout.

NO verifiqué el CSS final (no está), reducción de movimiento efectiva sobre la pantalla terminada, VoiceOver/TalkBack, 320 px/200 % en versión final, integración de filtros/orden ni interacción de agendar alumno. En la visita a Alumnos, el snapshot mostró búsqueda, fichas y «+ Alumno», pero aún no los filtros ni el orden decididos. Nico ya cerró las opciones en `docs/DECISION-AGENDA-ALUMNOS.md`; Fina los está adaptando en su prototipo, sin cambiar mi rol visual. Esta comparación es de ese estado de trabajo y no evalúa el candidato final.

## Para la implementación cuando se complete la adaptación UX

1. Cargar los seis SVG integrados; usar `filtro.svg` y `orden.svg` con opciones ya decididas en `DECISION-AGENDA-ALUMNOS.md`.
2. Implementar Agenda con jerarquía de ver/agendar personas por fecha; cada programación se vincula a ficha existente y acción «Agendar» es separada de presencia/cobro. Respetar los límites del acuerdo de Nico, sin crear reglas de horario/cupo.
3. Añadir transiciones solo a estados de control/contenido con escala temporal de tokens; quitar toda motion al activar reduced-motion.
4. Aplicar filtros/orden independientes y conservar ficha canónica según decisión, sin usar fecha de pago/clase como orden.
5. Revisión Chrome 320/360/390, ambos temas, prueba 200 % y reduced-motion, luego auditoría de accesibilidad por responsable asignado; no declarar QA independiente ni prueba de usuaria.

**Alcance y licencia:** iconos dibujados para este sistema, sin recursos externos ni dependencias. No se añaden iconos de dinero, crédito, filtros de negocio ni calendarios duplicados; ni se cambia licencia del repositorio.