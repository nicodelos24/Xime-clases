/// <reference types="node" />
/**
 * Tests del módulo Hoy (Fase 3a v4): lógica pura de textos y constantes del
 * demo aprobado (v4/diseno). Sin React ni Expo; sin datos de dinero.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  capitalizar,
  kickerFecha,
  tituloProgreso,
  lineaProgreso,
  RETRASO_ENTRADA,
  FESTEJO,
  ANILLO,
  HOY_COLORES,
} from '../screens/textoHoy.ts';
import { clasesDelDia } from '../../../packages/datos/src/resumenHoy.ts';
import {
  ALUMNOS_FIXTURES,
  OCURRENCIAS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
} from '../../../packages/datos/src/fixtures.ts';

const FECHA = '2026-11-16'; // 3 clases activas en fixtures: Bruno, Carla, Diego

const clases = (dadas: string[] = []) =>
  clasesDelDia(
    ALUMNOS_FIXTURES.map((a) => ({ ...a })),
    OCURRENCIAS_FIXTURES.map((o) => ({ ...o })),
    PROGRAMACIONES_FIXTURES.map((p) => ({ ...p })),
    FECHA,
    new Set(dadas),
  );

// ─── Textos del hero ─────────────────────────────────────────────────────────

test('Hoy · título del hero: clases por dar, singular/plural, día completo y vacío', () => {
  assert.equal(tituloProgreso(0, 3), '3 clases por dar');
  assert.equal(tituloProgreso(2, 3), '1 clase por dar');
  assert.equal(tituloProgreso(3, 3), 'Día completo');
  assert.equal(tituloProgreso(0, 0), 'Sin clases hoy');
});

test('Hoy · línea del hero: cuenta dadas y día completo', () => {
  assert.equal(lineaProgreso(clases()), '3 clases hoy · 0 dadas');
  assert.equal(lineaProgreso(clases(['p-001'])), '3 clases hoy · 1 dada');
  assert.equal(lineaProgreso(clases(['p-001', 'p-002', 'p-003'])), 'Todas las clases del día están dadas');
  assert.equal(lineaProgreso([]), 'Sin clases programadas hoy');
});

test('Hoy · kicker de fecha: capitalizado y sin año', () => {
  assert.equal(kickerFecha('2026-11-17'), 'Martes 17 de noviembre');
  assert.equal(kickerFecha('2026-01-01'), 'Jueves 1 de enero');
  assert.equal(capitalizar('buenas'), 'Buenas');
});

// ─── Orden y derivación desde la sesión (mismo contrato que el demo) ─────────

test('Hoy · clases del día ordenadas por hora y dadas derivan del estado compartido', () => {
  const lista = clases(['p-002']);
  assert.deepEqual(
    lista.map((c) => c.hora),
    ['16:00', '16:00', '18:30'],
  );
  assert.deepEqual(
    lista.map((c) => c.dada),
    [false, true, false],
  );
});

test('Hoy · cancelada no entra al anillo ni a la lista', () => {
  const oc = OCURRENCIAS_FIXTURES.map((o) => (o.id === 'o-16-1' ? { ...o, estado: 'cancelada' as const } : o));
  const lista = clasesDelDia(
    ALUMNOS_FIXTURES.map((a) => ({ ...a })),
    oc,
    PROGRAMACIONES_FIXTURES.map((p) => ({ ...p })),
    FECHA,
    new Set(),
  );
  assert.equal(lista.length, 1); // queda solo Diego (18:30)
});

// ─── Constantes del demo aprobado (animación sobria 150–350 ms) ──────────────

test('Hoy · entrada escalonada dentro de la guía 150–350 ms', () => {
  assert.equal(RETRASO_ENTRADA.duracion, 320);
  assert.deepEqual([...RETRASO_ENTRADA.kpi], [90, 150, 210]);
  assert.equal(RETRASO_ENTRADA.filaPaso, 90);
});

test('Hoy · micro-festejo: 6 colores pastel y 320 ms', () => {
  assert.equal(FESTEJO.duracion, 320);
  assert.equal(FESTEJO.colores.length, 6);
});

test('Hoy · anillo 84/8 con latido al completar y botón Dada turquesa', () => {
  assert.equal(ANILLO.tamaño, 84);
  assert.equal(ANILLO.grosor, 8);
  assert.equal(ANILLO.latido, 320);
  assert.equal(HOY_COLORES.dadaTocada.fondo, '#0E7C7B');
  assert.equal(HOY_COLORES.dadaReposo.texto, '#0B6B6A');
  assert.equal(HOY_COLORES.avisoFondo, '#FFF3CF');
});
