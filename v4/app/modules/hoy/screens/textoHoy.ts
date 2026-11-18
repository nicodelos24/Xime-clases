/**
 * Textos y constantes de Hoy (I1): derivados de las clases del día, sin React,
 * sin datos inventados. Los montos de Cobro no se calculan acá (I2): los KPI
 * muestran «—» y el límite se nombra en la pantalla y su accesibilidad.
 */

import type { ClaseDelDia } from '../../../packages/datos/src/resumenHoy.ts';
import { etiquetaFechaLarga } from '../../../packages/datos/src/fechas.ts';

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** «Martes 17 de noviembre» (sin año) para el kicker del hero. */
export function kickerFecha(f: string): string {
  return capitalizar(etiquetaFechaLarga(f).replace(/ de \d{4}$/, ''));
}

/** Título del hero: lo que falta por dar. */
export function tituloProgreso(dadas: number, total: number): string {
  if (total === 0) return 'Sin clases hoy';
  const quedan = total - dadas;
  if (quedan === 0) return 'Día completo';
  return `${quedan} ${quedan === 1 ? 'clase por dar' : 'clases por dar'}`;
}

/** Línea del hero: cuántas hay, cuántas van, o el día completo. */
export function lineaProgreso(clases: ClaseDelDia[]): string {
  const total = clases.length;
  const dadas = clases.filter((c) => c.dada).length;
  if (total === 0) return 'Sin clases programadas hoy';
  if (dadas === total) return 'Todas las clases del día están dadas';
  return `${total} clases hoy · ${dadas} ${dadas === 1 ? 'dada' : 'dadas'}`;
}

/** Kicker del botón «Dada»: siempre con ícono de forma (check), nunca solo texto. */
export const DADA_ETIQUETA = 'Dada';

/** Aviso de vencimientos I1: límite explícito, sin deudas inventadas. */
export const AVISO_VENCIMIENTOS = {
  titulo: 'Vencimientos de la semana',
  detalle: 'Se listan al activar cobros (I2)',
} as const;

/**
 * Entrada escalonada (demo v4): hero → KPI (90/150/210) → filas → aviso (520).
 * Duraciones y retrasos dentro de la guía 150–350 ms.
 */
export const RETRASO_ENTRADA = {
  hero: 0,
  kpi: [90, 150, 210],
  filaBase: 240,
  filaPaso: 90,
  aviso: 520,
  duracion: 320,
} as const;

/** Micro-festejo al dar una clase: 6 puntos pastel que brotan, 320 ms. */
export const FESTEJO = {
  duracion: 320,
  colores: ['#15A5A2', '#5E4285', '#F2C48D', '#8FD0AE', '#F0A9BC', '#A8DED9'],
} as const;

/** Anillo del hero (demo: 84 px, trazo 8, circunferencia ≈ 223, latido al completar). */
export const ANILLO = {
  tamaño: 84,
  grosor: 8,
  radio: 35.5,
  duracion: 320,
  latido: 320,
} as const;

/** Botón «Dada» y aviso: colores tomados de tokens.css del demo aprobado. */
export const HOY_COLORES = {
  dadaReposo: { fondo: '#EAF7F5', borde: '#A8DED9', texto: '#0B6B6A' },
  dadaTocada: { fondo: '#0E7C7B', texto: '#FFFFFF' },
  anilloPista: 'rgba(255,255,255,0.22)',
  anilloValor: '#CDEFEA',
  anilloValorCompleto: '#FFFFFF',
  avisoFondo: '#FFF3CF',
  avisoTinta: '#7A5A00',
  proxCard: 'rgba(8,69,74,0.30)',
  proxBorde: 'rgba(255,255,255,0.22)',
  proxIconoFondo: '#CDEFEA',
  proxIconoTinta: '#08454A',
  kickerClaro: '#CDEFEA',
} as const;
