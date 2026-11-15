# ENC-05 — Modelo de amenazas y especificación de seguridad

**Autora:** Emma · **Fecha:** 15/11/2026 (America/Montevideo).
**Estado:** especificación propuesta para la fase de datos; NO IMPLEMENTADO / NO VERIFICADO en una app o BD. Sin SQL ni cambios de infraestructura.
**Base leída:** rama `master`, HEAD `41e12607f7d2060dd37241585fc19d4d5f5c2caa`, `PLAN.md` §2, §3, §5, §7 y §8; `Emma-Recibe.md` ENC-05 y `PROTOCOLO-AGENTES.md`.

## 1. Alcance y lectura

El piloto tiene un instituto, dos dueños nominales con el mismo rol, alumnos adultos y un grupo interno por defecto, invisible en UI. Solo los dueños tienen cuenta. Sin tutores, salud, pagos online, cobros offline ni envío automático al alumno. Se diseña aislamiento multi-institución desde ahora, aunque el piloto use uno. Dinero entero en UYU; calendario de negocio `America/Montevideo`.

Esto no aprueba el producto ni modifica decisiones de Nico. El esquema definitivo, SQL, migraciones y pruebas ejecutables se harán después del diseño visual. Las tablas indicadas son **familias conceptuales** a mapear por Reina, no una orden de crearlas ahora.

| Archivo | Contenido |
|---|---|
| [01-aislamiento-y-acceso.md](01-aislamiento-y-acceso.md) | Inventario de recursos, tenant desde identidad verificada, RLS, roles BD, membresías, sesiones y 2FA |
| [02-pagos-y-auditoria.md](02-pagos-y-auditoria.md) | Pagos/anulaciones inmutables para la app, transacciones, idempotencia y evidencias |
| [03-privacidad-y-operacion.md](03-privacidad-y-operacion.md) | Uruguay, datos mínimos, transferencias, retención, secretos, incidentes y backups |
| [04-controles-y-pruebas.md](04-controles-y-pruebas.md) | 40 controles con resultado observable y prueba positiva/negativa para Gino |

## 2. Activos, actores y fronteras de confianza

**Activos:** identidades y sesiones, membresías, alumnos/contactos, asistencia, deuda y ciclos, pagos/anulaciones, tarifas, avisos y dispositivos push, CSV, auditoría, secretos y respaldos.

**Actores:** visitante sin sesión; dueño legítimo; dueño malicioso del instituto A; atacante con un token robado; dispositivo compartido/perdido; servicio programado; operador de soporte; administrador de infraestructura. Los dos dueños pueden operar todo su instituto y cada uno queda identificado: un dueño malicioso puede registrar operaciones falsas dentro de su permiso. La auditoría permite detectarlas, no certifica la entrega de efectivo.

**Flujo de confianza:** móvil no confiable → Auth gestionada (verifica identidad y MFA) → Data API/RPC/función (autoriza) → Postgres con RLS y restricciones → Storage privado / workers / push / exportación. Se consideran superficies independientes: REST, RPC, vistas, Realtime, Storage, tareas y consola de soporte. RLS no protege por sí sola todo el flujo.

- Los parámetros del móvil, IDs UUID, reloj local, filtros de pantalla, texto de notas y metadatos editables no son autoridad.
- El JWT es autoridad solo tras verificar firma, emisor, audiencia, vigencia e identidad; sus claims pueden estar desactualizados. La membresía y la sesión se comprueban en servidor/BD.
- Una clave privilegiada, el propietario de tablas o un superusuario pueden saltar RLS. No hay promesa de aislamiento frente a un administrador de BD comprometido: se limita, audita y detecta mediante controles operativos.
- Push, WhatsApp manual, descargas CSV, proveedores y backups son salidas de datos; no quedan protegidos solo por la política de la tabla original.

## 3. Amenazas priorizadas

Severidad = impacto potencial antes de controles; son riesgos de diseño, **no vulnerabilidades demostradas**. Crítica: fuga multi-institución o compromiso general. Alta: toma de cuenta, alteración de dinero o exposición importante. Media: exposición acotada o abuso operativo.

| ID | Severidad | Precondición y escenario | Control y pruebas |
|---|---|---|---|
| AM-01 | Crítica | Dueño de A cambia un ID, tenant o filtro; lee/escribe/exporta filas de B, incluso por relación anidada | RLS por operación, membresía vigente, FK compuestas, comprobación de ámbito en todas las salidas; SEC-01–08, 17–20 |
| AM-02 | Crítica | Cliente usa metadatos editables para convertirse en dueño; servicio privilegiado confía en el cuerpo del request | Identidad firmada + autorización viva; cambio de membresía solo por operación controlada; SEC-03–04, 09–10 |
| AM-03 | Crítica | Clave `service_role` en bundle/log; vista, función o worker salta RLS; pool conserva tenant anterior | Separación de privilegios, revisión de superficies y transacciones sin estado compartido; SEC-11–14, 34 |
| AM-04 | Alta | Phishing, refresh token robado o cuenta compartida permite operar como dueño | Cuentas nominales, MFA exigida en BD/API, almacenamiento seguro, revocación y recuperación protegida; SEC-01, 15–16, 35 |
| AM-05 | Alta | Dueño/atacante modifica un pago antiguo, borra auditoría o falsifica actor/fecha | Sin escritura directa de libro; transacción con actor/fecha servidor y registro protegido; SEC-21–25, 29 |
| AM-06 | Alta | Doble toque, caída de red o dos dueños registran/revierten simultáneamente | Idempotencia persistida, unicidad, bloqueos y transición atómica; SEC-22, 26–28 |
| AM-07 | Alta | CSV, push, URL firmada, cache o Realtime entrega datos fuera de contexto o tras cierre de sesión | Autorización de cada canal, cache por identidad/tenant, payload mínimo, links breves privados; SEC-17–20, 30–32 |
| AM-08 | Alta | Se recogen salud/menores por notas libres o se envían contactos/deuda a observabilidad | Minimización, advertencia/validación de campos, filtros de telemetría y datos sintéticos; SEC-24, 33, 36 |
| AM-09 | Alta | Soporte entra sin motivo ni límite, copia toda la base o suplanta al dueño | Identidad de soporte separada, acceso excepcional temporal y trazado fuera del alcance del operador; SEC-12, 29 |
| AM-10 | Alta | Error humano, ransomware o backup incompleto destruye pagos/archivos | Backups cifrados, acceso separado, restore probado y reanudación idempotente; SEC-37–38 |
| AM-11 | Alta | Hosting/proveedores transfieren datos a destinos no evaluados; retención indefinida o derechos sin atención | Inventario de tratamientos, contrato, procedimiento de derechos y validación legal; SEC-39–40 |
| AM-12 | Media | Notas maliciosas causan inyección SQL/XSS/fórmulas CSV; abuso de login/exportación agota recursos | Consultas parametrizadas, escape por destino, CSV seguro, límites y errores opacos; SEC-08, 19, 24, 35 |

## 4. Decisiones propuestas y pendientes (no reabren reglas de negocio)

1. **Reina + Ada, fase de datos:** materializar el contexto activo firmado, verificación viva de membresía/sesión, nombres definitivos, grants, superficies expuestas y rol mínimo de transacciones. No reemplazar RLS por una Edge Function con clave administrativa.
2. **Fina + Reina:** alta/desafío/recuperación de MFA, sesión vencida, selección de instituto futura, confirmación de anulación, error de red sin éxito falso y aviso antes de exportar/abrir WhatsApp. No dibujar portal de alumno ni roles futuros como habilitados.
3. **Zaira (`7e0c8d1df108-billing`) + Ada:** región y subencargados, RPO/RTO, cobertura/retención de BD y Storage, credenciales, alertas, responsable de incidentes, límites de tasa y costos. Son requisitos por resolver antes de operación real, no servicios contratados.
4. **Ada/Nico + abogado uruguayo:** base jurídica, registro URCDP, contratos, transferencias, retención, derechos, eventual delegado/evaluación de impacto. Todo lo legal es **a validar por abogado**; la excepción de trámites del PLAN §7 no equivale a acreditar cumplimiento ni elimina obligaciones.
5. **Gino:** convertir SEC-01–40 en pruebas sobre el mismo candidato que implemente Reina; registrar commit, entorno, configuración y resultado. Emma revisará políticas y grants reales en esa fase, no en esta entrega.

## 5. Evidencia y límites de esta entrega

Leí los archivos de alcance y el estado Git. Existía trabajo concurrente ajeno en buzones, diseño y QA, además de `packages/dominio/`; no lo modifiqué. `docs/seguridad/` no existía al comenzar. Durante la redacción HEAD avanzó por una integración ajena a `fde675a6ae90cc1ae00c305e52edbc0ec199dd45` (`Integrar UX documental y matriz QA del dominio`); no hice commit, push ni cambios de rama. Consulté las aclaraciones Q1–Q5 de `docs/diseno/ux/README.md` y las contrasté con la actualización de PLAN §8.1: Q1/Q4/Q5 tienen aclaración operativa/conservadora; Q2/Q3 siguen pendientes de clienta. Esta especificación respeta esas aclaraciones, no cierra los pendientes ni inventa unicidad comercial. No había esquema Supabase ni aplicación autenticada que probar en el árbol versionado inspeccionado. No ejecuté tests del dominio porque no se modificó código ni se estaba auditando su implementación.

Verificación documental local: script temporal `verificar_enc05.py` en `/tmp/apx-scratch-4f023747/th_3fdbcea50cd74e43/` comprueba cinco Markdown, doce amenazas AM, cuarenta controles SEC únicos y consecutivos, enlaces locales existentes, ausencia de sentencias/bloques SQL y whitespace; imprime SHA-256 de cada documento. Resultado final: PASS. `git diff --check` sin errores para cambios rastreados; cada documento nuevo se comprobó además mediante `git diff --no-index --check /dev/null <archivo>`. Esta evidencia solo acredita estructura documental, no seguridad ejecutada.

Consulté documentación de Supabase sobre RLS/MFA y textos oficiales IMPO el 15/11/2026; las referencias y límites jurídicos están en los documentos correspondientes. No verifiqué un despliegue, MFA real, RLS real, backup, restore, móvil ni cumplimiento. La matriz SEC es aceptación futura, no un informe de tests aprobados.
