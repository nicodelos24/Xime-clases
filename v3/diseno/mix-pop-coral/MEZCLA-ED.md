# Mezcla D + E — «Pop coral» · aplicada a Hoy (390px)

**Fecha:** 2026-11-17 · **Autor:** Vito (diseño visual)
**Carpeta:** `v3/diseno/mix-pop-coral/` (nueva; no pisa `propuesta-c-*`, `propuesta-d-coral/` ni `propuesta-e-pop/`)
**Pantalla:** Hoy, 390px. Link público: https://ximeclasesv2.loca.lt/mix-pop-coral/index.html

Decisión de Nico (17-nov): **mezclar** D «Coral claro» + E «Pop tulipán» en una sola dirección. Esta es esa mezcla.

## Qué tomé de cada una

**De D «Coral claro»** — la calidez como base de todo:
- **Arena en el fondo general** (`#FDF5F1`): nada gris; el blanco solo en superficies.
- **Coral como acento de acción**: badge de campana, enlace «Ver semana», botón «Dada», FAB «+».
- **KPIs de color sólido festivo** (teal / violeta / ámbar) con iconitos en chip blanco translúcido.
- **Botón «Dada» coral que pasa a verde al marcar** — el mejor momento de D, intacto.
- **Hero coral con burbujas** suaves en las esquinas.

**De E «Pop tulipán»** — la energía y el movimiento:
- **Manchas orgánicas coloridas** flotando en el fondo (magenta/teal/violeta, muy suaves).
- **Manchas animadas dentro del hero** (formas blob girando lento) encima de las burbujas.
- **Hero de color vivo con contenido flotando**: chip de fecha, título, próxima clase y ring.
- **Micro-barras de progreso** en cada KPI (se dibujan al cargar).
- **Gradiente fuerte por modalidad en la agenda**: violeta=Mensual, azul=Individual (familia, AA en texto blanco).
- **Confeti al marcar** una clase como dada.

## La mezcla en una frase

La calidez y el coral de D cargan los colores y las acciones; el pop y el movimiento de E ponen la energía en el hero y el festejo.

## Requisitos del encargo

- Animaciones entre **150 y 350 ms** en la interacción (var `--d-fast` 180ms / `--d-base` 260ms / `--d-slow` 320ms). Las manchas del hero giran lento (7–9 s) como ambiente, no como feedback.
- **Cero emojis**: íconos SVG propios (sprite `icons.js`, trazos de 2px + duotono sutil).
- **Contraste AA verificado en vivo**: título de fila 9.4:1 · título app 14.1:1 · aviso 7.3:1 · kicker en chip 4.9:1 · «Dada» 4.6:1 · marrón/ámbar KPI 6.7:1 · hora 4.6:1. Texto grande blanco/coral 3.4:1 (AA large ✓).
- **Familia de la Agenda** respetada: violeta=Mensual, azul=Individual.
- Referencias de `v2/referencias/` usadas como criterio (papelitos, tulipán).

## Nota técnica compartida

Aproveché y arreglé el sprite `icons.js` (compartido con D/E): 14 símbolos que perdían el `<` inicial del primer elemento interior (la campana salía sin su campana, la flecha y el check no se pintaban). También `fill="none"` en los íconos de solo trazo y el duotono fijo blanco translúcido. D y E heredan la mejora.
