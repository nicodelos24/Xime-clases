# Evidencia visual · 9 cambios v5 (22/11/2026)

Capturas en celular (390×844) del prototipo v5 servido desde el worktree
`feat/v5-popups-scroll` con `npm run serve` (puerto 8803). Verificadas en Chrome
con `kaia_chrome_xime`. Se usó una siembra temporal en `localStorage` para que
las 8 clases de la demo cayeran todas en el 22/11 y así poder ver el
auto-marcado y la cancelación el día de la verificación; el código y el estado
por defecto de la app no se tocaron.

| Captura | Qué muestra |
| --- | --- |
| `v5-9puntos-01-hoy-automarcado-390.png` | Hoy: 6 clases ya «Dada» por la hora y 2 «Por dar» (17:30 y 18:00). Anillo 6/8. |
| `v5-9puntos-02-clases-desplegable-390.png` | Clases › semana con «Ver quiénes van» abierto (#1): lista de alumnos de la clase. |
| `v5-9puntos-03-alumnos-390.png` | Vista Alumnos: fila de Carla T. con «Alta 19-11-2026» y el chip «Vencido» (#6). |
| `v5-9puntos-04-cobros-390.png` | Cobros: vencimientos con día-mes-año y montos (#6). |
| `v5-9puntos-05-acciones-clase-390.png` | Cuadro de acciones del chip «Por dar». |
| `v5-9puntos-06-cancel-sheet-390.png` | Sheet de cancelación: motivo opcional, modos de aviso y texto editable. |
| `v5-9puntos-07-cancelada-toast-390.png` | Clase cancelada y toast «· Deshacer». |
| `v5-9puntos-08-deshacer-390.png` | Tras tocar el toast: «Clase revertida a Programada», evento `revertida` en auditoría. |
| `v5-9puntos-09-config-prefijo-390.png` | Configuración › prefijo de móvil (+598). |
| `v5-9puntos-10-avisos-whatsapp-390.png` | Avisos de cobro con link «Avisar por WhatsApp» → `wa.me/598…?text=…`. |

## Verificación en vivo

- Auto-marcado: `window.ximeV5.clases` → 6 `dada` / 2 `programada` (hora ~18:00, clases de 17:30 y 18:00 aún por dar).
- Desplegable #1: `details.clase-alumnos` abierto, 6 nombres visibles, primero «Julieta P.».
- Cancelación: `confirmar` → 1 clase `cancelada`, evento `cancelada` con motivo «sin motivo».
- Deshacer: click en `#toast` (data-deshacer=1) → clase `programada`, evento `revertida`, sin errores de consola.
- WhatsApp: link resuelto `https://wa.me/598099123456?text=Hola%2C%20tu%20mensualidad%20est%C3%A1%20por%20vencer...`.

## Fix incluido

`propuesta.ts`: `abrirCancelacion` observaba `.cambiar-dia`, un nodo
que ya no está en ese sheet; lanzaba `TypeError` y la cancelación no se
confirmaba. Ahora observa el sheet completo. Commiteado en `b8a68e88` y
regenerado en `docs/propuesta.js` (`8bc0b8b8`).

Checks: `npm run typecheck` limpio; `npm test` 160/160.

## Cómo ver el build exacto (para revisión visual)

Todo esto está pusheado en `feat/v5-popups-scroll` @ `63db22fd` (local = origin).
Para mirar el mismo `docs/` que se publicaría, desde el worktree:

```bash
cd .worktrees/v5-popups-scroll/docs
python3 -m http.server 8812 --bind 127.0.0.1
```

Y abrir `http://127.0.0.1:8812/index.html#v-hoy`. Verificado: `index.html`
carga `propuesta.js?v=202611221000`, los 15 imports responden 200 y la consola
queda sin errores. `master` (local y origin) sigue en `ae3aa845`: el experimento
de inversión de colores quedó aparte en `backup/master-colores-20261122`.
Publicación en Pages: pendiente del visto bueno visual y de Zaira.
