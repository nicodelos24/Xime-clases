# Handoff UX · ENC-06

**Fecha:** 15/11/2026. **Base leída:** `2c6ed6d8a6de8d8ac109ce16cdb9e283d0b4aa9b`, ENC-01, ENC-02 y PLAN §8.1. Prototipo documental/navegable separado del código productivo. Cambios exclusivos en esta carpeta, más los tres avisos de buzón exigidos. Sin commit/push. No habilita SQL, app ni publicación.

## Interacciones que se pueden observar

- Cinco destinos persistentes, acción + Pago visible sin flotar sobre listas, filas con nombres y estado textual/ícono/color. Los destinos conservan contexto del alumno por hash; Volver y navegación de Chrome funcionan dentro de los recorridos de la sesión.
- Alta y cobro son pantallas completas en vez de una hoja baja: mantienen los contenidos de ENC-01/ENC-02 y evitan ocultar campos/Confirmar con formularios largos en 360 px. No agrega pasos. Dialog nativo se reserva para feedback contextual/límites; Escape cierra, foco contenido en el modal y retorno al botón por comportamiento de Chrome.
- Alta no cobra. La presencia de clase suelta ofrece cobrar o cerrar conservando deuda. Cobro simulado exige medio, permite cambiar monto completo con motivo; no genera parciales. No muestra éxito hasta terminar la pausa de simulación.
- Borradores solo en memoria: escenario de error/sin conexión o salir y volver dentro de la sesión conserva campos. Reiniciar/recargar los elimina. No es persistencia ni manejo de datos productivos.
- Seis estados de mensualidad disponibles entre fixtures y recorridos: Vigente, Por vencer, Vence hoy, Vencida, Pagada sin iniciar, Sin mensualidad. Último día y renovación separados. Fecha fija, sin cálculo de calendario ni pruebas de ancla aquí.
- Inicio pendiente hasta primera asistencia real del escenario; se usa 15/11–14/12 → 15/12 como salida fija. Si se cobra estando presente hoy, el fixture inicia hoy. La presencia no simula iniciar por un horario previsto.
- Renovación de Ana conserva ciclo actual y muestra siguiente pago por separado. Un segundo cobro anticipado no está disponible. Cambio normal a clase suelta conserva **toda** la cobertura pagada, incluido ciclo anticipado de la sesión. Deudas históricas por clase no se condonan al contratar mensualidad.
- WhatsApp deja editar texto, pero solo informa la apertura simulada: no número, wa.me real, envío, constancia de entrega ni supresión de push. No confundir este resultado con prueba del enlace de producción.
- Vacío/carga/error/sin conexión se activan desde controles de facilitación. Carga/error son estados manuales, no latencia ni falla de una API. Cobros y presencia se deshabilitan en offline simulado; no cola ni confirmación optimista.

## Q2/Q3: sin comportamiento financiero inventado

**Q2:** la corrección de presencia registrada y la cancelación de clase muestran un aviso, sin mutación. El prototipo simplifica también la corrección de una presencia sin pago: no es una prohibición de producto. Debe diseñarse el resumen de ajuste auditado cuando la clienta defina el impacto.

**Q3:** Terminar mensualidad hoy abre el aviso de política pendiente; no hay formulario que prometa fecha efectiva ni resultado de corte. Motivo/no devolución automática siguen definidos en el plan, pero este recorrido no los ejecuta.

## Para Reina: no reutilizar como lógica

La interfaz usa HTML/CSS/JS simple para observación, **no** el stack Expo ni un backend. Los IDs, importes, tiempos y fechas son fixtures. Reutilizable: jerarquía de información, copy, orden de campos y estados; tokens son los de Vito. No copiar funciones de mutación de memoria a Pagos/Asistencia ni interpretarlas como autorización, unicidad, idempotencia, transacción o auditoría.

Anulaciones solo se explican como información, no se ejecutan; tampoco están configurador de tarifas, fecha manual, horario, reportes, exportación, login o notificaciones. Volver a PLAN y dominio para implementarlos después de la fase de diseño y de las decisiones correspondientes.

## Revisión realizada por Fina

Chrome real por herramientas **MCP Kaia Chrome**, con pestaña propia aislada. Recorrido sintético automatizado de 28 comprobaciones; capturas inspeccionadas en claro/oscuro; comprobación de desborde horizontal en 320, 360 y 390 px en las vistas consignadas. Detalle y errores encontrados/corregidos en `evidencia/RESULTADOS.md`.

No es QA independiente de Gino ni aprobación de Ada/Nico. Vito sigue siendo responsable de la propuesta visual; no se modificaron sus archivos ni sus tokens.

## Sigue pendiente de validación presencial/real

| Tema | Evidencia que falta | Responsable siguiente |
|---|---|---|
| Facilidad de operación | Una dueña hace alta, asistencia y cobro sin ayuda; errores y tiempos observados con guion | Ada coordina; Fina observa y ajusta |
| Estética y vocabulario | Juicio de la clienta y aprobación estética de Nico | Ada / Nico, con Vito |
| Q2 y Q3 | Política explícita de ajuste y corte, antes de diseñar confirmación de resultado | Ada con Nico/clienta |
| Teléfono físico | Teclado virtual, safe area, toque real, orientación y vuelta desde otras apps | Fina; luego Gino sobre producto |
| Accesibilidad completa | Texto nativo ampliado al 200 %, VoiceOver/TalkBack, zoom, foco y contraste sobre combinaciones finales | Fina / Vito; luego Gino |
| Concurrencia/red/persistencia | Reintentos reales, resultado incierto, dos dueños, servidor autoritativo, auditoría e idempotencia | Reina / Gino / Emma en fase autorizada |
| Canales externos | Permisos push, wa.me real, dispositivos y ausencia de falsos «enviado» | Reina / Gino en fase autorizada |

**No se entrevistó ni observó una usuaria en esta entrega.** No marcar como superada la salida de diseño de PLAN §6 ni la fase de datos por el resultado del callback de diseño.
