/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  sumarDias, diasDeFecha, fechaDesdeDias, diaSemanaIndex, lunesDe,
  diaCorto, mesCorto, diaLargo, etiquetaDia, etiquetaDiaCorta, etiquetaMes, esFechaValida, diasDelMes,
} from '../src/fechas.ts';

test('fecha concreta para la tira semanal y para cambiar de día (punto 3)', () => {
  // La tira pasó de «LU» suelto a día + mes: la dueña ve la fecha real.
  assert.equal(mesCorto('2026-11-23'), 'nov');
  assert.equal(mesCorto('2026-01-05'), 'ene');
  assert.equal(mesCorto('2026-12-31'), 'dic');
  // «Hacia:» al mover una clase: día de la semana + fecha, sin año.
  assert.equal(etiquetaDiaCorta('2026-11-30'), 'lunes 30/11');
  assert.equal(etiquetaDiaCorta('2026-03-05'), 'jueves 5/03');
});

test('sumar días cruzando fin de mes y año', () => {
  assert.equal(sumarDias('2026-11-29', 3), '2026-12-02');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(sumarDias('2026-01-01', -1), '2025-12-31');
});

test('días civiles son inversos de fechaDesdeDias', () => {
  for (const f of ['1970-01-01', '2026-11-18', '2024-02-29', '2100-06-30']) {
    assert.equal(fechaDesdeDias(diasDeFecha(f)), f);
  }
  assert.equal(diasDeFecha('1970-01-01'), 0);
});

test('día de semana con lunes = 0', () => {
  assert.equal(diaSemanaIndex('2026-11-16'), 0); // lunes
  assert.equal(diaSemanaIndex('2026-11-17'), 1); // martes
  assert.equal(diaSemanaIndex('2026-11-22'), 6); // domingo
  assert.equal(diaSemanaIndex('2026-11-15'), 6);
});

test('lunes de la semana', () => {
  assert.equal(lunesDe('2026-11-15'), '2026-11-09');
  assert.equal(lunesDe('2026-11-16'), '2026-11-16');
  assert.equal(lunesDe('2026-11-22'), '2026-11-16');
});

test('etiquetas en español', () => {
  assert.equal(diaCorto('2026-11-17'), 'MA');
  assert.equal(diaLargo('2026-11-17'), 'martes');
  assert.equal(etiquetaDia('2026-11-17'), 'martes 17 de noviembre');
  assert.equal(etiquetaMes('2026-11-17'), 'noviembre 2026');
});

test('fechas inválidas no pasan', () => {
  assert.ok(esFechaValida('2026-02-28'));
  assert.ok(!esFechaValida('2026-02-29')); // 2026 no es bisiesto
  assert.ok(esFechaValida('2024-02-29'));
  assert.ok(!esFechaValida('2026-13-01'));
  assert.ok(!esFechaValida('ayer'));
  assert.throws(() => diasDelMes(2026, 13));
});
