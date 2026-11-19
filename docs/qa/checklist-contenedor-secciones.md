# Checklist de QA — contenedor de secciones (v5)

> Revisado por Gino (QA) · 19/11/2026 · candidato `fc7730bd` sobre `839bcf4b`, rama `feat/v5-contenedor-secciones`.
> Veredicto: **APPROVED**. Sin publicar, sin push.
>
> Adaptación importante: la variante A **descarta la hoja fija con scroll interno** aprobada en f6cbeaef/1d90a8d9.
> Ahora `.cel` es un envoltario invisible (`position: relative`, `min-height: 100vh`, sin fondo/borde/sombra,
> sin `backdrop-filter`/`transform`/`filter`/`contain`) y el scroll es **normal de página** (`document.scrollingElement === HTML`).
> Por eso los ítems que antes hablaban de `.cel { overflow-y: auto }`, franja mint hoja–nav y radio compartido
> hoja/nav se reformulan para el modelo "tarjetas independientes sobre fondo crema parejo".

## 0. Precondiciones

- [x] SHA exacto registrado (`fc7730bd`), rama `feat/v5-contenedor-secciones`, `git status` limpio al empezar.
- [x] Delta revisado: solo CSS (`v5-diseno/tokens.css`, `v5-diseno/propuesta.css`) + copia `docs/` sincronizada + capturas. Sin cambios en `propuesta.ts` ni en la lógica.
- [x] Servido con `serve.mjs` propio en puerto **8801** (libre); 8797 pertenece a otro agente, no tocado. Nunca `python http.server`.
- [x] Sin edición de código fuente, sin publicar, sin push. Datos de alumnos sintéticos.
- [x] Capturas de `kaia_chrome_xime` solo en `/home/nico/.cache/kaia-mcp-output-Xime-clases`, copiadas a `docs/qa/contenedor-secciones/gino-A-crema-*.png`. Chrome soltado al terminar.

## 1. Fondo crema parejo, sin degradado mint

- [x] `getComputedStyle(html).backgroundColor` y `body` = `rgb(247, 244, 237)` (#F7F4ED); `backgroundImage` = `none` en ambos. Token `--bg-crema: #F7F4ED`.
- [x] Sin franja mint en ningún scroll (390x844 y 320x780, tope y fondo): el canvas pinta crema en todo el viewport.

## 2. Tarjetas independientes, sin hoja envolvente

- [x] `.cel`: `background: rgba(0,0,0,0)`, `border: 0`, `border-radius: 0`, `box-shadow: none`, `position: relative`, `min-height: 100vh`, `overflow: visible`. Sin hoja visible.
- [x] Sin contexto de contención en `.cel`: `backdrop-filter: none`, `transform: none`, `filter: none`, `contain: none` → el `position: fixed` de la nav y del toast no se rompe.
- [x] Cada bloque lleva su marco: borde `rgb(228,220,203)` (#E4DCCB) y sombra `0 4px 14px rgba(84,70,40,.12)` (token `--sombra-crema`). Verificado en `.hero`, `.kpi`, `.tira-dia`, `.clase`, `.buscador`, `.lista-alumnos li`, `.lista-cobros li`. (`.aviso` mantiene su borde ámbar propio + sombra crema; `.campana` su sombra turquesa original — excepciones deliberadas, no regresión.)
- [x] Nav cápsula con fondo sólido `#FFFFFF` y `backdrop-filter: none` (se quitó el blur que creaba contexto).

## 3. Scroll normal de página + nav fixed

- [x] `document.scrollingElement === HTML`; `html.scrollTop` crece al scrollear (65px en Hoy, tope→fondo) y `.cel.scrollTop === 0`. `main.vistas` con `overflow-y: visible`, `transform: none`, `contain: none` → un solo scroll, sin cortes.
- [x] Nav `position: fixed`, `bottom: 14px`, `z-index: 30`; `getBoundingClientRect()` idéntico antes/después del scroll (`top: 756` en 390, `top: 692` en 320).
- [x] Sin desborde horizontal: `html.scrollWidth - html.clientWidth === 0` en 390 y 320.
- [x] Scrollbar oculto (`scrollbar-width: none` + `::-webkit-scrollbar` a 0).

## 4. Última tarjeta libre sobre la cápsula (320 con safe-area)

- [x] `.cel` con `padding-bottom: calc(96px + env(safe-area-inset-bottom))` → 96px en el emulador (safe-area 0).
- [x] En 320x780 scrolleado al fondo, el último bloque (aviso de vencidas) termina en y≈552 y la cápsula arranca en y≈692: **140px de holgura**, ningún contenido tapado.

## 5. Toast visible

- [x] Campana → `toast.ver`, texto «3 avisos · 2 mensualidades vencen hoy», `opacity` anima 0→1 (150/220ms), `role=status`, `aria-live=polite`.
- [x] Posición estable y sobre la nav: `toast.bottom=688` < `nav.top=692` en 320. No recortado por `.cel` (overflow visible). z-index toast 20 < nav 30 < sheet 40.
- [x] Cancelación → toast con «Deshacer» y WhatsApp pendientes (abajo). Reutilizable, sin quedar tapado.

## 6. Contraste AA / tokens / animación / emoji (regresión)

- [x] Sin colores nuevos de texto: los tokens de `tokens.css` quedan intactos; solo se agregan `--bg-crema`, `--borde-crema`, `--sombra-crema` (fondo/borde/sombra, decorativos).
- [x] Tokens de animación intactos: `--t-rapida 150ms`, `--t-media 220ms`, `--t-larga 320ms`, `--ease cubic-bezier(.22,.9,.36,1.02)`.
- [x] Cero emoji: escaneo de nodos de texto por encima de U+FFFF en el DOM renderizado → 0 coincidencias; íconos siguen siendo `<svg class="ico">`.
- [x] `--tq-500` sigue siendo decoración, no texto (sin cambios).

## 7. Las 5 vistas

- [x] Hoy: saludo + campana, hero con anillo (0/1), 3 KPIs, aviso de vencidas.
- [x] Clases/Semana: tira de 7 días, tarjeta de clase con «Cancelar clase», FAB «Agendar», enlace «Ver mes».
- [x] Mes: `v-mes`, noviembre 2026, «Ver semana»; se alcanza desde Clases, tab activo sigue siendo «Clases».
- [x] Alumnos: buscador + lista con avatar/grupo/punto de cobro (6 filas).
- [x] Cobros: KPIs + lista de vencimientos.
- [x] Navegación: las 4 tabs (Hoy/Clases/Alumnos/Cobros) sincronizan `location.hash`, `.vista.activa`, título de la barra y `aria-current="page"`. Enlaces «Ver mes»/«Ver semana» funcionan.

## 8. Funcionamiento v5 (regresión)

- [x] `npm run typecheck` → **0 errores** (tras `npm install` en el worktree; `tsc` no estaba instalado).
- [x] `npm test` → **43 tests, 0 fallos** (reloj simulado; reloj real no tocado).
- [x] Auto-marcado: corre en `reconciliar(datosDemo(), reloj.ahora())` al cargar; lógica cubierta por los tests (lun→mié dada, jue en adelante programada, toast «Se marcaron clases dadas por la hora»). Sin cambios en esta rama.
- [x] Cancelar clase: sheet «Cancelar Grupo Jueves» con motivo opcional, 3 modos, mensaje editable; confirmar → cancelada + WhatsApp.
- [x] WhatsApp Opción A (masivo): toast «WhatsApp listo para los 7 alumnos de Grupo Jueves · quedan 6 para abrir · Deshacer», `dataset.pendientes` con **6 links `https://wa.me/...` codificados**; apertura manual (una pestaña por alumno), nunca automática. Modo «No enviar ahora» disponible en la sheet.
- [x] Deshacer: 3 clics seguidos → clase revertida a «Por dar», `dataset.deshacer`/`pendientes` limpios, **0 errores de consola**.
- [x] Consola del navegador en todo el recorrido: **0 errores, 0 warnings**.

## 9. Entrega del informe

- [x] Dictamen **APPROVED** con SHA, viewport, comandos y resultados.
- [x] Sin defectos bloqueantes ni observaciones que11 requieran cambios.
- [x] Capturas adjuntas: `gino-A-crema-hoy-390.png`, `gino-A-crema-hoy-320-scrolled.png`, `gino-A-crema-clases-320.png`, `gino-A-crema-sheet-320.png`.
- [x] Roma avisado por chat APX; Chrome soltado (pestaña en about:blank).

## Puntos críticos — resultado

1. Franja mint: **no reaparece** (fondo crema parejo en html y body).
2. Contexto de contención: **ninguno** en `.cel`/`main.vistas`; nav y toast siguen fixed/estables.
3. Reserva de altura de nav: **96px + safe-area**; última tarjeta libre en 320.
4. z-index: sheet 40 > nav 30 > toast 20; sheet tapa la nav, toast queda sobre el contenido.
5. Regresión funcional: auto-marcado, Cancelar/Deshacer y WhatsApp pendientes **pasan**; 0 errores de consola.
