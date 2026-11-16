# Handoff UX · ENC-08R · Agenda y Alumnos

**Fina · 15/11/2026.** Candidato de diseño local, sin commit/push ni publicación. La [decisión de Nico](../../../DECISION-AGENDA-ALUMNOS.md) prevalece sobre el eje escolar de ENC-01/06/07. La recuperación conservó los archivos parciales de ENC-08; no reemplazó ni descartó trabajo ajeno. Base al recuperar `0cfd74eb40203e8021598c205fc74bce8e19faf6`; HEAD al cierre **`4388754bfd4591a1f576a003f2f3955d330a3d3a`**. Los cambios de esta entrega están sin commit: el HEAD solo **no identifica el candidato**. Usar [manifiesto de archivos](evidencia/manifest-enc08r.json).

## Resultado entregado

- Cinco destinos Hoy / Alumnos / Agenda / Cobros / Más. Agenda Semana/Mes muestra **quién viene cada día**, horarios y vencimientos vinculados; no toma asistencia ni cobra al navegar.
- Agendar desde fecha: buscar alumno existente, filtrar modalidad, elegir horario y confirmar. Si el día carece de clase, la demo pide hora explícita para una sola ocurrencia. No duración/cupo/serie predeterminados.
- Crear ficha desde Agenda usa la misma alta canónica de Alumnos y vuelve al selector; crear no cobra ni agenda automáticamente. Ver programación permite ir a ficha o retirar solo esa relación, con confirmación.
- Fichas duraderas **en memoria de la sesión** aunque no vengan un tiempo. Un alumno mensual antiguo y un individual salteado se reutilizan por ID, sin duplicarse por evento.
- Alumnos combina búsqueda, filtros Todos / Mensuales / Por clase individual y orden Más recientes (alta mezclando modalidades) / Mensuales primero / Por clase individual primero. Dentro de grupos: alta descendente + ID estable. Pagar, reservar o faltar no cambia la fecha de alta.
- Preserva la subruta `#asistencia`, ahora **Clase realizada**, con acceso secundario desde Hoy/ficha. Es registro puntual del hecho efectivo, no obligación de pasar lista diaria. No se habilitan realizaciones de fechas futuras.
- SVG locales de Vito con texto; filtro/orden ENC-09 integrados. Tema claro/oscuro sin modificar tokens. Transiciones 160 ms de opacity/transform, sin dependencias, reducidas a cero por reduced-motion. Texto ampliado y ancho estrecho usan lista alternativa; detalle del día primero.
- Aviso visible «Sin guardado real. Recargar reinicia la demo» y datos ficticios. Toda confirmación de programación/retiro es de sesión, no afirmación de BD o sincronización.

## Límites que no deben cambiar al portar

**Alumno ≠ modalidad ≠ programación ≠ clase realizada ≠ pago.** `programacion.js` mantiene reservas `{id, alumnoId, claseId}` y hechos efectivos por clave `claseId:alumnoId`; los nombres/estado/modalidad se leen de la ficha. No copiar fichas a cada evento ni agregar un booleano global de presencia del alumno.

Agendar/retirar no toca hechos, pagos, deuda, vencimiento ni inicio. Un mensual que falta no obtiene prórroga/descuento ni cargo extra. Un individual no adeuda por reservar o faltar. Primera clase efectiva posterior al pago o fecha manual siguen siendo la regla de inicio; la **fecha manual no se ejecuta** aquí. No inferir inicio por una fecha prevista.

El registro/cobro heredado ENC-06 usa **solo la ocurrencia fija del 15/11** y campos económicos de fixture. Su simulación financiera no está generalizada a múltiples clases ni es modelo de datos productivo. Q2/Q3 solo explican políticas pendientes, sin reintegros, reimputaciones, correcciones económicas ni corte anticipado. Cambiar modalidad no borra deudas históricas ni cobertura pagada; doble toque protegido solo en memoria, no idempotencia de servidor.

No se agregan recurrencias, cupos/listas de espera, docentes, grupos visibles, recuperos, roles, portal, envío WhatsApp, tarifa real o nuevas reglas. WhatsApp tiene pictograma genérico, editor y apertura **simulada**; no logo oficial, número real, wa.me ni envío/entrega. No app/BD, SQL, autenticación, red offline real o publicación.

## Módulos y reutilización para Reina externa

| Fuente | Reutilizable | No trasladar como regla productiva |
|---|---|---|
| `agenda.js` / `agenda.css` | Semana vertical, Mes/detalle, contexto, estados, reflow | Aritmética de navegación del calendario no calcula mensualidades |
| `alumnos.js` | Labels, filtro/orden independientes, selector canónico | No deducir identidad por nombre ni alta por último pago |
| `programacion.js` | Separación conceptual reserva/hecho y referencias a ficha | Arrays/Map de memoria no son repositorio persistente ni autorización |
| `datos-demo.js` | Casos sintéticos y vocabulario de fechas | Fechas, tarifas e IDs fijos no son datos de la clienta |
| `presentacion.js` / `iconografia.js` | Componentes, etiquetas y SVG locales de Vito | No interpretar color/icono como única fuente de estado |
| `prototipo.js` | Recorridos, foco/retorno, confirmaciones y límites de diseño | Mutaciones de cobro/ciclo heredadas son salidas fijas, no dominio ni backend |

I1 se inicia únicamente cuando Ada/Nico lo indiquen en el handoff de Reina externa. Este documento no inicia sesión APX de Reina ni autoriza Expo/Supabase. La conservación durable necesita repositorio/BD, permisos, unicidad/idempotencia, concurrencia y auditoría en una unidad posterior.

## Revisión propia y evidencia

Chrome real **157.0.8103.38**, solo MCP Kaia, contexto propio `fina-enc08r-cierre`, origen `127.0.0.1:8783` servido desde `docs/diseno`. **132 comprobaciones sintéticas PASS:** 86 Agenda/programación/Alumnos/matriz, 28 regresión ENC-06 y 18 accesibilidad focal. Resultados brutos y capturas en [ENC-08R.md](evidencia/ENC-08R.md). Reflow en 320/360/390 y ambos temas; texto ampliado también en esos seis pares. Se midieron doce pares concretos de contraste, no todas las combinaciones del producto.

AG-02/07/08 conservan ID pero sustituyen el recorrido escolar por programación separada y realización efectiva secundaria. El callback de regresión conserva sus 28 escenarios; cambia etiquetas y entrada de navegación. En el cierre solo se corrigieron carreras del **harness** (recarga antes de completar SVG y aserciones antes de `hashchange`), sin nueva implementación de pantallas.

No se autoaprueba producto: esta es revisión del autor. **Ada (`7e0c8d1df108-architect`) revisa estructura/integra; Gino hace QA independiente del mismo manifiesto antes de publicar.** Vito mantiene responsabilidad sobre sistema visual y guía ENC-09; sus archivos no fueron modificados por Fina.

## Lo que sigue NO VERIFICADO

| Tema | Falta / responsable posterior |
|---|---|
| Uso real | Sesión autorizada con una dueña, tiempos/errores observados; Ada coordina y Fina observa |
| Tareas para esa sesión | Agendar alumno antiguo que vuelve; agendar individual en dos días salteados; retirar fecha conservando ficha; filtrar/ordenar y retornar al mismo día. No imponer pasar lista |
| Apariencia/vocabulario | Aprobación estética de Nico/clienta; no se infiere de las capturas |
| Dispositivo/accesibilidad | Teclado virtual, safe area real, font scale del SO, zoom, VoiceOver/TalkBack y auditoría completa; Fina/Vito y luego Gino sobre app |
| Q2/Q3/inicio manual | Política e interacción definitiva antes de implementar bordes; Ada con Nico/clienta |
| Persistencia y seguridad | BD/autorización/concurrencia/red/idempotencia/auditoría; Reina/Gino/Emma en fase autorizada |
| Canal/publicación | WhatsApp real, notificaciones y sitio publicado; Reina/Gino y Ada según alcance |

**No se entrevistó ni observó una usuaria.** No marcar cerrada la salida de diseño de PLAN por estos callbacks ni afirmar conservación de alumnos después de recargar.
