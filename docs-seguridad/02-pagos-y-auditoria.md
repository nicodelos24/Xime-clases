# ENC-05 — Pagos, anulaciones y auditoría

**Estado:** especificación propuesta, sin SQL ni persistencia implementada. Las pruebas relacionadas son SEC-21–29 en la [matriz](04-controles-y-pruebas.md).

## 1. Invariantes de negocio y seguridad

- El MVP **registra pagos manuales**, no mueve fondos. Un comprobante es interno, no factura DGI. Separar el libro de alumnos de la suscripción que paga el instituto al SaaS.
- Un pago conserva instituto, alumno/concepto, importe entero UYU, medio, fecha de negocio y motivo del cambio de monto cuando corresponda. Rechazar valores fraccionarios, negativos, fuera de rango y conceptos no admitidos. Cero solo si una regla de beca/bonificación explícita de Ada lo permite; no inventar esa excepción por UI.
- El precio vigente se obtiene y valida en servidor. El importe congelado no cambia al editar tarifas. No aceptar del móvil saldo, estado de mensualidad, actor, rol, fecha de auditoría ni «ya pagado» como verdades.
- La fecha declarada de pago puede ser una fecha de negocio autorizada; es distinta de `recorded_at`, generado por servidor y no editable. Guardar instantes de auditoría en UTC y derivar visualización/calendario de negocio en Montevideo. El reloj del celular no prueba cuándo ocurrió una acción.
- No se edita ni borra un pago, una anulación o un ajuste financiero desde roles de la aplicación. Tampoco por borrar alumno, cuenta o instituto en cascada. Los efectos se calculan a partir del historial válido, no de un campo de saldo manipulable.

## 2. Registro atómico de un pago

Un único comando servidor debe:

1. Verificar identidad, sesión vigente, `aal2`, contexto y membresía Dueño actual; validar alumno, clase/ciclo/concepto y todas sus referencias dentro del mismo instituto.
2. Validar importe, medio, campos permitidos y motivo cuando se aparta de tarifa; resolver las reglas de ciclo del PLAN §3 en servidor. No recalcular con reglas distintas a las del núcleo de dominio.
3. Reservar/verificar idempotencia y serializar el recurso de negocio involucrado. Detectar conflictos de versión/estado, en vez de pisar una operación concurrente del otro dueño.
4. Insertar el pago y el efecto necesario sobre ciclo/cargo/asistencia, más evento de auditoría y eventual outbox. **Todo o nada en la misma transacción.** Si falla la auditoría no hay pago confirmado.
5. Confirmar solo después de commit. Si se pierde la respuesta, el cliente consulta/reintenta con la misma clave y obtiene el resultado persistido; no crea otra operación ni muestra éxito por adelantado.

Los cambios de inicio/ancla, terminación de mensualidad, modalidad o asistencia ya cobrada deben usar comandos con autorización y auditoría equivalentes. No eludir el libro financiero modificando una asistencia o un ciclo directamente. Las reglas de calendario y «nunca quitar días» siguen siendo las del PLAN; esta especificación no las sustituye.

## 3. Idempotencia y concurrencia

**Contrato propuesto:** clave aleatoria por intención de usuario, persistida con tenant, tipo de comando, versión/esquema y huella canónica de campos significativos (alumno, concepto, monto, moneda, medio, fecha, referencias y motivo). Actor original fijado al confirmar; respuestas solo a usuarios actualmente autorizados del mismo tenant.

- Misma clave, tenant, comando y payload: mismo identificador y resultado original, sin nuevos eventos financieros. No renovar fecha ni cambiar el actor original por quien reintentó.
- Misma clave con otro payload: conflicto explícito y cero cambios. Misma clave en otro tenant no expone ni reutiliza resultado ajeno.
- Dos requests concurrentes con igual clave: restricción de unicidad y transacción, no solo búsqueda previa en código. Ambos observan un único resultado confirmado.
- Dos claves distintas para el mismo hecho (misma clase/alumno o misma renovación): idempotencia técnica no basta. Aplicar unicidad/estado de dominio y bloqueo para no registrar dos cobros incompatibles. La identidad del hecho y sus transiciones deben mapearse con Ada antes de diseñar constraints: no deducir una regla comercial como «un pago por alumno/mes/monto». PLAN §8.1 Q5 ya especifica no cobrar dos renovaciones anticipadas para el mismo ciclo y Q4 conserva la deuda previa; Q2 mantiene pendiente el efecto exacto de ajustes de asistencia/cancelación cobrada. Un segundo pago legítimo distinto requiere concepto independiente permitido por el dominio; pagos parciales y varios meses juntos siguen fuera del MVP.
- No expirar el registro de idempotencia antes de la ventana de reintentos; propuesta: conservar vínculo/digest junto al registro financiero durante su retención, sin almacenar cuerpos con datos personales innecesarios. Ada/Zaira deben definir política explícita antes de producción.

## 4. Anulación, no borrado

**Actor permitido en MVP:** cualquiera de los dos dueños autorizados del instituto. No imponer doble aprobación: no está decidida y ambos tienen igual rol. Sí exigir confirmación visible con monto, alumno/concepto, impacto y motivo no vacío.

- Crear un contra-registro nuevo que referencia al pago original y conserva tenant, actor real y timestamp servidor. Nunca cambiar el importe original ni marcarlo como borrado invisible.
- Una anulación completa como máximo por pago original; importe de reverso determinado por el original, no por el móvil. Evitar reversos duplicados incluso si dos dueños actúan simultáneamente.
- Anular mensualidad deja el ciclo sin efecto, según PLAN §3.3, en la misma transacción; conservar ciclo e historial para trazabilidad. Si afecta renovaciones o consumos posteriores, el dominio debe explicitar dependencias y resolverlas o rechazar con conflicto comprensible; no inventar cascadas silenciosas ni recalcular historia cobrada sin evidencia.
- Para corregir un pago: anular y registrar uno nuevo, relacionados; no «editar pago». No hay reembolso bancario automático.
- Cambio de asistencia ya cobrada o terminación anticipada: ajuste/referencia nuevo con motivo e impacto, sin borrar el pago ni prometer devolución automática.
- Un reverso fallido o prohibido deja intactos pago, ciclo y saldo. Reintentar tras pérdida de red usa la misma clave.

## 5. Evento de auditoría

Campos conceptuales mínimos (sin esquema SQL): identificador de evento; `institute_id`; actor nominal de Auth o identidad de servicio; tipo de actor; acción; tipo/ID del recurso; instante servidor; correlación/request y comando idempotente cuando corresponda; resultado; motivo para acciones sensibles; referencias de pago/anulación/ciclo; cambios de campos relevantes en forma mínima (antes/después o delta acotado).

- Registrar altas/bajas/cambios relevantes de alumno, asistencia corregida, pago/anulación, tarifa/monto excepcional, inicio/ancla/modo/corte de ciclo, configuración de avisos, exportación, membresía/rol, recuperación de cuenta/MFA y acceso de soporte. Las auditorías de Auth/soporte pueden estar en un sistema distinto, correlacionable y protegido.
- El servidor fija actor, tenant y fecha. Un worker registra identidad de servicio y origen del trabajo; soporte registra su propia identidad y, si corresponde, quién solicitó la intervención. No reemplazar actor por «Dueño» ni aceptar `actor_id` cliente.
- Guardar referencias y campos permitidos; no volcar automáticamente toda la ficha, body de request o texto completo de mensajes. No almacenar contraseñas, JWT/refresh, semillas/códigos MFA, tokens de invitación ni push en eventos.
- IP/dispositivo no son obligatorios para el libro de pagos ni prueba irrefutable de identidad. Si seguridad los necesita, documentar finalidad/retención corta, minimizar y separar de reportes de negocio; **a validar por abogado**.
- El dueño ve auditoría de su instituto, no eventos globales ni secretos de seguridad de otros usuarios. Su exportación también se audita y filtra.

## 6. Garantía de integridad y sus límites

**Append-only para roles de operación:** sin `UPDATE`, `DELETE`, `TRUNCATE`, cambios DDL ni modificación de triggers sobre pagos/anulaciones/auditoría; clientes sin inserción directa libre. Un escritor acotado inserta solo eventos válidos. Revisar grants además de RLS, y evitar borrados por cascada.

La auditoría del pago se escribe junto al efecto de negocio. Los **intentos denegados** y fallas de seguridad se registran por un canal separado que sobreviva al rollback; no insertar un «intento fallido» en la transacción que luego se revierte. Aplicar rate limiting y minimización para no convertirlo en un canal de exfiltración o DoS.

Un superusuario/operador con privilegios suficientes puede reescribir BD y triggers: append-only no significa inmutabilidad frente a infraestructura. Propuesta adicional antes de operación real: réplica de eventos/exportación periódica a destino con retención protegida y administración separada; alertas ante cambios de grants/políticas y huecos de conciliación. Zaira debe definir frecuencia, cobertura, acceso y costo. Hash encadenado dentro de la misma BD **no prueba** integridad si el atacante puede recalcularlo; necesita anclaje independiente.

La supresión legal y retención no se resuelven habilitando borrado a Dueño. Usar procedimiento administrativo acotado, documentado y auditado, que concilie conservación necesaria y minimización/anonimización; conservar importes y trazabilidad requerida sin duplicar PII innecesaria. No prometer historial personal eterno ni borrado total inmediato de backups. Ver [privacidad](03-privacidad-y-operacion.md).

## 7. Conciliación y salida

Reconciliar periódicamente: pagos válidos menos anulaciones, por instituto/período/medio, versus reportes y ciclos/cargos; detectar reversos huérfanos, duplicados y operaciones sin evento. Conservar evidencia sintética en QA. La conciliación prueba consistencia del registro, no que el efectivo haya ingresado a caja.

CSV generado en servidor bajo los mismos permisos y contexto; auditar solicitante, ámbito/período, fecha, cantidad y resultado, no copiar filas en logs. Escapar fórmulas de planilla y delimitadores/comillas/saltos de línea. Descarga privada, temporal y sin enlace público. El derecho de acceso de un alumno no equivale a descargar la base completa del instituto.
