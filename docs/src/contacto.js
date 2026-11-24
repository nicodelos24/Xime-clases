/**
 * Contacto de la ficha (arreglo funcional, retomado de la Pieza B descartada).
 *
 * Tres invariantes del dueño:
 *  - El teléfono se VE en la ficha: si la alumna tiene número, la ficha muestra
 *    el número real, no «sin teléfono cargado».
 *  - El botón de WhatsApp usa `wa.me` con ESE número (con el prefijo de país
 *    configurado), no un enlace genérico sin destinatario.
 *  - Sin número no se inventa un link ni se dice que sí lo hay.
 *
 * Sin DOM y sin reloj: solo texto y URL, para poder probarlo.
 */
import { conPrefijo, PREFIJO_POR_DEFECTO } from './prefijo.js?v=202611240819';
/** Formato del deep link: solo dígitos, con el prefijo de país ya aplicado. */
export function numeroWaMe(telefono, prefijo = PREFIJO_POR_DEFECTO) {
    return conPrefijo(telefono, prefijo).replace(/[^\d]/g, '');
}
/** El número tal como se muestra en la ficha (legible, con + del país). */
export function telefonoVisible(telefono, prefijo = PREFIJO_POR_DEFECTO) {
    const legible = conPrefijo(telefono, prefijo);
    // Si ya traía el prefijo sin «+» («598 99…») se muestra igual como se cargó.
    return legible;
}
/** Saludo pre-cargado; el primer nombre de la alumna, sin inventar nada. */
export function saludoContacto(nombre) {
    const primero = nombre.trim().split(/\s+/)[0] ?? '';
    return primero ? `Hola ${primero}, te escribo de las clases.` : 'Hola, te escribo de las clases.';
}
/** Resuelve el bloque de contacto de una ficha; no toca el estado guardado. */
export function bloqueContacto(nombre, telefono, prefijo = PREFIJO_POR_DEFECTO) {
    const numero = numeroWaMe(telefono, prefijo);
    if (!numero) {
        return {
            visible: null,
            link: null,
            ayuda: 'Agregá el número en «Teléfono / WhatsApp» para poder escribirle.',
        };
    }
    return {
        visible: telefonoVisible(telefono, prefijo),
        link: `https://wa.me/${numero}?text=${encodeURIComponent(saludoContacto(nombre))}`,
        ayuda: null,
    };
}
