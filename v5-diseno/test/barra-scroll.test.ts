/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  debeOcultarBarra, actualizarBarra, estadoBarraInicial, recortarScroll,
  UMBRAL_SCROLL, TOPE_SCROLL, MUESTRAS_PARA_MOSTRAR,
} from '../src/barra-scroll.ts';

test('bajar oculta la barra', () => {
  assert.equal(debeOcultarBarra(40, 0, false), true);
  assert.equal(debeOcultarBarra(120, 80, false), true);
});

test('subir reaparece la barra', () => {
  assert.equal(debeOcultarBarra(80, 120, true), false);
  assert.equal(debeOcultarBarra(20, 60, true), false);
});

test('al llegar arriba la barra queda visible aunque el último movimiento bajara', () => {
  assert.equal(debeOcultarBarra(0, 30, true), false);
  assert.equal(debeOcultarBarra(TOPE_SCROLL, 30, true), false);
  // Justo fuera de la zona del tope, bajando, sí se oculta.
  assert.equal(debeOcultarBarra(TOPE_SCROLL + 2, 0, false), true);
});

test('micro-movimientos por debajo del umbral no cambian el estado (sin parpadeo)', () => {
  const pequeno = UMBRAL_SCROLL - 1;
  // visible se mantiene visible con scroll mínimo hacia abajo
  assert.equal(debeOcultarBarra(pequeno, 0, false), false);
  // oculta se mantiene oculta con scroll mínimo hacia arriba
  assert.equal(debeOcultarBarra(100 - pequeno, 100, true), true);
  // justo en el umbral sí cambia
  assert.equal(debeOcultarBarra(UMBRAL_SCROLL, 0, false), true);
});

test('rebote negativo (overscroll) se trata como arriba del todo', () => {
  assert.equal(debeOcultarBarra(-12, 40, true), false);
});

test('estado estable: seguir bajando estando oculta y seguir subiendo estando visible', () => {
  assert.equal(debeOcultarBarra(200, 150, true), true);
  assert.equal(debeOcultarBarra(40, 80, false), false);
});

test('sin rebote: micro-movimientos hacia arriba no reaparecen la barra al seguir bajando', () => {
  // Una bajada sostenida con ruido: la barra, una vez oculta, NO reaparece
  // hasta una subida sostenida (varias muestras por encima del umbral).
  let estado = estadoBarraInicial();
  const reco = [0, 20, 39, 42, 45, 58, 80, 83, 86, 100];
  for (const y of reco) estado = actualizarBarra(estado, y);
  assert.equal(estado.oculta, true, 'debe quedar oculta tras bajar con ruido');
  estado = actualizarBarra(estado, 97); // -3 px: zona muerta
  assert.equal(estado.oculta, true);
  estado = actualizarBarra(estado, 90); // -7 px: primera muestra de subida
  assert.equal(estado.oculta, true, 'una sola muestra de subida no la reaparece');
  estado = actualizarBarra(estado, 80); // -10 px: segunda muestra
  assert.equal(estado.oculta, false, 'la subida sostenida la reaparece');
});

test('el rebote elástico del final de la página se recorta y no reaparece la barra', () => {
  const limite = 1000;
  assert.equal(recortarScroll(-30, limite), 0);
  assert.equal(recortarScroll(1050, limite), 1000);
  let estado = estadoBarraInicial();
  for (const y of [0, 300, 700, 1000]) estado = actualizarBarra(estado, y, limite);
  assert.equal(estado.oculta, true);
  // Overscroll en el tope inferior: window.scrollY se pasa de 1000 y vuelve.
  // Al recortar, las muestras son 1000 → 1000: no se interpreta como subida.
  estado = actualizarBarra(estado, 1060, limite);
  estado = actualizarBarra(estado, 1010, limite);
  estado = actualizarBarra(estado, 1000, limite);
  assert.equal(estado.oculta, true, 'el overscroll no debe revelar la barra');
  // En cambio una subida real sí la revela.
  for (let i = 0; i < MUESTRAS_PARA_MOSTRAR + 1; i++) {
    estado = actualizarBarra(estado, 1000 - (i + 1) * 20, limite);
  }
  assert.equal(estado.oculta, false);
});
