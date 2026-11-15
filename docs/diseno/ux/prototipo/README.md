# ENC-06 · Prototipo móvil navegable

**Fina · 15/11/2026 · diseño para observar recorridos, no aplicación de gestión.** Basado en ENC-01 y ENC-02 de Vito integrados en `2c6ed6d8a6de8d8ac109ce16cdb9e283d0b4aa9b`. Sin commit ni push de esta entrega.

## Abrir

Desde la raíz del repositorio, servir solo la carpeta de diseño:

```bash
python3 -m http.server 8768 --bind 127.0.0.1 --directory docs/diseno
```

Abrir **http://127.0.0.1:8768/ux/prototipo/index.html#hoy** en Chrome. Si el puerto está ocupado, usar otro y ajustar la URL; el callback de verificación usa 8768. El servidor de revisión fue levantado temporalmente para esta entrega, no es un servicio instalado ni una publicación. No expone el repo completo ni permite conexión de otro dispositivo.

- Vista recomendada: **360×780**; también se recorrió a 320 px y 390×844. El contenedor crece hasta 440 px en escritorio.
- Arrancá en Hoy, sin abrir «Pruebas» cuando observes a la dueña.
- «Pruebas» permite alternar tema y estados vacío/cargando/error/sin conexión, y reiniciar. Cambiar escenario no guarda datos reales; los formularios conservan borrador en memoria al recuperarse.
- **Recargar reinicia todo.** No hay localStorage, base de datos, cuentas reales ni sincronización entre pestañas. No ingresar nombres/teléfonos reales.
- Fecha fija **15/11/2026 · America/Montevideo**. Tarifas de **ejemplo**: mensualidad $ 1.800 UYU, clase $ 250 UYU. No son precios confirmados ni configuración de producción.

## Recorridos disponibles

| Entrada | Qué permite explorar |
|---|---|
| Hoy → Por vencer → Ana | Ficha con inicio, vencimiento y renovación; renovación continua; WhatsApp editable |
| Alumnos → + Alumno | Alta ficticia por mensualidad o clase suelta → ficha (guardar no cobra) |
| Ficha → Ver asistencia | Presente/ausente; propuesta de cobro; presencia de clase suelta sin cobrar deja deuda |
| Cobrar desde asistencia/ficha/+ Pago | Monto de ejemplo, cambio con motivo, medio, revisión → registro **simulado** → ficha/lista |
| Nuevo mensual → cobrar → asistencia | Pagada, sin iniciar → primera presencia; fechas fijas del fixture 15/11–14/12, renueva 15/12 |
| Clase suelta → mensualidad | Clases adeudadas anteriores permanecen; si está asistiendo hoy, el fixture inicia hoy |
| Ana → cambiar modalidad | Preserva cobertura pagada. Si se renovó en la sesión, incluye también ese ciclo futuro; no borra pagos |
| Cobros | Listas filtradas de vencidas, por vencer, clases adeudadas e historial de la sesión |
| Más / acciones sensibles | Explicación de límites y de Q2/Q3, sin ejecutar esos bordes |
| Pruebas | Vacío, carga, error con reintento, sin conexión; ambos temas |

**No automatizar como reglas:** el JS contiene salidas fijas de casos de diseño, no cálculos de meses, anclas, zona horaria ni precios productivos. Las pausas de 550 ms imitan una espera para observar feedback; no hay servidor de pagos. La protección del doble toque existe solo dentro de la sesión del prototipo, **no prueba idempotencia transaccional**.

## Políticas pendientes y funciones no incluidas

- **Q2:** corregir una presencia cobrada o cancelar clase abre explicación de política pendiente; no ajusta dinero, deuda ni inicio de ciclo. Para mantener alcance reducido, la demo tampoco ejecuta correcciones de presencias ya registradas: las informa; no es una regla nueva del producto.
- **Q3:** «Terminar mensualidad hoy» informa pendiente; no propone fecha efectiva ni corta cobertura.
- Q1/Q4/Q5 siguen la conciliación de **PLAN §8.1**, posterior al README original de ENC-01: inicio con asistencia real (no por horario), deuda histórica no se condona y no se ofrece segunda renovación anticipada.
- Sin tutor, grupos, roles adicionales, envío WhatsApp, push, pagos online, offline real, anulaciones ejecutables, editor de horario, precios configurables, CSV, autenticación ni backend. «Más» lo declara; no aparenta que esas pantallas existen.
- Para una beca total, montos negativos o fechas arbitrarias no hay fixture: la demo acepta solo enteros positivos; esto **no fija** la política del dominio.

## Archivos y handoff

- `index.html`, `prototipo.css`, `prototipo.js`: fuente del prototipo; importa **sin modificar** `../../visual/tokens.css` y `../../visual/ui.css`.
- [guion-sesion.md](guion-sesion.md): sesión breve con una dueña, tareas sin indicar botones, métricas y consentimiento.
- [HANDOFF.md](HANDOFF.md): decisiones de interacción, alcance para Reina y validación todavía pendiente.
- `prueba-navegacion.js`: callback Playwright ejecutado por **MCP Kaia Chrome**, sin dependencias de app. No es un test de Node ni un script para pegar en una consola de un sitio externo.
- [evidencia/RESULTADOS.md](evidencia/RESULTADOS.md): comandos, resultados y límites de la revisión de Fina.
- `evidencia/*.png`: capturas actuales con fixtures. `resumen.png` compone tres vistas sin alterar el contenido de las capturas.

**Estado real:** prototipo recorrido por Fina mediante Chrome real. **No se realizó sesión con usuaria**, no se certificó accesibilidad, no hay validación presencial ni aprobación estética de Nico. ENC-06 prepara esa sesión; no cierra la salida de diseño de PLAN §6.
