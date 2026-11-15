# ENC-10 · QA independiente de demo ENC-08R

**Fecha:** 2026-11-15, 06:21 America/Montevideo
**Dictamen:** **APPROVED** — para el candidato local de demo/diseño identificado abajo. No es aprobación para publicar, para producción ni para iniciar implementación.

## Candidato y entorno

- Rama `master`, HEAD y base declarada: `4388754bfd4591a1f576a003f2f3955d330a3d3a`; cambios de demo sin commit.
- Manifiesto `docs/diseno/ux/prototipo/evidencia/manifest-enc08r.json`: SHA-256 `25997a8c17521413da9441b09643c89355e9936bbbec579a55ddd41440d5db27`; **43 entradas, 0 ausentes, 0 hashes/tamaños divergentes**. Verificación propia con `sha256sum` y Python leyendo cada ruta, tamaño y SHA-256.
- Demo servida por HTTP local `http://127.0.0.1:8783/ux/prototipo/index.html`, servidor `python3 -m http.server 8783 --bind 127.0.0.1 --directory docs/diseno`; Chrome MCP Kaia real, pestaña/contexto aislado `gino-enc10`. Datos ficticios; sin app/BD/backend.
- No edité el prototipo, el manifiesto ni evidencia histórica. No commit, push ni publicación.

## Pruebas ejecutadas

Callbacks de la entrega ejecutados en Chrome MCP Kaia, desde la pestaña propia del proyecto:

| Callback | Resultado | Alcance observado |
|---|---:|---|
| `docs/diseno/ux/prototipo/prueba-agenda.js` | **PASS 86/86** | Agenda, programación/alumnos, anti-duplicado, reingreso, ausencia de efectos financieros, límites de pantalla/errores, rutas y matriz responsive. `errores=[]`, `advertencias=[]`, `fallosHTTP=[]`, `externas=[]`; 40 peticiones registradas por el callback. |
| `docs/diseno/ux/prototipo/prueba-navegacion.js` | **PASS 28/28** | Regresión ENC-06 simulada, registro/doble toque de pago en memoria, estados, deuda, vencimiento, Q2/Q3 solo informativos, WhatsApp editable sin envío y layouts. `errores=[]`. |
| `docs/diseno/ux/prototipo/prueba-accesibilidad.js` | **PASS 18/18** en el reintento | Contrastes focales, objetivos táctiles, texto ampliado, SVG, barra fija, fecha inválida y hash malformado. Mínimo de los pares de contraste: 6,39:1; reduced-motion desactiva animación. |

**Carrera de harness, no defecto reproducible:** el primer intento de accesibilidad se detuvo en AA-07 («hash mal codificado no rompe JS»). El callback lee el `h1` inmediatamente después del click de retorno, sin esperar el render. Reproduje el hash malformado: el fallback «No encontramos esa pantalla» se renderizó y el botón «Volver a Hoy» retornó a `#hoy`/`Hoy` al asentarse el cambio; el callback completo pasó 18/18 en el segundo intento. No observé error JS asociado. Registré el primer intento, no lo oculto.

Comprobaciones adicionales:

- `git diff --check`: sin salida/error.
- `browser_console_messages` tras la ejecución: **0 errores, 0 warnings**.
- `browser_network_requests` (sesión completa): solicitudes observadas a `127.0.0.1:8783`, todas con respuesta **200**; sin 404 ni origen externo.
- Recorridos manuales propios (además de los callbacks): reintenté agendar a Rosa en la misma ocurrencia del 15/11 ya reservada; mensaje «Este alumno ya está agendado en ese horario. No se duplicó». Agendé a Lucía, modalidad individual, para el 15/11; el día pasó a tres programados y la confirmación explícitamente indicó que no hubo clase realizada, deuda ni pago. Retiré la reserva: la ficha siguió disponible en Alumnos (cinco fichas), pude abrirla y volver a programarla.
- Para mensual, agendé a Ana en una fecha sin clase configurada (09/11, 17:00, hora explícita). La Agenda mostró una reserva —no asistencia— y el mensaje de no cobro/deuda/inicio. Retiré esa programación; la ocurrencia quedó con 0 alumnos y Alumnos conservó las cinco fichas. Volví a abrir la ficha de Ana. No ejecuté una acción económica.
- Filtré por mensual/individual y varié independientemente los órdenes «Mensuales primero» y «Por clase individual primero». En Todos, el orden cambió a `[Inés, Ana, Rosa, Marcos, Lucía]` y `[Lucía, Inés, Ana, Rosa, Marcos]`; con filtros de modalidad se mantuvo solo la modalidad seleccionada.
- Recorrí los cinco destinos Hoy, Alumnos, Agenda, Cobros y Más a 320, 360 y 390 px, tema claro y oscuro: rutas/títulos correctos y `document.documentElement.scrollWidth <= innerWidth` en las 30 combinaciones. El callback de Agenda también comprobó 36 combinaciones de vistas, anchos y temas sin overflow. Reduced-motion fue activado y verificado (animación `none`, transición `0s`).
- Copia del prototipo explicita en UI: «DEMO · DATOS FICTICIOS», «Sin guardado real. Recargar reinicia la demo» y límites de los datos. La prueba de WhatsApp verificó «Apertura simulada, no envío»; no hubo solicitudes externas.

## Evidencia visual propia

Capturas viewport de la pestaña MCP Kaia, guardadas en `docs/qa/enc10/` y comprobadas por sus dimensiones/colores de tema:

- `agenda-320-light.png`, `agenda-320-dark.png`
- `agenda-360-light.png`, `agenda-360-dark.png`
- `agenda-390-light.png`, `agenda-390-dark.png`

Descarté duplicados/parciales con tema/etiqueta incorrectos; las seis capturas listadas corresponden al ancho y tema de su nombre. No representan hardware físico ni equivalen a capturas de una publicación web.

## Límites y hallazgos

No observé defecto funcional bloqueante ni opcional dentro del alcance de demo revisado. Q2/Q3 no se ejecutaron como cambios: sus pruebas solo inspeccionan mensajes informativos. La demo no comprueba BD, persistencia durable, permisos/aislamiento multi-tenant, lógica financiera productiva, WhatsApp real, teléfono físico, lector de pantalla, publicación ni validación con usuaria. El sistema anuncia que recargar reinicia; no hay persistencia real. Los importes y personas son ficticios.

`APPROVED` se limita al candidato local ENC-08R y sus recorridos visibles/sintéticos comprobados. Ada decide integración/publicación y la puerta siguiente; este informe no inicia a Reina ni declara producción.
