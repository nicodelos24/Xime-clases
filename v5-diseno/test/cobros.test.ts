import assert from 'node:assert/strict';
import { test } from 'node:test';
import { anularPago, corregirFechaPago, registrarPago, resumenCobros, vencimientoDelMes, filtrarCobros, ordenarCobros, cobrosIndividuales, type EstadoCobro, type OrdenCobro, type PagoNuevo } from '../src/cobros.ts';
import { alumnosCobrosDemo, datosDemo } from '../src/demo.ts';
import { hoyLocal, relojFalso } from '../src/reloj.ts';
import { almacenLocalStorage, almacenMemoria, RepositorioClases, VERSION_ESTADO } from '../src/repositorio.ts';
import { precio } from '../src/tarifas.ts';
import { construirVista } from '../src/alumnos.ts';
import type { Clase } from '../src/clases.ts';

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

test('corrección de fecha (#4): mismo ID y alumno, fecha corregida y auditoría', () => {
  const pagos = registrarPago([], nuevo);
  const corregidos = corregirFechaPago(pagos, nuevo.id, '2026-11-23', 'Corrección de fecha', 'dueña-b', '2026-11-24');
  assert.equal(corregidos.length, 1, 'no se crea un pago nuevo');
  assert.equal(corregidos[0]!.id, nuevo.id, 'ID estable');
  assert.equal(corregidos[0]!.alumnoId, nuevo.alumnoId, 'vinculado al mismo alumno');
  assert.equal(corregidos[0]!.fecha, '2026-11-23');
  assert.deepEqual(corregidos[0]!.anulado, { fecha: '2026-11-24', motivo: 'Corrección de fecha', quien: 'dueña-b' });
  assert.throws(() => corregirFechaPago(pagos, nuevo.id, '2026-02-30', 'x', 'y', '2026-11-24'), /inválida/);
  assert.throws(() => corregirFechaPago(pagos, 'no-existe', '2026-11-23', 'x', 'y', '2026-11-24'), /encontró/);
  assert.deepEqual(corregirFechaPago(pagos, nuevo.id, nuevo.fecha, 'x', 'y', '2026-11-24'), pagos, 'misma fecha no cambia nada');
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

const ALTA = '2026-11-24';

/* Cobro individual: primero la clase efectiva; reservar/cancelar/futura no crea deuda. */
const alumnaIndividual = { id: 'al-individual000', nombre: 'Alumna Individual', grupo: 'Individual', ancla: 21, montoUYU: 2750, tarifaUYU: 2750, individual: true };
const claseIndividual = (id: string, fecha: string, estado: Clase['estado']): Clase => ({
  id, nombre: 'Clase individual', fecha, minutos: 600, duracionMin: 60, estado,
  alumnos: [{ id: alumnaIndividual.id, nombre: alumnaIndividual.nombre, telefono: '' }],
  eventos: [], marcadaEn: null, cancelacion: null,
});

test('individual: reserva, clase futura y cancelada no generan deuda; una clase dada sí', () => {
  const clases = [
    claseIndividual('c-reservada', '2026-11-24', 'programada'),
    claseIndividual('c-futura', '2026-11-30', 'dada'),
    claseIndividual('c-cancelada', '2026-11-23', 'cancelada'),
    claseIndividual('c-dada', '2026-11-20', 'dada'),
  ];
  assert.equal(precio(alumnaIndividual, 'clase-individual', ALTA), 2750);
  assert.deepEqual(resumenCobros([alumnaIndividual], [], ALTA), resumenCobros([], [], ALTA));
  const pendientes = cobrosIndividuales([alumnaIndividual], [], clases, ALTA);
  assert.deepEqual(pendientes.map((f) => f.clase.id), ['c-dada']);
  assert.equal(pendientes[0]?.pago, undefined);
});

test('individual: se cobra una vez por alumno+clase, no una vez por mes', () => {
  const clases = [claseIndividual('c-1', '2026-11-20', 'dada'), claseIndividual('c-2', '2026-11-22', 'dada')];
  const pagos = registrarPago([], { id: 'p-c1', alumnoId: alumnaIndividual.id, periodo: '2026-11', montoUYU: 2750, fecha: ALTA, quien: 'prueba', concepto: 'clase-individual', claseId: 'c-1' });
  const segundo = registrarPago(pagos, { id: 'p-c2', alumnoId: alumnaIndividual.id, periodo: '2026-11', montoUYU: 3000, fecha: ALTA, quien: 'prueba', concepto: 'clase-individual', claseId: 'c-2' });
  assert.equal(segundo.length, 2);
  assert.throws(() => registrarPago(segundo, { id: 'p-dup', alumnoId: alumnaIndividual.id, periodo: '2026-11', montoUYU: 2750, fecha: ALTA, quien: 'prueba', concepto: 'clase-individual', claseId: 'c-1' }), /esta clase/);
  assert.deepEqual(cobrosIndividuales([alumnaIndividual], segundo, clases, ALTA).map((f) => f.pago?.id), ['p-c1', 'p-c2']);
  assert.equal(resumenCobros([alumnaIndividual], segundo, ALTA).filas.length, 0, 'las clases no se convierten en mensualidad');
});

test('individual: corregir la tarifa al cobrar no cambia el importe de un pago histórico', () => {
  const pagos = registrarPago([], { id: 'p-viejo', alumnoId: alumnaIndividual.id, periodo: '2026-11', montoUYU: 2750, fecha: '2026-11-20', quien: 'prueba', concepto: 'clase-individual', claseId: 'c-1' });
  const nuevaTarifa = { ...alumnaIndividual, tarifaUYU: 3200, montoUYU: 3200 };
  const ficha = { ...alumnaIndividual, tarifaUYU: 3200 };
  assert.equal(precio(nuevaTarifa, 'clase-individual', ALTA), 3200);
  assert.equal(pagos[0]?.montoUYU, 2750);
  const nuevoPago = registrarPago([], { id: 'p-nuevo', alumnoId: alumnaIndividual.id, periodo: '2026-11', montoUYU: precio(ficha, 'clase-individual', ALTA)!, fecha: ALTA, quien: 'prueba', concepto: 'clase-individual', claseId: 'c-2' });
  assert.equal(nuevoPago[0]?.montoUYU, 3200);
});

test('individual: recarga conserva concepto/claseId y pago histórico sin concepto sigue siendo mensualidad', () => {
  const clases = [claseIndividual('c-1', '2026-11-20', 'dada')];
  const guardado = {
    version: 3, guardadoEn: '', clases, alumnos: [], pagos: [
      { id: 'p-ind', alumnoId: alumnaIndividual.id, periodo: '2026-11', montoUYU: 2750, fecha: ALTA, quien: 'prueba', concepto: 'clase-individual', claseId: 'c-1' },
      { id: 'p-mes', alumnoId: 'al-mensual00000', periodo: '2026-10', montoUYU: 6500, fecha: ALTA, quien: 'prueba' },
    ],
  };
  const repo = new RepositorioClases(almacenMemoria(JSON.stringify(guardado)), relojFalso(Date.parse(`${ALTA}T12:00:00Z`)));
  const pagos = repo.listarPagos();
  assert.equal(pagos.find((p) => p.id === 'p-ind')?.concepto, 'clase-individual');
  assert.equal(pagos.find((p) => p.id === 'p-ind')?.claseId, 'c-1');
  assert.equal(pagos.find((p) => p.id === 'p-mes')?.concepto, undefined, 'no se agrega concepto a pagos históricos');
  assert.equal(pagos.find((p) => p.id === 'p-mes')?.montoUYU, 6500);
});


type FilaPrueba = { dias: number; pago: { id: string } | null; alumno: { nombre: string; montoUYU: number } };
const fila = (dias: number, nombre: string, pago = false): FilaPrueba => ({
  dias, pago: pago ? { id: 'p' } : null, alumno: { nombre, montoUYU: 6500 },
});
const datos: FilaPrueba[] = [
  fila(-13, 'Carla vencida'), fila(-1, 'Beto ayer'), fila(0, 'Ana hoy'),
  fila(3, 'Diego pronto'), fila(9, 'Eva lejos'), fila(0, 'Zuni pagada', true),
];

test('filtro Cobros: todos devuelve todo; deben = vencidos+hoy+por vencer (7 días)', () => {
  assert.equal(filtrarCobros(datos, 'todos' as EstadoCobro).length, 6);
  const deben = filtrarCobros(datos, 'deben' as EstadoCobro);
  assert.deepEqual(deben.map((f) => f.alumno.nombre), ['Carla vencida', 'Beto ayer', 'Ana hoy', 'Diego pronto']);
  assert.ok(filtrarCobros(datos, 'deben' as EstadoCobro).every((f) => !f.pago), 'pagadas fuera');
  const vencido = filtrarCobros(datos, 'vencido' as EstadoCobro);
  assert.deepEqual(vencido.map((f) => f.dias), [-13, -1]);
  const porvencer = filtrarCobros(datos, 'porvencer' as EstadoCobro);
  assert.deepEqual(porvencer.map((f) => f.dias), [0, 3]);
  const pagado = filtrarCobros(datos, 'pagado' as EstadoCobro);
  assert.deepEqual(pagado.map((f) => f.alumno.nombre), ['Zuni pagada']);
  // Con diasAviso 0, «por vencer» es solo lo que vence hoy.
  assert.deepEqual(filtrarCobros(datos, 'porvencer' as EstadoCobro, 0).map((f) => f.dias), [0]);
});

test('filtro Cobros no muta la lista original y «deben» con aviso 7 coincide con la ventana de la campana', () => {
  const original = [...datos];
  filtrarCobros(datos, 'deben' as EstadoCobro);
  filtrarCobros(datos, 'vencido' as EstadoCobro);
  ordenarCobros(datos, 'alumno' as OrdenCobro);
  assert.deepEqual(datos, original);
});

test('forma de pago define la deuda: por clase no genera mensualidad y viceversa', () => {
  const mensual = { ...alumnaIndividual, id: 'al-mensual000', individual: false, formaPago: 'mensual-fijo' } as const;
  const porClase = { ...alumnaIndividual, formaPago: 'por-clase' } as const;
  const vencimientos = new Map([['al-mensual000', 3], [porClase.id, 3]]);
  const deudasClase = new Map([[porClase.id, { clases: 2, montoUYU: 5500, sinTarifa: false }]]);
  const vistas = construirVista([mensual, porClase] as never[], vencimientos, ALTA, new Map(), deudasClase);
  assert.equal(vistas[0]!.estadoVence, 'pendiente', 'mensual fijo sigue cobrando por mes aunque sea individual');
  assert.equal(vistas[0]!.vence, 3);
  assert.equal(vistas[1]!.estadoVence, 'vencido', 'por clase cobra las clases dadas, no el vencimiento mensual');
  assert.equal(vistas[1]!.vence, null);
  assert.equal(vistas[1]!.deudaIndividual?.clases, 2);
  // La vista de Cobros excluye las mensualidades de quien paga por clase.
  const alumnos = [
    { id: porClase.id, nombre: porClase.nombre, grupo: '', ancla: 21, montoUYU: 2500, individual: true },
    { id: 'al-mensual000', nombre: 'Mensual', grupo: '', ancla: 21, montoUYU: 2500, individual: false },
  ];
  const filas = resumenCobros(alumnos, [], ALTA).filas;
  assert.deepEqual(filas.map((f) => f.alumno.id), ['al-mensual000']);
});

test('orden Cobros: vencimiento (vencidos primero, luego por días) o alumno (A→Z)', () => {
  const porVence = ordenarCobros(datos, 'vencimiento' as OrdenCobro);
  // Vencidos primero (más atrasado arriba), luego hoy, luego por días; una
  // fila pagada de hoy queda entre las de hoy: el orden no depende del pago.
  assert.deepEqual(porVence.map((f) => f.alumno.nombre), ['Beto ayer', 'Carla vencida', 'Ana hoy', 'Zuni pagada', 'Diego pronto', 'Eva lejos']);
  const porAlumno = ordenarCobros(datos, 'alumno' as OrdenCobro);
  assert.deepEqual(porAlumno.map((f) => f.alumno.nombre), ['Ana hoy', 'Beto ayer', 'Carla vencida', 'Diego pronto', 'Eva lejos', 'Zuni pagada']);
});
