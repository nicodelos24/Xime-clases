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

export type EstadoClaseGesto = 'programada' | 'dada' | 'cancelada';

/** Datos del gesto que la UI recopila entre pointerdown y pointerup. */
export type GestoClase = {
  /** ms desde pointerdown hasta pointerup (o hasta que venció el toque largo). */
  duracionMs: number;
  /** Mayor distancia entre apoyar y mover (px). */
  maxDesplazamiento: number;
  /** El sistema se llevó el gesto (scroll, pull-to-refresh…). */
  cancelado: boolean;
};

/** El toque simple puede cambiar o abrir el flujo de cancelación en estos estados. */
export function toqueSimpleCambiaEstado(estado: EstadoClaseGesto): boolean {
  return estado === 'programada' || estado === 'dada';
}

export type ResultadoToqueSimple = 'dada' | 'por-dar';

/** Mismo repositorio y Deshacer que la acción manual; sin regla visual paralela. */
export function resultadoDeToqueSimple(estado: EstadoClaseGesto): ResultadoToqueSimple | 'nada' {
  if (estado === 'programada') return 'dada';
  if (estado === 'dada') return 'por-dar';
  return 'nada';
}

/**
 * Decisiones puras de los eventos del gesto de una tarjeta. La UI junta
 * pointerdown/up y el click posterior: esta política evita que un mismo
 * toque cambie asistencia dos veces y reserva el click para teclado/AT.
 */
export type EventoToque = {
  tipo: 'pointerup' | 'click';
  /** true para el click sintético de un puntero, false para teclado/AT. */
  fisico: boolean;
  /** El gesto ya fue consumido por otra decisión (largo, control, menú…). */
  consumido: boolean;
};

export function decisionDeAperturaDeMenu(abierta: boolean): 'abrir' | 'nada' {
  // Un gesto nunca duplica una hoja ya abierta.
  return abierta ? 'nada' : 'abrir';
}

export function decisionDeEventoToque(
  evento: EventoToque,
  origen: 'tarjeta' | 'chip',
  estado: EstadoClaseGesto,
): 'evaluar-gesto' | 'menu' | 'nada' {
  if (evento.consumido) return 'nada';
  if (evento.tipo === 'pointerup') return origen === 'tarjeta' ? 'evaluar-gesto' : 'nada';
  // Sólo un click accesible explícito abre el menú. El click físico del chip
  // lo maneja su propio botón, sin iniciar el gesto simple/largo de tarjeta.
  if (evento.fisico) return 'nada';
  return origen === 'chip' && estado !== 'cancelada' ? 'menu' : 'nada';
}

/**
 * Qué hace el gesto al soltar:
 *  - cancelado o arrastrado: nada (era scroll);
 *  - mantuvo ≥ 450 ms dentro del radio: abrir el menú solo en programada/dada;
 *  - toque corto y quieto en zona vacía: Por dar ↔ Dada, ambos con Deshacer;
 *  - cancelada: no cambia con toque simple ni abre un menú vacío.
 */
export function decisionDeGesto(gesto: GestoClase, estado: EstadoClaseGesto): 'menu' | 'estado' | 'nada' {
  if (gesto.cancelado) return 'nada';
  if (gesto.maxDesplazamiento > UMBRAL_MOVIMIENTO_GESTO) return 'nada';
  if (estado === 'cancelada') return 'nada';
  if (gesto.duracionMs >= DURACION_TOQUE_LARGO) return 'menu';
  return toqueSimpleCambiaEstado(estado) ? 'estado' : 'nada';
}
