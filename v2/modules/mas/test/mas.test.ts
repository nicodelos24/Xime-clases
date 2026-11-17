/// <reference types="node" />
/**
 * Tests de la lógica de Más (W11): lista de precios desde el dominio,
 * formato UYU, opciones de aviso N y filas de la pantalla.
 * Solo lógica pura (ajustesMas.ts) — sin React ni Expo.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  LISTA_PRECIOS_DEMO,
  precioVigente,
  formatoUYU,
  OPCIONES_AVISO,
  ETIQUETA_AVISO,
  esOpcionValida,
  filasMas,
  CONCEPTOS_MAS,
  DUENIAS,
} from '../screens/ajustesMas.ts';

test('Más · precios de demo: mensualidad 1800 y clase suelta 700 vigentes', () => {
  assert.equal(precioVigente('mensualidad', '2026-11-15'), 1800);
  assert.equal(precioVigente('claseSuelta', '2026-11-15'), 700);
});

test('Más · la lista de demo pasa validarListaPrecios (contrato del dominio)', () => {
  // precioVigente valida la lista entera antes de devolver el precio.
  assert.doesNotThrow(() => precioVigente('claseSuelta', '2026-11-15', LISTA_PRECIOS_DEMO));
});

test('Más · sin precio vigente anterior a la demo, error explícito del dominio', () => {
  assert.throws(() => precioVigente('mensualidad', '2025-06-30'), /no tenía precio vigente/);
});

test('Más · formatoUYU: enteros con separador, inválidos en «—»', () => {
  assert.equal(formatoUYU(1800), '$ 1.800');
  assert.equal(formatoUYU(700), '$ 700');
  assert.equal(formatoUYU(0), '$ 0');
  assert.equal(formatoUYU(18.5), '—');
  assert.equal(formatoUYU(-3), '—');
});

test('Más · opciones de aviso: 7/10/vence hoy, 7 por defecto y válido', () => {
  assert.deepEqual([...OPCIONES_AVISO], [7, 10, 0]);
  assert.equal(ETIQUETA_AVISO[7], '7 días');
  assert.equal(ETIQUETA_AVISO[10], '10 días');
  assert.equal(ETIQUETA_AVISO[0], 'Vence hoy');
  assert.equal(esOpcionValida(7), true);
  assert.equal(esOpcionValida(3), false);
});

test('Más · dos conceptos con etiqueta, en orden del wireframe', () => {
  assert.deepEqual(
    CONCEPTOS_MAS.map((c) => c.etiqueta),
    ['Mensualidad', 'Clase por clase'],
  );
});

test('Más · dos dueñas del piloto, mismo rol de dueño', () => {
  assert.equal(DUENIAS.length, 2);
  assert.deepEqual(DUENIAS.map((d) => d.nombre), ['Xime', 'Dueño 2']);
});

test('Más · filas: precios visibles con valor, resto con detalle de I2', () => {
  const filas = filasMas(7, '2026-11-15');
  const precioMensualidad = filas.find((f) => f.id === 'precio-mensualidad');
  assert.ok(precioMensualidad);
  assert.equal(precioMensualidad.valor, '$ 1.800');
  assert.equal(precioMensualidad.disponible, false);
  assert.match(precioMensualidad.detalle ?? '', /I2/);

  const aviso = filas.find((f) => f.id === 'aviso');
  assert.ok(aviso);
  assert.equal(aviso.valor, '7 días'); // usa el N dado
  assert.equal(aviso.disponible, true);

  const aviso10 = filasMas(10, '2026-11-15').find((f) => f.id === 'aviso');
  assert.equal(aviso10?.valor, '10 días');

  // Sin selector de grupos ni tutores (fuera del MVP, no se nombra como fila)
  assert.equal(filas.some((f) => /grupo/i.test(f.etiqueta)), false);
  assert.equal(filas.some((f) => /tutor/i.test(f.etiqueta)), false);

  // Las filas límite siempre dicen cuándo llega
  for (const f of filas) {
    if (!f.disponible) assert.ok(f.detalle && f.detalle.length > 0, `fila ${f.id} sin detalle`);
  }
});
