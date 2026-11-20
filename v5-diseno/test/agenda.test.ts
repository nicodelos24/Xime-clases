/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  registrarToqueFecha, mesDe, VENTANA_DOBLE_TOQUE,
  marcarDada, deshacerMarcada, crearClase, marcarSiPasada,
  clasesDelDia, lunesDe, esFechaValida, sumarDias,
  RepositorioClases, almacenMemoria, relojFalso, datosDemo, fichasDemo,
  type Clase,
} from '../src/index.ts';

const t = (s: string) => new Date(s).getTime();
const ahora = t('2026-11-20T16:00:00.000Z'); // 13:00 en Uruguay

function claseBase(): Clase {
  return crearClase({
    id: 'c1', nombre: 'Grupo Viernes', fecha: '2026-11-20', hora: '18:00',
    alumnos: [{ id: 'a1', nombre: 'Carla', telefono: '099123456' }],
  });
}

/* ------------------------------------------------ toque simple / doble en el mes */

test('un toque selecciona: nunca abre la semana, aunque el día esté vacío', () => {
  const r = registrarToqueFecha(null, '2026-11-30', 1000);
  assert.equal(r.doble, false);
  assert.deepEqual(r.ultimo, { fecha: '2026-11-30', instante: 1000 });

  // El día 30 no tiene clases: el primer toque no depende de que haya clases.
  const segundo = registrarToqueFecha(r.ultimo, '2026-11-30', 1000 + VENTANA_DOBLE_TOQUE - 1);
  assert.equal(segundo.doble, true, 'dos toques en la misma fecha abren la semana');
});

test('un toque en otra fecha no abre la semana y reinicia la ventana', () => {
  const primero = registrarToqueFecha(null, '2026-11-20', 1000);
  const otro = registrarToqueFecha(primero.ultimo, '2026-11-21', 1100);
  assert.equal(otro.doble, false);
  assert.deepEqual(otro.ultimo, { fecha: '2026-11-21', instante: 1100 });
  // El toque posterior sobre la fecha original ya no cuenta como doble.
  assert.equal(registrarToqueFecha(otro.ultimo, '2026-11-20', 1200).doble, false);
});

test('un toque tardío en la misma fecha no abre la semana', () => {
  const primero = registrarToqueFecha(null, '2026-11-01', 1000);
  assert.equal(registrarToqueFecha(primero.ultimo, '2026-11-01', 1000 + VENTANA_DOBLE_TOQUE + 1).doble, false);
});

test('un tercer toque tras el doble vuelve a contar como primero', () => {
  const primero = registrarToqueFecha(null, '2026-11-20', 1000);
  const doble = registrarToqueFecha(primero.ultimo, '2026-11-20', 1100);
  assert.equal(doble.doble, true);
  assert.equal(doble.ultimo, null, 'la secuencia se consume');
  assert.equal(registrarToqueFecha(doble.ultimo, '2026-11-20', 1150).doble, false);
});

test('doble toque en límite de mes: la semana existe y contiene el día', () => {
  for (const f of ['2026-11-01', '2026-11-30', '2026-12-31', '2027-01-01']) {
    assert.equal(esFechaValida(f), true);
    const lunes = lunesDe(f);
    const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
    assert.ok(dias.includes(f), `${f} debe estar en su semana`);
    assert.equal(mesDe(f), f.slice(0, 7));
  }
});

/* -------------------------------------------- clases del día en el mes */

test('las tarjetas del día salen ordenadas por hora y sin restos del día anterior', () => {
  const temprano = crearClase({ id: 't', nombre: 'Temprano', fecha: '2026-11-20', hora: '09:00' });
  const tarde = crearClase({ id: 'd', nombre: 'Tarde', fecha: '2026-11-20', hora: '18:00' });
  const otro = crearClase({ id: 'o', nombre: 'Otro día', fecha: '2026-11-21', hora: '10:00' });
  assert.deepEqual(clasesDelDia([tarde, otro, temprano], '2026-11-20').map((c) => c.id), ['t', 'd']);
  assert.deepEqual(clasesDelDia([tarde, temprano], '2026-11-19'), [], 'día vacío: nada del día anterior');
});

/* --------------------------------------------- marcar dada a mano y deshacer */

test('«Por dar» puede marcar dada a mano: estado, auditoría y deshacer', () => {
  const c = claseBase();
  const marcada = marcarDada(c, { quien: 'dueño', ahora });
  assert.equal(marcada.estado, 'dada');
  assert.equal(marcada.marcadaEn, ahora);
  assert.deepEqual(marcada.eventos.at(-1), {
    tipo: 'marcada-manual', fecha: '2026-11-20', minutos: 13 * 60, quien: 'dueño',
  });

  const vuelta = deshacerMarcada(marcada, { quien: 'dueño', ahora: ahora + 1000 });
  assert.equal(vuelta.estado, 'programada');
  assert.equal(vuelta.marcadaEn, null);
  assert.equal(vuelta.eventos.length, 2, 'no se borra la auditoría');
  assert.equal(vuelta.eventos.at(-1)?.tipo, 'marca-manual-deshecha');

  assert.throws(() => deshacerMarcada(c, { quien: 'dueño', ahora }), /marcada a mano/);
  assert.throws(() => marcarDada(c, { quien: ' ', ahora }), /quién/);
});

test('marcar a mano no se deshace con la reconciliación por hora', () => {
  const c = claseBase(); // 18:00 local, aún no pasó a las 13:00
  const marcada = marcarDada(c, { quien: 'dueño', ahora });
  assert.equal(marcarSiPasada(marcada, ahora).estado, 'dada');
});

/* -------------------------------------------------- persistencia del repositorio */

test('el repositorio persiste marcar dada, deshacer y cancelar con motivo opcional', () => {
  const reloj = relojFalso(ahora);
  const storage = almacenMemoria();
  const repo = new RepositorioClases(storage, reloj, () => [claseBase()], () => fichasDemo('2026-11-20'));

  repo.marcarDada('c1', { quien: 'dueño', ahora: reloj.ahora() });
  assert.equal(repo.listar()[0].estado, 'dada');
  assert.equal(JSON.parse(storage.leer() as string).clases[0].estado, 'dada');

  repo.deshacerMarcada('c1', { quien: 'dueño', ahora: reloj.ahora() });
  assert.equal(repo.listar()[0].estado, 'programada');

  repo.cancelar('c1', { motivo: '   ', quien: 'dueño', ahora: reloj.ahora() });
  assert.equal(repo.listar()[0].cancelacion?.motivo, 'sin motivo');

  // Un nuevo repositorio sobre el mismo storage lee lo guardado (refresh).
  const otro = new RepositorioClases(storage, reloj, () => [claseBase()], () => fichasDemo('2026-11-20'));
  assert.equal(otro.listar()[0].estado, 'cancelada');
});

test('la demo sigue sembrándose con el estado vigente (8 clases); sin tocar BD', () => {
  const clases = datosDemo(ahora);
  assert.equal(clases.length, 8);
  assert.equal(mesDe(clases[0].fecha), '2026-11');
});
