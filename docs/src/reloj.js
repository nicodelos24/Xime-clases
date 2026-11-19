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
/** Reloj real: el del dispositivo, en la zona del instituto. */
export function relojDelDispositivo() {
    return { ahora: () => Date.now() };
}
/**
 * Reloj simulado para pruebas: arranca en el instante dado y avanza a mano.
 */
export function relojFalso(inicio) {
    let t = inicio;
    return {
        ahora: () => t,
        /** Avanza el reloj (acepta negativo para retroceder). */
        avanzar(ms) {
            t += ms;
            return t;
        },
        /** Fija el reloj a un instante absoluto. */
        fijar(instante) {
            t = instante;
            return t;
        },
    };
}
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
export function partesDe(instante) {
    const partes = FMT.formatToParts(new Date(instante));
    const p = {};
    for (const { type, value } of partes)
        if (type !== 'literal')
            p[type] = value;
    const num = (k) => Number(p[k]);
    return { y: num('year'), m: num('month'), d: num('day'), hh: num('hour'), mm: num('minute'), ss: num('second') };
}
const pad = (n) => String(n).padStart(2, '0');
/** Fecha local (día civil) del instante, "AAAA-MM-DD". */
export function hoyLocal(instante) {
    const { y, m, d } = partesDe(instante);
    return `${String(y).padStart(4, '0')}-${pad(m)}-${pad(d)}`;
}
/** Hora local del instante en minutos desde el inicio del día (0..1439). */
export function minutosLocales(instante) {
    const { hh, mm } = partesDe(instante);
    return hh * 60 + mm;
}
/** Minutos "HH:MM" ("18:30") → minutos desde 00:00. Acepta también "1830". */
export function parsearMinutos(hhmm) {
    const t = String(hhmm).trim();
    const m = /^(\d{1,2}):(\d{2})$/.exec(t) ?? /^(\d{1,2})(\d{2})$/.exec(t);
    if (!m)
        throw new Error(`Hora inválida: ${JSON.stringify(hhmm)} (se espera "HH:MM")`);
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (!(hh >= 0 && hh < 24 && mm >= 0 && mm < 60)) {
        throw new Error(`Hora inválida: ${JSON.stringify(hhmm)} (se espera "HH:MM")`);
    }
    return hh * 60 + mm;
}
/** Minutos desde 00:00 → "HH:MM". */
export function formatoHora(minutos) {
    if (!Number.isInteger(minutos) || minutos < 0 || minutos > 1439) {
        throw new Error(`Minutos inválidos: ${minutos} (0..1439)`);
    }
    return `${pad(Math.floor(minutos / 60))}:${pad(minutos % 60)}`;
}
/** Instante UTC de un minuto dado dentro de un día local (días del civil gregoriano). */
export function instanteUtcDia(diasCivil, minutos) {
    return diasCivil * 86400000 + minutos * 60000;
}
