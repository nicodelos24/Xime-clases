# Fix final · hover/tema oscuro + cierre mouse (build integrado)

Fecha: 24-11-2026. Rama `feat/integracion-avatar-seguridad-20261124`. Base: `da831ae5`.
Spec `42d381f6`, v5 fija sin rediseño. `docs/` regenerado con sello `202611240800`. **No publicado.**

## Cambios

- **P1 contraste hover (oscuro, 0 violaciones):** en `v5-diseno/propuesta.css`,
  `[data-tema="oscuro"] .fab:hover{background:var(--tq-900)}` y
  `[data-tema="oscuro"] .foto-alumno-acciones .ficha-accion:hover{background:var(--tq-100)}`.
  Reposo y tema claro intactos.
- **P2 cierre con mouse:** `.sheet-agarre,.sheet-head{user-select:none}` (sumado al
  `touch-action:none` existente). Evita `dragstart → pointercancel` al arrastrar
  50 px y soltar a 140 px.
- **Hardening de seguridad incluido** (dos archivos sueltos hallados en el worktree a las
  07:14, coherentes con el informe XSS de Emma `aa5f8ca6`/`8fa0461c`):
  `esc()` de `propuesta.ts` escapea `>` como `&gt;`; `iniciales()` de `alumnos.ts`
  filtra a letras A-Z (devuelve `?` si no queda ninguna). Ambos con tests nuevos en
  `v5-diseno/test/seguridad.test.ts` (SEG-01). Origen: cambios presentes en el worktree
  al iniciar esta tarea, sin autor documentado en el historial de git; se verificó que
  no están en ningún commit alcanzable ni en los worktrees de Emma. Ver «Límites».

## Verificación (comandos y resultados)

| Chequeo | Resultado |
|---|---|
| `npm run typecheck` | verde |
| `npm test` | **227/227** (antes 225; +2 tests SEG-01) |
| `npm run build:check -- <tmp>/build-check` | verde; los 3 selectores nuevos presentes en el CSS compilado |
| `XIME_URL=http://127.0.0.1:8939/index.html node t1b-mouse3.mjs` | agarre y cabecera: 50 px → 1 hoja abierta, 140 px → 0, **0** eventos `pointercancel`/`dragstart`/`selectstart` |
| `XIME_URL=... AXE_JS=<axe 4.11.0> node t2c-hover-sweep.mjs` | oscuro **134 probados / 0 fallos**; claro **134 probados / 0 fallos** (`color-contrast`) |
| `XIME_URL=... node t1-tactil.mjs` | 8/8 cierres táctil+mouse × agarre/cabecera × reduce on/off, 0 `pointercancel`; scroll del contenido 157/160 px sin cerrar a 320/390; `TODO OK true`; 0 errores JS |
| `git diff --check` | limpio |

Scripts de Fina reutilizados desde
`.worktrees/fina-ux-real-20261124/docs/qa/ux-real-20261124/da831ae5/repro/`,
con `XIME_URL` apuntando al build local servido en `127.0.0.1:8939` y axe-core 4.11.0
instalado en el scratch de esta tarea. Salidas JSON copiadas a esta carpeta:
`t1b-mouse-50-luego-140.json`, `t2c-hover-sweep.json`, `t1-tactil.json`.

## Capturas

- `capturas/fab-hover-oscuro.png` — FAB «Agendar» en hover, tema oscuro: fondo `#08454a` (`--tq-900`), texto legible.
- `capturas/foto-accion-hover-oscuro.png` — «Tomar foto» en hover, tema oscuro: fondo `#1c3a3b` (`--tq-100`).
- `capturas/t1-scroll-320.png`, `capturas/t1-scroll-390.png` — scroll del sheet sin cierre.

## Límites

- Chromium headless + Playwright en servidor local efímero; no dispositivo físico ni Safari.
- **Chrome compartido (`kaia_chrome_xime`) NO usado ni reservado.**
- No se publicó nada.
- Origen de los dos archivos sueltos: coherentes con el hardening de seguridad pendiente
  del informe de Emma y presentes en el worktree al iniciar la tarea, pero sin autor
  confirmado en el historial. Se decidió conservarlos e incluirlos en el commit con tests
  porque son correctos y están verificados; se recomienda confirmación de Emma/Nova.
