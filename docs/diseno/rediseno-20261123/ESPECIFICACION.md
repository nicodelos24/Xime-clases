# Rediseño único de Xime v5 — especificación de diseño (pieza 1)

**Estado:** decisiones FIJADAS. Reina (pieza 2) implementa exactamente esto, sin decidir nada de diseño.
**Autor:** Fina (UX) · **Dueño visual:** Vito · **Coordina:** Roma. **Fecha:** 23-nov-2026.
**Pedido de Nico:** menús emergentes + Cobros, todo junto, estándar Ropa V2 — «quitar ruido visual poniendo la información en burbujas con "?"; destacar más los precios; destacar WhatsApp con ícono SVG; destacar cuánto debe y cuándo paga el alumno vinculado desde su tarjeta; filtros y forma de organizar Cobros; abrir la ficha del alumno al tocar un cobro; aplicación profesional, intuitiva y estética».

> Base aprobada 17-nov: **no se rediseña nada fuera de lo listado acá**. Nico rechazó el rediseño general de Reina («se ve feo y desordenado»): se mantiene la base y se pule sólo lo de esta spec. Sin cambios de paleta, sin emoji, sin componentes nuevos genéricos.

---

## 0. Alcance y reglas de oro

1. **Cero invención visual.** Todo lo que se pide ya existe en la base: tokens v5 (`tokens.css`), filtros (`.f-chip`/`.tira-filtros`), diálogo accesible (`abrirDialogoCobros`), sprite de íconos (`icons.js`). Sólo se reordena y se destacar; se agrega **un** ícono nuevo (`wa`) al sprite.
2. **Funcionalidad intacta.** No se toca `src/cobros.ts` (regla de vencimiento: mismo día del mes siguiente, clamp al último día), ni el cálculo de deuda/avisos/KPIs. Lo que cambia es presentación + los handlers de Cobros.
3. **Accesibilidad intacta y mejorada.** `role="dialog"`, `aria-modal="true"`, título con `aria-labelledby`, focus trap, cierre con Escape/fuera, `:focus-visible`, `prefers-reduced-motion`. Ayuda new: `aria-describedby` + `aria-expanded` en cada burbuja.
4. **Sin secretos ni datos de clientas reales** en ningún texto nuevo; los nombres de la demo son los que ya están.

---

## 1. Burbujas «?» de ayuda contextual (A1)

### 1.1 Componente único (nuevo, mínimo)

Una burbuja = un `<button>` circular con «?» literal (no emoji, no ícono de interrogación dibujado), con ayuda que se abre al toque y se cierra al volver a tocar o al tocar fuera/Escape.

```html
<!-- disparador: 32×32 px mínimo, dentro de la fila del texto que explica -->
<button type="button" class="ayuda-btn" aria-label="¿Qué significa?"
        aria-expanded="false" aria-controls="ayuda-grupo">?</button>
<p class="ayuda-texto" id="ayuda-grupo" hidden>Solo una etiqueta para agrupar alumnas. No crea grupos ni manda mensajes.</p>
```

**Comportamiento (implementar una sola vez, reutilizar):**
- `aria-expanded` refleja `hidden` del texto; el texto va justo **debajo** del disparador, mismo margen izquierdo.
- `aria-describedby` del campo/windows que corresponda apunta al id del texto, para que el lector de pantalla lo lea al enfocar.
- Cierre: mismo botón, `Escape`, o toque fuera (usar el mismo patrón `pointerdown`/`pointerup` que ya usa el sheet; **no** cerrar en `pointerdown` — eso rompía el scroll, ver `cerrarSheetPorFuera`).
- Sólo **una** burbuja abierta a la vez por diálogo; abrir una cierra la otra.
- Animación de entrada 150 ms `--t-rapida` con `--ease`, sólo `opacity`/`transform`. Sin `transition` con `prefers-reduced-motion`.

**CSS nuevo (agregar al final de `propuesta.css`, sin tocar lo demás):**

```css
/* Ayuda contextual (A1): burbuja «?» — misma paleta v5, cero emoji. */
.ayuda-btn {
  flex: none; width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid var(--linea); background: var(--tq-100);
  color: var(--tq-700); font: 700 15px/1 system-ui, sans-serif;
  cursor: pointer; display: inline-grid; place-items: center;
  transition: background var(--t-rapida) var(--ease);
}
.ayuda-btn[aria-expanded="true"] { background: var(--tq-200); }
.ayuda-btn:focus-visible { outline: 2px solid var(--tq-700); outline-offset: 2px; }
.ayuda-texto {
  margin: 4px 0 2px; padding: 8px 11px; border-radius: var(--r-chico);
  background: var(--bg); border: 1px solid var(--linea);
  color: var(--tinta-2); font-size: 12px; line-height: 1.45;
}
.ayuda-texto[hidden] { display: none; }
[data-tema="oscuro"] .ayuda-btn { background: var(--tq-100); color: var(--tq-700); }
/* --tq-100/#1C3A3B con --tq-700/#7BE0D6 => 7.8:1 (AA). El texto de ayuda
   usa --tinta-2 sobre --bg: 7.0:1 claro / 6.8:1 oscuro (AA). */
@media (prefers-reduced-motion: reduce) { .ayuda-btn { transition: none; } }
```

> Área táctil: la burbuja es 32×32 visual pero debe tener **44×44 de área de toque** (`::before` invisible o padding + `background-clip`; no agrandar el círculo). En 320 px no compite con los campos: va al costado del rótulo, nunca encima del input.

### 1.2 Los tres textos de la captura (Joaquín P.)

| # | Texto actual (donde está) | Tratamiento |
|---|---|---|
| 1 | `Los links abren WhatsApp con el mensaje escrito; el envío lo confirmás vos.` — `abrirFichaConCobro`, final del resumen (`propuesta.ts:1583`) | Burbuja al lado de «Enviar WhatsApp». Texto oculto por defecto; el enlace sigue con su `aria-label` y `target="_blank" rel="noopener"`. |
| 2 | `Solo una etiqueta para agrupar alumnas. No crea grupos ni manda mensajes.` — `abrirFicha`, `<small class="campo-ayuda">` (`propuesta.ts:1625`) | Burbuja al lado del rótulo «Grupo (opcional)». El `<small>` pasa a ser el `.ayuda-texto` (mismo contenido, sin reescribir). |
| 3 | `Podés corregir nombre, modalidad, día de vencimiento y teléfono. La identidad y la fecha de alta no se cambian.` — `abrirFicha`, `.cobros-panel-nota` (`propuesta.ts:1609`) | Burbuja al lado del título del diálogo «Editar ficha». En «Nuevo alumno» la nota visible sigue como está (es instrucción de alta, no aclaración). |

### 1.3 Otros paneles con texto informativo — mismo criterio

Aplicar la misma burbuja, **sin cambiar el texto**:

- **Avisos de cobro** (`campana`, `propuesta.ts:1969`): burbuja junto al título; el texto «Mensualidades sin pagar que vencen hoy o en los próximos 7 días…» pasa a ayuda. Si `avisos.length === 0`, el mensaje «No hay avisos de vencimientos.» **queda visible** (es estado vacío, no aclaración).
- **Historial de pagos** (`propuesta.ts:1841`): «Todavía no registraste pagos.» queda visible (estado vacío).
- **Editar fecha del pago** (`.cobros-panel-nota` en `abrirPago`, `propuesta.ts:1911`): burbuja; se conserva el texto de corrección/anulación.
- **Cancelar clase** (`propuesta.ts:930`): burbuja al lado de «Dar de baja» para el texto «Dar de baja una rutina cancela sus clases futuras…».
- **Regla:** todo texto que sea *estado* (vacío, error, confirmación) se ve; todo texto que sea *explicación de cómo funciona algo* se pliega en «?».

---

## 2. Ficha del alumno (A2–A5)

### 2.1 Cabecera con alumno + deuda + vencimiento en chips (A4)

La cabecera del sheet de ficha (`#cobros-panel-titulo` + `.cobros-panel-resumen` de `abrirFicha`, y el bloque `.ficha-cobro` que inyecta `abrirFichaConCobro`) pasa a esta composición:

```html
<div class="ficha-cabecera">
  <span class="avatar-gran"><!-- inicial --></span>
  <div class="ficha-cabecera-id">
    <h3 id="cobros-panel-titulo">Nombre de la alumna</h3>
    <p class="al-sub">Alta 12 mar 2026</p>
  </div>
  <button type="button" class="ayuda-btn" aria-label="¿Qué significa?" …>?</button>
</div>
<!-- chips: mismo lenguaje que .chip de Ropa V2 / .f-chip de v5 -->
<div class="ficha-chips" role="group" aria-label="Estado de cobro de la alumna">
  <span class="chip chip-deuda">Debe <b>$6.500</b></span>
  <span class="chip chip-vence">Vence el 21 may</span>
  <span class="chip chip-estado">Vencido · 3 días</span>
</div>
```

**Datos (no inventar):**
- **Deuda** = `uyu(deuda.alumno.montoUYU)` de la fila sin pago que ya elige `abrirFichaConCobro`. Si hay último pago y no hay deuda: chip verde «Al día · último pago 12 abr» (usa `ultimo` / `uyu(ultimo.montoUYU)` que ya existen).
- **Vencimiento** = `fechaCorta(deuda.fecha)` + `textoVence(deuda.dias)` (funciones existentes). Sin pago y sin deuda: chip neutro «Sin cobros registrados.».
- **Estado** = el `.ficha-cobro-estado` actual con sus clases `vencido`/`pendiente` (rosa/ámbar); se reutiliza, no se recolorea.
- Los chips son **presentacionales** (`<span>`, no botones), salvo el de estado que sigue igual que hoy.

**CSS nuevo (agregar):**

```css
.ficha-cabecera { display:flex; align-items:center; gap:11px; margin-top:16px; }
.ficha-cabecera .avatar-gran {
  width:44px; height:44px; flex:none; border-radius:50%;
  display:grid; place-items:center; font-size:16px; font-weight:800;
  background:var(--tq-100); color:var(--tq-700);
}
.ficha-cabecera-id { flex:1; min-width:0; }
.ficha-cabecera-id h3 { font-size:17px; font-weight:800; letter-spacing:-.2px; overflow-wrap:anywhere; }
.ficha-chips { display:flex; gap:7px; flex-wrap:wrap; margin-top:12px; }
.ficha-chips .chip {
  display:inline-flex; align-items:center; gap:6px; min-height:30px;
  padding:5px 11px; border-radius:999px; font-size:12px; font-weight:700;
  border:1px solid var(--linea); background:var(--bg); color:var(--tinta-2);
  font-variant-numeric:tabular-nums;
}
.ficha-chips .chip b { font-size:13.5px; color:var(--tinta); }
.ficha-chips .chip-vence { background:var(--tq-100); border-color:var(--tq-300); color:var(--tq-700); }
.ficha-chips .chip-estado { background:var(--rosa-tinte); border-color:transparent; color:var(--rosa); }
.ficha-chips .chip-estado.pendiente { background:var(--ambar-tinte); color:var(--ambar); }
.ficha-chips .chip-estado.al-dia { background:var(--verde-tinte); color:var(--verde); }
[data-tema="oscuro"] .ficha-chips .chip-estado { color:var(--rosa-pastel); }
[data-tema="oscuro"] .ficha-chips .chip-estado.pendiente { color:var(--ambar-pastel); }
[data-tema="oscuro"] .ficha-chips .chip-estado.al-dia { color:var(--verde-pastel); }
[data-tema="oscuro"] .ficha-cabecera .avatar-gran { background:var(--tq-100); color:var(--tq-700); }
```

> Contraste verificado en la base: `--tq-700` sobre `--tq-100` = 5.2:1 claro / 7.8:1 oscuro; rosa/ámbar/verde sobre sus tintes, AA en claro; en oscuro se usan los `*-pastel` ya documentados en `tokens.css` (8.17 / 9.61 / AA).

### 2.2 Precio / deuda destacados (A2)

- El importe va en `<b>` dentro del chip, `font-variant-numeric: tabular-nums`, `13.5px/800`, color `--tinta` (o `--tq-700` para el de WhatsApp, ver abajo).
- En el detalle del cobro se mantiene `.ficha-cobro-monto` (`font-weight:700; color:var(--tinta)`), ganando `16px` en la ficha.
- En Cobros, la fila usa `.monto` con `font-size:15px; font-weight:800` (ver §3.3).
- No se agregan símbolos de moneda nuevos: se usa `uyu()` (`$6.500`).

### 2.3 WhatsApp con ícono SVG estilo `.btn-wa` (A3)

**Ícono nuevo en `icons.js`** (sprite actual, mismo estilo: 24×24, `fill="currentColor"`, `aria-hidden="true"`). Copiar el path de Ropa V2 (`Aplicacion-ropa/src/ui/iconos.js`, clave `wa`) — es el mismo SVG que ya usa `.btn-wa`:

```js
wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.05 2.25c-5.4 0-9.78 4.38-9.78 9.78 0 1.72.45 3.34 1.24 4.74L2.25 21.5l4.85-1.27a9.74 9.74 0 0 0 4.95 1.35c5.4 0 9.78-4.38 9.78-9.78s-4.38-9.55-9.78-9.55zm0 17.84c-1.6 0-3.1-.48-4.36-1.3l-.31-.19-3.24.85.86-3.16-.2-.33a8.06 8.06 0 0 1-1.24-4.32c0-4.48 3.65-8.12 8.12-8.12 4.48 0 8.12 3.64 8.12 8.12 0 4.48-3.64 8.45-8.12 8.45z"/><path d="M15.1 13.9c-.15-.08-.9-.45-1.05-.5-.14-.05-.24-.08-.35.07-.1.16-.4.5-.5.6-.09.1-.18.12-.33.04-.15-.07-.63-.23-1.2-.74-.44-.4-.74-.88-.83-1.03-.09-.15-.01-.23.06-.31.07-.07.15-.18.22-.27.08-.09.1-.15.15-.25.05-.1.03-.19-.02-.27-.05-.07-.35-.85-.48-1.16-.13-.31-.26-.27-.35-.27h-.3c-.1 0-.27.04-.4.19-.14.16-.53.52-.53 1.26 0 .74.54 1.46.62 1.56.07.1 1.06 1.62 2.56 2.27.36.16.64.25.85.32.36.11.69.1.95.06.29-.05.9-.37 1.02-.72.13-.36.13-.66.09-.72-.04-.07-.14-.1-.28-.17z"/></svg>',
```

> En el sprite de Xime se registra como símbolo (`id="i-wa"`) con el mismo contenido: `wa: '<path …/><path …/>'` dentro del objeto `S`. Se usa `<svg class="ico" width="17" height="17" aria-hidden="true"><use href="#i-wa"/></svg>` — consistente con `window.ico()` y con el resto del app. No se pega el `<svg>` inline en el HTML de la ficha.

**Botón principal (destacado):** el primer `.ficha-accion` pasa a ser botón primario con el ícono y el acento de la base:

```html
<a class="cobros-link ficha-accion ficha-accion-wa" href="…" target="_blank" rel="noopener" data-wa>
  <svg class="ico" width="17" height="17" aria-hidden="true"><use href="#i-wa"/></svg>
  <span>Enviar WhatsApp</span>
</a>
```

```css
.ficha-acciones .ficha-accion-wa {
  background:var(--tq-700); color:var(--bg-alt); border-radius:var(--r-chico);
  justify-content:center; gap:8px; font-size:13.5px; font-weight:800;
  min-height:46px; padding:0 14px; box-shadow:var(--sombra);
  text-decoration:none;
}
.ficha-acciones .ficha-accion-wa:hover { background:var(--tq-600); }
.ficha-acciones .ficha-accion-wa:active { transform:scale(.98); }
[data-tema="oscuro"] .ficha-acciones .ficha-accion-wa { color:var(--bg); }
```

**Regla de jerarquía:** el botón WhatsApp es el único acento fuerte del sheet. Las otras dos acciones se quedan como hoy (texto `--tinta-2`, 44 px de alto, filete separador), con sus íconos acordes:
- `Avisar por WhatsApp (por vencer)` → mismo `#i-wa`, tamaño 15, color `--tinta-2` (no compite).
- `Registrar pago` / `Editar fecha del pago` → `#i-cobros` ya existente, 15 px.

Textos de las tres acciones **no se cambian** (A5). La burbuja «?» del punto 1.2 va al lado del botón principal, no reemplaza el `aria-label`.

### 2.4 Accesibilidad conservada (A5)

- Todo lo anterior vive dentro del `dialog.sheet.cobros-panel` que crea `abrirDialogoCobros`: conservar `role="dialog"`, `aria-modal="true"`, `aria-labelledby="cobros-panel-titulo"`, focus trap y cierre. **No** crear otro diálogo ni contenedor con `role="dialog"`.
- El header nuevo es `h3#cobros-panel-titulo` — se mueve el id del markup actual al nuevo `<h3>`; el `aria-labelledby` sigue apuntando al mismo id.
- Las burbujas no roban el foco al abrir el sheet: el foco sigue entrando al primer control como hoy.
- La ayuda es texto real en el DOM, `hidden` cuando está cerrada; lector de pantalla la obtiene por `aria-describedby`/`aria-controls`.

---

## 3. Cobros (B6–B9)

### 3.1 Filtros (B6, B8)

Agregar **encima del KPI**, dentro de `#v-cobros`, la misma tira que ya usa Alumnos (`index.html:220`), reutilizando `.tira-filtros`, `.filtros`, `.f-chip`, `.pista*` (sin CSS nuevo de filtros):

```html
<div class="tira-filtros" id="cobros-filtros">
  <div class="filtros" id="filtros-cobros" role="group" aria-label="Filtrar cobros">
    <button class="f-chip activo" data-cf="todos" type="button" aria-pressed="true">Todos</button>
    <button class="f-chip" data-cf="deben" type="button" aria-pressed="false">Deben</button>
    <button class="f-chip" data-cf="vencido" type="button" aria-pressed="false">Vencido</button>
    <button class="f-chip" data-cf="por-vencer" type="button" aria-pressed="false">Por vencer</button>
    <button class="f-chip" data-cf="pagado" type="button" aria-pressed="false">Pagado</button>
  </div>
  <span class="pista pista-inicio" aria-hidden="true"></span>
  <span class="pista pista-fin" aria-hidden="true"></span>
</div>
```

**Semántica de filtros (derivada de `resumenCobros`, `src/cobros.ts` — no cambiar el cálculo):**
| Chip | Incluye filas donde |
|---|---|
| Todos | todas (default) |
| Deben | `!f.pago` (deuda pendiente) |
| Vencido | `!f.pago && f.dias < 0` |
| Por vencer | `!f.pago && f.dias >= 0` (incluye «vence hoy») |
| Pagado | `f.pago` |

- Multi-selección **exclusiva** entre estos cinco (un solo activo a la vez; «Todos» vuelve al estado inicial). `aria-pressed` y `.activo` se actualizan juntos.
- Si el filtro deja la lista vacía: `<p class="pv-vacio">Ningún cobro con este filtro</p>` (usa la clase existente, no un estado nuevo). Con «Todos» y sin filas, el texto actual «Todavía no hay pagos registrados» se conserva.

### 3.2 Orden (B6)

Un segundo grupo, al lado del de filtros, con los dos criterios pedidos, reutilizando el mismo `.f-chip` y `aria-pressed`:

```html
<div class="filtros" id="orden-cobros" role="group" aria-label="Ordenar cobros">
  <button class="f-chip activo" data-co="vencimiento" type="button" aria-pressed="true">Vencimiento</button>
  <button class="f-chip" data-co="alumno" type="button" aria-pressed="false">Alumno A→Z</button>
</div>
```

- **Vencimiento** (default): `f.pago` al final, luego `f.dias` ascendente (más vencido primero), desempate por `f.alumno.nombre.localeCompare(..., 'es')`. Es el orden natural de `r.filas`; no reordenar si ya viene así.
- **Alumno A→Z**: `localeCompare` por `f.alumno.nombre`, pagados incluidos en el mismo orden.
- Orden y filtro son independientes: cambiar uno no resetea el otro.
- Se puede mostrar un `<span class="inv-resumen">` (patrón `filtros.css`) con `Mostrando X de Y cobros` — `font-size:11.5px`, `--mut`, `tabular-nums`. Opcional pero recomendado para que se note que el filtro actuó.

### 3.3 Fila de cobro (B8, B9)

La fila actual (`pintarCobros`, `propuesta.ts:1813`) ya tiene alumno + monto; le falta que el **vencimiento se lea de un vistazo**. Reordenar a esta jerarquía, manteniendo el `<button class="cobro-fila">` y sus datos:

```html
<li>
  <button type="button" class="cobro-fila" data-fila="…" aria-haspopup="dialog"
    aria-label="Ver ficha de NAME, deuda $6.500, vence 21 may">
    <span class="cobro-row">
      <span class="al-nombre">Joaquín P.</span>
      <span class="cobro-meta"><span class="cobro-vence">Vence 21 may</span> · Martes A</span>
    </span>
    <span class="cobro-importe"><b>$6.500</b><small>Debe</small></span>
    <svg class="ico" width="13" height="13" aria-hidden="true"><use href="#i-der"/></svg>
  </button>
</li>
```

**Reglas de contenido:**
- `al-nombre`: 13.5px/700, `--tinta`, ellipsis a 320 px (ya existe en `.cobro-fila`).
- `cobro-meta`: `textoVence(f.dias)` + `·` + `f.alumno.grupo`; 11px `--tinta-2`. Si pagó: `Pagado el <fecha>` en vez de vencimiento (mismo dato de hoy).
- `cobro-importe`: monto `15px/800` arriba; etiqueta «Debe» / «Pagado» abajo en 10.5px. Color: sin pagar `--tinta`, con pago `--verde`, vencido `--rosa`; en oscuro los `*-pastel` (ya documentado el patrón en `tokens.css`).
- Estado visual del vencimiento: chip compacto `cobro-vence` con el mismo fondo/tinta que `.cobros-aviso` (`--bg` / `--tinta-2`), `--rosa`+`--rosa-tinte` si `dias < 0`; `--ambar`+`--ambar-tinte` si `dias <= 7`. Esto hace visible «quién debe y cuándo paga» sin leer el detalle.
- **No** se cambia el monto por la palabra «Pagado» cuando hay pago: se muestra el importe pagado y la etiqueta «Pagado» (antes se perdía el número). Si se prefiere conservar el display actual, al menos el importe sigue accesible en el `aria-label`.

CSS nuevo:

```css
.cobro-fila .cobro-row { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.cobro-fila .cobro-meta { font-size:11px; color:var(--tinta-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cobro-fila .cobro-vence {
  display:inline-block; padding:2px 7px; border-radius:999px;
  background:var(--bg); color:var(--tinta-2); font-weight:700;
}
.cobro-fila .cobro-vence.vencido { background:var(--rosa-tinte); color:var(--rosa); }
.cobro-fila .cobro-vence.pronto { background:var(--ambar-tinte); color:var(--ambar); }
.cobro-importe { display:flex; flex-direction:column; align-items:flex-end; flex:none; line-height:1.15; }
.cobro-importe b { font-size:15px; font-weight:800; color:var(--tinta); font-variant-numeric:tabular-nums; }
.cobro-importe small { font-size:10.5px; font-weight:650; color:var(--tinta-2); }
.cobro-importe .pagado { color:var(--verde); }
[data-tema="oscuro"] .cobro-fila .cobro-vence.vencido { color:var(--rosa-pastel); }
[data-tema="oscuro"] .cobro-fila .cobro-vence.pronto { color:var(--ambar-pastel); }
[data-tema="oscuro"] .cobro-importe .pagado { color:var(--verde-pastel); }
@media (max-width:360px){ .cobro-importe b{font-size:14px} .cobro-meta{font-size:10.5px} }
```

### 3.4 Tap en cobro abre la ficha del alumno (B7)

**Cambio de comportamiento pedido por Nico.** Hoy `pintarCobros` llama a `abrirPago(...)`; debe llamar a `abrirFichaConCobro(...)` con la ficha vinculada por ID:

```ts
b.addEventListener('click', () => {
  const ficha = repo.listarAlumnos().find(a => a.id === fila.alumno.id) ?? null;
  abrirFichaConCobro(ficha, b);
});
```

- El ID estable ya existe en `FilaCobro.alumno.id` y en `AlumnoFicha.id`; **nunca** buscar por nombre.
- La ficha ya trae: cabecera con deuda/vencimiento (§2.1), el número de WhatsApp, los tres enlaces de acción y el botón «Registrar pago / Editar fecha del pago» (`data-editar-cobro`) que internamente llama a `abrirPago`. Es decir: **se mantiene todo el flujo de pago**, sólo se interpone la ficha, que es lo que pidió Nico.
- Si la ficha no existe (dato huérfano), abrir la ficha nueva con `null` sería engañoso: mostrar un `toast('No se encontró la ficha de esta alumna')` y no abrir nada.
- `origen` sigue siendo el botón `b`, para que el foco vuelva a la fila al cerrar (`abrirPago` ya lo hace con `origen.dataset.fila`).

### 3.5 Estados vacíos (criterio Fina)

| Situación | Texto | Estilo |
|---|---|---|
| Sin filas con el filtro activo | «Ningún cobro con este filtro» | `.pv-vacio`, centrado, `--tinta-2`, 13px, 24px de padding |
| Sin alumnos cargados | «Todavía no hay alumnos. Tocá «Nuevo alumno» para cargar el primero.» | texto actual, sin cambios |
| Sin deuda y con pagos | chip «Al día · último pago …» | `.chip-estado.al-dia`, `--verde-tinte`/`--verde` |
| Sin avisos de vencimiento | «No hay avisos de vencimientos.» | `.cobros-panel-nota`, visible (no se pliega en «?») |

> Ningún estado vacío usa acento rojo/ámbar: cuando no hay nada que alertar, la UI informa en neutro (ya aplicado en `#v-hoy .aviso.vacio`).

---

## 4. Sistema visual — FIJO (no negociable)

De `tokens.css` / `propuesta.css`, **sin cambios de valores**:

- **Paleta:** turquesa `--tq-600 #0E7C7B` (primario), `--tq-700 #0B6B6A`, `--tq-500 #15A5A2` (sólo bordes/decoración, nunca texto), `--tq-100 #D9F1EE`, `--tq-200 #CDEFEA`; neutros `--bg-crema`, `--tinta`, `--tinta-2`, `--linea`. Estados: rosa `#8E3552`, ámbar `#8A5A12`, verde `#2E6B4F` con sus tintes. Lila/azul de Agenda intactos.
- **Tipos:** `system-ui`, títulos 17–26px/800 con `letter-spacing:-.2px`; cuerpo 12–13.5px; auxiliares 10.5–12px; números `font-variant-numeric:tabular-nums`.
- **Espaciados:** 7–11px entre chips; 12px entre bloques; 16px márgenes de sección; radios `--r-chico 10px`, `--r-med 16px`, `--r-grande 24px`, `999px` para chips.
- **Movimiento:** 150 `--t-rapida`, 220 `--t-media`, 320 `--t-larga` ms, `--ease` (transición sobria); `prefers-reduced-motion` ya global en `tokens.css`.
- **Cero emoji.** Sólo SVG del sprite `icons.js` (nuevo `i-wa`) y el carácter «?» como texto en el botón de ayuda.
- **Claro/oscuro:**.reglas `[data-tema="oscuro"]` para cada color nuevo (incluidas arriba). Verificar AA: texto de ayuda 12px sobre `--bg` ≥ 4.5:1; número del chip ≥ 4.5:1; ícono de WhatsApp sobre `--tq-700` con `--bg-alt` ≥ 4.5:1.
- **320 y 390 px:** ancho máximo 390 (`.cel`), padding lateral 10 (`--margen-panel`); a 360 px los chips se achican (ver `@media (max-width:360px)` de arriba); la tira de filtros conserva `.pista-inicio`/`.pista-fin` para avisar de chips ocultos. Ningún texto se corta sin ellipsis; ningún botón baja de 44 px de área táctil.

---

## 5. Mapa de decisiones → implementación → verificación

| ID | Pedido | Dónde se implementa | Cómo se verifica (QA/Gino) |
|---|---|---|---|
| **A1** | Textos informativos → burbujas «?» | `.ayuda-btn` + 3 textos de §1.2 + otros paneles §1.3 | Los 3 textos no se ven al abrir; al tocar «?» aparecen; `aria-expanded` cambia; Escape cierra; lector de pantalla los anuncia |
| **A2** | Precios destacados | §2.1 chip `.chip-deuda` + §2.2 importes | Deuda `$6.500` en negrita 13.5–16px tabular en la ficha y en la fila |
| **A3** | WhatsApp con ícono SVG estilo `.btn-wa` | `i-wa` en `icons.js` + `.ficha-accion-wa` §2.3 | Botón turquesa con ícono, sin emoji; href `wa.me` con el número real; `target=_blank rel=noopener` |
| **A4** | Alumno + deuda + vencimiento visibles desde la tarjeta | `.ficha-cabecera` + `.ficha-chips` §2.1 | Al abrir la ficha, nombre, deuda y fecha de vencimiento en chips, sin desplazarse |
| **A5** | Conservar funcionalidad y accesibilidad | §2.4 | `role=dialog`, `aria-modal`, `aria-labelledby`, focus trap, cierre/escape; 184/184 tests en verde |
| **B6** | Filtros + orden en Cobros | §3.1 y §3.2 | 5 chips + 2 de orden; contadores correctos; orden A→Z y por vencimiento; `aria-pressed` |
| **B7** | Tap en cobro abre ficha del alumno | §3.4 | Al tocar una fila se abre la ficha con los datos de esa alumna (ID), no el diálogo de pago directo; desde ahí se registra/edita el pago |
| **B8** | Ver de entrada quién debe | §3.1 + §3.3 | En `Cobros` se leen nombre, monto y vencimiento por fila; el filtro «Deben» funciona |
| **B9** | Estética profesional e intuitiva | §2, §3, §4 | Claro/oscuro, 320/390 px, sin emoji, AA, animaciones 150–320 ms |

### Funcionalidad que NO se toca (checklist de no regresión)

- Cálculo de vencimiento: mismo día del mes siguiente, clamp al último día (memoria del 22-nov; `src/cobros.ts`).
- Registro / corrección / anulación de pagos con ID estable y vínculo por `alumnoId`.
- Avisos de campana, KPIs, historial, alta/edición de alumnos, agenda, semanas, cancelaciones.
- `wa.me` con mensaje precargado y prefijo móvil (`src/whatsapp.ts`, `src/contacto.ts`).
- Focus trap y cierre con aviso de cambios sin guardar.
- Sello `?v=` en los imports al publicar (Roma lo hace; no transpilador genérico).

---

## 6. Archivos a tocar (para Reina — referencia, NO los toqué yo)

- `v5-diseno/index.html`: tira de filtros/orden en `#v-cobros`.
- `v5-diseno/propuesta.ts`: `abrirFichaConCobro` (§1.2/§2), `abrirFicha` (§1.2/§2.1), `pintarCobros` (§3.3/§3.4), campana/historial/pago/cancelación (§1.3), cableado de filtros/orden (§3.1/§3.2).
- `v5-diseno/propuesta.css`: bloques nuevos de §1.1, §2.1, §2.3, §3.3 (al final del archivo; no alterar reglas existentes).
- `v5-diseno/icons.js`: agregar `wa` al sprite.
- **NO tocar:** `src/cobros.ts`, `src/sheets.ts`, `tokens.css`, `am.js`, `docs/evidencia/cobros-rediseno/`, `docs/qa/romper-pulir-20261123-tarde/`.

> Publicación, commit, push y verificación del vivo: Roma, con visto de Gino. Yo no commiteé ni publiqué nada.
