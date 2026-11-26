# Propuesta de diseño (NO aplicada): apellido opcional en la ficha de alumno

> Esperando el ok de Nico (26-11-2026). Nada de esto está en el código.
> Tarea: task_8e19fbaf6bef48b7.

## Qué pidió Nico

Un botón discreto y estético que despliegue el campo apellido en la ficha de
alumno. Sirve para filtros/búsqueda y evita confusiones entre alumnas con el
mismo nombre. Quiere verlo antes de que se aplique.

## Diseño propuesto

**1. El campo NO se muestra de entrada.** Debajo del campo «Nombre *» aparece
solo un botón de texto suave (mismo estilo que «Volver a hoy» en Semana,
`.link-suave`):

    + Apellido (opcional)

- Sin borde ni caja: un renglón chico, no compite con los campos obligatorios.
- Con icono «+» pequeño (el `#i-mas2` que ya usa la app, 13 px) para que se
  entienda que despliega algo sin parecer un error.
- Al tocarlo, el botón desaparece y en su lugar aparece el campo:

    Apellido (opcional)          [× quitar]

- El campo es un `<input>` normal con placeholder «Ej.: García», maxlength 60.
- A la derecha del título, un botón de texto «quitar» que esconde el campo y
  borra el apellido (con confirmación inline no: es reversible reescribiéndolo,
  no hace falta un aviso más).

**2. El campo vive sólo en la ficha (Alumnos/Cobros).** No se agrega ningún
apellido en las tarjetas de clase ni en los desplegables «quiénes van»: ahí el
nombre solo sigue igual, como pidió Nico en el replanteo (la tarjeta muestra
quiénes van con el nombre de la ficha).

**3. Dónde se ve el apellido cuando existe:**

- Ficha: como cualquier campo más, editable.
- Lista de Alumnos y Cobros: el nombre muestra «Nombre A.» (nombre + inicial
  del apellido) cuando hay apellido, para desambiguar sin alargar las filas:
  «Lucía G.» — igual al estilo compacto que ya usa la app en la tira de días.
- Búsqueda y filtro: buscar por apellido encuentra la ficha (búsqueda normal
  sobre nombre completo, sin código nuevo: `nombre` + `apellido` concatenados).

**4. Datos.** Campo nuevo `apellido` (texto, opcional, sin validación estricta:
mismas letras y signos que el nombre). Los fichas viejas no lo tienen y siguen
funcionando igual. La identidad del alumno (su ID) no cambia: el color del
avatar y las deudas siguen atados al ID, no al texto.

**5. Cómo se guarda.** La ficha usa `validarAlumno` (src/alumnos.ts): se le suma
el campo con su mensaje. El avatar con iniciales usa el nombre; si hay apellido,
las iniciales pasan a ser primera letra del nombre + primera del apellido
(«Lucía García» → «LG», hoy sería «Lu»? no: hoy es «LG» igual si el nombre es
compuesto: «Lucía García» da «LG»). Sin apellido, queda como hoy.

## Por qué así

- Desplegable y no campo fijo: la mayoría de las fichas no lo necesita; que no
  estorbe. El botón «+» es una sola línea, sin meter una sub-pantalla.
- Inicial en las listas y no el apellido completo: mantiene las filas cortas
  (el estilo chico que a Nico le gusta) y resuelve la confusión de nombres
  repetidos.
- Cero cambios de tamaño de botones ni de áreas táctiles: usa los estilos de
  texto/enlace que ya existen (bloqueo de Nico respetado).

## Qué falta para aplicarlo

1. Ok de Nico sobre: el botón «+ Apellido (opcional)» y la inicial «Lucía G.»
   en las listas.
2. Recién con el ok: campo en el TS de ficha + tests de validación + build a
   docs/ con sello.
