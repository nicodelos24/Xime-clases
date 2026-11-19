/**
 * Espejo de las pantallas de la app v5 (prototipo HTML): estado de las clases
 * del día, de la semana y los KPIs de la vista Hoy.
 *
 * Puro y sin reloj propio: la hora entra por parámetro, así los tests usan
 * `relojFalso` y la UI usa el reloj del dispositivo.
 */
import type { Clase } from './clases.ts';
import { lunesDe, sumarDias } from './fechas.ts';
import type { InstanteMs, Reloj } from './reloj.ts';

export type ResumenHoy = {
  fecha: string;
  /** Clases de esa fecha, ordenadas por hora. */
  clases: Clase[];
  /** Cuántas de ellas siguen "por dar" (programadas). */
  porDar: number;
  /** Cuántas quedaron dadas (o canceladas y contadas aparte abajo). */
  dadas: number;
  canceladas: number;
  /** Para el anillo: [dadas, total] de las clases no canceladas. */
  anillo: [number, number];
  /** "1 clase grupal por dar" / "2 clases grupales por dar"… */
  frase: string;
  /** ¿Pasó la primera hora del día? (para el saludo de la barra) */
  algunaClasePasada: boolean;
};

const plural = (n: number, uno: string, muchos: string) => (n === 1 ? uno : muchos);

/** Resumen de un día concreto (ya reconciliado). */
export function resumenHoy(clases: Clase[], fecha: string): ResumenHoy {
  const delDia = clases
    .filter((c) => c.fecha === fecha)
    .sort((a, b) => a.minutos - b.minutos);

  const programadas = delDia.filter((c) => c.estado === 'programada');
  const dadas = delDia.filter((c) => c.estado === 'dada');
  const canceladas = delDia.filter((c) => c.estado === 'cancelada');
  const activas = delDia.filter((c) => c.estado !== 'cancelada');

  const porDar = programadas.length;
  return {
    fecha,
    clases: delDia,
    porDar,
    dadas: dadas.length,
    canceladas: canceladas.length,
    anillo: [dadas.length, activas.length],
    frase:
      porDar === 0
        ? 'Sin clases por dar'
        : `${porDar} ${plural(porDar, 'clase grupal', 'clases grupales')} por dar`,
    algunaClasePasada: dadas.length > 0 || delDia.some((c) => c.estado === 'dada'),
  };
}

/** ¿El día tiene alguna clase? (para el punto de la tira). */
export function tieneClases(clases: Clase[], fecha: string): boolean {
  return clases.some((c) => c.fecha === fecha);
}

/** Las clases de un día en orden de hora. */
export function clasesDelDia(clases: Clase[], fecha: string): Clase[] {
  return clases.filter((c) => c.fecha === fecha).sort((a, b) => a.minutos - b.minutos);
}

/** Clases de la semana (lunes a domingo) de la fecha dada, en orden de día. */
export function clasesDeLaSemana(clases: Clase[], fecha: string): { fecha: string; clases: Clase[] }[] {
  const lunes = lunesDe(fecha);
  return Array.from({ length: 7 }, (_, i) => {
    const dia = sumarDias(lunes, i);
    return { fecha: dia, clases: clasesDelDia(clases, dia) };
  });
}

/**
 * Reconciliación de arranque: el cron local avanza solo mientras la app
 * está abierta; al abrirla se recorren las clases con el reloj actual y
 * se marcan las que quedaron con la hora pasada (plan §2.1).
 */
export function alAbrir<T extends { estado: string }>(
  clases: T[],
  reconciliar: (cs: T[], ahora: InstanteMs) => T[],
  reloj: Reloj,
): T[] {
  return reconciliar(clases, reloj.ahora());
}
