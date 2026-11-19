/**
 * Reloj del instituto: fecha y hora en America/Montevideo.
 *
 * Todo el dominio de clases pasa por este módulo con un `reloj` inyectado
 * (pruebas con reloj simulado). Nunca se lee `Date.now()` acá dentro.
 *
 * Node 26 soporta `Intl.DateTimeFormat` con `hourCycle` + `formatToParts`,
 * así que no dependemos de ningún paquete de zona horaria.
 */
export const ZONA = 'America/Montevideo';

/** Un instante en milisegundos desde la época Unix (UTC). */
export type InstanteMs = number;

/** Reloj inyectable: el dominio nunca lee el reloj del sistema por su cuenta. */
export type Reloj = { ahora(): InstanteMs };

/** Reloj real: el del dispositivo, en la zona del instituto. */
export function relojDelDispositivo() {
  return { ahora: () => Date.now() };
}

/**
 * Reloj simulado para pruebas: arranca en el instante dado y avanza a mano.
 */
export function relojFalso(inicio: InstanteMs) {
  let t = inicio;
  return {
    ahora: () => t,
    /** Avanza el reloj (acepta negativo para retroceder). */
    avanzar(ms: number) {
      t += ms;
      return t;
    },
    /** Fija el reloj a un instante absoluto. */
    fijar(instante: InstanteMs) {
      t = instante;
      return t;
    },
  };
}

type Partes = { y: number; m: number; d: number; hh: number; mm: number; ss: number };

const FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23', // 00..23, nunca 24
});

/** Partes de un instante en la zona del instituto. */
export function partesDe(instante: InstanteMs): Partes {
  const partes = FMT.formatToParts(new Date(instante));
  const p: Record<string, string> = {};
  for (const { type, value } of partes) if (type !== 'literal') p[type] = value;
  const num = (k: string) => Number(p[k]);
  return { y: num('year'), m: num('month'), d: num('day'), hh: num('hour'), mm: num('minute'), ss: num('second') };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha local (día civil) del instante, "AAAA-MM-DD". */
export function hoyLocal(instante: InstanteMs): string {
  const { y, m, d } = partesDe(instante);
  return `${String(y).padStart(4, '0')}-${pad(m)}-${pad(d)}`;
}

/** Hora local del instante en minutos desde el inicio del día (0..1439). */
export function minutosLocales(instante: InstanteMs): number {
  const { hh, mm } = partesDe(instante);
  return hh * 60 + mm;
}

/** Minutos "HH:MM" ("18:30") → minutos desde 00:00. Acepta también "1830". */
export function parsearMinutos(hhmm: string): number {
  const t = String(hhmm).trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(t) ?? /^(\d{1,2})(\d{2})$/.exec(t);
  if (!m) throw new Error(`Hora inválida: ${JSON.stringify(hhmm)} (se espera "HH:MM")`);
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!(hh >= 0 && hh < 24 && mm >= 0 && mm < 60)) {
    throw new Error(`Hora inválida: ${JSON.stringify(hhmm)} (se espera "HH:MM")`);
  }
  return hh * 60 + mm;
}

/** Minutos desde 00:00 → "HH:MM". */
export function formatoHora(minutos: number): string {
  if (!Number.isInteger(minutos) || minutos < 0 || minutos > 1439) {
    throw new Error(`Minutos inválidos: ${minutos} (0..1439)`);
  }
  return `${pad(Math.floor(minutos / 60))}:${pad(minutos % 60)}`;
}

/** Instante UTC de un minuto dado dentro de un día local (días del civil gregoriano). */
export function instanteUtcDia(diasCivil: number, minutos: number): InstanteMs {
  return diasCivil * 86400000 + minutos * 60000;
}
