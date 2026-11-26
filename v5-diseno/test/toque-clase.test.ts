import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  decisionDeEventoToque, decisionDeGesto, resultadoDeCicloDeChip, toqueSimpleCambiaEstado,
  etiquetaProximoPaso,
  DURACION_TOQUE_LARGO, UMBRAL_MOVIMIENTO_GESTO,
  type GestoClase,
} from '../src/toque-clase.ts';

const gesto = (duracionMs: number, maxDesplazamiento = 0, cancelado = false): GestoClase =>
  ({ duracionMs, maxDesplazamiento, cancelado });

test('toque corto y quieto en la tarjeta despliega quiénes van (no cambia estado)', () => {
  assert.equal(decisionDeGesto(gesto(120), 'programada'), 'desplegar');
  assert.equal(decisionDeGesto(gesto(DURACION_TOQUE_LARGO - 1), 'dada'), 'desplegar');
});

test('mantener ~450 ms sobre la tarjeta abre el menú, en cualquier estado', () => {
  assert.equal(DURACION_TOQUE_LARGO, 450);
  assert.equal(decisionDeGesto(gesto(DURACION_TOQUE_LARGO), 'programada'), 'menu');
  assert.equal(decisionDeGesto(gesto(900), 'dada'), 'menu');
  assert.equal(decisionDeGesto(gesto(2000), 'cancelada'), 'menu');
});

test('scroll y pointercancel no despliegan ni abren nada', () => {
  assert.equal(decisionDeGesto(gesto(120, UMBRAL_MOVIMIENTO_GESTO + 1), 'programada'), 'nada');
  assert.equal(decisionDeGesto(gesto(900, 45), 'programada'), 'nada');
  assert.equal(decisionDeGesto(gesto(900, 0, true), 'programada'), 'nada');
});

test('un apoyo torpe de hasta 10 px sigue siendo toque', () => {
  assert.equal(decisionDeGesto(gesto(150, UMBRAL_MOVIMIENTO_GESTO), 'programada'), 'desplegar');
  assert.equal(decisionDeGesto(gesto(DURACION_TOQUE_LARGO, UMBRAL_MOVIMIENTO_GESTO), 'programada'), 'menu');
});

test('el CHIP cicla: Por dar → Dada → Cancelada → Por dar', () => {
  assert.equal(resultadoDeCicloDeChip('programada'), 'dada');
  assert.equal(resultadoDeCicloDeChip('dada'), 'cancelada');
  assert.equal(resultadoDeCicloDeChip('cancelada'), 'por-dar');
  assert.equal(toqueSimpleCambiaEstado('programada'), true);
  assert.equal(toqueSimpleCambiaEstado('dada'), true);
  assert.equal(toqueSimpleCambiaEstado('cancelada'), true);
  assert.equal(etiquetaProximoPaso('programada'), 'marcar dada');
  assert.equal(etiquetaProximoPaso('dada'), 'cancelar clase');
  assert.equal(etiquetaProximoPaso('cancelada'), 'volver a Por dar');
});

test('integración pura de eventos: el click físico del chip es el ciclo, el teclado abre el menú', () => {
  for (const estado of ['programada', 'dada', 'cancelada'] as const) {
    assert.equal(decisionDeEventoToque({ tipo: 'pointerup', fisico: true, consumido: false }, 'chip', estado), 'nada');
    // Su click propio cicla el estado (lo aplica la UI); la política común no duplica.
    assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: true, consumido: false }, 'chip', estado), 'nada');
    // Teclado/AT conserva el menú completo como acceso explícito.
    assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: false }, 'chip', estado), 'menu');
  }
});

test('integración pura: la tarjeta evalúa el gesto y nunca cambia estado', () => {
  assert.equal(decisionDeEventoToque({ tipo: 'pointerup', fisico: true, consumido: false }, 'tarjeta', 'dada'), 'evaluar-gesto');
  assert.equal(decisionDeGesto(gesto(150), 'dada'), 'desplegar');
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: true, consumido: false }, 'tarjeta', 'dada'), 'nada');
});

test('un gesto consumido no abre menú con el click posterior', () => {
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: true, consumido: true }, 'chip', 'dada'), 'nada');
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: true }, 'chip', 'dada'), 'nada');
  // Teclado/AT sin gesto previo conserva el acceso explícito.
  assert.equal(decisionDeEventoToque({ tipo: 'click', fisico: false, consumido: false }, 'chip', 'dada'), 'menu');
});
