# ENC-05 — Privacidad en Uruguay y seguridad operativa

**Estado:** requisitos propuestos, no certificación de cumplimiento ni configuración realizada. **Todo lo legal: a validar por abogado uruguayo.** Fuentes oficiales leídas el 15/11/2026, sin dictamen jurídico ni comprobación de trámites/proveedores.

## 1. Datos mínimos y alcance real

| Datos | Tratamiento previsto | Restricción |
|---|---|---|
| Cuenta de dueño, membresía y sesión | Identidad nominal, autorización, auditoría | Dos dueños distintos; no contraseña compartida ni acceso global |
| Nombre/contacto de alumno adulto | Inscripción y contacto solicitado | No pedir DNI, foto ni fecha de nacimiento completa sin finalidad justificada; solo lo necesario |
| Asistencia, modalidad, ciclos y deuda | Operación del instituto | Información personal privada, nunca expuesta por notificación de bloqueo, link público o logs |
| Pago/manual, anulación, motivo | Historial y conciliación | Importe/moneda/fechas/referencias; sin tarjeta, credenciales bancarias ni comprobantes con datos innecesarios |
| Push/avisos | Solo dueños en MVP | Tokens protegidos, payload genérico, destinos ligados a membresía vigente |
| Notas libres/WhatsApp | Texto mínimo editable y a demanda | Advertir que no se ingresen salud ni información sensible; límite de longitud y escape por destino; no registrar mensajes completos |
| Tutor, menor, salud | Fuera del MVP | No recogerlos bajo un campo alternativo ni habilitar rutas por accidente. Extensión futura requiere alcance y análisis específico |

La asistencia y la deuda son datos personales confidenciales, pero no deben confundirse automáticamente con la categoría jurídica de «datos sensibles» de la Ley 18.331; salud sí está incluida expresamente. Cifrado no vuelve lícita una recolección innecesaria.

## 2. Uruguay — obligaciones identificadas y validaciones pendientes

| Tema | Evidencia normativa consultada | Traducción al producto / pendiente |
|---|---|---|
| Responsabilidad e inscripción | Ley 18.331, arts. 4 y 6; Decreto 414/009 | El instituto decide finalidad de alumnos y actúa como responsable; SaaS trata por su cuenta como encargado. SaaS puede ser responsable de sus propias cuentas/facturación. Inventariar bases y validar quién inscribe cuáles ante URCDP, procedimiento, plazos y constancias. No asumir una inscripción por tabla o que una inscripción SaaS cubre automáticamente a todos los clientes. **A validar por abogado.** |
| Información y fundamento | Ley 18.331, arts. 7–9 y 13; Decreto 414/009, arts. 5–6 | Documentar finalidad, responsable/contacto, destinatarios, datos obligatorios/opcionales y derechos. El consentimiento no es la única base: art. 9 contiene excepciones, incluida necesidad contractual. Validar fundamento por finalidad; si se usa consentimiento, conservar versión, fecha y prueba inequívoca, sin casillas premarcadas. Separar marketing/otras finalidades. **A validar por abogado.** |
| Contrato de encargo | Ley 18.331, arts. 4 y 30 | Contrato por instituto: instrucciones, finalidad, seguridad, confidencialidad, subencargados/transferencias, incidentes, derechos y devolución/destrucción. Art. 30 regula destino de datos al terminar y conservación excepcional; no fijar retención ilimitada. **A validar por abogado.** |
| Derechos («ARCO» como abreviatura) | Ley 18.331, arts. 14–15; Decreto 414/009, arts. 9–13 | Acceso, rectificación, actualización, inclusión y supresión según supuestos. Plazo de cinco días hábiles en textos consultados; verificar identidad/procedencia, responder sin revelar terceros y registrar resolución. Exportar CSV o anonimizar no garantiza por sí solo todos los derechos ni obliga a una eliminación inmediata indiscriminada. Validar excepciones y notificación a destinatarios. **A validar por abogado.** |
| Transferencias internacionales | Ley 18.331, art. 23 | Evaluar país/destinatario, nivel adecuado reconocido y fundamento/garantías aplicables. El artículo contempla excepciones y autorización URCDP con garantías que pueden derivar de cláusulas apropiadas. Firmar cualquier DPA/cláusula no acredita automáticamente habilitación. No dar por resuelto EE.UU. mediante una casilla genérica. **A validar por abogado.** |
| Privacidad desde diseño | Decreto 64/020, arts. 5–9 | Documentar tratamiento, minimización, retención y contingencias. Evaluar si corresponde evaluación de impacto previa según art. 6; menciona, entre otros, menores y transferencias sin nivel adecuado. Este modelo de amenazas no sustituye esa evaluación. **A validar por abogado.** |
| Delegado de protección | Decreto 64/020, arts. 10–14 | Criterios incluyen datos sensibles como negocio principal y grandes volúmenes (el texto consultado refiere a más de 35.000 personas), además de entidades públicas. Validar aplicación al SaaS agregado, criterios vigentes y plazos; no presumir obligación o exención por tener un piloto pequeño. **A validar por abogado.** |
| Incidentes | Decreto 64/020, arts. 3–4 | Iniciar procedimientos de mitigación dentro de las primeras 24 h de constatado el incidente; encargado comunica inmediatamente al responsable; responsable comunica a URCDP en máximo 72 h de conocida la vulneración y a titulares significativamente afectados en los supuestos previstos. Preparar responsables, reloj de incidentes, canales y documentación. **A validar por abogado.** |

### Correcciones de la asesoría preliminar de memoria

La nota previa recogida en PLAN §5 era orientativa. Esta lectura no modifica PLAN, pero precisa para Ada:

- **Región UE no equivale a cumplimiento resuelto:** revisar adecuación vigente y cadena completa de transferencias. Supabase/AWS puede implicar soporte, logs, backups, subprocessors, push Expo/APNs/FCM y telemetría en otros países; no solo la ubicación de Postgres.
- **Consentimiento no siempre obligatorio para toda operación:** existe excepción contractual; no generalizar «todo requiere consentimiento» ni reutilizarlo para finalidades no informadas.
- **No afirmar regla universal de consentimiento de tutor para todo menor de 18** sin revisar capacidad, representación y caso con abogado. Hoy menores/tutores están fuera del piloto. Antes de habilitarlos, definir vínculo verificable, permisos mínimos, información adecuada y evaluación de impacto aplicable.
- **ARCO no significa borrar el libro de pagos:** conciliar derechos, conservación/bloqueo y supresión en forma jurídicamente fundada. Tampoco prometer que un botón de exportación cumple todo el acceso legal.
- **72 h no es todo el proceso de incidentes:** incorporar mitigación 24 h y aviso inmediato encargado → responsable. No se comprobó capacidad operativa para esos tiempos.

D7 del PLAN permite seguir diseño/piloto sin frenar por trámites; no convierte obligaciones legales en opcionales ni demuestra que un piloto con datos reales esté exento. Ada/Nico deben resolver con abogado las obligaciones aplicables antes de tratamiento/comercialización real. Diseño con fixtures sintéticos puede continuar.

## 3. Retención, derechos y salida del instituto

Antes de datos reales, acordar una matriz de retención por categoría: alumnos/contactos, pagos/anulaciones, auditoría de negocio, seguridad/IP, avisos, exportaciones, dispositivos, registros de consentimiento y backups. Cada categoría necesita finalidad, plazo o criterio, responsable, mecanismo de bloqueo/supresión y excepciones justificadas; no inventar plazos fiscales.

Flujo de derechos propuesto: solicitud al instituto → verificación de identidad mínima y segura → búsqueda solo del titular y tenant → revisión de retención/excepciones → entrega/rectificación/supresión por operación privilegiada acotada → registro de respuesta y notificación a destinatarios cuando corresponda. No subir el documento de identidad a logs ni exigir guardarlo indefinidamente.

Anonimizar de verdad requiere eliminar posibilidad razonable de reidentificación, incluidas notas, links y combinaciones; sustituir el nombre por UUID es seudonimización. Preservar información financiera necesaria sin duplicar contacto/nombre en auditoría. Al terminar contrato: exportación autorizada, deshabilitar accesos, purgar activos según instrucción/obligación documentada y dejar constancia. Incluir restauraciones: re-aplicar bajas/supresiones desde registro protegido antes de reabrir un backup. Informar caducidad de copias; no prometer borrado instantáneo de respaldos inmutables.

## 4. Controles operativos pendientes antes de producción

Responsable de diseño operativo: Zaira (`7e0c8d1df108-billing`), con Ada; implementación posterior por Reina. Nada de esta lista está contratado/configurado por ENC-05.

- **Entornos:** dev/staging/prod separados en credenciales, proyectos y almacenamiento; fixtures sintéticos fuera de producción. No clonar una BD real para QA o prompts. Acceso mínimo a consola/CI, MFA de operadores y trazabilidad de cambios.
- **Secretos:** gestor servidor/CI, rotación y procedimiento de revocación; escaneo de repo/historial y artefactos de build. La clave publicable Supabase no sustituye RLS, pero no es lo mismo que una secret key. Nunca enviar `service_role`, contraseñas BD, claves push privadas ni credenciales de firma a la app, URLs, prompts o buzones.
- **Transporte y cliente:** TLS con validación normal; no desactivar validación de certificados ni debug sensible en producción. Tokens nativos en almacenamiento seguro. Pinning no es requisito del piloto; no sustituye autorización ni debe bloquear una rotación sin plan.
- **Entradas y salidas:** validación de tipos, longitud y rangos servidor, parámetros de consulta, campos permitidos; sin interpolación SQL, HTML sin escape ni fórmulas CSV ejecutables. No permitir URLs arbitrarias en jobs/descargas que generen SSRF. Errores sin trazas/PII ni pistas sobre existencia de filas de B.
- **Abuso:** límites por identidad, instituto y origen para login/recuperación/MFA, invitaciones, pagos/anulaciones y exportación; paginación, máximos de filas/tamaño y concurrencia. Zaira/Reina fijan valores y alertas medibles; no usar bloqueo permanente de cuenta que permita DoS. Respuestas de auth no revelan si el correo existe.
- **Logs/observabilidad:** redacción de tokens, cuerpos, contactos, deuda, URLs `wa.me` y firmadas; retención breve y acceso restringido. Correlación opaca + tenant interno cuando se necesite, no datos del alumno como etiqueta. Auditar lecturas/exportaciones administrativas.
- **Backups y continuidad:** decidir RPO/RTO y retención; comprobar cobertura y restauración de BD, objetos Storage, configuración/secretos necesarios y políticas/grants. No asumir que el backup de Postgres incluye archivos. Cifrado, credenciales separadas y copias protegidas. Ensayo de restore aislado con evidencia, conciliación y control de acceso antes de reabrir; PITR solo si existe en el plan contratado.
- **Workers:** destinos y payload de avisos autorizados por tenant, idempotencia/outbox, reintentos acotados, cola de fallos, reanudación sin duplicados después de caída; nada de «entregado» solo por abrir WhatsApp.
- **Cadena de suministro:** lockfiles, dependencias y actualizaciones revisadas, escaneo de vulnerabilidades en CI, builds sin secretos; cambios de grants/RLS/configuración mediante revisión, sin publicación automática por este documento.
- **Incidentes:** contacto nominal de cada instituto, responsable de guardia y reemplazo, detección/contención, revocación de sesiones/secretos, preservación mínima de evidencia, comunicación y simulacro. Revisar con abogado relojes/obligaciones de la sección 2.

## 5. Fuentes consultadas

Textos oficiales IMPO (lectura directa, 15/11/2026; no se verificó jurisprudencia ni todo criterio/resolución URCDP vigente):

- [Ley 18.331 actualizada](https://www.impo.com.uy/bases/leyes/18331-2008), en particular arts. 4, 6–9 y 13.
- [Art. 14, acceso](https://www.impo.com.uy/bases/leyes/18331-2008/14) y [art. 15, rectificación/actualización/inclusión/supresión](https://www.impo.com.uy/bases/leyes/18331-2008/15).
- [Art. 23, transferencias internacionales](https://www.impo.com.uy/bases/leyes/18331-2008/23).
- [Art. 30, servicio informatizado por cuenta de terceros](https://www.impo.com.uy/bases/leyes/18331-2008/30).
- [Decreto 414/009](https://www.impo.com.uy/bases/decretos/414-2009), consentimiento y derechos; arts. 7–8 derogados por Decreto 64/020.
- [Decreto 64/020](https://www.impo.com.uy/bases/decretos/64-2020), arts. 3–10 y 14, reglamentario de arts. 37–40 de Ley 19.670 y art. 12 de Ley 18.331.

Las constancias de registro, contratos, lista de países adecuados vigente, cláusulas/autorizaciones de transferencia, análisis de aplicabilidad y evidencia de controles quedan **NO VERIFICADOS / a validar por abogado**. Elegir un proveedor o región no demuestra cumplimiento.
