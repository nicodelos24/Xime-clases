/**
 * Aritmética de calendario pura, sin reloj y sin `Date` para la aritmética
 * (algoritmo de día civil de Howard Hinnant). El reloj vive en `reloj.js`.
 *
 * `FechaLocal` es "AAAA-MM-DD" (día civil, no instante).
 */

/** Días desde 1970-01-01. */
export function diasDesdeCivil({ y, m, d }: { y: number; m: number; d: number }): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const mp = (m + 9) % 12;
  const doy = Math.floor((153 * mp + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Día civil de un número de días desde la época. */
export function civilDesdeDias(n: number): { y: number; m: number; d: number } {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: m <= 2 ? y + 1 : y, m, d };
}

export function esBisiesto(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/** El día no tiene mes 13 ni día fuera de rango. */
export function diasDelMes(y: number, m: number): number {
  if (m === 12) return 31;
  if (m < 1 || m > 12) throw new Error(`Mes inválido: ${m} (1..12)`);
  if (m === 2) return esBisiesto(y) ? 29 : 28;
  if (m === 4 || m === 6 || m === 9 || m === 11) return 30;
  return 31;
}

const REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function esFechaValida(f: string): boolean {
  if (!REGEX.test(f)) return false;
  const [y, m, d] = f.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= diasDelMes(y, m);
}

export function parseFecha(f: string): { y: number; m: number; d: number } {
  if (!esFechaValida(f)) throw new Error(`Fecha inválida: ${JSON.stringify(f)} (se espera "AAAA-MM-DD")`);
  const [y, m, d] = f.split('-').map(Number);
  return { y, m, d };
}

/** Días desde 1970-01-01 de una fecha local. */
export function diasDeFecha(f: string): number {
  return diasDesdeCivil(parseFecha(f));
}

export function fechaDesdeDias(n: number): string {
  const { y, m, d } = civilDesdeDias(n);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${String(y).padStart(4, '0')}-${p(m)}-${p(d)}`;
}

/** Suma días calendario (negativos para atrás). */
export function sumarDias(f: string, n: number): string {
  return fechaDesdeDias(diasDeFecha(f) + n);
}

/** Días de lunes a ese día (0 = lunes .. 6 = domingo), como en la tira. */
export function diaSemanaIndex(f: string): number {
  // 1970-01-01 fue jueves (índice 3).
  return ((diasDeFecha(f) + 3) % 7 + 7) % 7;
}

/** Nombre corto del día ("LU", "MA"…) con lunes = 0. */
const CORTOS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'];
export function diaCorto(f: string): string {
  return CORTOS[diaSemanaIndex(f)];
}

/** Día con letra inicial ("lunes"…). */
const LARGOS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
export function diaLargo(f: string): string {
  return LARGOS[diaSemanaIndex(f)];
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "martes 17 de noviembre" (sin año). */
export function etiquetaDia(f: string): string {
  const { d, m } = parseFecha(f);
  return `${diaLargo(f)} ${d} de ${MESES[m - 1]}`;
}

/** Etiqueta larga con año, para origen/destino sin ambigüedad al reprogramar. */
export function etiquetaDiaCompleta(f: string): string {
  const { y } = parseFecha(f);
  return `${etiquetaDia(f)} de ${y}`;
}

/** "noviembre 2026". */
export function etiquetaMes(f: string): string {
  const { y, m } = parseFecha(f);
  return `${MESES[m - 1]} ${y}`;
}

/** Lunes de la semana (ISO) de la fecha dada. */
export function lunesDe(f: string): string {
  return sumarDias(f, -diaSemanaIndex(f));
}
