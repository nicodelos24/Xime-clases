# Guía de animación — Clases v2

Vale para las dos propuestas. Los valores están como tokens en `tokens.css` (`--d-fast`, `--d-base`, `--d-slow`, `--ease-out`, `--ease-spring`) y se portan tal cual a Reanimated/Moti.

## Reglas
1. **Duración 150–350 ms.** Única excepción: el anillo de progreso al abrir Hoy (900 ms, una sola vez) y el festejo (700 ms).
2. **Solo `transform` y `opacity`** (más `stroke-dashoffset` del anillo). Nada que mueva el layout.
3. **Una cosa se mueve a la vez por zona.** Si entra una lista, el resto está quieto.
4. **Sin bucles que distraigan.** Únicos permitidos: el punto de color del título (B) y el círculo del hero (A); son lentos (2,4–6 s), sutiles y están en el fondo.
5. **Movimiento reducido:** con `prefers-reduced-motion` (en RN: `AccessibilityInfo.isReduceMotionEnabled`) todo pasa a ~0 ms, los números aparecen directos y no hay festejo. La información nunca depende de la animación.
6. **Ícono + texto + color** siempre: la animación refuerza, no informa.

## Catálogo

| Dónde | Qué pasa | Duración | Curva |
|---|---|---|---|
| Tocar cualquier tarjeta, fila o botón | Escala a 0,96–0,98 mientras está apretado | 150 ms | ease-out |
| Entrada de pantalla | Cabecera → hero → resumen entran con fade + subida de 14 px, escalonados 60 ms | 350 ms | ease-out |
| Filas de lista | Fade + subida 14 px, escalonadas 55 ms por fila (máx. 8 filas; el resto entra junto) | 350 ms | ease-out |
| Anillo «Clases de hoy» | Se dibuja desde 0 hasta el avance real; al marcar una clase se reajusta | 900 ms (1ª vez) / 350 ms | ease-out |
| Números de «Resumen» | Cuenta de 0 al valor | 650 ms | ease-out cúbica |
| Botón «Dada» | La caja se agranda 1,1, se pinta de verde y el tilde se «dibuja» | 240 ms | spring suave |
| Pestaña activa (nav) | A: píldora lila crece detrás del ícono · B: cápsula de color de la sección sube 2 px. Ícono con rebote leve | 240 ms | spring suave |
| Filtros de Alumnos | El chip activo cambia de color; la lista se rearma con la entrada escalonada | 240 ms | ease-out |
| Estado vacío | Fade + subida | 350 ms | ease-out |
| Toast | Fade + subida 16 px; dura 1,9 s | 240 ms | ease-out |
| **Festejo** (clase dada, pago registrado) | 16 partículas de colores salen y caen | 700 ms | ease-out |

## Qué NO se anima
- Textos de estado (Vencida, Al día…): cambian sin transición, para leerse al instante.
- Scroll: sin parallax ni efectos atados al scroll.
- Errores: sin sacudones. Solo color + ícono + texto.
- Mes ⇄ Semana de la Agenda: se define en la fase 3 sin tocar el diseño aprobado (sugerencia: la tira de 7 días se estira con `transform`, 300 ms).

## Para implementar (fase 4)
- Reanimated: `withTiming(…, {duration, easing: Easing.bezier(.22,1,.36,1)})`; el spring suave ≈ `withSpring({damping:14, stiffness:220})`.
- Entradas escalonadas con Moti: `from={{opacity:0, translateY:14}} animate={{opacity:1, translateY:0}} transition={{type:'timing', duration:350, delay:i*55+80}}`.
- Festejo: Lottie ligero (≤30 KB) o partículas con Reanimated; apagado con movimiento reducido.
