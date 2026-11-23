# QA · Focus trap y ARIA de paneles (23-nov-2026)

Tarea: `task_f0745d251c6243f5` — accesibilidad de paneles `.sheet.cobros-panel`
y ficha de alumno. Rama `fix/v5-focus-trap-paneles` (base `master` ac5b7eea),
worktree `.worktrees/v5-focus-trap`. Verificado por Reina (desarrollo).

## Qué se cambió (sin tocar diseño ni CSS)

- `v5-diseno/propuesta.ts`:
  - Todos los paneles de alumno/cobros (`<dialog class="sheet cobros-panel">`,
    abierto con `showModal()`) llevan ahora `role="dialog"` y
    `aria-modal="true"` (ya tenían `aria-labelledby`).
  - Focus trap `atraparTab()`: Tab desde el último tabulable («Guardar
    alumno» / «Guardar cambios») vuelve al primero del panel; Shift+Tab desde
    el primero va al último. Aplicado también al cuadro apilado «Cambios sin
    guardar». Se desengancha al cerrar cada panel.
  - Retorno de foco: al cerrar, el foco vuelve al control que abrió el panel
    (botón «Nuevo alumno», fila de alumno, campana, botón Cobros…). Los sheets
    genéricos (Agendar, Opciones de clase, Cancelar clase) ahora también lo
    hacen, vía `data-disparador`. Se agregó `tabindex="-1"` al toast como
    ancla accesible cuando el origen ya no está en el DOM.
- `v5-diseno/index.html`: `id="abrir-agenda"` en el FAB «Agendar» (para
  devolverle el foco) y `tabindex="-1"` en el toast. Nada visible cambia.

## Verificación (Chrome del proyecto, 390×844, una sola pestaña)

- Antes del fix (reproducido en local): Tab desde «Guardar alumno» salía del
  panel al documento; `role`/`aria-modal` eran `null`.
- Después, tema claro y oscuro:
  - Tab desde el último botón vuelve adentro (probado con Tab y Tab+Tab);
    Shift+Tab desde el primero va al último.
  - Escape cierra y el foco vuelve al disparador («Nuevo alumno»;
    «Abrir ficha de Carla T.» al descartar cambios).
  - El aviso «Cambios sin guardar» recibe el foco adentro al abrirse y, al
    elegir «Seguir editando», el foco queda en el panel de fondo.
  - 0 errores de consola en toda la sesión.
- `npm run typecheck`: 0 errores.
- `npm test`: 180/180 en verde (aclaración: el criterio decía 184/184; el
  total en `master` es 180, no se quitó ningún test).

## Capturas (390×844)

- `ficha-nueva-390-claro.png` — panel «Nuevo alumno» abierto, claro.
- `ficha-nueva-tab-vuelta-390-claro.png` — tras Tab desde «Guardar alumno»:
  foco de vuelta dentro del panel.
- `ficha-nueva-390-oscuro.png` — panel abierto, oscuro.
- `alumnos-390-oscuro-tras-cierre.png` — tras Escape: foco en «Nuevo alumno»,
  oscuro.

## Pendiente (fuera de esta tarea)

- Revisión visual y aviso a Nova antes de publicar al vivo (doble control de
  publicación del 23-nov). NO se publicó nada.
