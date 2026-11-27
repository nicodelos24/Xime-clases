# Revisión visual Xime Clases v5 — estado ANTES

**Fecha:** 27 de noviembre de 2026  
**Alcance:** `v5-diseno/`, móvil 390 × 900, tema claro y oscuro.  
**Estado:** solo diagnóstico y propuesta. **No se modificó la app.**  
**Objetivo:** preparar una adaptación a **Frutiger Aero moderno**: profundidad, brillo y transparencias controladas, motion premium y comprensión visual, sin caer en una estética infantil.

## 1. Resumen para decidir

La base actual ya tiene una identidad turquesa/pastel coherente, buena consistencia de componentes, SVG propios, foco visible, soporte de movimiento reducido y estados vacíos en varias rutas. **No hace falta empezar de cero ni cambiar la arquitectura visual.** El salto a Frutiger Aero debe hacerse por capas sobre esos tokens.

Lo que más separa a la app de una experiencia premium hoy no es la falta de efectos, sino la **doble lectura que exige**: cabecera global + título local, fechas duplicadas, estados expresados por color y texto a la vez, tarjetas con demasiadas líneas pequeñas y una jerarquía monetaria poco clara en Cobros.

**Recomendación:** aprobar una primera etapa de **claridad + profundidad**, no una «lluvia de brillos». Primero se corrigen los problemas de lectura y densidad; después se aplica el lenguaje Aero. Así el resultado gana dopamina sin perder utilidad ni contraste.

### Prioridad de trabajo

| Prioridad | Problema | Impacto |
|---|---|---|
| P0 | El anillo de Hoy no expresa bien el 0 % y su etiqueta es minúscula | El KPI principal puede interpretarse como vacío o roto |
| P0 | Cobros mezcla deuda, vencimiento, monto y estado en una sola línea muy cargada | La acción más importante cuesta leerla |
| P0 | Los estados de Agenda dependen de color y de una leyenda textual | No se entienden de un vistazo ni con dificultad para distinguir colores |
| P1 | Hay títulos, fechas y subtítulos duplicados | Ocupan espacio y compiten con el contenido |
| P1 | Alumnos tiene demasiada densidad tipográfica y chips sin diferenciación visual suficiente | Escanear la lista requiere leer |
| P1 | Superficies planas y sombras cálidas genéricas | La identidad se siente más «dashboard antiguo» que Aero moderno |
| P1 | Áreas táctiles de chips, modo de Cobros y algunas flechas quedan por debajo de 44 px | Mayor riesgo de toque fallido |
| P2 | Estados vacíos existen, pero son mensajes aislados sin CTA ni ilustración ligera | La pantalla vacía no guía el próximo paso |
| P2 | Motion actual es correcto, pero desigual y a veces largo para la promesa 150–320 ms | La percepción de respuesta no es consistente |

## 2. Estado ANTES, vista por vista

### 2.1 Hoy

**Lo que ya funciona**

- El hero turquesa tiene presencia y separa bien el día del resto.
- Los chips de clase ya usan ícono + texto + color.
- Los KPI tienen ícono, cifra y rótulo.
- El aviso sin vencimientos cambia a un tratamiento neutro: buena decisión.
- El estado «todo dado» se puede celebrar sin desorden.

**Problemas observados**

1. **Anillo:** con `0 / 2`, el trazo de progreso desaparece y solo queda el fondo. El número se lee, pero el anillo parece apagado. Con `2 / 2` el anillo se llena, pero no hay una señal diferencial más allá del color.
2. **Etiqueta «CLASES DADAS»:** 9,5 px, dentro de un círculo de 92 px. Es decorativa a simple vista y puede quedar tapada por el número al crecer.
3. **Hero:** fecha + frase + anillo + lista es una torre alta. La fecha se repite en la cabecera global y el estado «sin clases por dar» también está implícito en el anillo.
4. **Grupos:** hora, nombre, chip y estado compiten en una fila estrecha. El nombre puede quedar visualmente subordinado al chip.
5. **KPI:** las tres tarjetas no tienen una altura de contenido garantizada. Con importes largos, los rótulos y valores pueden quedar a distintas alturas. Además, los importes de la captura (`$71.500`, etc.) compiten entre sí y con el anillo.
6. **Aviso:** cuando no hay vencimientos, el ícono de check es correcto, pero la tarjeta sigue ocupando una fila completa para decir «no hay nada».

**Dirección propuesta**

- Reconstruir el anillo como un **medidor legible**: mínimo trazo visible en 0 %, etiqueta exterior de 11–12 px, y estado completo con check SVG o pequeño destello, no confeti.
- Compactar la cabecera del hero: una sola línea de fecha y una frase de estado más breve.
- KPI con **altura mínima común**, cifra alineada en baseline y tratamiento tabular. Priorizar el importe sin convertir todo en negrita grande.
- Vacío de vencimientos: versión compacta dentro de la superficie de KPI o una línea con check, reservando la tarjeta completa para cuando haya un aviso real.
- Brillo Aero: gradiente más luminoso arriba/izquierda, reflejo superior sutil, borde claro y sombra turquesa difusa. Nada de burbujas 3D ni fondos ruidosos.

### 2.2 Clases — vista semanal

**Lo que ya funciona**

- La tira de siete días permite ubicarse rápido.
- El rango de semana es concreto.
- Las tarjetas tienen hora, duración, grupo, alumnos y estado.
- El estado vacío de un día es claro.
- El FAB «Agendar» es fácil de encontrar.

**Problemas observados**

1. **Cabecera duplicada:** «Buenas tardes, Xime / Clases» arriba y «Esta semana · 23 nov–29 nov» debajo. La vista pide dos titulares antes de mostrar contenido.
2. **Tira:** cada día mezcla día de la semana, mes y número. A 390 px es legible, pero el mes repetido siete veces aporta poco. El punto de «tiene clases» es pequeño y se confunde con una mancha.
3. **Fecha del día:** mayúsculas + tracking + texto largo. Es útil, pero puede simplificarse.
4. **Tarjeta:** «60 min» y «11 alumnos inscriptos» son dos metadatos pequeños; «Ver quiénes van» agrega otra línea y otro gesto. Para el uso diario, el grupo y la hora deberían dominar.
5. **Estado:** «Por dar» es un chip al final, pero el color de fondo también codifica estado. Hay redundancia y poca diferenciación entre estado real y modalidad.
6. **Vacío:** «Sin clases ese día» + toast duplica el mensaje. El vacío no ofrece «Agendar acá».
7. **Accesibilidad táctil:** el chip de estado mide alrededor de 30 px de alto y la zona de la tarjeta no siempre es un target claro.

**Dirección propuesta**

- Dejar un solo titular contextual: «Clases» + rango, con el saludo como metadata discreta.
- Tira con iniciales grandes, número protagonista y un **punto/indicador de contenido más grande**. Mantener el mes solo cuando cambia el rango o como referencia compacta.
- Tarjeta en dos niveles: **hora + grupo + estado** arriba; **alumnos y duración** como metadata secundaria. El desplegable puede quedar como icono de personas con contador, sin texto repetido.
- Convertir el chip en un control con área mínima de 44 px, sin agrandar visualmente el globo: padding invisible o wrapper.
- Vacío con icono calendario SVG, una frase corta y CTA «Agendar acá». Eliminar el toast redundante.
- Superficie Aero: tarjeta blanca semitranslúcida, borde superior brillante, sombra inferior suave y elevación de 2–4 px al presionar/hover.

### 2.3 Agenda — vista mensual

**Lo que ya funciona**

- Navegación de mes clara.
- Selección de día y detalle debajo funciona sin salir de la vista.
- El día actual se distingue.
- Las barras de estado ya son una mejora frente a puntos diminutos.

**Problemas observados**

1. **La leyenda es texto coloreado:** tres líneas con una barrita. No usa iconos y obliga a aprender un código.
2. **Dos leyendas:** modalidades (Mensual / Individual) y estados (Dada / Por dar / Cancelada). Se ven como una lista de instrucciones antes del calendario.
3. **Día actual:** el círculo turquesa con número blanco es fuerte, pero la barrita interna pierde contraste y puede confundirse con el estado.
4. **Celda de día:** 40–44 px aprox.; el target es justo y el estado vive en una barrita de 3 px. En pantalla real puede ser difícil de percibir.
5. **Detalle del día:** repite la fecha completa en mayúsculas y agrega dos botones. Con clases, la vista crece bastante y el calendario queda arriba.
6. **Vacío:** mensaje correcto, pero sin CTA visual ni relación directa con el día seleccionado.

**Dirección propuesta**

- Un único sistema de estados con **forma + color + texto accesible**: check SVG = dada; reloj/aro = por dar; cruz o prohibido = cancelada. La leyenda puede ser compacta y con iconos.
- Mantener el círculo de «hoy», pero separar selección y estado: por ejemplo, halo exterior para hoy y relleno para estado, evitando que una cosa tape a la otra.
- Aumentar la zona táctil sin aumentar demasiado el círculo visual.
- Detalle del día: título corto, CTA primario «Agendar» y acceso secundario «Ver semana». No repetir fecha completa si el día ya está seleccionado.
- La cuadrícula puede recibir un treatment de **cristal muy sutil**: fondo translúcido, separadores finos y celdas seleccionadas con bisel/luz, sin convertirla en una pecera.

### 2.4 Alumnos

**Lo que ya funciona**

- Buscador visible y filtros horizontales con pista de scroll.
- Avatares con iniciales y paleta consistente.
- Estado de vencimiento y modalidad presentes.
- Vacío por filtros funciona y el contador es claro.

**Problemas observados**

1. **Densidad:** nombre, grupo, estado, etiqueta de modalidad y fecha de alta en una fila. Son cinco datos en 60–80 px de alto.
2. **Jerarquía plana:** nombre y textos secundarios tienen pesos/tamaños similares; el punto de color es pequeño y débil.
3. **Fecha de alta:** aparece en todas las filas, aunque normalmente es metadata de ficha, no de listado.
4. **Filtros:** muchos chips textuales compiten entre sí. No hay separación visual entre «filtrar» y «ordenar».
5. **Punto de estado:** color pastel de 10 px. No comunica si es al día, por vencer o vencido sin leer el texto.
6. **Vacío:** «Ningún alumno con estos filtros» está centrado, pero no ofrece «Limpiar filtros» y deja mucho espacio vacío.
7. **Acción principal:** «Nuevo alumno» está bien, pero el botón compite con el título y el contador.

**Dirección propuesta**

- Fila de alumno con **nombre + avatar** como ancla; debajo, grupo/modalidad; a la derecha, estado con icono + texto breve. Fecha de alta fuera del listado.
- Estado como pill con icono SVG y contraste AA; el punto puede quedar como refuerzo, no como único código.
- Separar visualmente filtros de estado y orden. En móvil, priorizar «Todos / Al día / Por vencer / Vencido» y dejar orden en un menú o segundo carril.
- Vacío con CTA «Limpiar filtros» o «Crear el primero».
- Avatar Aero: aro claro, degradado suave y brillo superior, manteniendo iniciales legibles.
- Lista como superficie continua con separadores o tarjetas suaves; demasiadas tarjetas con sombra individual fragmentan la pantalla.

### 2.5 Cobros — lista

**Lo que ya funciona**

- KPI de cobrado y vencen hoy.
- Selector Lista / Calendario.
- Filtros con conteo.
- Monto y estado presentes.
- Acceso a ficha y pago por fila.
- Vacío por filtros existente.

**Problemas observados**

1. **Es la vista con mayor densidad.** Cada fila junta avatar, nombre, grupo/fecha, monto, «Debe», vencimiento y chevron.
2. **Vencimiento y estado compiten:** «Debe» + «Venció hace 6 días» + color de fondo. El usuario tiene que integrar tres señales para una sola idea.
3. **Montos:** no hay una alineacióntabular consistente ni una jerarquía común entre individuales y mensualidades.
4. **Título:** la cabecera global y el mes/periodo crean una lectura repetida.
5. **Modo Lista/Calendario:** píldora correcta, pero 35 px de alto y sin iconos; se siente como un control secundario.
6. **Filtros:** siete chips a 390 px. Varios quedan fuera de pantalla y la pista de scroll es sutil.
7. **Calendario de cobros:** al entrar se pierde el contexto monetario; la agenda usa otro lenguaje visual y vacíos de día muy simples.
8. **Vacío:** funciona, pero es un texto solo. No aclara si faltan alumnos, pagos o si el filtro excluyó todo.

**Dirección propuesta**

- Rediseñar la fila en **bloques**: izquierda persona + concepto; derecha importe grande y estado pill. El vencimiento pasa debajo del importe como metadata, no como otro competidor.
- Unificar el significado: **estado de cobro** y **urgencia** no deben ocupar el mismo nivel. Por ejemplo: `Debe` como estado y `Venció hace 6 días` como aviso secundario.
- Mostrar siempre `UYU` o un formato monetario consistente si el contexto no es obvio.
- KPI con una tarjeta protagonista para el total del mes y una secundaria para vencimientos; reducir ruido de colores.
- Filtros primarios separados de orden; conservar el scroll horizontal cuando haga falta.
- Modo calendario con los mismos estados visuales de Agenda, pero sin mezclar modalidad de clase con estado de pago.
- Vacío contextual con icono de cobros y CTA «Ver todos» o «Registrar pago».

### 2.6 Sheets y componentes transversales

Aunque no son una de las seis capturas principales, la revisión del código y las interacciones muestra que el sistema se extiende a fichas, agendar, cancelación y pagos. El cambio visual debe respetar esos flujos.

**Problemas / riesgos**

- Superficies de sheet planas, con sombra básica.
- Inputs y botones no comparten un lenguaje de profundidad.
- Algunos controles de texto pequeño quedan por debajo del área táctil recomendada.
- Glosado y transparencia pueden degradar contraste si se aplican sin una superficie base opaca suficiente.
- El sistema actual usa `color-mix`, `backdrop-filter` no utilizado y varias animaciones WAAPI; hay que mantener compatibilidad y `prefers-reduced-motion`.

**Dirección propuesta**

- Token de cristal: fondo base + capa translúcida + borde claro + sombra exterior. En móvil, evitar `backdrop-filter` amplio por costo y legibilidad.
- Botones primarios con bisel sutil, no degradados chillones.
- Focus ring turquesa oscuro con halo claro.
- Targets de 44 × 44 px mínimo sin alterar la forma visual de chips pequeños.
- Transiciones de superficie 150–220 ms; entradas de vista 220–320 ms; brillo una sola vez y corto.

## 3. Hallazgos transversales priorizados

### P0 — resolver antes de embellecer

1. **Anillo de progreso 0 %:** debe verse como un estado válido, no como un elemento apagado.
2. **Legibilidad de Cobros:** reordenar monto, estado y vencimiento.
3. **Agenda sin depender de la leyenda:** iconos + forma + color para estado.
4. **Targets táctiles:** chips, modos y flechas a 44 px mínimo.
5. **Contraste:** cualquier tinte translúcido debe validarse en claro y oscuro. No usar color pastel como único portador de significado.

### P1 — identidad y jerarquía

6. Eliminar duplicación de títulos/fechas.
7. Unificar altura y baseline de KPI.
8. Reducir densidad en Alumnos y Cobros.
9. Aplicar el lenguaje de superficies Aero de forma consistente.
10. Unificar motion y duraciones.

### P2 — pulido y vacíos

11. Vacíos con icono + CTA.
12. Reforzar el estado de selección/foco.
13. Revisar nombres largos y números grandes.
14. Revisar la agenda de cobros como una sexta variante funcional.
15. Medir rendimiento visual: sombras, blur y animaciones en gama baja.

## 4. Plan de adaptación a Frutiger Aero moderno

| Etapa A — Fundamentos visuales (sin cambiar flujos) |

**Objetivo:** crear el lenguaje Aero reusable antes de tocar cada pantalla.

- Nuevos tokens en `tokens.css`: superficies, bordes luminosos, sombras en capas, brillos, elevaciones y duraciones.
- Mantener la paleta turquesa/pastel y los colores de estado; cambiar cómo se aplican, no la identidad.
- Definir tres niveles de superficie:
  1. **Base:** fondo app.
  2. **Tarjeta:** blanco/menta translúcido con borde y sombra suave.
  3. **Hero/acción:** gradiente con luz superior y mayor profundidad.
- Biblioteca de iconos SVG existente: agregar solo estados/acciones que falten (`por-dar`, `cancelada`, `limpiar`, `calendario-vacío`, `cobros-vacío`).
- Componentes base: botón, chip, KPI, fila, avatar, vacío.

**Criterio de aceptación:** ninguna pantalla cambia todavía; el sistema nuevo se documenta y se puede aplicar por tokens.

| Etapa B — Claridad funcional |

**Objetivo:** arreglar los P0 sin depender del estilo.

- Anillo 0/2/100 %.
- Reordenar filas de Cobros.
- Agenda con estados iconográficos.
- Targets táctiles.
- Alturas de KPI.
- Vacíos con CTA.
- Reducción de metadatos en Alumnos y Clases.

**Criterio de aceptación:** las seis vistas se entienden con menos texto; no se pierde ninguna acción.

| Etapa C — Aplicación Aero por vista |

| Vista | Cambio visual principal | Motion principal |
|---|---|---|
| Hoy | Hero con cristal/luz, anillo premium, KPI elevados | Anillo 320–450 ms solo en cambio real; brillo corto |
| Clases | Tarjetas suaves, tira con indicador claro | Selección de día 150–220 ms; entrada de tarjetas 220 ms |
| Agenda | Cuadrícula translúcida, celdas con bisel suave | Cambio de mes 220–320 ms; detalle del día 180 ms |
| Alumnos | Avatares con aro/luz, filas más limpias | Filtros 150 ms; vacío con entrada sutil |
| Cobros | Superficie monetaria clara, importes protagonistas | Cambio de estado de pago 220 ms; confirmación sin confeti |
| Sheets | Cristal controlado y sombra profunda | Entrada 260–320 ms; salida 180–220 ms |

**Criterio de aceptación:** el Aero se nota en profundidad y luz, no en objetos redondos ni colores extra.

| Etapa D — Accesibilidad y QA visual |

- 320, 360, 390 y 430 px.
- Claro y oscuro.
- Nombres largos, importes grandes, 0 alumnos, sin clases, sin cobros, sin filtros.
- Contraste AA en texto, estados y foco.
- Movimiento reducido.
- Capturas ANTES/DESPUÉS por vista.
- Pruebas funcionales existentes + typecheck + build-check.

**Criterio de aceptación:** 264 tests en verde (o la base vigente), typecheck sin errores, build-check OK y evidencia visual adjunta.

## 5. Reglas de diseño propuestas

1. **Brillo antes que ruido:** un reflejo por superficie protagonista; no en cada tarjeta.
2. **Transparencia con base segura:** nunca texto sobre un blur sin color de fondo suficiente.
3. **Profundidad en capas:** borde claro arriba + sombra suave abajo + elevación pequeña.
4. **Color con refuerzo:** icono/forma/texto; nunca color solo.
5. **Motion con propósito:** 150–220 ms para respuesta, 220–320 ms para cambio de vista, una sola animación de celebración.
6. **SVG siempre:** iconos modernos, trazo consistente, sin emoji.
7. **Densidad controlada:** una idea primaria por fila; metadata secundaria solo si ayuda a decidir.
8. **Vacío útil:** icono + motivo breve + próximo paso.
9. **Mobile first:** 44 px de target y legibilidad a 320 px.
10. **Reduced motion:** sin animación decorativa; el estado final debe seguir siendo claro.

## 6. Orden recomendado de tareas

1. **Tokens y componentes Aero base** — Vera/Rocco.
2. **Anillo y KPI de Hoy** — Rocco, revisión Quique.
3. **Agenda: estados iconográficos y leyenda** — Rocco, revisión Quique.
4. **Cobros: reordenar fila y calendario** — Rocco, revisión Quique.
5. **Alumnos: densidad, filtros y vacíos** — Rocco, revisión Quique.
6. **Clases: tarjeta, tira y vacío** — Rocco, revisión Quique.
7. **Targets, contraste y motion transversal** — Rocco + Valen.
8. **QA visual y capturas finales** — Quique + Valen.

Cada tarea debe adjuntar capturas ANTES al crearse y DESPUÉS al cerrarse.

## 7. Evidencia y verificación

Se recorrieron las vistas reales en Chrome headless a 390 × 900, además de estados vacíos y modo oscuro. La base verificada conserva **264 tests en verde**, `tsc --noEmit` sin errores y `build-check` correcto. No se encontraron errores de consola ni desbordamiento horizontal del documento. Los chips de filtros fuera del viewport pertenecen a un carrusel horizontal intencional, no a un overflow de página.

**Nota sobre el estado de las pruebas:** en el checkout principal hay modificaciones sin commit ajenas a esta revisión. Los resultados anteriores corresponden a la base que estaba sirviendo la app al momento de la revisión. El worktree de `feat/rediseno-clases-alumnos-cobros` contiene un cambio en curso de otro agente en `propuesta.ts`; no se incluyó ni se tocó para este informe.

**Nota importante:** durante la verificación del anillo con cambio de estado se observó una inconsistencia entre el trazo pintado y la cifra en algunas secuencias de prueba automatizada. No se modificó la app; debe reproducirse manualmente y cubrirse con una prueba visual/QA antes de cambiar la animación.

### Capturas de referencia

Las capturas originales del brief están adjuntas a la tarea. Las recapturas de esta revisión documentan el mismo estado ANTES y los estados vacíos; **no son capturas DESPUÉS**, porque no hubo cambios de diseño. Se adjuntaron a esta tarea como evidencia de verificación: las cinco vistas, Hoy y Cobros en oscuro, cuatro estados vacíos, Agenda con clases y Hoy con todo dado.

## 8. Decisión requerida

Antes de tocar la app, el owner debe aprobar:

- la dirección general **Aero sobrio**, no una reinterpretación literal de Frutiger Aero;
- conservar la paleta y los flujos actuales;
- empezar por tokens + claridad funcional y después embellecer;
- reducir metadatos repetidos en Clases, Alumnos y Cobros;
- mantener el informe como plan maestro y convertirlo en tareas con evidencia ANTES/DESPUÉS.
