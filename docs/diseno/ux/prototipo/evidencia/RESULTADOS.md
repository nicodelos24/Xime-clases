# ENC-06 · Evidencia de revisión de Fina

**15/11/2026 · prueba de diseño, no QA independiente ni validación con usuarias.**

## Candidato y entorno

- Base de trabajo: `2c6ed6d8a6de8d8ac109ce16cdb9e283d0b4aa9b` (ENC-02 integrada). Entrega sin commit/push; hashes del candidato en `manifest.json`.
- Chrome real **157.0.8103.38**, pestaña propia del contexto `fina-enc06`, operada solo mediante herramientas **MCP Kaia Chrome**. Se preservó la pestaña de Vito y el resto del trabajo ajeno.
- Servidor estático local en `127.0.0.1:8768`, raíz `docs/diseno`; sin backend, servicio publicado ni procesamiento de dinero.
- 360×780 en recorrido principal y capturas. Comprobaciones de reflow en 320×780 y 390×844: ancho CSS del viewport, no teléfono físico ni emulación de SO.

## Ejecución final

Callback [`../prueba-navegacion.js`](../prueba-navegacion.js), ejecutado desde `mcp_kaia_browse-kaia_chrome_browser_run_code_unsafe`. Resultado final a **2026-11-15T04:53:32.991Z**: **PASS, 28 comprobaciones, errores JS/consola: []**.

| # | Comprobación que pasó |
|---|---|
| 1 | Alta clase suelta no crea pago ni deuda |
| 2 | Offline simulado deshabilita Confirmar |
| 3 | Conserva monto y motivo al pasar offline |
| 4 | Restablecer conserva medio |
| 5 | Registro simulado muestra importe confirmado ($ 200 de ejemplo) |
| 6 | Cobro retira esa clase de la deuda |
| 7 | Doble toque no duplica registro **en memoria**, no prueba idempotencia servidor |
| 8 | Q2 muestra política pendiente |
| 9 | Q2 no cambia presencia cobrada |
| 10 | Mensualidad anterior a clase no inventa inicio |
| 11 | Pago anterior a asistencia queda Pagada, sin iniciar |
| 12 | Primera presencia cambia al fixture vigente 15/11–14/12 |
| 13 | Contratación mientras está asistiendo hoy usa fixture de hoy |
| 14 | Cambio a mensualidad conserva clase adeudada histórica (Q4 conciliada en PLAN §8.1) |
| 15 | Renovación continua muestra fechas del siguiente ciclo |
| 16 | No ofrece segundo cobro anticipado (Q5) |
| 17 | Q3 informa pendiente sin cortar cobertura |
| 18 | Cambio normal conserva cobertura, incluida renovación pagada en sesión |
| 19 | WhatsApp editable solo muestra apertura simulada, no contacto/envío real |
| 20 | Búsqueda sin resultados ofrece borrar búsqueda |
| 21 | Vacío tiene explicación y alta disponible |
| 22 | Cargando tiene salida de facilitación |
| 23 | Error permite reintentar |
| 24 | Tema oscuro usa ENC-02 |
| 25 | Lista sin desborde horizontal a 320 px |
| 26 | Asistencia sin desborde horizontal a 320 px |
| 27 | Hoy sin desborde horizontal a 390 px |
| 28 | Sin errores JS/consola durante ese recorrido completo |

**Comprobación adicional por MCP:** Atrás de Chrome regresa a Hoy; ningún control visible menor a 44×44 px en Hoy a 390 px; alta, cobro y modal Q3 sin desborde horizontal a 320 px. No es una auditoría de todos los controles ni de todos los estados.

**Consola guardada:** `enc06-consola.txt`: «Total messages: 0 (Errors: 0, Warnings: 0)». **Red:** `enc06-red.txt`: solo solicitudes GET locales a HTML/CSS/JS, respuestas 200/304; sin solicitudes de backend ni canales externos. El registro acumula las cargas de esta pestaña durante la sesión.

Comandos locales de fuente:

```text
node --check docs/diseno/ux/prototipo/prototipo.js           → exit 0
node --check docs/diseno/ux/prototipo/prueba-navegacion.js  → exit 0
git diff --check                                         → exit 0
```

## Encontrado y corregido antes del cierre

- Conservación de formularios al cambiar de escenario: se agregó borrador en memoria. Una prueba inicial usaba una pestaña sin recargar la fuente anterior; se reejecutó con recarga efectiva y el recorrido final verifica monto/motivo/medio.
- Faltaba la etiqueta de opción **Efectivo** en el select: el callback detectó que no era seleccionable; se corrigió y ambos medios se usaron en la corrida final.
- Ajusté el selector de prueba de chips para no comparar texto exacto mezclado con el ícono decorativo: no era un fallo del estado del alumno.
- Deuda de clase suelta ahora se conserva al pasar a mensualidad; el inicio al cobrar estando presente usa el fixture de hoy. El cambio a clase suelta respeta también el ciclo anticipado pagado.
- Corregí «1 presentes» por «1 presente» y eliminé la línea de foco del contenedor no interactivo. Se conservan indicadores de foco en controles.
- Añadí métrica de clases adeudadas en Hoy y separé el estilo del encabezado de la tarjeta Clases de hoy para evitar la hora pegada al contador. Verifiqué vista scrolleada de cobro: las fechas y Confirmar quedan visibles por encima de la barra inferior (botón y=497..545; barra desde y=705 en 360×780).

## Capturas inspeccionadas

Todas con fixtures, 360×780; cinco vistas originales sin recomposición de UI:

| Archivo | Qué muestra |
|---|---|
| `enc06-01-hoy-claro-360.png` | Hoy, métricas y comienzo de lista Por vencer; la lista continúa con scroll |
| `enc06-02-ficha-claro-360.png` | Ficha de Ana, inicio/último día/renovación separados |
| `enc06-03b-cobro-confirmar-360.png` | Cobro scrolleado: medio, nuevo ciclo y Confirmar sin quedar bajo la barra |
| `enc06-04-asistencia-oscuro-360.png` | Lucía presente, deuda y propuesta de cobro en oscuro |
| `enc06-05-q3-oscuro-360.png` | Modal de política pendiente Q3: no ofrece cortar ni confirmar dinero |
| `resumen.png` | Montaje rotulado de Hoy + cobro scrolleado + asistencia; imágenes originales sin alterar contenido |

## No comprobado / siguiente responsable

No hubo usuaria, entrevista, prueba presencial, teléfono Android/iPhone físico, teclado virtual, lector, texto 200 %, contraste integral, red cortada de verdad, push ni WhatsApp real. No existe backend ni persistencia, control de acceso, auditoría o cobro real a validar aquí. El callback no es QA del dominio, transacciones ni seguridad.

Q2/Q3 siguen sin política de la clienta; el prototipo los explica y no simula resolución. El guion está listo; **Ada coordina la sesión, Fina observa**. No queda superada la puerta de salida de diseño ni habilitada la siguiente fase por esta prueba sintética.
