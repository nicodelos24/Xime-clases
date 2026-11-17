/**
 * Lógica pura del resumen Hoy: qué ver y cuándo, sin React y sin dinero.
 * Deriva todo de las relaciones activas; no mantiene contadores aparte.
 * I1 no registra pagos ni clases efectivas: las tarjetas de cobro/vencidos
 * quedan con valores neutros y el texto límite lo pone la pantalla.
 */

import type { Alumno, Ocurrencia, Programacion } from './tipos.ts';

export interface ClaseDelDia {
  programacionId: string;
  alumnoId: string;
  nombre: string;
  hora: string;
  modalidad: 'mensual' | 'individual';
  /** Marcada como dada en esta sesión (estado visual I1, no asistencia real). */
  dada: boolean;
}

export interface ResumenHoy {
  /** Clases dadas / total de programaciones activas del día. */
  dadas: number;
  total: number;
  clases: ClaseDelDia[];
}

/** Persona singular para el saludo: nombre de pila o «Xime». */
export function saludoPorHora(hora: number): string {
  if (hora < 13) return 'Buenos días';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Clases del día ordenadas por hora, con la marca visual «dada». */
export function clasesDelDia(
  alumnos: Alumno[],
  ocurrencias: Ocurrencia[],
  programaciones: Programacion[],
  fecha: string,
  dadas: ReadonlySet<string>,
): ClaseDelDia[] {
  const alumnosPorId = new Map(alumnos.map((a) => [a.id, a]));
  return ocurrencias
    .filter((o) => o.fecha === fecha && o.estado !== 'cancelada')
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .flatMap((o) =>
      programaciones
        .filter((p) => p.activa && p.ocurrenciaId === o.id)
        .map((p) => {
          const a = alumnosPorId.get(p.alumnoId);
          if (!a || !a.activo) return null;
          const c: ClaseDelDia = {
            programacionId: p.id,
            alumnoId: a.id,
            nombre: a.nombre,
            hora: o.hora,
            modalidad: a.modalidad,
            dada: dadas.has(p.id),
          };
          return c;
        }),
    )
    .filter((c): c is ClaseDelDia => c !== null);
}

/** Total de programaciones activas del día (base del anillo). */
export function totalClasesDelDia(
  alumnos: Alumno[],
  ocurrencias: Ocurrencia[],
  programaciones: Programacion[],
  fecha: string,
): number {
  return clasesDelDia(alumnos, ocurrencias, programaciones, fecha, new Set()).length;
}

/** Fracción del anillo 0..1; sin clases devuelve 0 (no NaN). */
export function fraccionAnillo(dadas: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, dadas / total));
}
