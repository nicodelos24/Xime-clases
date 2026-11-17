/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  clasesDelDia,
  fraccionAnillo,
  saludoPorHora,
  totalClasesDelDia,
} from '../src/resumenHoy.ts';
import {
  ALUMNOS_FIXTURES,
  OCURRENCIAS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
} from '../src/fixtures.ts';

const F = '2026-11-16'; // lunes con Bruno, Carla (16:00) y Diego (18:30)

test('clasesDelDia lista por hora solo relaciones activas de alumnos activos', () => {
  const clases = clasesDelDia(ALUMNOS_FIXTURES, OCURRENCIAS_FIXTURES, PROGRAMACIONES_FIXTURES, F, new Set());
  assert.deepEqual(
    clases.map((c) => [c.hora, c.nombre, c.modalidad]),
    [
      ['16:00', 'Bruno S.', 'mensual'],
      ['16:00', 'Carla T.', 'mensual'],
      ['18:30', 'Diego V.', 'individual'],
    ],
  );
  // Rosa tiene una programación retirada ese día: no aparece.
  assert.ok(!clases.some((c) => c.nombre === 'Rosa M.'));
});

test('la marca «dada» es visual por programación y no muta los fixtures', () => {
  const dadas = new Set(['p-001']);
  const clases = clasesDelDia(ALUMNOS_FIXTURES, OCURRENCIAS_FIXTURES, PROGRAMACIONES_FIXTURES, F, dadas);
  assert.equal(clases.find((c) => c.programacionId === 'p-001')?.dada, true);
  assert.equal(clases.find((c) => c.programacionId === 'p-002')?.dada, false);
  // sin tocar el array de fixtures
  assert.equal(PROGRAMACIONES_FIXTURES.find((p) => p.id === 'p-001')?.activa, true);
});

test('el día vacío y el anillo sin clases no dividen por cero', () => {
  assert.deepEqual(clasesDelDia(ALUMNOS_FIXTURES, OCURRENCIAS_FIXTURES, PROGRAMACIONES_FIXTURES, '2026-11-21', new Set()), []);
  assert.equal(totalClasesDelDia(ALUMNOS_FIXTURES, OCURRENCIAS_FIXTURES, PROGRAMACIONES_FIXTURES, '2026-11-21'), 0);
  assert.equal(fraccionAnillo(0, 0), 0);
  assert.equal(fraccionAnillo(1, 0), 0);
});

test('fraccionAnillo queda en 0..1 y cuenta dadas/total', () => {
  assert.equal(fraccionAnillo(2, 3), 2 / 3);
  assert.equal(fraccionAnillo(3, 3), 1);
  assert.equal(fraccionAnillo(-1, 3), 0);
  assert.equal(fraccionAnillo(4, 3), 1);
});

test('la ocurrencia cancelada no entra en el anillo ni en la lista', () => {
  // 2026-11-20 tiene una ocurrencia cancelada (10:00)
  const total = totalClasesDelDia(ALUMNOS_FIXTURES, OCURRENCIAS_FIXTURES, PROGRAMACIONES_FIXTURES, '2026-11-20');
  assert.equal(total, 0);
});

test('saludoPorHora cambia por tramos y no depende del reloj global', () => {
  assert.equal(saludoPorHora(8), 'Buenos días');
  assert.equal(saludoPorHora(13), 'Buenas tardes');
  assert.equal(saludoPorHora(20), 'Buenas noches');
});
