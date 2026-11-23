/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { destinoDeEnlace, esEnlaceVerMes, vistaInicial, vistasActivas } from '../src/navegacion.ts';

const VISTAS = ['v-hoy', 'v-semana', 'v-mes', 'v-alumnos', 'v-cobros'];

test('navegación: abrir directo en #v-mes deja esa vista como única activa', () => {
  const destino = vistaInicial('#v-mes', VISTAS);
  assert.equal(destino, 'v-mes');
  assert.deepEqual(vistasActivas(VISTAS, destino), ['v-mes']);
});

test('navegación: ninguna combinación de hash deja dos vistas activas', () => {
  for (const hash of ['', '#', '#v-hoy', '#v-semana', '#v-mes', '#v-alumnos', '#v-cobros', '#v-inexistente', '#v-mes-']) {
    const activas = vistasActivas(VISTAS, vistaInicial(hash, VISTAS));
    assert.equal(activas.length, 1, `hash ${JSON.stringify(hash)} dejó ${activas.length} vistas activas`);
    assert.ok(VISTAS.includes(activas[0]));
  }
});

test('navegación: hash vacío o desconocido cae a la primera vista (Hoy)', () => {
  assert.equal(vistaInicial('', VISTAS), null);
  assert.equal(vistaInicial('#', VISTAS), null);
  assert.equal(vistaInicial('#no-existe', VISTAS), null);
  // Un hash que existe pero no es vista (ancla interna) tampoco cambia de pantalla.
  assert.equal(vistaInicial('#i-mensual', VISTAS), null);
  assert.deepEqual(vistasActivas(VISTAS, null), ['v-hoy']);
});

test('navegación: la vista pedida gana la clase y las demás la pierden', () => {
  for (const id of VISTAS) {
    const activas = vistasActivas(VISTAS, id);
    assert.deepEqual(activas, [id], `${id} debe ser la única activa`);
  }
});

test('navegación: sin vistas declaradas no se inventa ninguna', () => {
  assert.deepEqual(vistasActivas([], 'v-mes'), []);
});

test('navegación: se conserva la política previa de «Ver mes» sin hash propio', () => {
  assert.equal(destinoDeEnlace('#v-mes'), 'v-mes');
  assert.equal(destinoDeEnlace(null), null, 'un enlace convertido en botón no tiene destino');
  assert.equal(esEnlaceVerMes('#v-mes'), true);
  assert.equal(esEnlaceVerMes('#v-semana'), false);
});
