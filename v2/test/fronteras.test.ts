/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';

const base = resolve(import.meta.dirname, '..');
const ficheros = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = resolve(dir, name);
  return statSync(path).isDirectory() ? ficheros(path) : /\.(tsx?|jsx?)$/.test(name) ? [path] : [];
});
const archivos = ficheros(resolve(base, 'modules'));

test('cada módulo tiene un README, contrato de tipos y ninguna dependencia directa entre módulos', () => {
  const nombres = readdirSync(resolve(base, 'modules'));
  for (const nombre of nombres) {
    assert.match(readFileSync(resolve(base, 'modules', nombre, 'README.md'), 'utf8'), /# /);
    assert.ok(archivos.some((f) => f.includes(`/modules/${nombre}/`) && !f.endsWith('.test.ts')));
  }
  for (const archivo of archivos) {
    const propio = relative(resolve(base, 'modules'), archivo).split('/')[0];
    const fuente = readFileSync(archivo, 'utf8');
    for (const m of fuente.matchAll(/(?:from\s*|import\s*\(|require\s*\()['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      if (spec.startsWith('.')) {
        const resuelto = resolve(dirname(archivo), spec);
        const resto = relative(resolve(base, 'modules'), resuelto).split('/');
        assert.ok(resto[0] === '..' || resto[0] === propio, `${archivo} importa ${spec} de otro módulo`);
      }
      assert.ok(!spec.startsWith('@xime/') || !nombres.includes(spec.split('/')[1]) || spec === `@xime/${propio}`, `${archivo}: ${spec}`);
      assert.ok(!spec.includes('/apps/mobile/'), `${archivo} importa la app`);
    }
  }
});

test('los paquetes no importan pantallas, rutas ni módulos', () => {
  for (const archivo of ficheros(resolve(base, 'packages'))) {
    const contenido = readFileSync(archivo, 'utf8');
    assert.doesNotMatch(contenido, /(?:from|import|require)[^\n]*["'][^"']*(?:modules|apps\/mobile)[^"']*["']/);
  }
});
