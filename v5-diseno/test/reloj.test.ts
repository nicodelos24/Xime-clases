/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  hoyLocal, minutosLocales, parsearMinutos, formatoHora, partesDe,
  relojFalso, relojDelDispositivo, ZONA,
} from '../src/reloj.ts';

// 2026-11-18 18:30 en America/Montevideo = 21:30 UTC (UTC-3, sin horario de verano desde 2015).
const ISO_1830 = '2026-11-18T21:30:00.000Z';
const t = (s: string) => new Date(s).getTime();

test('zona del instituto', () => {
  assert.equal(ZONA, 'America/Montevideo');
});

test('hoyLocal convierte UTC a día civil en Montevideo', () => {
  assert.equal(hoyLocal(t(ISO_1830)), '2026-11-18');
  // 02:30 UTC todavía es día anterior en Uruguay (23:30 del 17).
  assert.equal(hoyLocal(t('2026-11-18T02:30:00.000Z')), '2026-11-17');
  // 00:00 UTC sí es el mismo día (21:00 del 17).
  assert.equal(hoyLocal(t('2026-11-18T00:00:00.000Z')), '2026-11-17');
});

test('minutosLocales da la hora local (18:30 → 1110)', () => {
  assert.equal(minutosLocales(t(ISO_1830)), 18 * 60 + 30);
  assert.equal(minutosLocales(t('2026-11-19T03:05:00.000Z')), 0 * 60 + 5); // 00:05 del 18
});

test('partesDe devuelve año, mes, día y hora', () => {
  assert.deepEqual(partesDe(t(ISO_1830)), { y: 2026, m: 11, d: 18, hh: 18, mm: 30, ss: 0 });
});

test('parsearMinutos acepta "HH:MM" y "HHMM"', () => {
  assert.equal(parsearMinutos('15:00'), 900);
  assert.equal(parsearMinutos('17:30'), 1050);
  assert.equal(parsearMinutos('00:00'), 0);
  assert.equal(parsearMinutos('23:59'), 1439);
  assert.equal(parsearMinutos('930'), 570);
});

test('parsearMinutos rechaza horas imposibles', () => {
  assert.throws(() => parsearMinutos('24:00'), /Hora inválida/);
  assert.throws(() => parsearMinutos('12:60'), /Hora inválida/);
  assert.throws(() => parsearMinutos('mañana'), /Hora inválida/);
});

test('formatoHora redondea de vuelta', () => {
  assert.equal(formatoHora(900), '15:00');
  assert.equal(formatoHora(1439), '23:59');
  assert.throws(() => formatoHora(1440), /Minutos inválidos/);
});

test('relojFalso avanza y se fija a mano (pruebas sin tocar el reloj real)', () => {
  const reloj = relojFalso(t(ISO_1830));
  assert.equal(hoyLocal(reloj.ahora()), '2026-11-18');
  reloj.avanzar(90 * 60 * 1000); // +1 h 30 → 20:00
  assert.equal(minutosLocales(reloj.ahora()), 20 * 60);
  reloj.fijar(t('2026-11-19T02:30:00.000Z')); // 23:30 del 18 en Uruguay
  assert.equal(hoyLocal(reloj.ahora()), '2026-11-18');
  reloj.avanzar(-60 * 60 * 1000);
  assert.equal(minutosLocales(reloj.ahora()), 22 * 60 + 30);
});

test('el reloj del dispositivo expone ahora() en milisegundos', () => {
  const r = relojDelDispositivo();
  const a = r.ahora();
  assert.equal(typeof a, 'number');
  assert.ok(a > 1_700_000_000_000);
  assert.equal(hoyLocal(a).length, 10);
});
