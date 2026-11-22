/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  PLANTILLA_CANCELACION, textoCancelacion, linkTexto, linkAlumno,
  normalizarTelefono, destinos, resumenEnvio, linkAvisoVencimiento, textoAvisoVencimiento,
} from '../src/whatsapp.ts';
import { cancelarClase, crearClase, type Clase } from '../src/clases.ts';

test('aviso de vencimiento (#3): mensaje sugerido y deep link con teléfono normalizado', () => {
  const aviso = { telefono: '099 123 456', nombre: 'Carla', vencimiento: '2026-12-01' };
  const texto = textoAvisoVencimiento(aviso);
  assert.match(texto, /Carla/);
  assert.match(texto, /01\/12\/2026/);
  const link = linkAvisoVencimiento(aviso);
  assert.ok(link.startsWith('https://wa.me/59899123456?text='));
  assert.equal(decodeURIComponent(link.split('?text=')[1]!), texto);
});

const t = (s: string) => new Date(s).getTime();

const alumnos = [
  { id: 'a1', nombre: 'Carla T.', telefono: '099 123 456' },
  { id: 'a2', nombre: 'Bruno S.', telefono: '+598 99 987 654' },
  { id: 'a3', nombre: 'Julieta P.', telefono: '99112233' },
];

function clase(): Clase {
  return crearClase({ id: 'c1', nombre: 'Grupo Martes A', fecha: '2026-11-18', hora: '15:00', alumnos });
}

test('normalizarTelefono deja el formato del deep link', () => {
  assert.equal(normalizarTelefono('099 123 456'), '59899123456');
  assert.equal(normalizarTelefono('+598 99 987 654'), '59899987654');
  assert.equal(normalizarTelefono('99112233'), '59899112233');
  assert.equal(normalizarTelefono('59899123456'), '59899123456');
});

test('el texto pre-cargado usa la plantilla por defecto y es editable en la app', () => {
  const c = clase(); // 18/11
  const texto = textoCancelacion(c);
  assert.ok(texto.startsWith(PLANTILLA_CANCELACION));
  assert.ok(texto.includes('miércoles 18 de noviembre'), texto);
  assert.ok(texto.includes('15:00'));

  const propio = textoCancelacion(clase(), 'Hola, hoy no hay clase. Disculpen.');
  assert.ok(propio.startsWith('Hola, hoy no hay clase.'));
  assert.ok(propio.includes('15:00'));
  // Vacía: cae en la plantilla (nunca se manda un texto en blanco).
  assert.equal(textoCancelacion(c, '   '), texto);
});

test('deep links wa.me con el mensaje precargado', () => {
  const texto = 'Hola, la clase de hoy se canceló.';
  assert.equal(
    linkTexto(texto),
    'https://wa.me/?text=Hola%2C%20la%20clase%20de%20hoy%20se%20cancel%C3%B3.',
  );
  assert.equal(
    linkAlumno(alumnos[0], texto),
    'https://wa.me/59899123456?text=Hola%2C%20la%20clase%20de%20hoy%20se%20cancel%C3%B3.',
  );
  assert.equal(linkAlumno(alumnos[2], texto).startsWith('https://wa.me/59899112233?text='), true);
});

test('masivo: un destino por alumno de la clase, con el texto editable', () => {
  const c = clase();
  const texto = textoCancelacion(c);
  const lista = destinos(c, 'masivo', [], texto);
  assert.equal(lista.length, 3);
  assert.deepEqual(lista.map((d) => d.alumno.nombre), ['Carla T.', 'Bruno S.', 'Julieta P.']);
  assert.ok(lista.every((d) => d.link.startsWith('https://wa.me/598')));
  assert.ok(lista.every((d) => d.link.includes(`text=${encodeURIComponent(texto)}`)));
});

test('individual: solo los alumnos elegidos y sin texto precargado', () => {
  const c = clase();
  const elegidos = [alumnos[1]];
  const lista = destinos(c, 'individual', elegidos, textoCancelacion(c));
  assert.equal(lista.length, 1);
  assert.equal(lista[0].alumno.nombre, 'Bruno S.');
  assert.equal(lista[0].link, 'https://wa.me/59899987654', 'individual: el mensaje lo escribe el dueño');
});

test('sin elegidos no hay destinos (no se manda nada por accidente)', () => {
  const c = clase();
  assert.deepEqual(destinos(c, 'masivo', [], ''), []);
  assert.deepEqual(destinos(c, 'individual', [], 'x'), []);
});

test('el envío queda registrado en la auditoría de la cancelación', () => {
  const c = cancelarClase(clase(), { motivo: 'Lluvia', quien: 'Xime', ahora: t('2026-11-18T21:30:00.000Z') });
  assert.equal(c.cancelacion?.mensajesEnviados, null, 'hasta que el dueño elige');
  // "No enviar ahora" también queda registrado.
  assert.equal(c.cancelacion?.mensajesEnviados, null);
});

test('resumenEnvio para el toast', () => {
  const c = clase();
  assert.equal(resumenEnvio(c, 'masivo', 3), 'WhatsApp listo para los 3 alumnos de Grupo Martes A');
  assert.equal(resumenEnvio(c, 'individual', 1), 'WhatsApp listo para 1 alumno elegido');
  assert.equal(resumenEnvio(c, 'masivo', 0), 'No se envió ningún mensaje');
});
