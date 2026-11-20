/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  crearClase, marcarSiPasada, reconciliar, cancelarClase, deshacerCancelacion,
  reprogramarClase, registrarMensajeEnviado, inicioPasado, horaClase, etiquetaEstado, finClase,
  instanteInicio, type Clase,
} from '../src/clases.ts';
import { relojFalso } from '../src/reloj.ts';

const t = (s: string) => new Date(s).getTime();
const ISO_1830 = '2026-11-18T21:30:00.000Z'; // 18:30 del 18/11 en Uruguay

const alumnos = [
  { id: 'a1', nombre: 'Carla T.', telefono: '099 123 456' },
  { id: 'a2', nombre: 'Bruno S.', telefono: '+59899987654' },
];

function claseBase(): Clase {
  return crearClase({
    id: 'c1',
    nombre: 'Grupo Martes A',
    fecha: '2026-11-18',
    hora: '15:00',
    alumnos,
  });
}

test('crearClase arranca en Programada y normaliza la hora', () => {
  const c = claseBase();
  assert.equal(c.estado, 'programada');
  assert.equal(c.minutos, 900);
  assert.equal(c.marcadaEn, null);
  assert.equal(c.cancelacion, null);
  assert.equal(horaClase(c), '15:00');
  assert.equal(etiquetaEstado(c), 'Programada');
  assert.equal(finClase(c), 960); // 60 min por defecto
  assert.throws(() => crearClase({ id: 'x', nombre: 'x', fecha: '2026-02-30', hora: '10:00' }), /Fecha inválida/);
  assert.throws(() => crearClase({ id: 'x', nombre: 'x', fecha: '2026-11-18', hora: '25:00' }), /Hora inválida/);
});

test('auto-marcado: la clase pasa a Dada sola al llegar su hora', () => {
  const c = claseBase(); // 15:00 = 18:00 UTC
  const antes = t('2026-11-18T17:59:59.000Z'); // 14:59:59 en Uruguay
  const despues = t('2026-11-18T18:00:00.000Z'); // 15:00 exacto

  assert.equal(marcarSiPasada(c, antes).estado, 'programada', 'antes de la hora no se marca');
  const dada = marcarSiPasada(c, despues);
  assert.equal(dada.estado, 'dada');
  assert.equal(dada.marcadaEn, despues);
  assert.equal(etiquetaEstado(dada), 'Dada');
});

test('la hora exacta de inicio ya cuenta como pasada', () => {
  const c = claseBase(); // 15:00 = 18:00 UTC
  const exacto = t('2026-11-18T18:00:00.000Z');
  assert.equal(inicioPasado(c, exacto), true);
  assert.equal(marcarSiPasada(c, exacto - 1).estado, 'programada');
  assert.equal(marcarSiPasada(c, exacto).estado, 'dada');
});

test('nunca se marca dada antes de su fecha y hora', () => {
  const manana = crearClase({ id: 'c2', nombre: 'Grupo Viernes', fecha: '2026-11-20', hora: '15:00' });
  assert.equal(marcarSiPasada(manana, t(ISO_1830)).estado, 'programada');
  assert.equal(marcarSiPasada(manana, t('2026-11-19T23:59:00.000Z')).estado, 'programada');
  // 15:00 del viernes en Uruguay = 18:00 UTC
  assert.equal(marcarSiPasada(manana, t('2026-11-20T18:00:00.000Z')).estado, 'dada');
});

test('el auto-marcado es idempotente: no re-marcia ni toca canceladas', () => {
  const c = claseBase();
  const una = marcarSiPasada(c, t(ISO_1830));
  const dos = marcarSiPasada(una, t('2026-11-18T23:00:00.000Z'));
  assert.deepEqual(dos, una, 'marcar dos veces no cambia nada');

  const cancelada = cancelarClase(c, { motivo: 'Lluvia', quien: 'dueño', ahora: t(ISO_1830) });
  const sigue = marcarSiPasada(cancelada, t('2026-11-19T23:00:00.000Z'));
  assert.equal(sigue.estado, 'cancelada', 'una cancelada jamás se vuelve dada');
});

test('reconciliar al abrir la app: re-alinea todo con el reloj actual', () => {
  const reloj = relojFalso(t('2026-11-18T14:00:00.000Z')); // 11:00 en Uruguay
  const clases = [
    claseBase(), // 15:00 del 18 → aún no
    crearClase({ id: 'c2', nombre: 'Grupo Martes B', fecha: '2026-11-18', hora: '09:00' }), // ya pasó
    crearClase({ id: 'c3', nombre: 'Grupo Viernes', fecha: '2026-11-20', hora: '15:00' }), // futuro
  ];

  const alAbrir = reconciliar(clases, reloj.ahora());
  assert.deepEqual(alAbrir.map((c) => c.estado), ['programada', 'dada', 'programada']);

  // El dueño abre la app más tarde: se re-alinea sola, sin tocar nada.
  reloj.fijar(t('2026-11-18T21:30:00.000Z')); // 18:30
  const luego = reconciliar(alAbrir, reloj.ahora());
  assert.deepEqual(luego.map((c) => c.estado), ['dada', 'dada', 'programada']);
  assert.equal(luego[0].marcadaEn, t('2026-11-18T21:30:00.000Z'));
});

test('cancelar clase: queda Cancelada, con motivo y quién, sin deuda ni prórroga', () => {
  const c = claseBase();
  const ahora = t(ISO_1830);
  const cancelada = cancelarClase(c, { motivo: 'Lluvia torrencial', quien: 'Xime', ahora });

  assert.equal(cancelada.estado, 'cancelada');
  assert.equal(etiquetaEstado(cancelada), 'Cancelada');
  assert.equal(cancelada.marcadaEn, null, 'cancelada ≠ dada');
  assert.equal(cancelada.cancelacion?.fecha, '2026-11-18');
  assert.equal(cancelada.cancelacion?.minutos, 18 * 60 + 30);
  assert.equal(cancelada.cancelacion?.motivo, 'Lluvia torrencial');
  assert.equal(cancelada.cancelacion?.quien, 'Xime');
  assert.equal(cancelada.cancelacion?.mensajesEnviados, null);
  assert.deepEqual(c.alumnos, alumnos, 'los alumnos no se tocan');

  // Punto 3: el motivo ya no es obligatorio; un motivo vacío se registra como "sin motivo".
  assert.equal(cancelarClase(c, { motivo: '   ', quien: 'Xime', ahora }).cancelacion?.motivo, 'sin motivo');
  assert.throws(() => cancelarClase(c, { motivo: 'Lluvia', quien: ' ', ahora }), /quién/);
  assert.equal(cancelarClase(cancelada, { motivo: 'otra', quien: 'Xime', ahora }).estado, 'cancelada');
});

test('cancelar una clase ya dada (error del dueño) se revuelve a Programada', () => {
  const c = claseBase();
  const dada = marcarSiPasada(c, t(ISO_1830));
  assert.equal(dada.estado, 'dada');

  const cancelada = cancelarClase(dada, { motivo: 'Se equivocó de día', quien: 'Xime', ahora: t(ISO_1830) });
  assert.equal(cancelada.estado, 'cancelada');
  assert.equal(cancelada.marcadaEn, null);

  const revertida = deshacerCancelacion(cancelada, { motivo: 'Error mío', quien: 'Xime', ahora: t(ISO_1830) });
  assert.equal(revertida.estado, 'programada');
  assert.equal(revertida.cancelacion, null);
  // Y como su hora ya pasó, la próxima reconciliación la vuelve a marcar dada sola.
  assert.equal(marcarSiPasada(revertida, t(ISO_1830)).estado, 'dada');
  assert.throws(() => deshacerCancelacion(revertida, { motivo: 'x', quien: 'x', ahora: t(ISO_1830) }), /cancelada/);
});

test('la auditoría registra qué salió por WhatsApp', () => {
  const c = cancelarClase(claseBase(), { motivo: 'Lluvia', quien: 'Xime', ahora: t(ISO_1830) });
  const conMensaje = registrarMensajeEnviado(c, 'masivo');
  assert.equal(conMensaje.cancelacion?.mensajesEnviados, 'masivo');
  assert.equal(registrarMensajeEnviado(conMensaje, 'ninguno').cancelacion?.mensajesEnviados, 'ninguno');
  assert.throws(() => registrarMensajeEnviado(claseBase(), 'masivo'), /cancelada/);
});

test('la cancelada no es borrable: sigue en la lista con su registro', () => {
  const c = cancelarClase(claseBase(), { motivo: 'Lluvia', quien: 'Xime', ahora: t(ISO_1830) });
  const lista = reconciliar([c], t('2026-11-25T21:30:00.000Z'));
  assert.equal(lista.length, 1);
  assert.equal(lista[0].estado, 'cancelada');
  assert.equal(lista[0].cancelacion?.motivo, 'Lluvia');
});

test('instanteInicio: 15:00 del 18/11 en Uruguay = 18:00 UTC', () => {
  assert.equal(instanteInicio(claseBase()), t('2026-11-18T18:00:00.000Z'));
});

test('punto 2: cambiar de día reprograma a Programada y limpia el marcado', () => {
  const dada = marcarSiPasada(claseBase(), t(ISO_1830)); // 15:00 del 18/11 ya pasó
  assert.equal(dada.estado, 'dada');
  const movida = reprogramarClase(dada, '2026-11-25', { quien: 'dueño', ahora: t(ISO_1830) });
  assert.equal(movida.estado, 'programada');
  assert.equal(movida.fecha, '2026-11-25');
  assert.equal(movida.minutos, 900, 'conserva la hora');
  assert.equal(movida.marcadaEn, null);
  // La reconciliación con el reloj actual NO la marca de nuevo (el día es futuro).
  assert.equal(reconciliar([movida], t(ISO_1830))[0].estado, 'programada');
  assert.throws(() => reprogramarClase(dada, '30/11/2026', { quien: 'dueño', ahora: t(ISO_1830) }), /Fecha inválida/);
  assert.throws(() => reprogramarClase(dada, '2026-11-25', { quien: '', ahora: t(ISO_1830) }), /quién/);
});

test('reprogramar una cancelada conserva la cancelación anterior y quién la hizo', () => {
  const cancelada = cancelarClase(claseBase(), { motivo: 'Lluvia', quien: 'Xime', ahora: t(ISO_1830) });
  const movida = reprogramarClase(cancelada, '2026-11-25', { quien: 'Xime', ahora: t('2026-11-18T22:00:00.000Z') });

  assert.equal(movida.estado, 'programada');
  assert.equal(movida.cancelacion, null, 'la clase vuelve a estar activa');
  const ultimo = movida.eventos.at(-1);
  assert.equal(ultimo?.tipo, 'reprogramada');
  assert.deepEqual(ultimo, {
    tipo: 'reprogramada',
    fecha: '2026-11-18',
    minutos: 19 * 60,
    fechaAnterior: '2026-11-18',
    fechaNueva: '2026-11-25',
    quien: 'Xime',
    cancelacionAnterior: {
      fecha: '2026-11-18',
      minutos: 18 * 60 + 30,
      motivo: 'Lluvia',
      quien: 'Xime',
      mensajesEnviados: null,
    },
  });
  // La cancelación anterior sigue además en el evento de cancelación.
  assert.deepEqual(movida.eventos[0], {
    tipo: 'cancelada',
    registro: cancelada.cancelacion,
  });
});

test('la auditoría acumula cancelar, revertir y mensajes sin borrar nada', () => {
  const cancelada = cancelarClase(claseBase(), { motivo: 'Lluvia', quien: 'Xime', ahora: t(ISO_1830) });
  const conMensaje = registrarMensajeEnviado(cancelada, 'masivo');
  const revertida = deshacerCancelacion(conMensaje, { motivo: 'error del dueño', quien: 'Xime', ahora: t(ISO_1830) });

  assert.deepEqual(revertida.eventos.map((e) => e.tipo), ['cancelada', 'mensajes', 'revertida']);
  const rev = revertida.eventos[2];
  assert.equal(rev.tipo === 'revertida' && rev.cancelacion.quien, 'Xime');
  assert.equal(rev.tipo === 'revertida' && rev.motivo, 'error del dueño');
});

test('punto 3: cancelar sin motivo registra "sin motivo"', () => {
  const c = claseBase();
  const cancelada = cancelarClase(c, { motivo: '', quien: 'dueño', ahora: t(ISO_1830) });
  assert.equal(cancelada.estado, 'cancelada');
  assert.equal(cancelada.cancelacion?.motivo, 'sin motivo');
});
