# Clases v5 · funcionamiento (prototipo)

> **Estado (20/11/2026, Reina):** `feat/v5-agendar-clases`. El diseño visual
> v5 está aprobado por Nico y es fijo; acá vive el funcionamiento de
> `v5/PLAN.md`: estado de clase, auto-marcado, Cancelar, WhatsApp Opción A,
> interacciones de Agenda y agendar/reprogramar clases. 110 tests en verde.

## Qué corre

```bash
npm install        # solo typescript + @types/node (una vez)
npm run typecheck  # tsc --noEmit → 0 errores
npm test           # node --test test/*.test.ts → 110 tests, 0 fallos
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
4. **Deshacer sin errores al repetir**: el click del toast seguía al
   segundo handler cuando `deshacerCancelacion` lanzaba (clase ya
   revertida), y el `dataset` quedaba pisado con un "Deshacer" que
   volvía a fallar. Hoy `revertirCancelacion` devuelve `boolean`, se
   limpia `deshacer`/`clase`/`pendientes` en el mismo handler y un
   fallo muestra el mensaje en el toast en vez de lanzar.

## Verificado en Chrome (kaia_chrome_xime, 19/11)

- **Auto-marcado**: al abrir, lunes→miércoles en `dada` y jueves en
  adelante `programada`; la vista Hoy dice "Sin clases por dar" con anillo
  `1/1`. Captura: `v5-hoy-automarcado.png`.
- **Cancelar clase**: sheet con motivo obligatorio, 3 modos de aviso
  (masivo / individual / no enviar ahora) y mensaje precargado editable.
  Captura: `v5-cancel-sheet.png`.
- **WhatsApp Opción A**: con "Masivo" y 11 alumnos, el toast avisa
  "WhatsApp listo para los 11 alumnos… quedan 10 para abrir · Deshacer" y
  `dataset.pendientes` guarda 10 links `wa.me` con el texto codificado;
  se abre una pestaña por alumno (una sola, manual, nunca automática).
  Captura: `v5-toast-whatsapp.png`.
- **Deshacer**: convierte la clase a `programada`, limpia `cancelacion` y
  deja `dataset` vacío; **3 clics seguidos sobre el toast → 0 errores de
  consola** (antes lanzaba "Solo se revierte una clase cancelada").
- Consola de la sesión final: **0 errores, 0 warnings**.

## Agendar y reprogramar (20/11)

- **FAB «Agendar»**: ofrece «Clase semanal» (nombre, días de la semana,
  inicio visible —hoy por defecto—, hora y duración) y «Clase suelta»
  (nombre, fecha exacta, hora y duración). Ambas validan y guardan en
  `xime.v5.estado` sin duplicados.
- **`src/agendar.ts`**: genera las ocurrencias de cada rutina con ID estable
  (`rutinaId + fecha + minutos`) y horizonte deslizante. Cancelar o mover una
  ocurrencia no reaparece en origen ni cambia el resto de la serie.
- **Estado «Dada»**: `src/clases.ts` la clase sigue «Por dar» hasta
  `inicio + duración` (Montevideo, incluso cruzando medianoche). Se
  reconcilia al abrir, al volver y con la app abierta; no pisa marcas
  manuales, canceladas ni auditoría.
- **«Cambiar de día»**: selector día/mes/año accesible con la fecha original
  legible; mueve solo esa clase conservando ID, hora, duración, alumnos y
  auditoría, y la muestra en destino aunque cruce semana/mes. Las flechas
  del almanaque v5 navegan entre meses; toque simple/doble y estilo intactos.
- Sin BD, sin login y sin tocar `serve.mjs`/8797. `docs/` se regenera
  transpilando TS a JS estático con cache-bust ( Pages no transpila en vivo).

### Actualizado 20/11 (segunda ronda)

- **Meses lejanos**: las ocurrencias se materializan para el rango que se
  consulta (mes/semana visible), no solo hasta `hoy + 60 días`. Consultar
  febrero 2027 muestra sus clases sin duplicar, sin inventar días previos al
  inicio y sin marcarlas como dadas por el hecho de mirarlas.
- **Vuelta de segundo plano**: `visibilitychange`/`pageshow` reconcilian el
  reloj al instante; una clase 23:00–00:00 pasa a «Dada» apenas cruza la
  medianoche, sin esperar el cron ni recargar.
- **Mover con seguridad**: una sola escritura obligatoria para estado,
  auditoría y excepción. Si falla el guardado, el cuadro sigue abierto con
  el error y no se aplica ningún cambio parcial; origen y destino se muestran
  con año antes de confirmar.
- **Datos a salvo entre builds**: el estado se escribe en `version: 2` con
  `rutinas` aditivo y respaldo en `xime.v5.rutinas`, para que una pestaña
  antigua del build v2 no resembre ni borre clases. Los imports de
  `docs/src/` llevan cache-bust individual para no mezclar versiones.
- **Mes fácil de usar**: flechas anterior/siguiente de 44×44 px junto al
  título mes+año, con nombres accesibles («Mes siguiente: enero 2027»). En
  el día elegido del almanaque, incluso vacío, «Agendar acá» abre la suelta
  con esa fecha precargada; al guardar se sigue en ese mes/día y la tarjeta
  persiste tras F5. Datos ficticios (sin BD todavía).

### Actualizado 20/11 (barra inferior que se oculta al scrollear)

- **Más espacio en el celu**: al bajar por el contenido la barra inferior se
  desliza suavemente fuera de pantalla y al subir vuelve a aparecer; al llegar
  arriba del todo queda siempre visible. Mismo diseño, ancho, bordes y color
  (claro/oscuro) en reposo: solo cambia su posición, sin tocar el layout ni
  generar saltos de contenido, franjas de fondo ni tap targets invisibles
  (`pointer-events: none` mientras está fuera).
- **Sin parpadeos**: la decisión es pura (`src/barra-scroll.ts`) con zona
  muerta de 6 px (ignora micro-scroll y rebotes), tope de 4 px (siempre visible
  arriba) y overscroll negativo tratado como 0. El listener `scroll` es
  `passive` y va por `requestAnimationFrame`. Si el teclado enfoca la barra
  (Tab) o cambia la vista (hash), reaparece y se recalibra la referencia.
- **Movimiento reducido**: `prefers-reduced-motion` anula la transición global
  (cambio instantáneo, sin animación).
- **Verificado en Chrome** (390 px, claro/oscuro, con/sin scroll): bajar oculta
  (transform 87 px, opacity 0), subir reaparece, micro-scroll de 3 px no cambia
  el estado, la animación es suave (~120–150 ms), el foco por teclado la devuelve
  y no hay errores de consola. Capturas en `docs/qa/barra-scroll/`.

### Actualizado 21/11 (cuadros emergentes: scroll, cierre y altura)

- **Sin rebote de la barra**: la decisión (`src/barra-scroll.ts`) recorta el
  scroll al rango real del documento (`scrollHeight - innerHeight`) y exige dos
  muestras de subida sostenida para reaparecer. El rebote elástico del fondo y
  el micro-ruido al bajar ya no la devuelven; una subida real sí.
- **El dedo mueve el cuadro, no la página**: con cualquier sheet abierto
  (agendar, Por dar/Dada, cancelación, ficha, cobros, notificaciones) el
  documento se fija sin perder la posición (`html/body.con-sheet`), el sheet
  tiene `overscroll-behavior: contain` y scroll interno solo si excede su
  altura. El lock es profundo: superponer dos cuadros y cerrar uno no
  desbloquea antes.
- **Cierre limpio**: tocar fuera, la X, Escape o cambiar de vista cierran el
  cuadro. Si hay cambios sin guardar (ficha, agendar, cobros, cancelación,
  cambio de día), aparece «¿Hay cambios sin guardar, querés guardarlos?» con
  Guardar / Descartar / Seguir editando; en cuadros sin edición cierra directo.
- **Cuadros completos**: la altura se mide con `visualViewport` real y
  safe-area (`src/sheets.ts`), no con el 88% de un `.cel` que crece. «Por dar» y
  «Dada» se ven enteros, sin scroll forzado. Mismos tokens v5, sin BD (datos
  ficticios), sin emoji.
- **Verificado en Chrome** (390 px): los cuatro puntos, con rueda real del
  mouse y scroll simulado; sin errores de consola. Capturas en `docs/qa/`.
