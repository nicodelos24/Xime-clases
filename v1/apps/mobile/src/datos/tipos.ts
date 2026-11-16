/**
 * Tipos de datos de I1: alumno, ocurrencia de clase y programación.
 * Son conceptos distintos: alumno ≠ modalidad ≠ programación ≠ clase efectiva ≠ pago.
 * En I1 no hay clase efectiva ni pago registrados: solo estados visuales con fixtures.
 * Sin Supabase, sin autenticación, sin comandos financieros.
 */

export type Modalidad = 'mensual' | 'individual';

export interface Alumno {
  /** Identificador estable. */
  id: string;
  /** Nombre para mostrar (ficticio). */
  nombre: string;
  /** Modalidad actual del alumno según su ficha. */
  modalidad: Modalidad;
  /** Fecha de alta AAAA-MM-DD local (America/Montevideo). */
  fechaAlta: string;
  /** Sigue visible aunque deje de venir. */
  activo: boolean;
}

/** Ocurrencia de clase de la agenda: una fecha y hora concretas del grupo. */
export interface Ocurrencia {
  id: string;
  /** Fecha AAAA-MM-DD local. */
  fecha: string;
  /** Hora HH:mm local. */
  hora: string;
  /** Una ocurrencia cancelada no cuenta como «vienen». */
  estado: 'programada' | 'cancelada';
}

/**
 * Programación: la relación alumno–ocurrencia. Agendar/retirar toca solo esta
 * relación; nunca la ficha, la asistencia, la mensualidad ni el dinero.
 */
export interface Programacion {
  id: string;
  alumnoId: string;
  ocurrenciaId: string;
  /** Retirar marca inactiva (trazable); no se borra la ficha ni la ocurrencia. */
  activa: boolean;
}

export type FiltroAlumnos = 'todos' | 'mensual' | 'individual';
export type OrdenAlumnos = 'recientes' | 'mensual-primero' | 'individual-primero';
