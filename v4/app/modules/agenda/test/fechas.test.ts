/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  aFecha,
  diasDelMes,
  etiquetaFechaLarga,
  lunesDe,
  sumarDias,
  diaSemanaIndex,
} from '../../../packages/datos/src/fechas.ts';

test('lunes de la semana: 15/11/2026 (domingo) → 09/11/2026', () => {
  assert.equal(lunesDe('2026-11-15'), '2026-11-09');
});

test('sumar días cruzando fin de mes', () => {
  assert.equal(sumarDias('2026-11-29', 3), '2026-12-02');
});

test('días del mes con bisiesto', () => {
  assert.equal(diasDelMes(2024, 2), 29);
  assert.equal(diasDelMes(2026, 2), 28);
});

test('índice de día de semana con lunes = 0', () => {
  assert.equal(diaSemanaIndex('2026-11-16'), 0); // lunes
  assert.equal(diaSemanaIndex('2026-11-15'), 6); // domingo
});

test('etiquetas localizadas es-UY', () => {
  assert.equal(etiquetaFechaLarga('2026-11-15'), 'domingo 15 de noviembre de 2026');
  assert.equal(aFecha(2026, 11, 5), '2026-11-05');
});
