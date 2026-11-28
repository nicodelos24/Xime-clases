/**
 * Dominio de la clase grupal (v5): estado, marca de «dada» y cancelación.
 *
 * Reglas (v5/PLAN.md §2, actualizado 23/11):
 *  - Programada → Dada (MANUAL: la dueña toca «Por dar» y elige «Marcar dada»)
 *    o Cancelada (manual).
 *  - El auto-marcado por reloj está DESCARTADO por decisión de Nico (21/11):
 *    una clase NUNCA pasa a Dada por el solo paso de la hora, ni al abrir la
 *    app, ni al volver del segundo plano, ni por el cron. El reloj se sigue
 *    usando para generar las ocurrencias de las rutinas y para fechar la
 *    auditoría, nunca para cambiar el estado de una clase.
 *  - `marcarSiPasada` se conserva exportada como referencia del prototipo
 *    anterior pero NO debe usarse desde la app ni desde el repositorio.
 *  - Cancelar una clase ya dada permite revertir a Programada (con motivo).
 *  - La clase cancelada no genera deuda ni prórroga; queda registrada para
 *    auditoría (fecha, hora, motivo, quién canceló, mensajes enviados sí/no).
 *  - Nunca se borra una clase.
 *
 * Puro: sin `Date.now()`, sin DOM, sin estado global. El reloj entra por
 * parámetro; los tests usan `relojFalso`.
 */
import { diasDeFecha, etiquetaDia } from './fechas.js?v=202611280246';
import { hoyLocal, minutosLocales, parsearMinutos, formatoHora, partesDe, ZONA, } from './reloj.js?v=202611280246';
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
/**
 * Minuto exacto en que la clase TERMINA (instante UTC del instante local).
 * La duración puede cruzar la medianoche: 23:00 + 120 min → 01:00 del día
 * siguiente. Se deriva el desplazamiento del día civil de fin, para que el
 * cálculo siga siendo correcto si algún día cambia el horario de verano.
 */
export function instanteFin(c) {
    const inicioDia = diasDeFecha(c.fecha);
    const total = c.minutos + c.duracionMin;
    const diasExtra = Math.floor(total / 1440);
    const minutosDelDia = total % 1440;
    const finDia = inicioDia + diasExtra;
    return minutosUtcDia(finDia, minutosDelDia);
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
        eventos: [],
        ...(spec.rutinaId ? { rutinaId: spec.rutinaId } : {}),
        ...(spec.fechaRutina ? { fechaRutina: spec.fechaRutina } : {}),
    };
}
/** ¿La fecha y hora de INICIO de la clase ya pasaron según `ahora`? */
export function inicioPasado(c, ahora) {
    return instanteInicio(c) <= ahora;
}
/** ¿La clase ya TERMINÓ según `ahora`? (inicio + duración, cruce de medianoche incluido). */
export function finPasado(c, ahora) {
    return instanteFin(c) <= ahora;
}
/**
 * Auto-marcado por reloj: DESCARTADO por decisión de Nico (21/11/2026).
 *
 * Se conserva la función como referencia documental del prototipo anterior
 * (y por los tests que describen esa regla vieja), pero NO se llama desde el
 * repositorio ni desde la app: la clase pasa a «Dada» solo a mano.
 */
export function marcarSiPasada(c, ahora) {
    if (c.estado !== 'programada')
        return c;
    if (!finPasado(c, ahora))
        return c;
    return { ...c, estado: 'dada', marcadaEn: ahora };
}
/**
 * Alineado con el reloj SIN cambiar estados (23/11): las ocurrencias de las
 * rutinas se generan aparte (`agendar.ts`), y el estado de cada clase es el
 * que la dueña dejó. Devuelve las clases tal cual: existe para que abrir la
 * app, volver del segundo plano y el cron tengan UN camino único y auditable,
 * sin auto-marcado ni efectos sobre las marcas manuales.
 */
export function reconciliar(clases) {
    return clases;
}
/**
 * Marca dada una clase programada a pedido del dueño, aunque su hora no haya
 * llegado. Queda en la auditoría quién lo hizo y cuándo, y se puede deshacer.
 */
export function marcarDada(c, op) {
    if (c.estado === 'cancelada')
        throw new Error('No se puede marcar dada una clase cancelada');
    if (c.estado === 'dada')
        return c;
    if (!op.quien.trim())
        throw new Error('La marca manual necesita quién la hace');
    return {
        ...c,
        estado: 'dada',
        marcadaEn: op.ahora,
        eventos: [
            ...(c.eventos ?? []),
            {
                tipo: 'marcada-manual',
                fecha: hoyLocal(op.ahora),
                minutos: minutosLocales(op.ahora),
                quien: op.quien.trim(),
            },
        ],
    };
}
/**
 * Deshace una marca manual: vuelve a Programada sin borrar el evento previo
 * (auditoría append-only). Solo aplica si el último evento fue esa marca.
 */
export function deshacerMarcada(c, op) {
    if (c.estado !== 'dada' || c.eventos.at(-1)?.tipo !== 'marcada-manual') {
        throw new Error('Solo se deshace una clase marcada a mano');
    }
    if (!op.quien.trim())
        throw new Error('La reversión necesita quién la hace');
    return {
        ...c,
        estado: 'programada',
        marcadaEn: null,
        eventos: [
            ...c.eventos,
            {
                tipo: 'marca-manual-deshecha',
                fecha: hoyLocal(op.ahora),
                minutos: minutosLocales(op.ahora),
                quien: op.quien.trim(),
            },
        ],
    };
}
/**
 * Cancela una clase programada (o dada, si fue un error del dueño).
 * Cancelada ≠ dada: no genera deuda ni prórroga.
 */
export function cancelarClase(c, op) {
    if (c.estado === 'cancelada')
        return c;
    // Punto 3: el motivo es opcional. Si no se da, la auditoría registra
    // "sin motivo" (antes era obligatorio y bloqueaba la cancelación).
    if (!op.quien.trim())
        throw new Error('La cancelación necesita quién la hace');
    const registro = {
        fecha: hoyLocal(op.ahora),
        minutos: minutosLocales(op.ahora),
        motivo: op.motivo.trim() || 'sin motivo',
        quien: op.quien.trim(),
        mensajesEnviados: null,
    };
    return {
        ...c,
        estado: 'cancelada',
        marcadaEn: null,
        cancelacion: registro,
        eventos: [...(c.eventos ?? []), { tipo: 'cancelada', registro }],
    };
}
/**
 * Punto 2: cambiar una clase de día (reprogramar). Vuelve a Programada con la
 * nueva fecha; se limpia el marcado de "dada" para que la reconciliación no la
 * vuelva a marcar hasta la hora del nuevo día. Queda registrado en `eventos`
 * quién reprogramó y, si estaba cancelada, la cancelación anterior completa
 * (con quién la había cancelado). Nunca se borra la clase (regla vigente).
 */
export function reprogramarClase(c, fechaNueva, op) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNueva))
        throw new Error(`Fecha inválida: ${JSON.stringify(fechaNueva)}`);
    diasDeFecha(fechaNueva); // valida día real (bisiestos, meses)
    if (!op.quien.trim())
        throw new Error('La reprogramación necesita quién la hace');
    return {
        ...c,
        fecha: fechaNueva,
        estado: 'programada',
        marcadaEn: null,
        cancelacion: null,
        eventos: [
            ...(c.eventos ?? []),
            {
                tipo: 'reprogramada',
                fecha: hoyLocal(op.ahora),
                minutos: minutosLocales(op.ahora),
                fechaAnterior: c.fecha,
                fechaNueva,
                quien: op.quien.trim(),
                cancelacionAnterior: c.cancelacion,
            },
        ],
    };
}
/**
 * Revierte una cancelación a Programada (plan §2.1: cancelar una clase ya
 * dada es un error del dueño y también se revierte). Si la hora ya pasó, la
 * siguiente reconciliación la volverá a marcar Dada sola.
 */
export function deshacerCancelacion(c, op) {
    if (c.estado !== 'cancelada' || !c.cancelacion)
        throw new Error('Solo se revierte una clase cancelada');
    if (!op.quien.trim())
        throw new Error('La reversión necesita quién la hace');
    if (!op.motivo.trim())
        throw new Error('La reversión necesita un motivo');
    return {
        ...c,
        estado: 'programada',
        marcadaEn: null,
        cancelacion: null,
        eventos: [
            ...(c.eventos ?? []),
            {
                tipo: 'revertida',
                fecha: hoyLocal(op.ahora),
                minutos: minutosLocales(op.ahora),
                motivo: op.motivo.trim(),
                quien: op.quien.trim(),
                // La cancelación deshecha no se pierde: queda en la auditoría.
                cancelacion: c.cancelacion,
            },
        ],
    };
}
/** Registra en la auditoría de la cancelación qué salió por WhatsApp. */
export function registrarMensajeEnviado(c, canal) {
    if (c.estado !== 'cancelada' || !c.cancelacion) {
        throw new Error('Los mensajes de cancelación se registran sobre una clase cancelada');
    }
    return {
        ...c,
        cancelacion: { ...c.cancelacion, mensajesEnviados: canal },
        eventos: [...(c.eventos ?? []), { tipo: 'mensajes', canal }],
    };
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
