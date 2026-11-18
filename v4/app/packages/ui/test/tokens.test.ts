/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AURORA, MARCA, MARCA_OSCURO, hacerTema } from '../src/tokens.ts';

const base = resolve(import.meta.dirname, '..', '..', '..');
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

// AA de la etiqueta activa de la barra inferior (18/11): pinta sobre
// color.superficie, que en oscuro es #17292B. El acento #0E7C7B da 3.02:1;
// en oscuro corresponde el acento fuerte del tema. El layout de las pestañas
// toma la tinta de aquí: `oscuro ? color.acentoFuerte : color.acento`.
const lum = (hex: string): number => {
  const [r, g, b] = hex.slice(1).match(/.{2}/g)!.map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test('barra inferior · etiqueta activa: AA ≥ 4.5 en ambos temas', () => {
  const claro = hacerTema(false, false);
  const oscuro = hacerTema(true, false);
  const activaClaro = claro.oscuro ? claro.color.acentoFuerte : claro.color.acento;
  const activaOscuro = oscuro.oscuro ? oscuro.color.acentoFuerte : oscuro.color.acento;
  assert.equal(activaClaro, MARCA.acento);
  assert.equal(activaOscuro, MARCA_OSCURO.acentoFuerte);
  assert.ok(contraste(activaOscuro, MARCA_OSCURO.superficie) >= 4.5,
    `AA etiqueta activa oscuro: ${contraste(activaOscuro, MARCA_OSCURO.superficie).toFixed(2)}`);
  assert.ok(contraste(activaClaro, MARCA.superficie) >= 4.5,
    `AA etiqueta activa claro: ${contraste(activaClaro, MARCA.superficie).toFixed(2)}`);
  // Guardia: el acento fijo no vuelve a usarse en oscuro (3.02:1).
  assert.ok(contraste(MARCA.acento, MARCA_OSCURO.superficie) < 4.5,
    'el acento claro sobre superficie oscura no debe usarse');
});

test('barra inferior · el layout usa acentoFuerte en oscuro, no un valor fijo', () => {
  const layout = readFileSync(
    resolve(base, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8');
  assert.match(layout, /tintaActiva = oscuro \? color\.acentoFuerte : color\.acento/);
  assert.match(layout, /tabBarActiveTintColor:\s*tintaActiva/);
  assert.doesNotMatch(layout, /tabBarActiveTintColor:\s*['"]#|tabBarActiveTintColor:\s*color\.acento\b/);
});
