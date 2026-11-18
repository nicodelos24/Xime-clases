# Clases — protocolo de comunicación y documentación entre agentes

**Estado:** guía operativa. **17-11-2026:** el dueño retiró el protocolo de
buzones; la comunicación entre agentes va hoy por **nativo de APX** (chat
directo, delegación, comentarios en la tarea APX). Los buzones quedaron
archivados en [`historial/buzones/`](historial/buzones/LEEME.md). Adapta
prácticas de pFinanza/Traza y pString; no copia órdenes particulares de esos
productos ni concede permiso para cambiar la app, publicar o activar
automatizaciones.

## 1. Fuentes y precedencia

Antes de actuar, el agente lee `AGENTS.md`, su `Clases-Nombre.md`, `PLAN.md`
y los informes vigentes que correspondan. Contrasta con Git y el estado real
del producto cuando existan. La comunicación entre agentes es hoy nativa de
APX (y se registra en la tarea APX de la unidad); el historial y las
decisiones de producto permanecen en `PLAN.md` y, cuando se cree, en
`docs/decisiones/`.

Precedencia: instrucción reciente de Nico > decisión explícita y vigente registrada en `PLAN.md`/decisiones > encargo vigente de Ada > propuesta técnica > documento histórico. Si hay contradicción, no se elige unilateralmente: se registra y se consulta a Ada; si requiere decisión del dueño, Ada la eleva a Nico.

`PLAN.md` hoy es una propuesta detallada con decisiones iniciales ya incorporadas, pero no equivale a autorización general para implementar. Respetar su secuencia acordada: cerrar reglas y diseño visual primero; después modelo de datos e implementación. Una decisión cerrada no se vuelve a preguntar salvo que aparezca evidencia que exija cambiarla.

## 2. Comunicación: nativa de APX

- Para comunicar a una persona: **chat directo APX** a ese agente, o comentario en la tarea APX de la unidad. No hay segundo registro obligatorio: la tarea y el chat dejan constancia.
- No se reescriben avisos ajenos ni historia. Un tema por aviso, título/ID breve, fecha con zona horaria si importa, remitente, destinatario, contexto y acción esperada.
- Si algo es urgente para una decisión de Nico, Ada lo eleva directo (el canal APX notifica en vivo). No se asume recepción sin respuesta.
- No incluir contraseñas, secretos, datos de alumnos, tutores, pagos identificables ni datos personales reales. Usar datos sintéticos y referencias de archivo/tarea.
- Informar con claridad qué es pedido, decisión, propuesta, bloqueo, evidencia o resultado. Nunca presentar una propuesta como decisión de Nico.

Plantilla sugerida (para avisos formales por chat o comentario de tarea):

```md
## AAAA-MM-DD HH:MM TZ — De Nombre → Nombre — [ID/tema]
**Tipo:** pedido | decisión | propuesta | bloqueo | entrega | revisión
**Contexto/fuente:** ...
**Alcance/acción esperada:** ...
**Dependencias y aceptación:** ...
**Límites:** ...
```

## 3. Roles y límites

- **Ada — arquitectura y coordinación.** Mantiene el alcance, orden, decisiones y dependencias en `PLAN.md`; asigna una unidad concreta por vez; confirma quién escribe cada documento; concilia entregas y eleva decisiones de dueño. No sustituye revisión independiente ni se adjudica tareas de implementación/QA de otros.
- **Fina — diseño UX/UI.** Diseña flujos y sistema visual conforme a reglas aprobadas; señala dudas de producto antes de fijarlas en una pantalla. Entrega referencias, estados, accesibilidad y criterios observables. No inventa reglas de cobro ni declara implementación.
- **Reina — desarrollo.** Implementa solo una unidad asignada por Ada, sobre la base y alcance identificados. Primero valida el repositorio/estado; prueba las reglas de negocio y deja evidencia reproducible. No publica, despliega ni cambia decisiones de producto sin autorización.
- **Gino — QA independiente.** Revisa contra aceptación y el mismo commit/candidato de la entrega; informa casos, comandos, resultados, evidencia y límites. No corrige el producto bajo revisión ni aprueba lo que no pudo ejecutar.
- **Emma — seguridad y privacidad.** Revisa permisos, aislamiento entre institutos, datos sensibles, menores, auditoría y riesgos de acceso, priorizando controles efectivos de servidor/BD. No afirma cumplimiento legal sin jurisdicción/evidencia ni modifica políticas de acceso sin encargo.
- **Zaira — billing e infraestructura.** Analiza hosting, observabilidad, respaldos, disponibilidad y suscripción SaaS del instituto; distingue el cobro de la app al alumno. No configura pasarelas, cobra, despliega ni inicia servicios sin alcance/autorización.
- **Vito — diseño visual adicional.** Su disponibilidad/encargo no se presume. Si se incorpora, Ada le define una revisión o pieza concreta y coordina con Fina para no duplicar trabajo; no hay gate de aprobación establecido por su mera presencia.

Revisiones de Fina, Gino, Emma o Zaira no reemplazan unas a otras. Quien implementa no se autoaprueba. Una entrega no significa que el producto esté probado, integrado o publicado.

## 4. Asignación y estado del trabajo

Ada mantiene la fuente canónica del plan y decisiones en `PLAN.md`; cada encargo operativo debe aparecer en la tarea APX del responsable (o en su `Clases-Nombre.md` si es decisión de área) y, si cambia prioridades o alcance, en el apartado correspondiente del plan. Para tareas largas, dividir en unidades observables con ID, responsable, prioridad, dependencias, aceptación, archivos/rama o base si existe y estado (`pendiente`, `en curso`, `bloqueado`, `entregado`, `revisado`, `aceptado`). Preservar las tareas anteriores: priorizar no equivale a borrar o dar por terminada otra.

Una unidad de implementación por vez y un escritor por archivo. Antes de editar: revisar `git status`, rama/HEAD, archivos ajenos o sin seguimiento y sesiones concurrentes; conservar el trabajo existente. No usar reset/restore/checkout/stash para borrar cambios de otra persona. Si el repo aún no existe (estado actual documentado en PLAN), no simular código, pruebas, persistencia o despliegue.

No se crean Flows, rutinas, tareas APX ni cambios de configuración como consecuencia implícita de este protocolo. La herramienta/canal de asignación debe respetar una instrucción posterior de Nico; los documentos compartidos dejan constancia y evitan duplicaciones, pero no sustituyen aprobaciones de APX ni confirman que alguien haya leído un aviso.

## 5. Informes, decisiones y evidencia

Una entrega técnica informa: ID y alcance; estado real de Git/base/commit; archivos; comandos y salida; pruebas focales y regresión; capturas/rutas verificables si hubo revisión visual; limitaciones (`NO VERIFICADO`); trabajo ajeno preservado; próximo responsable. Citar hash exacto. No decir “verde” si solo corrió parte de las pruebas.

Una decisión pendiente para Nico se eleva en lenguaje cotidiano: una decisión por mensaje, alternativas concretas con consecuencias para el instituto y recomendación explícita; identificar qué ya está decidido y qué no. No exigir que Nico lea código para poder elegir. Si la decisión no bloquea una parte independiente, seguir solo con lo autorizado.

Para QA independiente, el resultado debe ser `APPROVED`, `NEEDS WORK` o `NO VERIFICADO`, con criterio y evidencia. Capturas deben ser actuales, del candidato citado y con datos ficticios; registrar ruta y descripción en informe/índice, no incrustar imágenes voluminosas en avisos. Nunca afirmar prueba de teléfono físico, lector de pantalla, nube, cámara nativa, backup, cumplimiento o publicación si no se comprobó.

## 6. Regla de negocio y privacidad para este proyecto

Usar `PLAN.md` como fuente de las reglas actuales: Uruguay, UYU, `America/Montevideo`, dinero entero; dos dueños nominales en el piloto, un solo grupo sin interfaz de grupos; mensualidad inicia en la primera clase posterior al pago y el estado se deriva del ciclo/pagos; clase suelta se paga al asistir; los pagos manuales se anulan con trazabilidad. No recalcular reglas ni cambiar estos acuerdos desde UI sin registrar una decisión.

Tratar alumnos y especialmente menores/tutores como datos sensibles: trabajar con fixtures sintéticos; no volcar nombres, teléfonos, deuda ni asistencia reales a capturas, logs, prompts ni avisos. Aislamiento por instituto y autorización se validan en servidor/BD, no solo escondiendo botones. Cumplimiento legal y producción requieren revisión y evidencia aparte.

## 7. Cierre

Al concluir, actualizar los archivos propios, dejar recado corto a la siguiente persona y precisar qué sigue y quién lo hará. Ada registra la conciliación del plan sin borrar evidencias ni cambiar autores. Integración, push a ramas compartidas, despliegue y publicación se informan por separado y solo ocurren con autorización aplicable.
