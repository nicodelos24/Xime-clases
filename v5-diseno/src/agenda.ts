/**
 * Agenda v5 (20/11): reglas de interacción del almanaque mensual.
 *
 * Un toque en una fecha solo selecciona el día y muestra sus clases en la
 * misma vista. Dos toques rápidos en la MISMA fecha abren la semana de esa
 * fecha (aun si el día está vacío o es el primero/último del mes).
 *
 * Puro: el DOM entra por parámetro para poder probarlo sin navegador.
 */
export type ToqueFecha = { fecha: string; instante: number };

/** Milisegundos máximos entre dos toques para considerarlos "doble toque". */
export const VENTANA_DOBLE_TOQUE = 350;

/**
 * Decide qué hacer con un toque sobre una fecha del mes.
 * Devuelve `true` si corresponde abrir la semana (doble toque en la misma
 * fecha); en cualquier otro caso devuelve `false` y el llamador solo
 * selecciona/pinta el día. El primer toque NO se demora: se decide al instante.
 */
export function registrarToqueFecha(
  anterior: ToqueFecha | null,
  fecha: string,
  instante: number,
  ventana = VENTANA_DOBLE_TOQUE,
): { doble: boolean; ultimo: ToqueFecha | null } {
  const doble = anterior !== null
    && anterior.fecha === fecha
    && instante - anterior.instante >= 0
    && instante - anterior.instante <= ventana;
  // Tras un doble toque se consume la secuencia: un tercer toque rápido
  // vuelve a contar comoPrimero (no encadena semanas).
  return { doble, ultimo: doble ? null : { fecha, instante } };
}

/** El mes al que pertenece un día, para mover el almanaque sin salirse del mes. */
export function mesDe(fecha: string): string {
  return fecha.slice(0, 7);
}
