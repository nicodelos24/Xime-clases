// Verificación real (navegador headless propio, sin Chrome compartido) de que el
// integrado sanea los pagos corruptos documentados por Emma (aa5f8ca6).
// Uso: XIME_URL=http://127.0.0.1:8897/index.html node verificacion-pagos.mjs resultado.json
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from '/home/nico/.cache/apx-scratch-yuma/traza-lab/node_modules/playwright/index.mjs';

const url = process.env.XIME_URL ?? 'http://127.0.0.1:8897/index.html';
const destino = process.argv[2] ?? 'resultado.json';
const ID = 'al-pagos1234';
const estado = {
  version: 2, guardadoEn: new Date().toISOString(), clases: [], rutinas: [],
  // ID válido para que el repositorio conserve la ficha; los 6 pagos son los
  // del fixture inv-pagos.json de Emma, con el alumnoId adaptado a ese ID.
  alumnos: [{ id: ID, nombre: 'Alumna Pagos', modalidad: 'mensual', grupo: 'Martes A', ancla: 24, fechaAlta: '2026-11-01', activo: true, color: 'avatar-2', contacto: '', foto: '', pagado: false }],
  pagos: [
    null,
    { objeto: true },
    { id: 'pago-texto', alumnoId: ID, periodo: '2026-11', montoUYU: '1234', fecha: '2026-11-20', quien: 'Fixture', anulado: null },
    { id: 'pago-periodo', alumnoId: ID, periodo: '2026-99', montoUYU: 1234, fecha: '2026-11-20', quien: 'Fixture', anulado: null },
    { id: 'pago-headless-001', alumnoId: ID, periodo: '2026-11', montoUYU: 1234, fecha: '2026-11-20', quien: 'Fixture', anulado: null },
    { id: 'pago-headless-001', alumnoId: ID, periodo: '2026-11', montoUYU: 1234, fecha: '2026-11-20', quien: 'Fixture', anulado: null },
  ],
};
const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'es-UY' });
const p = await c.newPage();
const errores = [];
p.on('pageerror', (e) => errores.push(e.message));
await p.addInitScript((s) => { localStorage.setItem('xime.v5.estado', JSON.stringify(s)); }, estado);
await p.goto(url, { waitUntil: 'networkidle' });
await p.locator('nav a[href="#v-cobros"]').click();
await p.waitForTimeout(250);
const leido = await p.evaluate(() => {
  const crudo = JSON.parse(localStorage.getItem('xime.v5.estado'));
  return {
    crudos: crudo.pagos.length,
    idsCrudos: crudo.pagos.map((x) => x?.id ?? null),
    filas: document.querySelectorAll('#v-cobros .cobro-fila').length,
    etiquetas: [...document.querySelectorAll('#v-cobros .cobro-fila')].map((el) => el.getAttribute('aria-label')),
    kpis: [...document.querySelectorAll('#v-cobros .kpi-valor')].map((el) => el.textContent),
  };
});
assert.equal(leido.crudos, 6, 'el fixture sembró 6 pagos inválidos/duplicados');
assert.equal(leido.filas, 1, 'sólo una ficha/período de cobro');
assert.ok(!leido.etiquetas[0]?.includes('pagado el'), 'un pago corrupto no falsea una deuda como pagada');
assert.equal(leido.kpis[0], '$1.234', 'el KPI usa sólo el pago válido, no el monto texto ni el duplicado');
assert.deepEqual(errores, [], 'sin errores JS al cargar el estado corrupto');
const resultado = { ok: true, url, ...leido, errores, fuente: 'Emma aa5f8ca6 · fixtures/inv-pagos.json', nota: 'los 6 pagos corruptos se siembran en localStorage; el repositorio los normaliza al cargar' };
await writeFile(destino, JSON.stringify(resultado, null, 2) + '\n');
console.log(JSON.stringify(resultado, null, 2));
await b.close();
