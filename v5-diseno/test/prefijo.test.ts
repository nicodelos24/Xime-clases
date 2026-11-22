import assert from 'node:assert/strict';
import test from 'node:test';
import { PREFIJO_POR_DEFECTO, conPrefijo, prefijoEsValido, prefijoSeguro } from '../src/prefijo.ts';

test('prefijo: formato + y hasta 4 dígitos', () => {
  assert.equal(prefijoEsValido('+598'), true);
  assert.equal(prefijoEsValido('+1'), true);
  assert.equal(prefijoEsValido('+54'), true);
  assert.equal(prefijoEsValido('598'), false, 'sin + no sirve para wa.me');
  assert.equal(prefijoEsValido('+59899'), false);
  assert.equal(prefijoEsValido('+'), false);
  assert.equal(prefijoEsValido('abc'), false);
});

test('prefijo: valor guardado inválido cae al default de Uruguay', () => {
  assert.equal(prefijoSeguro(null), PREFIJO_POR_DEFECTO);
  assert.equal(prefijoSeguro(''), PREFIJO_POR_DEFECTO);
  assert.equal(prefijoSeguro('598'), PREFIJO_POR_DEFECTO);
  assert.equal(prefijoSeguro(' +54 '), '+54');
});

test('prefijo: completa números que no lo traen y no duplica el que ya viene', () => {
  assert.equal(conPrefijo('99 123 456'), '+598 99 123 456');
  assert.equal(conPrefijo('099123456'), '+598 099123456');
  assert.equal(conPrefijo('+598 99 123 456'), '+598 99 123 456');
  assert.equal(conPrefijo('598 99 123 456'), '+598 99 123 456', 'ya trae el prefijo: se respeta y se normaliza el +');
  assert.equal(conPrefijo('9 11 2345 6789', '+54'), '+54 9 11 2345 6789');
  assert.equal(conPrefijo('   '), '');
});
