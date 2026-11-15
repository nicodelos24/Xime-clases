# I1 · Base móvil y contratos visuales

**Responsable:** Reina, en la sesión externa OpenCode que activa Nico. **Estado:** preparado, todavía no habilitado. No iniciar una sesión APX ni interpretar este documento como una orden de ejecución. Ada avisa al cerrar D3 (demo integrada, revisión, QA y publicación comprobada).

## Base y fuentes

Al empezar: comprobar rama, HEAD, cambios locales y reglas `AGENTS.md` / `PROTOCOLO-AGENTES.md`. Preservar trabajo ajeno y `packages/dominio/`. El SHA de la demo aceptada se registra al cerrar D3; no tomar un árbol parcial como candidato aprobado.

Precedencia: decisión de Nico en `DECISION-AGENDA-ALUMNOS.md`, `PLAN.md` §3/§8.1 y `HOJA-DE-RUTA.md`; después UX `diseno/ux/agenda.md`, prototipo/HANDOFF y guías visuales `diseno/visual/`. Las mutaciones JavaScript del prototipo son simulaciones: no portarlas como reglas de negocio.

## Una sola unidad

Crear la base Expo / React Native / TypeScript y trasladar la estructura visual de cinco destinos **Hoy · Alumnos · Agenda · Cobros · Más**, con proveedor de datos ficticios explícito. No implementar Supabase, autenticación o comandos financieros en esta unidad.

- **Alumnos:** ficha canónica y duradera, alta de adulto y búsqueda. Filtros Todos / Mensuales / Por clase individual, independientes del orden Más recientes (fecha de alta, ambas modalidades mezcladas) / Mensuales primero / Por clase individual primero. Alta descendente dentro de cada grupo y desempate estable por ID. No ocultar al que dejó de venir ni duplicarlo cuando retorna.
- **Agenda:** Semana como lista y Mes con detalle del día. Ver personas programadas, agendar una ficha existente y retirar solo su programación, volviendo a la misma fecha/vista. No recurrencias, cupos ni lista de espera inventados. Identidad de programación por alumno y ocurrencia de clase, no un booleano global del alumno.
- **Separación:** alumno, programación, clase efectivamente realizada y pago son conceptos distintos. Agendar, navegar o retirar programación no confirma asistencia, no inicia mensualidad, no genera deuda ni cobra. Una falta mensual no prorroga ni penaliza.
- **Visual:** componentes y tokens compartidos, SVG locales con etiquetas, objetivos táctiles accesibles, temas claro/oscuro y movimiento breve con reducción de animaciones. Agenda es el eje, no una lista escolar.
- **Cobros / avisos:** presentar estados y límites visuales; cualquier simulación debe decirlo. No prometer pago registrado, persistencia, notificación enviada ni WhatsApp entregado. Q2 y Q3 siguen sin ejecutar.

## Fronteras mínimas

- `apps/mobile/`: rutas, pantallas y composición. Componentes no calculan ciclos/precios ni contienen consultas de red.
- Una frontera de repositorios/servicios tipados para alumnos, ocurrencias y programación; implementación inicial de fixtures. Contratos de lectura y comandos separados, errores explícitos. No generar paquetes adicionales sin consumidor real ni fijar SQL antes de I2.
- `packages/dominio/`: TypeScript puro, sin Expo/React/Supabase ni reloj global. Reutilizar reglas existentes cuando corresponda, sin duplicarlas en UI. No modificar reglas de mensualidad en esta unidad.
- Identificadores estables, relaciones por ID y fechas locales explícitas; dinero entero UYU. No datos reales ni secretos en fixtures/evidencia.

## Aceptación verificable

1. Comando de inicio y chequeos de tipos documentados; pruebas ejecutables de filtro/orden, agendar/retirar y conservación de ficha. Ejecutar también la regresión existente del dominio y separar sus resultados de los de la UI.
2. Mostrar mensual e individual mezclados en Más recientes, alternar filtro/orden sin perder el otro y reagendar una ficha que llevaba tiempo sin venir.
3. Agendar y retirar sin cambiar pagos, deuda, clase efectiva o estado de mensualidad; impedir duplicar la misma programación por doble toque.
4. Navegar Semana/Mes/detalle y volver conservando fecha/vista. No cargar una clase de hoy como si fuera de otra fecha.
5. Revisar la UI en ejecución: anchos móviles 320/360/390 o equivalentes documentados, claro/oscuro, teclado/foco y reduced-motion. Adjuntar capturas actuales y errores de consola/red. No afirmar teléfono físico o lector de pantalla si no se usaron.
6. README por módulo creado: responsabilidad, reglas que consume, límites y cómo probarlo. Informar SHA, comandos/resultados, archivos y NO VERIFICADO. Gino hará QA independiente sobre el mismo candidato; una entrega no se autoaprueba.

## Fuera de I1

Supabase/SQL/Auth/MFA/RLS/auditoría, persistencia productiva, cobros/anulaciones reales, notificaciones y enlaces externos reales corresponden a I2–I4. Q2 (corregir clase cobrada), Q3 (terminar mensualidad hoy) y dudas de hora exacta no se resuelven desde UI. No cambiar tarifas, ciclos, ancla ni permisos por apariencia. No publicar ni desplegar sin autorización aplicable.
