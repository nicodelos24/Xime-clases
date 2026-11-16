# I1 / ENC-13 — incorporación del calendario aprobado


**Cierre técnico (15/11):** Reina incorporó `c64aa6a` en rama de integración limpia, merge `4c23ac8` + evidencia `9ed2d35`; Ada volvió a ejecutar 30/30 mobile, 22/22 dominio, typecheck, export web y recorrió Mes → Día → Programación → retorno en Chrome 390 px, sin errores de consola. El resto del documento conserva el encargo histórico; no autoriza I2 ni despliegue de Expo. Lint, lector de pantalla, 200 % nativo, teléfono físico y validación con dueña siguen pendientes.

**15/11/2026 · Preparado por Ada para que Nico lo inicie con Reina en su sesión externa OpenCode.** Esta nota no inicia ninguna sesión ni autoriza I2.

## Decisión y base

Nico aprobó visualmente el nuevo calendario de las imágenes (mes compacto sin cuadros individuales, día expandido por horas y programación editable) y pidió incorporarlo. Candidato exacto: `feat/i1-base-movil` @ `c64aa6ad958678f6caa7c3f7a4f30fe6fdbf317c`, en `.worktrees/i1-base-movil`. La demo pública estática en GitHub Pages sigue siendo la versión anterior: no confundirla con esta app Expo de I1. Esta aprobación es **visual de Nico**, no prueba con la dueña ni autorización de publicación. **QA independiente de Gino: APPROVED para el alcance ENC-13 verificado en `c64aa6a`**, informe [`qa/ENC-13-GINO-FINAL.md`](qa/ENC-13-GINO-FINAL.md): 30/30 tests, typecheck, edición/retiro y 320/390 en Chrome. Lint, lector de pantalla, escala nativa 200 % y teléfono físico siguen NO VERIFICADOS.

## Una unidad de trabajo para Reina, cuando Nico dé aviso

1. **Antes de integrar**, esperar el dictamen independiente de Gino para el SHA `c64aa6a` (corrección del NEEDS WORK previo de `64c36b7`). Si es `NEEDS WORK` o `NO VERIFICADO` para un criterio bloqueante, resolver solo ese hallazgo en la rama I1 y pedir nueva revisión; no integrar todavía. Si es `APPROVED`, incorporar el candidato I1 a `master` sin perder el trabajo ajeno.
2. Revisar `git status`, ramas, worktrees y los archivos que se cruzan. `master` tiene modificaciones y archivos sin seguir de otras personas, incluido `apps/`; **no hacer merge, checkout, stash, reset ni clean destructivo sobre ese árbol sucio**. Usar un worktree limpio de integración basado en `master`, resolver solo conflictos propios de I1/ENC-13 y conservar la historia/evidencia de ambos lados. Mantener `.codegraph/` intacto. No sustituir el prototipo HTML de Pages por Expo ni presentar ambas demos como si fueran la misma.
3. Verificar el resultado integrado: tests y typecheck en `apps/mobile`, regresión de `packages/dominio`, `git diff --check`, export web y recorrido visible Agenda → Día → Programación (incluido retorno, creación/edición/retiro, si el alcance y el entorno lo permiten); comprobar consola. Declarar por separado lint (sin configuración actualmente), lector de pantalla, texto nativo 200 %, teléfono físico y cualquier otro `NO VERIFICADO`. No inventar resultados.
4. Dejar SHA integrado, conflictos resueltos, comandos/resultados, evidencia y estado de publicación en `Ada-Recibe.md`, con línea de constancia en `Reina-Emite.md`. Si el árbol de `master` o la revisión de Gino impiden integración segura, detenerse y reportar el bloqueo concreto en vez de pisar archivos ajenos.

**Límites:** esta unidad es I1 visual y fixtures. No implementar Supabase/Auth, pagos, asistencia, Q2/Q3 ni I2; no desplegar, publicar ni hacer push por esta nota. La publicación se coordina aparte cuando el integrado esté revisado. Una nueva tarea I2 se definirá por separado después de cerrar I1.
