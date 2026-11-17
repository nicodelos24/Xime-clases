/**
 * Módulo «Tarifas» (PLAN §3.7): el único lugar donde vive el cálculo del precio.
 *
 * - Los precios no van fijos en el código: los carga la dueña en Ajustes.
 * - Cada precio tiene **fecha de vigencia**: cambiar el precio no altera pagos pasados.
 * - Dinero en **enteros** (UYU sin centavos); se rechaza cualquier otra forma.
 * - Interfaz estable `precio(alumno, concepto, fecha, lista)`: hoy devuelve el
 *   precio de lista; mañana puede sumar descuentos (hermanos, promos, becas,
 *   packs) sin tocar Pagos, Asistencia ni las pantallas.
 */

import type { ConceptoTarifa } from './mensualidad.ts';
import { type FechaLocal, assertFecha } from './fechas.ts';

/** Alumno en forma opaca: hoy no se usa; queda en la interfaz para descuentos futuros. */
export interface AlumnoPrecio {
  readonly id: string;
}

export interface VigenciaPrecio {
  /** Fecha local desde la que rige el precio (inclusive). */
  desde: FechaLocal;
  /** Monto en enteros de UYU. */
  precio: number;
}

/** Un concepto (p. ej. "mensualidad", "claseSuelta") con su historia de precios. */
export type PreciosDeConcepto = VigenciaPrecio[];

export interface ListaPrecios {
  readonly [concepto: string]: PreciosDeConcepto;
}

/** Precio de lista vigente para el concepto en la fecha dada: la última vigencia con `desde <= fecha`. */
export function precio(
  _alumno: AlumnoPrecio | null,
  concepto: ConceptoTarifa,
  fecha: FechaLocal,
  lista: ListaPrecios,
): number {
  assertFecha(fecha);
  const historial = lista[concepto];
  if (!historial || historial.length === 0) {
    throw new Error(`Sin precio configurado para el concepto "${concepto}"`);
  }
  let elegido: VigenciaPrecio | null = null;
  for (const v of historial) {
    validarVigencia(concepto, v);
    if (v.desde <= fecha && (elegido === null || v.desde >= elegido.desde)) elegido = v;
  }
  if (elegido === null) {
    throw new Error(`El concepto "${concepto}" no tenía precio vigente el ${fecha}`);
  }
  return elegido.precio;
}

function validarVigencia(concepto: string, v: VigenciaPrecio): void {
  if (!Number.isInteger(v.precio) || v.precio < 0) {
    throw new Error(`Precio inválido para "${concepto}" desde ${v.desde}: ${v.precio} (el dinero es un entero ≥ 0 en UYU)`);
  }
  assertFecha(v.desde);
}

/** Valida una lista entera (la usa la capa de Ajustes al guardar). */
export function validarListaPrecios(lista: ListaPrecios): void {
  for (const [concepto, historial] of Object.entries(lista)) {
    if (!Array.isArray(historial) || historial.length === 0) {
      throw new Error(`El concepto "${concepto}" no tiene precios`);
    }
    for (const v of historial) validarVigencia(concepto, v);
  }
}
