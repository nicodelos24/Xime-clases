/// <reference types="node" />
/**
 * Pieza C · fichas de alumnos: alta, edición, validación, persistencia y
 * preservación del estado A/B (clases, pagos, anulaciones y agenda histórica).
 * Sin DOM, sin reloj real: repositorio sobre almacén en memoria y reloj falso.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  RepositorioClases, almacenMemoria, CLAVE_ESTADO, VERSION_ESTADO,
  type Almacen, type AlumnoFicha,
} from '../src/repositorio.ts';
import { datosDemo, fichasDemo } from '../src/demo.ts';
import { hoyLocal, relojFalso, type InstanteMs } from '../src/reloj.ts';
import {
  construirVista, crearAlumno, editarAlumno, esIdAlumno, filtrarYOrdenar, iniciales,
  puntoEstadoVence, textoEstadoVence, validarAlumno, type AlumnoFichaInput,
} from '../src/alumnos.ts';

const t = (s: string) => new Date(s).getTime();
// Jueves 19/11/2026, 10:00 en Uruguay (UTC−3).
const JUEVES_10: InstanteMs = t('2026-11-19T13:00:00.000Z');
const HOY = hoyLocal(JUEVES_10);

function abrir(almacen: Almacen, ahora: InstanteMs = JUEVES_10) {
  const reloj = relojFalso(ahora);
  return { reloj, repo: new RepositorioClases(almacen, reloj, datosDemo, fichasDemo) };
}

const Input: AlumnoFichaInput = { nombre: 'Nora Pérez', modalidad: 'mensual' };

/* ------------------------------------------------------------- validación */

test('validación: nombre corto y modalidad son obligatorios; grupo ya no se exige', () => {
  assert.ok(validarAlumno({ ...Input, nombre: 'N' }).nombre, 'nombre corto se rechaza');
  assert.ok(validarAlumno({ ...Input, nombre: '   ' }).nombre, 'nombre vacío se rechaza');
  assert.ok(validarAlumno({ ...Input, modalidad: 'otra' as AlumnoFichaInput['modalidad'] }).modalidad);
  assert.deepEqual(validarAlumno({ ...Input, grupo: 'Grupo Nuevo Inventado' }), {}, 'grupo ya no se valida');
  assert.deepEqual(validarAlumno(Input), {}, 'input válido sin errores, sin grupo');
});

test('validación: acepta acentos, apóstrofos y guiones; ancla 1..31; contacto opcional', () => {
  assert.deepEqual(validarAlumno({ ...Input, nombre: "María O'Donnell-Ruiz" }), {});
  assert.deepEqual(validarAlumno({ ...Input, ancla: 1 }), {});
  assert.deepEqual(validarAlumno({ ...Input, ancla: 31 }), {});
  assert.ok(validarAlumno({ ...Input, ancla: 0 }).ancla);
  assert.ok(validarAlumno({ ...Input, ancla: 32 }).ancla);
  assert.ok(validarAlumno({ ...Input, contacto: 'x'.repeat(121) }).contacto);
  assert.deepEqual(validarAlumno({ ...Input, contacto: '' }), {}, 'contacto vacío es opcional');
});

test('iniciales: 1–2 letras, sin acentos', () => {
  assert.equal(iniciales('Nora Pérez'), 'NP');
  assert.equal(iniciales('  ana  '), 'A');
  assert.equal(iniciales(''), '?');
});

/* --------------------------------------------------------------- alta */

test('alta: ID estable y único, fecha de alta local, contacto opcional', () => {
  let n = 0;
  const azar = () => (n++ * 0.37) % 1;
  const f1 = crearAlumno(Input, HOY, () => false, azar);
  const f2 = crearAlumno({ ...Input, nombre: 'Otro Alumno' }, HOY, (id) => id === f1.id, azar);
  assert.ok(esIdAlumno(f1.id), 'ID con prefijo al-');
  assert.notEqual(f1.id, f2.id);
  assert.equal(f1.fechaAlta, HOY);
  assert.equal(f1.nombre, 'Nora Pérez');
  assert.equal(f1.activo, true);
  assert.equal(f1.contacto, '');
  assert.equal(f1.ancla, 21, 'ancla por default');
  assert.ok(f1.color.startsWith('avatar'));
  assert.throws(() => crearAlumno({ ...Input, nombre: 'x' }, HOY, () => false, azar), /nombre/);
});

test('alta desde el repositorio: persiste y sobrevive un refresh (F5)', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  const antes = repo.listarAlumnos().length;
  const creada = repo.crearAlumno({ ...Input, contacto: '099 111 222' });
  assert.equal(repo.listarAlumnos().length, antes + 1);
  assert.equal(creada.contacto, '099 111 222');

  const { repo: reabierta } = abrir(almacen);
  const guardada = reabierta.listarAlumnos().find((a) => a.id === creada.id);
  assert.ok(guardada, 'la ficha sigue tras recargar');
  assert.equal(guardada!.nombre, 'Nora Pérez');
  assert.equal(guardada!.contacto, '099 111 222');
  assert.equal(guardada!.fechaAlta, HOY);
});

test('no se puede persistir: el repositorio lanza y no confirma el alta', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  assert.throws(() => repo.crearAlumno({ ...Input, nombre: 'x' }), /nombre/, 'validación antes de persistir');
  assert.equal(repo.listarAlumnos().some((a) => a.nombre === 'x'), false);
});

/* -------------------------------------------------------------- edición */

test('edición: conserva ID, alta, activo y color; cambia nombre/modalidad y preserva grupo', () => {
  const { repo } = abrir(almacenMemoria());
  const creada = repo.crearAlumno({ ...Input, grupo: 'Martes A' });
  const editada = repo.editarAlumno(creada.id, {
    nombre: 'Nora Pérez Ruiz', modalidad: 'individual', ancla: 8, contacto: '099 000 111',
  });
  assert.equal(editada.id, creada.id, 'ID estable');
  assert.equal(editada.fechaAlta, creada.fechaAlta, 'alta congelada');
  assert.equal(editada.activo, creada.activo);
  assert.equal(editada.color, creada.color);
  assert.equal(editada.nombre, 'Nora Pérez Ruiz');
  assert.equal(editada.modalidad, 'individual');
  assert.equal(editada.grupo, 'Martes A', 'grupo heredado se conserva, la UI no lo edita');
  assert.equal(editada.ancla, 8);
  assert.equal(editada.contacto, '099 000 111');
});

test('edición: rechaza datos inválidos sin tocar la ficha original', () => {
  const { repo } = abrir(almacenMemoria());
  const creada = repo.crearAlumno(Input);
  assert.throws(() => repo.editarAlumno(creada.id, { ...Input, nombre: '' }), /nombre/);
  assert.deepEqual(validarAlumno({ ...Input, grupo: 'Otro' }), {}, 'grupo arbitrario ya no se rechaza');
  assert.equal(repo.listarAlumnos().find((a) => a.id === creada.id)!.nombre, 'Nora Pérez');
  assert.throws(() => repo.editarAlumno('no-existe', Input), /No se encontró/);
});

test('editarAlumno puro: no muta el original', () => {
  const original = crearAlumno(Input, HOY, () => false);
  const copia = { ...original };
  const editada = editarAlumno(original, { ...Input, nombre: 'Otra Persona' });
  assert.equal(original.nombre, copia.nombre);
  assert.notEqual(editada.nombre, original.nombre);
});

/* --------------------------------------------------- preservación A/B */

test('preservación A/B: dar de alta no toca clases ni pagos existentes', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  const clasesAntes = structuredClone(repo.listar());
  const pago = { id: 'p-ab-1', alumnoId: 'a0', periodo: '2026-11', montoUYU: 6500, quien: 'dueño' };
  repo.registrarPago(pago);
  repo.anularPago(pago.id, 'Error de carga', 'dueño');
  const pagosAntes = structuredClone(repo.listarPagos());

  repo.crearAlumno(Input);
  assert.deepEqual(repo.listar(), clasesAntes, 'agenda/clases intactas');
  assert.deepEqual(repo.listarPagos(), pagosAntes, 'pagos y anulaciones intactos');
});

test('preservación A/B: migrar v1→v2 conserva clases, pagos y anulaciones', () => {
  // Estado guardado por A/B (versión 1): sin campo alumnos.
  const almacen = almacenMemoria();
  const { repo: v1 } = abrir(almacen);
  const clasesV1 = v1.listar();
  v1.registrarPago({ id: 'p-v1', alumnoId: 'a2', periodo: '2026-11', montoUYU: 6500, quien: 'dueño' });
  v1.anularPago('p-v1', 'Motivo v1', 'dueño');
  const pagosV1 = structuredClone(v1.listarPagos());

  // Simular el estado exacto que quedó en localStorage con la versión 1.
  const guardadoV1 = JSON.parse(almacen.leer()!) as Record<string, unknown>;
  guardadoV1.version = 1;
  delete guardadoV1.alumnos;
  almacen.escribir(JSON.stringify(guardadoV1));

  const { repo: migrada } = abrir(almacen);
  assert.equal(migrada.listar().length, clasesV1.length, 'mismas clases');
  assert.deepEqual(migrada.listarPagos(), pagosV1, 'pagos/anulación intactos');
  const trasMigrar = JSON.parse(almacen.leer()!) as Record<string, unknown>;
  assert.equal(trasMigrar.version, VERSION_ESTADO, 'versión migrada a v2');
  assert.ok(Array.isArray(trasMigrar.alumnos) && (trasMigrar.alumnos as unknown[]).length > 0, 'alumnos sembrados');
  assert.equal((trasMigrar.clases as unknown[]).length, clasesV1.length, 'clases no reescritas');
});

test('demo: todas las fichas sembradas pasan validación con el formulario sin grupo', () => {
  const { repo } = abrir(almacenMemoria());
  for (const f of repo.listarAlumnos()) {
    assert.deepEqual(
      validarAlumno({ nombre: f.nombre, modalidad: f.modalidad, contacto: f.contacto }),
      {},
      `ficha ${f.id} debe ser editable sin pasar grupo`,
    );
  }
});

test('preservación A/B: los pagos siguen vinculados por ID a la ficha demo', () => {
  const { repo } = abrir(almacenMemoria());
  repo.registrarPago({ id: 'p-vinculo', alumnoId: 'a2', periodo: '2026-11', montoUYU: 6500, quien: 'dueño' });
  const ficha = repo.listarAlumnos().find((a) => a.id === 'a2');
  assert.ok(ficha, 'existe la ficha con el ID del pago (no se unió por nombre)');
  assert.equal(ficha!.nombre, 'Julieta P.');
  assert.ok(repo.listarAlumnos().every((a) => esIdAlumno(a.id) || /^[ab]\d+$/.test(a.id)));
});

test('coherencia por ID: editar el nombre no rompe el vínculo del pago', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  repo.registrarPago({ id: 'p-nombre', alumnoId: 'a0', periodo: '2026-11', montoUYU: 6500, quien: 'dueño' });
  repo.editarAlumno('a0', { nombre: 'Carla Torres', modalidad: 'mensual' });
  const { repo: reabierta } = abrir(almacen);
  const pago = reabierta.listarPagos().find((p) => p.id === 'p-nombre')!;
  const nombreVigente = reabierta.listarAlumnos().find((a) => a.id === pago.alumnoId)?.nombre;
  assert.equal(pago.alumnoId, 'a0', 'el pago sigue apuntando al mismo ID');
  assert.equal(nombreVigente, 'Carla Torres', 'Cobros resuelve el nombre vigente por ID');
});

test('no resembrar sobre datos guardados: editar y recargar conserva el cambio', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  const primera = repo.listarAlumnos()[0]!;
  repo.editarAlumno(primera.id, { nombre: 'Nombre Cambiado', modalidad: 'individual' });
  const total = repo.listarAlumnos().length;
  const { repo: reabierta } = abrir(almacen);
  assert.equal(reabierta.listarAlumnos().length, total, 'no se duplicaron fichas');
  assert.equal(reabierta.listarAlumnos().find((a) => a.id === primera.id)!.nombre, 'Nombre Cambiado');
});

/* ------------------------------------------------- búsqueda / filtros / orden */

test('vista: búsqueda acento-insensible, filtros y orden sin mutar la lista', () => {
  const { repo } = abrir(almacenMemoria());
  const filas = construirVista(repo.listarAlumnos(), new Map(), HOY);
  const porNombre = filtrarYOrdenar(filas, 'julieta', new Set(), 'ninguno');
  assert.ok(porNombre.every((f) => f.nombre.toLowerCase().includes('julieta')));
  const mensuales = filtrarYOrdenar(filas, '', new Set(['mensual']), 'ninguno');
  assert.ok(mensuales.every((f) => f.modalidad === 'mensual'));
  const az = filtrarYOrdenar(filas, '', new Set(), 'az').map((f) => f.nombre);
  assert.deepEqual(az, [...az].sort((a, b) => a.localeCompare(b)));
  assert.equal(filas[0]!.nombre, repo.listarAlumnos()[0]!.nombre, 'original intacto');
});


/* ------------------------- regresiones informadas por Roma (20/11/2026) ------------------------- */

test('REGRESIÓN ancla: guardar la ficha a2 sin tocar nada conserva su ancla 26 (no la resetea a 21)', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  const a2 = repo.listarAlumnos().find((a) => a.id === 'a2')!;
  assert.equal(a2.ancla, 26, 'fixture a2 arranca con ancla 26');

  // Exactamente lo que envía el formulario al editar: nombre, modalidad y
  // contacto (ni ancla ni grupo: el formulario NO los expone).
  const inputComoLaUI = {
    nombre: a2.nombre, modalidad: a2.modalidad, contacto: a2.contacto,
  };
  const editada = repo.editarAlumno('a2', inputComoLaUI);
  assert.equal(editada.ancla, 26, 'el default 21 solo aplica al crear, no al editar');
  assert.equal(editada.contacto, a2.contacto, 'contacto no editado se conserva');

  // Persistencia tras recarga (F5): el ancla correcta sobrevive.
  const { repo: reabierta } = abrir(almacen);
  assert.equal(reabierta.listarAlumnos().find((a) => a.id === 'a2')!.ancla, 26);
  assert.equal(reabierta.listarAlumnos().find((a) => a.id === 'a2')!.contacto, a2.contacto);
});

test('REGRESIÓN ancla: los defaults (21 / contacto vacío) se aplican SOLO al crear', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  const creada = repo.crearAlumno({ nombre: 'Nueva Ficha', modalidad: 'mensual' });
  assert.equal(creada.ancla, 21, 'alta sin ancla usa el default');
  assert.equal(creada.contacto, '', 'alta sin contacto usa el default');

  // Una ficha con datos opcionales NO defaults se conservan al editar.
  const otra = repo.crearAlumno({ nombre: 'Con Datos', modalidad: 'individual', ancla: 7, contacto: '099 123' });
  const editada = repo.editarAlumno(otra.id, { nombre: 'Con Datos Edit', modalidad: 'individual' });
  assert.equal(editada.ancla, 7, 'ancla existente se conserva si el input no la trae');
  assert.equal(editada.contacto, '099 123', 'contacto existente se conserva si el input no lo trae');
});

test('REGRESIÓN al día: vence hoy (días=0) NO es "al día" y no lo oculta el chip', () => {
  const { repo } = abrir(almacenMemoria());
  const fichas = repo.listarAlumnos();
  // Mapa de Cobros: a3 vence hoy (0), a2 en 6 días, a10 vencido (-4); el resto sin entrada = al día.
  const mapa = new Map<string, number>([['a3', 0], ['a2', 6], ['a10', -4]]);
  const filas = construirVista(fichas, mapa, HOY);

  const hoyFila = filas.find((f) => f.id === 'a3')!;
  assert.equal(hoyFila.estadoVence, 'hoy');
  assert.equal(hoyFila.vence, 0);
  assert.equal(textoEstadoVence(hoyFila), 'vence hoy');
  assert.equal(puntoEstadoVence(hoyFila), 'punto-ambar');

  const alDia = filas.find((f) => f.id === 'a0')!; // sin entrada en el mapa
  assert.equal(alDia.estadoVence, 'aldia');
  assert.equal(alDia.vence, null);
  assert.equal(textoEstadoVence(alDia), 'al día');
  assert.equal(puntoEstadoVence(alDia), 'punto-verde');

  // El chip «Al día» debe mostrar SOLO los que no tienen deuda pendiente.
  const filtradas = filtrarYOrdenar(filas, '', new Set(['aldia']), 'ninguno');
  assert.ok(filtradas.every((f) => f.estadoVence === 'aldia'));
  assert.equal(filtradas.some((f) => f.id === 'a3'), false, 'vence hoy NO se oculta como al día');
  assert.equal(filtradas.some((f) => f.id === 'a2'), false, 'pendiente NO se oculta como al día');
  assert.equal(filtradas.some((f) => f.id === 'a10'), false, 'vencido NO se oculta como al día');
  assert.equal(filtradas.some((f) => f.id === 'a0'), true, 'al día SÍ se muestra con el chip');
});

test('REGRESIÓN al día: texto, punto y chip son coherentes para los cuatro estados', () => {
  const { repo } = abrir(almacenMemoria());
  const mapa = new Map<string, number>([['a3', 0], ['a2', 6], ['a10', -4]]);
  const filas = construirVista(repo.listarAlumnos(), mapa, HOY);
  const esperado: Record<string, { texto: string; punto: string }> = {
    a3: { texto: 'vence hoy', punto: 'punto-ambar' },
    a2: { texto: 'vence en 6 días', punto: 'punto-ambar' },
    a10: { texto: 'vencido', punto: 'punto-rosa' },
    a0: { texto: 'al día', punto: 'punto-verde' },
  };
  for (const [id, exp] of Object.entries(esperado)) {
    const f = filas.find((x) => x.id === id)!;
    assert.equal(textoEstadoVence(f), exp.texto, id);
    assert.equal(puntoEstadoVence(f), exp.punto, id);
  }
});

test('REGRESIÓN al día: alta nueva sin deuda aparece "al día" y sobrevive recarga', () => {
  const almacen = almacenMemoria();
  const { repo } = abrir(almacen);
  const creada = repo.crearAlumno({ nombre: 'Sin Deuda', modalidad: 'mensual' });
  const mapa = new Map<string, number>(); // nadie con deuda: la nueva no tiene tarifa en Cobros
  const fila = construirVista(repo.listarAlumnos(), mapa, HOY).find((f) => f.id === creada.id)!;
  assert.equal(fila.estadoVence, 'aldia');
  assert.equal(textoEstadoVence(fila), 'al día');

  const { repo: reabierta } = abrir(almacen);
  const trasF5 = reabierta.listarAlumnos().find((a) => a.id === creada.id)!;
  assert.equal(trasF5.nombre, 'Sin Deuda', 'la ficha nueva sigue tras recargar');
  assert.equal(trasF5.ancla, 21, 'Su ancla default se mantiene tras recarga');
});
