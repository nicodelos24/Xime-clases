/**
 * Siembra de la demo v5: la misma semana de clases del prototipo (8 clases,
 * lunes a sábado) pero anclada a la fecha actual, no al 16-22 de noviembre.
 *
 * Sin esto, al abrir la app en otra semana todas las clases ya pasaron: la
 * vista Hoy queda vacía para siempre y no hay nada que cancelar ni mover.
 * El estado que el dueño genera encima (cancelaciones, reprogramaciones) sí
 * vive en el repositorio y no se vuelve a sembrar.
 */
import { crearClase } from './clases.js?v=202611261155';
import { lunesDe, sumarDias } from './fechas.js?v=202611261155';
import { hoyLocal } from './reloj.js?v=202611261155';
import { colorPorId } from './alumnos.js?v=202611261155';
import { precioDemo } from './tarifas.js?v=202611261155';
function alumnos(nombres, prefijo) {
    return nombres.map(([nombre, telefono], i) => ({ id: `${prefijo}${i}`, nombre, telefono }));
}
const GRUPO_A = alumnos([
    ['Carla T.', '099 123 456'], ['Bruno S.', '099 987 654'], ['Julieta P.', '099 112 233'],
    ['Martín R.', '099 445 566'], ['Lucía C.', '099 778 899'], ['Diego G.', '099 321 654'],
    ['Sofía M.', '099 555 101'], ['Tomás L.', '099 666 202'], ['Valentina R.', '099 777 303'],
    ['Mateo F.', '099 888 404'], ['Camila S.', '099 999 505'], ['Joaquín P.', '099 101 606'],
], 'a');
const GRUPO_B = alumnos([
    ['Julieta P.', '099 112 233'], ['Lucía C.', '099 778 899'], ['Sofía M.', '099 555 101'],
    ['Tomás L.', '099 666 202'], ['Valentina R.', '099 777 303'], ['Mateo F.', '099 888 404'],
    ['Camila S.', '099 999 505'], ['Joaquín P.', '099 101 606'], ['Abril G.', '099 212 717'],
], 'b');
const GRUPO_V = alumnos([
    ['Martín R.', '099 445 566'], ['Diego G.', '099 321 654'], ['Sofía M.', '099 555 101'],
    ['Tomás L.', '099 666 202'], ['Valentina R.', '099 777 303'], ['Mateo F.', '098 888 404'],
    ['Camila S.', '098 999 505'], ['Joaquín P.', '098 101 606'], ['Abril G.', '098 212 717'],
    ['Bruno S.', '098 987 654'], ['Lucía C.', '098 778 899'],
], 'v');
// Identidad canónica por alumno: A/B/V reutilizan nombres con IDs de clase distintos.
// Anclas y tarifa son fixtures sintéticos para la demo de mensualidades.
/** Anclas de la demo por ID, para que la ficha y Cobros compartan vencimiento. */
const anclasCobroDemo = new Map([
    ['a0', 21], ['a1', 21], ['a2', 26], ['a3', 20], ['a4', 1], ['a5', 2],
    ['a6', 3], ['a7', 8], ['a8', 9], ['a9', 12], ['a10', 16], ['a11', 31], ['b8', 28],
].map(([id, ancla]) => [id, ancla]));
export const alumnosCobrosDemo = [
    [GRUPO_A[0], 'Martes A', 21], [GRUPO_A[1], 'Martes A', 21],
    [GRUPO_A[2], 'Martes B', 26], [GRUPO_A[3], 'Viernes', 20],
    [GRUPO_A[4], 'Martes B', 1], [GRUPO_A[5], 'Viernes', 2],
    [GRUPO_A[6], 'Martes A', 3], [GRUPO_A[7], 'Martes A', 8],
    [GRUPO_A[8], 'Martes A', 9], [GRUPO_A[9], 'Martes A', 12],
    [GRUPO_A[10], 'Martes A', 16], [GRUPO_A[11], 'Martes A', 31],
    [GRUPO_B[8], 'Martes B', 28],
].map(([alumno, grupo, ancla]) => ({
    id: alumno.id, nombre: alumno.nombre, grupo: `Grupo ${grupo}`, ancla, montoUYU: 6500,
}));
// Las fichas demo cargan su tarifa desde PRECIOS_DEMO en `fichasDemo()`.
// Esta lista sintética es la semilla histórica de Cobros: nunca se usa como
// fallback de una ficha real.
/**
 * La semana demo (lunes a sábado) que contiene el día de `ahora`.
 * Desde el 23/11 el estado NO sale del reloj (auto-marcado descartado): los
 * días anteriores a hoy se siembran ya «dada» con su marca manual, y hoy en
 * adelante quedan «Por dar» hasta que la dueña las marque. Determinista para
 * un `ahora` dado (tests con reloj falso).
 */
/**
 * Fichas demo (Pieza C). Los IDs son EXACTAMENTE los de `alumnosCobrosDemo`:
 * así un pago guardado en A/B sigue vinculado por ID al mismo alumno, sin
 * unir por nombre ni reescribir agenda/auditoría. Las altas son sintéticas,
 * repartidas en los últimos días respecto de `hoy`.
 */
export function fichasDemo(hoy) {
    // Teléfono demo (sintético) por ID: el mismo de la lista de clases, para que
    // la ficha lo muestre y el botón de WhatsApp tenga destinatario real.
    const telefonosDemo = new Map([...GRUPO_A, ...GRUPO_B, ...GRUPO_V].map((a) => [a.id, a.telefono]));
    return alumnosCobrosDemo.map((a, i) => ({
        id: a.id,
        nombre: a.nombre,
        modalidad: (i % 3 === 2 ? 'individual' : 'mensual'),
        // `alumnosCobrosDemo.grupo` trae prefijo "Grupo " para Cobros; la ficha
        // guarda el nombre llano que usa el editor y la validación ("Martes A").
        grupo: a.grupo.replace(/^Grupo\s+/, ''),
        ancla: anclasCobroDemo.get(a.id) ?? a.ancla,
        fechaAlta: sumarDias(hoy, -(3 + (i * 2) % 27)),
        activo: true,
        color: colorPorId(a.id),
        contacto: telefonosDemo.get(a.id) ?? '',
        pagado: false,
        // Precio demo explícito: se siembra SOLO en datos sintéticos.
        tarifaUYU: precioDemo(i % 3 === 2 ? 'clase-individual' : 'mensualidad', '2026-01-01'),
    }));
}
export function datosDemo(ahora) {
    const lunes = lunesDe(hoyLocal(ahora));
    const hoy = hoyLocal(ahora);
    const siembra = (spec) => {
        const c = crearClase(spec);
        // Serie de demo ya dictada: se siembra dada (antes lo hacía el reloj).
        return c.fecha < hoy
            ? { ...c, estado: 'dada', marcadaEn: ahora, eventos: [] }
            : c;
    };
    return [
        siembra({ id: 'c-lun', nombre: 'Grupo Lunes', fecha: lunes, hora: '15:00', alumnos: GRUPO_A.slice(0, 8) }),
        siembra({ id: 'c-mar-a', nombre: 'Grupo Martes A', fecha: sumarDias(lunes, 1), hora: '15:00', alumnos: GRUPO_A }),
        siembra({ id: 'c-mar-b', nombre: 'Grupo Martes B', fecha: sumarDias(lunes, 1), hora: '17:30', alumnos: GRUPO_B }),
        siembra({ id: 'c-mie', nombre: 'Grupo Miércoles', fecha: sumarDias(lunes, 2), hora: '10:00', alumnos: GRUPO_B.slice(0, 6) }),
        siembra({ id: 'c-jue', nombre: 'Grupo Jueves', fecha: sumarDias(lunes, 3), hora: '16:00', alumnos: GRUPO_V.slice(0, 7) }),
        siembra({ id: 'c-vie', nombre: 'Grupo Viernes', fecha: sumarDias(lunes, 4), hora: '15:00', alumnos: GRUPO_V }),
        siembra({ id: 'c-vie-b', nombre: 'Grupo Viernes B', fecha: sumarDias(lunes, 4), hora: '18:00', alumnos: GRUPO_A.slice(2, 9) }),
        siembra({ id: 'c-sab', nombre: 'Grupo Sábado', fecha: sumarDias(lunes, 5), hora: '11:00', alumnos: GRUPO_B.slice(1, 6) }),
    ];
}
