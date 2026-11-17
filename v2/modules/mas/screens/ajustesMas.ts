/**
 * Lógica de la pantalla Más (W11): lista de precios de demo + ajuste de avisos.
 * Los precios vivan en el dominio (tarifas.ts) con fecha de vigencia; la
 * pantalla solo los muestra y calcula. Cambiar el precio de verdad (con
 * vigencia y revisión) es I2: acá se ve la lista y su regla, no se edita.
 * El N de aviso (§3.4 de v1/PLAN): 7 por defecto, opciones 10 y «vence hoy».
 */

import { precio, validarListaPrecios, type ListaPrecios } from '../../../packages/dominio/src/tarifas.ts';
import type { ConceptoTarifa } from '../../../packages/dominio/src/mensualidad.ts';

/** Lista de precios de la demo (los reales se cargan por dueña en I2). */
export const LISTA_PRECIOS_DEMO: ListaPrecios = {
  mensualidad: [{ desde: '2026-01-01', precio: 1800 }],
  claseSuelta: [{ desde: '2026-01-01', precio: 700 }],
};

/** Conceptos que muestra Más, con etiqueta (orden del wireframe W11). */
export const CONCEPTOS_MAS: ReadonlyArray<{ concepto: ConceptoTarifa; etiqueta: string }> = [
  { concepto: 'mensualidad', etiqueta: 'Mensualidad' },
  { concepto: 'claseSuelta', etiqueta: 'Clase por clase' },
];

/** Opciones de días de aviso (§3.4: 7 defecto, 10 y vence hoy). */
export const OPCIONES_AVISO = [7, 10, 0] as const;
export type DiasAviso = (typeof OPCIONES_AVISO)[number];

export const ETIQUETA_AVISO: Record<DiasAviso, string> = {
  7: '7 días',
  10: '10 días',
  0: 'Vence hoy',
};

export function esOpcionValida(n: number): n is DiasAviso {
  return (OPCIONES_AVISO as readonly number[]).includes(n);
}

/** Precio vigente de un concepto para «hoy», con error explícito si falta. */
export function precioVigente(concepto: ConceptoTarifa, hoy: string, lista: ListaPrecios = LISTA_PRECIOS_DEMO): number {
  validarListaPrecios(lista);
  return precio(null, concepto, hoy, lista);
}

/** Formato de pesos uruguayos sin centavos, para la fila de precio. */
export function formatoUYU(n: number): string {
  if (!Number.isInteger(n) || n < 0) return '—';
  return `$ ${n.toLocaleString('es-UY')}`;
}

/** Las dos dueñas del piloto (1 grupo, 2 dueños, mismo rol). */
export const DUENIAS = [
  { nombre: 'Xime', rol: 'dueña' },
  { nombre: 'Dueño 2', rol: 'dueño' },
] as const;

/** Secciones de Más, en el orden del wireframe; las de I2 van como límite. */
export interface FilaMas {
  id: string;
  etiqueta: string;
  valor?: string;
  disponible: boolean;
  detalle?: string;
}

export function filasMas(diasAviso: DiasAviso, hoy: string): FilaMas[] {
  const precios = CONCEPTOS_MAS.map(({ concepto, etiqueta }) => ({
    id: `precio-${concepto}`,
    etiqueta,
    valor: formatoUYU(precioVigente(concepto, hoy)),
    disponible: false,
    detalle: 'Cambiar precio con vigencia y revisión: I2',
  }));
  return [
    ...precios,
    {
      id: 'aviso',
      etiqueta: 'Avisar cuando falten',
      valor: ETIQUETA_AVISO[diasAviso],
      disponible: true,
      detalle: 'Push en la app y lista Por vencer en Hoy (§3.4)',
    },
    {
      id: 'horario',
      etiqueta: 'Horario de clases',
      disponible: false,
      detalle: 'Consulta y cancelar clase con motivo: I2',
    },
    {
      id: 'cuentas',
      etiqueta: 'Cuentas',
      valor: DUENIAS.map((d) => d.nombre).join(' · '),
      disponible: false,
      detalle: 'Solo las dos dueñas del piloto, sin roles extra',
    },
    {
      id: 'reportes',
      etiqueta: 'Reportes y exportar CSV',
      disponible: false,
      detalle: 'Con pagos reales en la base (I2)',
    },
    {
      id: 'sesion',
      etiqueta: 'Cerrar sesión',
      disponible: false,
      detalle: 'Con autenticación (I2)',
    },
  ];
}
