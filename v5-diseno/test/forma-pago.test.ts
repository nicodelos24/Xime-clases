/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  crearAlumno, editarAlumno, normalizarFichaGuardada, validarAlumno,
  type AlumnoFicha,
} from '../src/alumnos.ts';
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

test('migración suave: ficha vieja sin formaPago se lee como mensual fijo y conserva su tarifa', () => {
  const vieja = crearAlumno({ nombre: 'Ficha Vieja', modalidad: 'mensual', tarifaUYU: 5000 }, HOY, () => false, () => 0.5);
  delete (vieja as Partial<AlumnoFicha>).formaPago;
  const leida = normalizarFichaGuardada(vieja)!;
  assert.equal(leida.formaPago, 'mensual-fijo');
  assert.equal(leida.tarifaUYU, 5000);
  assert.equal(editarAlumno(leida, { nombre: 'Ficha Vieja' }).formaPago, 'mensual-fijo');
  assert.match(validarAlumno({ formaPago: 'otra' as never }).formaPago ?? '', /Elegí la forma de pago/);
});
