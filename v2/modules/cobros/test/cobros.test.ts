/// <reference types="node" />
/**
 * Tests de la lógica de Cobros (I1): derivación de clases adeudadas desde la
 * marca «dada» de la sesión, y contratos de la pantalla sin React.
 * Solo lógica pura (estadosCobros.ts) — sin React ni Expo.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  ALUMNOS_FIXTURES,
  OCURRENCIAS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
} from '../../../packages/datos/src/fixtures.ts';
import {
  cobrosPendientes,
  detalleVencimiento,
  PESTANIAS_COBROS,
  ETIQUETA_PESTANIA,
} from '../screens/estadosCobros.ts';

const BASE = {
  alumnos: ALUMNOS_FIXTURES.map((a) => ({ ...a })),
  ocurrencias: OCURRENCIAS_FIXTURES.map((o) => ({ ...o })),
  programaciones: PROGRAMACIONES_FIXTURES.map((p) => ({ ...p })),
};

test('Cobros · sin clases dadas no hay adeudadas', () => {
  const pendientes = cobrosPendientes(BASE.alumnos, BASE.ocurrencias, BASE.programaciones, '2026-11-16', new Set());
  assert.equal(pendientes.length, 0);
});

test('Cobros · clase dada de alumno individual queda adeudada (1 clase)', () => {
  const dadas = new Set(['p-003']); // Diego V. (individual) el 16/11
  const pendientes = cobrosPendientes(BASE.alumnos, BASE.ocurrencias, BASE.programaciones, '2026-11-16', dadas);
  assert.equal(pendientes.length, 1);
  assert.equal(pendientes[0].alumnoId, 'a-diego');
  assert.equal(pendientes[0].concepto, 'Clases sueltas');
  assert.equal(pendientes[0].estado, 'Adeudada');
  assert.match(pendientes[0].detalle, /Debe 1 clase dada sin cobrar/);
});

test('Cobros · dos clases dadas el mismo día suman (Diego tiene 2 programaciones posibles)', () => {
  // Agregamos una segunda ocurrencia/programación de Diego el mismo día para probar el conteo.
  const oc = [...BASE.ocurrencias, { id: 'o-16-x', fecha: '2026-11-16', hora: '20:00', estado: 'programada' as const }];
  const pr = [...BASE.programaciones, { id: 'p-00x', alumnoId: 'a-diego', ocurrenciaId: 'o-16-x', activa: true }];
  const pendientes = cobrosPendientes(BASE.alumnos, oc, pr, '2026-11-16', new Set(['p-003', 'p-00x']));
  assert.equal(pendientes.length, 1);
  assert.match(pendientes[0].detalle, /Debe 2 clases dadas sin cobrar/);
});

test('Cobros · clases dadas de alumnos mensuales NO generan adeudadas (mensualidad cubre)', () => {
  const dadas = new Set(['p-001', 'p-002']); // Bruno y Carla (mensuales) el 16/11
  const pendientes = cobrosPendientes(BASE.alumnos, BASE.ocurrencias, BASE.programaciones, '2026-11-16', dadas);
  assert.equal(pendientes.length, 0);
});

test('Cobros · retirar una programación la saca del conteo (solo activas)', () => {
  const pr = BASE.programaciones.map((p) => (p.id === 'p-003' ? { ...p, activa: false } : p));
  const pendientes = cobrosPendientes(BASE.alumnos, BASE.ocurrencias, pr, '2026-11-16', new Set(['p-003']));
  assert.equal(pendientes.length, 0);
});

test('Cobros · cancelada no genera adeudada aunque esté marcada', () => {
  const oc = BASE.ocurrencias.map((o) => (o.id === 'o-16-2' ? { ...o, estado: 'cancelada' as const } : o));
  const pendientes = cobrosPendientes(BASE.alumnos, oc, BASE.programaciones, '2026-11-16', new Set(['p-003']));
  assert.equal(pendientes.length, 0);
});

test('Cobros · día sin ocurrencias devuelve lista vacía', () => {
  const pendientes = cobrosPendientes(BASE.alumnos, BASE.ocurrencias, BASE.programaciones, '2026-11-23', new Set(['p-001']));
  assert.equal(pendientes.length, 0);
});

// ─── Detalle de vencimiento (texto del dominio, sin inventar fechas) ────────

test('Cobros · detalleVencimiento: hoy, futuro y pasado', () => {
  assert.equal(detalleVencimiento('2026-11-16', '2026-11-16'), 'Vence hoy');
  assert.equal(detalleVencimiento('2026-11-18', '2026-11-16'), 'Vence en 2 días');
  assert.equal(detalleVencimiento('2026-11-17', '2026-11-16'), 'Vence en 1 día');
  assert.equal(detalleVencimiento('2026-11-11', '2026-11-16'), 'Venció hace 5 días');
  assert.equal(detalleVencimiento('2026-11-15', '2026-11-16'), 'Venció hace 1 día');
});

// ─── Pestañas ────────────────────────────────────────────────────────────────

test('Cobros · 4 pestañas con etiquetas, historial incluido', () => {
  assert.deepEqual(PESTANIAS_COBROS, ['porVencer', 'vencidas', 'adeudadas', 'historial']);
  assert.equal(ETIQUETA_PESTANIA.historial, 'Historial');
  assert.equal(ETIQUETA_PESTANIA.porVencer, 'Por vencer');
});
