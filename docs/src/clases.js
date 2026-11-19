/**
 * Dominio de la clase grupal (v5): estado, auto-marcado por hora y cancelación.
 *
 * Reglas (v5/PLAN.md §2):
 *  - Programada → (hora pasada) → Dada (automática) → o Cancelada (manual).
 *  - El auto-marcado corre con el reloj `America/Montevideo`, inyectado.
 *    Una clase jamás se marca dada antes de su fecha y hora.
 *  - Cancelar una clase ya dada permite revertir a Programada (con motivo).
 *  - La clase cancelada no genera deuda ni prórroga; queda registrada para
 *    auditoría (fecha, hora, motivo, quién canceló, mensajes enviados sí/no).
 *  - Nunca se borra una clase.
 *
 * Puro: sin `Date.now()`, sin DOM, sin estado global. El reloj entra por
 * parámetro; los tests usan `relojFalso`.
 */
import { diasDeFecha, etiquetaDia } from './fechas.js';
import { hoyLocal, minutosLocales, parsearMinutos, formatoHora, partesDe, ZONA, } from './reloj.js';
const pad = (n) => String(n).padStart(2, '0');
/**
 * Desplazamiento UTC − local en minutos de un día concreto
 * (Uruguay hoy es UTC−3: −180). Se deriva del propio `Intl`, así si cambia
 * el horario de verano no hay que tocar nada.
 */
function desplazamientoUtcMin(diasCivil) {
    const muestra = diasCivil * 86400000 + 12 * 3600000; // 12:00 UTC del día
    const { hh, mm } = partesDe(muestra);
    return hh * 60 + mm - 720;
}
/** Minutos desde 00:00 de un día UTC, en la zona del instituto. */
function minutosUtcDia(diasCivil, minutos) {
    return diasCivil * 86400000 + (minutos - desplazamientoUtcMin(diasCivil)) * 60000;
}
/** Minuto exacto en que la clase empieza (instante UTC del instante local). */
export function instanteInicio(c) {
    return minutosUtcDia(diasDeFecha(c.fecha), c.minutos);
}
/** Crea una clase en estado Programada. Lanza si la fecha u hora no valen. */
export function crearClase(spec) {
    const minutos = typeof spec.hora === 'number' ? spec.hora : parsearMinutos(spec.hora);
    if (!Number.isInteger(minutos) || minutos < 0 || minutos > 1439) {
        throw new Error(`Hora inválida: ${spec.hora}`);
    }
    const spec2 = { ...spec };
    // valida la fecha sin reloj
    const fecha = spec2.fecha;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
        throw new Error(`Fecha inválida: ${JSON.stringify(fecha)}`);
    diasDeFecha(fecha); // lanza si el calendario no la admite
    return {
        id: spec.id,
        nombre: spec.nombre,
        fecha,
        minutos,
        duracionMin: spec.duracionMin ?? 60,
        alumnos: spec.alumnos ?? [],
        estado: 'programada',
        marcadaEn: null,
        cancelacion: null,
    };
}
/** ¿La fecha y hora de la clase ya pasaron según `ahora`? */
export function inicioPasado(c, ahora) {
    return instanteInicio(c) <= ahora;
}
/**
 * Auto-marcado: Programada → Dada si la hora de inicio ya pasó.
 * Idempotente: no re-marcia clases dadas ni canceladas.
 */
export function marcarSiPasada(c, ahora) {
    if (c.estado !== 'programada')
        return c;
    if (!inicioPasado(c, ahora))
        return c;
    return { ...c, estado: 'dada', marcadaEn: ahora };
}
/** Reconcilia toda la colección (lo que corre al abrir la app o con el cron). */
export function reconciliar(clases, ahora) {
    return clases.map((c) => marcarSiPasada(c, ahora));
}
/**
 * Cancela una clase programada (o dada, si fue un error del dueño).
 * Cancelada ≠ dada: no genera deuda ni prórroga.
 */
export function cancelarClase(c, op) {
    if (c.estado === 'cancelada')
        return c;
    if (!op.motivo.trim())
        throw new Error('La cancelación necesita un motivo');
    if (!op.quien.trim())
        throw new Error('La cancelación necesita quién la hace');
    return {
        ...c,
        estado: 'cancelada',
        marcadaEn: null,
        cancelacion: {
            fecha: hoyLocal(op.ahora),
            minutos: minutosLocales(op.ahora),
            motivo: op.motivo.trim(),
            quien: op.quien.trim(),
            mensajesEnviados: null,
        },
    };
}
/**
 * Revierte una cancelación a Programada (plan §2.1: cancelar una clase ya
 * dada es un error del dueño y también se revierte). Si la hora ya pasó, la
 * siguiente reconciliación la volverá a marcar Dada sola.
 */
export function deshacerCancelacion(c, op) {
    if (c.estado !== 'cancelada')
        throw new Error('Solo se revierte una clase cancelada');
    if (!op.motivo.trim())
        throw new Error('La reversión necesita un motivo');
    return {
        ...c,
        estado: 'programada',
        marcadaEn: null,
        cancelacion: null,
    };
}
/** Registra en la auditoría de la cancelación qué salió por WhatsApp. */
export function registrarMensajeEnviado(c, canal) {
    if (c.estado !== 'cancelada' || !c.cancelacion) {
        throw new Error('Los mensajes de cancelación se registran sobre una clase cancelada');
    }
    return { ...c, cancelacion: { ...c.cancelacion, mensajesEnviados: canal } };
}
/** Chip de estado para la UI: "Programada" | "Dada" | "Cancelada". */
export function etiquetaEstado(c) {
    return c.estado.charAt(0).toUpperCase() + c.estado.slice(1);
}
/** "15:00" para la línea de tiempo. */
export function horaClase(c) {
    return formatoHora(c.minutos);
}
/** "martes 18 de noviembre" — la usan los mensajes de WhatsApp. */
export { etiquetaDia };
/** Minuto en que termina la clase. */
export function finClase(c) {
    return c.minutos + c.duracionMin;
}
/** Hoy en la zona del instituto, para arrancar la vista Hoy. */
export function hoyEnZona(reloj) {
    return hoyLocal(reloj.ahora());
}
export { ZONA };
