import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  decisionDeEventoToque, decisionDeGesto, resultadoDeToqueSimple, toqueSimpleCambiaEstado,
  DURACION_TOQUE_LARGO, UMBRAL_MOVIMIENTO_GESTO,
  type GestoClase,
} from '../src/toque-clase.ts';

const gesto = (duracionMs: number, maxDesplazamiento = 0, cancelado = false): GestoClase =>
  ({ duracionMs, maxDesplazamiento, cancelado });

test('toque corto y quieto en «Por dar» cambia el estado (no abre menú)', () => {
  assert.equal(decisionDeGesto(gesto(120), 'programada'), 'estado');
  assert.equal(decisionDeGesto(gesto(DURACION_TOQUE_LARGO - 1), 'programada'), 'estado');
  assert.equal(resultadoDeToqueSimple('programada'), 'dada');
});

test('mantener ~450 ms abre el menú; en cancelada no abre uno vacío', () => {
  assert.equal(DURACION_TOQUE_LARGO, 450);
  assert.equal(decisionDeGesto(gesto(DURACION_TOQUE_LARGO), 'programada'), 'menu');
  assert.equal(decisionDeGesto(gesto(900), 'dada'), 'menu');
  assert.equal(decisionDeGesto(gesto(2000), 'cancelada'), 'nada');
});

test('scroll y pointercancel no marcan ni abren nada', () => {
  assert.equal(decisionDeGesto(gesto(120, UMBRAL_MOVIMIENTO_GESTO + 1), 'programada'), 'nada');
  assert.equal(decisionDeGesto(gesto(900, 45), 'programada'), 'nada');
  assert.equal(decisionDeGesto(gesto(900, 0, true), 'programada'), 'nada');
});

test('un apoyo torpe de hasta 10 px sigue siendo toque', () => {
  assert.equal(decisionDeGesto(gesto(150, UMBRAL_MOVIMIENTO_GESTO), 'programada'), 'estado');
  assert.equal(decisionDeGesto(gesto(DURACION_TOQUE_LARGO, UMBRAL_MOVIMIENTO_GESTO), 'programada'), 'menu');
});

test('Dada vuelve a Por dar; cancelada conserva Revertir', () => {
  assert.equal(decisionDeGesto(gesto(150), 'dada'), 'estado');
  assert.equal(resultadoDeToqueSimple('dada'), 'por-dar');
  assert.equal(decisionDeGesto(gesto(150), 'cancelada'), 'nada');
  assert.equal(decisionDeGesto(gesto(900), 'cancelada'), 'nada');
  assert.equal(toqueSimpleCambiaEstado('cancelada'), false);
  assert.equal(toqueSimpleCambiaEstado('programada'), true);
  assert.equal(toqueSimpleCambiaEstado('dada'), true);
});

test('integración pura de eventos: el chip no inicia el gesto simple/largo', () => {
  for (const estado of ['programada', 'dada'] as const) {
    assert.equal(decisionDeEventoToque({ tipo: 'pointerup', fisico: true, consumido: false }, 'chip', estado), 'nada');
    // Su click propio abre menú (físico, teclado o AT); la política común no duplica.
    assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: true, consumido: false }, 'chip', estado), 'nada');
    assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: false }, 'chip', estado), 'menu');
  }
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: false }, 'chip', 'cancelada'), 'nada');
});

test('integración pura: zona vacía decide una vez y Dada nunca abre cancelación', () => {
  assert.equal(decisionDeEventoToque({ tipo: 'pointerup', fisico: true, consumido: false }, 'tarjeta', 'dada'), 'evaluar-gesto');
  assert.equal(decisionDeGesto(gesto(150), 'dada'), 'estado');
  assert.equal(resultadoDeToqueSimple('dada'), 'por-dar');
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: true, consumido: false }, 'tarjeta', 'dada'), 'nada');
});

test('un gesto consumido no abre menú con el click posterior', () => {
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: true, consumido: true }, 'chip', 'dada'), 'nada');
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: true }, 'chip', 'dada'), 'nada');
  // Teclado/AT sin gesto previo conserva el acceso explícito.
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: false }, 'chip', 'dada'), 'menu');
});
