/**
 * Política de navegación suave de la UI v5, sin DOM.
 *
 * Los enlaces «Ver mes» se convierten en botones (sin `href`) para que la
 * navegación hacia atrás no se coma la vista activa. El handler genérico de
 * `a.link-suave` corre para TODOS los enlaces, así que debe ignorar los que
 * ya no tienen `href` en lugar de llamar a `slice(1)` sobre `null`.
 */
/** ID de vista de un `href` interno (`#v-mes` → `v-mes`), o null si no aplica. */
export function destinoDeEnlace(href) {
    return href && href.startsWith('#') ? href.slice(1) : null;
}
/** El enlace «Ver mes» es el único que navega sin fijar hash propio. */
export function esEnlaceVerMes(href) {
    return href === '#v-mes';
}
/**
 * Vista que se abre al entrar con un hash (`#v-mes` → `v-mes`), o null si el
 * hash está vacío o no nombra ninguna vista: en ese caso manda la vista por
 * defecto del HTML y el título se pinta solo.
 */
export function vistaInicial(hash, ids) {
    const destino = destinoDeEnlace(hash || null);
    return destino && ids.includes(destino) ? destino : null;
}
/**
 * IDs de vista que deben quedar con `activa`: exactamente uno.
 *
 * Un destino válido se lleva la clase y la quita de todas las demás, así dos
 * pantallas no pueden quedar superpuestas aunque una clase vieja haya quedado
 * pegada en el HTML o un repintado se haya cortado a la mitad. Si el destino
 * no existe (hash viejo, enlace roto) se cae a la primera vista declarada.
 */
export function vistasActivas(ids, destino) {
    if (destino && ids.includes(destino))
        return [destino];
    return ids.length > 0 ? [ids[0]] : [];
}
