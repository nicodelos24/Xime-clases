import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { COLORES, normalizarFichaGuardada, colorPorId } from '../src/alumnos.ts';
import { normalizarPagoGuardado, registrarPago, resumenCobros } from '../src/cobros.ts';
import { almacenMemoria, RepositorioClases, type Almacen } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';

const payload = '"><img src=x onerror="window.__ximeXss=1">';
const almacenPagos = (pagos: unknown[], alumnos: unknown[] = [{ id: 'a1', nombre: 'Alumna', modalidad: 'mensual', fechaAlta: '2026-11-01', ancla: 1 }]) =>
  almacenMemoria(JSON.stringify({ version: 2, clases: [], alumnos, pagos, rutinas: [] }));
const abrirPagos = (pagos: unknown[]) =>
  new RepositorioClases(almacenPagos(pagos), relojFalso(Date.parse('2026-11-24T13:00:00Z')));

type VentanaPrueba = { document: { querySelector(selector: string): unknown } };
type DomPrueba = { window: VentanaPrueba };
type ConstructorDom = new (html: string) => DomPrueba;
const JSDOM: ConstructorDom = (createRequire(import.meta.url)('jsdom') as { JSDOM: ConstructorDom }).JSDOM;

const domDeAtributos = (ficha: NonNullable<ReturnType<typeof normalizarFichaGuardada>>) => new JSDOM(
  `<button data-ficha="${ficha.id}|2026-11" data-fila="${ficha.id}|2026-11">Abrir</button>`
  + `<input value="${ficha.id}">`
  + `<span class="avatar ${ficha.color}">${ficha.nombre.slice(0, 2)}</span>`,
);

test('SEG-01: los atributos de ID/color no crean nodos ni eventos inyectados', () => {
  const ficha = normalizarFichaGuardada({ id: payload, nombre: 'Alumna', fechaAlta: '2026-11-01', color: 'avatar' });
  assert.equal(ficha, null);
  const valida = normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', fechaAlta: '2026-11-01', color: 'avatar' })!;
  const dom = domDeAtributos(valida);
  assert.equal(dom.window.document.querySelector('img'), null, 'un ID/color válido no inyecta HTML');
  assert.equal(dom.window.document.querySelector('[onerror]'), null);
});

test('M-01: el color se restringe al allowlist sin cambiar un color válido', () => {
  assert.equal(normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color: payload })?.color, colorPorId('al-abcdefgh'));
  assert.equal(normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color: 'avatar-6' })?.color, 'avatar-6');
  for (const color of COLORES) assert.equal(normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color })?.color, color);
  const ficha = normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color: 'avatar-2' })!;
  const dom = domDeAtributos(ficha);
  assert.equal(dom.window.document.querySelector('img'), null);
  const fila = dom.window.document.querySelector('button')! as Element;
  assert.equal(fila.getAttribute('data-fila'), 'al-abcdefgh|2026-11');
  const input = dom.window.document.querySelector('input')! as Element;
  assert.equal(input.getAttribute('value'), 'al-abcdefgh');
  const avatar = dom.window.document.querySelector('.avatar')! as Element;
  assert.equal(avatar.className, 'avatar avatar-2');
});

test('SEG-01: una clase con ID inyectable se aísla sin borrar el historial válido', () => {
  const almacen = almacenMemoria(JSON.stringify({
    version: 2, alumnos: [{ id: 'a1', nombre: 'Alumna', fechaAlta: '2026-11-01' }], pagos: [], rutinas: [],
    clases: [
      { id: payload, nombre: 'Inyectada', fecha: '2026-11-24', minutos: 900, duracionMin: 60, alumnos: [], estado: 'programada' },
      { id: 'c-valida', nombre: 'Válida', fecha: '2026-11-24', minutos: 900, duracionMin: 60, alumnos: [], estado: 'programada' },
      { id: 'c1', nombre: 'Compacta', fecha: '2026-11-24', minutos: 900, duracionMin: 60, alumnos: [], estado: 'programada' },
    ],
  }));
  assert.deepEqual(new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z'))).listar().map((c) => c.id), ['c-valida', 'c1']);
});

test('M-01: una ficha corrupta no rompe la lectura ni falsea la ficha demo', () => {
  const repo = new RepositorioClases(
    almacenPagos([], [
      { id: payload, nombre: payload, fechaAlta: payload, color: payload },
      { id: 'a1', nombre: 'Alumna', modalidad: 'mensual', fechaAlta: '2026-11-01', ancla: 1 },
    ]),
    relojFalso(Date.parse('2026-11-24T13:00:00Z')),
  );
  assert.deepEqual(repo.listarAlumnos().map((a) => a.id), ['a1']);
});

test('M-02: pagos inválidos se omiten sin tocar el almacén ni falsear deuda o KPI', () => {
  const validos = [
    { id: 'p-vigente', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime', anulado: null },
    { id: 'p-anulado', alumnoId: 'a1', periodo: '2026-10', montoUYU: 1, fecha: '2026-11-20', quien: 'Xime', anulado: { fecha: '2026-11-24', motivo: 'Error', quien: 'Xime' } },
  ];
  const malos = [
    { id: 'p-monto', alumnoId: 'a1', periodo: '2026-10', montoUYU: '<img src=x onerror=alert(1)>', fecha: '2026-11-24', quien: 'Xime', anulado: null },
    { id: 'p-fecha', alumnoId: 'a1', periodo: '2026-10', montoUYU: 1, fecha: 'no-fecha', quien: 'Xime', anulado: null },
  ];
  const almacen = almacenPagos([...malos, ...validos]);
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  assert.deepEqual(repo.listarPagos(), validos);
  const resumen = resumenCobros([{ id: 'a1', nombre: 'Alumna', grupo: 'G', ancla: 1, montoUYU: 6500 }], repo.listarPagos(), '2026-11-24');
  assert.equal(resumen.cobradoHoy, 6500);
  assert.equal(resumen.cobradoMes, 6500);
  assert.equal(resumen.porCobrar, 6500);
  assert.equal(resumen.filas.find((f) => f.periodo === '2026-10')?.pago?.id, 'p-vigente');
  assert.deepEqual(JSON.parse(almacen.leer()!).pagos, [...malos, ...validos], 'leer no reescribe ni destruye evidencia');
});

test('M-02: un pago corrupto queda como deuda pendiente, no como pagado', () => {
  const pagoMalo = { id: 'p-malo', alumnoId: 'a1', periodo: '2026-10', montoUYU: '6500', fecha: '2026-11-24', quien: {}, anulado: null };
  const pagos = abrirPagos([pagoMalo]).listarPagos();
  assert.deepEqual(pagos, []);
  const resumen = resumenCobros([{ id: 'a1', nombre: 'Alumna', grupo: 'G', ancla: 1, montoUYU: 6500 }], pagos, '2026-11-24');
  assert.equal(resumen.cobradoHoy, 0);
  assert.equal(resumen.cobradoMes, 0);
  assert.equal(resumen.porCobrar, 13000);
  assert.equal(resumen.filas.find((f) => f.periodo === '2026-10')?.pago, undefined);
});

test('M-02: un pago inválido no bloquea registrar el pago legítimo del período', () => {
  const repo = abrirPagos([
    { id: 'p-malo', alumnoId: 'a1', periodo: '2026-10', montoUYU: -1, fecha: '2026-11-24', quien: 'Xime', anulado: null },
  ]);
  repo.registrarPago({ id: 'p-bueno', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime' });
  assert.deepEqual(repo.listarPagos().map((p) => p.id), ['p-bueno']);
});

test('M-02: un ID duplicado no duplica el cobro en KPI', () => {
  const pago = { id: 'p-dup', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime', anulado: null };
  const repo = abrirPagos([pago, { ...pago }]);
  assert.deepEqual(repo.listarPagos(), [pago]);
  const resumen = resumenCobros([{ id: 'a1', nombre: 'Alumna', grupo: 'G', ancla: 1, montoUYU: 6500 }], repo.listarPagos(), '2026-11-24');
  assert.equal(resumen.cobradoHoy, 6500);
  assert.equal(resumen.cobradoMes, 6500);
});

test('M-02: el historial conserva pagos y anulaciones válidas al normalizar', () => {
  const pagos = [
    { id: 'p1', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-20', quien: ' Xime ', anulado: null },
    { id: 'p2', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6200, fecha: '2026-11-24', quien: 'Xime', anulado: { fecha: '2026-11-24', motivo: ' Error ', quien: ' Xime ' } },
  ];
  assert.deepEqual(abrirPagos(pagos).listarPagos(), [
    { ...pagos[0], quien: 'Xime' },
    { ...pagos[1], anulado: { fecha: '2026-11-24', motivo: 'Error', quien: 'Xime' } },
  ]);
});

test('SEG-02: cada pago corrupto se aísla sin descartar los válidos', () => {
  const valido = { id: 'p-ok', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime', anulado: null };
  const corruptos: unknown[] = [
    null, [], {},
    { ...valido, id: '' }, { ...valido, alumnoId: '' }, { ...valido, quien: '' },
    { ...valido, periodo: '2026-13' }, { ...valido, fecha: '2026-02-30' },
    { ...valido, montoUYU: 0 }, { ...valido, montoUYU: -1 }, { ...valido, montoUYU: 1.5 },
    { ...valido, montoUYU: Number.MAX_SAFE_INTEGER + 1 },
    { ...valido, anulado: { fecha: '2026-11-23', motivo: 'Error', quien: 'Xime' } },
    { ...valido, anulado: { fecha: '2026-11-24', motivo: '', quien: 'Xime' } },
  ];
  assert.deepEqual(abrirPagos([...corruptos, valido]).listarPagos(), [valido]);
  const base = { id: ' p-ok ', alumnoId: ' a1 ', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: ' Xime ' };
  const normalizado = normalizarPagoGuardado(base)!;
  assert.deepEqual(registrarPago([], base), [normalizado], 'registrarPago aplica el mismo normalizador que la lectura');
  assert.throws(() => registrarPago([normalizado], base), /ya está registrado/);
});

test('SEG-03: si también falla revertir el principal, sí deja el cambio persistido', () => {
  const original = JSON.stringify({ version: 2, clases: [], alumnos: [], pagos: [], rutinas: [] });
  let escrituras = 0;
  let principal: string | null = original;
  const almacen: Almacen = {
    leer: () => principal,
    escribir: (texto) => {
      escrituras += 1;
      if (escrituras === 2) throw new Error('compensación llena');
      principal = texto;
    },
    leerRutinas: () => '[]',
    escribirRutinas: () => { throw new Error('respaldo lleno'); },
  };
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  repo.listar();
  escrituras = 0;
  assert.throws(() => repo.crearAlumno({ nombre: 'Tercera', modalidad: 'mensual' }), /respaldo lleno/);
  assert.equal(escrituras, 2);
  assert.equal(JSON.parse(principal!).alumnos.length, 1, 'sin compensación posible queda el principal nuevo');
  assert.deepEqual(repo.listarAlumnos().map((a) => a.nombre), ['Tercera']);
});

test('SEG-03: si falla el respaldo, revierte principal y respaldo y no confirma el alta', () => {
  const original = JSON.stringify({ version: 2, clases: [], alumnos: [], pagos: [], rutinas: [] });
  const respaldoOriginal = '[{"id":"rut-anterior","nombre":"Anterior","dias":[0],"desde":"2026-11-02","hora":"10:00"}]';
  let respaldo = respaldoOriginal;
  let principal: string | null = original;
  let fallarRespaldo = false;
  let fallarCompensacion = false;
  let escrituraNueva = true;
  let permitirRespaldo = true;
  const almacen: Almacen = {
    leer: () => principal,
    escribir: (texto) => {
      const compensando = !escrituraNueva;
      escrituraNueva = false;
      if (compensando && fallarCompensacion) throw new Error('compensación llena');
      principal = texto || null;
    },
    leerRutinas: () => respaldo,
    escribirRutinas: (texto) => {
      if (!permitirRespaldo || fallarRespaldo) throw new Error('respaldo lleno');
      respaldo = texto;
    },
  };
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  repo.listar();
  fallarRespaldo = true;
  assert.throws(() => repo.crearAlumno({ nombre: 'Otra', modalidad: 'mensual' }), /respaldo lleno/);
  assert.equal(principal, original, 'el estado principal vuelve exactamente al previo');
  assert.equal(respaldo, respaldoOriginal);
  assert.deepEqual(repo.listarAlumnos(), []);
  fallarRespaldo = false;
  escrituraNueva = true;
  repo.crearAlumno({ nombre: 'Otra', modalidad: 'mensual' });
  assert.deepEqual(repo.listarAlumnos().map((a) => a.nombre), ['Otra']);
  fallarCompensacion = true;
  fallarRespaldo = true;
  escrituraNueva = true;
  assert.throws(() => repo.crearAlumno({ nombre: 'Tercera', modalidad: 'mensual' }), /respaldo lleno/);
  assert.equal(JSON.parse(principal!).alumnos.length, 2, 'límite explícito: si también falla revertir, persiste el principal nuevo');
  assert.deepEqual(repo.listarAlumnos().map((a) => a.nombre), ['Otra', 'Tercera'], 'una relectura ve el principal persistido, no un éxito inventado');
});

test('SEG-03: una siembra con respaldo fallido deja el almacén vacío', () => {
  let principal: string | null = null;
  const respaldoOriginal = '[]';
  let respaldo = respaldoOriginal;
  let permitirRespaldo = false;
  const almacen: Almacen = {
    leer: () => principal,
    escribir: (texto) => { principal = texto || null; },
    leerRutinas: () => respaldo,
    escribirRutinas: (texto) => {
      if (!permitirRespaldo) throw new Error('respaldo lleno');
      respaldo = texto;
    },
  };
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  assert.throws(() => repo.listarAlumnos(), /respaldo lleno/);
  assert.equal(principal, null);
  assert.equal(respaldo, respaldoOriginal);
});
