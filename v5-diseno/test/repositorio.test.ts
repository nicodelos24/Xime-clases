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

  // Lunes a miércoles ya pasaron: la demo se siembra dada. Hoy toca marcarla
  // a mano: abrir la app NO marca por reloj (decisión de Nico, 21/11).
  assert.deepEqual(
    clases.filter((c) => ['c-lun', 'c-mar-a', 'c-mar-b', 'c-mie'].includes(c.id)).map((c) => c.estado),
    ['dada', 'dada', 'dada', 'dada'],
  );
  assert.equal(deHoy[0].marcadaEn, null, 'hoy todavía no está marcada');

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

test('una semana después: lo dado sigue dado y nada se re-marca solo', () => {
  const almacen = almacenMemoria();
  const primera = abrir(almacen, JUEVES_10).repo.reconciliar();
  const estados = new Map(primera.map((c) => [c.id, c.estado]));
  assert.equal(estados.get('c-jue'), 'programada', 'la de hoy arranca Por dar');

  const otra = abrir(almacen, t('2026-11-26T13:00:00.000Z')); // jueves siguiente 10:00
  const clases = otra.repo.reconciliar();
  const viejas = clases.filter((c) => c.fecha < '2026-11-19');
  assert.equal(viejas.length, 4);
  assert.ok(viejas.every((c) => c.estado === 'dada'), 'lo ya dictado sigue Dada');
  // Lo que quedó «Por dar» NO se marca solo al volver días después.
  assert.deepEqual(
    clases.map((c) => [c.id, c.estado]),
    [...estados.entries()],
    'ninguna clase cambia de estado por el paso del tiempo',
  );
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

/* ------------------------------------------------ v3: agendar + sueltas ---- */

test('crearRutina genera ocurrencias y sobrevive F5 sin duplicar', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  const antes = repo.listar().length;
  const rutina = repo.crearRutina({
    id: 'rut-lun-mie', nombre: 'Grupo Lunes y Miércoles', dias: [0, 2],
    desde: '2026-11-19', hora: '15:00',
  });
  const conOc = repo.listar().filter((c) => c.rutinaId === rutina.id);
  assert.ok(conOc.length > 0, 'se materializaron ocurrencias');
  assert.equal(repo.listar().length, antes + conOc.length);

  // F5: el repositorio nuevo genera 0 ocurrencias nuevas (ya están guardadas).
  const luego = abrir(almacen, JUEVES_10);
  luego.repo.reconciliar();
  const trasF5 = luego.repo.listar().filter((c) => c.rutinaId === rutina.id);
  assert.equal(trasF5.length, conOc.length, 'no duplica al reabrir');
  assert.deepEqual(trasF5.map((c) => c.id).sort(), conOc.map((c) => c.id).sort());
  const guardado = JSON.parse(almacen.leer() as string);
  assert.equal(guardado.version, VERSION_ESTADO);
  assert.equal(guardado.rutinas.length, 1, 'la plantilla quedó guardada');
});

test('dar de baja una rutina cancela solo sus futuras por dar y no borra historial', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  repo.crearRutina({
    id: 'rut-baja', nombre: 'Grupo Baja', dias: [0, 3], desde: '2026-11-16', hora: '15:00',
  });
  const occ = repo.listar().filter((c) => c.rutinaId === 'rut-baja')
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  assert.ok(occ.length >= 4);
  // Una de hoy ya dictada (marca manual) y una futura movida a mano.
  const pasada = occ.find((c) => c.fecha === '2026-11-19')!;
  repo.marcarDada(pasada.id, { quien: 'Xime', ahora: t('2026-11-19T21:00:00.000Z') });
  const futura = occ.find((c) => c.fecha > '2026-11-20')!;
  repo.reprogramar(futura.id, '2026-12-01', { quien: 'Xime', ahora: t('2026-11-19T13:00:00.000Z') });

  const futurasPorDar = occ.filter((c) => c.fecha >= '2026-11-19' && c.id !== pasada.id
    && c.id !== futura.id).length;
  const res = repo.eliminarRutina('rut-baja', {
    motivo: 'Rutina dada de baja', quien: 'Xime', ahora: t('2026-11-19T13:00:00.000Z'),
  });
  assert.equal(res.canceladas, futurasPorDar, 'cancela exactamente las futuras por dar');
  assert.equal(repo.listarRutinas().length, 0, 'la plantilla desaparece');

  const despues = repo.listar();
  assert.equal(despues.find((c) => c.id === pasada.id)?.estado, 'dada', 'lo dictado queda Dada');
  assert.equal(despues.find((c) => c.id === futura.id)?.fecha, '2026-12-01', 'la movida no se toca');
  assert.ok(
    despues.filter((c) => c.rutinaId === 'rut-baja' && c.id !== pasada.id && c.id !== futura.id)
      .every((c) => c.estado === 'cancelada'),
    'las futuras quedan Canceladas, no borradas',
  );
  // Y no se regeneran: la plantilla ya no existe.
  const luego = abrir(almacen, JUEVES_10);
  luego.repo.reconciliar();
  assert.equal(luego.repo.listar().filter((c) => c.rutinaId === 'rut-baja').length, occ.length);
});

test('navegar adelante y reabrir sigue mostrando ocurrencias (sin corte fijo)', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.crearRutina({ id: 'rut-vie', nombre: 'Viernes', dias: [4], desde: '2026-11-20', hora: '10:00' });
  const inicial = repo.listar().filter((c) => c.rutinaId === 'rut-vie').length;

  // El reloj avanza un mes: al reconciliar aparecen más ocurrencias.
  const luego = abrir(almacen, t('2026-12-20T13:00:00.000Z'));
  const clases = luego.repo.reconciliar();
  const finales = clases.filter((c) => c.rutinaId === 'rut-vie');
  assert.ok(finales.length > inicial, 'el horizonte se extendió');
  assert.ok(finales.some((c) => c.fecha >= '2026-12-20' && c.fecha <= '2027-01-01'));
});

test('cancelar una ocurrencia no la regenera en origen tras F5; el resto intacto', () => {
  const almacen = almacenMemoria();
  const { repo, reloj } = abrir(almacen, JUEVES_10);
  repo.crearRutina({ id: 'rut-lm', nombre: 'Lunes', dias: [0], desde: '2026-11-23', hora: '15:00' });
  const occ = repo.listar().filter((c) => c.rutinaId === 'rut-lm').sort((a, b) => a.fecha.localeCompare(b.fecha));
  const origen = occ[0];
  const total = occ.length;
  repo.cancelar(origen.id, { motivo: 'Lluvia', quien: 'Xime', ahora: reloj.ahora() });

  const luego = abrir(almacen, JUEVES_10);
  luego.repo.reconciliar();
  const tras = luego.repo.listar().filter((c) => c.rutinaId === 'rut-lm');
  assert.equal(tras.length, total, 'la cancelada sigue en la lista con su auditoría');
  assert.equal(tras.find((c) => c.id === origen.id)?.estado, 'cancelada');
  assert.equal(tras.find((c) => c.id === origen.id)?.cancelacion?.motivo, 'Lluvia');
  const rutina = luego.repo.listarRutinas()[0];
  assert.equal(rutina.excepciones[origen.fechaRutina as string], 'cancelada', 'la fecha quedó exceptuada');

  // Incluso si la clase se eliminara del estado, la fecha no reaparece.
  const estado = JSON.parse(almacen.leer() as string);
  estado.clases = estado.clases.filter((c: { id: string }) => c.id !== origen.id);
  const soloConExcepcion = almacenMemoria(JSON.stringify(estado));
  const recon = abrir(soloConExcepcion, JUEVES_10).repo.reconciliar();
  assert.equal(recon.some((c) => c.fecha === origen.fecha && c.rutinaId === 'rut-lm'), false);
});

test('mover una ocurrencia conserva hora/duración/participantes y no reaparece en origen', () => {
  const almacen = almacenMemoria();
  const { repo, reloj } = abrir(almacen, JUEVES_10);
  repo.crearRutina({
    id: 'rut-mar', nombre: 'Martes', dias: [1], desde: '2026-11-24', hora: '17:30', duracionMin: 90,
    // Sin alumnos: el foco es conservar hora/duración/auditoría.
  });
  const occ = repo.listar().filter((c) => c.rutinaId === 'rut-mar').sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const fechaOrigen = occ.fecha;
  repo.reprogramar(occ.id, '2026-12-15', { quien: 'Xime', ahora: reloj.ahora() });

  const luego = abrir(almacen, JUEVES_10);
  luego.repo.reconciliar();
  const movida = luego.repo.listar().find((c) => c.id === occ.id);
  assert.equal(movida?.fecha, '2026-12-15');
  assert.equal(movida?.minutos, 17 * 60 + 30, 'conserva la hora');
  assert.equal(movida?.duracionMin, 90, 'conserva la duración');
  assert.equal(movida?.eventos.at(-1)?.tipo, 'reprogramada', 'auditoría intacta');
  assert.equal(luego.repo.listar().some((c) => c.id === occ.id && c.fecha === fechaOrigen), false, 'no está en origen');
  const rutina = luego.repo.listarRutinas()[0];
  assert.equal(rutina.excepciones[occ.fechaRutina as string], 'movida');
});

test('clase suelta: alta, F5 y sin duplicado', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  const suelta = repo.crearSuelta({ id: 'suelta-1', nombre: 'Inglés individual', fecha: '2026-11-25', hora: '17:30' });
  assert.equal(suelta.estado, 'programada');
  assert.equal(repo.listar().filter((c) => c.id === suelta.id).length, 1);

  const luego = abrir(almacen, JUEVES_10);
  luego.repo.reconciliar();
  const trasF5 = luego.repo.listar().filter((c) => c.id === suelta.id);
  assert.equal(trasF5.length, 1, 'no se duplica al reabrir');
  assert.equal(trasF5[0].fecha, '2026-11-25');
  assert.equal(trasF5[0].nombre, 'Inglés individual');
});

test('migración v1/v2 → v3 conserva clases, pagos, alumnos e historial', () => {
  const base = {
    version: 2,
    guardadoEn: '2026-11-19T13:00:00.000Z',
    clases: [{
      id: 'c-vieja', nombre: 'Grupo Viejo', fecha: '2026-11-18', minutos: 900, duracionMin: 60,
      alumnos: [], estado: 'dada', marcadaEn: t('2026-11-18T19:00:00.000Z'), cancelacion: null,
      eventos: [{ tipo: 'marcada-manual', fecha: '2026-11-18', minutos: 900, quien: 'Xime' }],
    }],
    pagos: [{ id: 'p1', alumnoId: 'a0', periodo: '2026-11', montoUYU: 6500, fecha: '2026-11-18', quien: 'Xime' }],
    alumnos: [],
  };
  const almacen = almacenMemoria(JSON.stringify(base));
  const { repo } = abrir(almacen, JUEVES_10);
  repo.reconciliar();
  assert.equal(repo.listar().length, 1, 'la demo NO resembra sobre datos guardados');
  const c = repo.listar()[0];
  assert.equal(c.id, 'c-vieja');
  assert.equal(c.estado, 'dada', 'no se pisa la marca manual');
  assert.equal(c.eventos.length, 1, 'se conserva la auditoría');
  assert.equal(repo.listarPagos().length, 1, 'se conservan los pagos');
  const guardado = JSON.parse(almacen.leer() as string);
  assert.equal(guardado.version, VERSION_ESTADO);
  assert.deepEqual(guardado.rutinas, [], 'se agregó el campo rutinas sin tocar lo demás');
});

test('fallo del guardado: crearSuelta no anuncia éxito (lanza)', () => {
  const almacen = almacenMemoria();
  let fallar = false;
  const almacenQueFalla: Almacen = {
    leer: () => almacen.leer(),
    escribir: (texto, requiere) => {
      if (fallar && requiere) throw new Error('No se pudo guardar');
      almacen.escribir(texto, requiere);
    },
  };
  const { repo } = abrir(almacenQueFalla, JUEVES_10);
  repo.reconciliar();
  fallar = true;
  assert.throws(() => repo.crearSuelta({ id: 'suelta-x', nombre: 'x', fecha: '2026-11-25', hora: '10:00' }), /No se pudo guardar/);
  assert.equal(repo.listar().some((c) => c.id === 'suelta-x'), false, 'el estado en memoria no avanzó');
});

test('volver a la app con la clase terminada NO la marca (auto-marcado descartado)', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  const clases = repo.reconciliar(); // jueves 10:00: la clase de hoy (16:00) sigue por dar
  const deHoy = clases.find((c) => c.fecha === '2026-11-19');
  assert.equal(deHoy?.estado, 'programada');

  // Vuelve a las 17:30 local (20:30 UTC): la clase 16:00–17:00 ya terminó,
  // pero sigue «Por dar» hasta que la dueña la marque.
  const luego = abrir(almacen, t('2026-11-19T20:30:00.000Z'));
  const alVolver = luego.repo.reconciliar().find((c) => c.id === deHoy?.id);
  assert.equal(alVolver?.estado, 'programada', 'no se marca por reloj');
  assert.equal(alVolver?.marcadaEn, null);

  // La marca manual sí se guarda y sobrevive a otro «abrir».
  luego.repo.marcarDada(deHoy!.id, { quien: 'Xime', ahora: luego.reloj.ahora() });
  const otraVez = abrir(almacen, t('2026-11-20T13:00:00.000Z'));
  assert.equal(otraVez.repo.reconciliar().find((c) => c.id === deHoy?.id)?.estado, 'dada');
});

test('un build v2 anterior lee el estado del v3 SIN resembrar ni perder datos', () => {
  // Una pestaña vieja del build v2 (VERSION_ESTADO=2) debe aceptar el estado
  // escrito hoy. Para eso el estado escrito es version:2 con rutinas extra.
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.crearSuelta({ id: 'suelta-v3', nombre: 'Clase de la clienta', fecha: '2026-11-25', hora: '17:00' });
  repo.reconciliar();
  const guardado = JSON.parse(almacen.leer() as string);
  assert.equal(guardado.version, 2, 'el build v2 acepta esta version (no la descarta)');
  assert.ok(Array.isArray(guardado.clases) && guardado.clases.some((c: { id: string }) => c.id === 'suelta-v3'));
  // Simular el lector del build v2: acepta version 1 o 2 y clases; NO resembra.
  const esAceptadoPorV2 = guardado.version === 2 && Array.isArray(guardado.clases);
  assert.equal(esAceptadoPorV2, true, 'el v2 leería el estado como válido');
});

test('builds mezclados: v2 re-graba sin rutinas y el v3 las recupera del respaldo', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  const rutina = repo.crearRutina({ id: 'rut-mezcla', nombre: 'Mezcla', dias: [0], desde: '2026-11-16', hora: '10:00' });
  repo.reconciliar();
  const antes = repo.listar().filter((c) => c.rutinaId === rutina.id).length;
  assert.ok(antes > 0);

  // El build v2 re-graba su estado (sin campo rutinas), como haría una pestaña
  // vieja al marcar una clase. Debe conservar clases, pagos y alumnos.
  const grabado = JSON.parse(almacen.leer() as string);
  delete grabado.rutinas;
  almacen.escribir(JSON.stringify(grabado));

  const { repo: reabierta } = abrir(almacen, JUEVES_10);
  reabierta.reconciliar();
  assert.equal(reabierta.listarRutinas().length, 1, 'la plantilla se recupera del respaldo');
  assert.equal(reabierta.listarRutinas()[0].id, rutina.id);
  assert.ok(reabierta.listar().some((c) => c.rutinaId === rutina.id), 'las ocurrencias siguen ahí');
  assert.equal(reabierta.listar().some((c) => c.id === 'suelta-v3'), false);
});

test('estado version 3 (hipotético) se migra sin resembrar y conserva rutinas', () => {
  const datos = {
    version: 3, guardadoEn: '2026-11-20T13:00:00.000Z',
    clases: [{ id: 'c-v3', nombre: 'V3', fecha: '2026-11-19', minutos: 960, duracionMin: 60, alumnos: [], estado: 'programada', cancelacion: null, eventos: [] }],
    pagos: [], alumnos: [],
    rutinas: [{ id: 'rut-v3', nombre: 'R', dias: [0], desde: '2026-11-16', hora: '10:00', duracionMin: 60, excepciones: {} }],
  };
  const almacen = almacenMemoria(JSON.stringify(datos));
  const { repo } = abrir(almacen, JUEVES_10);
  assert.equal(repo.listar().some((c) => c.id === 'c-v3'), true, 'no resembra');
  assert.equal(repo.listarRutinas()[0]?.id, 'rut-v3');
  assert.equal(JSON.parse(almacen.leer() as string).version, 2, 'se normaliza a la version escrita');
});

test('mover con fallo de disco: ni excepción ni clase cambian (una sola escritura)', () => {
  const datos = {
    version: 2, guardadoEn: '2026-11-20T13:00:00.000Z',
    clases: [],
    pagos: [], alumnos: [],
    rutinas: [{ id: 'rut-atom', nombre: 'Atómica', dias: [0], desde: '2026-11-16', hora: '10:00', duracionMin: 60, excepciones: {} }],
  };
  const almacen = almacenMemoria(JSON.stringify(datos));
  let escrituras = 0;
  const fallar = { on: false };
  const almacenQueFalla: Almacen = {
    leer: () => almacen.leer(),
    escribir: (texto, requiere) => {
      if (requiere) {
        escrituras++;
        if (fallar.on) throw new Error('QuotaExceededError');
      }
      almacen.escribir(texto, requiere);
    },
  };
  const { repo } = abrir(almacenQueFalla, JUEVES_10);
  repo.reconciliar();
  const occ = repo.listar().find((c) => c.rutinaId === 'rut-atom')!;
  const origen = occ.fecha;
  escrituras = 0;
  fallar.on = true;
  assert.throws(() => repo.reprogramar(occ.id, '2026-12-04', { quien: 'Xime', ahora: JUEVES_10 }), /QuotaExceededError/);
  assert.equal(escrituras, 1, 'una sola escritura obligatoria, sin escritura parcial de excepción');
  assert.equal(repo.listar().find((c) => c.id === occ.id)?.fecha, origen, 'la clase sigue en origen en memoria');
  assert.equal(repo.listarRutinas()[0].excepciones[origen], undefined, 'sin excepción huérfana');
  fallar.on = false;
  const { repo: reabierta } = abrir(almacenQueFalla, JUEVES_10);
  reabierta.reconciliar();
  assert.equal(reabierta.listar().find((c) => c.id === occ.id)?.fecha, origen, 'F5 sigue en origen');
});

test('mover una clase suelta con fallo de disco tampoco anuncia éxito', () => {
  const almacen = almacenMemoria();
  const base = almacenMemoria();
  const fallar = { on: false };
  const almacenQueFalla: Almacen = {
    leer: () => almacen.leer(),
    escribir: (texto, requiere) => {
      if (fallar.on && requiere) throw new Error('QuotaExceededError');
      base.escribir(texto, requiere);
      almacen.escribir(texto, requiere);
    },
  };
  const { repo } = abrir(almacenQueFalla, JUEVES_10);
  repo.reconciliar();
  repo.crearSuelta({ id: 'suelta-atom', nombre: 'Suelta', fecha: '2026-12-03', hora: '17:30' });
  fallar.on = true;
  assert.throws(() => repo.reprogramar('suelta-atom', '2026-12-04', { quien: 'Xime', ahora: JUEVES_10 }), /QuotaExceededError/);
  assert.equal(repo.listar().find((c) => c.id === 'suelta-atom')?.fecha, '2026-12-03');
  assert.equal(JSON.parse(almacen.leer() as string).clases.find((c: { id: string }) => c.id === 'suelta-atom').fecha, '2026-12-03');
});

test('mes lejano > 60 días: materializa ocurrencias al consultarlo sin inventar pasado', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10); // hoy 19/11/2026
  const rutina = repo.crearRutina({ id: 'rut-lejana', nombre: 'Lejana', dias: [0, 4], desde: '2026-11-16', hora: '19:00' });
  const iniciales = repo.listar().filter((c) => c.rutinaId === rutina.id).length;
  assert.ok(iniciales > 0);

  // Consultar febrero 2027 (más de 60 días después de hoy): debe materializar.
  const materializadas = repo.materializarHasta('2027-02-28');
  const enFeb = materializadas.filter((c) => c.rutinaId === rutina.id && c.fecha.startsWith('2027-02'));
  assert.ok(enFeb.length >= 8, `febrero 2027 debería tener las ocurrencias de lun/vie (tiene ${enFeb.length})`);
  assert.ok(enFeb.some((c) => c.fecha === '2027-02-05'), 'viernes 05/02/2027 ya no dice "Sin clases"');

  // Sin días previos al inicio de la plantilla.
  assert.equal(materializadas.some((c) => c.rutinaId === rutina.id && c.fecha < '2026-11-16'), false);
  // Sin duplicados: llamar dos veces no agrega nada.
  const { repo: reapertura } = abrir(almacen, JUEVES_10);
  reapertura.reconciliar();
  const demasiadas = reapertura.materializarHasta('2027-02-28');
  const ids = demasiadas.filter((c) => c.rutinaId === rutina.id).map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, 'IDs únicos, sin duplicar al volver');
});

test('materializar un mes lejano NO marca clases como dadas (no es hoy)', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  const rutina = repo.crearRutina({ id: 'rut-futura', nombre: 'Futura', dias: [0], desde: '2026-11-16', hora: '10:00' });
  repo.reconciliar();
  const iniciales = repo.listar().filter((c) => c.rutinaId === rutina.id);
  const antes = new Map(iniciales.map((c) => [c.id, c.estado]));
  repo.materializarHasta('2027-06-30');
  const despues = repo.listar().filter((c) => c.rutinaId === rutina.id && antes.has(c.id));
  assert.ok(despues.every((c) => antes.get(c.id) === c.estado), 'consultar junio 2027 no cambia el estado de ninguna ocurrencia previa');
  const futuras = repo.listar().filter((c) => c.rutinaId === rutina.id && c.fecha > '2027-01-01');
  assert.ok(futuras.every((c) => c.estado === 'programada'), 'las ocurrencias lejanas se crean programadas');
});

test('excepción de una ocurrencia lejana no reaparece al consultar ese mes', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen, JUEVES_10);
  repo.crearRutina({ id: 'rut-exc', nombre: 'Exc', dias: [0], desde: '2026-11-16', hora: '10:00' });
  repo.materializarHasta('2027-03-31');
  const occ = repo.listar().find((c) => c.rutinaId === 'rut-exc' && c.fecha === '2027-03-01')!;
  repo.cancelar(occ.id, { quien: 'Xime', motivo: 'Cancelada de prueba', ahora: JUEVES_10 });
  const { repo: reabierta } = abrir(almacen, JUEVES_10);
  reabierta.reconciliar();
  reabierta.materializarHasta('2027-04-30');
  const ids = reabierta.listar().filter((c) => c.rutinaId === 'rut-exc').map((c) => c.id);
  assert.equal(ids.includes(occ.id), true, 'la cancelada sigue en el histórico');
  assert.equal(reabierta.listarRutinas()[0].excepciones['2027-03-01'], 'cancelada');
  assert.equal(ids.filter((x) => x === occ.id).length, 1, 'no se duplicó ni reapareció como nueva');
});
