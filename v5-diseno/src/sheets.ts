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
export const MARGEN_SHEET = { arriba: 16, abajo: 96 } as const;

/**
 * Altura máxima del sheet en px. Nunca mayor al viewport visible, con
 * `innerHeight` real del dispositivo (en celu, más confiable que 88% de un
 * `.cel` que puede crecer con el contenido). El safe-area inferior se suma
 * aparte en el CSS del sheet.
 */
export function alturaMaximaSheet(altoViewport: number, safeAreaAbajo = 0): number {
  const disponible = altoViewport - MARGEN_SHEET.arriba - MARGEN_SHEET.abajo - safeAreaAbajo;
  return Math.max(160, Math.floor(disponible));
}

/** Estilo inline que fija el sheet al viewport y limita su altura. */
export function estiloSheet(altoViewport: number, safeAreaAbajo = 0): string {
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
export function ajustarLock(profundidad: number, abrir: boolean): number {
  return Math.max(0, profundidad + (abrir ? 1 : -1));
}

/** Solo se bloquea el scroll del documento con al menos un sheet abierto. */
export function debeBloquearScroll(profundidad: number): boolean {
  return profundidad > 0;
}

/** Resultado de confirmar el cierre de un sheet con cambios sin guardar. */
export type DecisionCierre = 'guardar' | 'descartar' | 'seguir';

/**
 * Atajo para el cuadro de confirmación: las tres opciones son Guardar,
 * Descartar y Seguir editando. La decisión real la toca el dueño en la UI.
 */
export const OPCIONES_CAMBIOS_SIN_GUARDAR: readonly DecisionCierre[] = [
  'guardar', 'descartar', 'seguir',
];

/**
 * Escape sobre el cuadro de confirmación equivale a "Seguir editando": nunca
 * descarta los cambios. La UI (propuesta.ts) cierra el aviso sin tocar el sheet.
 */
export const DECISION_ESCAPE_AVISO: DecisionCierre = 'seguir';

/**
 * Un gesto de cierre por toque fuera sólo cuenta cuando termina un puntero
 * válido que empezó y terminó fuera del sheet, casi sin movimiento y sin
 * cancelación. Así un arrastre (scrollear la página) no cierra el cuadro:
 * antes se cerraba en `pointerdown`, apenas apoyaba el dedo fuera.
 *
 * `inicio`/`fin` son las coordenadas del puntero; `cancelado` marca un
 * `pointercancel` (el sistema tomó el gesto, p. ej. scroll/pull-to-refresh).
 */
export interface PuntoToque { x: number; y: number }

export const UMBRAL_MOVIMIENTO_TOQUE = 10; // px: por encima es arrastre, no tap

export function debeCerrarPorToqueFuera(
  inicio: PuntoToque | null,
  fin: PuntoToque | null,
  cancelado: boolean,
  dentroDelSheet: (p: PuntoToque) => boolean,
  umbral = UMBRAL_MOVIMIENTO_TOQUE,
): boolean {
  if (cancelado || !inicio || !fin) return false;
  if (dentroDelSheet(inicio) || dentroDelSheet(fin)) return false;
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  return Math.hypot(dx, dy) <= umbral;
}
