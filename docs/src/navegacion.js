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
