/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import {
  crearAlumno, editarAlumno, normalizarFichaGuardada, validarAlumno, construirVista,
  type AlumnoFicha,
} from '../src/alumnos.ts';
import { precio } from '../src/tarifas.ts';
import { datosDemo, fichasDemo } from '../src/demo.ts';
import { RepositorioClases, almacenMemoria } from '../src/repositorio.ts';
import { hoyLocal, relojFalso } from '../src/reloj.ts';

const AHORA = Date.parse('2026-11-26T12:00:00Z');
const HOY = hoyLocal(AHORA);
const reloj = relojFalso(AHORA);

test('la forma de pago elegida al dar de alta se persiste y se edita', () => {
  const almacen = almacenMemoria();
  const repo = new RepositorioClases(almacen, reloj, datosDemo, fichasDemo);
  const porClase = repo.crearAlumno({
    nombre: 'Alumna por clase', modalidad: 'individual', formaPago: 'por-clase', tarifaUYU: 1800,
  });
  assert.equal(porClase.formaPago, 'por-clase');
  assert.equal(repo.listarAlumnos().find((a) => a.id === porClase.id)?.tarifaUYU, 1800);
  repo.editarAlumno(porClase.id, { formaPago: 'mensual-fijo', tarifaUYU: 6500 });
  const otra = new RepositorioClases(almacen, reloj, datosDemo, fichasDemo)
    .listarAlumnos().find((a) => a.id === porClase.id)!;
  assert.equal(otra.formaPago, 'mensual-fijo');
  assert.equal(otra.tarifaUYU, 6500);
});

test('precio manual: se guarda como tarifa propia y se usa en cobros y aviso', () => {
  const almacen = almacenMemoria();
  const repo = new RepositorioClases(almacen, reloj, datosDemo, fichasDemo);
  const creada = repo.crearAlumno({
    nombre: 'Alumna con descuento', modalidad: 'mensual', formaPago: 'otro', tarifaUYU: 4800,
  });
  assert.equal(creada.formaPago, 'otro');
  assert.equal(repo.listarAlumnos().find((a) => a.id === creada.id)?.tarifaUYU, 4800);
  repo.editarAlumno(creada.id, { tarifaUYU: 4300 });
  const recargada = new RepositorioClases(almacen, reloj, datosDemo, fichasDemo)
    .listarAlumnos().find((a) => a.id === creada.id)!;
  assert.equal(recargada.formaPago, 'otro', 'editar el monto no pierde la forma de pago manual');
  assert.equal(recargada.tarifaUYU, 4300);
  assert.equal(precio(recargada, 'mensualidad', HOY), 4300);
  // La vista de alumnos la trata como mensual, pero con su precio acordado.
  const vista = construirVista([recargada], new Map(), HOY)[0]!;
  assert.equal(vista.formaPago, 'otro');
  assert.equal(vista.vence, null);
});

test('UI: opción manual desplegable con animación y sin cálculo de descuento', async () => {
  const ui = await readFile(new URL('../propuesta.ts', import.meta.url), 'utf8');
  const css = await readFile(new URL('../propuesta.css', import.meta.url), 'utf8');
  assert.match(ui, /data-forma-pago="otro"/);
  assert.match(ui, /aria-controls="precio-manual-campo"/);
  assert.match(ui, /name="tarifaManualUYU"/);
  assert.match(ui, /campoFijo\.hidden = esManual/);
  assert.match(ui, /inputTarifa\.value = inputManual\.value/);
  assert.match(css, /\.precio-manual:not\(\[hidden\]\) \{ animation: subirSheet/);
  assert.doesNotMatch(ui, /descuento%\s*\)/, 'no se calcula el descuento: es otra tarea');
});

test('migración suave: ficha vieja sin formaPago se lee como mensual fijo y conserva su tarifa', () => {
  const vieja = crearAlumno({ nombre: 'Ficha Vieja', modalidad: 'mensual', tarifaUYU: 5000 }, HOY, () => false, () => 0.5);
  delete (vieja as Partial<AlumnoFicha>).formaPago;
  const leida = normalizarFichaGuardada(vieja)!;
  assert.equal(leida.formaPago, 'mensual-fijo');
  assert.equal(leida.tarifaUYU, 5000);
  assert.equal(editarAlumno(leida, { nombre: 'Ficha Vieja' }).formaPago, 'mensual-fijo');
  assert.match(validarAlumno({ formaPago: 'otra' as never }).formaPago ?? '', /Elegí la forma de pago/);
});
