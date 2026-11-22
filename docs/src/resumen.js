import { lunesDe, sumarDias } from "./fechas.js?v=202611220100";
const plural = (n, uno, muchos) => (n === 1 ? uno : muchos);
/** Resumen de un día concreto (ya reconciliado). */
export function resumenHoy(clases, fecha) {
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
        frase: porDar === 0
            ? 'Sin clases por dar'
            : `${porDar} ${plural(porDar, 'clase grupal', 'clases grupales')} por dar`,
        algunaClasePasada: dadas.length > 0 || delDia.some((c) => c.estado === 'dada'),
    };
}
/** ¿El día tiene alguna clase? (para el punto de la tira). */
export function tieneClases(clases, fecha) {
    return clases.some((c) => c.fecha === fecha);
}
/** Las clases de un día en orden de hora. */
export function clasesDelDia(clases, fecha) {
    return clases.filter((c) => c.fecha === fecha).sort((a, b) => a.minutos - b.minutos);
}
/** Clases de la semana (lunes a domingo) de la fecha dada, en orden de día. */
export function clasesDeLaSemana(clases, fecha) {
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
export function alAbrir(clases, reconciliar, reloj) {
    return reconciliar(clases, reloj.ahora());
}
