import assert from 'node:assert/strict';
import { test } from 'node:test';
import { precioPrecargado } from '../src/tarifas.ts';
import { fichasDemo } from '../src/demo.ts';
import { RepositorioClases, almacenMemoria } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';
import { cobrosIndividuales } from '../src/cobros.ts';
import { precio } from '../src/tarifas.ts';

const HOY = '2026-11-24';
const reloj = relojFalso(Date.parse(`${HOY}T12:00:00Z`));

/** Fila individual como la entrega `alumnosParaCobros()`: tarifa ya traducida a montoUYU. */
function filaDeCobros(id: string, montoUYU: number) {
  return { id, nombre: 'Diego G.', grupo: 'Viernes', ancla: 2, montoUYU, individual: true };
}

test('D1: diálogo individual precarga montoUYU aunque la fila no traiga tarifaUYU', () => {
  const fila = filaDeCobros('a5', 2500);
  assert.equal('tarifaUYU' in fila, false, 'la fila de Cobros no trae tarifaUYU');
  assert.equal(precio(fila, 'clase-individual', HOY), null, 'por eso precio() da null');
  assert.equal(precioPrecargado(fila, 'clase-individual', HOY), 2500);
});

test('D1: tras corregir la ficha a $3.100, el diálogo precarga $3.100', () => {
  const almacen = almacenMemoria();
  const repo = new RepositorioClases(almacen, reloj, () => [], () => fichasDemo(HOY));
  repo.editarAlumno('a5', { tarifaUYU: 3100 });
  const ficha = new RepositorioClases(almacen, reloj).listarAlumnos().find((f) => f.id === 'a5')!;
  const fila = filaDeCobros(ficha.id, precio(ficha, 'clase-individual', HOY) ?? 0);
  assert.equal(fila.montoUYU, 3100, 'la fila de Cobros se Actualiza con la tarifa corregida');
  const pagos = repo.listarPagos();
  const clase = {
    id: 'c-ind', nombre: 'Clase individual', fecha: '2026-11-20', minutos: 60, duracionMin: 60,
    estado: 'dada' as const, alumnos: [{ id: ficha.id, nombre: ficha.nombre, telefono: '' }],
    eventos: [], marcadaEn: null, cancelacion: null,
  };
  const cobro = cobrosIndividuales([{ ...fila, individual: true }], pagos, [clase], HOY)[0]!;
  assert.equal(precioPrecargado(cobro.alumno, 'clase-individual', cobro.fecha, cobro.pago), 3100);
});

test('D1: un pago existente manda y una tarifa inválida nunca se inventa', () => {
  const fila = filaDeCobros('a5', 2500);
  assert.equal(precioPrecargado(fila, 'clase-individual', HOY, { montoUYU: 2800 }), 2800);
  assert.equal(precioPrecargado({ ...fila, tarifaUYU: null }, 'clase-individual', HOY), 0);
  assert.equal(precioPrecargado({ ...fila, tarifaUYU: 0 }, 'clase-individual', HOY), 0);
  assert.equal(precioPrecargado({ montoUYU: 0 }, 'clase-individual', HOY), 0);
});
