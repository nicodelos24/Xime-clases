/// <reference types="node" />
/**
 * Contacto de la ficha: el teléfono se ve y el botón abre wa.me con ESE número.
 * Regresión del rediseño de B: el número ya estaba cargado y la ficha decía
 * «sin teléfono» y mandaba un link genérico de WhatsApp.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  bloqueContacto, numeroWaMe, saludoContacto, telefonoVisible,
} from '../src/contacto.ts';
import { PREFIJO_POR_DEFECTO } from '../src/prefijo.ts';

test('contacto: el número cargado se ve en la ficha, con el prefijo del país', () => {
  assert.equal(telefonoVisible('099 123 456'), '+598 099 123 456');
  assert.equal(telefonoVisible('598 99 123 456'), '598 99 123 456', 'si ya trae prefijo se respeta');
  assert.equal(telefonoVisible(''), '', 'sin número no se inventa');
});

test('contacto: el deep link usa wa.me con el número real, no un link genérico', () => {
  assert.equal(numeroWaMe('099 123 456'), '598099123456');
  assert.equal(numeroWaMe('+598 99 123 456'), '59899123456');
  assert.equal(numeroWaMe('   '), '');
  const link = bloqueContacto('Nora Pérez', '099 123 456').link!;
  assert.ok(link.startsWith('https://wa.me/598099123456?text='), link);
  assert.ok(decodeURIComponent(link).includes('Hola Nora,'), 'saluda por el primer nombre');
  assert.ok(!link.includes('wa.me/?text='), 'nunca el link genérico');
});

test('contacto: el prefijo es configurable y no se duplica', () => {
  assert.equal(numeroWaMe('9 11 2345 6789', '+54'), '5491123456789');
  assert.equal(numeroWaMe('099 123 456', '+54'), '54099123456');
  assert.equal(PREFIJO_POR_DEFECTO, '+598');
});

test('contacto: sin teléfono no hay link y se explica qué falta', () => {
  const sin = bloqueContacto('Carla T.', '');
  assert.equal(sin.visible, null);
  assert.equal(sin.link, null);
  assert.match(sin.ayuda!, /número/);
  assert.doesNotMatch(sin.ayuda!, /sin teléfono cargado/i);
});

test('contacto: con teléfono NO se dice «sin teléfono» (incoherencia que marcó Nico)', () => {
  const con = bloqueContacto('Carla T.', '099 987 654');
  assert.equal(con.visible, '+598 099 987 654');
  assert.equal(con.ayuda, null);
  assert.ok(con.link);
});

test('contacto: saludo sin nombre utilizable', () => {
  assert.equal(saludoContacto('  '), 'Hola, te escribo de las clases.');
  assert.equal(saludoContacto('Ana'), 'Hola Ana, te escribo de las clases.');
});
