/// <reference types="node" />
/**
 * Servidor de desarrollo: el allowlist, el bind a loopback y los headers.
 * `rutaSegura` se exporta desde serve.mjs para poder probarla sin levantar
 * el servidor (y sin ocupar el puerto que usa Nico).
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
process.env.XIME_SERVIDOR = 'test';
// `createRequire` evita el sufijo de query (que TS no puede declarar).
const { rutaSegura } = require('../serve.mjs') as { rutaSegura: (ruta: string) => string | null };

test('serve.mjs sirve lo que el prototipo necesita', () => {
  for (const ruta of ['/', '/index.html', '/propuesta.ts', '/propuesta.css', '/icons.js', '/src/whatsapp.ts', '/src/repositorio.ts', '/docs/index.html']) {
    assert.ok(rutaSegura(ruta), `debe servir ${ruta}`);
  }
});

test('serve.mjs NO sirve código interno ni tests (seguridad 28-nov)', () => {
  for (const ruta of [
    '/serve.mjs', '/package.json', '/package-lock.json', '/test/whatsapp.test.ts',
    '/node_modules/typescript/package.json', '/test/seguridad-serve.test.ts',
  ]) {
    assert.equal(rutaSegura(ruta), null, `debe bloquear ${ruta}`);
  }
});

test('serve.mjs bloquea traversal y codificaciones (aunque no fuera explotable)', () => {
  for (const ruta of [
    '/../package.json', '/%2e%2e/package.json', '/src/../../serve.mjs',
    '/docs/../../serve.mjs', '/index.html%00.ts', '/src/../../etc/passwd',
  ]) {
    assert.equal(rutaSegura(ruta), null, `debe bloquear ${ruta}`);
  }
});

test('serve.mjs escucha en loopback y pone headers de defensa', async () => {
  const codigo = await readFile(new URL('../serve.mjs', import.meta.url), 'utf8');
  assert.match(codigo, /\.listen\(PUERTO,\s*'127\.0\.0\.1'/, 'bind a loopback');
  for (const cabecera of ['X-Content-Type-Options', 'X-Frame-Options', 'Content-Security-Policy', 'Referrer-Policy']) {
    assert.match(codigo, new RegExp(cabecera), `falta ${cabecera}`);
  }
  assert.match(codigo, /frame-ancestors 'none'/);
});
