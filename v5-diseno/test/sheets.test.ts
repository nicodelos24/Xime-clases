/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  MARGEN_SHEET, alturaMaximaSheet, estiloSheet, ajustarLock, debeBloquearScroll,
  OPCIONES_CAMBIOS_SIN_GUARDAR, DECISION_ESCAPE_AVISO,
  debeCerrarPorToqueFuera, UMBRAL_MOVIMIENTO_TOQUE, type PuntoToque,
} from '../src/sheets.ts';

test('el sheet cabe en el viewport y deja ver la página arriba y la cápsula abajo', () => {
  const alto = 700;
  assert.equal(alturaMaximaSheet(alto), alto - MARGEN_SHEET.arriba - MARGEN_SHEET.abajo);
  assert.equal(alturaMaximaSheet(alto, 20), alto - MARGEN_SHEET.arriba - MARGEN_SHEET.abajo - 20);
  // Nunca una altura negativa o ridícula en pantallas chicas.
  assert.equal(alturaMaximaSheet(100), 160);
});

test('el estilo del sheet lo ancla al viewport y limita su altura', () => {
  const estilo = estiloSheet(700, 10);
  assert.match(estilo, /max-height:\d+px/);
  assert.match(estilo, /bottom:var\(--sheet-base\)/);
  assert.match(estilo, /top:auto/);
});

test('el lock es profundo: dos sheets abiertos, cerrar uno no desbloquea', () => {
  let profundidad = 0;
  profundidad = ajustarLock(profundidad, true);
  profundidad = ajustarLock(profundidad, true);
  assert.equal(debeBloquearScroll(profundidad), true);
  profundidad = ajustarLock(profundidad, false);
  assert.equal(debeBloquearScroll(profundidad), true);
  profundidad = ajustarLock(profundidad, false);
  assert.equal(debeBloquearScroll(profundidad), false);
  assert.equal(ajustarLock(0, false), 0); // nunca negativo
});

test('confirmación de cambios sin guardar ofrece guardar, descartar y seguir', () => {
  assert.deepEqual([...OPCIONES_CAMBIOS_SIN_GUARDAR], ['guardar', 'descartar', 'seguir']);
});

test('Escape sobre el aviso de cambios sigue editando: nunca descarta', () => {
  assert.equal(DECISION_ESCAPE_AVISO, 'seguir');
  assert.ok(OPCIONES_CAMBIOS_SIN_GUARDAR.includes(DECISION_ESCAPE_AVISO));
});

// Regresión: Gino comprobó en d45758fa que un arrastre vertical desde fuera
// (touchStart y=422, moves de 15/60/120 px) cerraba el sheet apenas empezar.
// El cierre debe esperar al pointerup y exigir un tap sin movimiento.
const sheetAbajo = (p: PuntoToque) => p.y >= 477; // "Por dar" arranca en y=477

test('un tap fuera del sheet (inicio=fin) sí cierra', () => {
  assert.equal(debeCerrarPorToqueFuera({ x: 40, y: 422 }, { x: 40, y: 422 }, false, sheetAbajo), true);
});

test('un arrastre vertical desde fuera no cierra, por pequeño que sea', () => {
  const inicio = { x: 40, y: 422 };
  for (const dy of [15, 60, 120]) {
    assert.equal(debeCerrarPorToqueFuera(inicio, { x: 40, y: 422 + dy }, false, sheetAbajo), false,
      `arrastre de ${dy}px no debe cerrar`);
  }
});

test('pointercancel (el sistema tomó el gesto) no cierra', () => {
  const inicio = { x: 40, y: 422 };
  assert.equal(debeCerrarPorToqueFuera(inicio, inicio, true, sheetAbajo), false);
});

test('si el dedo termina dentro del sheet, no cierra', () => {
  const inicio = { x: 40, y: 422 };
  assert.equal(debeCerrarPorToqueFuera(inicio, { x: 40, y: 500 }, false, sheetAbajo), false);
});

test('sin inicio o sin fin (puntero inválido) no cierra', () => {
  const fin = { x: 40, y: 422 };
  assert.equal(debeCerrarPorToqueFuera(null, fin, false, sheetAbajo), false);
  assert.equal(debeCerrarPorToqueFuera(fin, null, false, sheetAbajo), false);
});

test('el umbral de movimiento es bajo: un temblor de 1px sigue siendo tap', () => {
  assert.equal(debeCerrarPorToqueFuera({ x: 40, y: 422 }, { x: 41, y: 423 }, false, sheetAbajo), true);
  assert.ok(UMBRAL_MOVIMIENTO_TOQUE <= 10);
});
