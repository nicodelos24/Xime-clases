/// <reference types="node" />
/**
 * Regresión 26-nov: en «Registrar pago» el texto gris no debe repetir lo obvio
 * (la cabecera y el campo ya dicen «Falta cargar la tarifa» / «Tarifa en UYU»).
 * Queda solo lo que aporta: que se guarda en la ficha para las próximas clases.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

const ui = await readFile(new URL('../propuesta.ts', import.meta.url), 'utf8');

test('texto de «Registrar pago» sin tarifa: breve, sin frases redundantes', () => {
  const linea = ui.split('\n').find((l) => l.includes("faltaTarifa ? '") && l.includes('cobros-panel-nota'));
  assert.ok(linea, 'se encontró la nota del diálogo de registrar pago');
  assert.match(linea, /Se guarda en la ficha para las próximas clases\./);
  for (const obvio of ['Ingresá el importe', 'No se usa ningún precio de ejemplo', 'Falta cargar la tarifa de esta clase']) {
    assert.doesNotMatch(linea, new RegExp(obvio), `sin texto obvio: ${obvio}`);
  }
});
