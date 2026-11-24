# Xime v5 — avatar con foto, toque de clase y cierre por deslizamiento

**Fecha:** 24-nov-2026 · **Rol:** Fina (UX/UI) · **Para:** Reina (implementación) y Gino (verificación visual)

Pedido de Nova: (1) mismo avatar de iniciales y color pastel en Alumnos y Cobros, con opción de ponerle foto desde el celular; (2) toque simple en la tarjeta de clase cambia el estado directo y conserva «Deshacer», mantener presionado abre el menú actual; (3) el menú emergente se cierra deslizando desde arriba hacia abajo, con animación bella.

**Base visual FIJA:** v5 aprobada. Turquesa + pastel, cero emoji, sin infantil, movimientos sobrios de 150–320 ms. Nada de base de datos real: todos los datos son de prueba. WhatsApp **no** descarga la foto del perfil: la foto la pone la persona desde el celular.

---

## 1. Avatar único en Alumnos y Cobros

### 1.1 Dónde se ve

| Lugar | Tamaño | Contenido |
|---|---:|---|
| Lista de Alumnos (tarjeta) | 38×38 px | Foto redonda si hay; si no, iniciales + color pastel actual |
| Lista de Cobros (fila) | 32×32 px | El mismo avatar, con el mismo color de esa alumna |
| Chip de alumno en su ficha | 22×22 px | El mismo avatar |
| Alta / edición de alumno | 64×64 px | Vista previa grande + botón de cámara |

**Regla de identidad:** el color lo sigue decidiendo `colorPorId(id)` y las iniciales `iniciales(nombre)` que ya existen. No se cambia el color al poner o quitar la foto. Una alumna se ve igual en Alumnos, Cobros y su ficha.

**Marcador de estado:** el punto de color que ya aparece a la derecha en Alumnos se conserva exactamente donde está; no se convierte en badge sobre la foto. En Cobros no se agrega un punto nuevo: deuda y vencimiento ya tienen su propia jerarquía.

### 1.2 Foto o iniciales

- **Sin foto:** se ve el avatar actual (círculo pastel + iniciales). No se muestra silueta gris, ni «cargando», ni un ícono de usuario genérico.
- **Con foto:** `<img>` circular con `object-fit: cover; object-position: center`, borde de 1 px `var(--linea)` y el mismo diámetro. Si la imagen no carga, se vuelve al avatar de iniciales (fallback en `onerror`, sin roto).
- **Accesibilidad:** la foto es decorativa porque el nombre completo está al lado. `alt=""`, `aria-hidden="true"`. El avatar de iniciales también es decorativo (`aria-hidden="true"`).

### 1.3 Control para poner la foto — dentro de la ficha

En **Alta de alumno** y **Editar ficha**, encima del nombre, se agrega este bloque. Reutiliza los estilos v5 (`.sheet`, `.btn-secundario`, `.btn-primario`, `.campo`) y el patrón de foto de Ropa V2.

**Estado sin foto**

```html
<div class="foto-alumno">
  <div class="foto-alumno-preview" aria-hidden="true">
    <span class="avatar ${color}">${iniciales}</span>
  </div>
  <div class="foto-alumno-acciones">
    <button type="button" class="btn-secundario" data-foto-alumno="camara">
      <svg class="ico" width="18" height="18" aria-hidden="true"><use href="#i-foto-camara"/></svg>
      Tomar foto
    </button>
    <button type="button" class="btn-secundario" data-foto-alumno="galeria">
      <svg class="ico" width="18" height="18" aria-hidden="true"><use href="#i-foto-galeria"/></svg>
      Elegir foto
    </button>
  </div>
</div>
```

**Estado con foto**

- La vista previa de 64×64 muestra la foto.
- Los botones pasan a decir **«Cambiar foto»** (cámara) y **«Elegir otra»** (galería), o se mantienen y se agrega un tercer botón de texto **«Quitar foto»**. Para evitar 3 botones apretados a 320 px, se recomienda mantener los dos primeros y mostrar «Quitar foto» como enlace suave debajo, alineado a la izquierda.
- Al tocar **Quitar foto**, vuelven las iniciales y el color original. El cambio recién se confirma con **Guardar**, igual que el nombre.

**Distribución**

- A 390 px: preview de 64 px a la izquierda; los dos botones a la derecha, en columna, ocupando el ancho restante. Nada se corta.
- A 320 px: preview centrada arriba; los dos botones debajo, cada uno ocupa media fila. «Quitar foto» va centrado abajo. El bloque no agrega más de ~150 px de alto.
- Todos los botones: alto mínimo 44 px, radio v5, foco visible de 2 px turquesa, texto 13–13.5 px.

**Selector de archivo**

- Dos `<input type="file" accept="image/*">` ocultos: uno con `capture="environment"` para cámara y otro para galería. No se abre el selector hasta tocar el botón.
- Al elegir: comprimir como en Ropa V2 — máximo 480 px por lado, JPEG calidad 0.72, `dataURL` guardado en la ficha (campo opcional `foto`).
- Si el archivo no se puede abrir o procesar: toast **«No se pudo abrir la foto. Probá con otra imagen.»**, sin romper el formulario ni borrar lo escrito.
- Vista previa inmediata; cancelar el alta/edición descarta la foto pendiente. **Guardar** es el único que la confirma.

**Texto de ayuda opcional (una línea, no burbuja):** «La foto se guarda en este dispositivo. No se descarga de WhatsApp.» Sólo si hace falta; no es un aviso de error.

### 1.4 Íconos SVG

Agregar al sprite `icons.js` (24×24, trazo 2, redondeado, mismo estilo que el resto):

```js
'foto-camara': '<path d="M8.5 7 10 4.5h4L15.5 7"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/>',
'foto-galeria': '<rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="8.5" cy="10" r="1.5"/><path d="m4 17 4.7-4.4 3.2 2.8 3-2.6L20 17"/>'
```

Cero emoji. Los botones usan `#i-foto-camara` y `#i-foto-galeria`.

---

## 2. Tarjeta de clase: toque simple vs mantener presionado

### 2.1 Comportamiento

**Toque simple (tap) en cualquier parte vacía de la tarjeta**

| Estado actual | Resultado |
|---|---|
| Por dar | Pasa a **Dada** |
| Dada | Vuelve a **Por dar** |
| Cancelada | No cambia con un toque simple; se conserva **Revertir** como hoy |

- Marcar o desmarcar usa el mismo repositorio y las mismas reglas que hoy (`marcarDada` / `deshacerMarcada`), no una lógica visual separada.
- Al cambiar, aparece el toast actual: **«Clase marcada dada · Deshacer»** durante 6 s. Al deshacer la marca desde ese toast, vuelve al estado anterior. Esa es la red de seguridad que pide Nico.
- La tarjeta cambia de color/estado al instante (chip «Dada» o «Por dar», clase `.hecha`, anillo y KPIs se refrescan como hoy).

**Mantener presionado (~450 ms)**

- Abre el mismo menú actual de **Clase dada / Clase por dar**, con «Volver a Por dar» o «Marcar dada», «Cancelar clase» y «Cambiar de día».
- Al iniciarse la presión larga: feedback visual suave (la tarjeta baja 1 px y toma el color de foco turquesa muy suave) y, si el dispositivo lo permite, vibración corta de 10–15 ms. Sin sonido.
- Si el dedo se mueve más de ~10 px antes de los 450 ms, o se levanta antes, se cancela la presión larga. Si ya se abrió, el levantamiento no vuelve a ejecutar el toque simple.
- Sólo dedo o mouse. Con teclado no hay presión larga: el chip de estado y el botón de acciones siguen siendo controles accesibles.

### 2.2 Zonas que no deben cambiar

Dentro de una tarjeta de clase hay controles que ya funcionan. Un toque sobre ellos hace **su acción actual**, no la de la tarjeta:

- chip **Dada / Por dar** → abre el menú (hoy).
- desplegable **«Ver quiénes van»** → abre/cierra la lista.
- **Revertir** de una clase cancelada → revierte.
- cualquier enlace o botón futuro.

La tarjeta pasa a comportarse como contenedor toccable (`role="button"`, `tabindex="0"`, `aria-label` descriptivo) **sólo si no contiene controles interactivos anidados**. Para no romper semántica ni accesibilidad, la opción preferida es:

- Mantener el `article` como `article`, y cablear el gesto en la zona vacía / hora / nombre / datos de la clase.
- El chip de estado conserva su propio botón y `aria-label`.
- Agregar un **botón invisible pero accesible** no es necesario: se puede dejar `tabindex="0"` en la tarjeta con `role="button"` sólo cuando no hay controles dentro; en las tarjetas actuales el control existente (chip) es el que da acceso por teclado.
- Con teclado: **Enter / Espacio** sobre el chip abre el menú, como hoy. No se promete atajo de teclado para el toque simple si eso duplica la acción.

**Decisión de diseño segura (no requiere preguntarle a Nico):** no convertir toda la tarjeta en `<button>` porque contiene un `<details>` y un botón de estado. El toque simple se cablea en la zona no interactiva; los controles internos conservan prioridad.

### 2.3 Dónde aplica

- **Hoy:** cada fila del hero (`15:00 · Grupo Lunes · Dada`). El toque simple cambia directo; mantener abre el menú. Es el caso de las capturas de Nico.
- **Clases, vista semana:** cada `article.clase` de la línea del día.
- **Clases, vista mes:** cada `article.clase` del día abierto.
- **Cancelada:** no cambia con toque simple. Presionar no abre un menú vacío; se deja «Revertir».

### 2.4 Señales visuales

- `:hover` (mouse): elevación de 2 px como hoy.
- `:active` (toque simple): escala `.985` durante ~120 ms.
- Presión larga: `box-shadow` turquesa suave + `translateY(1px)` mientras se mantiene; no animación llamativa.
- Toast «Deshacer»: el actual, con ancho máximo y texto legible; no se tapa con la barra inferior ni el menú.
- Respetar `prefers-reduced-motion`: sin escala ni transiciones; el cambio de estado es inmediato.

---

## 3. Menú emergente que se cierra deslizando hacia abajo

### 3.1 Referencia

Ya existe un primer cierre por deslizamiento en el worktree de Reina (`00bc6825`): usa pointer events, zona superior, umbral de 80 px, rebote y animación de cierre. Se debe **pulir visualmente sobre esa base**, no reescribir otra capa de menús.

El patrón de Ropa V2 (`src/ui/componentes/hoja.js` + `capas.css`) es la referencia:

- barrita de agarre visible arriba;
- cabecera y título también son zona de arrastre;
- el panel sigue al dedo 1:1;
- si no pasa el umbral, rebota con una transición de 320 ms;
- si lo pasa, sale hacia abajo con una transición de 260 ms;
- el fondo se aclara mientras se arrastra;
- no robar el gesto a botones, enlaces, campos, `select`, `textarea` ni al scroll interno ya scrolleado.

### 3.2 Cómo se ve en Xime

Agregar una barrita de agarre al menú de la clase (arriba, centrada):

```html
<div class="sheet-agarre" aria-hidden="true"></div>
```

```css
.sheet-agarre {
  width: 46px; height: 5px; margin: 0 auto 12px;
  border-radius: 999px; background: var(--linea);
  transition: background var(--t-rapida) var(--ease);
}
.sheet.arrastrando .sheet-agarre { background: var(--tinta-2); }
```

- Zona de arrastre: la barrita, el `sheet-head`, y el título. Ignorar el botón X y cualquier control.
- Mientras se arrastra, `transform: translateY(dy)` sobre el panel; `transition: none`. El movimiento es directo, sin delay.
- Al soltar: si el arrastre neto supera **80 px** (o el 20% de la altura del panel, el menor), cierra. Si no, vuelve con `cubic-bezier(.22,.9,.36,1)` en **320 ms**. Resistencia al querer subir: `dy * 0.28`, como Ropa.
- Cierre: `translateY(100%)`, opacidad a `.35`, **260 ms**; al terminar se retira del DOM y se libera el bloqueo de scroll. El cierre por X, Escape, Volver y toque fuera se conserva.
- Fondo: se aclara proporcionalmente al arrastre. En Xime el fondo es la sombra `box-shadow` del propio panel; para no reescribir la capa, se puede animar la opacidad del panel ligeramente (de 1 a `.92`) mientras se arrastra. No crear un backdrop nuevo.

### 3.3 Accesibilidad y no regresión

- El gesto es adicional: X, Escape, «Volver» y toque fuera siguen cerrando.
- Si el menú está en **Cambiar de día** con una fecha modificada, el deslizamiento debe pasar por el mismo aviso de cambios sin guardar que el cierre por X. No descartar el cambio en silencio.
- El foco vuelve al chip / botón que abrió el menú al cerrar.
- `aria-modal`, focus trap y `aria-labelledby` se conservan.
- En escritorio funciona con mouse; en móvil con dedo. `pointercancel` limpia el estado y rebota, no cierra.
- `prefers-reduced-motion`: el panel puede seguir al dedo (es interacción directa), pero el rebote y cierre son inmediatos, sin animación.

---

## 4. Verificación visual (para Gino)

Probar con datos inventados, en claro y oscuro, a 320 y 390 px:

1. **Avatar sin foto:** mismas iniciales y mismo color pastel en Alumnos, Cobros y ficha. El punto de estado de Alumnos no se mueve.
2. **Poner foto desde cámara y galería:** preview circular, se ve en las tres pantallas, no se corta, no deforma. Quitar foto vuelve a iniciales. Cancelar descarta; Guardar conserva.
3. **Foto inválida / que no carga:** mensaje claro, formulario intacto, fallback a iniciales.
4. **Toque simple:** Por dar → Dada; Dada → Por dar; aparece «Deshacer» y funciona. El anillo/KPIs cambian coherentemente.
5. **Mantener presionado:** abre el menú sólo al pasar ~450 ms; no ejecuta también el toque simple. Mover el dedo o tocar un control interno no abre/acciona de más.
6. **Deslizar:** se puede agarrar desde la barrita/cabecera; sigue al dedo; menos del umbral rebota; más cierra con salida suave. X, Escape, Volver y tocar fuera siguen funcionando. Con cambio de fecha pide confirmación.
7. **Teclado / lector:** foco visible, nombres accesibles, no hay botones anidados ni doble anuncio.

---

## 5. Archivos previstos (para Reina)

- `v5-diseno/propuesta.ts`: render de avatar/foto, control de foto en alta/edición, gesto de tarjeta, pulido del gesto de cierre existente.
- `v5-diseno/propuesta.css`: `.avatar` con soporte de foto, `.foto-alumno*`, `.sheet-agarre`, estados de arrastre / presión larga.
- `v5-diseno/icons.js`: `foto-camara` y `foto-galeria`.
- `v5-diseno/src/alumnos.ts`: campo opcional `foto` y preservación al editar/normalizar (sin alterar ID, color, pagos ni vencimientos).
- Tests de dominio / gesto que correspondan; regen de `docs/` y sello de publicación como siempre.

**Fuera de alcance:** bajar fotos de WhatsApp, base de datos real, cambiar la paleta v5, rediseñar la lista de alumnos o cobros por fuera del avatar.
