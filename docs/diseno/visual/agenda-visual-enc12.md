# ENC-12 · Dirección visual del calendario de Agenda

**Autor:** Vito · **Fecha:** 15/11/2026 · **Destinataria de implementación:** Reina (referencia visual) · **Base:** sistema ENC-02 (`tokens.ts`, `tokens.css`, `componentes.md`), dirección visual ENC-07B y UX `docs/diseno/ux/agenda.md` / prototipo publicado ENC-08R. Es una propuesta visual; no cambia reglas, estructura de navegación ni comportamiento acordado y no equivale a implementación ni aprobación estética de Nico.

## Revisión de la demo existente

La demo entrega información funcional, pero la semana se percibe como una sucesión larga de bloques casi iguales: falta una jerarquía visual clara entre fecha, agenda del día y personas, y los estados con/sin contenido no se distinguen de un vistazo. Los controles de período y las tarjetas de clase compiten por atención; las filas vacías ocupan mucho espacio sin aportar orientación visual.

Inspeccioné la URL pública solicitada en Chrome real MCP, `#agenda`, con la vista Semana inicialmente activa. El snapshot mostraba estructura y contenido a 305 px de ancho; no tomé esa vista como referencia de composición final responsive.

## Principios

- **Ritmo sereno:** marfil, ciruela y superficies claras existentes; nada de gradientes, emojis ni colores de deuda como decoración.
- **Escaneo primero:** separar visualmente número/fecha, presencia de alumnos y acciones. Color más forma/texto, nunca color como único significado.
- **Calendario real sin miniaturizar contenido:** Mes es para orientarse y elegir fecha; Semana/Lista y detalle contienen los nombres y acciones legibles.
- Mantener la semántica de programación: que una persona figure agendada no afirma asistencia, realización de clase ni cobro.
- La variante oscura se deriva de los mismos tokens; no aclarar fondos a mano ni imponer colores de modalidad que pierdan contraste.

## Paleta de estados exacta

Valores existentes tomados de `tokens.css` / `tokens.ts`; salvo los dos tokens nuevos para modalidad, no se agregan colores al sistema. Las referencias «tinta» y «superficie» significan color de texto/fondo correspondiente al tema activo.

| Estado / uso | Claro | Oscuro | Aplicación |
|---|---|---|---|
| Día vacío / texto de día adyacente | `--c-tenue #6B5A62` sobre `--c-superficie #FFFFFF` | `--c-tenue #B8AAB1` sobre `--c-superficie #241C1F` | Número/fecha de baja prioridad; no reducir opacidad adicional. Fondo de celda transparente o superficie. |
| Día con alumnos (indicador) | Punto `--c-marca #7A2F8C`; superficie `--c-superficie #FFFFFF` | Punto `--c-marca #D9A2EA`; superficie `--c-superficie #241C1F` | Punto de 6 px bajo el número; contador solo si hay más de una persona y cabe. |
| Hoy, no seleccionado | Círculo/aro `--c-marca #7A2F8C` sobre `--c-superficie #FFFFFF` | `--c-marca #D9A2EA` sobre `--c-superficie #241C1F` | Círculo de 36–40 px detrás del número con texto `--c-marca`; aro 2 px si no cabe relleno. No confundir con selección. |
| Día seleccionado | Fondo `--c-marca #7A2F8C`; texto `--c-sobre-marca #FFFFFF` | Fondo `--c-marca #D9A2EA`; texto `--c-sobre-marca #2A0E33` | Celda redondeada 12 px; conserva punto de actividad con contraste visible (usar `--c-sobre-marca`). |
| Modalidad mensual | `--c-marca-suave #F1E4F5` + tinta `--c-marca #7A2F8C` | `--c-marca-suave #3A2142` + tinta `--c-marca #D9A2EA` | Chip/avatar mensual; icono/inicial y etiqueta «Mensual». |
| Modalidad individual (nuevo token) | Fondo `#E8EEF8`; tinta `#344E7A` | Fondo `#222D40`; tinta `#B8CAEF` | Chip/avatar individual; icono/inicial y etiqueta «Individual». Neutral azulado para diferenciar de mensual sin competir con semántica financiera. |
| Borde y foco | `--c-borde #DED2D6`; foco `--c-foco #2347B5` | `--c-borde #504148`; foco `--c-foco #8FB0FF` | Foco visible de 2 px y separación 2 px; selección no elimina el foco. |

**Contraste:** los pares de modalidad nuevos se proponen como pares de texto normal AA; claro individual #344E7A/#E8EEF8 ≈ 7.3:1 y oscuro #B8CAEF/#222D40 ≈ 8.3:1. Los estados existentes son los definidos por tokens y el sistema de contraste del proyecto. Validar el tema efectivo y los colores de marca derivados con el verificador antes de integrar; no reutilizar `--c-marca-suave` con texto de otra tinta.

### Tokens sugeridos (sólo si se exporta esta distinción)

```ts
modalidad: {
  mensual: { fondo: '#F1E4F5', tinta: '#7A2F8C' },
  individual: { fondo: '#E8EEF8', tinta: '#344E7A' },
}
// tema oscuro
modalidad: {
  mensual: { fondo: '#3A2142', tinta: '#D9A2EA' },
  individual: { fondo: '#222D40', tinta: '#B8CAEF' },
}
```

Los tokens de modalidad colorean exclusivamente la categoría, no el estado de deuda/vigencia. En un instituto con marca personalizada se mantiene el par de modalidad legible; si se decide derivar también ese par, debe pasar comprobación AA y revisión visual en claro/oscuro.

## Vistas y anatomía

### Mes · navegación y elección de fecha

1. Encabezado de mes: «Noviembre 2026», 20/28 semibold, flechas anterior/siguiente en objetivos de 48×48 px. «Hoy» como acción secundaria, sin competir con el nombre del mes.
2. Encabezados de semana de 12/16 semibold, abreviaturas consistentes y accesibles con nombre completo. Cuadrícula de siete columnas; cada fecha ocupa una celda táctil mínima de 44×48 px, separaciones 4 px y radios 12 px. No comprimir texto crítico al cambiar escala tipográfica.
3. Día común: número 16/24 en `--c-tinta`, superficie sin relleno. Día fuera del mes en `--c-tenue`. Día con programación: punto 6 px, centrado 4 px bajo el número. Contador numérico compacto sólo cuando mejora el escaneo y cabe sin reducir el objetivo táctil.
4. Hoy se identifica con círculo de acento alrededor del número; seleccionado con relleno sólido de acento y texto blanco/oscuro de `--c-sobre-marca`. Si ambos coinciden, el relleno indica selección y un contorno 2 px de foco o aro interno diferencia hoy sin doble marcador confuso.
5. Debajo de la cuadrícula, la fecha elegida abre el resumen/detalle del día; transición sutil, nunca sustituir la fecha con un modal que oculte el mes.

Si siete columnas no conservan objetivos táctiles, contenido ni escala legible en el ancho disponible, usar la alternativa lineal de fechas indicada por UX, no encoger celdas. Mes no intenta mostrar nombres de alumnos dentro de la cuadrícula.

### Semana / lista · personas y días

- Un día por fila/sección con cabecera legible: día de semana 18/26 semibold y fecha 14/20 secundaria; hoy suma un marcador de acento, no una gran banda saturada.
- Contenido agendado como chips de persona con avatar circular de 32 px (inicial en modalidad correspondiente), nombre 14–16 px y chip «Mensual» o «Individual». Los chips envuelven a segunda línea; evitar carrusel horizontal y truncamiento de nombres.
- Separar días con 16 px verticales y divisor `--c-borde` o superficie alternativa `--c-superficie-alt`; tarjeta de día con radio 16 px sólo si mantiene continuidad y no produce una columna de tarjetas excesivamente pesada.
- Vacío: una línea «Sin alumnos agendados» en `--c-tenue`, icono lineal opcional, altura compacta; conservar acceso de agendar de acuerdo con UX, no replicar botón grande dentro de cada vacío por defecto.
- Alumnos agendados no son una confirmación de asistencia: no usar check verde, lenguaje «asistieron» ni símbolos de realizado.

### Detalle del día

Cabecera con día/fecha (28/34 para título principal de pantalla; 20/28 dentro de panel), y lista ordenada de alumnos según UX. Cada fila de mínimo 64 px: avatar circular 40 px con inicial y color de modalidad, nombre 16/24 semibold, badge de modalidad 12/16 con texto e icono discreto. Separación interna 12 px y divisor tenue; múltiples nombres nunca se resuelven sólo por color.

FAB «+ Agendar» de 56 px, preferentemente con etiqueta (ancho mínimo 112 px), sobre el contenido y fuera de la barra inferior/área segura. Color de acción `--c-marca`/`--c-sobre-marca`, sombra flotante existente sólo en claro; en oscuro borde/elevación contenida. Etiqueta accesible «Agendar alumno» y objetivo mínimo 48 px.

## Movimiento y respuesta

- Swipe horizontal para cambiar mes, con el mismo resultado que flechas accesibles. Animar contenido con opacidad + desplazamiento corto (8–12 px), 160–240 ms, easing suave; sin rebote exagerado ni layout continuo.
- Tap en fecha: el resumen/detalle aparece con spring corto y sobrio (transform/opacity, 160–240 ms); el calendario conserva su posición y la selección cambia inmediatamente de forma perceptible.
- En `prefers-reduced-motion` / reducción de movimiento del sistema, transición 0 ms o cambio instantáneo; no exigir swipe como única navegación.
- Foco visible de 2 px para controles y celdas seleccionables; estado presionado por leve cambio de superficie, además de color. No bloquear gestos del lector de pantalla.

## Medidas y tipo

Usar tokens existentes: espacio 4/8/12/16/24 px; radios 8/12/16/20 px; cuerpo 16/24, secundario 14/20, micro 12/16 sólo para apoyo, títulos 20/28 y 28/34. Tipografía System, números tabulares en fechas, botones/objetivos táctiles de 48 px (nunca menor a 44 px). Respetar safe areas y Dynamic Type/fontScale hasta 200 %; permitir scroll vertical y wrap, sin `numberOfLines=1` en nombres/fechas relevantes.

## Límites para implementación

Esta guía no fija reglas nuevas de agenda, orden de negocio, estado de asistencia, cobro, horarios o cupos. Seguir `docs/diseno/ux/agenda.md` y decisiones vigentes; si hay divergencia, elevarla a Ada antes de decidir unilateralmente. Mantener ambos temas y contraste en componentes nativos, sin copiar CSS del prototipo como contrato de React Native. Verificar 320/360/390 px, tema claro/oscuro, escala 200 %, foco, navegación accesible y reduced-motion; una propuesta visual no implica que esas pruebas estén aprobadas.
