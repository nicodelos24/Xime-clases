/**
 * Política de sheets (cuadros emergentes) del prototipo v5, sin DOM:
 *  - lock de scroll del documento mientras haya un sheet abierto;
 *  - medición de altura (viewport real + safe-area) para que no queden
 *    recortados abajo;
 *  - detección de cambios sin guardar en los formularios, con cuatro
 *    decisiones posibles al querer cerrar.
 *
 * La UI (propuesta.ts) aplica el lock al body, mide con `getBoundingClientRect`
 * y muestra el cuadro de confirmación; acá solo se deciden los valores para
 * poder probarlo sin navegador.
 */
/** Márgenes del sheet: arriba para dejar ver la página, abajo para la cápsula. */
export const MARGEN_SHEET = { arriba: 16, abajo: 96 };
/**
 * Altura máxima del sheet en px. Nunca mayor al viewport visible, con
 * `innerHeight` real del dispositivo (en celu, más confiable que 88% de un
 * `.cel` que puede crecer con el contenido). El safe-area inferior se suma
 * aparte en el CSS del sheet.
 */
export function alturaMaximaSheet(altoViewport, safeAreaAbajo = 0) {
    const disponible = altoViewport - MARGEN_SHEET.arriba - MARGEN_SHEET.abajo - safeAreaAbajo;
    return Math.max(160, Math.floor(disponible));
}
/** Estilo inline que fija el sheet al viewport y limita su altura. */
export function estiloSheet(altoViewport, safeAreaAbajo = 0) {
    const max = alturaMaximaSheet(altoViewport, safeAreaAbajo);
    // Anclado abajo (sobre la cápsula) con tope de altura: el borde superior
    // queda a MARGEN_SHEET.arriba del borde del viewport, sin importar que el
    // contenido del documento mida más de una pantalla.
    return `max-height:${max}px;top:auto;bottom:var(--sheet-base);`;
}
/**
 * Profundidad de locks: si se abren dos sheets (p. ej. historial → pago),
 * cerrar uno no debe desbloquear la página mientras el otro siga abierto.
 * Devuelve la nueva profundidad, nunca negativa.
 */
export function ajustarLock(profundidad, abrir) {
    return Math.max(0, profundidad + (abrir ? 1 : -1));
}
/** Solo se bloquea el scroll del documento con al menos un sheet abierto. */
export function debeBloquearScroll(profundidad) {
    return profundidad > 0;
}
/**
 * Atajo para el cuadro de confirmación: las tres opciones son Guardar,
 * Descartar y Seguir editando. La decisión real la toca el dueño en la UI.
 */
export const OPCIONES_CAMBIOS_SIN_GUARDAR = [
    'guardar', 'descartar', 'seguir',
];
