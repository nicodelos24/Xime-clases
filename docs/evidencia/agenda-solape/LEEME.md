# Agenda: flecha «>» pisaba «Ver semana» (23-nov-2026)

Pedido de Nico vía Roma: en la Agenda, la flecha derecha del mes y el botón
«Ver semana» se pisan ~11 px (393 px, en claro y oscuro).

## Qué se hizo
Solo el encabezado del mes, sin tocar nada más del diseño v5:
- La fila del título del mes ahora guarda un espacio reservado para el link.
- Las flechas del mes bajan de 44 a 38 px (siguen cómodas para el dedo) y
  se centran mejor con el título.

## Verificación (393 px, captura en cada tema)
- Antes: solape 11,3 px (flecha termina en x=262, «Ver semana» arranca en 250,8).
- Después: solape 0 px en claro y oscuro, «Ver semana» sin recorte de texto y
  las flechas alineadas en la misma fila.

Capturas: antes-393-claro/oscuro.png, despues-393-claro/oscuro.png
(+ antes/después medidos en claro y oscuro con el Chrome del proyecto).

No publicado: queda para cuando Nico lo vea (salvaguarda de cambios visuales).
