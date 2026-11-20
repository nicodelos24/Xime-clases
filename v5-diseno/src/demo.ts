/**
 * Siembra de la demo v5: la misma semana de clases del prototipo (8 clases,
 * lunes a sábado) pero anclada a la fecha actual, no al 16-22 de noviembre.
 *
 * Sin esto, al abrir la app en otra semana todas las clases ya pasaron: la
 * vista Hoy queda vacía para siempre y no hay nada que cancelar ni mover.
 * El estado que el dueño genera encima (cancelaciones, reprogramaciones) sí
 * vive en el repositorio y no se vuelve a sembrar.
 */
import { crearClase, type AlumnoDeClase, type Clase } from './clases.ts';
import { lunesDe, sumarDias } from './fechas.ts';
import { hoyLocal, type InstanteMs } from './reloj.ts';

function alumnos(nombres: [string, string][], prefijo: string): AlumnoDeClase[] {
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

/**
 * La semana demo (lunes a sábado) que contiene el día de `ahora`.
 * Los días pasados quedan "dada" por la reconciliación; hoy y los próximos,
 * "programada". Es determinista para un `ahora` dado (tests con reloj falso).
 */
export function datosDemo(ahora: InstanteMs): Clase[] {
  const lunes = lunesDe(hoyLocal(ahora));
  return [
    crearClase({ id: 'c-lun', nombre: 'Grupo Lunes', fecha: lunes, hora: '15:00', alumnos: GRUPO_A.slice(0, 8) }),
    crearClase({ id: 'c-mar-a', nombre: 'Grupo Martes A', fecha: sumarDias(lunes, 1), hora: '15:00', alumnos: GRUPO_A }),
    crearClase({ id: 'c-mar-b', nombre: 'Grupo Martes B', fecha: sumarDias(lunes, 1), hora: '17:30', alumnos: GRUPO_B }),
    crearClase({ id: 'c-mie', nombre: 'Grupo Miércoles', fecha: sumarDias(lunes, 2), hora: '10:00', alumnos: GRUPO_B.slice(0, 6) }),
    crearClase({ id: 'c-jue', nombre: 'Grupo Jueves', fecha: sumarDias(lunes, 3), hora: '16:00', alumnos: GRUPO_V.slice(0, 7) }),
    crearClase({ id: 'c-vie', nombre: 'Grupo Viernes', fecha: sumarDias(lunes, 4), hora: '15:00', alumnos: GRUPO_V }),
    crearClase({ id: 'c-vie-b', nombre: 'Grupo Viernes B', fecha: sumarDias(lunes, 4), hora: '18:00', alumnos: GRUPO_A.slice(2, 9) }),
    crearClase({ id: 'c-sab', nombre: 'Grupo Sábado', fecha: sumarDias(lunes, 5), hora: '11:00', alumnos: GRUPO_B.slice(1, 6) }),
  ];
}
