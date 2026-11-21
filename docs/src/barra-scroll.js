/**
 * Política pura (sin DOM) de la barra inferior que se oculta al bajar y
 * reaparece al subir, para ganar espacio útil en el celu.
 *
 * Reglas anti-parpadeo / anti-rebote:
 *  - Zona muerta: movimientos más chicos que `UMBRAL` no cambian el estado
 *    (evita que un rebote o un scroll de 1 px haga parpadear la barra).
 *  - Tope: cerca del scroll 0 la barra siempre vuelve a aparecer, aunque el
 *    último movimiento haya sido hacia abajo.
 *  - Overscroll (el "rebote" de iOS/Android) se recorta al rango válido
 *    [0, scroll máximo]: el retroceso elástico del final de la página deja
 *    de leerse como «subida» y la barra NO reaparece sola.
 *  - Histéresis: hace falta más de una muestra de subida sostenida para
 *    volver a mostrar la barra; así un solo sample ruidoso no la devuelve.
 *
 * La UI (`propuesta.ts`) se encarga del listener `scroll`, del
 * `requestAnimationFrame` y de aplicar la clase `.oculta`; acá solo se decide
 * el estado, para poder probarlo sin navegador.
 */
/** Desplazamiento mínimo (px) entre muestras para considerar un cambio de dirección. */
export const UMBRAL_SCROLL = 6;
/** Distancia al tope (px) desde la cual la barra se considera "arriba del todo". */
export const TOPE_SCROLL = 4;
/** Muestras consecutivas de subida necesarias para reaparecer. */
export const MUESTRAS_PARA_MOSTRAR = 2;
/** Recorta una posición de scroll al rango real del documento. */
export function recortarScroll(y, limite = Infinity) {
    const tope = Number.isFinite(limite) ? Math.max(0, limite) : Infinity;
    return Math.min(Math.max(0, y), tope);
}
/**
 * Decisión de una sola muestra (legacy, útil para pruebas y razonar el
 * caso simple). La UI usa `actualizarBarra`, que agrega histéresis.
 *
 * @param scrollActual  window.scrollY actual (puede estar en overscroll).
 * @param scrollPrevio  última posición de scroll ya procesada.
 * @param ocultaActual  si la barra está oculta en este momento.
 * @param limite        scroll máximo del documento (opcional).
 */
export function debeOcultarBarra(scrollActual, scrollPrevio, ocultaActual, limite = Infinity) {
    const y = recortarScroll(scrollActual, limite);
    const previo = recortarScroll(scrollPrevio, limite);
    // Arriba del todo: siempre visible, nunca se oculta.
    if (y <= TOPE_SCROLL)
        return false;
    const delta = y - previo;
    // Zona muerta: ni bajar ni subir lo suficiente → conservar el estado.
    if (Math.abs(delta) < UMBRAL_SCROLL)
        return ocultaActual;
    // Bajar oculta; subir muestra.
    return delta > 0;
}
export function estadoBarraInicial(y = 0) {
    return { oculta: false, ultimoY: recortarScroll(y), muestrasSubida: 0 };
}
/**
 * Avanza el estado con una nueva muestra de scroll. `limite` es el scroll
 * máximo del documento (`scrollHeight - innerHeight`); al recortar contra él,
 * el rebote elástico del final de la página se vuelve delta 0.
 */
export function actualizarBarra(estado, scrollActual, limite = Infinity) {
    const y = recortarScroll(scrollActual, limite);
    const previo = recortarScroll(estado.ultimoY, limite);
    if (y <= TOPE_SCROLL) {
        return { oculta: false, ultimoY: y, muestrasSubida: 0 };
    }
    const delta = y - previo;
    if (delta >= UMBRAL_SCROLL) {
        return { oculta: true, ultimoY: y, muestrasSubida: 0 };
    }
    if (delta <= -UMBRAL_SCROLL) {
        // El ruido hacia abajo entre dos muestras de subida NO reinicia el
        // contador: una subida sostenida con micro-saltos también debe mostrarla.
        const muestrasSubida = estado.muestrasSubida + 1;
        return {
            oculta: muestrasSubida >= MUESTRAS_PARA_MOSTRAR ? false : estado.oculta,
            ultimoY: y,
            muestrasSubida,
        };
    }
    return { ...estado, ultimoY: y }; // zona muerta: conserva todo
}
