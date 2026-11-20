/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  RepositorioClases, almacenMemoria, almacenLocalStorage, CLAVE_ESTADO, VERSION_ESTADO,
  type Almacen,
} from '../src/repositorio.ts';
import { datosDemo } from '../src/demo.ts';
import { lunesDe } from '../src/fechas.ts';
import { hoyLocal, relojFalso, type InstanteMs } from '../src/reloj.ts';

const t = (s: string) => new Date(s).getTime();
// Jueves 19/11/2026, 10:00 en Uruguay (UTC−3).
const JUEVES_10 = t('2026-11-19T13:00:00.000Z');

/** Repositorio "que se acaba de abrir" sobre el mismo almacén (simula F5). */
function abrir(almacen: Almacen, ahora: InstanteMs) {
  const reloj = relojFalso(ahora);
  return { reloj, repo: new RepositorioClases(almacen, reloj, datosDemo) };
}

test('sin nada guardado siembra la demo anclada a hoy y la persiste', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  const clases = repo.reconciliar();

  assert.equal(clases.length, 8);
  assert.equal(lunesDe(clases[0].fecha), lunesDe('2026-11-19'), 'la semana demo es la de hoy');
  const deHoy = clases.filter((c) => c.fecha === '2026-11-19');
  assert.equal(deHoy.length, 1, 'Hoy no queda vacío');
  assert.equal(deHoy[0].nombre, 'Grupo Jueves');
  assert.equal(deHoy[0].estado, 'programada', 'a las 10:00 la clase de las 16:00 aún no pasó');

  // Lunes a miércoles ya pasaron: el estado derivado por hora quedó guardado.
  assert.deepEqual(
    clases.filter((c) => ['c-lun', 'c-mar-a', 'c-mar-b', 'c-mie'].includes(c.id)).map((c) => c.estado),
    ['dada', 'dada', 'dada', 'dada'],
  );

  const guardado = JSON.parse(almacen.leer() as string);
  assert.equal(guardado.version, VERSION_ESTADO);
  assert.equal(guardado.clases.length, 8);
  assert.deepEqual(guardado.pagos, [], 'el contrato de pagos queda listo para la pieza B');
});

test('un refresh conserva la cancelación (estado, motivo y quién)', () => {
  const almacen = almacenMemoria();
  const { repo, reloj } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  reloj.fijar(t('2026-11-19T14:00:00.000Z')); // 11:00
  repo.cancelar('c-jue', { motivo: 'Lluvia', quien: 'Xime', ahora: reloj.ahora() });
  repo.registrarMensajeEnviado('c-jue', 'masivo');

  // F5 a las 20:00 (la hora de la clase ya pasó).
  const luego = abrir(almacen, t('2026-11-19T23:00:00.000Z'));
  luego.repo.reconciliar();
  const c = luego.repo.listar().find((x) => x.id === 'c-jue');

  assert.ok(c);
  assert.equal(c.estado, 'cancelada', 'el auto-marcado no pisa la cancelación');
  assert.equal(c.marcadaEn, null);
  assert.equal(c.cancelacion?.motivo, 'Lluvia');
  assert.equal(c.cancelacion?.quien, 'Xime');
  assert.equal(c.cancelacion?.mensajesEnviados, 'masivo');
  assert.deepEqual(c.eventos.map((e) => e.tipo), ['cancelada', 'mensajes']);
});

test('el auto-marcado no se reescribe sobre una cancelación, ni al día siguiente', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  repo.cancelar('c-jue', { motivo: 'Enfermedad', quien: 'Xime', ahora: JUEVES_10 });

  const manana = abrir(almacen, t('2026-11-20T15:00:00.000Z')); // viernes 12:00
  manana.repo.reconciliar();
  const c = manana.repo.listar().find((x) => x.id === 'c-jue');
  assert.equal(c?.estado, 'cancelada');
  assert.equal(c?.cancelacion?.motivo, 'Enfermedad');
  assert.equal(c?.marcadaEn, null);
});

test('un refresh conserva la reprogramación y quién la hizo', () => {
  const almacen = almacenMemoria();
  const { repo, reloj } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  repo.reprogramar('c-vie', '2026-11-25', { quien: 'Xime', ahora: reloj.ahora() });

  const luego = abrir(almacen, t('2026-11-20T13:00:00.000Z')); // viernes 10:00
  luego.repo.reconciliar();
  const c = luego.repo.listar().find((x) => x.id === 'c-vie');

  assert.equal(c?.fecha, '2026-11-25', 'ya no está el viernes 20');
  assert.equal(c?.estado, 'programada');
  assert.equal(luego.repo.listar().some((x) => x.id === 'c-vie' && x.fecha === '2026-11-20'), false);
  const ultimo = c?.eventos.at(-1);
  assert.equal(ultimo?.tipo, 'reprogramada');
  assert.equal(ultimo?.tipo === 'reprogramada' && ultimo.quien, 'Xime');
  assert.equal(ultimo?.tipo === 'reprogramada' && ultimo.fechaAnterior, '2026-11-20');
});

test('reprogramar una clase cancelada conserva la cancelación tras el refresh', () => {
  const almacen = almacenMemoria();
  const { repo, reloj } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  repo.cancelar('c-jue', { motivo: 'Lluvia', quien: 'Xime', ahora: reloj.ahora() });
  repo.reprogramar('c-jue', '2026-11-26', { quien: 'Xime', ahora: reloj.ahora() });

  const luego = abrir(almacen, t('2026-11-19T20:00:00.000Z'));
  luego.repo.reconciliar();
  const c = luego.repo.listar().find((x) => x.id === 'c-jue');

  assert.equal(c?.estado, 'programada');
  assert.equal(c?.cancelacion, null);
  const evento = c?.eventos.at(-1);
  assert.equal(evento?.tipo, 'reprogramada');
  assert.equal(evento?.tipo === 'reprogramada' && evento.cancelacionAnterior?.motivo, 'Lluvia');
  assert.equal(evento?.tipo === 'reprogramada' && evento.cancelacionAnterior?.quien, 'Xime');
});

test('el estado derivado por hora sobrevive: una semana después todo sigue dado', () => {
  const almacen = almacenMemoria();
  abrir(almacen, JUEVES_10).repo.reconciliar();

  const otra = abrir(almacen, t('2026-11-26T13:00:00.000Z')); // jueves siguiente 10:00
  const clases = otra.repo.reconciliar();
  const viejas = clases.filter((c) => c.fecha < '2026-11-23');
  assert.equal(viejas.length, 8);
  assert.ok(viejas.every((c) => c.estado === 'dada'), 'nada vuelve a Programada');
});

test('datos corruptos o de otra versión: siembra de nuevo y la app abre', () => {
  const corrupto = almacenMemoria('{no es json');
  assert.equal(abrir(corrupto, JUEVES_10).repo.listar().length, 8);

  const viejo = almacenMemoria(JSON.stringify({ version: 0, clases: [{ id: 'x' }] }));
  const { repo } = abrir(viejo, JUEVES_10);
  assert.equal(repo.listar().length, 8);
  assert.notEqual(repo.listar()[0].id, 'x');
});

test('los comandos del repositorio validan la clase y no borran nada', () => {
  const { repo } = abrir(almacenMemoria(), JUEVES_10);
  repo.reconciliar();
  assert.throws(() => repo.cancelar('no-existe', { motivo: 'x', quien: 'Xime', ahora: JUEVES_10 }), /No existe/);
  assert.throws(() => repo.crear({ id: 'c-jue', nombre: 'repetida', fecha: '2026-11-19', hora: '10:00' }), /Ya existe/);
  assert.equal(repo.listar().length, 8, 'la clase cancelada o movida sigue en la lista');
});

test('la reversión se conserva tras F5 y no pierde el registro de cancelación', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.cancelar('c-jue', { motivo: 'Lluvia', quien: 'Xime', ahora: JUEVES_10 });
  repo.revertir('c-jue', { motivo: 'Error', quien: 'Xime', ahora: JUEVES_10 });
  const c = abrir(almacen, JUEVES_10).repo.reconciliar().find((x) => x.id === 'c-jue');
  assert.equal(c?.estado, 'programada');
  assert.equal(c?.cancelacion, null);
  const evento = c?.eventos.at(-1);
  assert.equal(evento?.tipo === 'revertida' && evento.cancelacion.motivo, 'Lluvia');
});

test('almacenLocalStorage usa localStorage y cae a memoria si no existe', () => {
  const datos = new Map<string, string>();
  const falso = {
    localStorage: {
      getItem: (k: string) => datos.get(k) ?? null,
      setItem: (k: string, v: string) => { datos.set(k, v); },
    },
  };
  const almacen = almacenLocalStorage(falso);
  almacen.escribir('hola');
  assert.equal(almacen.leer(), 'hola');
  assert.equal(datos.get(CLAVE_ESTADO), 'hola');

  const sinStorage = almacenLocalStorage({});
  sinStorage.escribir('memoria');
  assert.equal(sinStorage.leer(), 'memoria', 'sin localStorage la sesión sigue funcionando');
});

test('el demo es determinista para un instante dado y se ancla al día local', () => {
  const ahora = t('2026-11-22T02:30:00.000Z'); // sábado 21/11 23:30 en Uruguay
  const clases = datosDemo(ahora);
  assert.equal(hoyLocal(ahora), '2026-11-21');
  assert.equal(clases[0].fecha, lunesDe('2026-11-21'));
  assert.equal(clases.at(-1)?.fecha, '2026-11-21', 'el sábado de la demo es hoy');
  assert.deepEqual(datosDemo(ahora), clases, 'misma entrada, misma salida');
});
