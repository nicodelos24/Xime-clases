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
export * from './reloj.ts';
export * from './fechas.ts';
export * from './clases.ts';
export * from './whatsapp.ts';
export * from './resumen.ts';
export * from './agenda.ts';
export * from './agenda-mes.ts';
export * from './navegacion.ts';
export * from './barra-scroll.ts';
export * from './repositorio.ts';
export * from './demo.ts';
export * from './cobros.ts';
export * from './alumnos.ts';
export * from './tarifas.ts';
