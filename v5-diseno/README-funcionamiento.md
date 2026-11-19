# Clases v5 · funcionamiento (prototipo)

> **Estado (19/11/2026, Reina):** entregado para QA. `feat/v5-funcionamiento`.
> El diseño visual de este prototipo estaba aprobado por Nico y es fijo;
> acá se agregó el funcionamiento de `v5/PLAN.md` (estado de clase,
> auto-marcado por hora, Cancelar clase, WhatsApp Opción A).

## Qué corre

```bash
npm install        # solo typescript + @types/node (una vez)
npm run typecheck  # tsc --noEmit → 0 errores
npm test           # node --test test/*.test.ts → 41 tests, 0 fallos
npm run serve      # servidor estático en http://localhost:8797/index.html
```

`npm run serve` usa `serve.mjs`, no `python3 -m http.server`: el prototipo
carga TypeScript como módulos del navegador (`<script type="module"
src="propuesta.ts">`) y Python les pone un MIME que Chrome rechaza
(`text/vnd.trolltech.linguist`). `serve.mjs` además transpila los `.ts` a
JavaScript con el TypeScript del proyecto, porque el navegador no entiende
sintaxis TS (`import { type X }`). Sin build previo y sin dependencias de
servidor.

## Qué hace (v5/PLAN.md)

- **Estado de clase**: Programada → (hora pasada) → **Dada** sola, o
  **Cancelada** a mano. Se usa el reloj del dispositivo en
  `America/Montevideo` (`src/reloj.ts`), con reloj inyectado para los tests.
- **Cancelar clase** (reemplaza a "Marcar dada"): motivo obligatorio +
  confirmación + deshacer desde el toast.
- **WhatsApp Opción A**: texto editable precargado, `masivo` / `individual` /
  `no enviar ahora`, deep links `wa.me` abiertos uno por uno por el dueño
  (nunca envío automático) y registro en la auditoría de la cancelación.
- **Revertir**: cancelar una clase ya dada vuelve a Programada (con motivo).

## Código

- `propuesta.ts` — navegación, vistas, sheet de cancelación.
- `src/clases.ts` — dominio: crear, `reconciliar` (auto-marcado), cancelar,
  revertir, registrar mensajes. Puro: sin `Date.now()`, sin DOM.
- `src/reloj.ts` — reloj real y `relojFalso` de prueba.
- `src/fechas.ts`, `src/resumen.ts`, `src/whatsapp.ts` — fechas, resúmenes de
  las vistas y construcción de deep links.
- `test/*.test.ts` — 41 tests con reloj simulado (nunca tocan el reloj real).
- `propuesta.ts` expone `window.ximeV5` para QA en la consola.

## Corregido el 19/11 en esta entrega

1. **MIME de los `.ts`**: el prototipo no abría en Chrome (`serve.mjs`).
2. **Pendientes de WhatsApp heredados**: cancelar con "No enviar ahora"
   dejaba en el toast los enlaces de la cancelación anterior; hoy cada
   cancelación arranca con sus propios pendientes (0 si no envía).
3. **Anillo al arrancar**: el llenado del anillo se anima desde el vacío
   hasta el estado real (Web Animations API, `fill: both`), en vez de
   apagar la animación.
