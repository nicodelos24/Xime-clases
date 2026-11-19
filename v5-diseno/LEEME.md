# Clases v5 · propuesta visual (para aprobar — no es la app actual)

Encargo de Nico (18/11): rediseño visual total, fiel al ejemplo que ya pasó
(`smart-parrot-84.loca.lt`, hoy en 503: el mismo demo vive en `v4/diseno/`), con
animaciones y transiciones que den dopamina visual sin ser infantil. La app
actual (Hoy, Agenda calendario y Agenda día, chips Mensual/Individual, botón
"Dada" por alumno, barra de 5 pestañas) queda atrás.

## Qué cambia contra la app actual

1. **Dos clases grupales semanales.** No hay clase individual por alumno: desaparecen los chips Mensual/Individual por fila, la marca "dada" alumno por alumno y la leyenda ●/◆. Cada clase es un grupo con su hora, cantidad de alumnos y **un solo botón "Marcar dada" por clase**.
2. **Barra inferior nueva: 4 destinos** — Hoy · Clases (la semana, con sus dos grupos) · Alumnos · Cobros. "Agenda" y "Más" dejan de existir como pestañas; el calendario mensual queda como vista dentro de Clases.
3. **Estética fiel al ejemplo:** misma paleta turquesa + pastel, mismos tokens, mismos tiempos (150/220/320 ms, `cubic-bezier(.22,.9,.36,1.02)`), entrada escalonada hero → KPI → aviso, anillo que se llena, "pop" al elegir día o pestaña, hover que levanta las tarjetas, toast suave. Cero emoji: íconos SVG propios.

## Pantallas (5 vistas)

- **Hoy** — saludo + campana; hero turquesa con fecha, "2 clases grupales por dar", anillo 1/2 y las dos clases del día; 3 KPIs; aviso de mensualidades vencidas.
- **Clases › semana** — tira de 7 días con el día activo en "pop", línea de tiempo con los dos grupos por día (hora, alumnos, botón Marcar dada), FAB "+ Agendar", enlace "Ver mes".
- **Clases › mes** — calendario de noviembre con un solo punto en los días con clase, enlace "Ver semana". Sin leyenda de modalidades.
- **Alumnos** — buscador + lista con avatar, grupo y estado de cobro (punto pastel).
- **Cobros** — KPIs del mes + lista de vencimientos con monto.

## Cómo verlo

- Local: `python3 -m http.server 8797` dentro de esta carpeta → `http://localhost:8797/index.html`
- O en el teléfono por el túnel (reemplaza el túnel caído `ximeclasesv4`): `npx localtunnel --port 8797 --subdomain ximeclasesv5`
- Capturas ya verificadas: `v5-hoy.png`, `v5-semana.png`.

## Estado

- **Nada de esto está escrito en la app.** Es la propuesta que Nico aprueba antes de la reescritura.
- Respaldo de lo anterior: rama `backup/v4-antes-rediseño-20261118` + tag `backup-v4-20261118` (master `5326ac23`), pusheados.
- Verificado en Chrome: las 5 vistas abren, la navegación cambia de vista, "Marcar dada" alterna el estado con su animación, animaciones y transiciones corriendo (9 animaciones activas en el primer paint), contraste AA de los pares de texto medido (mínimo 4.75; el aviso quedó en 5.77 tras quitarle la opacidad).

## Verificado en Chrome (18/11)

- Las 5 vistas abren y la navegación cambia de una a la vez: Hoy · Clases (semana) · Agenda (mes, con «Ver semana») · Alumnos · Cobros. El título de la barra superior sigue a la vista.
- «Marcar dada» alterna el estado por clase (aria-pressed + animación «pop»); el toast y el FAB responden.
- Contraste AA medido con la fórmula WCAG sobre los colores resueltos: mínimo 4.75 (texto secundario sobre fondo) y 5.77 en el aviso ámbar; blanco sobre el extremo claro del hero 4.58; blanco sobre turquesa 5.01; verde 5.3; turquesa 5.75. Todos ≥ 4.5.
- Animaciones y transiciones activas en el primer paint (9 animaciones en cola: entrada escalonada, anillo, aparecer); `prefers-reduced-motion` desactiva todo.

- **Cancelación y deshacer (19/11):** la cancelación abre una sheet con
  motivo obligatorio, tres modos de aviso (masivo / individual / no enviar
  ahora) y mensaje precargado editable; WhatsApp Opción A abre un `wa.me`
  por alumno desde el toast, con "Deshacer" que vuelve la clase a
  Programada. Verificado en Chrome con capturas en `README-funcionamiento.md`.

## Pendiente de Nico

- **Aprobar (o pedir cambios) este diseño.** Recién con su OK empieza la reescritura de la app sobre este modelo: dónde vive cada grupo, cómo se agenda, qué ve en cada pestaña.
