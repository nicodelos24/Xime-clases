/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { AURORA, MARCA, hacerTema } from '../src/tokens.ts';
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
const valores: Record<string, string> = {
  bg: AURORA.bg, surface: AURORA.surface, line: AURORA.line, text: AURORA.text, muted: AURORA.muted,
  'mensual-solid': AURORA.mensual.solid, 'mensual-tint': AURORA.mensual.tint, 'mensual-ink': AURORA.mensual.ink,
  'indiv-solid': AURORA.individual.solid, 'indiv-tint': AURORA.individual.tint, 'indiv-ink': AURORA.individual.ink,
  'aldia-solid': AURORA.aldia.solid, 'aldia-tint': AURORA.aldia.tint, 'aldia-ink': AURORA.aldia.ink,
  'pronto-solid': AURORA.pronto.solid, 'pronto-tint': AURORA.pronto.tint, 'pronto-ink': AURORA.pronto.ink,
  'pronto-strong': AURORA.pronto.strong,
  'debe-solid': AURORA.debe.solid, 'debe-tint': AURORA.debe.tint, 'debe-ink': AURORA.debe.ink,
  'vencida-solid': AURORA.vencida.solid, 'vencida-tint': AURORA.vencida.tint, 'vencida-ink': AURORA.vencida.ink,
  ...Object.fromEntries(Object.entries(AURORA.secciones).map(([k,v]) => [`sec-${k === 'mas' ? 'mas' : k}`,v])),
};
test('Aurora RN coincide con tokens.css de diseño (incluido ámbar AA)', () => {
  for (const [nombre, esperado] of Object.entries(valores)) {
    const real = css.match(new RegExp(`--${nombre}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
    assert.equal(real?.toUpperCase(), esperado.toUpperCase(), nombre);
  }
  assert.equal(AURORA.secciones.hoy, '#0B6B6A');
  assert.equal(MARCA.acento, '#0E7C7B');
  assert.equal(AURORA.mensual.solid, '#5E4285');
  assert.equal(AURORA.individual.solid, '#34607F');
  assert.equal(MARCA.fondo, AURORA.bg);
});
test('claro/oscuro y movimiento reducido no comparten estados mutables', () => {
  const claro = hacerTema(false, false), oscuro = hacerTema(true, true);
  assert.equal(claro.oscuro, false);
  assert.equal(oscuro.oscuro, true);
  assert.notEqual(claro.color.fondo, oscuro.color.fondo);
  assert.equal(oscuro.reducirMovimiento, true);
});
