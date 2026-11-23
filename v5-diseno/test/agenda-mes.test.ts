/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { mesDeHoy, diaSeleccionadoAlCargar, primerDiaDeMes } from '../src/index.ts';

test('el mes de hoy es el mes de la fecha real, no el que se había navegado', () => {
  assert.equal(mesDeHoy('2026-11-23'), '2026-11');
  assert.equal(mesDeHoy('2027-01-05'), '2027-01');
});

test('al cargar, el día elegido solo sobrevive si es del mes de hoy', () => {
  assert.equal(diaSeleccionadoAlCargar('2026-11-23', '2026-11-23'), '2026-11-23');
  assert.equal(diaSeleccionadoAlCargar('2026-11-30', '2026-11-23'), '2026-11-30');
  // Elegido en otro mes (p. ej. enero 2027): no se selecciona nada.
  assert.equal(diaSeleccionadoAlCargar('2027-01-14', '2026-11-23'), null);
  assert.equal(diaSeleccionadoAlCargar(null, '2026-11-23'), null);
});

test('las flechas mueven el mes sin saltos de año ni días de más', () => {
  assert.equal(primerDiaDeMes('2026-11-01', 1), '2026-12-01');
  assert.equal(primerDiaDeMes('2026-11-01', 2), '2027-01-01');
  assert.equal(primerDiaDeMes('2027-01-01', -2), '2026-11-01');
  assert.equal(primerDiaDeMes('2026-12-01', 1), '2027-01-01');
  assert.equal(primerDiaDeMes('2026-01-01', -1), '2025-12-01');
});

test('mover un año entero deja el mismo mes', () => {
  assert.equal(primerDiaDeMes('2026-03-01', 12), '2027-03-01');
  assert.equal(primerDiaDeMes('2026-03-01', -12), '2025-03-01');
  assert.equal(primerDiaDeMes('2026-03-01', 0), '2026-03-01');
});
