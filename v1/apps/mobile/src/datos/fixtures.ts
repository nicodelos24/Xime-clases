/**
 * Fixtures de I1: datos ficticios, claramente marcados como demostración.
 * Sin datos reales, sin secretos. Cambios solo en memoria: la app no promete
 * guardado entre sesiones (eso es I2–I3).
 *
 * Escenarios cubiertos (adenda visual §Contratos):
 * - mezcla mensual/individual,
 * - fechas vacías y ocupadas, varios horarios,
 * - misma persona en dos ocurrencias el mismo día (1 persona, 2 programaciones),
 * - alumno que lleva tiempo sin venir y se reagendar,
 * - una ocurrencia cancelada (no cuenta como «vienen»).
 */

import type { Alumno, Ocurrencia, Programacion } from './tipos.ts';

export const ALUMNOS_FIXTURES: Alumno[] = [
  { id: 'a-bruno', nombre: 'Bruno S.', modalidad: 'mensual', fechaAlta: '2026-09-02', activo: true },
  { id: 'a-carla', nombre: 'Carla T.', modalidad: 'mensual', fechaAlta: '2026-08-11', activo: true },
  { id: 'a-diego', nombre: 'Diego V.', modalidad: 'individual', fechaAlta: '2026-10-28', activo: true },
  { id: 'a-elena', nombre: 'Elena R.', modalidad: 'individual', fechaAlta: '2026-10-05', activo: true },
  { id: 'a-fabio', nombre: 'Fabio L.', modalidad: 'mensual', fechaAlta: '2026-07-19', activo: true },
  { id: 'a-gabi', nombre: 'Gabriela P.', modalidad: 'mensual', fechaAlta: '2026-11-03', activo: true },
  // Dejó de venir en septiembre; sigue visible (no se oculta ni se duplica).
  { id: 'a-rosa', nombre: 'Rosa M.', modalidad: 'individual', fechaAlta: '2026-06-24', activo: true },
];

function oc(id: string, fecha: string, hora: string, estado: 'programada' | 'cancelada' = 'programada'): Ocurrencia {
  return { id, fecha, hora, estado };
}

/** Semana base: lunes 16/11 a domingo 22/11 de 2026. */
export const OCURRENCIAS_FIXTURES: Ocurrencia[] = [
  oc('o-16-1', '2026-11-16', '16:00'),
  oc('o-16-2', '2026-11-16', '18:30'),
  oc('o-17-1', '2026-11-17', '17:00'),
  oc('o-18-1', '2026-11-18', '16:00'),
  oc('o-19-1', '2026-11-19', '18:30'),
  oc('o-20-1', '2026-11-20', '10:00', 'cancelada'),
  oc('o-22-1', '2026-11-22', '11:00'),
  // Mes siguiente, para la vista Mes.
  oc('o-24-1', '2026-11-24', '16:00'),
  oc('o-30-1', '2026-11-30', '18:30'),
];

function prog(id: string, alumnoId: string, ocurrenciaId: string, activa = true): Programacion {
  return { id, alumnoId, ocurrenciaId, activa };
}

export const PROGRAMACIONES_FIXTURES: Programacion[] = [
  prog('p-001', 'a-bruno', 'o-16-1'),
  prog('p-002', 'a-carla', 'o-16-1'),
  prog('p-003', 'a-diego', 'o-16-2'),
  // Elena: dos ocurrencias el mismo día → 1 persona, 2 programaciones.
  prog('p-004', 'a-elena', 'o-17-1'),
  prog('p-005', 'a-elena', 'o-18-1'),
  prog('p-006', 'a-fabio', 'o-19-1'),
  // Rosa lleva tiempo sin venir: su única programación es de septiembre (retirada).
  prog('p-007', 'a-rosa', 'o-16-1', false),
  prog('p-008', 'a-gabi', 'o-22-1'),
  prog('p-009', 'a-carla', 'o-24-1'),
];

export const FECHA_BASE_FIXTURES = '2026-11-15';
