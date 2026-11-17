# Mezcla Pop coral — qué se tomó de cada propuesta

Dirección única elegida por Nico (17-nov-2026): **mezcla de E «Pop tulipán» + D «Coral claro»**. No es C Neón. Archivo: `v3/diseno/mix-pop-coral/`.

## De E «Pop tulipán»
- Fondo blanco vivo con **manchas orgánicas** fijas (magenta/teal/violeta, `pointer-events:none`).
- **Hero violeta con formas onduladas animadas** (`@keyframes onda`, 7–9 s, alternante).
- **KPIs blancos con micro-barra de progreso** (teal/violeta/ámbar, 78/42/24 %).
- **Agenda con gradiente fuerte por modalidad**: violeta=Mensual, azul=Individual.
- **Confeti** de 700 ms al marcar «Dada» (viene de `hoy.js`).
- Tinta `#2E1F3D` y suave `#8B7FA0`.

## De D «Coral claro»
- **Calidez de arena en la base**: fondo `#FDF5F1` (clarísimo, con blanco de fondo — nunca gris).
- **Hero coral con burbujas** (`#FF7A5C → #F2543D → #C93A6A`).
- **KPIs de color sólido** (teal / violeta / ámbar festivo `#FFB020`).
- **Acento lateral** en las filas de agenda (barra 4 px).
- **Botón «Dada» coral → verde al marcar** (el momento de dopamina).

## Decisiones propias de la mezcla
- El **ring es ámbar** (de E) pero sobre el **hero coral** (de D): el progreso cálido pide "completame" y no compite con el coral.
- Hero: burbujas de D **+** una forma orgánica de E, animada.
- Acento lateral blanco translúcido para que funcione sobre los dos gradientes.
- Nav activo en **coral** (D), con el `+` coral de D.
- Campana coral (D), manchas y sombras violetas (E).

## Reglas respetadas
Familia Agenda (violeta=Mensual, azul=Individual, con su punto/rombo) · animaciones 150–350 ms · `prefers-reduced-motion` · íconos SVG propios (`icons.js`, cero emoji) · contraste AA · pantalla Hoy a 390 px · sin index comparador.
