# ENC-04 — Matriz independiente de fechas y cobros

**Fuente de expectativas:** `PLAN.md` §§3, 3.5, 3.6 y 6. Matriz redactada antes de inspeccionar `packages/dominio/`. Entradas expresadas como fechas locales de `America/Montevideo`; rangos de ciclo `[inicio, próximo inicio)`; montos en UYU enteros. No presupone una implementación concreta.

| ID | Entrada / acción | Resultado esperado | Regla PLAN |
|---|---|---|---|
| M01 | Pago 10/04; primera clase posterior 12/04 | Ciclo inicia 12/04; último día cubierto 11/05; aviso N=7 el 04/05 | §3.1.1, §3.4, §3.5 |
| M02 | Inicio 31/01/2027; proyectar hasta marzo | Inicios 31/01, 28/02 y 31/03; ciclos sin hueco conforme a regla del ancla | §3.1.7, §3.5 |
| M03 | Inicio 31/01/2028 (bisiesto) | Próximo inicio 29/02; último día cubierto 28/02; ciclo siguiente inicia 31/03 | §3.1.7, §3.5 |
| M04 | Inicio 31/01/2027; cuatro renovaciones continuas | Inicios 31/01, 28/02, 31/03, 30/04, 31/05; no se desplaza el ancla ni se pierde tiempo | §3.1.7, §3.5 |
| M05 | Inicio 29/02/2028; continuidad hasta marzo 2029 | Ancla 29; inicios 29/02/2028, 29/03/2028; febrero 2029 cae en 28/02 y vuelve a 29/03 | §3.1.7, §3.5 |
| M06 | Ciclo con último día 11/05; pago renovación 05/05 | Ciclo siguiente inicia 12/05, sin esperar clase | §3.1.3, §3.5 |
| M07 | Mismo ciclo; pago 20/05, después del vencimiento | Estado Pagada, sin iniciar; inicio en la próxima clase | §3.1.3, §3.5 |
| M08 | Mensualidad vencida/sin pagar; marcar asistencia | Se permite asistencia y se ofrecen cobrar mensualidad o clase suelta; no hay bloqueo | §3.1.4, §3.1.6 |
| M09 | Marcar presente en modalidad clase suelta; no completar cobro | Proponer cobro; si no se paga, registrar deuda visible en Cobros | §3.2.1, §3.5 |
| M10 | Alumno ausente o clase cancelada por instituto en modalidad suelta | No se genera cargo | §3.2.2 |
| M11 | Pago de clase suelta ya realizado; luego se contrata mensualidad | Pago anterior permanece; no hay reembolso automático | §3.2.3, §3.6 |
| M12 | Doble envío/toque de confirmación con la misma clave idempotente | Exactamente un pago registrado | §3.3, §3.5 |
| M13 | Anular un pago existente con usuario, fecha y motivo | Contra-registro auditable; pago original permanece visible; si era mensualidad, ciclo queda sin efecto tras confirmación | §3.3, §3.5 |
| M14 | Cambiar clase suelta→mensualidad al asistir hoy y pagar | Pago no altera anteriores; nuevo ciclo comienza en la clase de hoy; pagos sueltos previos no se reembolsan | §3.6 |
| M15 | Cambiar mensualidad→clase suelta con ciclo pagado vigente | Ciclo pagado continúa hasta último día cubierto; clase suelta aplica desde el día siguiente; cambio queda en historial | §3.6 |
| M16 | Terminar mensualidad hoy antes del fin del ciclo, con motivo | Corte explícito auditado; no hay devolución automática | §3.6 |
| M17 | Consultar en Montevideo el último día cubierto a 23:59 y luego a las 00:00 siguiente | A las 23:59: Vence hoy; desde medianoche: Vencida, incluso con dispositivo en otro huso | §3.1.2, §3.1.5, §3.5 |
| M18 | Aviso N=7 para último día cubierto 11/05 | Aviso local el 04/05; fecha basada en Montevideo | §3.4, §3.5 |
| M19 | Instante alrededor de transición DST en zona IANA que cambia horario; recalcular estado por fecha local | No adelantar ni retrasar el día de vencimiento por duración fija de 24 h; fecha de negocio sigue siendo local | §3, §3.1.5, §3.4, §6 |
| M20 | Precio cambia en fecha posterior a un pago ya registrado | Pago previo conserva monto; nuevo precio solo se usa desde vigencia aplicable | §3.3, §3.7 |

**Límites de alcance:** M12/M13 describen expectativas de dominio, pero doble toque, confirmación UI y persistencia/auditoría integral requieren integración con app/BD. El paquete de dominio no permite validar dueños, aislamiento multi-tenant, persistencia de avisos ni UX móvil; quedan fuera de esta matriz ejecutable. PLAN no especifica detalle algorítmico de DST (Montevideo hoy no necesariamente cambia horario) ni política de retries externos; M19 verifica robustez calendárica, no una regla fiscal o de proveedor.

**Ejecución:** pendiente de registrar por caso el resultado observable y comandos contra el SHA exacto de entrega; discrepancias no se corregirán en esta revisión.
