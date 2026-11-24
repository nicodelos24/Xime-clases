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
pagina.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
pagina.on('console', (m) => { if (m.type() === 'error') consola.push(`console: ${m.text()}`); });

try {
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

  // Archivo local real: el flujo reduce la imagen y deja la foto pendiente.
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
  const chip = pagina.locator('#v-semana .chip-boton').first();
  assert.ok(await chip.isVisible(), 'chip de clase visible');
  await chip.click({ force: true });
  await pagina.waitForSelector('div.sheet[role="dialog"]', { state: 'attached' });
  assert.ok(await pagina.locator('div.sheet [data-acciones-principales]').count(), 'el menú conserva el cierre y sus acciones');
  await pagina.screenshot({ path: `${SALIDA}/04-menu-clase.png`, fullPage: true });
  await pagina.locator('div.sheet .sheet-cerrar').click();
  await pagina.waitForFunction(() => !document.querySelector('div.sheet[data-disparador^="clase-acciones"]'));
  await pagina.waitForTimeout(350);
  await chip.click({ force: true });
  await pagina.waitForSelector('div.sheet[role="dialog"]', { state: 'attached' });
  assert.equal(await pagina.locator('div.sheet[data-disparador^="clase-acciones"]').count(), 1, 'reabre una sola hoja viva');

  await pagina.locator('div.sheet .sheet-cerrar').click();
  await pagina.waitForFunction(() => !document.querySelector('div.sheet[data-disparador^="clase-acciones"]'));
  const tarjeta = chip.locator('xpath=ancestor::article[contains(@class,"clase")]');
  const caja = await tarjeta.boundingBox();
  assert.ok(caja, 'tarjeta visible');
  await pagina.touchscreen.tap(caja.x + caja.width * 0.55, caja.y + 32);
  await pagina.waitForTimeout(100);
  const estadoTrasTap = await chip.innerText();
  assert.match(estadoTrasTap, /Dada|Por dar/);
  assert.equal(await pagina.locator('div.sheet[data-disparador^="clase-acciones"]').count(), 0, 'el tap en zona vacía no abre cancelación');
  await pagina.screenshot({ path: `${SALIDA}/05-toque-clase.png`, fullPage: true });

  assert.deepEqual(errores, [], 'sin errores de JavaScript');
  assert.deepEqual(consola, [], 'sin errores de consola');
  await mkdir(SALIDA, { recursive: true });
  await writeFile(`${SALIDA}/resultado.json`, JSON.stringify({
    ok: true, base: BASE, alumnos, estadoTrasTap, srcFotoBytes: (srcFoto ?? '').length,
    pageErrors: errores, consoleErrors: consola,
  }, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, alumnos, estadoTrasTap, srcFotoBytes: (srcFoto ?? '').length }, null, 2));
} catch (e) {
  await mkdir(SALIDA, { recursive: true });
  await pagina.screenshot({ path: `${SALIDA}/fallo.png`, fullPage: true }).catch(() => {});
  await writeFile(`${SALIDA}/resultado.json`, JSON.stringify({ ok: false, base: BASE, error: String(e), pageErrors: errores, consoleErrors: consola }, null, 2) + '\n');
  console.error(e);
  process.exitCode = 1;
} finally {
  await navegador.close();
}
