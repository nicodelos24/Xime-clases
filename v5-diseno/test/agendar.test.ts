/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  crearRutina, crearClaseSuelta, generarOcurrencias, idOcurrencia,
  conExcepcion, fechasDeSerie, HORIZONTE_DIAS, type RutinaSemanal,
} from '../src/agendar.ts';
import { diaSemanaIndex } from '../src/fechas.ts';
import { hoyLocal } from '../src/reloj.ts';

const t = (s: string) => new Date(s).getTime();
// Jueves 19/11/2026, 10:00 en Uruguay (UTC−3).
const JUEVES_10 = t('2026-11-19T13:00:00.000Z');

function rutina(over: Partial<Parameters<typeof crearRutina>[0]> = {}): RutinaSemanal {
  return crearRutina({
    id: 'rut-lun-mie',
    nombre: 'Grupo Lunes y Miércoles',
    dias: [0, 2], // lunes, miércoles
    desde: '2026-11-16',
    hora: '15:00',
    duracionMin: 60,
    ...over,
  });
}

test('crearRutina valida nombre, días, fecha de inicio, hora y duración', () => {
  const r = rutina();
  assert.deepEqual(r.dias, [0, 2]);
  assert.equal(r.nombre, 'Grupo Lunes y Miércoles');
  assert.equal(r.duracionMin, 60);
  assert.deepEqual(r.excepciones, {});
  assert.throws(() => crearRutina({ id: 'rut-x', nombre: '', dias: [0], desde: '2026-11-16', hora: '15:00' }), /nombre/);
  assert.throws(() => crearRutina({ id: 'rut-x', nombre: 'x', dias: [], desde: '2026-11-16', hora: '15:00' }), /al menos un día/);
  assert.throws(() => crearRutina({ id: 'rut-x', nombre: 'x', dias: [0], desde: '2026-02-30', hora: '15:00' }), /inicio inválida/);
  assert.throws(() => crearRutina({ id: 'rut-x', nombre: 'x', dias: [0], desde: '2026-11-16', hora: '25:00' }), /hora|Hora/);
  assert.throws(() => crearRutina({ id: 'rut-x', nombre: 'x', dias: [0], desde: '2026-11-16', hora: '15:00', duracionMin: 5 }), /duración/);
});

test('días duplicados se normalizan y la hora distinta es otra rutina', () => {
  assert.deepEqual(rutina({ dias: [2, 0, 2] }).dias, [0, 2]);
  const tarde = rutina({ id: 'rut-tarde', nombre: 'Tarde', hora: '18:00' });
  assert.equal(tarde.hora, '18:00');
  assert.notEqual(tarde.id, rutina().id, 'dos horarios = dos rutinas separadas');
});

test('fechasDeSerie respeta los días de semana y el inicio', () => {
  const r = rutina();
  const fechas = fechasDeSerie(r, '2026-11-30');
  assert.ok(fechas.every((f) => f >= r.desde));
  assert.ok(fechas.every((f) => [0, 2].includes(diaSemanaIndex(f))));
  assert.deepEqual(fechas.slice(0, 4), ['2026-11-16', '2026-11-18', '2026-11-23', '2026-11-25']);
});

test('generarOcurrencias: ID estable, sin duplicados y con horizonte móvil', () => {
  const r = rutina();
  const nuevas1 = generarOcurrencias(r, [], JUEVES_10);
  assert.ok(nuevas1.length > 0);
  const fin = addDays(hoyLocal(JUEVES_10), HORIZONTE_DIAS);
  assert.ok(nuevas1.every((c) => c.fecha <= fin));
  assert.ok(nuevas1.every((c) => c.fecha >= r.desde));

  // Reabrir con las ya generadas no agrega nada (no duplica).
  const nuevas2 = generarOcurrencias(r, nuevas1, JUEVES_10);
  assert.equal(nuevas2.length, 0, 'reabrir no duplica ocurrencias');
  assert.equal(new Set(nuevas1.map((c) => c.id)).size, nuevas1.length, 'IDs únicos');

  const primera = nuevas1[0];
  assert.equal(primera.id, idOcurrencia(r.id, primera.fecha));
  assert.equal(primera.rutinaId, r.id);
  assert.equal(primera.fechaRutina, primera.fecha);
  assert.equal(primera.nombre, r.nombre);
  assert.equal(primera.minutos, 15 * 60);
  assert.equal(primera.duracionMin, 60);

  // Al avanzar el reloj aparecen ocurrencias nuevas, sin tocar las viejas.
  const masAdelante = generarOcurrencias(r, nuevas1, t('2026-12-20T13:00:00.000Z'));
  assert.ok(masAdelante.length > 0, 'el horizonte se extiende al navegar adelante');
  assert.ok(masAdelante.every((c) => !nuevas1.some((n) => n.id === c.id)));
});

test('una ocurrencia cancelada o movida no reaparece en origen; el resto sigue', () => {
  const r = rutina();
  const todas = generarOcurrencias(r, [], JUEVES_10);
  const origen = todas[2];
  const conExc = conExcepcion(r, origen.fechaRutina as string, 'cancelada');

  const trasCancelar = generarOcurrencias(conExc, todas, JUEVES_10);
  assert.equal(trasCancelar.length, 0, 'no se regenera la cancelada');
  assert.equal(todas.length, todas.length, 'el resto de la serie sigue en la lista');

  // Si se regenerara desde cero (p. ej. estado sin la clase), la fecha sigue excluida.
  const desdeCero = generarOcurrencias(conExc, [], JUEVES_10);
  assert.equal(desdeCero.some((c) => c.fecha === origen.fecha), false, 'la cancelada no vuelve en origen');
  assert.ok(desdeCero.length === todas.length - 1, 'solo falta la ocurrencia cancelada');
});

test('crearClaseSuelta valida y no lleva rutina', () => {
  const suelta = crearClaseSuelta({ id: 'suelta-1', nombre: 'Inglés individual', fecha: '2026-11-25', hora: '17:30' });
  assert.equal(suelta.fecha, '2026-11-25');
  assert.equal(suelta.minutos, 17 * 60 + 30);
  assert.equal(suelta.duracionMin, 60);
  assert.equal(suelta.rutinaId, undefined);
  assert.throws(() => crearClaseSuelta({ id: 'suelta-2', nombre: 'x', fecha: '2026-02-30', hora: '10:00' }), /Fecha inválida/);
  assert.throws(() => crearClaseSuelta({ id: 'suelta-2', nombre: '   ', fecha: '2026-11-25', hora: '10:00' }), /nombre/);
});

/** suma días sobre una fecha "AAAA-MM-DD" sin reloj (solo para el test). */
function addDays(fecha: string, n: number): string {
  const d = new Date(fecha + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
