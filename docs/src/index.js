/**
 * Núcleo de funcionamiento v5 (plan `v5/PLAN.md` §2):
 *  - `reloj.js`      — reloj del instituto (America/Montevideo) inyectable.
 *  - `fechas.js`     — aritmética de calendario pura.
 *  - `clases.js`     — estados, auto-marcado por hora, cancelación y auditoría.
 *  - `whatsapp.js`   — Opción A: deep links wa.me con mensaje editable.
 *  - `resumen.js`    — espejo de las pantallas (Hoy, semana) y arranque.
 *
 * Sin DOM, sin `Date.now()` y sin estado global: la UI (propuesta.js) los
 * consume; las pruebas (test/*.test.ts) los consumen con reloj simulado.
 */
export * from "./reloj.js?v=202611210422";
export * from "./fechas.js?v=202611210422";
export * from "./clases.js?v=202611210422";
export * from "./whatsapp.js?v=202611210422";
export * from "./resumen.js?v=202611210422";
export * from "./agenda.js?v=202611210422";
export * from "./navegacion.js?v=202611210422";
export * from "./barra-scroll.js?v=202611210422";
export * from "./repositorio.js?v=202611210422";
export * from "./demo.js?v=202611210422";
export * from "./cobros.js?v=202611210422";
export * from "./alumnos.js?v=202611210422";
