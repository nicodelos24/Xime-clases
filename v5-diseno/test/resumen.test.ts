/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  resumenHoy, tieneClases, clasesDelDia, clasesDeLaSemana,
} from '../src/resumen.ts';
import { cancelarClase, crearClase, marcarDada, type Clase } from '../src/clases.ts';

/** Marca a mano (como la dueña); el reloj ya no marca nada solo (23/11). */
const marcar = (cs: Clase[], quien = 'Xime') =>
  cs.map((c) => (c.estado === 'programada' ? marcarDada(c, { quien, ahora: t(ISO_1830) }) : c));
import { relojFalso } from '../src/reloj.ts';

const t = (s: string) => new Date(s).getTime();
const ISO_1830 = '2026-11-18T21:30:00.000Z'; // 18:30 del 18/11 en Uruguay

const base = (): Clase[] => [
  crearClase({ id: 'c1', nombre: 'Grupo Martes A', fecha: '2026-11-18', hora: '15:00' }),
  crearClase({ id: 'c2', nombre: 'Grupo Martes B', fecha: '2026-11-18', hora: '17:30' }),
  crearClase({ id: 'c3', nombre: 'Grupo Viernes', fecha: '2026-11-20', hora: '15:00' }),
];

test('el resumen de Hoy se arma con las clases del día, ordenadas por hora', () => {
  const clases = marcar(base()); // las dos de hoy ya se dictaron
  const r = resumenHoy(clases, '2026-11-18');
  assert.equal(r.fecha, '2026-11-18');
  assert.equal(r.clases.length, 2);
  assert.deepEqual(r.clases.map((c) => c.nombre), ['Grupo Martes A', 'Grupo Martes B']);
  assert.equal(r.porDar, 0);
  assert.equal(r.dadas, 2);
  assert.equal(r.frase, 'Sin clases por dar');
  assert.deepEqual(r.anillo, [2, 2]);
});

test('antes de la hora: "2 clases grupales por dar" y anillo 0/2', () => {
  const clases = base(); // nada marcado todavía
  const r = resumenHoy(clases, '2026-11-18');
  assert.equal(r.porDar, 2);
  assert.equal(r.frase, '2 clases grupales por dar');
  assert.deepEqual(r.anillo, [0, 2]);
  assert.equal(r.dadas, 0);
});

test('una sola clase pendiente usa el singular', () => {
  const clases = [crearClase({ id: 'c1', nombre: 'A', fecha: '2026-11-18', hora: '15:00' })];
  const r = resumenHoy(clases, '2026-11-18');
  assert.equal(r.frase, '1 clase grupal por dar');
  assert.deepEqual(r.anillo, [0, 1]);
});

test('una cancelada no cuenta en el anillo ni como "por dar"', () => {
  const clases = marcar(base());
  const conCancelada = clases.map((c) =>
    c.id === 'c2' ? cancelarClase(c, { motivo: 'Lluvia', quien: 'Xime', ahora: t(ISO_1830) }) : c,
  );
  const r = resumenHoy(conCancelada, '2026-11-18');
  assert.equal(r.canceladas, 1);
  assert.equal(r.dadas, 1);
  assert.equal(r.porDar, 0);
  assert.deepEqual(r.anillo, [1, 1], 'el anillo cuenta solo las no canceladas');
  assert.equal(r.clases.length, 2, 'la cancelada sigue visible en la lista');
});

test('día sin clases: sin frase de pendientes', () => {
  const r = resumenHoy(base(), '2026-11-19');
  assert.equal(r.clases.length, 0);
  assert.equal(r.porDar, 0);
  assert.equal(r.frase, 'Sin clases por dar');
  assert.deepEqual(r.anillo, [0, 0]);
});

test('tieneClases y clasesDelDia (punto de la tira, línea de tiempo)', () => {
  const clases = base();
  assert.equal(tieneClases(clases, '2026-11-18'), true);
  assert.equal(tieneClases(clases, '2026-11-19'), false);
  assert.equal(clasesDelDia(clases, '2026-11-20')[0].nombre, 'Grupo Viernes');
  assert.deepEqual(clasesDelDia(clases, '2026-11-20').map((c) => c.minutos), [900]);
});

test('la semana se arma de lunes a domingo', () => {
  const semana = clasesDeLaSemana(base(), '2026-11-18');
  assert.equal(semana.length, 7);
  assert.equal(semana[0].fecha, '2026-11-16'); // lunes
  assert.equal(semana[6].fecha, '2026-11-22'); // domingo
  assert.deepEqual(semana.map((d) => d.fecha), [
    '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19',
    '2026-11-20', '2026-11-21', '2026-11-22',
  ]);
  assert.equal(semana[2].clases.length, 2); // martes 18
  assert.equal(semana[4].clases.length, 1); // viernes 20
  assert.equal(semana[0].clases.length, 0);
});
