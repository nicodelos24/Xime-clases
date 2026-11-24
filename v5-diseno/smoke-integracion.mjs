import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '/home/nico/.cache/apx-scratch-yuma/traza-lab/node_modules/playwright/index.mjs';

const SALIDA = process.argv[2] ?? '../docs/qa/integracion-avatar-seguridad-20261124';
const BASE = process.env.XIME_URL ?? 'http://localhost:8879/index.html';
await mkdir(SALIDA, { recursive: true });
const errores = [];
const consola = [];
const navegador = await chromium.launch({ headless: true });
const contexto = await navegador.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'es-UY',
});
const pagina = await contexto.newPage();
const CHIP_VIVO = '#v-semana .clase:not(.cancelada) .chip-boton';
const HABIERTA = 'div.sheet[data-disparador^="clase-acciones"]:not(.cerrando)';
const hojasVivas = () => pagina.locator('.sheet:not(.cerrando)').count();

pagina.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
pagina.on('console', (m) => { if (m.type() === 'error') consola.push(`console: ${m.text()}`); });

async function esperarCeroHojas() {
  await pagina.waitForFunction(() => document.querySelectorAll('.sheet:not(.cerrando)').length === 0);
}
async function comprobarF5(etiqueta) {
  // 0/250/350 ms son relativos al fin de la carga del documento nuevo.
  await pagina.reload({ waitUntil: 'networkidle' });
  const observaciones = [];
  const inicio = Date.now();
  for (const ms of [0, 250, 350]) {
    const restante = ms - (Date.now() - inicio);
    if (restante > 0) await pagina.waitForTimeout(restante);
    observaciones.push({ ms, hojasVivas: await hojasVivas() });
  }
  assert.deepEqual(observaciones.map((o) => o.hojasVivas), [0, 0, 0], `${etiqueta}: 0 hojas vivas a 0/250/350 ms`);
  assert.equal(await pagina.evaluate(() => window.ximeV5.hojaAbierta), false, `${etiqueta}: ximeV5.hojaAbierta=false`);
  return observaciones;
}
async function abrirAcciones(control) {
  await control.click({ force: true });
  await pagina.waitForSelector(HABIERTA, { state: 'attached' });
  assert.equal(await hojasVivas(), 1, 'abre exactamente una hoja viva');
}
async function cerrarAcciones() {
  await pagina.locator(`${HABIERTA} .sheet-cerrar`).click();
  await esperarCeroHojas();
}
async function abrirCancelacion() {
  await abrirAcciones(pagina.locator(CHIP_VIVO).first());
  await pagina.locator(`${HABIERTA} [data-acc="cancelar"]`).click();
  await pagina.waitForSelector('div.sheet[data-cancelacion]:not(.cerrando)', { state: 'attached' });
}
async function descartarCancelacion() {
  await pagina.locator('div.sheet[data-cancelacion]:not(.cerrando) #canc-motivo').fill('Cambio descartado');
  await pagina.locator('div.sheet[data-cancelacion]:not(.cerrando) .sheet-cerrar').click();
  await pagina.waitForSelector('dialog.confirmar-cambios[open]');
  await pagina.locator('dialog.confirmar-cambios [data-decision="descartar"]').click();
  await esperarCeroHojas();
}
try {
  const f5 = { conAcciones: [], trasCerrarAcciones: [], trasDescartar: [], trasCancelar: [], hojasVivas: 0, hojasTrasRecarga: [] };
  await pagina.goto(BASE, { waitUntil: 'networkidle' });
  await pagina.waitForSelector('#lista-alumnos .alumno-fila-btn', { state: 'attached' });
  await pagina.locator('a[href="#v-alumnos"]').click();
  await pagina.waitForSelector('#v-alumnos.activa');
  const alumnos = await pagina.locator('#lista-alumnos .alumno-fila-btn').count();
  assert.ok(alumnos > 0, 'deben existir alumnos demo');
  assert.equal(await pagina.locator('#v-alumnos [id="Programada"], #v-alumnos [id="Dada"]').count(), 0, 'los IDs no se interpolan en atributos');
  await pagina.screenshot({ path: `${SALIDA}/01-alumnos.png`, fullPage: true });

  await pagina.locator('#lista-alumnos .alumno-fila-btn').first().click();
  await pagina.waitForSelector('dialog.sheet[open]');
  assert.ok(await pagina.locator('dialog.sheet [data-ficha-foto]').count(), 'la ficha incluye avatar/foto');
  await pagina.screenshot({ path: `${SALIDA}/02-ficha.png`, fullPage: true });

  await pagina.locator('[data-entrada-foto="galeria"]').setInputFiles({
    name: 'avatar.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9WQAAAAASUVORK5CYII=', 'base64'),
  });
  await pagina.waitForFunction(() => document.querySelector('dialog.sheet [data-ficha-foto] .avatar-foto img'));
  const srcFoto = await pagina.locator('dialog.sheet [data-ficha-foto] img').getAttribute('src');
  assert.match(srcFoto ?? '', /^data:image\/jpeg;base64,/);
  assert.ok((srcFoto ?? '').length < 150_000);
  await pagina.locator('dialog.sheet button[type="submit"]').click();
  await pagina.waitForFunction(() => !document.querySelector('dialog.sheet[open]'));
  assert.ok(await pagina.locator('#lista-alumnos .avatar-foto img').count(), 'la foto aparece en la lista');
  await pagina.reload({ waitUntil: 'networkidle' });
  await pagina.waitForSelector('#lista-alumnos .alumno-fila-btn', { state: 'attached' });
  assert.ok(await pagina.locator('#lista-alumnos .avatar-foto img').count(), 'la foto sobrevive el refresh');
  await pagina.screenshot({ path: `${SALIDA}/03-foto-persistida.png`, fullPage: true });

  await pagina.locator('nav a[href="#v-semana"]').click();
  await pagina.waitForFunction(() => location.hash === '#v-semana');
  await pagina.locator('#v-semana .tira-dia').nth(1).click();
  await pagina.waitForSelector('#v-semana .clase');
  assert.ok(await pagina.locator(CHIP_VIVO).first().isVisible(), 'chip de clase visible');

  // F5 con acciones abiertas y luego el segundo chip.
  await abrirAcciones(pagina.locator(CHIP_VIVO).first());
  assert.ok(await pagina.locator('div.sheet [data-acciones-principales]').count(), 'menú con cierre y acciones');
  await pagina.screenshot({ path: `${SALIDA}/04-menu-clase.png`, fullPage: true });
  const abiertasAntesDeF5 = await pagina.locator('.sheet:not(.cerrando)').evaluateAll((els) => els.map((el) => ({
    disparador: el.dataset.disparador ?? null, cancelacion: el.dataset.cancelacion ?? null,
  })));
  assert.ok(abiertasAntesDeF5[0]?.disparador?.startsWith('clase-acciones-'), 'F5 parte de acciones');
  f5.conAcciones = await comprobarF5('con acciones');
  f5.hojasTrasRecarga = await pagina.locator('.sheet').evaluateAll((els) => els.map((el) => ({
    disparador: el.dataset.disparador ?? null, cancelacion: el.dataset.cancelacion ?? null,
  })));
  await pagina.screenshot({ path: `${SALIDA}/06-f5-sin-hojas.png`, fullPage: true });
  const segundoChip = pagina.locator(CHIP_VIVO).nth(1);
  const idSegundo = await segundoChip.getAttribute('data-acciones');
  await abrirAcciones(segundoChip);
  assert.equal(await pagina.locator(HABIERTA).getAttribute('data-disparador'), `clase-acciones-${idSegundo}`);
  await cerrarAcciones();

  // F5 tras cierre limpio y reapertura de ese mismo segundo chip.
  f5.trasCerrarAcciones = await comprobarF5('tras cerrar acciones');
  assert.equal(await pagina.locator('#v-semana .clase.cancelada').count(), 0);
  await abrirAcciones(pagina.locator(`#v-semana [data-acciones="${idSegundo}"]`));
  await cerrarAcciones();

  // Hashchange con acciones: cierre inmediato.
  await abrirAcciones(pagina.locator(CHIP_VIVO).first());
  await pagina.evaluate(() => { location.hash = 'v-alumnos'; });
  await pagina.waitForFunction(() => location.hash === '#v-alumnos');
  assert.equal(await hojasVivas(), 0, 'navegar no deja hojas vivas');
  await pagina.evaluate(() => { location.hash = 'v-semana'; });
  await pagina.waitForFunction(() => location.hash === '#v-semana');

  // Descartar cambios de cancelación y recargar: no cancela ni revive el flujo.
  await abrirCancelacion();
  await descartarCancelacion();
  assert.equal(await pagina.evaluate(() => window.ximeV5.hojaAbierta), false);
  f5.trasDescartar = await comprobarF5('tras descartar');
  assert.equal(await pagina.locator('#v-semana .clase.cancelada').count(), 0, 'descartar no canceló');
  await abrirAcciones(pagina.locator(CHIP_VIVO).first());
  await cerrarAcciones();

  // Confirmar cancelación y recargar: motivo persistido y ninguna hoja viva.
  await abrirCancelacion();
  await pagina.locator('div.sheet[data-cancelacion]:not(.cerrando) #canc-motivo').fill('Smoke headless de integración');
  await pagina.locator('div.sheet[data-cancelacion]:not(.cerrando) [data-accion="confirmar"]').click();
  await pagina.waitForSelector('#v-semana .clase.cancelada');
  assert.equal(await hojasVivas(), 0, 'cancelación confirmada sin hojas vivas');
  f5.trasCancelar = await comprobarF5('tras cancelar');
  assert.match(await pagina.locator('#v-semana .clase.cancelada').first().innerText(), /Smoke headless de integración/);
  await pagina.screenshot({ path: `${SALIDA}/07-cancelacion-persistida.png`, fullPage: true });

  // Reapertura normal y toque corto en zona vacía.
  const chipNormal = pagina.locator(CHIP_VIVO).first();
  await abrirAcciones(chipNormal);
  await cerrarAcciones();
  const tarjeta = chipNormal.locator('xpath=ancestor::article[contains(@class,"clase")]');
  const caja = await tarjeta.boundingBox();
  assert.ok(caja, 'tarjeta visible');
  await pagina.touchscreen.tap(caja.x + caja.width * 0.55, caja.y + 32);
  await pagina.waitForTimeout(100);
  const estadoTrasTap = await chipNormal.innerText();
  assert.match(estadoTrasTap, /Dada|Por dar/);
  assert.equal(await hojasVivas(), 0, 'el tap en zona vacía no abre menú');
  await pagina.screenshot({ path: `${SALIDA}/05-toque-clase.png`, fullPage: true });

  assert.deepEqual(errores, [], 'sin errores de JavaScript');
  assert.deepEqual(consola, [], 'sin errores de consola');
  const resultado = {
    ok: true, base: BASE, alumnos, estadoTrasTap, srcFotoBytes: (srcFoto ?? '').length,
    cancelacionPersistida: true, descarteCancelacionPersistido: true, segundoChipTrasF5: true, f5,
    pageErrors: errores, consoleErrors: consola,
  };
  await writeFile(`${SALIDA}/resultado.json`, JSON.stringify(resultado, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, alumnos, estadoTrasTap, cancelacionPersistida: true, f5 }, null, 2));
} catch (e) {
  await mkdir(SALIDA, { recursive: true });
  if (pagina) await pagina.screenshot({ path: `${SALIDA}/fallo.png`, fullPage: true }).catch(() => {});
  await writeFile(`${SALIDA}/resultado.json`, JSON.stringify({ ok: false, base: BASE, error: String(e), pageErrors: errores, consoleErrors: consola }, null, 2) + '\n');
  console.error(e);
  process.exitCode = 1;
} finally {
  if (navegador) await navegador.close();
}
