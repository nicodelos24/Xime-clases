/**
 * Lógica pura de Alumnos y Agenda usada por la UI y las pruebas.
 * Sin React, sin Expo, sin red. Deriva conteos y listas de las relaciones
 * activas (programaciones) y ocurrencias; no mantiene contadores independientes.
 */

import type {
  Alumno,
  FiltroAlumnos,
  Ocurrencia,
  OrdenAlumnos,
  Programacion,
} from './tipos.ts';

/** Filtra y ordena alumnos: filtro y orden son independientes entre sí. */
export function filtrarYOrdenarAlumnos(
  alumnos: Alumno[],
  filtro: FiltroAlumnos,
  orden: OrdenAlumnos,
): Alumno[] {
  const porFiltro = alumnos.filter(
    (a) => filtro === 'todos' || a.modalidad === filtro,
  );
  const porAltaDesc = (a: Alumno, b: Alumno) =>
    b.fechaAlta.localeCompare(a.fechaAlta) || a.id.localeCompare(b.id);
  const porAltaAsc = (a: Alumno, b: Alumno) =>
    a.fechaAlta.localeCompare(b.fechaAlta) || a.id.localeCompare(b.id);
  const copia = [...porFiltro];
  if (orden === 'recientes') return copia.sort(porAltaDesc);
  // Alta mezclada por modalidad, descendente dentro de cada grupo (§ encargo I1).
  return copia.sort((a, b) => {
    const grupo = (al: Alumno) =>
      orden === 'mensual-primero'
        ? al.modalidad === 'mensual'
          ? 0
          : 1
        : al.modalidad === 'individual'
          ? 0
          : 1;
    const g = grupo(a) - grupo(b);
    return g !== 0 ? g : porAltaAsc(a, b) * -1 || a.id.localeCompare(b.id);
  });
}

export interface ProgramacionesPorOcurrencia {
  ocurrencia: Ocurrencia;
  programaciones: Programacion[];
}

/** Programaciones activas por ocurrencia (solo relaciones activas y ocurrencia no cancelada). */
export function programacionesPorOcurrencia(
  programaciones: Programacion[],
  ocurrencias: Ocurrencia[],
  fecha: string,
): ProgramacionesPorOcurrencia[] {
  return ocurrencias
    .filter((o) => o.fecha === fecha)
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .map((ocurrencia) => ({
      ocurrencia,
      programaciones: programaciones.filter(
        (p) => p.activa && p.ocurrenciaId === ocurrencia.id,
      ),
    }))
    .filter((g) => g.ocurrencia.estado !== 'cancelada');
}

/** Personas únicas programadas en una fecha (una persona puede tener 2 programaciones). */
export function personasUnicasDelDia(
  programaciones: Programacion[],
  ocurrencias: Ocurrencia[],
  fecha: string,
): Set<string> {
  const idsOcurrenciasDelDia = new Set(
    ocurrencias.filter((o) => o.fecha === fecha).map((o) => o.id),
  );
  const unicas = new Set<string>();
  for (const p of programaciones) {
    if (p.activa && idsOcurrenciasDelDia.has(p.ocurrenciaId)) {
      unicas.add(p.alumnoId);
    }
  }
  return unicas;
}

export interface ActividadDia {
  fecha: string;
  /** Cantidad de personas únicas con programación activa ese día. */
  personas: number;
  /** Cantidad de programaciones activas (relaciones, no personas). */
  programaciones: number;
  tieneMensual: boolean;
  tieneIndividual: boolean;
}

/** Mapa de actividad AAAA-MM-DD → ActividadDia, derivado de relaciones activas. */
export function actividadPorDia(
  programaciones: Programacion[],
  ocurrencias: Ocurrencia[],
  alumnos: Alumno[],
): Map<string, ActividadDia> {
  const alumnosPorId = new Map(alumnos.map((a) => [a.id, a]));
  const ocPorId = new Map(ocurrencias.map((o) => [o.id, o]));
  const mapa = new Map<string, ActividadDia>();
  for (const p of programaciones) {
    if (!p.activa) continue;
    const oc = ocPorId.get(p.ocurrenciaId);
    if (!oc || oc.estado === 'cancelada') continue;
    const alumno = alumnosPorId.get(p.alumnoId);
    if (!alumno) continue;
    let act = mapa.get(oc.fecha);
    if (!act) {
      act = {
        fecha: oc.fecha,
        personas: 0,
        programaciones: 0,
        tieneMensual: false,
        tieneIndividual: false,
      };
      mapa.set(oc.fecha, act);
    }
    act.programaciones += 1;
    if (alumno.modalidad === 'mensual') act.tieneMensual = true;
    else act.tieneIndividual = true;
  }
  for (const act of mapa.values()) {
    act.personas = personasUnicasDelDia(
      programaciones,
      ocurrencias,
      act.fecha,
    ).size;
  }
  return mapa;
}
