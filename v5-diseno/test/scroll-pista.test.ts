/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { pistaDeTira } from '../src/scroll-pista.ts';

// Medidas reales del hallazgo de QA (23-nov, 320 px): 9 chips, 792 px de
// contenido sobre 268 px visibles.
const FILTROS_320 = { scrollWidth: 792, clientWidth: 268 };

test('pista: al principio de la tira solo se insinúa el borde derecho', () => {
  assert.deepEqual(pistaDeTira({ ...FILTROS_320, scrollLeft: 0 }), { inicio: false, fin: true });
});

test('pista: en el medio de la tira se insinúan los dos bordes', () => {
  assert.deepEqual(pistaDeTira({ ...FILTROS_320, scrollLeft: 260 }), { inicio: true, fin: true });
});

test('pista: al final de la tira solo se insinúa el borde izquierdo', () => {
  const recorrido = FILTROS_320.scrollWidth - FILTROS_320.clientWidth; // 524
  assert.deepEqual(pistaDeTira({ ...FILTROS_320, scrollLeft: recorrido }), { inicio: true, fin: false });
});

test('pista: si todo el contenido entra no hay pista', () => {
  assert.deepEqual(pistaDeTira({ scrollLeft: 0, scrollWidth: 268, clientWidth: 268 }), {
    inicio: false,
    fin: false,
  });
});

test('pista: la tolerancia absorbe sub-píxeles y el rebote elástico', () => {
  const recorrido = 524;
  // 0.5 px de sub-píxel al principio: sigue sin pista izquierda.
  assert.equal(pistaDeTira({ ...FILTROS_320, scrollLeft: 0.5 }).inicio, false);
  // Casi al final pero 0.5 px antes: no insinúa un final que no llegó.
  assert.equal(pistaDeTira({ ...FILTROS_320, scrollLeft: recorrido - 0.5 }).fin, false);
  // Rebote elástico de iOS: valores fuera de rango se recortan, no rompen la pista.
  assert.deepEqual(pistaDeTira({ ...FILTROS_320, scrollLeft: -14 }), { inicio: false, fin: true });
  assert.deepEqual(pistaDeTira({ ...FILTROS_320, scrollLeft: recorrido + 14 }), { inicio: true, fin: false });
});
