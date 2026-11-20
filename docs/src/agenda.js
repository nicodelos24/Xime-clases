/** Milisegundos máximos entre dos toques para considerarlos "doble toque". */
export const VENTANA_DOBLE_TOQUE = 350;
/**
 * Decide qué hacer con un toque sobre una fecha del mes.
 * Devuelve `true` si corresponde abrir la semana (doble toque en la misma
 * fecha); en cualquier otro caso devuelve `false` y el llamador solo
 * selecciona/pinta el día. El primer toque NO se demora: se decide al instante.
 */
export function registrarToqueFecha(anterior, fecha, instante, ventana = VENTANA_DOBLE_TOQUE) {
    const doble = anterior !== null
        && anterior.fecha === fecha
        && instante - anterior.instante >= 0
        && instante - anterior.instante <= ventana;
    // Tras un doble toque se consume la secuencia: un tercer toque rápido
    // vuelve a contar comoPrimero (no encadena semanas).
    return { doble, ultimo: doble ? null : { fecha, instante } };
}
/** El mes al que pertenece un día, para mover el almanaque sin salirse del mes. */
export function mesDe(fecha) {
    return fecha.slice(0, 7);
}
