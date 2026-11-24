import assert from 'node:assert/strict';
import { test } from 'node:test';
import { colorPorId, crearAlumno, esFotoValida, iniciales, MAX_CARACTERES_FOTO } from '../src/alumnos.ts';
import { almacenMemoria, RepositorioClases } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';

const reloj = relojFalso(0);
const repo = new RepositorioClases(almacenMemoria(), reloj, () => [], () => []);

const FOTO_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
const FOTO_PNG = 'data:image/png;base64,iVBORw0KGgo=';
const FOTO_GRANDE = `data:image/jpeg;base64,${'A'.repeat(MAX_CARACTERES_FOTO + 1)}`;

test('mismo alumno, mismas iniciales y mismo color por ID: idéntico en Alumnos y Cobros', () => {
  const a = repo.crearAlumno({ nombre: 'Anas Fiorella', modalidad: 'mensual' });
  assert.equal(iniciales(a.nombre), 'AF');
  assert.equal(colorPorId(a.id), a.color);
  const deNuevo = colorPorId(a.id);
  assert.equal(colorPorId(a.id), deNuevo); // estable: no cambia entre listas
});

test('la foto nueva se valida: dataURL chico de imagen, nada raro', () => {
  assert.equal(esFotoValida(FOTO_JPEG), true);
  assert.equal(esFotoValida(FOTO_PNG), true);
  assert.equal(esFotoValida('https://ejemplo.com/foto.jpg'), false);
  assert.equal(esFotoValida('data:text/html;base64,PGI+'), false);
  assert.equal(esFotoValida(''), false);
  assert.equal(esFotoValida(FOTO_GRANDE), false);
  assert.equal(esFotoValida(undefined), false);
});

test('asignar foto a un alumno y verla reflejada en la ficha compartida; quitarla vuelve a iniciales', () => {
  const a = repo.crearAlumno({ nombre: 'Bruno Díaz', modalidad: 'individual' });
  assert.equal(a.foto, ''); // al crear no hay foto: iniciales de siempre
  const conFoto = repo.asignarFotoAlumno(a.id, FOTO_JPEG);
  assert.equal(conFoto.foto, FOTO_JPEG);
  const leida = repo.listarAlumnos().find((x) => x.id === a.id);
  assert.equal(leida?.foto, FOTO_JPEG);
  const sinFoto = repo.asignarFotoAlumno(a.id, '');
  assert.equal(sinFoto.foto, '');
});

test('la foto inválida no rompe la ficha: se descarta y quedan las iniciales', () => {
  const a = repo.crearAlumno({ nombre: 'Carla Ruiz', modalidad: 'mensual' });
  const guardada = repo.asignarFotoAlumno(a.id, 'no-es-una-foto');
  assert.equal(guardada.foto, '');
  assert.throws(() => repo.asignarFotoAlumno('no-existe', FOTO_JPEG), /No se encontró la ficha/);
});

test('editar la ficha no pierde la foto', () => {
  const a = repo.crearAlumno({ nombre: 'Diego Pérez', modalidad: 'mensual' });
  repo.asignarFotoAlumno(a.id, FOTO_JPEG);
  const editada = repo.editarAlumno(a.id, { nombre: 'Diego Pérez', modalidad: 'mensual' });
  assert.equal(editada.foto, FOTO_JPEG);
});

test('la foto guardada se conserva al leer el estado (persiste en el almacén)', () => {
  const almacen = almacenMemoria();
  const r1 = new RepositorioClases(almacen, reloj, () => [], () => []);
  const a = r1.crearAlumno({ nombre: 'Elena Gil', modalidad: 'mensual' });
  r1.asignarFotoAlumno(a.id, FOTO_PNG);
  const r2 = new RepositorioClases(almacen, reloj, () => [], () => []);
  const leida = r2.listarAlumnos().find((x) => x.id === a.id);
  assert.equal(leida?.foto, FOTO_PNG);
});
