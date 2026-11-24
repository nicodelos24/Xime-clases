import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { RepositorioClases, almacenMemoria, CLAVE_ESTADO } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';

const AHORA = Date.parse('2026-11-24T13:00:00Z');

test('el navegador persiste y recupera el mismo estado válido', () => {
  const navegador = new Map<string, string>();
  const almacen = {
    leer: () => navegador.get(CLAVE_ESTADO) ?? null,
    escribir: (texto: string) => { navegador.set(CLAVE_ESTADO, texto); },
    leerRutinas: () => navegador.get('xime.v5.rutinas') ?? null,
    escribirRutinas: (texto: string) => { navegador.set('xime.v5.rutinas', texto); },
  };
  const repo = new RepositorioClases(almacen, relojFalso(AHORA));
  repo.listarAlumnos();
  repo.crearAlumno({ nombre: 'Alumna nueva', modalidad: 'mensual' });
  const reabierta = new RepositorioClases(almacen, relojFalso(AHORA));
  assert.ok(reabierta.listarAlumnos().some((a) => a.nombre === 'Alumna nueva'));
  assert.deepEqual(JSON.parse(navegador.get('xime.v5.rutinas')!), []);
});

test('la escritura fallida deja el estado anterior intacto en el almacén', () => {
  const memoria = almacenMemoria(JSON.stringify({ version: 2, clases: [], alumnos: [], pagos: [], rutinas: [] }));
  const almacen = {
    leer: () => memoria.leer(),
    escribir: (texto: string) => { memoria.escribir(texto); },
    leerRutinas: () => '[]',
    escribirRutinas: () => { throw new Error('respaldo lleno'); },
  };
  const repo = new RepositorioClases(almacen, relojFalso(AHORA));
  repo.listar();
  const anterior = memoria.leer();
  assert.throws(() => repo.crearAlumno({ nombre: 'Alumna nueva', modalidad: 'mensual' }), /respaldo lleno/);
  assert.equal(memoria.leer(), anterior);
});
