# ENC-13 · Agenda: calendario compacto y expandido

**Fina · 15/11/2026.** Especificación UX para revisión de Ada y dirección visual de Vito; **no es implementación ni aprobación estética de Nico**. Sustituye en la propuesta ENC-12 el modelo de navegación Mes → resumen → Día **solo para la exploración del calendario**: tocar una fecha de Mes abre la agenda expandida en esa fecha. La regla de que agendar no cobra, no inicia ciclo y no registra asistencia permanece. Mantener Alumnos como sede de la ficha. Separa superficies de programación de las de vencimientos. El diseño de calendario abierto de la revisión ENC-13 previa se conserva en el estado compacto, pero cambia su acción primaria de selección.

## Referencias observadas y límites

- Referencia compacta de Nico: imagen `upload-iDHSWm/image.png`: encabezado de mes discreto, siete columnas de números pequeños sobre plano continuo, indicadores mínimos, un día resaltado sin tarjetas por fecha. Su baja resolución impide copiar tipografía/medidas literalmente.
- Referencia expandida: `upload-zHhQJh/image.png`: semana tipo Google Calendar, horas a la izquierda y bloques de eventos distribuidos por día/hora. Tiene más colores y columnas que caben en móvil; es **referencia de anatomía**, no de densidad, paleta ni literalidad de la app.
- Tokens ENC-02 y visual ENC-12 de Vito: claro mensual `#7A2F8C` sobre `#F1E4F5`; individual `#344E7A` sobre `#E8EEF8`; oscuro mensual `#D9A2EA` sobre `#3A2142`, individual `#B8CAEF` sobre `#222D40`. Vito debe validar las combinaciones efectivas y el tratamiento de bloques, no aplicar hexadecimales sueltos en componentes. Indicadores de 6 px requieren etiqueta accesible; no se lee su color como texto.

## 1. Estado compacto — Mes (default)

```text
Agenda                          [Hoy]
‹        Noviembre 2026           ›
 Lu     Ma     Mi     Ju     Vi     Sá     Do
                                            1
  2      3      4      5      6      7      8
  9     10     11     12     13     14     15
                                       ●
 16     17     18     19     20     21     22
        ◆             ●◆
 23     24     25     26     27     28     29
 30
 ● Mensual   ◆ Por clase individual

[+ Agendar]                 (barra de destinos)
```

Dibujo ilustrativo: números sin borde, fondo ni tarjeta de día; no representa datos reales. **No mostrar nombres, horarios, contadores `0` ni texto de eventos dentro de la cuadrícula.** Fecha 14–16 px sobre columnas de igual ancho, mínimo táctil 44×44 (preferir 48), espacio vertical para indicador y tipografía ampliada; a 320 px, siete columnas de 44 exigen 308 px útiles. Si no entran, fallback lineal accesible en vez de disminuir objetivo. Mantener día adyacente atenuado pero legible, sin opacidad adicional. Mes de 5 o 6 semanas según el calendario, no estirar hasta el alto de pantalla.

**Marcadores:** cero alumnos programados = ningún marcador. Mensual = un punto violeta centrado debajo del número; individual = rombo azul del mismo tamaño; ambas = los dos separados 3–4 px. Marcan presencia de *al menos un alumno activo* de cada modalidad, jamás cantidad de eventos, asistencias ni pagos. Si una persona tiene dos programaciones del día, se cuenta una sola persona para el resumen accesible y se muestran dos ocurrencias en expandido. Vencimientos y clases sin alumnos no se convierten en puntos de modalidad. No repetir marcadores por persona; sin badge numérico permanente en celdas. Nombre accesible del botón: fecha completa, Hoy si corresponde, «N alumnos programados» y modalidades; si no hay alumnos, «Sin alumnos agendados». Leyenda visible debajo de la grilla; color más forma, no color solo.

**Hoy:** círculo sólido de acento solo detrás del número, con texto sobreMarca. **Día de retorno/fecha activa:** círculo suave detrás del número distinto de Hoy; si coincide, prevalece el círculo de Hoy y la etiqueta accesible «Hoy, seleccionado». El foco de teclado es un anillo independiente en el objetivo táctil. No pintar la celda entera, ni con selección ni con hover.

## 2. Estado expandido — agenda por horas

**Móvil 320–390 px:** una columna de **día** a ancho disponible, horas a la izquierda y bloques a la derecha. Encabezado con tira de siete fechas para cambiar de día; no miniaturizar siete columnas de eventos en 320 px. En ancho amplio/tablet, la misma estructura puede mostrar hasta siete columnas diarias y la columna de horas, sin alterar la semántica; las columnas no deben caer por debajo de la anchura necesaria para nombre y hora. El default tras tocar fecha es **Día por horas**. Selector «Día | Semana» opcional en expandido, Semana solo cuando la anchura permite bloques legibles o con desplazamiento horizontal de días *dentro del calendario*; la grilla mensual nunca desplaza horizontalmente la página.

```text
[‹ Mes]   Mar 17 nov 2026          [Hoy]
 [‹] Lu16  [MA 17]  Mi18  Ju19  Vi20  Sá21  Do22 [›]
       08:00 ┆
       09:00 ┆ [ LS  Lucía Silva           ]
             ┆ [ 09:00–10:00 · Individual ]
       10:00 ┆
       11:00 ┆ [ IC  Inés Costa            ]
             ┆ [ 11:00–12:00 · Mensual    ]
       ...   ┆
       18:00 ┆ [ AP  Ana Pérez             ]
             ┆ [ 18:00–19:00 · Mensual    ]
             ┆
                    [ + Agendar ]
──────── Hoy · Alumnos · Agenda · Cobros · Más ────────
```

Horas del ejemplo ilustrativas, no fixtures. Bloques posicionados por hora real de inicio y duración real, sin inferir duración faltante ni inventar horarios. Abertura inicial de día: desplazar solo el área horaria al primer evento del día con un tramo anterior visible; si está vacío, mostrar franja de horario disponible y mensaje «No hay alumnos agendados para este día» + FAB, no pantalla vacía ni salto a hora arbitraria. Mantener cabecera/fecha/FAB/barra inferior fuera del scroll. Para evitar eventos diminutos: bloque con alto visual mínimo 64 px, aun si dura menos; si se solapan horarios, columnas parciales **solo si nombre y hora caben**, si no agrupar con `+N en esta hora` que abre lista accesible de todos. Etiquetas horarias consistentes; línea actual solo en Hoy, no en cualquier día. Si una clase agrupa alumnos, cada **programación** tiene un bloque propio o grupo expandible con todas las personas, no un bloque engañoso de clase como si fuera una sola persona. Evento cancelado, si los datos lo conservan, queda etiquetado «Cancelado» y no cuenta en puntos ni «vienen»; no ofrece edición de programación activa desde un cancelado.

### Anatomía del bloque

1. Iniciales en avatar 32–40 px de ficha canónica, sin foto nueva obligatoria; nombre completo de alumno en semibold de 14–16 px, hasta dos líneas o truncado con nombre completo accesible y disponible en edición.
2. Horario local de inicio–fin en 12–14 px, con hora completa accesible. Si no existe fin fiable, mostrar inicio y no inventar fin.
3. Etiqueta textual **Mensual** / **Por clase individual** (puede abreviarse visualmente a «Individual» en bloque estrecho, con etiqueta accesible completa), junto a forma/color. Violetas para mensual, azulados para individual; superficies suaves, tinta de alto contraste, no pintar rectángulos saturados ilegibles. Un borde lateral pequeño puede reforzar categoría sin convertir la pantalla en un mosaico de colores.
4. Bloque completo = un objetivo accesible con nombre «Editar programación de [alumno], [fecha], [horario], [modalidad]». Alto táctil mínimo 44 px y foco visible; evitar botones anidados dentro. Vencimiento no se representa como bloque de alumno.

## 3. Transiciones y acciones

| Acción | Respuesta | Retorno |
|---|---|---|
| Abrir Agenda | Mes compacto en mes actual; Hoy marcado, fecha de retorno si hay estado previo. | No crear evento al entrar. |
| Tap en fecha del Mes (incluida vacía) | Marcar número, **expandir a Día por horas** anclado en la fecha tocada; el encabezado y tira semanal mantienen orientación. | «‹ Mes», gesto descendente desde cabecera o botón accesible restauran mes y foco a esa fecha. |
| Swipe **up** desde zona libre de la grilla o asa inferior | Expande la fecha activa; si aún no hay selección activa, Hoy. | Swipe **down** desde cabecera/asa vuelve a compacto; nunca interceptar scroll de eventos ni scroll general de página. |
| Swipe horizontal de Mes | Cambia mes con mismas flechas de 48 px. | Conserva fecha válida/selección; anuncia rango nuevo. |
| Tap en otra fecha de tira semanal | Cambia día expandido y recoloca scroll al primer evento de ese día; no abre edición. | Tira y fecha se actualizan juntas. |
| Tap en bloque | Abre **edición de esa programación**, no ficha ni cobro. Si la app solo tiene detalle de programación con acción Editar, ese detalle es el punto de entrada y la edición debe ser explícita; no guardar nada por tap. | Guardar confirmado actualiza bloques y marcadores; cancelar vuelve a mismo día/hora. |
| Long-press en bloque | Hoja de opciones con «Editar programación», «Ver ficha del alumno», «Retirar programación»; retiro requiere confirmación y solo retira relación para esa fecha, sin tocar pagos/ficha. | Escape/atrás/cancelar cierra sin cambios y devuelve foco al bloque. |
| Tap en FAB `+ Agendar` | Abre flujo de agendar con fecha expandida ya elegida; si se inició desde franja horaria libre inequívoca, precargar hora, pero **confirmarla** en el formulario. | Guardar confirmado actualiza Día/Mes; cancelar conserva posición. |

**El swipe es atajo, nunca único camino.** Animación de expansión/repliegue de 160–240 ms (tokens), transform/opacidad breve del mismo contexto; no morph largo de 42 celdas a cientos de bloques ni salto que pierda fecha. Movimiento reducido: instantáneo. Al abrir expandido, foco accesible en título de fecha, anuncio breve de cantidad de programaciones; al cerrar, foco vuelve al botón de fecha origen. No robar foco por cambio de contadores. La interacción de tap del Mes sustituye el anterior tap→resumen inferior; un pequeño texto «Tocá un día para ver horarios» puede orientar primer uso. Sin doble toque, ni requisito de arrastre para abrir.

**FAB:** anclado arriba de barra inferior/safe area, alto 56, etiqueta `+ Agendar`, padding inferior de la lista para que no tape bloques; en texto ampliado, acción fija de ancho completo si no cabe. En Mes, FAB puede iniciar agendado en fecha activa/Hoy con la fecha visible antes de confirmar. En expandido, fecha siempre visible. No convertir tap en hora vacía en creación automática; se puede ofrecer «Agendar a las HH:MM» como acceso equivalente con confirmación. Agendar no cobra ni inicia ciclo, no pasa lista.

## 4. Estados, accesibilidad y verificación

- Cargando: conservar mes/tira/horas, no mostrar `0` ni puntos falsos; esqueletos estáticos en área de eventos. Error parcial: «No pudimos cargar las programaciones» y «Reintentar», sin presentar mes vacío como verdad. Offline sin escritura soportada: no simular confirmación.
- Día sin alumnos: números sin marcadores en Mes; expandido con mensaje, horas legibles y FAB. Muchos alumnos: resumen accesible con cantidad única; bloques cronológicos o grupo `+N` operable, nunca ocultar alumnos. Dos modalidades en un día: dos símbolos; dentro de bloque etiqueta textual y contraste comprobado. Horario sin alumnos: no punto de modalidad, pero sus horas siguen visibles en expandido si el dato existe.
- Controles 48 px salvo fecha mínima 44; nombres de accesibilidad con día, alumno, hora y modalidad; alternativa a long-press visible en edición/menú de bloque para teclado y lector de pantalla. Si se usa patrón grid ARIA, implementar navegación por flechas y manejo de foco completo; si no, usar botones de fecha semánticos sin rol grid incompleto. Bloques superpuestos no pueden impedir tocar opciones. Texto a 200 %, 320/360/390, ambos temas, foco, teclado, VoiceOver/TalkBack y reduced-motion requieren prueba sobre candidato real.
- La foto semanal de referencia es escritorio y muy densa. **No** copiar siete columnas mínimas ni todos sus colores en móvil. El diseño debe seguir el sistema «Ritmo sereno» y permitir leer nombre/hora antes de decorar.

## 5. Criterios de aceptación para handoff

1. Estado inicial = Mes de superficie continua: cero bordes/fondos individuales, números pequeños, sin texto de eventos; Hoy y marcadores de modalidad distinguibles y accesibles.
2. Tap de cualquier fecha abre Día cronológico con tira semanal y bloques de alumnos; botón y gesto de retorno llevan al mismo mes/fecha/foco.
3. Punto mensual violeta, rombo individual azul; ambos si corresponde, ninguno en vacío; cantidad accesible refleja alumnos únicos activos, no deudas/asistencias.
4. Cada bloque muestra nombre, hora real, modalidad textual y avatar de iniciales; tap lleva a edición (o detalle con entrada Editar), long-press y menú accesible a opciones; no hay escritura por tocar.
5. FAB precarga fecha/hora elegida y requiere confirmación explícita; éxito actualiza ambos estados, error preserva borrador. Agendar no cobra, no inicia ciclo, no registra asistencia.
6. Móvil muestra un día por ancho y horas, nunca una semana de siete bloques microscópicos; temas y texto ampliado no rompen controles ni tapan eventos; movimiento reducido disponible.

**No verificado:** comportamiento ni aspecto de ENC-13 en app renderizada, navegación real de edición/long-press, accesibilidad en lector de pantalla, contraste efectivo en bloques superpuestos y teléfono físico. Requiere cierre visual de Vito y QA de candidato de Reina/Gino. Esta especificación no da por aprobada la implementación.