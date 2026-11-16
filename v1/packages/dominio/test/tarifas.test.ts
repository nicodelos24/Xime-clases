import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { precio, validarListaPrecios } from '../src/tarifas.ts';

const lista = {
  mensualidad: [
    { desde: '2026-01-01', precio: 2000 },
    { desde: '2026-03-01', precio: 2500 },
  ],
  claseSuelta: [{ desde: '2026-01-01', precio: 400 }],
};

test('precio de lista vigente en cada fecha', () => {
  assert.equal(precio(null, 'mensualidad', '2026-02-28', lista), 2000);
  assert.equal(precio(null, 'mensualidad', '2026-03-01', lista), 2500);
  assert.equal(precio(null, 'claseSuelta', '2026-05-11', lista), 400);
});

test('cambiar el precio no altera pagos pasados', () => {
  // La misma lista sirve para consultar cualquier fecha histórica:
  assert.equal(precio(null, 'mensualidad', '2026-01-15', lista), 2000);
  assert.equal(precio(null, 'mensualidad', '2026-12-31', lista), 2500);
});

test('sin precio configurado o sin vigencia para la fecha: error explícito', () => {
  assert.throws(() => precio(null, 'pack', '2026-05-01', lista), /Sin precio configurado/);
  assert.throws(
    () => precio(null, 'mensualidad', '2025-12-31', lista),
    /no tenía precio vigente/,
  );
});

test('el dinero es un entero de UYU: se rechaza lo demás', () => {
  assert.throws(
    () => precio(null, 'mensualidad', '2026-05-01', { mensualidad: [{ desde: '2026-01-01', precio: 2500.5 }] }),
    /entero/,
  );
  assert.throws(
    () => precio(null, 'mensualidad', '2026-05-01', { mensualidad: [{ desde: '2026-01-01', precio: -1 }] }),
    /entero/,
  );
  assert.throws(
    () => precio(null, 'mensualidad', '2026-05-01', { mensualidad: [{ desde: '2026-13-01', precio: 100 }] }),
    /Fecha inválida/,
  );
});

test('validarListaPrecios valida todo el conjunto', () => {
  validarListaPrecios(lista); // ok
  assert.throws(() => validarListaPrecios({ mensualidad: [] }), /no tiene precios/);
});
