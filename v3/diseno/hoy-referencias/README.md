# v3 · hoy-referencias — Fase 1 (reinicio)

Pantalla **Hoy** rehecha desde las **3 capturas de Nico** (17/11): `../referencias/hoy-inicio.png` (a-hoy.png de la v2, la que marcó como «algo así»), `../referencias/agenda-mes.png` y `../referencias/agenda-semana.png` (el diseño de Agenda que quiere conservar). Nada heredado de `mix-pop-coral-suave` ni de Aurora: HTML/CSS/JS escritos desde las capturas.

## Tres direcciones, un mismo mapa

Las tres comparten el **mapa de la captura**: saludo + campana con badge · hero de color con ring «2/3 dadas» · 3 tarjetas (Cobrado hoy / Por cobrar / Vencen) · «Agenda de hoy» con filas (hora · avatar · nombre · chip modalidad · botón «Dada») · aviso ámbar de mensualidades que vencen · nav de 5 ítems. Familia de Agenda conservada: **violeta = Mensual, azul = Individual** (con su punto/rombo en los chips).

| Carpeta | Dirección | Qué la distingue |
|---|---|---|
| `violeta-arena/` | **A · Violeta arena** — fiel a la captura | hero violeta con formas animadas, KPIs blancos con borde de color, filas pastel con barra lateral, fondo de arena cálida con manchas |
| `tulipan-vivo/` | **B · Tulipán vivo** — el mismo mapa, más color | hero tulipán, KPIs en bloque de color, pétalos gigantes tenues en el fondo |
| `litio-suave/` | **C · Litio suave** — base blanca, vida en el toque | hero blanco con borde litio, KPIs de color, auras tenues; el momento fuerte es el botón «Dada» |

`index.html` compara las tres en iframe y muestra las capturas de referencia al pie.

## Animaciones (sobrias, 150–350 ms, dopamina en el toque)

- **Entrada escalonada** al cargar: hero → KPIs (70/140 ms) → filas (70/140 ms) → aviso (210 ms), con telón y spinner de 320 ms.
- **Ring dibujado** al entrar (900 ms, una vez) y que se actualiza al marcar «Dada» (240 ms, `cubic-bezier(.22,1,.36,1)`).
- **«Dada»**: pop con rebote (240 ms spring) + **confeti breve** de 16 partículas (700 ms, solo transform/opacity, paleta de la propuesta).
- **Formas orgánicas** del hero y manchas del fondo: 7–16 s, alternantes, decorativas (`pointer-events:none`).
- **Nav**: ícono con rebote al activar (240 ms), hover/active con escala.
- Todo respeta `prefers-reduced-motion: reduce` (sin animación, ring a 2/3, sin confeti, todo visible).

Íconos: SVG propios en `base/icons.js` — **cero emoji** (regla de Nico).

## Contraste AA (medido, WCAG 2.x relativa)

| Par | Ratio |
|---|---|
| A · texto blanco sobre hero violeta (#8B4FC7→#5B2E91) | ≥ 4.9 |
| A · `--morado` #5B2E91 sobre fondo #FBF4F7 (nav activo, «Ver semana») | 8.9 |
| A · `--suave` #6F6478 sobre fondo (saludo, horas) | 5.1 |
| A · tinta #241A2B sobre fondo (títulos, valores) | 13.5 |
| B · blanco sobre tulipán #E8506E (kicker/línea/título) | ≥ 4.6 |
| B · blanco sobre teal #0E9488 y violeta #7C3AAE (KPIs, Dada) | 4.6 / 6.3 |
| B · #3D2200 sobre ámbar #F2A413 (KPI vencen) | 6.5 |
| B · `--suave` #8A5A72 sobre #FEF3EE | 5.0 |
| C · blanco sobre teal #0E9488 / litio #6444C9 (KPIs, Dada) | 4.6 / 5.3 |
| C · `--suave` #7A7382 sobre blanco | 5.3 |
| Avisos ámbar (todas) | b 8.7 · small 5.7 · ícono 5.3 |

Los badges de la campana y los chips de modalidad son texto blanco sobre color con ≥ 4.5. Nada queda por debajo de AA; la excepción 3:1 no se usa en texto.

## Verificado en Chrome real (localhost:8792)

- Consola limpia: 0 errores, 0 warnings.
- Tocar «Dada» (propuesta con 3 clases, 2 marcadas): marca → pop + confeti de 16 partículas en la paleta de la propuesta, ring 2/3 → 3/3, `aria-pressed` correcto; desmarcar vuelve a 2/3.
- `prefers-reduced-motion: reduce`: sin telón ni confeti, ring a 2/3 sin animación, todo visible.
- Viewport 390 px móvil; capturas en `capturas/`.
