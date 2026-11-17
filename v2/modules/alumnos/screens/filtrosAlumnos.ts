/**
 * Lógica de la pantalla Alumnos (I1): búsqueda por nombre y chips de filtro.
 * La búsqueda es independiente del filtro y del orden; ninguna búsqueda muestra
 * datos de pago (las derivaciones de ciclo entran con I2).
 */

import type { FiltroAlumnos } from '../../../packages/datos/src/tipos';

export type FiltroAlumnosV2 = FiltroAlumnos;

export const FILTROS_ALUMNOS: FiltroAlumnosV2[] = ['todos', 'mensual', 'individual'];

export const ETIQUETA_FILTRO: Record<FiltroAlumnosV2, string> = {
  todos: 'Todos',
  mensual: 'Mensuales',
  individual: 'Por clase individual',
};

/** Búsqueda por nombre, sin acentos (acento-insensible, case-insensitive). */
export function sinAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function coincideBusqueda(nombre: string, consulta: string): boolean {
  const q = sinAcentos(consulta).trim().toLowerCase();
  if (!q) return true;
  return sinAcentos(nombre).toLowerCase().includes(q);
}
