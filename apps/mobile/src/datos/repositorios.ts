/**
 * Repositorios de I1: contratos de lectura y comandos separados, con errores
 * explícitos. La implementación inicial usa fixtures en memoria (repositorio
 * de fixtures). No hay red, Supabase ni persistencia: los cambios viven solo
 * durante la sesión de la app y los datos son ficticios.
 */

import type { Alumno, Ocurrencia, Programacion } from './tipos.ts';
import type { FiltroAlumnos, OrdenAlumnos } from './tipos.ts';
import { filtrarYOrdenarAlumnos } from './logica.ts';

export interface LecturaAlumnos {
  listar(filtro: FiltroAlumnos, orden: OrdenAlumnos): Alumno[];
  obtener(id: string): Alumno | undefined;
}

export interface LecturaAgenda {
  ocurrenciasDe(fecha: string): Ocurrencia[];
  programacionesActivas(fecha: string): Programacion[];
  programacionDe(alumnoId: string, ocurrenciaId: string): Programacion | undefined;
}

export type ErrorComando =
  | { codigo: 'ALUMNO_INEXISTENTE'; mensaje: string }
  | { codigo: 'OCURRENCIA_INEXISTENTE'; mensaje: string }
  | { codigo: 'OCURRENCIA_CANCELADA'; mensaje: string }
  | { codigo: 'PROGRAMACION_DUPLICADA'; mensaje: string };

export type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; error: ErrorComando };

/** Comandos de programación: solo tocan la relación alumno–ocurrencia. */
export interface ComandosProgramacion {
  agendar(
    alumnoId: string,
    ocurrenciaId: string,
    /* clave idempotente para doble toque */ idempotencia?: string,
  ): Resultado<Programacion>;
  retirar(programacionId: string): Resultado<void>;
}

let contador = 0;
function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}-${contador.toString().padStart(6, '0')}`;
}

/**
 * Repositorio de fixtures. `programaciones` y `ocurrencias` se mutan en
 * memoria al agendar/retirar: simulación explícita, sin guardado real.
 */
export class RepositorioFixtures
  implements LecturaAlumnos, LecturaAgenda, ComandosProgramacion
{
  readonly alumnos: Alumno[];
  readonly ocurrencias: Ocurrencia[];
  readonly programaciones: Programacion[];

  constructor(
    alumnos: Alumno[],
    ocurrencias: Ocurrencia[],
    programaciones: Programacion[],
  ) {
    this.alumnos = alumnos;
    this.ocurrencias = ocurrencias;
    this.programaciones = programaciones;
  }

  listar(filtro: FiltroAlumnos, orden: OrdenAlumnos): Alumno[] {
    return filtrarYOrdenarAlumnos(this.alumnos, filtro, orden);
  }

  obtener(id: string): Alumno | undefined {
    return this.alumnos.find((a) => a.id === id);
  }

  ocurrenciasDe(fecha: string): Ocurrencia[] {
    return this.ocurrencias
      .filter((o) => o.fecha === fecha)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  programacionesActivas(fecha: string): Programacion[] {
    const ids = new Set(this.ocurrenciasDe(fecha).map((o) => o.id));
    return this.programaciones.filter(
      (p) => p.activa && ids.has(p.ocurrenciaId),
    );
  }

  programacionDe(
    alumnoId: string,
    ocurrenciaId: string,
  ): Programacion | undefined {
    return this.programaciones.find(
      (p) => p.activa && p.alumnoId === alumnoId && p.ocurrenciaId === ocurrenciaId,
    );
  }

  agendar(
    alumnoId: string,
    ocurrenciaId: string,
    idempotencia?: string,
  ): Resultado<Programacion> {
    const alumno = this.alumnos.find((a) => a.id === alumnoId);
    if (!alumno) {
      return {
        ok: false,
        error: { codigo: 'ALUMNO_INEXISTENTE', mensaje: `Alumno ${alumnoId} no existe` },
      };
    }
    const ocurrencia = this.ocurrencias.find((o) => o.id === ocurrenciaId);
    if (!ocurrencia) {
      return {
        ok: false,
        error: {
          codigo: 'OCURRENCIA_INEXISTENTE',
          mensaje: `Ocurrencia ${ocurrenciaId} no existe`,
        },
      };
    }
    if (ocurrencia.estado === 'cancelada') {
      return {
        ok: false,
        error: {
          codigo: 'OCURRENCIA_CANCELADA',
          mensaje: 'No se agenda sobre una clase cancelada',
        },
      };
    }
    // Anti-duplicado: misma relación activa, y clave de idempotencia para doble toque.
    const existente = this.programacionDe(alumnoId, ocurrenciaId);
    if (existente) {
      return {
        ok: false,
        error: {
          codigo: 'PROGRAMACION_DUPLICADA',
          mensaje: `${alumno.nombre} ya está programado para esa clase`,
        },
      };
    }
    if (
      idempotencia &&
      this.programaciones.some((p) => p.id === idempotencia)
    ) {
      return {
        ok: false,
        error: {
          codigo: 'PROGRAMACION_DUPLICADA',
          mensaje: 'Reintento de la misma programación',
        },
      };
    }
    const programacion: Programacion = {
      id: idempotencia ?? nuevoId('prog'),
      alumnoId,
      ocurrenciaId,
      activa: true,
    };
    this.programaciones.push(programacion);
    return { ok: true, valor: programacion };
  }

  retirar(programacionId: string): Resultado<void> {
    const p = this.programaciones.find((x) => x.id === programacionId);
    if (!p || !p.activa) {
      return {
        ok: false,
        error: {
          codigo: 'OCURRENCIA_INEXISTENTE',
          mensaje: 'La programación ya no está activa',
        },
      };
    }
    // Retira solo la relación: la ficha, la ocurrencia y el dinero quedan intactos.
    p.activa = false;
    return { ok: true, valor: undefined };
  }
}
