/**
 * Agenda v5 · el mes abierto (23/11): qué mes muestra el almanaque.
 *
 * El mes es una vista dentro de Clases: se navega con las flechas, se pinta
 * un día y se agenda una suelta ahí. Ese mes es ESTADO DE PANTALLA, no un dato
 * de la clase, así que no puede ganarle a la fecha real al cargar: si el
 * almanaque quedaba apuntando a enero 2027 y la app volvía a abrir (recarga o
 * reentrada en `#v-mes`), el calendario se veía en enero 2027 mientras «Hoy»
 * seguía en la fecha real. Parecía que la app había perdido la fecha.
 *
 * Regla: al cargar el almanaque arranca SIEMPRE en el mes de hoy, y el día
 * elegido solo se conserva si cae en ese mismo mes (no se selecciona solo un
 * día de otro mes). Puro: sin DOM, sin reloj y sin almacenamiento.
 */
import { mesDe } from './agenda.js?v=202611240850';
/** El mes de la fecha real, en "AAAA-MM" (lo que devuelve `mesDe`). */
export function mesDeHoy(hoy) {
    return mesDe(hoy);
}
/**
 * Día que queda elegido al cargar: el elegido antes solo si pertenece al mes
 * de hoy; si no, ninguno (el almanaque invita a tocar un día).
 */
export function diaSeleccionadoAlCargar(diaElegido, hoy) {
    if (!diaElegido)
        return null;
    return mesDe(diaElegido) === mesDe(hoy) ? diaElegido : null;
}
/**
 * Primer día del mes que muestran las flechas: parte del mes abierto y se
 * mueve `delta` meses, normalizando con aritmética pura (sin `Date`, así no
 * salta de día por zona horaria ni por años bisiestos).
 */
export function primerDiaDeMes(mesAbierto, delta) {
    const { y, m } = partesDeMes(mesAbierto);
    const total = (y * 12 + (m - 1)) + delta;
    const anio = Math.floor(total / 12);
    const mes = ((total % 12) + 12) % 12 + 1;
    return `${String(anio).padStart(4, '0')}-${String(mes).padStart(2, '0')}-01`;
}
/** "AAAA-MM" o "AAAA-MM-DD" → año y mes numéricos. */
function partesDeMes(fecha) {
    return { y: Number(fecha.slice(0, 4)), m: Number(fecha.slice(5, 7)) };
}
