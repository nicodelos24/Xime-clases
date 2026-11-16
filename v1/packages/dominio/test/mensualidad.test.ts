import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  crearPrimerCiclo,
  ultimoDiaCubierto,
  proximoInicio,
  renovar,
  iniciarCicloSinIniciar,
  estadoDe,
  fechaAviso,
  diasRestantes,
  terminarHoy,
  type Ciclo,
} from '../src/mensualidad.ts';
import { diaSiguiente, hoyLocal } from '../src/fechas.ts';

// §3.5 caso 1: Paga 10/04, primera clase 12/04
test('paga 10/04, primera clase 12/04: inicia 12/04, último día 11/05, aviso el 04/05', () => {
  const ciclo = crearPrimerCiclo('2026-04-12');
  assert.equal(ciclo.ancla, 12);
  assert.equal(ultimoDiaCubierto(ciclo), '2026-05-11');
  assert.equal(fechaAviso(ciclo, 7), '2026-05-04');
});

// §3.5 caso 2: 31/01/2027, mes corto
test('primera clase 31/01/2027: ciclo hasta 27/02, renueva 28/02 y vuelve al ancla 31/03', () => {
  const c1 = crearPrimerCiclo('2027-01-31');
  assert.equal(ultimoDiaCubierto(c1), '2027-02-27');
  const r1 = renovar(c1, '2027-02-15');
  assert.equal(r1.tipo, 'anticipada');
  const c2 = r1.tipo === 'anticipada' ? r1.ciclo : null!;
  assert.equal(c2.inicio, '2027-02-28');
  assert.equal(c2.ancla, 31);
  const r2 = renovar(c2, '2027-03-01');
  const c3 = r2.tipo === 'anticipada' ? r2.ciclo : null!;
  assert.equal(c3.inicio, '2027-03-31');
});

// §3.5 caso 3: 31/01/2028 (bisiesto)
test('primera clase 31/01/2028 bisiesto: último día 28/02, renueva 29/02, luego 31/03', () => {
  const c1 = crearPrimerCiclo('2028-01-31');
  assert.equal(ultimoDiaCubierto(c1), '2028-02-28');
  const r1 = renovar(c1, '2028-02-10');
  const c2 = r1.tipo === 'anticipada' ? r1.ciclo : null!;
  assert.equal(c2.inicio, '2028-02-29');
  const r2 = renovar(c2, '2028-03-05');
  const c3 = r2.tipo === 'anticipada' ? r2.ciclo : null!;
  assert.equal(c3.inicio, '2028-03-31');
});

// §3.5 caso 4: 31/01 y 4 renovaciones seguidas, nunca días perdidos ni cobro extra
test('31/01 con 4 renovaciones: inicios 31/01, 28/02, 31/03, 30/04, 31/05', () => {
  const esperado = ['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30', '2027-05-31'];
  let ciclo = crearPrimerCiclo('2027-01-31');
  assert.equal(ciclo.inicio, esperado[0]);
  for (let i = 1; i < esperado.length; i++) {
    const r = renovar(ciclo, diaSiguiente(esperado[i - 1])); // paga apenas vence
    assert.equal(r.tipo, 'anticipada');
    if (r.tipo !== 'anticipada') continue;
    ciclo = r.ciclo;
    assert.equal(ciclo.inicio, esperado[i], `renovación ${i}`);
    assert.equal(ciclo.ancla, 31);
  }
});

// §3.5 caso 5: ancla 29 (primera clase 29/02/2028)
test('ancla 29: último día 28/03/2028, renueva 29/03, en 2029 renueva 28/02 y luego 29/03', () => {
  let ciclo = crearPrimerCiclo('2028-02-29');
  assert.equal(ultimoDiaCubierto(ciclo), '2028-03-28');
  const r = renovar(ciclo, '2028-03-20');
  if (r.tipo !== 'anticipada') throw new Error('se esperaba renovación anticipada');
  ciclo = r.ciclo;
  assert.equal(ciclo.inicio, '2028-03-29');
  // Avanzar renovando hasta 29/01/2029
  for (let i = 0; i < 10; i++) {
    const r2 = renovar(ciclo, ultimoDiaCubierto(ciclo)); // paga hasta su último día cubierto
    if (r2.tipo !== 'anticipada') throw new Error('se esperaba renovación anticipada');
    ciclo = r2.ciclo;
    if (ciclo.inicio === '2029-01-29') break;
  }
  assert.equal(ciclo.inicio, '2029-01-29');
  const r3 = renovar(ciclo, '2029-02-05');
  if (r3.tipo !== 'anticipada') throw new Error('se esperaba renovación anticipada');
  assert.equal(r3.ciclo.inicio, '2029-02-28'); // febrero 2029 no tiene 29: día recortado
  const r4 = renovar(r3.ciclo, '2029-03-05');
  if (r4.tipo !== 'anticipada') throw new Error('se esperaba renovación anticipada');
  assert.equal(r4.ciclo.inicio, '2029-03-29'); // vuelve al ancla
});

// §3.5 caso 6: renovación anticipada sin esperar clase
test('último día 11/05, paga el 05/05: nuevo ciclo inicia 12/05', () => {
  const ciclo: Ciclo = { ancla: 12, inicio: '2026-04-12' };
  assert.equal(ultimoDiaCubierto(ciclo), '2026-05-11');
  const r = renovar(ciclo, '2026-05-05');
  if (r.tipo !== 'anticipada') throw new Error('se esperaba renovación anticipada');
  assert.equal(r.ciclo.inicio, '2026-05-12');
  // Y también pagando el propio último día (11/05):
  const rMismoDia = renovar(ciclo, '2026-05-11');
  if (rMismoDia.tipo !== 'anticipada') throw new Error('se esperaba renovación anticipada');
  assert.equal(rMismoDia.ciclo.inicio, '2026-05-12');
});

// §3.5 caso 7: pago vencido queda «Pagada, sin iniciar» hasta su próxima clase
test('último día 11/05, paga el 20/05: sin iniciar; el ancla se renueva con la nueva primera clase', () => {
  const ciclo: Ciclo = { ancla: 12, inicio: '2026-04-12' };
  const r = renovar(ciclo, '2026-05-20');
  assert.equal(r.tipo, 'vencida');
  if (r.tipo !== 'vencida') return;
  const c = iniciarCicloSinIniciar(r.sinIniciar, '2026-05-23');
  assert.equal(c.inicio, '2026-05-23');
  assert.equal(c.ancla, 23); // quedó sin ciclo continuo: ancla nueva
  assert.equal(ultimoDiaCubierto(c), '2026-06-22');
});

// §3.1.5: estados
test('estados derivados de fechas, con N=7 por defecto', () => {
  const ciclo: Ciclo = { ancla: 12, inicio: '2026-04-12' }; // último día 11/05
  assert.equal(estadoDe('2026-05-01', ciclo), 'Vigente'); // restan 10 > 7
  assert.equal(estadoDe('2026-05-04', ciclo), 'PorVencer'); // restan 7 (límite)
  assert.equal(estadoDe('2026-05-10', ciclo), 'PorVencer'); // restan 1
  assert.equal(estadoDe('2026-05-11', ciclo), 'VenceHoy');
  assert.equal(estadoDe('2026-05-12', ciclo), 'Vencida');
  assert.equal(estadoDe('2026-04-20', ciclo), 'Vigente');
  assert.equal(estadoDe('2026-04-20', null), 'SinMensualidad');
  // Pago futuro: inicio aún no llegó
  const futuro: Ciclo = { ancla: 20, inicio: '2026-05-20' };
  assert.equal(estadoDe('2026-05-15', futuro), 'PagadaSinIniciar');
  // N=10
  assert.equal(estadoDe('2026-05-01', ciclo, 10), 'PorVencer');
});

// §3.4: el estado usa la zona local de Montevideo aunque el reloj venga de otro lugar
test('último día 23:59 Montevideo: «Vence hoy»; 00:00 del día siguiente: «Vencida»', () => {
  const ciclo: Ciclo = { ancla: 12, inicio: '2026-04-12' }; // último día 2026-05-11
  // 23:59 de Montevideo = 02:59 UTC del 12/05 (UY es UTC-3 todo el año)
  const t2359 = Date.UTC(2026, 4, 12, 2, 59);
  const t0000 = Date.UTC(2026, 4, 12, 3, 0);
  assert.equal(hoyLocal(t2359), '2026-05-11');
  assert.equal(estadoDe(hoyLocal(t2359), ciclo), 'VenceHoy');
  assert.equal(hoyLocal(t0000), '2026-05-12');
  assert.equal(estadoDe(hoyLocal(t0000), ciclo), 'Vencida');
});

test('diasRestantes y fecha de aviso', () => {
  const ciclo: Ciclo = { ancla: 12, inicio: '2026-04-12' };
  assert.equal(diasRestantes(ciclo, '2026-05-05'), 6);
  assert.equal(diasRestantes(ciclo, '2026-05-11'), 0);
  assert.equal(diasRestantes(ciclo, '2026-05-12'), -1);
  assert.equal(fechaAviso(ciclo, 10), '2026-05-01');
  assert.equal(fechaAviso(ciclo, 7), '2026-05-04');
});

test('proximoInicio valida el ancla y recorta meses cortos', () => {
  assert.equal(proximoInicio('2026-01-31', 31), '2026-02-28');
  assert.equal(proximoInicio('2028-01-31', 31), '2028-02-29');
  assert.equal(proximoInicio('2026-02-28', 31), '2026-03-31'); // vuelve al ancla
  assert.equal(proximoInicio('2026-01-05', 5), '2026-02-05');
  assert.equal(proximoInicio('2026-12-31', 31), '2027-01-31'); // cambio de año
  assert.throws(() => proximoInicio('2026-01-31', 0));
  assert.throws(() => proximoInicio('2026-01-31', 32));
});

test('«Terminar mensualidad hoy» acorta el ciclo y no admite fechas fuera de él', () => {
  const ciclo: Ciclo = { ancla: 12, inicio: '2026-04-12' }; // último día 11/05
  assert.deepEqual(terminarHoy(ciclo, '2026-04-30'), { fin: '2026-04-30' });
  assert.equal(estadoDe('2026-05-01', { ancla: 12, inicio: '2026-04-12' }), 'Vigente'); // el cierre lo registra la app, no el dominio
  assert.throws(() => terminarHoy(ciclo, '2026-04-01')); // antes del inicio
  assert.throws(() => terminarHoy(ciclo, '2026-05-15')); // ya vencida
});
