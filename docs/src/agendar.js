/**
 * Agendar clases v5 (20/11): plantillas de rutina semanal, clases sueltas y
 * generación de ocurrencias. Puro: sin reloj propio, sin DOM y sin `Date.now()`.
 *
 * Modelo (compatible con la agenda plana existente, sin BD):
 *  - Una `RutinaSemanal` es una plantilla persistida en `xime.v5.estado`.
 *    Guarda nombre, días de semana (0=lunes … 6=domingo), hora y duración.
 *  - Las ocurrencias son `Clase` normales, con `rutinaId` y `fechaRutina`
 *    (la fecha en que CAÍA originalmente). ID estable `rutinaId@fecha`:
 *    así navegar adelante, salir y reabrir nunca duplica una ocurrencia.
 *  - `excepciones` registra las fechas de la serie que se cancelaron o se
 *    movieron: reconciliar NO las regenera en su día de origen. El resto de
 *    la serie sigue intacto (cancelar/mover una no toca a las demás).
 *  - El horizonte es móvil: siempre hay ocurrencias hasta `hoy + diasAdelante`
 *    días. Al avanzar el reloj se generan las nuevas, sin corte fijo invisible
 *    y sin borrar las ya generadas (incluido el historial).
 */
import { crearClase } from './clases.js?v=202611201755';
import { diaSemanaIndex, diasDeFecha, esFechaValida, sumarDias } from './fechas.js?v=202611201755';
import { hoyLocal, parsearMinutos } from './reloj.js?v=202611201755';
/** Cuántos días por delante se materializan las ocurrencias de una rutina. */
export const HORIZONTE_DIAS = 60;
const ID_RUTINA = /^rut-[A-Za-z0-9-]+$/;
const ID_SUELTA = /^suelta-[A-Za-z0-9-]+$/;
/** Normaliza y valida una rutina nueva. Lanza si algo no es válido. */
export function crearRutina(spec) {
    if (!ID_RUTINA.test(spec.id))
        throw new Error(`ID de rutina inválido: ${spec.id}`);
    if (!spec.nombre.trim())
        throw new Error('Poné el nombre de la clase');
    if (!Array.isArray(spec.dias) || spec.dias.length === 0)
        throw new Error('Elegí al menos un día de la semana');
    const dias = [...new Set(spec.dias)].sort((a, b) => a - b);
    if (dias.some((d) => !Number.isInteger(d) || d < 0 || d > 6))
        throw new Error('Día de la semana inválido');
    if (!esFechaValida(spec.desde))
        throw new Error(`Fecha de inicio inválida: ${spec.desde}`);
    parsearMinutos(spec.hora); // lanza si la hora no vale
    const duracionMin = spec.duracionMin ?? 60;
    if (!Number.isInteger(duracionMin) || duracionMin < 15 || duracionMin > 480) {
        throw new Error('La duración debe estar entre 15 y 480 minutos');
    }
    return {
        id: spec.id,
        nombre: spec.nombre.trim(),
        dias,
        desde: spec.desde,
        hora: spec.hora,
        duracionMin,
        excepciones: {},
    };
}
/** Crea una clase suelta validada, en estado Programada y sin rutina. */
export function crearClaseSuelta(spec) {
    if (!ID_SUELTA.test(spec.id))
        throw new Error(`ID de clase suelta inválido: ${spec.id}`);
    if (!spec.nombre.trim())
        throw new Error('Poné el nombre de la clase');
    return crearClase({
        id: spec.id,
        nombre: spec.nombre.trim(),
        fecha: spec.fecha,
        hora: spec.hora,
        duracionMin: spec.duracionMin ?? 60,
    });
}
/** ID estable de una ocurrencia: nunca se repetirá para la misma serie/fecha. */
export function idOcurrencia(rutinaId, fecha) {
    return `${rutinaId}@${fecha}`;
}
/**
 * Todas las fechas de la serie en `[desde, desde + 90 días]` que caen en uno
 * de los días elegidos. Se usa para calcular ocurrencias a partir de una
 * rutina (el rango cubre el horizonte móvil con holgura).
 */
export function fechasDeSerie(rutina, hasta) {
    const fechas = [];
    const total = diasDeFecha(hasta) - diasDeFecha(rutina.desde);
    for (let i = 0; i <= total; i++) {
        const fecha = sumarDias(rutina.desde, i);
        if (rutina.dias.includes(diaSemanaIndex(fecha)))
            fechas.push(fecha);
    }
    return fechas;
}
/**
 * Genera (sin duplicar) las ocurrencias de una rutina que faltan hasta
 * `hoy + HORIZONTE_DIAS`. Devuelve SOLO las clases nuevas; las existentes
 * (canceladas, movidas o con historial) se dejan intactas.
 *
 * - Una fecha en `excepciones` no se regenera en origen (cancelada/movida).
 * - Un ID ya presente en `existentes` no se duplica.
 * - La clase lleva `rutinaId` y `fechaRutina` para poder marcar la excepción
 *   cuando se cancele o se mueva desde la UI.
 */
export function generarOcurrencias(rutina, existentes, ahora, alumnos = [], horizonteDias = HORIZONTE_DIAS) {
    const hoy = hoyLocal(ahora);
    return generarOcurrenciasEnRango(rutina, existentes, hoy, sumarDias(hoy, horizonteDias), alumnos);
}
/**
 * Genera las ocurrencias que faltan en un rango ARBITRARIO `[desde, hasta]`
 * (por ejemplo el mes o la semana que está mirando la persona, aunque esté a
 * meses de distancia). NO usa la fecha consultada como «hoy»: solo crea
 * ocurrencias programadas; la reconciliación por reloj es aparte.
 *
 * - Nunca crea fechas anteriores al inicio de la rutina (`desde` de plantilla).
 * - Una fecha en `excepciones` (cancelada/movida) no se regenera en origen.
 * - Un ID ya presente no se duplica.
 */
export function generarOcurrenciasEnRango(rutina, existentes, desde, hasta, alumnos = []) {
    if (hasta < desde)
        return [];
    const inicio = desde > rutina.desde ? desde : rutina.desde;
    if (hasta < inicio)
        return [];
    const ya = new Set(existentes.map((c) => c.id));
    const nuevas = [];
    for (const fecha of fechasDeSerie(rutina, hasta)) {
        if (fecha < inicio)
            continue;
        if (rutina.excepciones[fecha])
            continue;
        const id = idOcurrencia(rutina.id, fecha);
        if (ya.has(id))
            continue;
        nuevas.push(crearClase({
            id,
            nombre: rutina.nombre,
            fecha,
            hora: rutina.hora,
            duracionMin: rutina.duracionMin,
            alumnos,
            rutinaId: rutina.id,
            fechaRutina: fecha,
        }));
    }
    return nuevas;
}
/** Marca una fecha de la serie como cancelada o movida (excepción). */
export function conExcepcion(rutina, fecha, motivo) {
    return { ...rutina, excepciones: { ...rutina.excepciones, [fecha]: motivo } };
}
