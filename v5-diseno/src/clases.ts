/**
 * Dominio de la clase grupal (v5): estado, auto-marcado por hora y cancelación.
 *
 * Reglas (v5/PLAN.md §2, actualizado 20/11):
 *  - Programada → (terminó la duración) → Dada (automática) → o Cancelada (manual).
 *    Una clase sigue «Por dar» mientras se está dictando, incluso al cruzar
 *    la medianoche; recién se marca Dada al inicio + duración (zona Montevideo).
 *  - El auto-marcado corre con el reloj `America/Montevideo`, inyectado.
 *    Una clase jamás se marca dada antes de su fecha y hora.
 *  - Cancelar una clase ya dada permite revertir a Programada (con motivo).
 *  - La clase cancelada no genera deuda ni prórroga; queda registrada para
 *    auditoría (fecha, hora, motivo, quién canceló, mensajes enviados sí/no).
 *  - Nunca se borra una clase.
 *
 * Puro: sin `Date.now()`, sin DOM, sin estado global. El reloj entra por
 * parámetro; los tests usan `relojFalso`.
 */
import { diasDeFecha, fechaDesdeDias, etiquetaDia } from './fechas.ts';
import {
  hoyLocal, minutosLocales, parsearMinutos, formatoHora,
  partesDe, type InstanteMs, type Reloj, ZONA,
} from './reloj.ts';

export type EstadoClase = 'programada' | 'dada' | 'cancelada';

export type AlumnoDeClase = {
  id: string;
  nombre: string;
  /** Normalizado para armar el deep link: "598 99 123 456" o "+59899123456". */
  telefono: string;
};

export type CanalMensaje = 'masivo' | 'individual' | 'ninguno';

export type RegistroCancelacion = {
  fecha: string; // "AAAA-MM-DD" del día en que se canceló
  minutos: number; // hora local de la cancelación (desde 00:00)
  motivo: string;
  quien: string; // "dueño"
  mensajesEnviados: CanalMensaje | null;
};

/**
 * Evento de auditoría de una clase: lo que pasó y quién lo hizo. Nunca se
 * borra ni se reescribe: se agrega al final de `Clase.eventos`. Es el
 * contrato que en la Fase 4 pasa a ser una tabla (sin cambiar la UI).
 */
export type EventoClase =
  | { tipo: 'cancelada'; registro: RegistroCancelacion }
  | {
    tipo: 'marcada-manual';
    fecha: string;
    minutos: number;
    quien: string;
  }
  | {
    tipo: 'marca-manual-deshecha';
    fecha: string;
    minutos: number;
    quien: string;
  }
  | {
    tipo: 'revertida';
    fecha: string;
    minutos: number;
    motivo: string;
    quien: string;
    /** La cancelación que se deshizo, tal cual quedó registrada. */
    cancelacion: RegistroCancelacion;
  }
  | {
    tipo: 'reprogramada';
    fecha: string;
    minutos: number;
    fechaAnterior: string;
    fechaNueva: string;
    quien: string;
    /** Cancelación previa, si la clase se reprogramó estando cancelada. */
    cancelacionAnterior: RegistroCancelacion | null;
  }
  | { tipo: 'mensajes'; canal: CanalMensaje };

export type Clase = {
  id: string;
  nombre: string;
  /** Día civil de la clase. */
  fecha: string;
  /** Minutos desde 00:00 en America/Montevideo (15:00 → 900). */
  minutos: number;
  duracionMin: number;
  alumnos: AlumnoDeClase[];
  estado: EstadoClase;
  /** Instante en que se marcó "dada" (solo si estado = "dada"). */
  marcadaEn: InstanteMs | null;
  cancelacion: RegistroCancelacion | null;
  /** Auditoría append-only: cancelaciones, reversiones, reprogramaciones. */
  eventos: EventoClase[];
  /** Si la clase es una ocurrencia de una rutina semanal, su plantilla. */
  rutinaId?: string;
  /** Fecha original en la serie (antes de moverla), para marcar la excepción. */
  fechaRutina?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Desplazamiento UTC − local en minutos de un día concreto
 * (Uruguay hoy es UTC−3: −180). Se deriva del propio `Intl`, así si cambia
 * el horario de verano no hay que tocar nada.
 */
function desplazamientoUtcMin(diasCivil: number): number {
  const muestra = diasCivil * 86400000 + 12 * 3600000; // 12:00 UTC del día
  const { hh, mm } = partesDe(muestra);
  return hh * 60 + mm - 720;
}

/** Minutos desde 00:00 de un día UTC, en la zona del instituto. */
function minutosUtcDia(diasCivil: number, minutos: number): InstanteMs {
  return diasCivil * 86400000 + (minutos - desplazamientoUtcMin(diasCivil)) * 60000;
}

/** Minuto exacto en que la clase empieza (instante UTC del instante local). */
export function instanteInicio(c: Clase): InstanteMs {
  return minutosUtcDia(diasDeFecha(c.fecha), c.minutos);
}

/**
 * Minuto exacto en que la clase TERMINA (instante UTC del instante local).
 * La duración puede cruzar la medianoche: 23:00 + 120 min → 01:00 del día
 * siguiente. Se deriva el desplazamiento del día civil de fin, para que el
 * cálculo siga siendo correcto si algún día cambia el horario de verano.
 */
export function instanteFin(c: Clase): InstanteMs {
  const inicioDia = diasDeFecha(c.fecha);
  const total = c.minutos + c.duracionMin;
  const diasExtra = Math.floor(total / 1440);
  const minutosDelDia = total % 1440;
  const finDia = inicioDia + diasExtra;
  return minutosUtcDia(finDia, minutosDelDia);
}

export type ClaseNueva = {
  id: string;
  nombre: string;
  fecha: string;
  /** "HH:MM" o minutos. */
  hora: string | number;
  duracionMin?: number;
  alumnos?: AlumnoDeClase[];
  /** Ocurrencia de una rutina semanal. */
  rutinaId?: string;
  fechaRutina?: string;
};

/** Crea una clase en estado Programada. Lanza si la fecha u hora no valen. */
export function crearClase(spec: ClaseNueva): Clase {
  const minutos = typeof spec.hora === 'number' ? spec.hora : parsearMinutos(spec.hora);
  if (!Number.isInteger(minutos) || minutos < 0 || minutos > 1439) {
    throw new Error(`Hora inválida: ${spec.hora}`);
  }
  const spec2 = { ...spec } as { fecha: string };
  // valida la fecha sin reloj
  const fecha = spec2.fecha;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error(`Fecha inválida: ${JSON.stringify(fecha)}`);
  diasDeFecha(fecha); // lanza si el calendario no la admite
  return {
    id: spec.id,
    nombre: spec.nombre,
    fecha,
    minutos,
    duracionMin: spec.duracionMin ?? 60,
    alumnos: spec.alumnos ?? [],
    estado: 'programada',
    marcadaEn: null,
    cancelacion: null,
    eventos: [],
    ...(spec.rutinaId ? { rutinaId: spec.rutinaId } : {}),
    ...(spec.fechaRutina ? { fechaRutina: spec.fechaRutina } : {}),
  };
}

/** ¿La fecha y hora de INICIO de la clase ya pasaron según `ahora`? */
export function inicioPasado(c: Clase, ahora: InstanteMs): boolean {
  return instanteInicio(c) <= ahora;
}

/** ¿La clase ya TERMINÓ según `ahora`? (inicio + duración, cruce de medianoche incluido). */
export function finPasado(c: Clase, ahora: InstanteMs): boolean {
  return instanteFin(c) <= ahora;
}

/**
 * Auto-marcado (20/11, decisión de Nico): la clase sigue «Por dar» DURANTE
 * todo el horario, incluso si cruza la medianoche, y pasa a «Dada» sola
 * recién al TERMINAR (inicio + duración). Idempotente: no re-marcia clases
 * dadas ni canceladas. Se usa tanto al abrir/volver como con la app abierta.
 */
export function marcarSiPasada(c: Clase, ahora: InstanteMs): Clase {
  if (c.estado !== 'programada') return c;
  if (!finPasado(c, ahora)) return c;
  return { ...c, estado: 'dada', marcadaEn: ahora };
}

/** Reconcilia toda la colección (lo que corre al abrir la app o con el cron). */
export function reconciliar(clases: Clase[], ahora: InstanteMs): Clase[] {
  return clases.map((c) => marcarSiPasada(c, ahora));
}

/** Opciones para marcar dada a mano (20/11, decisión de Nico). */
export type OpcionMarcar = { quien: string; ahora: InstanteMs };

/**
 * Marca dada una clase programada a pedido del dueño, aunque su hora no haya
 * llegado. Queda en la auditoría quién lo hizo y cuándo, y se puede deshacer.
 */
export function marcarDada(c: Clase, op: OpcionMarcar): Clase {
  if (c.estado === 'cancelada') throw new Error('No se puede marcar dada una clase cancelada');
  if (c.estado === 'dada') return c;
  if (!op.quien.trim()) throw new Error('La marca manual necesita quién la hace');
  return {
    ...c,
    estado: 'dada',
    marcadaEn: op.ahora,
    eventos: [
      ...(c.eventos ?? []),
      {
        tipo: 'marcada-manual' as const,
        fecha: hoyLocal(op.ahora),
        minutos: minutosLocales(op.ahora),
        quien: op.quien.trim(),
      },
    ],
  };
}

/**
 * Deshace una marca manual: vuelve a Programada sin borrar el evento previo
 * (auditoría append-only). Solo aplica si el último evento fue esa marca.
 */
export function deshacerMarcada(c: Clase, op: OpcionMarcar): Clase {
  if (c.estado !== 'dada' || c.eventos.at(-1)?.tipo !== 'marcada-manual') {
    throw new Error('Solo se deshace una clase marcada a mano');
  }
  if (!op.quien.trim()) throw new Error('La reversión necesita quién la hace');
  return {
    ...c,
    estado: 'programada',
    marcadaEn: null,
    eventos: [
      ...c.eventos,
      {
        tipo: 'marca-manual-deshecha' as const,
        fecha: hoyLocal(op.ahora),
        minutos: minutosLocales(op.ahora),
        quien: op.quien.trim(),
      },
    ],
  };
}

export type OpcionCancelar = { motivo: string; quien: string; ahora: InstanteMs };

/**
 * Cancela una clase programada (o dada, si fue un error del dueño).
 * Cancelada ≠ dada: no genera deuda ni prórroga.
 */
export function cancelarClase(c: Clase, op: OpcionCancelar): Clase {
  if (c.estado === 'cancelada') return c;
  // Punto 3: el motivo es opcional. Si no se da, la auditoría registra
  // "sin motivo" (antes era obligatorio y bloqueaba la cancelación).
  if (!op.quien.trim()) throw new Error('La cancelación necesita quién la hace');
  const registro: RegistroCancelacion = {
    fecha: hoyLocal(op.ahora),
    minutos: minutosLocales(op.ahora),
    motivo: op.motivo.trim() || 'sin motivo',
    quien: op.quien.trim(),
    mensajesEnviados: null,
  };
  return {
    ...c,
    estado: 'cancelada',
    marcadaEn: null,
    cancelacion: registro,
    eventos: [...(c.eventos ?? []), { tipo: 'cancelada', registro }],
  };
}

export type OpcionReprogramar = { quien: string; ahora: InstanteMs };

/**
 * Punto 2: cambiar una clase de día (reprogramar). Vuelve a Programada con la
 * nueva fecha; se limpia el marcado de "dada" para que la reconciliación no la
 * vuelva a marcar hasta la hora del nuevo día. Queda registrado en `eventos`
 * quién reprogramó y, si estaba cancelada, la cancelación anterior completa
 * (con quién la había cancelado). Nunca se borra la clase (regla vigente).
 */
export function reprogramarClase(c: Clase, fechaNueva: string, op: OpcionReprogramar): Clase {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNueva)) throw new Error(`Fecha inválida: ${JSON.stringify(fechaNueva)}`);
  diasDeFecha(fechaNueva); // valida día real (bisiestos, meses)
  if (!op.quien.trim()) throw new Error('La reprogramación necesita quién la hace');
  return {
    ...c,
    fecha: fechaNueva,
    estado: 'programada',
    marcadaEn: null,
    cancelacion: null,
    eventos: [
      ...(c.eventos ?? []),
      {
        tipo: 'reprogramada',
        fecha: hoyLocal(op.ahora),
        minutos: minutosLocales(op.ahora),
        fechaAnterior: c.fecha,
        fechaNueva,
        quien: op.quien.trim(),
        cancelacionAnterior: c.cancelacion,
      },
    ],
  };
}

/**
 * Revierte una cancelación a Programada (plan §2.1: cancelar una clase ya
 * dada es un error del dueño y también se revierte). Si la hora ya pasó, la
 * siguiente reconciliación la volverá a marcar Dada sola.
 */
export function deshacerCancelacion(c: Clase, op: OpcionCancelar): Clase {
  if (c.estado !== 'cancelada' || !c.cancelacion) throw new Error('Solo se revierte una clase cancelada');
  if (!op.quien.trim()) throw new Error('La reversión necesita quién la hace');
  if (!op.motivo.trim()) throw new Error('La reversión necesita un motivo');
  return {
    ...c,
    estado: 'programada',
    marcadaEn: null,
    cancelacion: null,
    eventos: [
      ...(c.eventos ?? []),
      {
        tipo: 'revertida',
        fecha: hoyLocal(op.ahora),
        minutos: minutosLocales(op.ahora),
        motivo: op.motivo.trim(),
        quien: op.quien.trim(),
        // La cancelación deshecha no se pierde: queda en la auditoría.
        cancelacion: c.cancelacion,
      },
    ],
  };
}

/** Registra en la auditoría de la cancelación qué salió por WhatsApp. */
export function registrarMensajeEnviado(c: Clase, canal: CanalMensaje): Clase {
  if (c.estado !== 'cancelada' || !c.cancelacion) {
    throw new Error('Los mensajes de cancelación se registran sobre una clase cancelada');
  }
  return {
    ...c,
    cancelacion: { ...c.cancelacion, mensajesEnviados: canal },
    eventos: [...(c.eventos ?? []), { tipo: 'mensajes', canal }],
  };
}

/** Chip de estado para la UI: "Programada" | "Dada" | "Cancelada". */
export function etiquetaEstado(c: Clase): string {
  return c.estado.charAt(0).toUpperCase() + c.estado.slice(1);
}

/** "15:00" para la línea de tiempo. */
export function horaClase(c: Clase): string {
  return formatoHora(c.minutos);
}

/** "martes 18 de noviembre" — la usan los mensajes de WhatsApp. */
export { etiquetaDia };

/** Minuto en que termina la clase. */
export function finClase(c: Clase): number {
  return c.minutos + c.duracionMin;
}

/** Hoy en la zona del instituto, para arrancar la vista Hoy. */
export function hoyEnZona(reloj: Reloj): string {
  return hoyLocal(reloj.ahora());
}

export { ZONA };
