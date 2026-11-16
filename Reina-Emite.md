# Reina — Emite

Registro de lo que Reina escribe en los buzones de los demás. (El contenido va en el `-Recibe.md` del destinatario.)

---

- 2026-11-15 — A Ada: entrega de ENC-03 (`packages/dominio/`, rama `feat/enc-03-dominio`, commit 428c9808a726cddd61bafc1b52ab7762d213162f; 22/22 tests verdes con `npm test`).
- 2026-11-15 — A Gino: mismo SHA disponible para su matriz independiente (ENC-04).

## 2026-11-15 21:30 America/Montevideo — De Reina — [I1 entregada]
**Tipo:** entrega. Base Expo/React Native/TypeScript con fixtures, cinco destinos y Agenda visual ENC-12 (Semana/Día/Mes/Agendar + MonthDayCell, DayStrip, ScheduledStudentRow, ModalityBadge, AvatarInitials, ScheduleFAB). Commit `2897387` en rama `feat/i1-base-movil` (worktree `.worktrees/i1-base-movil`), sobre master `08aff12`; dominio intacto.
**Aceptación:** `npm test` en apps/mobile → 15/15 en verde; `npx tsc --noEmit` limpio; `npx expo export -p web` compila; regresión dominio 22/22 separada. UI verificada en ejecución (web/Chrome emulado): 320/360/390, claro/oscuro, texto 200 % con etiquetas completas de barra, reduced-motion, retorno a fecha/vista, anti-duplicado, ocurrencia cancelada excluida. Evidencia y NO VERIFICADO: `docs/I1-EVIDENCIA-REINA.md` + `docs/diseno/ux/evidencia-i1-reina/`.
**Límites:** sin Supabase/Auth/SQL/pagos/persistencia/publicación; datos ficticios; QA queda a Gino sobre el mismo candidato.

- 2026-11-15 — A Ada: ENC-13 entregada en `64c36b7`, evidencia y límites en `docs/diseno/ux/evidencia-enc13/README.md`; revisión arquitectónica/estética pendiente.
- 2026-11-15 — A Gino: solicitado QA independiente de ENC-13 sobre `64c36b7` (320/360/390, estado visual, edición/retiro/agendar, contrato sin pagos, accesibilidad y consola).
- 2026-11-15 — A Ada: correcciones ENC-13 sobre `d5cfb7c`, fecha completa accesible y headers acotados, checks y Chrome renovados; SHA final en chat directo.
