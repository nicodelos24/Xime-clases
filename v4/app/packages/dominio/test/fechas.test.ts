import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  sumarDias,
  diaSiguiente,
  diaAnterior,
  diasEntre,
  esBisiesto,
  diasDelMes,
  hoyLocal,
  esFechaValida,
  diasDesdeCivil,
  civilDesdeDias,
} from '../src/fechas.ts';

test('aritmética de días', () => {
  assert.equal(diaSiguiente('2026-02-28'), '2026-03-01');
  assert.equal(diaSiguiente('2028-02-28'), '2028-02-29');
  assert.equal(diaAnterior('2026-03-01'), '2026-02-28');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(diasEntre('2026-05-04', '2026-05-11'), 7);
  assert.equal(diasEntre('2026-05-11', '2026-05-04'), -7);
});

test('calendario: bisiestos y meses', () => {
  assert.equal(esBisiesto(2028), true);
  assert.equal(esBisiesto(2029), false);
  assert.equal(esBisiesto(2000), true);
  assert.equal(esBisiesto(1900), false);
  assert.equal(diasDelMes(2027, 2), 28);
  assert.equal(diasDelMes(2028, 2), 29);
  assert.equal(diasDelMes(2026, 4), 30);
});

test('día civil va y vuelve', () => {
  for (const f of ['1970-01-01', '2026-02-28', '2026-02-29', '2028-02-29', '2029-02-28', '2027-05-11']) {
    if (esFechaValida(f)) assert.equal(civilDesdeDias(diasDesdeCivil({ y: +f.slice(0, 4), m: +f.slice(5, 7), d: +f.slice(8, 10) })) && sumarDias(f, 0), f);
  }
  assert.equal(sumarDias('2028-02-29', 0), '2028-02-29');
  assert.equal(diasEntre('1970-01-01', '2026-01-01'), 20454);
});

test('esFechaValida', () => {
  assert.equal(esFechaValida('2026-05-11'), true);
  assert.equal(esFechaValida('2026-02-30'), false);
  assert.equal(esFechaValida('2026-13-01'), false);
  assert.equal(esFechaValida('11/05/2026'), false);
  assert.equal(esFechaValida('2026-5-11'), false);
});

test('hoyLocal convierte un instante a la fecha local de Montevideo (UTC-3 todo el año)', () => {
  // 00:30 UTC del 12/05/2026 = 21:30 del 11/05 en Montevideo
  assert.equal(hoyLocal(Date.UTC(2026, 4, 12, 0, 30)), '2026-05-11');
  // 03:00 UTC del 12/05 = 00:00 del 12/05 en Montevideo
  assert.equal(hoyLocal(Date.UTC(2026, 4, 12, 3, 0)), '2026-05-12');
  // Otra zona si el instituto viviera en otra parte:
  assert.equal(hoyLocal(Date.UTC(2026, 4, 12, 3, 0), 'UTC'), '2026-05-12');
});
