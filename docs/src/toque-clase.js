/**
 * Interacción de las tarjetas de clase (replanteo de Nico 26-nov):
 *  - TOQUE EN EL CHIP de estado: cicla Por dar → Dada → Cancelada → Por dar.
 *  - TOQUE SIMPLE en la zona no interactiva de la TARJETA: abre/cierra el
 *    desplegable «quiénes van» (no cambia estado).
 *  - MANTENER EL DEDO (~450 ms) sobre la tarjeta: abre el menú completo
 *    (Marcar dada / Volver a Por dar / Cancelar clase / Cambiar de día).
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
/** El ciclo del chip siempre tiene un estado siguiente (es un ciclo cerrado). */
export function toqueSimpleCambiaEstado(estado) {
    return estado === 'programada' || estado === 'dada' || estado === 'cancelada';
}
/**
 * Siguiente estado del ciclo que pisa el chip: Por dar → Dada → Cancelada
 * → Por dar. La cancelación por chip es directa (sin sheet ni WhatsApp);
 * el aviso diferido de cancelación la cubre por si fue un error.
 */
export function resultadoDeCicloDeChip(estado) {
    if (estado === 'programada')
        return 'dada';
    if (estado === 'dada')
        return 'cancelada';
    return 'por-dar';
}
/** Etiqueta del próximo paso del ciclo, para el aria-label del chip. */
export function etiquetaProximoPaso(estado) {
    const proximo = resultadoDeCicloDeChip(estado);
    if (proximo === 'dada')
        return 'marcar dada';
    if (proximo === 'cancelada')
        return 'cancelar clase';
    return 'volver a Por dar';
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
    // lo maneja su propio botón (ciclo de estados), sin iniciar el gesto.
    if (evento.fisico)
        return 'nada';
    return origen === 'chip' ? 'menu' : 'nada';
}
/**
 * Qué hace el gesto sobre la TARJETA al soltar:
 *  - cancelado o arrastrado: nada (era scroll);
 *  - mantuvo ≥ 450 ms dentro del radio: abrir el menú;
 *  - toque corto y quieto en zona vacía: abrir/cerrar «quiénes van»
 *    (la tarjeta ya NO cambia estado: eso es del chip).
 */
export function decisionDeGesto(gesto, _estado) {
    if (gesto.cancelado)
        return 'nada';
    if (gesto.maxDesplazamiento > UMBRAL_MOVIMIENTO_GESTO)
        return 'nada';
    if (gesto.duracionMs >= DURACION_TOQUE_LARGO)
        return 'menu';
    return 'desplegar';
}
