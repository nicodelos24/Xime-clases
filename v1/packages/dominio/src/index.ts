/**
 * Núcleo de dominio de Clases (ENC-03): reglas de negocio puras, sin base de
 * datos, sin UI y sin framework. Depende solo de TypeScript y del runtime.
 *
 * Exports públicos:
 * - `fechas.ts`  — fechas locales AAAA-MM-DD, aritmética civil, reloj inyectado, zona horaria.
 * - `mensualidad.ts` — ciclos con día ancla, «nunca quitar días», renovaciones, estados, cierre.
 * - `tarifas.ts` — módulo Tarifas: `precio(alumno, concepto, fecha, lista)`, vigencias, dinero entero.
 */

export * from './fechas.ts';
export * from './mensualidad.ts';
export * from './tarifas.ts';
