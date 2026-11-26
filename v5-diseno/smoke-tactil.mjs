// Smoke táctil del build local con eventos CDP reales (no eventos mouse).
// Uso: node smoke-tactil.mjs http://localhost:PUERTO/index.html <capturas>
import { chromium } from '/home/nico/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.argv[2];
const capturas = process.argv[3];
if (!url || !capturas) throw new Error('Uso: node smoke-tactil.mjs URL_DIRECTORIO_CAPTURAS');
await mkdir(capturas, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/home/nico/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  headless: true, args: ['--no-sandbox'],
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const errores = [];
page.on('pageerror', (e) => errores.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
await page.evaluate(() => { window.__punteros = []; for (const tipo of ['pointerdown','pointerup','pointercancel']) document.addEventListener(tipo, (e) => window.__punteros.push(`${tipo}:${e.pointerType}`), true); });

async function abrir() {
  await page.evaluate(() => [...document.querySelectorAll('[data-acciones="c-mar-a"]')].find((e) => e.offsetParent).click());
  await page.waitForTimeout(80);
}
async function cuantos() { return page.locator('.sheet:not(.cerrando)').count(); }
async function arrastrar(zona, dy) {
  const caja = await page.locator(zona).boundingBox();
  assert.ok(caja, `falta ${zona}`);
  const x = caja.x + caja.width / 2, y = caja.y + caja.height / 2;
  // Misma cadencia que la reverificación de Fina: 8 pasos, 16 ms. El dedo
  // nace en el centro de la zona; con `reducedMotion` la salida es instantánea.
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + dy * i / 8 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(350);
}
const gestos = {};
for (const [nombre, zona] of [['agarre', '.sheet > .sheet-agarre'], ['cabecera', '.sheet > .sheet-head']]) {
  await abrir();
  assert.equal(await page.locator('.sheet').evaluate((e) => getComputedStyle(e).touchAction), 'pan-y');
  assert.equal(await page.locator(zona).evaluate((e) => getComputedStyle(e).touchAction), 'none');
  await arrastrar(zona, 50);
  gestos[`${nombre}50`] = await cuantos();
  assert.equal(gestos[`${nombre}50`], 1, `${nombre}: 50px no debe cerrar`);
  await page.screenshot({ path: `${capturas}/${nombre}-50.png` });
  // Cada gesto parte de un sheet nuevo: el anterior quedó a media altura tras
  // el rebote y su franja ya no está donde el CDP la mediría.
  await page.locator('.sheet-cerrar').click();
  await page.waitForTimeout(350);
  await abrir();
  await arrastrar(zona, 140);
  gestos[`${nombre}140`] = await cuantos();
  assert.equal(gestos[`${nombre}140`], 0, `${nombre}: 140px debe cerrar`);
}

// Para probar scroll real usamos un viewport de teléfono bajo (320×568):
// el mismo sheet semanal excede el alto visible, sin inyectar contenido.
await page.setViewportSize({ width: 320, height: 568 });
await page.evaluate(() => { document.querySelector('.fab').click(); });
await page.waitForTimeout(250);
await page.evaluate(() => { document.querySelector('.sheet [data-mod="semanal"]').click(); });
await page.waitForTimeout(350);
const contenido = page.locator('.sheet');
assert.equal(await contenido.evaluate((e) => e.scrollHeight > e.clientHeight), true, 'el sheet semanal debe desbordar el viewport de 320×568');
await contenido.evaluate((e) => e.scrollTo(0, 0));
const caja = await contenido.boundingBox();
const x = caja.x + caja.width / 2, y = caja.y + Math.min(100, caja.height / 2);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
for (let i = 1; i <= 10; i++) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 10 }] });
  await page.waitForTimeout(16);
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await page.waitForTimeout(200);
const scroll = await contenido.evaluate((e) => e.scrollTop);
assert.ok(scroll > 0, 'el dedo debe scrollear el contenido del sheet');
assert.equal(await cuantos(), 1, 'scrollear no debe cerrar el sheet');
await page.screenshot({ path: `${capturas}/contenido-scroll.png` });
await page.locator('.sheet-cerrar').click();
await page.waitForTimeout(280);

// Escape tras apertura con mouse: foco de vuelta al chip, no al toast.
await page.setViewportSize({ width: 390, height: 844 });
await abrir();
await page.evaluate(() => { document.activeElement?.blur(); });
await page.keyboard.press('Escape');
await page.waitForTimeout(50);
const foco = await page.evaluate(() => document.activeElement?.getAttribute('data-acciones'));
assert.equal(foco, 'c-mar-a', 'Escape debe devolver foco al chip');
assert.deepEqual(errores, [], 'sin errores JS');
console.log(JSON.stringify({ ok: true, url, gestos, scrollContenido: scroll, focoEscape: foco, eventos: await page.evaluate(() => window.__punteros), errores }, null, 2));
await context.close();
await browser.close();
