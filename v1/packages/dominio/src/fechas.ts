/**
 * Fechas locales y aritmética de calendario, pura y sin dependencias.
 *
 * Toda fecha se representa como `FechaLocal` ("AAAA-MM-DD") en la zona del
 * instituto (`America/Montevideo` por defecto). Las operaciones nunca usan
 * `Date` para aritmética: usan el algoritmo de día civil (Howard Hinnant),
 * así no hay sorpresas de zona horaria ni de horario de verano.
 */

export type FechaLocal = string; // "AAAA-MM-DD"
export type InstanteMs = number; // milisegundos desde época Unix
export type ZonaHoraria = string; // p. ej. "America/Montevideo"

/** Reloj inyectable: el dominio nunca lee el reloj del sistema por su cuenta. */
export interface Reloj {
  ahora(): InstanteMs;
}

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function esFechaValida(f: string): f is FechaLocal {
  if (!REGEX_FECHA.test(f)) return false;
  const [y, m, d] = f.split('-').map(Number);
  return (
    Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) &&
    m >= 1 && m <= 12 && d >= 1 && d <= diasDelMes(y, m)
  );
}

export function assertFecha(f: string): FechaLocal {
  if (!esFechaValida(f)) throw new Error(`Fecha inválida: ${JSON.stringify(f)} (se espera "AAAA-MM-DD")`);
  return f;
}

export interface DiaCivil {
  y: number;
  m: number; // 1..12
  d: number; // 1..31
}

/** Días desde 1970-01-01 (algoritmo civil, válido para todo el calendario gregoriano). */
export function diasDesdeCivil({ y, m, d }: DiaCivil): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400; // 0..399
  const mp = (m + 9) % 12; // mar=0
  const doy = Math.floor((153 * mp + 2) / 5) + d - 1; // día del "año que empieza en marzo"
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function civilDesdeDias(n: number): DiaCivil {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097; // 0..146096
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

export function diasDelMes(y: number, m: number): number {
  if (m === 2) return esBisiesto(y) ? 29 : 28;
  if (m === 4 || m === 6 || m === 9 || m === 11) return 30;
  return 31;
}

export function parseFecha(f: FechaLocal): DiaCivil {
  assertFecha(f);
  const [y, m, d] = f.split('-').map(Number);
  return { y, m, d };
}

export function formatoFecha({ y, m, d }: DiaCivil): FechaLocal {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${String(y).padStart(4, '0')}-${p(m)}-${p(d)}`;
}

/** Cantidad de días de `a` hasta `b` (positiva si `b` es posterior). */
export function diasEntre(a: FechaLocal, b: FechaLocal): number {
  return diasDesdeCivil(parseFecha(b)) - diasDesdeCivil(parseFecha(a));
}

/** Suma (o resta con negativo) días calendario a una fecha local. */
export function sumarDias(f: FechaLocal, n: number): FechaLocal {
  return formatoFecha(civilDesdeDias(diasDesdeCivil(parseFecha(f)) + n));
}

export function diaSiguiente(f: FechaLocal): FechaLocal {
  return sumarDias(f, 1);
}

export function diaAnterior(f: FechaLocal): FechaLocal {
  return sumarDias(f, -1);
}

/** Último día del mes dado. */
export function ultimoDiaDeMes(y: number, m: number): FechaLocal {
  return formatoFecha({ y, m, d: diasDelMes(y, m) });
}

/** Fecha local (día civil) de un instante, en la zona horaria dada. */
export function hoyLocal(instante: InstanteMs, zona: ZonaHoraria = 'America/Montevideo'): FechaLocal {
  // "en-CA" da el formato AAAA-MM-DD directamente.
  const fecha = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(instante));
  return assertFecha(fecha);
}

/** Día del mes de una fecha local (para el día ancla). */
export function diaDelMes(f: FechaLocal): number {
  return parseFecha(f).d;
}
