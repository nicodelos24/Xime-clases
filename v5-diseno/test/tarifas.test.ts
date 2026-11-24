import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  crearAlumno, editarAlumno, normalizarFichaGuardada, normalizarAlumno, validarAlumno,
  type AlumnoFicha, type AlumnoFichaInput, type CamposAlta,
} from '../src/alumnos.ts';
import { precio, precioDemo, precioPrecargado, PRECIOS_DEMO } from '../src/tarifas.ts';
import { almacenMemoria, RepositorioClases } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';
import { registrarPago } from '../src/cobros.ts';

const ALTA = '2026-11-24';
const reloj = relojFalso(Date.parse(`${ALTA}T12:00:00Z`));
const input = (tarifaUYU: number): CamposAlta => ({
  nombre: 'Alumna Prueba', modalidad: 'individual', tarifaUYU, fechaAlta: ALTA,
});

test('precio(alumno, concepto, fecha) usa la tarifa propia y nunca el default demo', () => {
  const ficha = crearAlumno(input(2750), ALTA, () => false, () => 0.5);
  assert.equal(precio(ficha, 'clase-individual', '2026-11-24'), 2750);
  assert.equal(precio({ ...ficha, tarifaUYU: null }, 'clase-individual', '2026-11-24'), null);
  assert.equal(precio({ tarifaUYU: 0 }, 'mensualidad', '2026-11-24'), null);
  assert.equal(precio({ tarifaUYU: 1.5 }, 'mensualidad', '2026-11-24'), null);
  assert.equal(precioDemo('mensualidad', ALTA), PRECIOS_DEMO.mensualidad);
  assert.equal(precioDemo('clase-individual', ALTA), PRECIOS_DEMO['clase-individual']);
});

test('REGRESIÓN D1: el diálogo individual precarga el importe de la fila sin tarifaUYU', () => {
  // `alumnosParaCobros()` entrega `montoUYU` derivado de la ficha, sin la
  // propiedad `tarifaUYU`. Antes el diálogo abría en $0 y había que reescribir
  // el importe a mano en cada cobro (390/320/escritorio).
  const fila = { id: 'a2', nombre: 'Diego G.', grupo: 'Grupo A', ancla: 26, montoUYU: 2500, individual: true };
  assert.equal(precio(fila, 'clase-individual', '2026-11-24'), null, 'la fila no trae tarifaUYU');
  assert.equal(precioPrecargado(fila, 'clase-individual', '2026-11-24'), 2500);
  // La tarifa corregida en la ficha se refleja al recalcular la fila.
  const corregida = { ...fila, tarifaUYU: 3100, montoUYU: 3100 };
  assert.equal(precioPrecargado(corregida, 'clase-individual', '2026-11-24'), 3100);
  // Un pago existente manda sobre la tarifa vigente (no se reescribe).
  assert.equal(precioPrecargado(corregida, 'clase-individual', '2026-11-24', { montoUYU: 2500 }), 2500);
  // Sin tarifa propia ni importe de fila no se inventa un precio de ejemplo.
  assert.equal(precioPrecargado({ ...fila, montoUYU: 0 }, 'clase-individual', ALTA), 0);
});

test('alta y edición parcial de tarifa validan enteros positivos y conservan identidad', () => {
  const ficha = crearAlumno(input(2750), ALTA, () => false, () => 0.5);
  assert.equal(ficha.tarifaUYU, 2750);
  const conTarifa = crearAlumno({ nombre: 'Alumna Prueba', modalidad: 'individual', ancla: 21 }, ALTA, () => false, () => 0.5);
  assert.equal(conTarifa.tarifaUYU, null, 'el modelo permite migrar una ficha sin tarifa; la UI/alta de la app exigen una explícita');
  assert.throws(() => crearAlumno({ nombre: 'A', modalidad: 'individual', tarifaUYU: 1000, ancla: 21 }, ALTA, () => false, () => 0.5), /Ingresá el nombre del alumno/);
  assert.throws(() => crearAlumno({ nombre: 'Alumna Prueba', modalidad: undefined, tarifaUYU: 1000, ancla: 21 }, ALTA, () => false, () => 0.5), /Elegí una modalidad/);
  for (const tarifaUYU of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.match(validarAlumno(input(tarifaUYU)).tarifaUYU ?? '', /entera en UYU/);
    assert.throws(() => crearAlumno(input(tarifaUYU), ALTA, () => false, () => 0.5), /entera en UYU/);
  }
  const editada = editarAlumno(ficha, { tarifaUYU: 3100 });
  assert.equal(editada.tarifaUYU, 3100);
  assert.equal(editada.nombre, ficha.nombre);
  assert.equal(editada.modalidad, ficha.modalidad);
  assert.equal(editada.fechaAlta, ALTA);
  assert.equal(editada.id, ficha.id);
  assert.deepEqual(normalizarAlumno({ nombre: 'Otra', modalidad: 'mensual' }), {
    nombre: 'Otra', modalidad: 'mensual', grupo: '', ancla: 21, contacto: '', pagado: false, tarifaUYU: null,
  });
});

test('ficha guardada sin tarifa se lee como null; no se completa con 6500', () => {
  const guardada = JSON.parse(JSON.stringify(crearAlumno(input(2750), ALTA, () => false, () => 0.5)));
  delete guardada.tarifaUYU;
  assert.equal(normalizarFichaGuardada(guardada)?.tarifaUYU, null);
  for (const tarifaUYU of [0, -10, 2.5, '6500', null]) {
    assert.equal(normalizarFichaGuardada({ ...guardada, tarifaUYU })?.tarifaUYU, null);
  }
});

test('repositorio: la tarifa propia y su corrección sobreviven una recarga; no reescriben pagos', () => {
  const almacen = almacenMemoria();
  const repo = new RepositorioClases(almacen, reloj);
  const ficha = repo.crearAlumno(input(2750));
  const historico = { ...input(2750), id: 'p-historico', alumnoId: ficha.id, periodo: '2026-10', montoUYU: 2750, fecha: ALTA, quien: 'prueba' };
  repo.registrarPago(historico);

  const recargada = new RepositorioClases(almacen, reloj);
  assert.equal(recargada.listarAlumnos().find((a) => a.id === ficha.id)?.tarifaUYU, 2750);
  recargada.editarAlumno(ficha.id, { tarifaUYU: 3100 });
  const final = new RepositorioClases(almacen, reloj);
  assert.equal(final.listarAlumnos().find((a) => a.id === ficha.id)?.tarifaUYU, 3100);
  assert.equal(final.listarPagos()[0]?.montoUYU, 2750, 'el pago histórico conserva su importe');

  final.registrarPagoConTarifa(ficha.id, 3300, { id: 'p-nuevo', periodo: '2026-11', fecha: ALTA, quien: 'prueba' });
  const trasCobro = new RepositorioClases(almacen, reloj);
  assert.equal(trasCobro.listarAlumnos().find((a) => a.id === ficha.id)?.tarifaUYU, 3300);
  assert.equal(trasCobro.listarPagos().find((p) => p.id === 'p-nuevo')?.montoUYU, 3300);
  assert.equal(trasCobro.listarPagos().find((p) => p.id === 'p-historico')?.montoUYU, 2750);

  const almacenQueFalla = almacenMemoria();
  const repoFalla = new RepositorioClases(almacenQueFalla, reloj);
  const fichaQueFalla = repoFalla.crearAlumno(input(2750));
  repoFalla.registrarPago({ id: 'p-ocupado', alumnoId: fichaQueFalla.id, periodo: '2026-11', montoUYU: 2750, fecha: ALTA, quien: 'prueba' });
  const antesDelError = almacenQueFalla.leer();
  assert.throws(() => repoFalla.registrarPagoConTarifa(fichaQueFalla.id, 3400, { id: 'p-dup', periodo: '2026-11', fecha: ALTA, quien: 'prueba' }), /Ya hay un pago activo/);
  assert.equal(almacenQueFalla.leer(), antesDelError, 'una transacción rechazada restaura ficha y pagos');
});

test('una ficha vieja sin tarifa sigue sin generar precio/deuda al recargar', () => {
  const vieja: AlumnoFicha = {
    id: 'al-vieja000000', nombre: 'Ficha Vieja', modalidad: 'individual', grupo: '', ancla: 21,
    fechaAlta: '2026-01-01', activo: true, color: 'avatar', contacto: '', pagado: false, foto: '',
  } as AlumnoFicha;
  const almacen = almacenMemoria(JSON.stringify({ version: 3, guardadoEn: '', clases: [], pagos: [], alumnos: [vieja] }));
  const repo = new RepositorioClases(almacen, reloj);
  assert.equal(repo.listarAlumnos()[0]?.tarifaUYU, null);
  assert.equal(precio(repo.listarAlumnos()[0]!, 'clase-individual', ALTA), null);
});
