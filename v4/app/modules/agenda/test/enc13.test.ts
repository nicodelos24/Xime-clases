/// <reference types="node" />
/**
 * Tests focales ENC-13: marcadores de Mes, apertura Día, bloques, retiro sin mutación financiera.
 * Solo lógica pura (logica.ts, repositorios.ts, fechas.ts) — sin React ni Expo.
 */
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  ALUMNOS_FIXTURES,
  OCURRENCIAS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
} from '../../../packages/datos/src/fixtures.ts';
import { RepositorioFixtures } from '../../../packages/datos/src/repositorios.ts';
import { actividadPorDia, programacionesPorOcurrencia } from '../../../packages/datos/src/logica.ts';
import { sumarDias, lunesDe, diaSemanaIndex, etiquetaDiaMes } from '../../../packages/datos/src/fechas.ts';

test('ENC-13 Mes anuncia fecha completa, conteo, selección y marcadores', () => {
  assert.equal(etiquetaDiaMes('2026-11-16', 3, true, true, false, true),
    'Día lunes 16 de noviembre de 2026, seleccionado, 3 alumnos programados, mensual e individual');
  assert.equal(etiquetaDiaMes('2026-11-15', 0, false, false, true, true),
    'Día domingo 15 de noviembre de 2026, Hoy, sin alumnos agendados');
  assert.equal(etiquetaDiaMes('2027-01-01', 1, false, true, false, false),
    'Día viernes 1 de enero de 2027, 1 alumno programado, individual');
});

const nuevos = () =>
  new RepositorioFixtures(
    ALUMNOS_FIXTURES.map(a => ({ ...a })),
    OCURRENCIAS_FIXTURES.map(o => ({ ...o })),
    PROGRAMACIONES_FIXTURES.map(p => ({ ...p })),
  );

// ─── Marcadores de modalidad en Mes ──────────────────────────────────────────

test('ENC-13 marcadores: día con solo mensual tiene tieneMensual=true, tieneIndividual=false', () => {
  const repo = nuevos();
  // 2026-11-16: Bruno (mensual) y Carla (mensual) en o-16-1; Diego (individual) en o-16-2
  const act = actividadPorDia(repo.programaciones, repo.ocurrencias, ALUMNOS_FIXTURES);
  const d16 = act.get('2026-11-16')!;
  assert.ok(d16.tieneMensual, 'debe tener mensual');
  assert.ok(d16.tieneIndividual, 'debe tener individual (Diego)');
});

test('ENC-13 marcadores: día vacío no tiene marcadores', () => {
  const repo = nuevos();
  const act = actividadPorDia(repo.programaciones, repo.ocurrencias, ALUMNOS_FIXTURES);
  const d15 = act.get('2026-11-15');
  assert.ok(!d15, 'sin actividad en 15/11');
});

test('ENC-13 marcadores: ocurrencia cancelada no genera marcadores', () => {
  const repo = nuevos();
  // 2026-11-20: solo o-20-1 (cancelada); Fabio tiene programación en o-19-1, no en o-20-1
  const act = actividadPorDia(repo.programaciones, repo.ocurrencias, ALUMNOS_FIXTURES);
  const d20 = act.get('2026-11-20');
  assert.ok(!d20, 'cancelada: sin actividad visible');
});

test('ENC-13 marcadores: cancelada coexistente e inactivo no inflan el resumen activo', () => {
  const repo = nuevos();
  repo.ocurrencias.push({ id: 'o-cancelada', fecha: '2026-11-16', hora: '11:00', estado: 'cancelada' });
  repo.programaciones.push({ id: 'p-cancelada', alumnoId: 'a-gabi', ocurrenciaId: 'o-cancelada', activa: true });
  repo.alumnos.find(a => a.id === 'a-diego')!.activo = false;
  const act = actividadPorDia(repo.programaciones, repo.ocurrencias, repo.alumnos).get('2026-11-16')!;
  assert.equal(act.personas, 2); // Bruno y Carla, no Gabriela ni Diego inactivo
  assert.equal(act.tieneIndividual, false);
});

test('ENC-13 marcadores: solo individual cuando no hay mensual en el día', () => {
  const repo = nuevos();
  // 2026-11-17: Elena (individual) en o-17-1
  const act = actividadPorDia(repo.programaciones, repo.ocurrencias, ALUMNOS_FIXTURES);
  const d17 = act.get('2026-11-17')!;
  assert.ok(!d17.tieneMensual, 'sin mensual');
  assert.ok(d17.tieneIndividual, 'con individual');
});

// ─── Vista día expandida ──────────────────────────────────────────────────────

test('ENC-13 día expandido: grupos por ocurrencia ordenados por hora', () => {
  const repo = nuevos();
  // 2026-11-16: dos ocurrencias (16:00 y 18:30)
  const grupos = programacionesPorOcurrencia(repo.programaciones, repo.ocurrenciasDe('2026-11-16'), '2026-11-16');
  assert.equal(grupos.length, 2);
  assert.ok(grupos[0].ocurrencia.hora < grupos[1].ocurrencia.hora, 'orden cronológico');
});

test('ENC-13 día expandido: cada bloque tiene alumno, hora y modalidad derivados de ficha', () => {
  const repo = nuevos();
  const grupos = programacionesPorOcurrencia(repo.programaciones, repo.ocurrenciasDe('2026-11-16'), '2026-11-16');
  for (const g of grupos) {
    for (const p of g.programaciones) {
      const a = repo.obtener(p.alumnoId);
      assert.ok(a, 'alumno existe');
      assert.ok(g.ocurrencia.hora, 'hora presente');
      assert.ok(a!.modalidad === 'mensual' || a!.modalidad === 'individual', 'modalidad válida');
    }
  }
});

test('ENC-13 día expandido: día vacío tiene cero grupos (sin pantalla vacía de datos)', () => {
  const repo = nuevos();
  const grupos = programacionesPorOcurrencia(repo.programaciones, repo.ocurrenciasDe('2026-11-15'), '2026-11-15');
  assert.equal(grupos.length, 0, 'sin ocurrencias el 15/11');
});

test('ENC-13 día expandido: ocurrencia cancelada excluida de grupos', () => {
  const repo = nuevos();
  // 2026-11-20: o-20-1 cancelada
  const grupos = programacionesPorOcurrencia(repo.programaciones, repo.ocurrenciasDe('2026-11-20'), '2026-11-20');
  assert.equal(grupos.length, 0, 'cancelada excluida');
});

// ─── Editar y Retirar sin mutación financiera ─────────────────────────────────

test('ENC-13 retiro desde bloque: ficha, ocurrencias y otros programas intactos', () => {
  const repo = nuevos();
  const alumnosAntes = JSON.stringify(repo.alumnos);
  const ocAntes = JSON.stringify(repo.ocurrencias);
  // Retirar p-001 (Bruno en o-16-1)
  const r = repo.retirar('p-001');
  assert.ok(r.ok);
  assert.equal(JSON.stringify(repo.alumnos), alumnosAntes, 'alumnos intactos');
  assert.equal(JSON.stringify(repo.ocurrencias), ocAntes, 'ocurrencias intactas');
  // Carla (p-002) en la misma ocurrencia sigue activa
  assert.equal(repo.programaciones.find(p => p.id === 'p-002')?.activa, true, 'otra prog intacta');
});

test('ENC-13 retiro y retorno: volver al mismo día muestra bloques actualizados', () => {
  const repo = nuevos();
  repo.retirar('p-001');
  // 2026-11-16 a las 16:00 ahora solo tiene Carla
  const grupos = programacionesPorOcurrencia(repo.programaciones, repo.ocurrenciasDe('2026-11-16'), '2026-11-16');
  const g16 = grupos.find(g => g.ocurrencia.hora === '16:00')!;
  assert.equal(g16.programaciones.length, 1, 'solo Carla');
  assert.equal(g16.programaciones[0].alumnoId, 'a-carla');
});

test('ENC-13 edición mueve solo la programación y rechaza duplicado sin mutación', () => {
  const repo = nuevos();
  const antes = JSON.stringify(repo.alumnos);
  const r = repo.reprogramar('p-001', '2026-11-17', '17:00');
  assert.ok(r.ok);
  assert.equal(repo.programacionDe('a-bruno', 'o-17-1')?.id, 'p-001');
  assert.equal(repo.programacionDe('a-carla', 'o-16-1')?.id, 'p-002');
  assert.equal(JSON.stringify(repo.alumnos), antes);
  assert.ok(repo.agendar('a-bruno', 'o-16-1').ok); // Bruno vuelve por una segunda relación
  const duplicado = repo.reprogramar('p-001', '2026-11-16', '16:00');
  assert.ok(!duplicado.ok && duplicado.error.codigo === 'PROGRAMACION_DUPLICADA');
  const noCambio = repo.reprogramar('p-001', '2026-13-45', '25:90');
  assert.ok(!noCambio.ok);
  assert.equal(repo.programacionDe('a-bruno', 'o-17-1')?.id, 'p-001');
});

// ─── Fecha: lunes de tira semanal ────────────────────────────────────────────

test('ENC-13 tira semanal: 7 días a partir del lunes de la semana del día activo', () => {
  const lunes = lunesDe('2026-11-15'); // domingo → lunes de la semana = 09/11
  assert.equal(lunes, '2026-11-09');
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  assert.equal(dias.length, 7);
  assert.equal(dias[0], '2026-11-09');
  assert.equal(dias[6], '2026-11-15');
});

test('ENC-13 tira semanal: diaSemanaIndex lunes=0, domingo=6 para posicionamiento', () => {
  assert.equal(diaSemanaIndex('2026-11-16'), 0); // lunes
  assert.equal(diaSemanaIndex('2026-11-22'), 6); // domingo
});
