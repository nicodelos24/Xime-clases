# ENC-13 — Informe QA independiente de Gino

**Fecha:** 2026-11-15 · **Dictamen:** NEEDS WORK · **Candidato:** `64c36b739d461239dab3fce00f86a27ee3f5b2e9` (`feat/i1-base-movil`).

## Estado y entorno

Probé un worktree detached de ese SHA, no la rama de Reina actualmente en `d5cfb7c`. El commit candidato está limpio (`git status --short --branch` → `## HEAD (no branch)`; `git diff --check 64c36b7^ 64c36b7` sin salida). Expo web en Chrome real, fixtures sintéticos, viewport 390×844 y 320×740.

## Evidencia ejecutada

- `npm test` (`apps/mobile`) — **29/29 pasaron**, incluyendo markers, vista día, edición/retiro, duplicados, no mutación financiera y regresión previa.
- `npm run typecheck` — **pasó** (`tsc --noEmit`).
- `npx expo start --web --port 8099` — app cargó. Chrome: Mes 390 px, tap 16/11 abrió Día (`/dia/2026-11-16`), tres bloques con inicio real/modalidad, tap a bloque abrió detalle editable. Consola Chrome: 0 errores/0 advertencias.
- 320 px — fallback lineal activado; objetivos de fecha medidos 48 px y no se redujeron para forzar siete columnas.
- `npx expo lint` — **NO VERIFICADO**: no hay script ni configuración de ESLint en el candidato. Expo intentó configurar ESLint automáticamente; su comando falló por incompatibilidad del CLI tras instalar ESLint 9. `npx eslint` usando esa configuración recién generada falló por `require` en contexto ESM. No atribuyo ese artefacto temporal al SHA revisado.

## Hallazgo

**P2 — Las fechas del Mes no tienen etiqueta accesible con fecha completa.** En `/agenda`, a 390×844, los botones de calendario exponen nombres como `Día 16, 3 alumnos programados, mensual e individual` y `Día 15, Hoy, sin alumnos agendados`; no incluyen mes/año (ni fecha completa). La especificación ENC-13 exige fecha completa para que lector de pantalla identifique el día fuera del contexto visual. Reproducir abriendo Agenda y consultando el árbol de accesibilidad: ref e133, etiqueta “Día 16, 3 alumnos programados, mensual e individual”. Afecta orientación accesible en la cuadrícula mensual.

## Cobertura y límites

Visto funcionando: Mes → Día por toque, vuelta indicada, bloques editables y contenido de fixture, fallback 320, marcadores por modalidad y tests de retiro/no-mutación. No comprobé visualmente el flujo completo de guardar/retiro, confirmaciones, 200 % de texto, reduced-motion, modo oscuro en app actual, lector de pantalla ni teléfono físico. Captura de Día 390×844 del candidato: `../kaia-mcp-output/page-2026-11-16T00-02-09-534Z.png` (referencia de salida MCP Chrome). No corregí código ni integré/publicé.
