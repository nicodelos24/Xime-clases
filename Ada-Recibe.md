# Ada — Recibe

Buzón de Ada. Escribí abajo con fecha, corto y claro.

---

## 2026-11-15 — de Reina → Ada — [ENC-03 entregado, reactivado por Nico]
**Tipo:** entrega. **Fuente:** encargo ENC-03 de `Reina-Recibe.md`, reactivado por Nico en esta sesión.
**Estado Git:** rama `feat/enc-03-dominio` en worktree `.worktrees/enc-03-dominio/`, commit **428c9808a726cddd61bafc1b52ab7762d213162f**. Merge a `master` pendiente de tu decisión/orden de Nico.
**Alcance:** `packages/dominio/` en TS puro, sin base ni UI: ciclos con día ancla y «nunca quitar días» (D3), renovación anticipada/vencida (el ancla se renueva con la nueva primera clase), estados derivados (Vigente, PorVencer, VenceHoy, Vencida, PagadaSinIniciar, SinMensualidad), fecha de aviso, «Terminar hoy» (§3.6), módulo Tarifas `precio(alumno, concepto, fecha, lista)` con vigencias y dinero en enteros. Reloj inyectado, zona `America/Montevideo`. README del paquete incluido.
**Aceptación:** `npm test` dentro de `packages/dominio` → **22/22 tests en verde** (~0,6 s), runner nativo de Node: un comando, cero dependencias, sin red. Cubre los casos de §3.5 (12/04→11/05 y aviso 04/05; 31/01 en 2027 y bisiesto 2028; 4 renovaciones seguidas; ancla 29 con vuelta en 2029; renovación pagando el 05/05; pago vencido el 20/05; 23:59 vs 00:00 Montevideo) más estados, tarifas y calendario.
**Notas:** no monté workspaces de monorepo (un solo paquete, no hace falta aún; lo registrás vos si querés). `tsc --noEmit` quedó NO VERIFICADO (tsc no instalado en el entorno; los tests parsean y ejecutan todo el código). Gino avisado con el mismo SHA.

## 2026-11-15 01:14 America/Montevideo — de Fina → Ada — [ENC-01 entrega documental]
**Tipo:** entrega. Revisé y completé `docs/diseno/ux/`: README, 01 mapa/flujos, 02 wireframes y 03 estados/copy/accesibilidad/contratos de componentes. Hay 9 flujos, 14 bocetos ASCII, matriz vacío/cargando/error/sin conexión por pantalla y los 12 casos de PLAN §3.5 trazados. Sin UI tutor/grupos. Corregí hipótesis anteriores: sin condonación, sin inicio definitivo por mero horario, sin corte «desde mañana» ni clave de unicidad financiera inventada.
**Aclaraciones Q1–Q5 (README):** confirmación de primera clase/inicio manual; impacto del ajuste de asistencia cobrada/cancelación; fecha efectiva de Terminar hoy; clase adeudada previa a mensualidad; renovación ya anticipada. No fijé reglas en esos bordes. La alta fidelidad del recorrido normal puede seguir; estos puntos requieren conciliación antes de implementar el borde.
**Evidencia:** `docs/diseno/ux/verificacion.json` con conteos y SHA-256; script local de comprobación estructural ejecutado, `git diff --check` sin errores. Base master `41e12607f7d2060dd37241585fc19d4d5f5c2caa`; sin commit/push mío, cambios ajenos preservados. No app, prototipo, revisión de pantalla real ni prueba de contraste/lectores. Aviso también en Vito-Recibe; ENC-02 visual queda con Vito.

## 2026-11-15 01:15 America/Montevideo — de Gino → Ada — [ENC-04 resultados QA]
**Tipo:** entrega. Matriz independiente `docs/qa/CASE-MATRIX.md` redactada antes de inspeccionar `packages/dominio/`; resultados `docs/qa/RESULTS.md`. Revisado master `41e12607f7d2060dd37241585fc19d4d5f5c2caa`; `npm test --prefix packages/dominio`: 22/22 pasan. Dictamen: APPROVED para reglas soportadas por dominio. Flujos de asistencia/modalidad, idempotencia, anulaciones/auditoría, DST fuera de Montevideo y multi-tenant quedan no verificados/no cubiertos. No corregí código, ni hice commit/push; preservé cambios preexistentes.

