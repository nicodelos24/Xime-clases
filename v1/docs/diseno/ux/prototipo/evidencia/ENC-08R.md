# ENC-08R · Evidencia de cierre de Fina

**15/11/2026 · revisión propia de demo de diseño, no QA independiente ni validación con usuaria.**

## Candidato y entorno

- HEAD al cierre: **`4388754bfd4591a1f576a003f2f3955d330a3d3a`**, rama `master`. El candidato contiene cambios sin commit; identificar por **[manifest-enc08r.json](manifest-enc08r.json)**, no por HEAD solo. Sin commit/push/publicación de Fina.
- La sesión comenzó sobre `0cfd74eb40203e8021598c205fc74bce8e19faf6` con archivos parciales ENC-08. Se preservaron los cambios ajenos, `.apc/`, visual y fuentes de Ada. App/dominio/SQL no fueron modificados.
- Chrome real **157.0.8103.38**, solo herramientas **MCP Kaia Chrome**. Contexto propio de cierre `fina-enc08r-cierre`; se conservó la pestaña ajena. El contexto anterior ya no existía al recuperar la sesión.
- Origen **http://127.0.0.1:8783**, servidor temporal `python3 -m http.server 8783 --bind 127.0.0.1 --directory docs/diseno`. Solo loopback, sin repo completo ni backend. El servidor anterior venció; se levantó otro temporal para terminar. No es servicio instalado ni prueba de URL pública.
- Viewports CSS 320×780, 360×780, 390×780/844; no hardware ni emulación de sistema operativo. Fecha de negocio fija 15/11/2026, America/Montevideo. Todos los nombres/datos son sintéticos.

## Resultado final: 132 comprobaciones PASS

| Callback | Resultado bruto | Fin UTC | Resultado |
|---|---|---|---|
| `prueba-agenda.js` | [enc08r-prueba-agenda.json](enc08r-prueba-agenda.json) | 2026-11-15T08:43:16.864Z | **86 PASS**, errores `[]`, advertencias `[]`, HTTP fallidos `[]`, solicitudes externas `[]` |
| `prueba-navegacion.js` | [enc08r-prueba-navegacion.json](enc08r-prueba-navegacion.json) | 2026-11-15T08:44:51.262Z | **28 PASS**, errores `[]` |
| `prueba-accesibilidad.js` | [enc08r-prueba-accesibilidad.json](enc08r-prueba-accesibilidad.json) | 2026-11-15T08:44:55.638Z | **18 PASS**, pares de contraste y límites en JSON |

Las horas son UTC; equivalen a 05:43–05:44 de Montevideo. Los JSON se descargaron desde la propia pestaña por MCP inmediatamente al concluir cada callback, sin transcripción manual de los resultados. La revisión de cierre no cambió pantallas: completó las comprobaciones del candidato tras los últimos avisos de programación y arregló únicamente carreras comprobadas de los callbacks.

### Agenda, programación y Alumnos

- AG-01–15 conciliados con decisión nueva: cinco destinos, Semana/Mes, seis filas de noviembre, cruce de año, selección, detalle, fechas y vencimientos separados, vacío, errores parciales, carga, offline y límites de horario.
- **AG-02R/07R/08R no son los recorridos escolares anteriores.** Ver programación no registra clase realizada. Futura no reutiliza los hechos de hoy. Cancelada no ofrece acciones de reserva/cobro en esa ocurrencia. Registro efectivo secundario y Q2/Q3 se cubren con la regresión.
- PG-01–09: mensual antiguo que vuelve con la misma ficha; no recurrencias; retiro conserva ficha y contexto; individual en días salteados; anti-duplicado alumno–ocurrencia; alta canónica desde día; hora explícita en día sin clase; reservar no genera deuda/inicio; mensual que no vino conserva ciclo sin extra.
- AL-01–08: fecha de alta mezclando modalidades, filtro mensual/individual, orden por grupos, búsqueda combinada, ID estable como desempate, nueva alta más reciente y cantidad de fichas sin duplicación por programación.
- Retorno a Mes/fecha/vencimientos expandidos y foco del disparador verificados. Teclado llega a control de rango y selecciona fecha con Enter. Reduced-motion anula animación.
- Matriz de **36 combinaciones**: seis pantallas (Mes, Semana, Alumnos, Agendar, WhatsApp simulado, Clase realizada) × tres anchos × dos temas; sin overflow horizontal. No se afirma revisión exhaustiva de todos los formularios al 200 %.

### Regresión ENC-06

Se conservan los 28 escenarios: alta sin pago/deuda; offline conserva borrador; cobro simulado y doble toque; deuda de clase efectiva; mensualidad pagada sin iniciar, primera clase efectiva, contratación mientras está asistiendo; deuda histórica al cambiar modalidad; renovación continua y cobertura pagada; Q2/Q3/Q5 explicativos; WhatsApp editable sin envío; búsqueda/estados/temas y layouts básicos.

Cambios del guion respecto de ENC-06: la entrada Asistencia pasó a **Hoy/ficha → Registrar clase realizada**, etiquetas Presente se vuelven Clase realizada y el radio Clase suelta se presenta como Por clase individual. No se borraron escenarios económicos para hacer pasar la adaptación. No son pruebas de dominio, transacciones, ancla o cobro real.

### Accesibilidad focal

Doce pares concretos de texto/fondo calculados sobre CSS renderizado: título, ayuda, botón principal, fecha seleccionada, destino activo y aviso de sesión en ambos temas. Todos ≥4,5:1; mínimo observado **6,39:1**. Botón principal: 8,04:1 claro / 8,52:1 oscuro. Datos completos RGB/ratios en el JSON.

Controles visibles de Agenda ≥44 px en 320/360/390 y ambos temas; texto ampliado CSS 200 % sin overflow en esos seis pares; SVG decorativos ocultos a AT; última acción fuera de la barra fija; fecha inválida y hash mal codificado recuperables. Esto **no certifica WCAG**, todo el contraste, zoom, texto nativo del SO ni lector de pantalla.

## Fallas encontradas y resueltas, sin ocultar intentos

1. **Candidato parcial:** Vito vio `agenda.css` 404 antes de existir el archivo. El CSS quedó completado en ENC-08R; la carga final del candidato devuelve 200 y no hay HTTP fallidos. La captura parcial de Vito no se usa como evidencia final.
2. **Programación en día sin clase:** el lookup con ID nulo caía en la clase de hoy y ubicaba mal la reserva. Se corrigió separando ID explícito de nueva ocurrencia. PG-07 verifica el 18/11 a las 19:30, no la clase del 15/11. No se duplicó implementación.
3. **Objetivo Hoy:** el control central del periodo medía 42,95 px de ancho. Se fijó mínimo 48 px con especificidad correcta; AA-02 final pasa en los seis pares ancho/tema.
4. **Caché de módulo anterior:** un primer reintento seguía usando JS viejo. El callback Agenda enruta su propio origen de prueba, desactivando caché HTTP; se comprobó fuente actual antes de seguir.
5. **Harness al cierre:** `goto` seguido de `reload` antes de terminar los SVG produjo `net::ERR_ABORTED`, no 404 ni defecto de producto. Se espera el título que aparece tras terminar la inicialización antes de recargar. Dos aserciones de la regresión corrieron antes del `hashchange` (renovación y Pagada sin iniciar); se espera render/frames y el dato correspondiente. El DOM observado ya mostraba los valores correctos. No se cambió lógica ni contenido para resolver estas carreras.
6. **Lectura de callback por filename:** MCP rechazó una ruta del repo fuera de sus raíces permitidas. Se usó el callback propio servido por el origen local y ejecutado por `browser_run_code_unsafe`; no se abrió otro navegador ni se eludió login/acceso. Los archivos descargados contienen solo resultados sintéticos.

**Fallas funcionales conocidas pendientes dentro del alcance pedido: ninguna observada.** Esto informa la revisión propia, no reemplaza el dictamen independiente de Gino.

## Capturas actuales

| Archivo | Qué muestra |
|---|---|
| `enc08r-resumen.png` | Contacto de tres capturas viewport sin recorte ni reescalado del contenido: día, agendar y Alumnos oscuro |
| `enc08r-mes-360-claro.png` / `enc08r-mes-360-oscuro.png` | Mes completo con tabla, selección, personas y estados en ambos temas |
| `enc08r-agenda-320-lineal.png` | Alternativa lineal a 320 con detalle seleccionado primero |
| `enc08r-texto200-360.png` | Texto ampliado CSS, detalle primero y navegación refluida |
| `enc08r-alumnos-390.png` | Lista, filtros/orden y alta ficticia creada durante el callback |
| `enc08r-mes-390-viewport.png` | Calendario en viewport de 390×844, sin ocultar que la página continúa |
| `enc08r-dia-390-viewport.png` | Día 15, Ana/Rosa programadas, detalle y acción Agendar; no presencia |
| `enc08r-agendar-360-viewport.png` | Selector canónico en oscuro a 360×780, captura tras finalizar transición |
| `enc08r-alumnos-360-oscuro-viewport.png` | Filtros/orden visibles en oscuro a 360×780 |

Las capturas full-page pueden mostrar la barra fija en el punto del viewport donde se hizo la captura; no son un teléfono largo ni prueba de hardware. Las viewport muestran la relación real con la barra. Se inspeccionaron imágenes de ambos temas, formulario y alternativa estrecha; la captura de formulario se repitió tras 220 ms para no documentar una transición a mitad de opacidad.

## Reproducir

Iniciar el servidor del README. Crear/usar **una pestaña propia MCP Kaia** cuyo URL incluya `:8783/`; cada callback busca esa página en su contexto, no asume la pestaña ajena. Ejecutar desde `browser_run_code_unsafe` el callback de los tres archivos (son funciones, no scripts Node). Si el parámetro filename no admite la ruta del repo, leer la fuente por `page.request.get` al origen local propio y ejecutar esa función revisada. La regresión espera dos frames tras clicks de su helper para no medir la pantalla anterior al hash. No pegar estos callbacks en sitios de terceros.

`git diff --check` pasa. La verificación de archivos productivos `git diff --name-only 4388754 -- apps packages src app supabase` no mostró cambios. El manifiesto incluye hashes de fuente, dependencias visuales, pruebas, documentos y evidencia; no se hash-ea a sí mismo.

## Límites y siguiente responsable

No se hizo sesión con una dueña, teléfono físico, teclado virtual, lector de pantalla, texto nativo, concurrencia, BD, autorización, persistencia tras recarga, API, WhatsApp/push real ni URL pública. Recargar elimina alumnos/programaciones de demo y lo dice en pantalla. Las reglas/fechas financieras de ENC-06 siguen siendo fixtures del 15/11; fecha manual y políticas Q2/Q3 no se ejecutan.

**Ada revisa estructura y concilia; Gino verifica independientemente este candidato/manifiesto.** Integración/publicación y aviso a Nico para iniciar Reina externa son posteriores y no hechos por Fina. No se declara aprobación estética, validación de usuaria ni salida de diseño cerrada.
