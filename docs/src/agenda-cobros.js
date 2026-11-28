/**
 * Agenda semanal de Cobros (26/11): qué vencimientos caen en cada día de la
 * semana que se está mirando. Espejo de `resumen.ts` (Clases) pero con filas
 * de cobro, no con clases: la tarjeta muestra al alumno y su mensualidad.
 *
 * Puro, sin reloj ni DOM: la semana entra por parámetro (lunes "AAAA-MM-DD").
 * Los días son siempre los siete de lunes a domingo, con el vencimiento ya
 * calculado por `resumenCobros` (misma regla que la lista de Cobros).
 */
import { sumarDias } from './fechas.js?v=202611280542';
/** Siete días, lunes a domingo, con sus cobros ordenados por nombre. */
export function cobrosDeLaSemana(filas, lunes) {
    return Array.from({ length: 7 }, (_, i) => {
        const fecha = sumarDias(lunes, i);
        return {
            fecha,
            cobros: filas
                .filter((f) => f.fecha === fecha)
                .sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre, 'es')),
        };
    });
}
/** Un punto por día con cobros pendientes (para la tira de días). */
export function tieneCobros(dia) {
    return dia.cobros.some((c) => c.estado !== 'pagado');
}
/** Estado de una fila a partir de los días al vencimiento y su pago. */
export function estadoCobro(dias, pagado) {
    if (pagado)
        return 'pagado';
    if (dias < 0)
        return 'vencido';
    if (dias === 0)
        return 'hoy';
    return 'porvencer';
}
