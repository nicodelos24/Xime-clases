# Xime · avatar, asistencia y cierre — especificación preservada 24-nov-2026

> Estado: especificación de trabajo preservada por Roma. Esta copia local permite leerla sin acceder al respaldo externo. La implementación debe respetar el v5 aprobado, sin rediseño general ni cambios ajenos.

## Alcance

1. **Avatar de alumno**
   - Un mismo avatar por alumno en Alumnos, Cobros y ficha.
   - Sin foto: iniciales y color estable derivados del ID, como en v5.
   - Con foto: la foto elegida desde la ficha reemplaza las iniciales en las tres vistas.
   - La foto se guarda únicamente en este dispositivo, como dataURL de imagen chica.
   - «Quitar foto» vuelve a las iniciales. Editar otros datos no pierde la foto.

2. **Asistencia por toque**
   - Toque simple en la zona no interactiva de una tarjeta: Por dar → Dada; Dada → Por dar con `deshacerMarcada` y toast «Deshacer».
   - Mantener el dedo aproximadamente 450 ms en la zona no interactiva: abre el menú existente. El chip de estado y cualquier control interno conservan su acción y prioridad.
   - Arrastrar para desplazarse, gesto cancelado o botón distinto del principal: no cambia el estado.
   - Se conservan auditoría, persistencia, «Deshacer» y accesibilidad por teclado de los controles existentes.

3. **Cierre**
   - Mantener intactos los cierres ya publicados: Escape, toque fuera, deslizar hacia abajo, botón Volver y aviso de cambios sin guardar.
   - Los nuevos controles de foto y los gestos de asistencia no deben romper focus trap, retorno de foco ni cierre con cambios pendientes.

## Límites

- No modificar reglas de cobros, vencimientos, pagos, agenda ni paleta/tokens.
- No publicar ni usar Chrome compartido en esta unidad.
- Regenerar `docs/` con `build-docs.mjs` y un sello nuevo.
- Verificar typecheck, suite completa y `git diff --check`; conservar todos los tests previos.
- Trabajar en worktree/rama propia y commitear antes de entregar.
