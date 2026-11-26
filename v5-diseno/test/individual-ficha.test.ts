/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { crearAlumno, type AlumnoFicha } from '../src/alumnos.ts';
import { cobrosIndividuales, deudaIndividual, resumenCobros, type Pago } from '../src/cobros.ts';
import { RepositorioClases, almacenMemoria } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';
import type { Clase } from '../src/clases.ts';

const HOY = '2026-11-24';
const FICHA = crearAlumno({ nombre: 'Julieta P.', modalidad: 'individual', tarifaUYU: 2500 }, HOY, () => false, () => 0.123456789);
const ficha = (overrides: Partial<AlumnoFicha> = {}): AlumnoFicha => ({ ...FICHA, ...overrides });
const clase = (id: string, fecha: string, estado: Clase['estado'] = 'dada', alumnoId = FICHA.id): Clase => ({
  id, nombre: 'Individual', fecha, minutos: 540, duracionMin: 60, estado,
  alumnos: [{ id: alumnoId, nombre: 'Julieta P.', telefono: '' }],
  eventos: [], marcadaEn: null, cancelacion: null,
});
const pago = (claseId: string, montoUYU = 2500): Pago => ({
  id: `p-${claseId}`, alumnoId: FICHA.id, periodo: '2026-11', montoUYU,
  fecha: HOY, quien: 'prueba', concepto: 'clase-individual', claseId, anulado: null,
});

function vista(actual: AlumnoFicha, clases: Clase[], pagos: Pago[] = []) {
  const cobros = cobrosIndividuales([{ ...actual, individual: true, montoUYU: actual.tarifaUYU ?? 0 }], pagos, clases, HOY);
  return {
    cobros,
    deuda: deudaIndividual(actual, cobros),
    mensualidad: resumenCobros([{ ...actual, individual: true, montoUYU: actual.tarifaUYU ?? 0 }], pagos, HOY),
  };
}

test('ficha individual: una clase dada pendiente muestra cantidad e importe de Cobros', () => {
  const actual = ficha();
  const { cobros, deuda, mensualidad } = vista(actual, [clase('c1', '2026-11-23')]);
  assert.deepEqual(cobros.filter((f) => !f.pago).map((f) => f.clase.id), ['c1']);
  assert.deepEqual(deuda, { clases: 1, montoUYU: 2500, sinTarifa: false });
  assert.equal(mensualidad.filas.length, 0, 'la individual no se duplica en el KPI mensual');
});

test('ficha individual: sin clases dadas pendientes está al día, sin deuda', () => {
  const actual = ficha();
  const { cobros, deuda } = vista(actual, [
    clase('reserva', HOY, 'programada'), clase('futura', '2026-11-30'),
    clase('cancelada', '2026-11-23', 'cancelada'),
  ]);
  assert.equal(cobros.length, 0);
  assert.deepEqual(deuda, { clases: 0, montoUYU: 0, sinTarifa: false });
});

test('ficha individual: varias clases pendientes suman una vez; pagos y anulaciones no duplican', () => {
  const actual = ficha();
  const clases = [clase('c1', '2026-11-20'), clase('c2', '2026-11-22'), clase('c3', '2026-11-23')];
  const activo = pago('c1');
  const anulado: Pago = { ...pago('c2'), id: 'p-c2', anulado: { fecha: HOY, motivo: 'error', quien: 'prueba' } };
  const { cobros, deuda } = vista(actual, clases, [activo, anulado]);
  assert.equal(cobros.length, 3);
  assert.deepEqual(cobros.filter((f) => !f.pago).map((f) => f.clase.id), ['c2', 'c3']);
  assert.deepEqual(deuda, { clases: 2, montoUYU: 5000, sinTarifa: false });
  assert.equal(deuda.montoUYU, cobros.filter((f) => !f.pago).reduce((n, f) => n + f.alumno.montoUYU, 0));
});

test('ficha individual: alumno repetido en la misma clase no duplica el cobro', () => {
  const actual = ficha();
  const repetida = clase('c1', '2026-11-23');
  repetida.alumnos.push({ ...repetida.alumnos[0]! });
  const { cobros, deuda } = vista(actual, [repetida]);
  assert.equal(cobros.length, 1);
  assert.equal(deuda.clases, 1);
});

test('ficha individual: sin tarifa propia avisa falta cargar, nunca usa $6500 ni deuda $0 normal', async () => {
  const actual = ficha({ tarifaUYU: null });
  const { cobros, deuda } = vista(actual, [clase('c1', '2026-11-23')]);
  assert.equal(cobros[0]?.alumno.montoUYU, 0);
  assert.deepEqual(deuda, { clases: 1, montoUYU: 0, sinTarifa: true });
  const ui = await readFile(new URL('../propuesta.ts', import.meta.url), 'utf8');
  assert.match(ui, /Falta cargar la tarifa/);
  assert.match(ui, /Se guarda en la ficha para las próximas clases\./);
  assert.match(ui, /registrarPagoConTarifa\(alumno\.id, tarifa/);
  assert.doesNotMatch(ui, /6500/);
});

test('flujo real: cargar tarifa y confirmar el pago deja al día y sobrevive recarga', () => {
  const ahora = new Date('2026-11-24T15:00:00Z').getTime();
  const guardado = almacenMemoria();
  const repo = new RepositorioClases(
    guardado, relojFalso(ahora),
    () => [clase('c1', '2026-11-23')],
    () => [ficha({ id: 'a2', tarifaUYU: null })],
  );
  const inicial = repo.listarAlumnos()[0]!;
  assert.equal(inicial.tarifaUYU, null, 'la ficha arranca sin precio');
  const antes = deudaIndividual(inicial, cobrosIndividuales(
    [{ ...inicial, individual: true, montoUYU: 0 }], [], [clase('c1', '2026-11-23', 'dada', inicial.id)], HOY,
  ));
  assert.deepEqual(antes, { clases: 1, montoUYU: 0, sinTarifa: true });

  // Exactamente lo que hace el diálogo: graba tarifa y pago en una sola escritura.
  repo.registrarPagoConTarifa(inicial.id, 3100, {
    id: 'p-c1', periodo: '2026-11', quien: 'prueba', fecha: HOY,
    concepto: 'clase-individual', claseId: 'c1',
  });

  const pagos = JSON.parse(guardado.leer()!).pagos as Pago[];
  assert.equal(pagos.length, 1);
  assert.deepEqual(
    { monto: pagos[0]!.montoUYU, concepto: pagos[0]!.concepto, claseId: pagos[0]!.claseId },
    { monto: 3100, concepto: 'clase-individual', claseId: 'c1' },
  );

  // Otra instancia leyendo el mismo almacén simula la recarga de la página.
  const recargado = new RepositorioClases(
    guardado, relojFalso(ahora),
    () => [clase('c1', '2026-11-23')],
    () => [ficha({ id: 'a2', tarifaUYU: null })],
  );
  const actual = recargado.listarAlumnos()[0]!;
  assert.equal(actual.tarifaUYU, 3100, 'la tarifa cargada se conserva al recargar');
  const cobros = cobrosIndividuales(
    [{ ...actual, individual: true, montoUYU: actual.tarifaUYU ?? 0 }], pagos, [clase('c1', '2026-11-23', 'dada', actual.id)], HOY,
  );
  assert.equal(cobros[0]!.pago?.montoUYU, 3100);
  assert.deepEqual(deudaIndividual(actual, cobros), { clases: 0, montoUYU: 0, sinTarifa: false });
  assert.equal(resumenCobros([{ ...actual, individual: true, montoUYU: actual.tarifaUYU }], pagos, HOY).filas.length, 0);
});

test('contrato UI: ficha individual usa deuda compartida y excluye mensualidad; Cobros no muestra $0 normal', async () => {
  const ui = await readFile(new URL('../propuesta.ts', import.meta.url), 'utf8');
  assert.match(ui, /deudaInd\(ficha, verCobrosIndividuales\(\)\)/);
  assert.match(ui, /const filas = porClase \? \[\] : r\.filas\.filter/);
  assert.match(ui, /function filasAlumnos\(\): FichaVista\[\]/);
  assert.match(ui, /const importe = f\.pago \? uyu\(monto\) : sinTarifa \? 'Falta cargar la tarifa' : uyu\(monto\)/);
  assert.match(ui, /const monto = f\.pago \? f\.pago\.montoUYU : precioPrecargado\(f\.alumno/);
});
