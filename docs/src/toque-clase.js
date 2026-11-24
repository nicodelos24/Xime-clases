/**
 * Toque en las tarjetas de clase (pedido de Nico 24-nov):
 *  - TOQUE SIMPLE en zona no interactiva: Por dar ↔ Dada, con Deshacer;
 *  - MANTENER EL DEDO (~450 ms): abre el menú que ya existía
 *    (Marcar dada / Volver a Por dar / Cancelar clase / Cambiar de día).
 *  - CANCELADA: el toque simple no cambia ni abre un menú vacío; conserva
 *    el botón Revertir existente.
 *
 * Acá sólo la POLÍTICA (pura, testeable sin navegador): qué decidir con los
 * datos del gesto. La UI (propuesta.ts) escucha pointerdown/up/cancel y
 * aplica lo que esto devuelve. Umbrales de la spec:
 *  - 450 ms de mantención para que sea pulsación larga (no un toque).
 *  - 10 px de tolerancia a movimiento: dedo que se corre al apoyar, o
 *    arrastrar para scrollear, NO es gesto sobre la tarjeta.
 */
/** Tiempo que hay que mantener para que sea «pulsación larga» (ms). */
export const DURACION_TOQUE_LARGO = 450;
/** Máximo movimiento permitido (px); más que eso es scroll, no gesto. */
export const UMBRAL_MOVIMIENTO_GESTO = 10;
/** El toque simple puede cambiar o abrir el flujo de cancelación en estos estados. */
export function toqueSimpleCambiaEstado(estado) {
    return estado === 'programada' || estado === 'dada';
}
/** Mismo repositorio y Deshacer que la acción manual; sin regla visual paralela. */
export function resultadoDeToqueSimple(estado) {
    if (estado === 'programada')
        return 'dada';
    if (estado === 'dada')
        return 'por-dar';
    return 'nada';
}
export function decisionDeAperturaDeMenu(abierta) {
    // Un gesto nunca duplica una hoja ya abierta.
    return abierta ? 'nada' : 'abrir';
}
export function decisionDeEventoToque(evento, origen, estado) {
    if (evento.consumido)
        return 'nada';
    if (evento.tipo === 'pointerup')
        return origen === 'tarjeta' ? 'evaluar-gesto' : 'nada';
    // Sólo un click accesible explícito abre el menú. El click físico del chip
    // lo maneja su propio botón, sin iniciar el gesto simple/largo de tarjeta.
    if (evento.fisico)
        return 'nada';
    return origen === 'chip' && estado !== 'cancelada' ? 'menu' : 'nada';
}
/**
 * Qué hace el gesto al soltar:
 *  - cancelado o arrastrado: nada (era scroll);
 *  - mantuvo ≥ 450 ms dentro del radio: abrir el menú solo en programada/dada;
 *  - toque corto y quieto en zona vacía: Por dar ↔ Dada, ambos con Deshacer;
 *  - cancelada: no cambia con toque simple ni abre un menú vacío.
 */
export function decisionDeGesto(gesto, estado) {
    if (gesto.cancelado)
        return 'nada';
    if (gesto.maxDesplazamiento > UMBRAL_MOVIMIENTO_GESTO)
        return 'nada';
    if (estado === 'cancelada')
        return 'nada';
    if (gesto.duracionMs >= DURACION_TOQUE_LARGO)
        return 'menu';
    return toqueSimpleCambiaEstado(estado) ? 'estado' : 'nada';
}
