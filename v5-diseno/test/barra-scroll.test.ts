/// <reference types="node" />
import { test, mock } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  debeOcultarBarra, actualizarBarra, estadoBarraInicial, recortarScroll,
  debeReaparecerPorQuietud,
  UMBRAL_SCROLL, TOPE_SCROLL, MUESTRAS_PARA_MOSTRAR, REAPARECER_TRAS_MS,
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

test('bajar rápido con ruido no hace reaparecer la barra', () => {
  let estado = estadoBarraInicial();
  // Fling hacia abajo: grandes saltos positivos con micro-retrocesos (< umbral).
  for (const y of [50, 95, 91, 131, 127, 167, 163, 210]) {
    estado = actualizarBarra(estado, y, 1000);
  }
  assert.equal(estado.oculta, true, 'la barra sigue oculta mientras se baja');
});

test('barra oculta vuelve sola tras el tiempo de quietud', () => {
  let estado = estadoBarraInicial();
  estado = actualizarBarra(estado, 200); // bajar → oculta
  assert.equal(estado.oculta, true);
  // Antes del tiempo no reaparece; justo en el umbral, sí.
  assert.equal(debeReaparecerPorQuietud(estado, REAPARECER_TRAS_MS - 1), false);
  assert.equal(debeReaparecerPorQuietud(estado, REAPARECER_TRAS_MS), true);
  assert.equal(debeReaparecerPorQuietud(estado, REAPARECER_TRAS_MS + 500), true);
});

test('barra visible nunca "reaparece" por quietud', () => {
  const visible = estadoBarraInicial();
  assert.equal(visible.oculta, false);
  assert.equal(debeReaparecerPorQuietud(visible, REAPARECER_TRAS_MS * 10), false);
});

test('tras reaparecer por quietud, volver a bajar la oculta de nuevo (ciclo intacto)', () => {
  let estado = estadoBarraInicial();
  estado = actualizarBarra(estado, 200);
  assert.equal(debeReaparecerPorQuietud(estado, REAPARECER_TRAS_MS), true);
  // La UI quita .oculta y recalibra; la referencia vuelve a la posición actual.
  estado = { ...estado, oculta: false, ultimoY: 200, muestrasSubida: 0 };
  estado = actualizarBarra(estado, 320); // sigue bajando
  assert.equal(estado.oculta, true, 'al bajar de nuevo se oculta como siempre');
});

// Regression del temporizador de la UI: al moverse el scroll se rearma, así
// que un gesto largo que termina con la barra oculta no la devuelve a mitad.
test('el reloj de quietud se rearma con cada movimiento y no dispara antes', (t) => {
  const timers = mock.timers;
  timers.enable({ apis: ['setTimeout'] });
  let disparos = 0;
  let estado = estadoBarraInicial();
  let temporizador: ReturnType<typeof setTimeout> | null = null;

  const muestrear = (andar: number) => {
    estado = actualizarBarra(estado, andar);
    // La UI cancela el temporizador anterior y arma uno nuevo en cada muestra.
    if (temporizador !== null) clearTimeout(temporizador);
    temporizador = null;
    if (!estado.oculta) return;
    temporizador = setTimeout(() => {
      temporizador = null;
      if (debeReaparecerPorQuietud(estado, REAPARECER_TRAS_MS)) disparos++;
    }, REAPARECER_TRAS_MS);
  };

  muestrear(200); // oculta, arranca el reloj
  timers.tick(REAPARECER_TRAS_MS - 1);
  assert.equal(disparos, 0, 'no reaparece antes del tiempo de quietud');
  muestrear(220); // sigue bajando: reinicia el reloj
  timers.tick(REAPARECER_TRAS_MS - 1);
  assert.equal(disparos, 0, 'el movimiento reinició la cuenta');
  timers.tick(1);
  assert.equal(disparos, 1, 'vuelve sola al cumplirse el tiempo quieto');
});
