/**
 * Fechas de Agenda en formato AAAA-MM-DD local (America/Montevideo).
 * Aritmética civil pura, sin reloj global (el dominio ya lo maneja aparte).
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const DIAS_LUNES = [
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
];

function esBisiesto(a: number): boolean {
  return (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
}

export function diasDelMes(anio: number, mes: number): number {
  if (mes === 2) return esBisiesto(anio) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1];
}

export function aFecha(a: number, m: number, d: number): string {
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function deFecha(f: string): { anio: number; mes: number; dia: number } {
  return { anio: Number(f.slice(0, 4)), mes: Number(f.slice(5, 7)), dia: Number(f.slice(8, 10)) };
}

/** ISO de lunes de la semana de la fecha dada. */
export function lunesDe(f: string): string {
  const { anio, mes, dia } = deFecha(f);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  const iso = (d.getUTCDay() + 6) % 7; // 0 = lunes
  d.setUTCDate(d.getUTCDate() - iso);
  return aFecha(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function sumarDias(f: string, n: number): string {
  const { anio, mes, dia } = deFecha(f);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + n);
  return aFecha(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function diaSemanaIndex(f: string): number {
  const { anio, mes, dia } = deFecha(f);
  return (new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay() + 6) % 7;
}

export function etiquetaFechaLarga(f: string): string {
  const { anio, mes, dia } = deFecha(f);
  return `${DIAS_LUNES[diaSemanaIndex(f)]} ${dia} de ${MESES[mes - 1]} de ${anio}`;
}

export function etiquetaMes(anio: number, mes: number): string {
  return `${MESES[mes - 1]} ${anio}`;
}
