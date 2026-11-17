/// <reference types="node" />
/**
 * Tests de la lógica de la pantalla Alumnos (I1): búsqueda acento-insensible,
 * integración con listar(filtro, orden) y estados vacíos.
 * Solo lógica pura (filtrosAlumnos.ts + logica.ts de packages/datos) — sin React ni Expo.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  ALUMNOS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
  OCURRENCIAS_FIXTURES,
} from '../../../packages/datos/src/fixtures.ts';
import { RepositorioFixtures } from '../../../packages/datos/src/repositorios.ts';
import type { FiltroAlumnos, OrdenAlumnos } from '../../../packages/datos/src/tipos.ts';
import {
  coincideBusqueda,
  sinAcentos,
  FILTROS_ALUMNOS,
  ETIQUETA_FILTRO,
} from '../screens/filtrosAlumnos.ts';

// ─── Búsqueda ────────────────────────────────────────────────────────────────

test('Alumnos · búsqueda sin acentos: "Diego" encuentra "Diego V.", "diego" en minúsculas también', () => {
  assert.equal(sinAcentos('María Rosa'), 'Maria Rosa');
  assert.ok(coincideBusqueda('Diego V.', 'diego'));
  assert.ok(coincideBusqueda('Diego V.', 'DIEGO '));
  assert.ok(coincideBusqueda('Gabriela P.', 'gabriel'));
});

test('Alumnos · búsqueda acento-insensible: "Jose" no existe pero "José" sí en fixtures futuros', () => {
  // La función normaliza ambos lados: buscar "jose" encontraría "José".
  assert.ok(coincideBusqueda('José M.', 'jose'));
  assert.ok(coincideBusqueda('José M.', 'José'));
});

test('Alumnos · búsqueda vacía o de espacios coincide con todo', () => {
  assert.ok(coincideBusqueda('Bruno S.', ''));
  assert.ok(coincideBusqueda('Bruno S.', '   '));
});

test('Alumnos · búsqueda sin coincidencias descarta', () => {
  assert.ok(!coincideBusqueda('Bruno S.', 'carla'));
  assert.ok(!coincideBusqueda('Carla T.', 'zzz'));
});

// ─── Filtros/orden con el repositorio (fixtures reales) ─────────────────────

const nuevos = () =>
  new RepositorioFixtures(
    ALUMNOS_FIXTURES.map((a) => ({ ...a })),
    OCURRENCIAS_FIXTURES.map((o) => ({ ...o })),
    PROGRAMACIONES_FIXTURES.map((p) => ({ ...p })),
  );

test('Alumnos · filtro mensual devuelve solo mensuales, orden de alta descendente', () => {
  const repo = nuevos();
  const lista = repo.listar('mensual', 'recientes');
  assert.ok(lista.length > 0);
  for (const a of lista) assert.equal(a.modalidad, 'mensual');
  for (let i = 1; i < lista.length; i += 1) {
    assert.ok(
      lista[i - 1].fechaAlta >= lista[i].fechaAlta,
      'alta descendente',
    );
  }
});

test('Alumnos · filtro individual incluye a Rosa (dejó de venir, sigue visible)', () => {
  const repo = nuevos();
  const lista = repo.listar('individual', 'recientes');
  assert.ok(lista.some((a) => a.nombre === 'Rosa M.'), 'Rosa sigue en la lista');
});

test('Alumnos · "Más recientes" mezcla modalidades por fecha de alta (no agrupa)', () => {
  const repo = nuevos();
  const lista = repo.listar('todos', 'recientes');
  const altas = lista.map((a) => a.fechaAlta);
  const ordenada = [...altas].sort((x, y) => y.localeCompare(x));
  assert.deepEqual(altas, ordenada);
});

test('Alumnos · "Mensuales primero" agrupa mensuales arriba sin perder ninguno', () => {
  const repo = nuevos();
  const lista = repo.listar('todos', 'mensual-primero');
  const nTodos = repo.listar('todos', 'recientes').length;
  assert.equal(lista.length, nTodos, 'no se pierde ningún alumno al reordenar');
  const primeraIndividual = lista.findIndex((a) => a.modalidad === 'individual');
  const ultimoMensual = lista.map((a) => a.modalidad).lastIndexOf('mensual');
  assert.ok(
    primeraIndividual < 0 || ultimoMensual < primeraIndividual,
    'mensuales antes que individuales',
  );
});

test('Alumnos · filtro + búsqueda independientes: "mensual" + "b" encuentra solo mensuales con b', () => {
  const repo = nuevos();
  const base = repo.listar('mensual' as FiltroAlumnos, 'recientes' as OrdenAlumnos);
  const filtrada = base.filter((a) => coincideBusqueda(a.nombre, 'b'));
  assert.ok(filtrada.length > 0);
  for (const a of filtrada) {
    assert.equal(a.modalidad, 'mensual');
    assert.ok(sinAcentos(a.nombre).toLowerCase().includes('b'));
  }
});

test('Alumnos · las etiquetas de los chips existen para los 3 filtros', () => {
  assert.deepEqual(FILTROS_ALUMNOS, ['todos', 'mensual', 'individual']);
  assert.equal(ETIQUETA_FILTRO.todos, 'Todos');
  assert.equal(ETIQUETA_FILTRO.mensual, 'Mensuales');
  assert.equal(ETIQUETA_FILTRO.individual, 'Por clase individual');
});
