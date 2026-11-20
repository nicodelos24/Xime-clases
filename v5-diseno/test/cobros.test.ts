import assert from 'node:assert/strict';
import { test } from 'node:test';
import { anularPago, registrarPago, resumenCobros, vencimientoDelMes, type PagoNuevo } from '../src/cobros.ts';
import { alumnosCobrosDemo, datosDemo } from '../src/demo.ts';
import { hoyLocal, relojFalso } from '../src/reloj.ts';
import { almacenLocalStorage, almacenMemoria, RepositorioClases, VERSION_ESTADO } from '../src/repositorio.ts';

const nuevo: PagoNuevo = { id: 'p1', alumnoId: 'a0', periodo: '2026-11', montoUYU: 6500, fecha: '2026-11-20', quien: 'dueña-a' };
const anulacion = { fecha: '2026-11-21', motivo: ' Importe equivocado ', quien: 'dueño-b' };

function verificarTotales(r: ReturnType<typeof resumenCobros>) {
  assert.equal(r.porCobrar, r.filas.reduce((total, f) => total + (f.pago ? 0 : f.alumno.montoUYU), 0));
  assert.equal(r.vencenHoy.length, r.filas.filter((f) => !f.pago && f.dias === 0).length);
}

test('registro, anulación y segundo registro conservan importe y actores del original', () => {
  const pagos = registrarPago([], nuevo);
  const anulados = anularPago(pagos, nuevo.id, anulacion);
  const ambos = registrarPago(anulados, { ...nuevo, id: 'p2', montoUYU: 6200 });
  assert.deepEqual(pagos, [{ ...nuevo, anulado: null }]);
  assert.deepEqual(ambos, [
    { ...nuevo, anulado: { ...anulacion, motivo: 'Importe equivocado' } },
    { ...nuevo, id: 'p2', montoUYU: 6200, anulado: null },
  ]);
  assert.throws(() => anularPago(ambos, nuevo.id, anulacion), /ya está anulado/);
});

test('rechaza dobles cobros activos, montos inválidos y anulaciones sin motivo o anteriores', () => {
  const pagos = registrarPago([], nuevo);
  assert.throws(() => registrarPago(pagos, nuevo), /ya está registrado/);
  assert.throws(() => registrarPago(pagos, { ...nuevo, id: 'otro' }), /pago activo/);
  for (const montoUYU of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => registrarPago([], { ...nuevo, montoUYU }), /entero positivo/);
  }
  assert.throws(() => registrarPago([], { ...nuevo, periodo: '2026-13' }), /inválido/);
  assert.throws(() => registrarPago([], { ...nuevo, fecha: '2026-02-29' }), /inválido/);
  assert.throws(() => anularPago(pagos, nuevo.id, { ...anulacion, motivo: ' ' }), /motivo/);
  assert.throws(() => anularPago(pagos, nuevo.id, { ...anulacion, fecha: '2026-11-19' }), /inválida/);
});

test('vencimiento es el último día cubierto: mes corto, bisiesto, vuelta al ancla y ancla 1', () => {
  assert.equal(vencimientoDelMes('2027-02', 31), '2027-02-27');
  assert.equal(vencimientoDelMes('2028-02', 31), '2028-02-28');
  assert.equal(vencimientoDelMes('2028-03', 31), '2028-03-30');
  assert.equal(vencimientoDelMes('2028-02', 1), '2028-02-29');
});

test('KPI, filas y avisos coinciden al pagar y al volver a vencer tras anular', () => {
  const horario = relojFalso(Date.parse('2026-11-21T02:59:59Z'));
  const hoy = hoyLocal(horario.ahora());
  const impagos = resumenCobros(alumnosCobrosDemo, [], hoy);
  assert.equal(impagos.vencenHoy.length, 2);
  assert.equal(impagos.cobradoHoy, 0);
  verificarTotales(impagos);
  const pagos = registrarPago([], nuevo);
  const pagados = resumenCobros(alumnosCobrosDemo, pagos, hoy);
  assert.equal(pagados.vencenHoy.length, 1);
  assert.equal(pagados.cobradoHoy, 6500);
  assert.equal(pagados.cobradoMes, 6500);
  assert.equal(pagados.avisos.some((f) => f.alumno.id === nuevo.alumnoId), false);
  verificarTotales(pagados);
  const anulados = anularPago(pagos, nuevo.id, { ...anulacion, fecha: hoy });
  assert.deepEqual(resumenCobros(alumnosCobrosDemo, anulados, hoy), impagos);
  horario.avanzar(1000);
  const manana = resumenCobros(alumnosCobrosDemo, anulados, hoyLocal(horario.ahora()));
  assert.equal(manana.filas.find((f) => f.alumno.id === nuevo.alumnoId)?.dias, -1);
});

test('avisos hoy, a 7 y a 10 días, incluido el cambio de mes y de año', () => {
  const alumno = { id: 'uno', nombre: 'Demo', grupo: 'Grupo', ancla: 5, montoUYU: 6500 };
  const r = (hoy: string, n: 0 | 7 | 10) => resumenCobros([alumno], [], hoy, n);
  assert.equal(r('2026-12-25', 7).avisos.length, 0);
  assert.equal(r('2026-12-25', 10).avisos[0]?.fecha, '2027-01-04');
  assert.equal(r('2026-12-28', 7).avisos[0]?.dias, 7);
  assert.equal(r('2027-01-03', 0).avisos.length, 0);
  assert.equal(r('2027-01-04', 0).avisos[0]?.dias, 0);
  assert.equal(r('2027-01-05', 10).avisos.length, 0);
});

test('persistencia: lee el formato de Pieza A, conserva clases/pagos entre dos instancias y tras recargar', () => {
  const reloj = relojFalso(Date.parse('2026-11-21T02:59:59Z'));
  const clases = datosDemo(reloj.ahora());
  const almacen = almacenMemoria(JSON.stringify({ version: 1, guardadoEn: '', clases, pagos: [] }));
  const primera = new RepositorioClases(almacen, reloj);
  const segunda = new RepositorioClases(almacen, reloj);
  assert.deepEqual(primera.listarPagos(), []);
  assert.equal(segunda.listar().length, clases.length);
  primera.registrarPago(nuevo);
  segunda.cancelar('c-sab', { motivo: 'Demo', quien: 'dueño-b', ahora: reloj.ahora() });
  const recargada = new RepositorioClases(almacen, reloj);
  assert.equal(recargada.listar().find((c) => c.id === 'c-sab')?.estado, 'cancelada');
  assert.deepEqual(recargada.listarPagos(), [{ ...nuevo, anulado: null }]);
  reloj.avanzar(1000);
  recargada.anularPago(nuevo.id, anulacion.motivo, anulacion.quien);
  assert.deepEqual(new RepositorioClases(almacen, reloj).listarPagos(), anularPago([{ ...nuevo, anulado: null }], nuevo.id, anulacion));
  assert.equal(JSON.parse(almacen.leer()!).version, VERSION_ESTADO);
});

test('si el navegador no puede guardar no confirma el pago ni modifica el ledger', () => {
  let valor: string | null = null;
  let lleno = false;
  const ventana = { localStorage: {
    getItem: () => valor,
    setItem: (_clave: string, texto: string) => { if (lleno) throw new Error('Cuota llena'); valor = texto; },
  } };
  const repo = new RepositorioClases(almacenLocalStorage(ventana), relojFalso(Date.parse(`${nuevo.fecha}T12:00Z`)));
  repo.listar();
  lleno = true;
  assert.throws(() => repo.registrarPago(nuevo), /No se pudo guardar/);
  assert.deepEqual(repo.listarPagos(), []);
  lleno = false;
  repo.registrarPago(nuevo);
  lleno = true;
  assert.throws(() => repo.anularPago(nuevo.id, anulacion.motivo, anulacion.quien), /No se pudo guardar/);
  assert.equal(repo.listarPagos()[0]?.anulado, null);
});
