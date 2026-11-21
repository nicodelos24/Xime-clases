/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  MARGEN_SHEET, alturaMaximaSheet, estiloSheet, ajustarLock, debeBloquearScroll,
  OPCIONES_CAMBIOS_SIN_GUARDAR,
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
