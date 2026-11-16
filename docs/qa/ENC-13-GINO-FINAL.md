# ENC-13 — QA independiente final · Gino

**Fecha:** 2026-11-15 · **Dictamen:** APPROVED · **Candidato exacto:** `c64aa6ad958678f6caa7c3f7a4f30fe6fdbf317c` (`feat/i1-base-movil`). Revisión puntual de criterios ENC-13 en este candidato; no implica integración, publicación ni aprobación estética total.

## Git y entorno

Probado directamente en `/home/nico/Documents/GitHub/Xime-clases/.worktrees/i1-base-movil`, HEAD exacto `c64aa6ad958678f6caa7c3f7a4f30fe6fdbf317c`. Al inicio y cierre: `git status --short --branch` → `## feat/i1-base-movil` y `?? .codegraph/` (artefacto ajeno preservado; no lo toqué). `git diff --check c64aa6a^ c64aa6a` limpio. Expo Web servido localmente en `http://localhost:8100`, Chrome real, fixtures sintéticos.

## Pruebas y comportamiento

- `npm test` en `apps/mobile`: **30/30 PASS**, incluyendo el nuevo caso de Mes que anuncia fecha completa, cantidad, selección y marcadores; regresión de marcadores, día, reprogramación/retiro, duplicados e invariantes financieros.
- `npm run typecheck`: **PASS** (`tsc --noEmit`).
- `git diff --check c64aa6a^ c64aa6a`: **PASS**, sin salida.
- Mes a 390×844: árbol de accesibilidad ahora anuncia etiquetas completas, p. ej. «Día lunes 16 de noviembre de 2026, 3 alumnos programados, mensual e individual»; presente el marcador de ambas modalidades. Tap en 16/11 abre `/dia/2026-11-16`.
- Día a 390×844: una columna horaria, siete fechas en tira, bloques muestran inicio real, nombre/modalidad; tap en programación abre detalle con encabezado «Programación».
- Edición funcional probada sobre fixture local: cambié Bruno de 16:00 a 16:30, confirmé; volvió al mismo día y el bloque reflejó 16:30. Retiro: botón de menú visible abrió confirmación con texto de no tocar ficha/pagos; al confirmar, Bruno desapareció del día y los otros eventos permanecieron.
- 320×740: el calendario usa fallback lineal, cada botón mide 48 px de alto (sin encoger los objetivos). Captura MCP Chrome actual: `qa-enc13-final-320-month.png` (viewport Mes, datos ficticios).
- Consola Chrome tras abrir/usar app: **0 errores** (3 mensajes totales; cero advertencias reportadas por Chrome).

## No verificado / límites

- `npx expo lint`: **NO VERIFICADO**. El candidato no contiene script ni configuración ESLint; `npx expo lint` intentó autoconfiguración, instaló ESLint 9 y falló con incompatibilidad del CLI («requires ESLint version 8.57.0 or greater»). Restauré `package.json`/`package-lock.json` al contenido exacto de HEAD y quité el `eslint.config.js` generado por la herramienta; el estado final quedó solo con el `.codegraph/` preexistente. No atribuyo el fallo al código ni presento lint como aprobado.
- No se probó lector de pantalla ni teléfono físico. Solo prueba responsive en Chrome web; tampoco se ejecutaron 200% de texto ni reduced-motion en dispositivo.

## Dictamen

**APPROVED** para los criterios ENC-13 cubiertos en esta pasada: la fecha completa corregida está presente en la etiqueta accesible, el flujo Mes → Día → Programación → editar/retiro funciona y las pruebas/typecheck pasan. Los límites listados siguen sin verificar; no detecté una falla funcional en el alcance comprobado.
