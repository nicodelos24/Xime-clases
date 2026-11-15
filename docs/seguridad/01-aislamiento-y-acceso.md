# ENC-05 — Aislamiento multi-institución y acceso

**Estado:** especificación propuesta, sin SQL; controles no implementados ni probados. Ver [alcance y amenazas](README.md) y [matriz SEC](04-controles-y-pruebas.md).

## 1. Contrato de autorización

Una operación de tenant se permite solamente si concurren todas estas condiciones:

1. Identidad verificada por Supabase Auth/gateway o verificador servidor: firma y algoritmo admitidos, emisor/audiencia configurados, expiración, `sub` válido; no aceptar un JWT solo decodificado. Las funciones que reciban tokens deben verificarlo también.
2. Cuenta y sesión habilitadas. Para tenant/datos del negocio, dueños con segundo factor completado (`aal2` comprobado del lado servidor/BD). Sin `aal`, tratar como `aal1` y denegar datos.
3. Contexto de instituto activo autenticado, emitido por servidor tras validar membresía; coincide con el recurso. Ningún header, ruta o body del móvil otorga autoridad por sí solo.
4. Membresía **actual**, activa, del `sub` en ese instituto y con permiso para esa acción. El rol de negocio proviene de la membresía en BD; `role=authenticated` del JWT no significa Dueño.
5. Recurso, filas relacionadas, límites de campos y transición de negocio válidos. Si falta contexto o hay incoherencia: denegar, nunca usar el primer instituto ni un tenant global por defecto.

El cliente puede **solicitar** un instituto; el servidor lo valida antes de emitir el contexto. Propuesta concreta: claim dedicado `active_institute_id` emitido por un hook/flujo servidor confiable, no por `user_metadata` editable. RLS compara ese contexto firmado con `institute_id` y consulta membresía vigente. El contrato del hook y su propagación en Supabase se demostrarán en la fase de datos: no se presume un claim nativo con ese nombre.

Un usuario futuro podrá pertenecer a A y B con roles distintos. Tokens separados/contexto explícito por solicitud; el estado de instituto activo no es una variable global mutable que cambie solicitudes concurrentes. Cambiar contexto invalida cache local y suscripciones de la pantalla anterior. Un token de A nunca autoriza una fila B aunque el usuario tenga ambas membresías. El selector/listado mínimo de membresías propias es una excepción explícita de bootstrap, de solo lectura, después de MFA; no permite consultar datos del negocio.

**Claims viejos:** quitar una membresía o bajar un rol debe surtir efecto en la próxima operación; no esperar a que caduque el token. Comprobar sesión/estado de revocación en servidor/BD también para Data API y RPC, no solo en la UI. Revocar refresh tokens no invalida por sí solo un access JWT ya emitido. Propuesta: registro privado de sesiones permitidas/revocadas asociado al `session_id` verificado y a la cuenta; mecanismo definitivo y cobertura de Auth/RLS a resolver y probar por Reina. No exponer administración de ese registro al móvil. Para una revocación ya confirmada no admitir nuevas operaciones; una transacción en vuelo se serializa con el cambio de autorización cuando la acción sea sensible.

## 2. Inventario conceptual por ámbito

Toda familia de tenant debe conservar `institute_id` obligatorio e inmutable por operaciones ordinarias. En la fila raíz instituto, su `id` es la identidad de tenant; no hace falta duplicarlo artificialmente. Cada tabla nueva debe clasificarse antes de exponerla.

| Familia conceptual | Ámbito / lectura MVP | Escritura y condición |
|---|---|---|
| Instituto / ajustes / marca | Instituto activo, Dueño | Dueño cambia solo campos de configuración permitidos; sin cambiar ID, plan SaaS o privilegios de plataforma |
| Membresías / invitaciones / roles | Propias para bootstrap; Dueño ve personal de su instituto sin secretos de Auth | Solo servicio controlado de invitación/gestión, con MFA y auditoría; no autorregistro como Dueño ni update directo del rol |
| Alumnos / contactos / modalidad | Instituto activo, Dueño | Operaciones autorizadas; baja lógica con retención definida, no cascada que borre libro financiero |
| Grupo interno / asignaciones / inscripciones | Instituto activo, Dueño | Grupo por defecto del piloto; claves y referencias tenant-coherentes aunque no haya selector visible |
| Horarios / ocurrencias de clases / asistencia | Instituto activo, Dueño | Cambios autorizados; asistencia ya cobrada se corrige con ajuste auditado, no destruyendo el pago |
| Mensualidades / ciclos / cargos o deuda derivada | Instituto activo, Dueño | Solo operación de dominio servidor para afectar fechas/deuda; estado derivado, nunca editable por payload |
| Tarifas y vigencias | Instituto activo, Dueño | Cambio con autor/vigencia; no reescribir monto congelado de pago |
| Pagos / anulaciones / ajustes financieros | Instituto activo, Dueño | Solo comandos transaccionales controlados; sin edición/borrado directo ni inserción cliente libre |
| Avisos / intentos de entrega | Instituto activo, Dueño | Worker acotado o comando servidor; destino ligado a dueño vigente y tenant; sin autoenvío a alumnos |
| Tokens push / dispositivos | Usuario + instituto; solo datos mínimos del dispositivo propio | Alta/revocación ligada a identidad; token no enumerable por otros dueños ni exportable con alumnos |
| Eventos de auditoría de negocio | Instituto activo, Dueño, sin secretos ni PII excesiva | Solo escritor de auditoría; append-only para roles de operación |
| Idempotencia / outbox / trabajos | Tenant, solo internos | Sin exposición al móvil; servicio mínimo, unicidad tenant + tipo de comando + clave |
| Exportaciones / objetos de Storage / metadatos | Tenant + solicitante; Dueño autorizado | Generación servidor y acceso privado; identificador/ruta no reemplaza autorización |
| Tutor / vínculo tutor-alumno / cuentas alumno | **Futuro, deshabilitado** | Sin tablas/rutas habilitadas por este encargo; cuando existan: ambos extremos del mismo tenant y acceso por vínculo validado |
| Facturación/suscripción del SaaS | Plano de plataforma separado | Nunca mezclar con pagos de alumnos; Dueño solo resumen propio permitido, sin escritura de estado privilegiado |
| Auth / perfil nominal / estado de sesión | Identidad global privada, no tenant de negocio | Perfil propio con campos permitidos; credenciales y sesiones administradas por Auth/servidor; no lectura de `auth.users` desde móvil |
| Auditoría de soporte/plataforma | Plano operativo separado, no listado a todos los institutos | Actor de soporte real, motivo y ámbito; sin suplantar `sub` de un dueño |

FK y unicidad deben incluir tenant donde corresponda: un pago de A no puede referenciar alumno/ciclo de B; asistencia A no puede usar clase o alumno B; tampoco anulaciones, avisos ni objetos. No basta proteger solo el padre con RLS. Unicidad funcional tenant-local (por ejemplo código de alumno) no debe revelar existencia en otro instituto. UUID reduce enumeración, pero nunca sustituye permisos.

## 3. Especificación de políticas RLS y privilegios

- Habilitar RLS y, para tablas de aplicación propias, forzarla para el propietario ordinario cuando corresponda. No alterar a ciegas tablas administradas por Auth/Storage; usar sus mecanismos soportados y pruebas específicas. `FORCE` no restringe superusuario ni `BYPASSRLS`.
- Denegar por defecto: sin política/grant explícito no hay acceso. Revisar privilegios por defecto de cada esquema y tabla, no asumir que habilitar RLS retira grants existentes. Sin `TRUNCATE`, mantenimiento, DDL, creación de funciones/triggers ni cambio de roles para runtime.
- Lectura: identidad + sesión vigente + MFA + contexto + membresía/permiso + ámbito de fila. Aplicar también a agregados, joins, búsquedas, conteos, reportes y Realtime. No filtrar solo en JS después de descargar todo.
- Inserción: validar la fila nueva y todas las referencias. Fijar actor e instituto desde contexto autorizado; si el payload incluye otro instituto, rechazarlo. Aceptar solo campos previstos, sin asignación masiva.
- Actualización: comprobar tanto fila anterior como fila resultante. Prohibir trasladar fila a otro instituto, cambiar autor o usar una FK de B. Políticas permisivas adicionales no deben abrir una vía que evada la condición de MFA/tenant; comprobar composición restrictiva efectiva.
- Borrado: sin borrado físico ordinario de pagos, anulaciones o auditoría. Para alumnos usar el proceso de baja/privacidad; una baja no borra referencias históricas.
- Dinero, membresías y cambios de deuda: RPC/comando servidor, no DML directo de cliente. Cada función verifica identidad, autorización, sesión, MFA, tenant y argumentos; restricciones BD siguen vigentes.
- Funciones por defecto con privilegios del invocador. Si una función necesita privilegio elevado: ejecutor mínimo específico, `search_path` fijo, nombres cualificados, sin SQL dinámico no validado, permiso de ejecución explícito, sin escalada recursiva de membresías ni cambio de claims. Revisar helpers RLS para evitar recursión en membresías y bypass abierto.
- Vistas con semántica de invocador o no expuestas. Vistas/materializaciones, RPC y esquemas ajenos a la Data API deben tener revisión propia; una vista del propietario puede evadir RLS.

### Roles técnicos (distintos de roles de producto)

| Identidad BD/servicio | Uso permitido | Restricción |
|---|---|---|
| `anon` / visitante | Solo Auth/recuperación a través del proveedor | Sin filas del negocio, archivos, RPC de dinero ni datos de bootstrap |
| `authenticated` | Lecturas autorizadas y mutaciones operativas acotadas/RPC | No es dueño de tablas, ni superusuario ni `BYPASSRLS`; sin CRUD libre de pagos, roles o auditoría |
| Propietario de objetos / migrador | DDL versionado y mantenimiento explícito | Separado del runtime, credenciales en CI/gestor, sin uso móvil ni tráfico normal |
| Ejecutor de comandos financieros / auditoría | Operación fija, transacción y mínimo grant | No administración global, no borrado/truncado; no ejecución libre desde cliente |
| Worker de avisos/exportación | Cola y recursos del trabajo autorizado | Contexto por trabajo; no API administrativa genérica para recorrer cualquier tenant |
| `service_role` o secret key administrativa | Solo administración excepcional imprescindible en servidor | Bypassa RLS: nunca en móvil ni como credencial común de negocio. Toda excepción tiene autorización equivalente explícita, ámbito limitado y test adversarial |
| Soporte humano | Acceso extraordinario temporal por instituto y motivo | Cuenta separada con MFA, expiración y auditoría; sin modo permanente «ver todos» |

Si se usa conexión Postgres propia con pooling, cualquier contexto verificado es local a la transacción. Nunca mantener tenant o claims entre requests. No aceptar una variable de sesión que el cliente pueda fijar arbitrariamente. La Data API gestionada y una conexión servidor propia son caminos distintos y ambos requieren pruebas.

## 4. Roles de aplicación y sesiones

**MVP:** dos cuentas Dueño distintas, mismos permisos de negocio dentro del mismo instituto, MFA obligatorio en ambos casos. La configuración de Auth no convierte al Dueño en administrador de plataforma. Aprovisionamiento inicial fuera de auto-registro abierto, por flujo administrativo acotado y trazado.

**Futuro, no habilitado:** Administrador (operación/configuración delegada sin acceso global), Recepción (alta/asistencia/cobro y deuda necesaria; no anular ni exportar base), Profesor (solo alumnos/clases asignados, sin montos/deuda), Alumno/tutor (solo datos propios o vínculo vigente). Por defecto se deniega toda acción a roles aún no implementados. RLS filtra filas pero no oculta columnas por sí sola: Profesor/Recepción requerirán proyecciones/grants por columna o separación de tablas; una política de «alumnos de su grupo» no basta para proteger deuda.

**Sesión propuesta:** access token de 15 minutos como objetivo a configurar/probar, refresh rotativo gestionado por Auth, almacenamiento nativo Keychain/Keystore mediante adaptador seguro, no AsyncStorage ni logs. Sin datos financieros persistidos para operar offline. Si se implementa web: cookies seguras HttpOnly/Secure/SameSite y protección CSRF donde corresponda; no copiar mecánicamente el almacenamiento móvil.

Cerrar sesión elimina tokens, cache sensible y registro del dispositivo para ese usuario/contexto. Revocación por dispositivo y global, bloqueo de cuenta, remoción de membresía y cambio/reset de credenciales deben cortar acceso mediante la comprobación viva. Refresh expirado/fallido obliga a login, no a usar un token indefinidamente. Recuperación de MFA requiere proceso de identidad reforzado y auditado, nunca un «quitar segundo factor» sin prueba; una sesión `aal1` solo puede completar Auth/enrolamiento, no leer alumnos.

Invitaciones: destinatario, instituto, rol, caducidad y uso único ligados en servidor; secreto de invitación no guardado en claro ni registrado en telemetría. Aceptar invitación no puede cambiar rol/tenant por payload. Evitar quitar o degradar accidentalmente al último dueño activo sin transferencia administrativa explícita.

## 5. Canales fuera de filas

- Storage privado con políticas de objeto y verificación de bucket/tenant/propietario. Paths segregados son organización, no autorización. URL firmada solo tras autorizar; propuesta de vida máxima 5 minutos, sin publicación en logs. Un bearer link puede usarse hasta expirar: si el recurso exige revocación inmediata, servirlo por endpoint que reautorice cada descarga, no por URL autónoma.
- Realtime solo para canales/tablas autorizados; quitar suscripciones al revocar o cambiar contexto. Si un canal no puede cumplir revocación y aislamiento, no habilitarlo todavía.
- Cache, claves de query, páginas, objetos descargados y trabajos incluyen usuario + instituto. No reutilizar respuestas SSR/clientes autenticados entre requests.
- Push de pantalla bloqueada genérico («Tenés avisos por revisar»), sin nombre de alumno, deuda o teléfono. Abrirlo requiere sesión y autorización actual. Quitar tokens obsoletos no garantiza retirar un push ya entregado; por eso no incluir PII.
- WhatsApp manual: mostrar destinatario y texto editable, codificar URL correctamente, apertura a demanda. No enviar automáticamente ni registrar «entregado» por abrir `wa.me`. El link contiene datos fuera de la app: texto mínimo, sin deuda por defecto y sin analytics de URL completa.

## Referencias técnicas consultadas (15/11/2026)

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): grants y políticas se complementan; `service_role` evade RLS; vistas y claims requieren cuidados.
- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa): `aal1`/`aal2` y exigencia en BD/API, no solo interfaz.

No se verificó configuración ni disponibilidad del plan contratado; los nombres propuestos y garantías de revocación deben demostrarse en la fase de datos.
