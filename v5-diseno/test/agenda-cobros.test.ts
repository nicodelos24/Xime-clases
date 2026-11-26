import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cobrosDeLaSemana, estadoCobro, tieneCobros, type FilaAgendaCobro } from '../src/agenda-cobros.ts';
import { resumenCobros } from '../src/cobros.ts';
import { alumnosCobrosDemo } from '../src/demo.ts';
import { hoyLocal, relojFalso } from '../src/reloj.ts';
import { lunesDe } from '../src/fechas.ts';

const fila = (fecha: string, nombre: string, estado: FilaAgendaCobro['estado'] = 'porvencer'): FilaAgendaCobro => ({
  fecha, alumno: { id: 'a0', nombre }, estado,
});

test('una fila por día de lunes a domingo, con los cobros de ese día por nombre', () => {
  const dias = cobrosDeLaSemana([
    fila('2026-11-26', 'Zoe'), fila('2026-11-23', 'Ana', 'vencido'), fila('2026-11-26', 'Bruno'),
    fila('2026-12-01', 'Fuera'),
  ], '2026-11-23');
  assert.deepEqual(dias.map((d) => d.fecha), [
    '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26',
    '2026-11-27', '2026-11-28', '2026-11-29',
  ]);
  assert.deepEqual(dias[0].cobros.map((c) => c.alumno.nombre), ['Ana']);
  assert.deepEqual(dias[3].cobros.map((c) => c.alumno.nombre), ['Bruno', 'Zoe']);
  assert.deepEqual(dias[6].cobros, []);
});

test('el punto de la tira sale de los pendientes, no de los pagados', () => {
  assert.equal(tieneCobros({ fecha: '2026-11-26', cobros: [fila('2026-11-26', 'Ana', 'pagado')] }), false);
  assert.equal(tieneCobros({ fecha: '2026-11-26', cobros: [fila('2026-11-26', 'Ana', 'vencido')] }), true);
});

test('el estado respeta pago vencido / hoy / por vencer', () => {
  assert.equal(estadoCobro(-1, false), 'vencido');
  assert.equal(estadoCobro(0, false), 'hoy');
  assert.equal(estadoCobro(3, false), 'porvencer');
  assert.equal(estadoCobro(-5, true), 'pagado');
});

test('los vencimientos de la agenda salen del MISMO resumen que la lista de Cobros', () => {
  const hoy = '2026-11-26';
  const r = resumenCobros(alumnosCobrosDemo, [], hoy);
  const lunes = lunesDe(hoy);
  const dias = cobrosDeLaSemana(r.filas.map((f) => ({
    fecha: f.fecha, alumno: f.alumno, estado: estadoCobro(f.dias, Boolean(f.pago)),
  })), lunes);
  const enSemana = dias.flatMap((d) => d.cobros);
  // La lista filtra a 7 días; la agenda semanal solo muestra los que caen en
  // esos siete días, sin perder ninguno de ese rango.
  const esperados = r.filas.filter((f) => f.fecha >= lunes && f.fecha <= '2026-11-29');
  assert.equal(enSemana.length, esperados.length);
  assert.deepEqual(
    enSemana.map((c) => c.fecha).sort(),
    esperados.map((f) => f.fecha).sort(),
  );
});

test('la agenda sigue a la fecha real del reloj inyectado', () => {
  const reloj = relojFalso(Date.parse('2026-12-03T12:00:00Z'));
  assert.equal(lunesDe(hoyLocal(reloj.ahora())), '2026-11-30');
});
