# Mix Pop coral — suave · paleta desaturada de la decisión de Nico

**Ronda 3 (17-nov 19:49, feedback por Mara):** las animaciones, el confeti, el ring y el hero animado **quedan tal cual**; solo cambia la **paleta**, bajada de saturación hacia tonos muted/dusty **sin perder calidez** ni la familia de la Agenda. Fuente: `mix-pop-coral/` (ronda 2, saturada). Verificado en Chrome real a 390px, consola limpia.

## Tabla vieja → nueva

| Uso | Saturada (ronda 2) | Suave (esta) | Dónde |
|---|---|---|---|
| Fondo base | `#FDF5F1` arena | `#FDF5F1` (igual) | fondo general |
| Coral acento | `#F2543D` | `#C96B57` | campana, badge, acento lateral, FAB |
| Coral oscuro (texto/tinta) | `#D63C25` | `#A34B38` | «Dada», nav activo, «Ver semana» |
| Hero gradiente | `#FF7A5C→#F2543D→#C93A6A` | `#B15F4E→#B06049→#A45642` (casi liso) | hero Hoy |
| Violeta (Mensual) | `#5B2E91` / `#8A3FBF` | `#755589` / `#7E5D96` | fila Mensual, KPI, tinta suave |
| Azul (Individual) | `#2B4A78` / `#3A6BB5` | `#5F7195` / `#667697` | fila Individual |
| Teal | `#0E8F7E` | `#6BA193` | KPI cobrado, Dada marcada |
| Ámbar | `#FFB020` / `#F0A202` | `#EBBE7B` / `#E0A75E` | KPI vencen, ring |
| Magenta (manchas) | `#D6336C` | `#C17293` | manchas, confeti |
| Tinta | `#2E1F3D` | `#2E1F3D` (igual) | textos |

Intenciones: terracota en vez de coral fosforoso, violetas/grises lavanda en vez de púrpura eléctrico, verde salvia en vez de esmeralda, ámbar miel en vez de naranja neón. Lo cálido se conserva por la **arena del fondo** y la **temperatura del terracota**, no por saturación.

## Contraste AA medido en vivo (Chrome, 390px)

| Par | Ratio | AA |
|---|---|---|
| Título «Hoy» vs arena | 14.1 | ✓ (4.5+) |
| Blanco vs terracota hero (texto grande) | 4.55 | ✓ |
| Kicker en chip oscuro | 6.9 | ✓ |
| Nombre de fila blanco vs violeta suave | 6.6 | ✓ |
| Hora blanca (sólida) vs violeta/azul suave | 6.6 | ✓ |
| «Dada» `#A34B38` vs blanco | 5.8 | ✓ |
| Tinta `#20302B` vs teal salvia | 4.7 | ✓ |
| Blanco vs violeta KPI | 6.2 | ✓ |
| Marrón vs ámbar miel | 7.1 | ✓ |
| Aviso (texto principal) | 8.7 | ✓ |
| Nav inactivo / activo vs arena | 4.9 / 5.4 | ✓ |

Cambios estructurales respecto de la saturada (para mantener AA con los colores bajados):
- KPI teal: texto en **tinta oscura** `#20302B` en vez de blanco (blanco daba 2.2).
- Chip de modalidad en las filas: fondo **blanco translúcido** en vez de tinta translúcida (la letra quedaba lavanda contra violeta).
- Acento lateral de las filas: **coral sólido** de la mezcla (funciona sobre los dos gradientes pastel).
- Dada marcada: verde salvia con **acento lateral coral** (momento D conservado).
- Confeti en su paleta pastel (`body.confeti-suave`).
- Ring: crema `#FFD59E` con sombra cálida leve (ámbar neón no: apagado).

## Lo que queda igual (pedido de Nico)

Animaciones completas: manchas del hero (onda 7–9 s), micro-barras de KPI, ring que se dibuja y se anima al marcar (240 ms), botón Dada (180/260 ms), rebote del nav, confeti de 700 ms, telón. Duraciones dentro de 150–350 ms para el feedback; el confeti y las manchas son ambiente/festejo, no feedback.
