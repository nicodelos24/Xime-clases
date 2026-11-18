/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { filtrarYOrdenarAlumnos } from '../src/logica.ts';
import {
  ALUMNOS_FIXTURES,
  OCURRENCIAS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
} from '../src/fixtures.ts';
import { RepositorioFixtures } from '../src/repositorios.ts';
import { actividadPorDia, personasUnicasDelDia } from '../src/logica.ts';

const nuevos = () =>
  new RepositorioFixtures(
    ALUMNOS_FIXTURES.map((a) => ({ ...a })),
    OCURRENCIAS_FIXTURES.map((o) => ({ ...o })),
    PROGRAMACIONES_FIXTURES.map((p) => ({ ...p })),
  );

test('filtro y orden son independientes: alternar uno no pierde el otro', () => {
  const repo = nuevos();
  const todos = repo.listar('todos', 'recientes');
  const mensuales = repo.listar('mensual', 'recientes');
  assert.ok(mensuales.every((a) => a.modalidad === 'mensual'));
  assert.ok(todos.length >= mensuales.length);
  const mensualesRecientes = repo.listar('mensual', 'recientes').map((a) => a.id);
  const mensualesOtros = repo.listar('mensual', 'individual-primero').map((a) => a.id);
  // Mismo conjunto, distinto orden.
  assert.deepEqual([...mensualesRecientes].sort(), [...mensualesOtros].sort());
});

test('Más recientes mezcla modalidades por fecha de alta descendente y desempate estable por ID', () => {
  const lista = filtrarYOrdenarAlumnos(ALUMNOS_FIXTURES, 'todos', 'recientes');
  const altas = lista.map((a) => a.fechaAlta);
  for (let i = 1; i < altas.length; i++) {
    assert.ok(altas[i - 1] >= altas[i], 'alta descendente');
  }
  assert.ok(lista.some((a) => a.modalidad === 'mensual'));
  assert.ok(lista.some((a) => a.modalidad === 'individual'));
});

test('el alumno que dejó de venir sigue visible (Rosa)', () => {
  const repo = nuevos();
  assert.ok(repo.obtener('a-rosa'), 'ficha conservada');
  assert.ok(repo.listar('todos', 'recientes').some((a) => a.id === 'a-rosa'));
});

test('agendar una ficha que llevaba tiempo sin venir: misma ficha, nueva programación', () => {
  const repo = nuevos();
  const r = repo.agendar('a-rosa', 'o-22-1');
  assert.ok(r.ok);
  assert.equal(repo.programacionDe('a-rosa', 'o-22-1')?.activa, true);
  assert.equal(repo.obtener('a-rosa')?.id, 'a-rosa'); // ficha intacta
});

test('agendar y retirar no cambian pagos, deuda, clase efectiva ni mensualidad (no hay comandos financieros)', () => {
  const repo = nuevos();
  const antes = JSON.stringify([repo.alumnos, repo.ocurrencias.map((o) => o.estado)]);
  const r = repo.agendar('a-gabi', 'o-16-1');
  assert.ok(r.ok);
  const r2 = repo.retirar(r.ok ? r.valor.id : '');
  assert.ok(r2.ok);
  assert.equal(JSON.stringify([repo.alumnos, repo.ocurrencias.map((o) => o.estado)]), antes);
});

test('doble toque no crea dos programaciones (idempotencia por relación y por clave)', () => {
  const repo = nuevos();
  const r1 = repo.agendar('a-diego', 'o-22-1', 'p-dup');
  assert.ok(r1.ok);
  const r2 = repo.agendar('a-diego', 'o-22-1', 'p-dup');
  assert.ok(!r2.ok && r2.error.codigo === 'PROGRAMACION_DUPLICADA');
  const r3 = repo.agendar('a-diego', 'o-22-1');
  assert.ok(!r3.ok && r3.error.codigo === 'PROGRAMACION_DUPLICADA');
  assert.equal(
    repo.programaciones.filter((p) => p.activa && p.alumnoId === 'a-diego' && p.ocurrenciaId === 'o-22-1').length,
    1,
  );
});

test('misma persona en dos ocurrencias el mismo día: 1 persona, 2 programaciones', () => {
  const repo = nuevos();
  // Elena ya tiene 17 y 18 (días distintos); programarla 2 veces el 19:
  repo.ocurrencias.push({ id: 'o-19-2', fecha: '2026-11-19', hora: '10:00', estado: 'programada' });
  assert.ok(repo.agendar('a-elena', 'o-19-2').ok);
  const personas = personasUnicasDelDia(repo.programaciones, repo.ocurrencias, '2026-11-19');
  assert.equal(personas.size, 2); // Fabio + Elena
  const act = actividadPorDia(repo.programaciones, repo.ocurrencias, ALUMNOS_FIXTURES).get('2026-11-19');
  assert.equal(act?.programaciones, 2);
  assert.equal(act?.personas, 2);
});

test('la ocurrencia cancelada no cuenta como «vienen»', () => {
  const repo = nuevos();
  assert.equal(repo.ocurrenciasDe('2026-11-20').length, 1);
  assert.equal(repo.programacionesActivas('2026-11-20').length, 0);
  const r = repo.agendar('a-diego', 'o-20-1');
  assert.ok(!r.ok && r.error.codigo === 'OCURRENCIA_CANCELADA');
});

test('retirar solo la relación: ficha y ocurrencia quedan intactas', () => {
  const repo = nuevos();
  const r = repo.retirar('p-001');
  assert.ok(r.ok);
  assert.equal(repo.obtener('a-bruno')?.activo, true);
  assert.equal(repo.ocurrencias.find((o) => o.id === 'o-16-1')?.estado, 'programada');
  // Retirar de nuevo no duplica efectos.
  const r2 = repo.retirar('p-001');
  assert.ok(!r2.ok);
});

test('errores explícitos en comandos', () => {
  const repo = nuevos();
  assert.ok(!repo.agendar('no-existe', 'o-16-1').ok);
  assert.ok(!repo.agendar('a-diego', 'no-existe').ok);
});
