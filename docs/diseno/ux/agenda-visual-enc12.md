# ENC-12 · Agenda que se reconoce como calendario

**Fina · 15/11/2026, revisión iniciada 15:55 America/Montevideo.**
**Entrega:** diagnóstico de la demo publicada y propuesta UX lista para diseño visual de Vito y posterior implementación de Reina. **No es aprobación estética de Nico ni implementación.** No edité HTML/CSS/JS, tokens, láminas ni app; sin commit/push ni sesión APX de Reina.

## 1. Base y alcance comprobado

Leí `AGENTS.md`, `PROTOCOLO-AGENTES.md`, `Fina-Recibe.md`, `Clases-Fina.md`, `Clases-Vito.md`, `PLAN.md`, [decisión Agenda/Alumnos](../../DECISION-AGENDA-ALUMNOS.md), [UX vigente](agenda.md), [tokens](../visual/tokens.ts) y [movimiento ENC-09](../visual/movimiento.md).

- Base local: `master`, HEAD `b93c0e734fce2ecc8c294108670d7d71cb660f02`. Al empezar, sin cambios rastreados; `.apc/` sin seguimiento, preservado.
- Abrí la [demo pública](https://nicodelos24.github.io/Xime-clases/diseno/ux/prototipo/index.html#agenda) en **Chrome real mediante MCP Kaia**. Inspeccioné Semana inicial 9–15/11, Semana 16–22/11, Mes noviembre, selección 17/11, detalle y apertura de Agendar. Datos ficticios, sin confirmar nuevas reservas.
- Capturas a **390×844** y comprobación adicional de Mes a **320×780**, tema claro. No es teléfono físico.
- `index.html`, `agenda.css` y `agenda.js` públicos dieron HTTP 200 y SHA-256 idéntico a sus archivos locales (tabla al final). Eso vincula estas tres piezas con la base, **no es verificación de todos los recursos publicados**.
- Consola consultada después del recorrido 390: **0 errores, 0 warnings**. No corrí regresión completa, auditoría de red ni QA independiente.

### Qué funciona y se conserva

Hay selector Semana/Mes, fechas seleccionables, cuadrícula real a 390, selección y Hoy visibles, detalle con nombres y modalidad, agendado con ficha existente y cinco destinos de navegación. El texto principal es legible en las capturas. La separación programación/clase realizada está explicitada. **El problema no es ausencia absoluta de calendario ni de violeta: es que el diseño prioriza controles, ceros y texto repetido sobre días y personas.** No corresponde deshacer navegación ni negocio para resolverlo.

## 2. Diagnóstico visual: cuatro correcciones de impacto

### A. Mes: la cuadrícula informa clases, no quién viene

[Captura Mes 390](evidencia-enc12/mes-390.png).

**Veo:** siete columnas y seis filas en noviembre, celdas blancas altas con borde marrón/gris, número arriba y dos renglones de icono+número abajo. Casi todas repiten calendario `0` y reloj `0`. El 15 tiene fondo lavanda y borde violeta por estar seleccionado; el 17 y el 19 con clase mantienen prácticamente la misma superficie blanca que los vacíos. El 17 muestra `1` clase y `1` vencimiento, pero el detalle contiene a Lucía: la celda no explica cuántas personas vienen. No hay puntos por modalidad, iniciales ni chips de alumno. La grilla mide aproximadamente **341×621 px** y empuja el detalle debajo; «Ver detalle del día» agrega un paso de desplazamiento.

**Por qué falla:** hay mucho ruido en días sin actividad y poco contraste de significado en los ocupados. Un vencimiento compite con una clase programada y el conteo no responde la pregunta de Agenda. La vista se siente como tabla de contadores, no como mapa de personas.

**Cambiar:** solo número en días vacíos; superficie suave + puntos de modalidad + cantidad de personas en días con programación. Encabezado y leyenda compactos; no sumar iconos repetidos por celda. Vencimientos fuera del mapa principal, conservados en el detalle.

### B. Semana: demasiado formulario, poca forma temporal

[Primera entrada](evidencia-enc12/semana-inicial-390.png) · [Semana con clases](evidencia-enc12/semana-17-390.png).

**Veo:** dos botones grandes Semana/Mes, navegación de rango, título extenso que ocupa varias líneas, fecha técnica, «Ir al día de hoy». Cada día repite fecha completa en negrita, frase vacía y botón ancho «Agendar alumno», separado por línea. En la primera pantalla solo entran lunes y parte del martes, ambos vacíos; el domingo 15 con personas queda muy abajo. En días con clase aparece tarjeta blanca con borde lateral violeta; cada nombre lleva su propio botón «Ver programación».

**Por qué falla:** los siete botones de agendar y los días vacíos consumen más espacio que las personas. No hay columna de fecha reconocible, densidad variable ni resumen visual de modalidad. La semana no se puede explorar de un vistazo.

**Cambiar:** siete franjas horizontales compactas con fecha prominente a la izquierda y personas a la derecha; vacíos de una línea. Una sola acción flotante contextual, sin perder la posibilidad de agendar cualquier día.

### C. Día: tarjeta de clase protagonista, alumno secundario

[Detalle 17/11](evidencia-enc12/dia-17-390.png) · [Hoy](evidencia-enc12/semana-hoy-390.png).

**Veo:** fecha completa como título, tarjeta «Danza», horario violeta, explicación de programación, nombre sin avatar, modalidad en texto corriente y botón ancho repetido. El bloque de vencimientos usa lavanda/violeta, igual que Agenda, y «Agendar alumno» aparece en el flujo normal. No hay lista rica ni badge de modalidad; al recorrer muchas personas, la acción primaria queda lejos.

**Por qué falla:** el ojo lee clase/advertencia/botones antes que quién viene. Mensual e individual se distinguen únicamente leyendo texto. La selección no se convierte en una superficie diaria con identidad clara.

**Cambiar:** encabezado diario con cantidad, grupos por horario y filas de persona con inicial + nombre + badge; acceso de fila a programación; FAB visible sobre la barra inferior. Vencimientos secundarios y neutrales, con su texto, no como otro bloque principal violeta.

### D. Agendar y ancho pequeño: conservar seguridad, bajar fricción

[Agendar actual](evidencia-enc12/agendar-390.png) · [Mes 320](evidencia-enc12/mes-320.png).

**Veo:** Agendar abre una página completa con fecha y selección canónica, pero el bloque de instrucciones y tres campos desplazan gran parte de la lista fuera del primer viewport. A 320 la tabla está oculta (`display:none`): se presenta detalle primero y luego alternativa lineal. Esto preserva lectura y tacto, pero ya no da sensación de mes.

**Cambiar:** hoja modal con fecha/horario fijos, búsqueda y lista inmediatamente reconocible; en alto reducido, pantalla completa equivalente. Intentar mes compacto sin reducir objetivos táctiles; mantener alternativa lineal si no entra. **No eliminar la adaptación accesible para forzar la estética.**

## 3. Modelo UX propuesto y alcance de pantallas

**Una sección Agenda, tres presentaciones y un modal principal**; no crear otra pestaña de navegación:

1. **Semana** — entrada inicial conservada, siete franjas para entender quién viene.
2. **Mes** — cuadrícula visual para explorar fechas, con resumen del día seleccionado debajo.
3. **Día** — detalle a pantalla completa, abierto desde una franja o desde «Ver día» en Mes. No agregar tercer segmento: mantener **Semana / Mes** y un nivel de detalle.
4. **Agendar alumno** — hoja modal contextual al día; formato completo cuando teclado/alto/tamaño de texto lo requieran.

Se conserva el detalle de una programación ya existente (ficha / retirar), con confirmación de retiro. Es una superficie auxiliar, no una nueva sección. Se reutiliza alta canónica si falta alumno.

**Jerarquía:** fecha y rango → actividad/personas → agendar → información secundaria. Navegar/seleccionar nunca confirma presencia ni produce operaciones financieras.

### Estado compartido y reglas de navegación

- `vistaBase: semana | mes`, `fechaSeleccionada`, `rangoVisible`, `detalleDiaAbierto`, origen/scroll/foco de retorno.
- Primera entrada: Semana de la fecha del instituto, día de hoy seleccionado. En la demo, 15/11/2026 fijo; no usar fecha del dispositivo para cambiar silenciosamente sus fixtures.
- Semana ↔ Mes conserva fecha seleccionada; el nuevo rango la contiene. Mes anterior/siguiente conserva número de día si existe, si no último día, solo para selección de UI. Semana anterior/siguiente desplaza siete días.
- «Hoy» selecciona hoy y cambia rango; no confirma nada. Una etiqueta visible Hoy distingue fecha actual de fecha elegida.
- Tocar franja abre Día; volver restaura vista/rango/scroll. En Mes, tocar celda actualiza selección y resumen **sin navegar ni autoabrir modal**; tocar «Ver día» abre Día. Sin salto automático de página al elegir celdas. Si el resumen queda fuera de vista, el acceso «Ver día» en la leyenda indica la fecha seleccionada.
- FAB en Semana/Mes: «+ Agendar», contexto **fecha seleccionada** explícito en resumen/etiqueta próxima. En Semana, toque de una franja selecciona y abre Día; el FAB inicial agenda hoy, no la última fila visible. En Día, mismo FAB, fecha de encabezado inequívoca. En ambos casos el modal vuelve a mostrarla antes de confirmar.
- No gestos obligatorios. Se puede añadir desplazamiento suave a controles de orientación, nunca un swipe que compita con scroll vertical o sea la única navegación.

## 4. Wireframe M — Mes visual

```text
Agenda                         [Hoy]
[ Semana | MES ]
[‹]       Noviembre 2026         [›]
Lu    Ma    Mi    Ju    Vi    Sá    Do
                                   1
 2     3     4     5     6     7     8
 9    10    11    12    13    14   [15]
                                 ● 2
16   {17}   18   {19}   20    21    22
      ◆ 1        ●● 3
23    24    25    26    27    28    29
30
● Mensual   ◆ Individual    número = alumnos

Mar 17 nov · 1 alumno               [Ver día ›]
[LS] Lucía Silva                 [Individual]
Danza · 18:00–19:00
                           [ + Agendar ]
──────── Hoy · Alumnos · Agenda · Cobros · Más
```

**Esquema de estados y distribución, no fixtures nuevos:** el ejemplo `3` del 19 solo ilustra densidad; implementar con datos reales del fixture disponible. Los símbolos ●/◆ describen formas a dibujar con CSS/SVG, no emojis de interfaz.

- Calendario en superficie limpia sin tarjeta por cada fecha. Celdas alineadas, fecha arriba; 5 o 6 filas según mes. Separación sutil entre semanas, no 42 bordes dominantes. No estirar filas para rellenar pantalla.
- A 390: márgenes generales 16; bloque de grilla con padding interno mínimo, ancho útil para siete columnas iguales. Alto de celda propuesto **56 px**, fecha 16/24 semibold; encabezado de semana 12/16. Usar 64 px si lo exige contenido/escalado, no volver al alto de 96 px para alojar ceros.
- **Vacío:** número normal, sin iconos ni `0`; sigue siendo seleccionable. No significa instituto cerrado.
- **Con personas:** fondo marca suave muy sutil, punto circular violeta si hay mensual y rombo azul suave si hay individual, número total de **alumnos únicos programados en ese día**. Máximo dos símbolos por celda (presencia de modalidades, no un punto por alumno). Se lee «17 de noviembre, 1 alumno programado, 0 mensuales, 1 individual»; no «1 clase» cuando se cuenta gente.
- Si una persona está en dos ocurrencias del mismo día: celda cuenta una persona; resumen dice «1 alumno · 2 programaciones». El detalle muestra cada ocurrencia. Calcular todo desde las mismas relaciones activas, sin sumar reservas retiradas ni canceladas a «vienen».
- **Hoy no seleccionado:** número con contorno de marca y etiqueta accesible Hoy; no rellenar toda la celda. **Seleccionado:** fondo marca sólido, texto sobreMarca, borde/estado accesible. Si también es hoy, mantener señal textual de Hoy en encabezado del resumen; no mezclar con foco de teclado (anillo de foco separado).
- En celda seleccionada, indicadores pueden ir en sobreMarca por contraste; la leyenda y el resumen diario conservan desglose de modalidades. No depender de distinguir dos tonos sobre fondo violeta.
- **Solo horario, sin alumnos:** pequeño guion/subrayado neutro y etiqueta «Clase prevista, sin alumnos agendados»; no usar punto de modalidad. **Cancelada:** estado textual en Día, no cuenta como personas que vienen. No borrar los datos del evento por quitarlo del conteo activo.
- Sin nombres ni avatars dentro de las celdas móviles: las iniciales a 390 obligarían a truncar fecha/conteo. El carácter humano aparece en el resumen inferior, Semana y Día. A mayor ancho se podrá ampliar visualmente, sin exigirlo para este encargo.
- Vencimientos se conservan **en el detalle diario**, colapsados. Se quitan sus contadores repetidos de la grilla; no se suprime su acceso ni se redefinen estados financieros.
- Pie de grilla: leyenda de ambas modalidades, aclaración «Número = alumnos» y acceso al día elegido. Resumen: fecha, total, hasta dos filas de personas y «Ver día»; nunca intentar mostrar 20 filas debajo del mes.

### Ancho mínimo y texto grande

Objetivo: mantener cuadrícula en 360/390 y, si cabe, 320. Cada fecha necesita ancho mínimo 44 px: **7×44 = 308 px útiles**. En 320 se puede usar calendario a sangre con padding 4, sin bordes internos que coman ancho; no comprimir otros controles ni volver todos los márgenes de la app pequeños. El Chrome de escritorio observado reserva barra vertical y deja menos ancho: no prometer que 320 de viewport equivale a 320 útiles.

Con menos de 308 px útiles, o escalado que impida fechas/indicadores legibles: resumen seleccionado primero + selector lineal «Fechas del mes», texto «Vista de lista para leer mejor». No mantener tabla oculta en árbol accesible ni hacer scroll horizontal de toda la página. **No bajar tacto/tipografía para sostener siete columnas.** Es una excepción de accesibilidad explícita, no el diseño principal del mes.

## 5. Wireframe S — Semana en franjas

```text
Agenda                         [Hoy]
[ SEMANA | Mes ]
[‹]          16–22 nov 2026      [›]

LUN 16 │ Sin alumnos agendados                ›
───────┼──────────────────────────────────────
MAR 17 │ 1 alumno · 18:00                     ›
       │ [LS Lucía] [Individual]
───────┼──────────────────────────────────────
MIÉ 18 │ Sin alumnos agendados                ›
───────┼──────────────────────────────────────
JUE 19 │ 3 alumnos · 18:00                    ›
       │ [AP Ana] [RM Rosa] [+1]
       │ ● 2 mensuales  ◆ 1 individual
… siete franjas, también sábado y domingo …
Seleccionado: mar 17 nov
                           [ + Agendar ]
──────── barra de cinco destinos ─────────────
```

- Fecha en columna de 56 px: abreviatura de día 12/16 semibold, número 28/34 negrita. A la derecha, cantidad 16/24 semibold, hora secundaria 14/20 y chips con inicial/nombre corto. No repetir año y nombre completo del día siete veces; nombre accesible sí completo.
- Vacío: altura mínima 64, fecha + «Sin alumnos agendados»; sin gran tarjeta blanca, sin botón ancho por día. Si existe horario, «18:00 · Sin alumnos agendados». No decir «No hay clases» solo porque no hay reservas.
- Ocupado: mínimo 96, crece con contenido; fondo suave y borde lateral de marca de 4 px, no colorear toda la semana. Hasta dos chips de nombre con inicial y `+N` no interactivo; debajo, desglose textual de modalidad. Evitar iniciales solas como identificación. Al crecer texto, chips envuelven sin corte horizontal.
- Cada franja es **un único disparador «Ver día …»**, no anidar botones de chips dentro. «+N» resume y el toque en la franja abre todos. Lista completa en Día, no scroll horizontal oculto de alumnos.
- Día seleccionado con contorno y etiqueta Seleccionado; Hoy se distingue con pequeña píldora. Las dos señales pueden coexistir. Rango compacto, con fechas completas en nombre accesible; en cruce de año, mostrar ambos años.
- Mantener visibles siete días y orden lunes–domingo. Primera entrada sin autoscroll que esconda header; la compacidad evita pasar cinco pantallas vacías. «Hoy» es control de orientación, no otro CTA bajo el rango.
- Información de vencimientos, si se necesita en el resumen semanal, solo enlace textual secundario «1 vencimiento» con destino al detalle de ese día. No hacer que una franja sin alumnos parezca ocupada por un vencimiento.

## 6. Wireframe D — Día seleccionado

```text
[‹ Volver a Mes]                   [Hoy]
Martes 17
Noviembre 2026 · 1 alumno programado
[‹ Día anterior]             [Día siguiente ›]

Danza · 18:00–19:00            1 alumno
┌─────────────────────────────────────────┐
│ [LS] Lucía Silva         [Individual]  › │
└─────────────────────────────────────────┘

[› 1 mensualidad vence este día]

                           [ + Agendar ]
──────── barra de cinco destinos ──────────
```

- Encabezado: 28/34 para día, 14/20 para mes/año, cantidad 16/24. Fecha y personas antes que clase o advertencia. No gigantesco bloque hero ni ilustración decorativa.
- Agrupar por ocurrencia/horario en orden cronológico; una sola cabecera pequeña por grupo. Si hay dos clases el mismo día, no mezclarlas en una fila única sin contexto. No introducir nueva duración, profesor ni grupo.
- `AlumnoProgramadoRow`: mínimo 72 px, avatar de iniciales **40 px**, nombre 16/24 semibold hasta dos líneas, badge de modalidad 12/16 que puede pasar debajo al faltar espacio, chevron. Invertir el avatar según modalidad opcional, badge textual siempre obligatorio. Sin fotos reales ni descarga de imágenes; iniciales derivadas de ficha canónica.
- La fila completa abre programación; desde allí «Ver ficha» y «Retirar programación». Nada de checkboxes, swipe para marcar presente, estado Presente/Ausente, puntajes ni «Cobrar» dentro de Agenda.
- Badge corto «Mensual» o «Individual». Leyenda/etiqueta accesible de individual: «Por clase individual». Nunca usar «Vigente» para nombrar modalidad: mensual puede estar vencida y sigue siendo modalidad, no estado de pago.
- Vencimientos al final, colapsados, icono reloj + texto completo. Cuando se expanden conservan Vence/Venció DD/MM y Próxima renovación, acceso a ficha. Su cantidad no se suma a alumnos programados ni anuncia cobro nuevo.
- **FAB extendido** `+ Agendar`, alto 56, ancho mínimo 112, radio píldora, fondo marca, texto sobreMarca, sombra flotante existente. Anclado a derecha con 16 px, **16 px por encima de barra inferior + safe area**, no encima del último alumno. Reservar padding inferior de contenido suficiente para barra+safeArea+56+32. Permanece al hacer scroll, no rebota ni desaparece por desplazamiento. Con texto grande puede pasar a barra de acción fija de ancho disponible; no recortar etiqueta.

## 7. Wireframe A — Modal de agendar

```text
                    ───
Agendar alumno                       [Cerrar]
Mar 17 nov 2026 · Danza 18:00–19:00

[ Buscar alumno…                         ]
[ Todos | Mensuales | Individuales       ]

( ) [LS] Lucía Silva          [Individual]
( ) [IC] Inés Costa              [Mensual]
( ) [AP] Ana Pérez               [Mensual]
                    … lista desplazable …
[ + Crear ficha nueva ]

Agendar no cobra ni confirma que vino.
[             Agendar alumno             ]
```

**Los radios son selección de una ficha para agendar, nunca lista de asistencia.**

- Hoja con radio superior 28 y alto máximo aproximado 90% del área segura; contenido desplazable, cabecera y pie de confirmación persistentes. Con teclado, ventana baja o texto grande: presentación completa de la misma ruta, sin superponer el CTA al teclado. En modal, fondo inerte y barra inferior sin interacción; no dejar dos barras activas.
- Fecha siempre visible. Si hay una sola ocurrencia, mostrar horario contextual sin un selector redundante; si hay varias, selector «Clase / horario» antes de la lista. Si no hay ninguna, campo obligatorio de hora para **esa fecha concreta**, igual al flujo vigente; no sugerir serie semanal ni crear recurrencias.
- Búsqueda por nombre y modalidad (Todos / Mensuales / Por clase individual). En el dibujo «Individuales» abrevia por espacio, pero la etiqueta visible definitiva será **Por clase individual** con wrap/selector si no cabe: no sustituir las opciones aprobadas por Nico. Los filtros no alteran fichas ni modalidad y no son un nuevo orden de Alumnos.
- Selección única de alumno. Fila con inicial/nombre/badge; seleccionado con radio, contorno y texto. Duplicado en la ocurrencia: «Ya está agendado en este horario», sin permitir confirmación; no ocultar la ficha como si hubiera desaparecido.
- El CTA pasa de «Elegí un alumno» deshabilitado a «Agendar alumno» cuando la selección y el horario son válidos. El nombre/fecha/horario quedan en resumen accesible antes de confirmar. No agendar al tocar la fila ni al crear ficha.
- Crear ficha nueva abre **alta canónica** y conserva borrador/origen/fecha; volver selecciona la nueva ficha, pero todavía requiere confirmación de programación. No segunda base de alumnos ni alta express que pierda historial.
- Guardando: deshabilitar reenvío, anunciar «Agendando…»; sin éxito anticipado. Éxito confirmado: cerrar hoja, actualizar conteos/fila y mensaje «Alumno agendado para el 17/11 a las 18:00». En demo, aclarar que solo dura la sesión.
- Error: conservar búsqueda, elección y fecha; «No pudimos agendar. Reintentá.» junto al CTA. Duplicado por concurrencia: «Ya está agendado en este horario», refrescar relación sin duplicarla. Offline sin soporte real: «Sin conexión. Podés consultar lo disponible; no se guardó la programación», no cola invisible.
- Cerrar/escape/atrás no confirma. Volver devuelve foco al FAB. Si una alta canónica tiene cambios sin guardar, reutilizar su advertencia de descarte; no introducir confirmación extra al cerrar un selector sin cambios de ficha.

### Retirar programación, sin ampliar negocio

Desde fila → detalle de programación existente → «Retirar programación» → confirmación con fecha y alumno: «Solo se retira de esta fecha. Su ficha, historial y pagos se conservan». Cancelar por defecto, confirmar explícito. No etiquetar «Eliminar alumno», no ofrecer anular pago ni cancelar clase desde esta acción. Sin inventar políticas Q2/Q3 ni deshacer financiero automático.

## 8. Color, jerarquía y accesibilidad

### Reutilizar el sistema; la modalidad necesita un rol nuevo, no otro tema

Superficies, tipografía System, radios, espaciado y sombras de **Ritmo sereno**. Mantener fondo marfil `#FBF7F4`, superficie blanca, tinta `#1F1719`; oscuro usa sus tokens correspondientes. Se resuelve con color localizado y composición, no con gradientes grandes, arcoíris ni iconografía nueva sin necesidad.

| Rol | Claro | Oscuro | Condición |
|---|---|---|---|
| Agenda, selección, FAB | marca `#7A2F8C`, sobreMarca `#FFFFFF` | marca `#D9A2EA`, sobreMarca `#2A0E33` | Tokens existentes |
| Mensual | tinta `#7A2F8C` / fondo `#F1E4F5` | tinta `#D9A2EA` / fondo `#3A2142` | Reutiliza marca/marcaSuave; círculo + texto |
| Por clase individual | tinta `#344E7A` / fondo `#E8EEF8` | tinta `#B8CAEF` / fondo `#222D40` | Alias azulado propuesto por Vito en ENC-12, rombo + texto; aún no exportado en tokens |
| Vacío | fondo sin relleno de modalidad, texto normal | equivalente del tema | Sin conteo cero ni opacidad que parezca deshabilitado |
| Vencimiento/estado financiero | roles semánticos ya existentes | roles semánticos existentes | Nunca reutilizarlos para pintar una modalidad |

**Precisión de handoff:** el acento violeta sí está definido por Vito; no encontré token rosa de modalidad en `tokens.ts`. Durante esta entrega apareció su [dirección visual ENC-12](../visual/agenda-visual-enc12.md), trabajo concurrente que preservé: propone violeta mensual y azul suave individual. Adopté esa pareja en esta especificación, sin crear una paleta rosa paralela ni presentar sus alias como tokens ya exportados. El acento de Agenda sigue siendo violeta. Reina debe consumir el rol resuelto por Vito, no dispersar hexadecimales en componentes. No usar el rojo de error/deuda para «Individual» ni verde de vigente para «Mensual».

Cálculo sRGB de texto/fondo mediante Python: mensual claro **6,57:1**, oscuro **6,98:1**; individual de Vito claro **7,16:1**, oscuro **8,39:1**; FAB claro **8,04:1**, oscuro **8,52:1**. Son cálculos de estas parejas opacas, **no auditoría del rediseño renderizado** ni de fondos compuestos. Si cambia un valor o usa transparencias, recalcular. Texto normal ≥4,5:1 y componentes esenciales/foco ≥3:1 respecto de adyacentes.

- Color acompañado de nombre/modalidad, forma de marcador y conteo; Hoy, selección y foco con señales diferentes.
- Controles generales 48 px; fechas mínimo 44. No convertir `+N` minúsculo en botón independiente.
- Nombres largos y texto ampliado: wrap, fila crece; badge pasa de línea; no scroll horizontal ni tamaño fijo que corte nombre/fecha.
- Web: estructura de calendario semántica y botones de fecha con nombre completo/selección. Si se implementa patrón ARIA grid, incluir todo su teclado (flechas y gestión de foco); si no, tabla y botones accesibles sin grid incompleto. No meter 42 elementos en el orden de foco cuando no corresponden al mes.
- Abrir Día enfoca título; volver enfoca celda/franja de origen. Modal contiene foco, permite Escape/atrás y lo devuelve. No mover foco al re-render de contadores. Anuncio breve de cambio de rango/fecha/cantidad por región de estado, sin leer toda la agenda.
- No declarar VoiceOver/TalkBack aprobados desde estas capturas. Probarlos después en la implementación correspondiente.

## 9. Estados por superficie

| Estado | Mes / Semana | Día | Agendar |
|---|---|---|---|
| Con alumnos | Relleno suave, marcadores, conteo real; chips en Semana | Filas con inicial, nombre, modalidad, horario | Fichas canónicas seleccionables |
| Fecha seleccionada | Estado visible + accesible, distinto de Hoy/foco | Fecha explícita arriba | Fecha fija en cabecera/resumen |
| Día vacío | Celda sin cero / franja compacta | «Todavía no hay alumnos agendados para este día» + FAB; horario si existe | Buscar ficha y elegir horario/hora concreta |
| Mes/semana vacíos | Calendario/franjas siguen visibles, mensaje breve «No hay alumnos agendados en este período» | No inferir cero histórico/ausencias | Agendar disponible si puede guardarse |
| Cargando | Esqueleto estático en área de conteos; rango y controles estables; no `0` falso | Filas placeholder, no inventar nombres | Lista en carga, confirmación no disponible |
| Error parcial | «No pudimos cargar las programaciones» + Reintentar; conservar fecha/rango y datos sanos | No reemplazar error por «nadie viene»; vencimientos fallidos separados | Conservar borrador, mostrar error local |
| Sin conexión | Aviso de disponibilidad real; no afirmar cache si no existe | Consulta solo de datos efectivamente disponibles | Confirmación bloqueada si no hay escritura offline definida |
| Muchos alumnos | Mes: total; Semana: dos chips +N | Lista vertical por horario, sin truncar resultados | Búsqueda y lista desplazable, pie accesible |
| Horario cancelado | No sumar a «vienen» | Etiqueta Cancelada y programación conservada según datos, sin agendar ahí | Ocurrencia cancelada no seleccionable |
| Búsqueda sin resultados | No aplica | No aplica | «No encontramos alumnos» + limpiar búsqueda/filtro; crear ficha canónica, sin autoalta |

## 10. Contrato de implementación para Reina

### Componentes sugeridos (nombres orientativos, no código creado)

```text
AgendaScreen
 ├─ AgendaHeader / ViewSegment(Semana, Mes) / PeriodNavigator
 ├─ WeekStripList → DayStrip → StudentSummaryChip / ModalityBadge
 ├─ MonthCalendar → MonthDayCell / CalendarLegend
 │                  └─ SelectedDayPreview → StudentSummaryRow
 └─ ScheduleFAB
DayScreen
 ├─ DayHeader / DayNavigator
 ├─ OccurrenceSection → ScheduledStudentRow(AvatarInitials, ModalityBadge)
 ├─ ExpiryDisclosure (reusar existente)
 └─ ScheduleFAB
ScheduleStudentSheet
 ├─ DateOccurrenceSummary / StudentSearch / ModalityFilter
 ├─ StudentPickerList / CanonicalStudentCreateLink
 └─ SelectionSummary / ScheduleSubmitState
ExistingScheduleDetail / RemoveScheduleConfirmation (reusar flujo)
```

`ModalityBadge` y `AvatarInitials` compartidos entre Semana, Día, resumen y selector; una única derivación de modalidad desde ficha canónica. No guardar copias de nombre/modalidad en celdas. Si se necesitara modalidad histórica por ocurrencia, es una definición de dominio futura, no un estado inventado en UI.

### Estado mínimo y datos derivados

- UI: vista/rango/fecha seleccionada, Día abierto y origen, scroll por vista, modal abierto, query/filtro, alumno/ocurrencia elegidos, hora explícita cuando corresponda, estado carga/error/envío, expansión de vencimientos.
- Derivar de relaciones activas alumno–ocurrencia: lista por día/horario, conteo único diario, cantidad de programaciones y desglose por modalidad actual. No mantener contadores independientes que se desactualicen al retirar/agendar/cambiar ficha.
- Separar carga/error de programaciones y vencimientos. «0» solo si la consulta de esa parte terminó correctamente. La demo usa estado de sesión; una app durable exige repositorio/autorización/idempotencia y no se demuestra con esta especificación.
- Restaurar fecha/rango/scroll/foco desde ficha, alta o programación. No volver a Hoy después de agendar una fecha distinta.
- Mantener hashes/rutas históricas mediante adaptación; Día es nueva presentación, no motivo para romper enlaces previos. `#asistencia` heredada queda fuera de la superficie central Agenda y no se transforma en reserva ni se elimina sin otro encargo.

### Deltas frente al flujo vigente

| Hoy en demo | Sustitución propuesta | Lo que NO cambia |
|---|---|---|
| Semana: fecha completa + texto + botón por día | Franja con columna de fecha, chips y conteo; acción flotante contextual | Siete días, selección, navegación y mismos datos |
| Mes: clase/reloj con ceros en cada celda | Ocupación por personas/modalidad; detalle secundario de vencimiento | Mes seleccionable, fecha completa accesible y alternativa de lectura |
| Detalle embebido extenso | Resumen compacto en Mes + Día como nivel de detalle reutilizable | Acceso a ficha, programación y retiro |
| Modalidad como texto común | Badge violeta/azul suave con texto y forma | No es estado financiero ni modalidad editable aquí |
| Agendar en página con formulario largo | Hoja contextual o pantalla completa adaptativa | Ficha canónica, una fecha, horario explícito, confirmar antes de reservar |
| Explicación de negocio repetida por tarjeta | Nota breve en modal y ayuda contextual, aviso de demo conservado | Agendar no cobra, no inicia ciclo ni confirma que vino |

### Movimiento breve, sin motor extra

- Usar tokens **160 ms** para selección/cambio de rango/vista; **240 ms máximo** para feedback de guardado; 0 con reducción de movimiento. Opacity y traslación máxima 4 px, según guía ENC-09. No animar cada alumno ni cada día en cascada.
- Mes ↔ Semana conserva cabecera y contexto; transición del cuerpo, no morph de 42 celdas ni scroll automático. Abrir Día/modal con entrada corta; foco/estado semántico inmediatos, no esperan animación.
- Scroll nativo libre; si un control «Ver día» provoca navegación, no desplazar lentamente toda la página hasta un detalle lejano. No interceptar rueda/touch ni esconder la barra inferior al desplazarse.
- Sin rebotes, parallax, bucles/shimmer permanente ni animación de dinero/layout. Reduced-motion también elimina desplazamiento suave programático.

### Conciliación con la dirección visual ENC-12 concurrente

Leí la entrega de Vito al aparecer en el árbol de trabajo; no la modifiqué. Coincidimos en calendario compacto, nombres fuera de las celdas, chips, FAB y vacíos bajos; incorporé su paleta de modalidad. Quedan estos deltas explícitos para que Ada los concilie al armar una única unidad, sin pedir una nueva decisión de negocio:

- **Ancho de grilla:** Vito propone 44 px por celda + gaps de 4 px: requiere **332 px útiles** (más márgenes). A 360 con márgenes 16 quedan 328. Recomiendo esta especificación UX: eliminar gaps horizontales o usar bloque a sangre antes de activar alternativa lineal; nunca bajar de 44 por fecha. El mínimo 308 de este documento presupone cero gaps, no contradice la aritmética de la guía visual.
- **Movimiento:** Vito ENC-12 propone 8–12 px y spring corto; su ENC-09 previo limita a 4 px y sin spring. Recomiendo mantener **4 px / 160 ms / sin spring**, ya existente y suficiente para el pedido de fluidez sobria. No presento ninguna de las dos como una política de negocio aprobada.
- **Contenido de celda:** Vito resume con un punto y contador opcional. UX propone hasta dos formas por modalidad y total explícito para responder «cuántos vienen». Si no cabe el total sin recortar fecha, conservar un marcador de actividad y total/desglose en el resumen seleccionado; no volver a contadores de clases/vencimientos ni a ceros repetidos. La leyenda debe reflejar la variante que se implemente, no prometer desglose ausente.

## 11. Aceptación observable del futuro candidato

Esta lista es para Vito/Reina y posterior revisión; **no está ejecutada sobre un rediseño todavía inexistente**.

1. A 360/390, Mes se reconoce como grilla de siete columnas; 15, 17 y 19 muestran actividad según reservas reales, vacíos sin ceros. Noviembre mantiene seis filas; diciembre/enero no pierden fecha/año.
2. Una fecha con dos modalidades muestra ambos marcadores y total correcto. Misma persona en dos ocurrencias: 1 alumno, 2 programaciones; ningún duplicado alumno–ocurrencia activo.
3. Semana deja explorar varios días en un viewport, vacíos compactos, con nombres legibles/chips y fecha prominente; no siete CTAs anchos repetidos.
4. Seleccionado ≠ Hoy ≠ foco; ambos temas y lectura sin color conservan significado. Leyenda de modalidades visible.
5. Día ofrece filas con inicial/nombre/badge y agrupación por horario. FAB no tapa última fila ni barra, también con safe area/texto grande/teclado.
6. Mes → seleccionar → Ver día → modal → cancelar/guardar → volver conserva fecha, vista, scroll y foco. No pasar involuntariamente a Hoy ni seleccionar por scroll.
7. Agendar ficha antigua no duplica ficha; crear usa alta canónica y no agenda hasta confirmar. Doble envío/duplicado no agrega relación repetida. Retirar conserva ficha/historial/pagos.
8. Consultar, reservar, retirar o faltar no marca asistencia, crea deuda/cobro, inicia/extiende mensualidad ni agrega recupero. No checkboxes de asistencia en Agenda.
9. Vacío, carga, error parcial, cancelada y offline se distinguen; no hay cero falso ni éxito sin guardado. La demo explica su reinicio.
10. 320 útil y 200% de texto: grilla solo si caben objetivos ≥44; alternativa lineal con detalle primero si no. Sin desbordar página, nombres cortados ni controles inaccesibles.
11. Teclado/foco, modal/atrás, lector de pantalla y reduced-motion probados sobre implementación; consola sin errores y regresión de rutas/recorridos financieros heredados sin acoplarlos a Agenda.

## 12. Evidencia y próximos responsables

### Capturas de la demo actual (no son mockups del rediseño)

| Archivo | Viewport | Qué documenta |
|---|---|---|
| [semana-inicial-390.png](evidencia-enc12/semana-inicial-390.png) | 390×844 | Header y primeros días vacíos; controles/acciones ocupan la entrada |
| [semana-hoy-390.png](evidencia-enc12/semana-hoy-390.png) | 390×844 | Día 15, dos nombres mensuales y acciones repetidas |
| [semana-17-390.png](evidencia-enc12/semana-17-390.png) | 390×844 | Semana 16–22, detalle de días con/sin clase |
| [mes-390.png](evidencia-enc12/mes-390.png) | 390×844 | Cuadrícula con ceros, selección 15, días 17/19 sin señal de alumnos |
| [dia-17-390.png](evidencia-enc12/dia-17-390.png) | 390×844 | Lucía individual; tarjeta de clase y vencimiento |
| [agendar-390.png](evidencia-enc12/agendar-390.png) | 390×844 | Formulario actual canónico, fecha 17/11 |
| [mes-320.png](evidencia-enc12/mes-320.png) | 320×780 | Adaptación sin tabla visible y detalle primero |

Capturas por MCP Chrome, copiadas sin transformación desde su directorio de salida. Primer intento de captura en `/tmp` fue rechazado por raíces permitidas; repetí en el directorio autorizado. Un selector de detalle no coincidió; localicé su referencia en snapshot y accioné el botón correcto. No fueron errores de la app ni motivos para cambiar de navegador.

### SHA-256 de las tres piezas públicas verificadas

```text
index.html  61c7e51082c65bcc6545498041295ff2a2d90dfe6c6b943dccf9030a6b0b4f4c
agenda.css  ccea36cf5f79e7cc85310634bdea1316116b154f6b781553aadf968ff93d5af2
agenda.js   281df565c67fc3d94be212a2ac4d668d6509404ca3680377bf4632e558b1f17a
```

**Sigue Vito (`7e0c8d1df108-vito`):** conciliación de estas superficies con su dirección visual concurrente y cierre de alias de modalidad, sin cambiar reglas ni navegación. **Después Reina (`7e0c8d1df108-developer`), cuando Ada asigne y Nico inicie externamente:** implementación acotada, no este encargo documental. Gino conserva QA independiente de un candidato exacto. No inicié sus sesiones ni les asigné trabajo APX.

**NO VERIFICADO:** apariencia/fluidez del rediseño (no implementado), tema oscuro renderizado de la propuesta, reduced-motion efectivo de la propuesta, teléfono físico, lector de pantalla, usuaria real, persistencia/BD, seguridad multi-instituto y producción. No hace falta una decisión de negocio nueva para avanzar en este alcance; la concreción visual de Vito sigue siendo propuesta de diseño, no aprobación de Nico.
