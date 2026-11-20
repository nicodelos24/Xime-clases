/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { debeOcultarBarra, UMBRAL_SCROLL, TOPE_SCROLL } from '../src/barra-scroll.ts';

test('bajar oculta la barra', () => {
  assert.equal(debeOcultarBarra(40, 0, false), true);
  assert.equal(debeOcultarBarra(120, 80, false), true);
});

test('subir reaparece la barra', () => {
  assert.equal(debeOcultarBarra(80, 120, true), false);
  assert.equal(debeOcultarBarra(20, 60, true), false);
});

test('al llegar arriba la barra queda visible aunque el último movimiento bajara', () => {
  assert.equal(debeOcultarBarra(0, 30, true), false);
  assert.equal(debeOcultarBarra(TOPE_SCROLL, 30, true), false);
  // Justo fuera de la zona del tope, bajando, sí se oculta.
  assert.equal(debeOcultarBarra(TOPE_SCROLL + 2, 0, false), true);
});

test('micro-movimientos por debajo del umbral no cambian el estado (sin parpadeo)', () => {
  const pequeno = UMBRAL_SCROLL - 1;
  // visible se mantiene visible con scroll mínimo hacia abajo
  assert.equal(debeOcultarBarra(pequeno, 0, false), false);
  // oculta se mantiene oculta con scroll mínimo hacia arriba
  assert.equal(debeOcultarBarra(100 - pequeno, 100, true), true);
  // justo en el umbral sí cambia
  assert.equal(debeOcultarBarra(UMBRAL_SCROLL, 0, false), true);
});

test('rebote negativo (overscroll) se trata como arriba del todo', () => {
  assert.equal(debeOcultarBarra(-12, 40, true), false);
});

test('estado estable: seguir bajando estando oculta y seguir subiendo estando visible', () => {
  assert.equal(debeOcultarBarra(200, 150, true), true);
  assert.equal(debeOcultarBarra(40, 80, false), false);
});
