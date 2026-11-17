# v3 · Mix Pop coral · versión «suave» (paleta pastel/desaturada)

Carpeta gemela de `../mix-pop-coral/` (commit f208e88): **mismos mockups, mismas animaciones, misma estructura** — cambia solo la paleta, pedida por Nico («me gusta cómo está animado todo pero hay colores muy saturados»).

Qué se mantuvo intacto: manchas orgánicas animadas, hero con burbujas y forma de E animada (`onda`), ring con `dibujo`, micro-barras de KPIs, acento lateral, botón «Dada» coral→verde con festejo confeti (700 ms, 16 partículas, de `../hoy.js`), ring que actualiza al marcar, `prefers-reduced-motion`, 150–350 ms, cero emoji, familia Agenda violeta=Mensual / azul=Individual.

## Paleta vieja → nueva (todos los sólidos fuertes desaturados, sin neón)

| Uso | Antes | Ahora | Ratio AA |
|---|---|---|---|
| Coral (acento/nav+/campana/badge) | `#F2543D` | `#C96B57` | badge `#2E140F` sobre coral 4.68 · ícono 44px sobre blanco 3.67 (≥3 gráfico) |
| Hero (gradiente) | `#FF7A5C → #F2543D → #C93A6A` | `#B15F4E → #B06049 → #A45642` (casi liso) | blanco sobre todas las zonas con texto ≥4.55 |
| Kicker chip (rgba) | `rgba(110,20,6,.38)` | `rgba(88,38,28,.42)` | blanco 6.4 |
| Hero línea / chip «próx» | `#FFE3DB` / `rgba(255,255,255,.16)` | `#FDF4F1` / `rgba(58,26,19,.20)` | 4.55 / 6.2 |
| Ring valor (ámbar) | `#FFC53D` + glow | `#FFD59E` + contorno 1px | 3.7 (gráfico ≥3) · small blanco 5.1 |
| KPI cobrado (teal) | `#0E8F7E` texto blanco | `#6BA193` texto `#20302B` | 4.70 |
| KPI por cobrar (violeta) | `#5B2E91` texto blanco | `#7E5D96` texto blanco | 5.39 |
| KPI vencen (ámbar) | `#FFB020` texto `#4D2E00` | `#EBBE7B` texto `#4D2E00` | 7.14 |
| Fila Mensual | `#8A3FBF → #5B2E91` | `#7E5D96 → #70508A` | blanco ≥5.39 en todo el gradiente |
| Fila Individual | `#3A6BB5 → #2B4A78` | `#667697 → #5F7195` | blanco ≥4.56 en todo el gradiente |
| Chip modalidad | `rgba(255,255,255,.16)` | `rgba(46,31,61,.16)` (tinta, no blanco) | blanco ≥6.37 |
| «Dada» normal | `#D63C25` sobre blanco | `#A34B38` sobre blanco | 5.80 |
| «Dada» marcada | `#0E8F7E` texto blanco | `#6BA193` texto `#20302B` | 4.70 |
| Nav activo | `#F2543D` | `#A34B38` (coral-oscuro) | 5.42 |
| Nav inactivo | `#B99C90` | `#7E685B` | 4.89 |
| Saludo | `#8B7FA0` | `#786A8C` | 4.60 |
| «Ver semana» | `#F2543D` | `#A34B38` | 5.39 |
| Aviso ámbar | fondo `#FFF3D6` borde `#FFD98E` | fondo `#F9EEDD` borde `#EDD6AC` | b 8.72 · small 5.77 · ícono/flecha `#8A560F` 5.35 |
| Manchas (rgba) | magenta/teal/violeta .12–.14 | mismos tonos pastel `#C17293/#6BA193/#84639E` .11–.12 | decorativo |
| Confeti | `#7C3AED/#F2543D/#0E8F7E/#F0A202/#D6336C/#2B4A78` | pastel de la misma paleta (en `../hoy.js`, solo activo con `body.confeti-suave`) | decorativo |

Lo que tomé de D: base de arena cálida (nada gris), hero coral (ahora desaturado), «Dada» coral→verde, acento lateral (en blanco translúcido, porque coral pastel sobre violeta pastel no se leía). Lo que tomé de E: manchas, ondas, micro-barras, familia de agenda, confeti. Los degradados fuertes se aplanaron (dos paradas cercanas) porque un degradado saturado de 3 paradas es lo que más «grita».

## Cómo se midió

Ratios calculados (WCAG 2.x relativa) en dos pasadas: pares estáticos por hex, y pares sobre el gradiente del hero muestreados con canvas 2d en Chrome real (el gradiente pinta colores distintos en kicker/título/ring; se midió cada zona). La letra chica del ring va en blanco con sombra suave (4.12 sin sombra no alcanzaba en la esquina clara). Ningún par de texto queda abajo de 4.5 (ningún texto usa la excepción 3:1; la excepción se aplica solo al trazo del ring y al ícono de campana, gráficos de 44px o guía).

## Verificación en Chrome real (17-nov, localhost:8792)

- Consola limpia: 0 errores, 0 warnings (las entradas viejas del log son de sesiones previas de otros túneles).
- Interacción: marcar «Dada» actualiza el ring 2/3→n, tira confeti de 16 partículas en paleta suave (no saturada), `aria-pressed` correcto; desmarcar vuelve.
- `prefers-reduced-motion: reduce`: ring arranca en 31.8 (2/3) sin animación, no se genera confeti.
- Viewport 390px móvil; capturas en `suave-hoy.png` (inicial), `suave-dada-marcada.png`, `suave-confeti.png`, `suave-todo.png` (página completa).

Nota: `../hoy.js` ahora elige la paleta del confeti según `body.confeti-suave`; las otras propuestas (C, D, E, mix) no llevan la clase y siguen con la suya.
