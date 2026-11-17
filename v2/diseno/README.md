# v2 · Fase 1 — Dirección visual: 2 propuestas

Pantallas **Hoy** y **Alumnos** en dos estilos, con datos ficticios y animaciones reales. Las dos conservan la familia de la Agenda: fondo lila claro, violeta = Mensual (●), azul = Individual (◆), tarjetas redondeadas y etiquetas tipo píldora.

## Cómo verlas
Desde esta carpeta: `python3 -m http.server 8790` y abrir
- A · Aurora: http://localhost:8790/propuesta-a-aurora/index.html
- B · Pop: http://localhost:8790/propuesta-b-pop/index.html

(en celular o ventana angosta ocupa toda la pantalla; en escritorio se ve dentro de un marco de teléfono). Probar: marcar «Dada», tocar «Cobrado hoy», el «+» de un alumno (festejo), filtros y buscador, y cambiar entre Hoy y Alumnos. Capturas en `capturas/`.

## Las dos propuestas

| | **A · Aurora** | **B · Pop** |
|---|---|---|
| Idea | La Agenda, pero con vida. Calmada y elegante | Más color y energía. Cada sección con su color |
| Color fuerte | Un solo bloque por pantalla (hero violeta degradé) | Bloques sólidos: hero ámbar, resumen verde/azul/rojo |
| Tarjetas | Blancas o teñidas con borde de color a la izquierda (como las de la Agenda semanal) | Blancas con borde fino; el color está en hora, avatar y chips |
| Avatares | Tintes suaves (lila, celeste, verde, ámbar, rosa) | Llenos y saturados |
| Navegación | Píldora lila detrás del ícono activo | Cápsula con el color de cada sección (Hoy ámbar, Alumnos coral, Agenda violeta, Cobros verde, Más azul) |
| Íconos | Línea con relleno suave | Línea con relleno más marcado |
| Se parece a la Agenda | Mucho | Bastante; es más vistosa |
| Riesgo | Que le parezca poco «dopamina» | Que a la larga canse o se vea «infantil» con mucho dato |

## Sistema compartido
- **Colores con significado** (`tokens.css`): violeta Mensual, azul Individual, verde Al día, ámbar Vence pronto, magenta Debe clases, rojo Vencida. Cada uno con 3 tonos (fuerte, suave y texto) para contraste AA.
- **Íconos propios** (`icons.js`): 17 en SVG, los de navegación y los de estado.
- **Estados siempre con ícono + texto + color**, objetivos táctiles ≥ 44 px, foco visible, movimiento reducido soportado (verificado).
- **Animación:** ver [`GUIA-ANIMACION.md`](GUIA-ANIMACION.md).

## Notas
- Son prototipos HTML de dirección visual, no el producto; no se reutiliza el código en la app (ver PLAN §4).
- El contraste se eligió con tonos AA pero no se midió con herramienta; la ficha, Cobros y Más quedan para la fase 3.
- Verificado en Chrome real a 460×900: sin errores de JS, las dos propuestas en Hoy y Alumnos (lista, filtro y vacío), festejo y movimiento reducido.
- Se puede mezclar: p. ej. la navegación de B con las tarjetas de A.
