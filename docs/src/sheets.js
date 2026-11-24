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
/**
 * Escape sobre el cuadro de confirmación equivale a "Seguir editando": nunca
 * descarta los cambios. La UI (propuesta.ts) cierra el aviso sin tocar el sheet.
 */
export const DECISION_ESCAPE_AVISO = 'seguir';
export const UMBRAL_MOVIMIENTO_TOQUE = 10; // px: por encima es arrastre, no tap
export function debeCerrarPorToqueFuera(inicio, fin, cancelado, dentroDelSheet, umbral = UMBRAL_MOVIMIENTO_TOQUE, maxDesplazamiento = 0) {
    if (cancelado || !inicio || !fin)
        return false;
    if (dentroDelSheet(inicio) || dentroDelSheet(fin))
        return false;
    // Un arrastre que vuelve al origen tiene inicio≈fin, pero no es un tap:
    // el movimiento máximo durante el gesto lo delata (Gino: "vuelve a origen").
    if (maxDesplazamiento > umbral)
        return false;
    const dx = fin.x - inicio.x;
    const dy = fin.y - inicio.y;
    return Math.hypot(dx, dy) <= umbral;
}
/**
 * Un tap de cierre sobre el ::backdrop de un <dialog> modal genera, justo
 * después del `pointerup` que lo cierra, un `click` sintético. Como el dialog
 * ya se cerró, ese click ya no tiene al backdrop como target y "atraviesa" a
 * la UI de debajo: en Cobros caía sobre un `cobro-fila` y volvía a abrir el
 * sheet (Gino: taps en y≈500/540 no cerraban 3/6). Hay que truncar ESE click.
 *
 * La decisión es pura: sólo suprime el primer click después de un cierre por
 * fuera, y nunca uno que ya venía marcado como consumido.
 */
export function debeSuprimirClickTrasCierre(pendiente) {
    return pendiente;
}
/**
 * Una confirmación destructiva no es un cierre cualquiera: sólo después de
 * cancelar pueden cerrarse también las acciones padre que abrieron el cuadro.
 * Antes, un F5/hashchange entre el pointerup y el click de confirmación llamaba
 * a `cerrarSheetsPorNavegacion` y dejaba vivo el sheet de acciones viejo.
 */
export function decisionCierreSheetsPorNavegacion(abierto, esCancelacion) {
    if (!abierto)
        return 'nada';
    return esCancelacion(abierto) ? 'cerrar' : 'aviso';
}
/**
 * Deslizar hacia abajo para cerrar (igual que Ropa): el dedo nace en la franja
 * superior del sheet (cabecera + aire), baja una distancia neta y al pasar el
 * umbral el gesto es de cierre. Un temblor o un arrastre hacia arriba no
 * cierran; el toque corto queda para la X y los botones.
 */
export const UMBRAL_ARRASTRE_CIERRE = 80; // px: netos hacia abajo, no acumulados
/** La franja desde donde el gesto es válido: alto de cabecera + aire. */
export const FRANJA_CIERRE = 64; // px desde el borde superior del sheet
/**
 * Decide si un gesto de arrastre (nacido en el sheet, con rect conocido)
 * cierra por deslizamiento. `dy` es el desplazamiento neto del puntero
 * (positivo = hacia abajo); un arrastre que terminó hacia arriba nunca cierra
 * aunque haya pasado por abajo. `cancelado` descarta gestos que el sistema
 * tomó (scroll/pull-to-refresh).
 */
export function debeCerrarPorDeslizar(dy, maxBajo, cancelado, umbral = UMBRAL_ARRASTRE_CIERRE, altoPanel = 0) {
    if (cancelado)
        return false;
    if (dy <= 0 || maxBajo < dy)
        return false; // hacia arriba o inconsistente
    const limite = altoPanel > 0 ? Math.min(umbral, altoPanel * 0.2) : umbral;
    return dy >= limite;
}
/**
 * Y si no cerró, cuánto debe volver: siempre a su lugar (sin cierre parcial
 * a medias) para que el sheet no quede abierto con el dedo a mitad de camino.
 */
export function deslizarRechazado() {
    return 0;
}
/**
 * Decide si un `pointerdown` ocurrió fuera del sheet, usando SOLO coordenadas
 * geométricas. Antes se usaba además `element.contains(target)`, pero con un
 * `<dialog>` modal el `::backdrop` reorienta `target` al propio dialog: el
 * `contains` daba true aunque el dedo estuviera fuera y el cierre nunca se
 * registraba (Gino en 4b5e2797: tap/clic fuera no cerraban ficha/cobros).
 *
 * `targetEsElSheet` sólo se consulta cuando el navegador no entregó coordenadas
 * útiles ((0,0)): en ese caso asumimos "dentro" para no cerrar por un toque
 * real en el contenido. No se hace `elementFromPoint` ni nada que reactive la
 * página: es pura aritmética sobre el rect del sheet.
 */
export function esToqueFuera(punto, rect, targetEsElSheet) {
    const coordenadasUtiles = punto.x !== 0 || punto.y !== 0;
    if (!coordenadasUtiles)
        return !targetEsElSheet;
    const dentro = punto.x >= rect.left && punto.x <= rect.right
        && punto.y >= rect.top && punto.y <= rect.bottom;
    return !dentro;
}
