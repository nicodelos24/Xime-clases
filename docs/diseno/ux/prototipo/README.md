# Demo de Agenda y Alumnos · ENC-08R

**15/11/2026 · Fina.** Candidato local de diseño con datos inventados, sin app/BD ni publicación. Continúa ENC-08 tras una falla de conexión del motor y adapta ENC-06/07 a la [decisión de Nico](../../../DECISION-AGENDA-ALUMNOS.md). **No se hizo prueba con una dueña ni se declara aprobación de usuaria.**

## Abrir y explorar

Desde la raíz del repo:

```bash
python3 -m http.server 8783 --bind 127.0.0.1 --directory docs/diseno
```

Abrir **http://127.0.0.1:8783/ux/prototipo/index.html#hoy**. Servir por HTTP, no abrir `file://`: los módulos y SVG locales lo requieren. Puerto de revisión dedicado a Fina; si está ocupado, usar otro y ajustar los callbacks. No es servicio instalado, despliegue ni enlace público. La publicación la revisa/realiza Ada por separado.

- Tamaño recomendado **360×780**; comprobaciones en 320/360/390 y claro/oscuro. Contenedor hasta 440 px en escritorio.
- Barra con cinco destinos: **Hoy / Alumnos / Agenda / Cobros / Más**. Semana es la primera vista de Agenda; Mes permite elegir fecha y ver detalle. A 320 px/texto ampliado, lista de días alternativa con detalle seleccionado primero.
- **Recargar reinicia todo.** Aviso visible arriba y pie: sin guardado real. No localStorage, API, base de datos, autenticación ni sincronización. No ingresar datos personales reales.
- Fecha fija **15/11/2026, America/Montevideo**; fechas/horas presentadas en es-UY/24 h. Importes inventados: mensualidad $ 1.800 UYU, clase $ 250 UYU. No son tarifas de la clienta.
- «Pruebas» abre temas, carga, vacío, error global/parcial, offline simulado, cancelada de ejemplo, texto ampliado y reinicio. No es menú necesario para usar la demo.

## Recorridos actuales

| Entrada | Comportamiento observable |
|---|---|
| Agenda → día | Ver horarios y **quién viene**; no marcar presencia ni cobrar por consultar |
| Día → Agendar alumno | Buscar ficha existente, filtrar modalidad y elegir horario; confirmar solo reserva de sesión |
| Día sin clase → Agendar | Pedir hora explícita para esa fecha; no asumir duración, cupo ni recurrencia |
| Agendar → Crear ficha nueva | Misma alta de Alumnos → vuelve al selector; todavía hay que confirmar programación |
| Ver programación → Retirar | Confirmación: retira esa relación, conserva ficha, hechos e historial financiero |
| Alumno que vuelve | Misma ficha aunque tenga alta antigua; individuales salteados sin crear otra persona |
| Alumnos | Filtros Todos / Mensuales / Por clase individual; orden Más recientes por **alta** / Mensuales primero / Por clase individual primero; búsqueda combinable |
| Vencimientos del día → ficha | Último día cubierto y próxima renovación separados; evento histórico no prueba deuda actual |
| Ficha / Hoy → Registrar clase realizada | Recorrido secundario heredado, puntual y de prueba; **no lista escolar obligatoria**. Ruta `#asistencia` conservada |
| Cobro heredado | Monto entero, motivo si cambia, medio → registro simulado; doble toque protegido solo en memoria |
| Mensualidad pagada antes de clase efectiva | Pagada, sin iniciar. Agendar no inicia; fecha manual no se ejecuta en esta demo |
| Ficha → WhatsApp | Pictograma genérico (no logo oficial), mensaje editable, apertura solo simulada; sin número/enlace real/envío |
| Más / Ver horario | Límite visible: no editor general de horario, tarifas, reportes ni cuentas reales |

**Alumno ≠ programación ≠ clase realizada ≠ pago.** Los eventos contienen referencias a la ficha, no copias de alumnos. Los hechos efectivos se separan por ocurrencia. Si un mensual no viene, Agenda no prorroga ni cobra extra. Clase individual se cobra por clase efectivamente realizada, nunca por reservar. Los hechos/cobros heredados solo tienen fixture operativo del 15/11; fechas futuras no reutilizan su estado ni permiten marcar realizaciones.

## Qué no hace

- Q2/Q3 siguen explicativos: sin corrección cobrada, reintegro/reimputación, cancelación económica ni corte anticipado.
- Sin recurrencias automáticas, cupos/lista de espera, profesores, grupos, tutor, recuperos, portal del alumno, canales reales, pagos online, anulaciones ejecutables, servidor o BD.
- No generalizar el JS financiero de ENC-06: fechas/resultados son fijos. No prueba dinero real, idempotencia transaccional, auditoría, permisos, conservación durable ni múltiples dueños.
- Offline/carga/error son controles de diseño, no cache, latencia o sincronización real. Las mutaciones no se encolan.
- Texto ampliado 200 % es una simulación CSS de facilitación; no reemplaza font scale del SO, teléfono físico ni lector de pantalla.

## Módulos

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Shell, aviso de demo, controles de facilitación |
| `datos-demo.js` | Fichas/fechas/ocurrencias sintéticas y vencimientos ya fechados |
| `programacion.js` | Relaciones alumno–ocurrencia, anti-duplicado, retiro y hechos efectivos por clave compuesta |
| `agenda.js` / `agenda.css` | Presentación Semana/Mes/detalle, aritmética de calendario **no financiera**, responsive y movimiento |
| `alumnos.js` | Filtros/orden por alta, selector canónico y detalle de programación |
| `iconografia.js` / `presentacion.js` | SVG locales de Vito, estados, botones y ayudas; no emojis ni dependencia externa |
| `prototipo.js` / `prototipo.css` | Router/contexto y recorridos ENC-06 preservados; no lógica productiva |

Tokens/estilos base se importan sin modificar de `../../visual/`. Se usan los seis SVG ENC-07B y filtro/orden ENC-09. Transiciones 160 ms de opacity/transform y reduced-motion efectivo, sin librerías.

## Pruebas y handoff

- [Especificación UX actual](../agenda.md) y [HANDOFF.md](HANDOFF.md).
- `prueba-agenda.js`: AG-01–15 conciliados, PG/AL, matriz de 36 combinaciones de pantalla/ancho/tema y movimiento.
- `prueba-navegacion.js`: los **28 checks ENC-06**, con etiquetas nuevas Clase realizada / Por clase individual y acceso por Hoy/ficha en lugar de pestaña Asistencia.
- `prueba-accesibilidad.js`: pares de contraste renderizados, objetivos, texto ampliado 320/360/390 en ambos temas, foco/última acción/fechas inválidas.
- Todos son callbacks **MCP Kaia Chrome**, no pruebas Node, E2E de producción ni QA independiente. Deben localizar su pestaña por `:8783`, nunca asumir la actual. El callback Agenda desactiva caché HTTP de su origen de prueba para no medir módulos anteriores.
- [Evidencia ENC-08R](evidencia/ENC-08R.md), manifiesto SHA-256 y capturas `evidencia/enc08r-*`. [Resultados ENC-06](evidencia/RESULTADOS.md) y su manifiesto/capturas se conservan como historia, no evidencia del candidato nuevo.
- [Guion histórico](guion-sesion.md): preparado para ENC-06, **no ejecutado**. Para la futura sesión se deben usar las tareas actuales de agenda/retorno/filtros del handoff, no imponer pasar lista.

Ada revisa e integra; Gino verifica independientemente el mismo candidato. Sin commit/push/publicación de Fina; Expo/Supabase y validación con usuaria quedan fuera de esta entrega.
