/**
 * Precios y reglas de cobro por concepto.
 *
 * El precio por concepto NO vive en la ficha ni en la UI: acá está la única
 * tabla de precios de ejemplo. La ficha guarda una tarifa propia EXPLÍCITA;
 * la demo puede pedir uno de esos precios, pero nunca se escribe en datos
 * reales ni se usa para generar deuda.
 */

export type Concepto = 'mensualidad' | 'clase-individual';
export type AlumnoTarifa = { tarifaUYU?: number | null; [clave: string]: unknown };

/** Precios de ejemplo, SOLO para la demo sembrada. Nunca se guardan en una ficha real. */
export const PRECIOS_DEMO: Readonly<Record<Concepto, number>> = {
  mensualidad: 6500,
  'clase-individual': 2500,
};

/** Precio de un concepto para la demo (explícito, sin tocar datos de la clienta). */
export function precioDemo(concepto: Concepto, _fecha: string): number {
  return PRECIOS_DEMO[concepto];
}

/**
 * Precio vigente para un alumno y un concepto en una fecha (AAAA-MM-DD).
 * `tarifaUYU` es la tarifa propia, guardada y validada en la ficha. Si no
 * hay tarifa propia, NO hay precio: devuelve null para que no se invente
 * deuda con un precio de ejemplo.
 */
export function precio(
  alumno: AlumnoTarifa,
  concepto: Concepto,
  _fecha: string,
): number | null {
  if (concepto !== 'mensualidad' && concepto !== 'clase-individual') return null;
  const tarifa = alumno.tarifaUYU;
  return typeof tarifa === 'number' && Number.isSafeInteger(tarifa) && tarifa > 0 ? tarifa : null;
}

/**
 * Importe para precargar un diálogo de cobro. Las filas de Cobros entregan
 * `montoUYU` (ya derivado de la ficha) y NO `tarifaUYU`: llamar sólo a
 * `precio()` sobre esa fila devuelve null y abría el diálogo en $0 (D1).
 * Un pago ya registrado manda; si no, se usa la tarifa propia y, como
 * respaldo, el `montoUYU` de la fila. Nunca se inventa un precio de ejemplo.
 */
export function precioPrecargado(
  alumno: { montoUYU: number; tarifaUYU?: number | null },
  concepto: Concepto,
  fecha: string,
  pago?: { montoUYU: number } | null,
): number {
  if (pago) return pago.montoUYU;
  const propia = precio(alumno, concepto, fecha);
  if (propia !== null) return propia;
  // Si la ficha declara una tarifa inválida, no se sustituye por el respaldo:
  // se muestra 0 para que se corrija, nunca un precio inventado.
  if ('tarifaUYU' in alumno) return 0;
  return Number.isSafeInteger(alumno.montoUYU) && alumno.montoUYU > 0 ? alumno.montoUYU : 0;
}
