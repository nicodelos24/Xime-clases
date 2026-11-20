/**
 * Política pura (sin DOM) de la barra inferior que se oculta al bajar y
 * reaparece al subir, para ganar espacio útil en el celu.
 *
 * Reglas anti-parpadeo:
 *  - Zona muerta: movimientos más chicos que `UMBRAL` no cambian el estado
 *    (evita que un rebote o un scroll de 1 px haga parpadear la barra).
 *  - Tope: cerca del scroll 0 la barra siempre vuelve a aparecer, aunque el
 *    último movimiento haya sido hacia abajo.
 *  - Overscroll negativo (el "rebote" de iOS) se trata como 0.
 *
 * La UI (`propuesta.ts`) se encarga del listener `scroll`, del `requestAnimationFrame`
 * y de aplicar la clase `.oculta`; acá solo se decide el estado, para poder
 * probarlo sin navegador.
 */
/** Desplazamiento mínimo (px) entre muestras para considerar un cambio de dirección. */
export const UMBRAL_SCROLL = 6;
/** Distancia al tope (px) desde la cual la barra se considera "arriba del todo". */
export const TOPE_SCROLL = 4;
/**
 * Estado de la barra: `true` = debe estar oculta, `false` = debe estar visible.
 *
 * @param scrollActual  window.scrollY actual (puede ser negativo por overscroll).
 * @param scrollPrevio  última posición de scroll ya procesada.
 * @param ocultaActual  si la barra está oculta en este momento.
 */
export function debeOcultarBarra(scrollActual, scrollPrevio, ocultaActual) {
    const y = Math.max(0, scrollActual);
    // Arriba del todo: siempre visible, nunca se oculta.
    if (y <= TOPE_SCROLL)
        return false;
    const delta = y - scrollPrevio;
    // Zona muerta: ni bajar ni subir lo suficiente → conservar el estado.
    if (Math.abs(delta) < UMBRAL_SCROLL)
        return ocultaActual;
    // Bajar oculta; subir muestra.
    return delta > 0;
}
