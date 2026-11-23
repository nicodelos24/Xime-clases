/**
 * Pista visual de desplazamiento horizontal de una tira (los chips de
 * Alumnos). Política pura, sin DOM: decide qué bordes necesitan degradado
 * según la posición del scroll, y la UI (`propuesta.ts`) solo prende o apaga
 * las clases `.pista-inicio` / `.pista-fin`.
 *
 * Por qué existe (QA romper-y-pulir, 23-nov): a 320 px los 9 chips de Alumnos
 * miden 792 px sobre 268 px de ancho, con la barra de scroll oculta por
 * diseño, y no había ninguna señal de que la tira se pudiera deslizar.
 *
 * Reglas:
 *  - Si todo el contenido entra (sin desborde real) no hay pista: nada que
 *    insinuar y ningún borde se apaga.
 *  - Al principio de la tira solo se insinúa el borde derecho; al final, solo
 *    el izquierdo; en el medio, los dos.
 *  - Tolerancia de 1 px: el scroll fraccionario y el rebote elástico de iOS
 *    (scrollLeft negativo o pasado del máximo) no hacen parpadear la pista.
 */
/** Tolerancia en px para absorber sub-píxeles y el rebote elástico. */
const TOLERANCIA = 1;
/**
 * Qué bordes insinuar. Con la tira entera a la vista devuelve `{ inicio:false,
 * fin:false }` (sin degradados): la pista solo aparece cuando hay algo que
 * deslizar.
 */
export function pistaDeTira({ scrollLeft, scrollWidth, clientWidth }) {
    const recorrido = Math.max(0, scrollWidth - clientWidth);
    if (recorrido <= TOLERANCIA)
        return { inicio: false, fin: false };
    const x = Math.min(Math.max(0, scrollLeft), recorrido);
    return {
        inicio: x > TOLERANCIA,
        fin: x < recorrido - TOLERANCIA,
    };
}
