/// <reference types="node" />
/**
 * Regresión 26-nov: la ficha del alumno no debe llenarse de ayudas obvias.
 * Las ayudas que quedan son SVG sutil, no el «?» plano de 32 px.
 * El HTML se lee del fuente (módulo de UI con efectos en DOM): cada ayuda se
 * comprueba en su contexto para no quitar la que explica algo no evidente.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

const fuente = await readFile(new URL('../propuesta.ts', import.meta.url), 'utf8');
const entre = (desde: string, hasta: string) => {
  const i = fuente.indexOf(desde);
  const j = fuente.indexOf(hasta, i);
  assert.ok(i >= 0 && j > i, 'se encontró el bloque de la ficha');
  return fuente.slice(i, j);
};
const ficha = entre('function abrirFicha(', 'function abrirDialogoCobros(');
const resumen = entre('function abrirFichaConCobro(', 'function abrirFicha(');

test('Editar ficha: solo se conserva la ayuda de identidad/fecha de alta', () => {
  assert.equal((ficha.match(/burbujaAyuda\(/g) ?? []).length, 0, 'ninguna burbuja dentro del formulario');
  assert.match(ficha, /La identidad y la fecha de alta no se cambian/, 'se ve sin abrir nada');
  for (const obvio of ['Se guarda en la ficha', 'No se usa ningún precio de ejemplo', 'Solo una etiqueta para agrupar', 'El cálculo de descuento']) {
    assert.doesNotMatch(ficha, new RegExp(obvio), `sin ayuda obvia: ${obvio}`);
  }
});

test('Resumen de cobro: una sola ayuda, sólo si hay deuda o pago', () => {
  assert.equal((resumen.match(/burbujaAyuda\(/g) ?? []).length, 1, 'solo la ayuda del resumen; sin burbujas junto a los botones');
  assert.match(resumen, /deuda \|\| individualPendiente \? burbujaAyuda/, 'no se muestra para un alumno sin cobros');
  assert.match(resumen, /class="ficha-accion-ayuda">Los links abren WhatsApp/, 'la confirmación de envío queda visible');
  assert.doesNotMatch(resumen, /ficha-accion-ayuda">\$\{burbujaAyuda/, 'no hay burbuja suelta bajo los botones');
});

test('Las ayudas restantes usan SVG y no el carácter «?» plano', () => {
  const fn = entre('function burbujaAyuda(', '/** Cablea todas');
  assert.match(fn, /<svg class="ico ayuda-ico"[^>]*><use href="#i-ayuda"\/><\/svg>/);
  assert.doesNotMatch(fn, />\?<\/button>/);
});
