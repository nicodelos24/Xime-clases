import assert from 'node:assert/strict';
import { test } from 'node:test';
import { anularPago, registrarPago, resumenCobros, vencimientoDelMes, type PagoNuevo } from '../src/cobros.ts';
import { alumnosCobrosDemo, datosDemo } from '../src/demo.ts';
import { hoyLocal, relojFalso } from '../src/reloj.ts';
import { almacenLocalStorage, almacenMemoria, RepositorioClases, VERSION_ESTADO } from '../src/repositorio.ts';

// Con la regla del mismo día del mes siguiente, la mensualidad del período
// 2026-11 vence el 21-dic-2026 (ancla de a0 = 21).
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

test('vencimiento = mismo día del mes siguiente (1-feb→1-mar, 1-may→1-jun), con clamp al último día', () => {
  // Regla confirmada con la clienta 22-nov-2026: el día se conserva, no se
  // resta un día como en el PLAN v1. Casos literales pedidos por Nico:
  assert.equal(vencimientoDelMes('2026-02', 1), '2026-03-01');
  assert.equal(vencimientoDelMes('2026-05', 1), '2026-06-01');
  assert.equal(vencimientoDelMes('2027-02', 1), '2027-03-01');
  // Día inexistente en el mes destino → clamp al último día del mes destino.
  assert.equal(vencimientoDelMes('2027-01', 31), '2027-02-28');
  assert.equal(vencimientoDelMes('2028-01', 31), '2028-02-29');
  assert.equal(vencimientoDelMes('2026-04', 31), '2026-05-31');
  assert.equal(vencimientoDelMes('2026-01', 30), '2026-02-28');
  // Vuelta al ancla y cruce de año: el mes de referencia manda, no el de cobro.
  assert.equal(vencimientoDelMes('2026-12', 21), '2027-01-21');
  assert.equal(vencimientoDelMes('2028-02', 1), '2028-03-01');
  assert.throws(() => vencimientoDelMes('2026-11', 0), /ancla/i);
  assert.throws(() => vencimientoDelMes('2026-11', 32), /ancla/i);
});

test('KPI, filas y avisos coinciden al pagar y al volver a vencer tras anular', () => {
  // Hoy = 21-nov: con vencimiento = mismo día del mes siguiente, vencen las
  // mensualidades de octubre con ancla 21 (a0 y a1; 21-oct → 21-nov).
  const horario = relojFalso(Date.parse('2026-11-21T03:00:00Z')); // media noche en Montevideo
  const hoy = hoyLocal(horario.ahora()); // "2026-11-21" en America/Montevideo
  const impagos = resumenCobros(alumnosCobrosDemo, [], hoy);
  assert.equal(impagos.vencenHoy.length, 2, `hoy=${hoy}`);
  assert.equal(impagos.cobradoHoy, 0);
  verificarTotales(impagos);
  // Pago del 21-nov: se liquida la mensualidad de OCTUBRE (ancla 21 → vence
  // 21-nov), por eso el período del pago es 2026-10 aunque se pague en nov.
  // `Pago.periodo` identifica el vencimiento, no el mes en que se paga.
  const pagoHoy = { ...nuevo, id: 'p-hoy', alumnoId: 'a0', periodo: '2026-10', fecha: hoy };
  const pagos = registrarPago([], pagoHoy);
  const pagados = resumenCobros(alumnosCobrosDemo, pagos, hoy);
  assert.equal(pagados.vencenHoy.length, 1); // a0 pagó; a1 queda pendiente
  assert.equal(pagados.cobradoHoy, 6500);
  assert.equal(pagados.cobradoMes, 6500);
  assert.ok(pagados.filas.some((f) => f.pago?.id === pagoHoy.id && f.periodo === '2026-10' && f.fecha === hoy));
  verificarTotales(pagados);
  const anulados = anularPago(pagos, pagoHoy.id, { ...anulacion, fecha: hoy });
  assert.deepEqual(resumenCobros(alumnosCobrosDemo, anulados, hoy), impagos);
  // Al día siguiente la deuda impaga de a3 queda 1 día atrasada.
  horario.avanzar(24 * 60 * 60 * 1000);
  const manana = resumenCobros(alumnosCobrosDemo, anulados, hoyLocal(horario.ahora()));
  assert.equal(manana.filas.find((f) => f.alumno.id === 'a3' && f.periodo === '2026-10')?.dias, -2);
});

test('avisos hoy, a 7 y a 10 días, incluido el cambio de mes y de año', () => {
  // Ancla 5: la mensualidad de noviembre vence el 5-dic; la de diciembre, el 5-ene.
  const alumno = { id: 'uno', nombre: 'Demo', grupo: 'Grupo', ancla: 5, montoUYU: 6500 };
  const r = (hoy: string, n: 0 | 7 | 10) => resumenCobros([alumno], [], hoy, n);
  assert.equal(r('2026-12-25', 7).avisos.length, 0);
  assert.equal(r('2026-12-28', 10).avisos[0]?.fecha, '2027-01-05');
  assert.equal(r('2026-12-29', 7).avisos[0]?.dias, 7);
  assert.equal(r('2027-01-04', 0).avisos.length, 0);
  assert.equal(r('2027-01-05', 0).avisos[0]?.dias, 0);
  assert.equal(r('2027-01-06', 10).avisos.length, 0);
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
