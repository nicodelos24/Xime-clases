/**
 * Lógica de la pantalla Cobros (I1): derivación de estados de cobro a partir
 * de los datos de fixtures, sin React y sin dinero. El estado de mensualidad
 * lo calcula el dominio (estadoDe); las clases adeudadas vienen de la marca
 * «dada» de la sesión (clases efectivas reales llegan en I2).
 * I1 no registra pagos: registrar y anular son acciones de I2–I3 y la pantalla
 * nombra ese límite, nunca inventa montos.
 */

import type { Alumno, Ocurrencia, Programacion } from '../../../packages/datos/src/tipos.ts';
import { clasesDelDia } from '../../../packages/datos/src/resumenHoy.ts';
import { diaSiguiente } from '../../../packages/dominio/src/fechas.ts';

/** Estado de cobro de una mensualidad, derivado por el dominio. */
export type EstadoCobroMensual = 'PorVencer' | 'Vencida';

/** Concepto del cobro: mensualidad venciendo/vencida, o clases sueltas adeudadas. */
export interface CobroPendiente {
  alumnoId: string;
  nombre: string;
  modalidad: 'mensual' | 'individual';
  concepto: 'Mensualidad' | 'Clases sueltas';
  estado: EstadoCobroMensual | 'Adeudada';
  /** Texto de fecha del dominio (vence/venció el día X) o clases adeudadas. */
  detalle: string;
}

/**
 * Cobros derivados de fixtures para «hoy». Los mensuales con ciclo conocido
 * en fixtures usan su día ancla; sin ciclos en I1, el ejemplo de calendario
 * no se inventa: solo se listan los estados que los fixtures pueden sostener.
 */
export function cobrosPendientes(
  alumnos: Alumno[],
  ocurrencias: Ocurrencia[],
  programaciones: Programacion[],
  hoy: string,
  dadas: ReadonlySet<string>,
): CobroPendiente[] {
  // Clases sueltas dadas (clase efectiva visual I1) que aún no están cobradas:
  // en I1 ninguna está cobrada, así que cada clase dada de un alumno individual
  // queda adeudada. Los pagos reales llegan con I2.
  const adeudadas = new Map<string, number>();
  for (const clase of clasesDelDia(alumnos, ocurrencias, programaciones, hoy, dadas)) {
    if (!clase.dada) continue; // solo las clases efectivamente dadas generan deuda
    const a = alumnos.find((x) => x.id === clase.alumnoId);
    if (!a || a.modalidad !== 'individual') continue;
    adeudadas.set(a.id, (adeudadas.get(a.id) ?? 0) + 1);
  }
  const salida: CobroPendiente[] = [];
  for (const [alumnoId, cantidad] of adeudadas) {
    const a = alumnos.find((x) => x.id === alumnoId)!;
    salida.push({
      alumnoId,
      nombre: a.nombre,
      modalidad: 'individual',
      concepto: 'Clases sueltas',
      estado: 'Adeudada',
      detalle: `Debe ${cantidad} ${cantidad === 1 ? 'clase' : 'clases'} ${cantidad === 1 ? 'dada' : 'dadas'} sin cobrar (demo)`,
    });
  }
  return salida;
}

/** Texto relativo a «hoy»: «vence hoy», «vence en N días», «venció hace N días». */
export function detalleVencimiento(ultimoDia: string, hoy: string): string {
  if (ultimoDia === hoy) return 'Vence hoy';
  // Comparación civil simple (mismo formato AAAA-MM-DD ordenable).
  // Positivo = el vencimiento está a futuro: días entre «hoy» y «último día».
  const dias = diasEntreSimple(hoy, ultimoDia);
  return dias > 0 ? `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}` : `Venció hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}`;
}

function diasEntreSimple(a: string, b: string): number {
  const da = new Date(`${a}T12:00:00Z`).getTime();
  const db = new Date(`${b}T12:00:00Z`).getTime();
  return Math.round((db - da) / 86400000);
}

/** Próximo día (helper propio del módulo; sin tocar el dominio). */
export function diaSiguienteCobro(f: string): string {
  return diaSiguiente(f);
}

/** Pestañas de Cobros y sus etiquetas (el número lo pone la pantalla). */
export const PESTANIAS_COBROS = ['porVencer', 'vencidas', 'adeudadas', 'historial'] as const;
export type PestaniaCobros = (typeof PESTANIAS_COBROS)[number];

export const ETIQUETA_PESTANIA: Record<PestaniaCobros, string> = {
  porVencer: 'Por vencer',
  vencidas: 'Vencidas',
  adeudadas: 'Adeudadas',
  historial: 'Historial',
};
