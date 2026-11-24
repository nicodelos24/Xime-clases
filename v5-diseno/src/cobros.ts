import { diasDeFecha, diasDelMes, esFechaValida, parseFecha } from './fechas.ts';
import type { Clase } from './clases.ts';

/** Concepto del cobro. Los pagos históricos sin este campo son mensualidades. */
export type ConceptoPago = 'mensualidad' | 'clase-individual';

export type Pago = {
  id: string;
  alumnoId: string;
  periodo: string; // AAAA-MM del vencimiento que se liquida
  montoUYU: number;
  fecha: string; // AAAA-MM-DD en Montevideo
  quien: string;
  anulado: Anulacion | null;
  /** Aditivo: ausente en pagos viejos = mensualidad (nunca se reescriben). */
  concepto?: ConceptoPago;
  /** Aditivo: clase efectiva que se liquida (sólo en cobros individuales). */
  claseId?: string;
};

export type PagoNuevo = Omit<Pago, 'anulado'>;
export type Anulacion = { fecha: string; motivo: string; quien: string };

function textoNoVacio(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Valida UN pago leído de disco. Los valores inválidos se omiten (sin
 * convertirlos en pagos cero ni tocar el almacén): así no falsean KPI ni
 * historial y el período vuelve a figurar como deuda pendiente. La lectura no
 * reescribe el estado; un comando posterior sólo conserva los pagos válidos.
 */
export function normalizarPagoGuardado(dato: unknown): Pago | null {
  if (!dato || typeof dato !== 'object' || Array.isArray(dato)) return null;
  const p = dato as Record<string, unknown>;
  if (!textoNoVacio(p.id) || !textoNoVacio(p.alumnoId) || !textoNoVacio(p.quien)) return null;
  if (typeof p.periodo !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(p.periodo)) return null;
  if (typeof p.fecha !== 'string' || !esFechaValida(p.fecha)) return null;
  if (!Number.isSafeInteger(p.montoUYU) || (p.montoUYU as number) <= 0) return null;
  const concepto: ConceptoPago = p.concepto === 'clase-individual' ? 'clase-individual' : 'mensualidad';
  let anulado: Anulacion | null = null;
  if (p.anulado !== undefined && p.anulado !== null) {
    if (!p.anulado || typeof p.anulado !== 'object' || Array.isArray(p.anulado)) return null;
    const a = p.anulado as Record<string, unknown>;
    if (typeof a.fecha !== 'string' || !esFechaValida(a.fecha) || a.fecha < p.fecha) return null;
    if (!textoNoVacio(a.motivo) || !textoNoVacio(a.quien)) return null;
    anulado = { fecha: a.fecha, motivo: a.motivo.trim(), quien: a.quien.trim() };
  }
  return {
    id: p.id.trim(),
    alumnoId: p.alumnoId.trim(),
    periodo: p.periodo,
    montoUYU: p.montoUYU as number,
    fecha: p.fecha,
    quien: p.quien.trim(),
    anulado,
    // Los pagos históricos NO se reescriben: se leen como mensualidades.
    ...(p.concepto === 'clase-individual' ? { concepto: 'clase-individual' as const } : {}),
    ...(concepto === 'clase-individual' && typeof p.claseId === 'string' && p.claseId.trim() ? { claseId: p.claseId.trim() } : {}),
  };
}

/** Lee pagos de forma tolerante: conserva los válidos y omite sólo los corruptos. */
export function normalizarPagosGuardados(datos: unknown): Pago[] {
  if (!Array.isArray(datos)) return [];
  const ids = new Set<string>();
  const claves = new Set<string>();
  const resultado: Pago[] = [];
  for (const dato of datos) {
    const p = normalizarPagoGuardado(dato);
    if (!p || ids.has(p.id)) continue;
    // Un duplicado no puede duplicar KPI: mensualidad por alumno+período,
    // clase individual por alumno+clase (dos clases en un mes son dos cobros).
    const clave = p.concepto === 'clase-individual'
      ? `clase|${p.alumnoId}|${p.claseId ?? ''}`
      : `mes|${p.alumnoId}|${p.periodo}`;
    if (!p.anulado && claves.has(clave)) continue;
    ids.add(p.id);
    if (!p.anulado) claves.add(clave);
    resultado.push(p);
  }
  return resultado;
}

export function registrarPago(pagos: readonly Pago[], nuevo: PagoNuevo): Pago[] {
  const normalizado = normalizarPagoGuardado({ ...nuevo, anulado: null });
  if (!normalizado) {
    if (typeof nuevo.id !== 'string' || typeof nuevo.alumnoId !== 'string' || typeof nuevo.quien !== 'string'
      || !nuevo.id.trim() || !nuevo.alumnoId.trim() || !nuevo.quien.trim()) throw new Error('Faltan datos del pago');
    if (typeof nuevo.periodo !== 'string' || typeof nuevo.fecha !== 'string'
      || !/^\d{4}-(0[1-9]|1[0-2])$/.test(nuevo.periodo) || !esFechaValida(nuevo.fecha)) {
      throw new Error('Fecha o período inválido');
    }
    throw new Error('El monto debe ser un entero positivo en UYU');
  }
  if (pagos.some((p) => p.id === normalizado.id)) throw new Error('El pago ya está registrado');
  if (pagos.some((p) => !p.anulado && p.alumnoId === normalizado.alumnoId
    && (normalizado.concepto === 'clase-individual'
      ? p.concepto === 'clase-individual' && p.claseId === normalizado.claseId
      : p.concepto !== 'clase-individual' && p.periodo === normalizado.periodo))) {
    throw new Error(normalizado.concepto === 'clase-individual'
      ? 'Ya hay un pago activo para esta clase'
      : 'Ya hay un pago activo para este período');
  }
  return [...pagos, normalizado];
}

/** Corrige la fecha en que se pagó/renovió, dejando rastro de la corrección. */
export function corregirFechaPago(pagos: readonly Pago[], id: string, fechaNueva: string, motivo: string, quien: string, hoy: string): Pago[] {
  if (!esFechaValida(fechaNueva)) throw new Error('Fecha de pago inválida');
  const pago = pagos.find((p) => p.id === id);
  if (!pago) throw new Error('No se encontró el pago');
  if (pago.anulado) throw new Error('El pago ya está anulado');
  if (fechaNueva === pago.fecha) return [...pagos];
  if (!motivo.trim() || !quien.trim()) throw new Error('Ingresá el motivo de la corrección');
  // El ID y el alumno no cambian: la vinculación sigue siendo la misma; se
  // anula la versión anterior y se registra la corregida con ese mismo ID.
  const correccion: Pago = {
    ...pago,
    fecha: fechaNueva,
    anulado: { fecha: hoy, motivo: motivo.trim(), quien },
  };
  return pagos.map((p) => p === pago ? correccion : p);
}

export function anularPago(pagos: readonly Pago[], id: string, datos: Anulacion): Pago[] {
  const pago = pagos.find((p) => p.id === id);
  if (!pago) throw new Error('No se encontró el pago');
  if (pago.anulado) throw new Error('El pago ya está anulado');
  const motivo = datos.motivo.trim();
  if (!motivo || !datos.quien.trim()) throw new Error('Ingresá un motivo para anular el pago');
  if (!esFechaValida(datos.fecha) || datos.fecha < pago.fecha) throw new Error('Fecha de anulación inválida');
  return pagos.map((p) => p === pago ? { ...p, anulado: { ...datos, motivo } } : p);
}

/**
 * Filtrado y orden de la lista de Cobros (rediseño 23-nov, B6/B8).
 * Pure: recibe las filas de `resumenCobros` y devuelve las visibles. Sin DOM,
 * sin reloj; las reglas de vencimientos siguen en `resumenCobros`.
 *
 * Estados: «Deben» incluye lo vencido, lo que vence hoy y lo por vencer (la
 * ventana de la campana: hasta `diasAviso`); «Vencido» y «Por vencer» la
 * acotan; «Pagado» es lo liquidado del período. Se devuelven TODAS las filas
 * sin filtrar cuando no hay estado: la lista base no cambia.
 */
export type EstadoCobro = 'todos' | 'deben' | 'vencido' | 'porvencer' | 'pagado';
export type OrdenCobro = 'vencimiento' | 'alumno';

/** La forma mínima que usan filtro y orden; `resumenCobros` la cumple. */
export type FilaFiltrable = {
  dias: number;
  alumno: { nombre: string };
  pago?: { id: string } | null;
};

export function filtrarCobros<T extends FilaFiltrable>(
  filas: readonly T[],
  estado: EstadoCobro,
  diasAviso: 0 | 7 | 10 = 7,
): T[] {
  if (estado === 'todos') return [...filas];
  const out = filas.filter((f) => {
    if (estado === 'pagado') return f.pago != null;
    if (f.pago) return false;
    if (estado === 'deben') return f.dias <= diasAviso;
    if (estado === 'vencido') return f.dias < 0;
    return f.dias >= 0 && f.dias <= diasAviso;
  });
  return out;
}

/**
 * Orden elegido: por vencimiento (vencidos primero, el más atrasado arriba;
 * luego hoy y lo por vencer por días) o por alumno (A→Z). El orden no depende
 * del pago: la fila dice el vencimiento del período.
 */
export function ordenarCobros<T extends FilaFiltrable>(filas: readonly T[], orden: OrdenCobro): T[] {
  if (orden === 'alumno') return [...filas].sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre, 'es'));
  return [...filas].sort((a, b) => {
    const va = a.dias < 0 ? 0 : 1;
    const vb = b.dias < 0 ? 0 : 1;
    if (va !== vb) return va - vb;
    return a.dias < 0 ? b.dias - a.dias : a.dias - b.dias;
  });
}

export type AlumnoCobro = {
  id: string;
  nombre: string;
  grupo: string;
  ancla: number;
  montoUYU: number;
  /** true = se cobra por clase efectiva; nunca genera mensualidad por reservar. */
  individual?: boolean;
};

/**
 * Vencimiento de la mensualidad: el MISMO día del mes siguiente al del alta
 * (regla confirmada por la clienta 22-nov-2026). 1-feb → 1-mar, 1-may → 1-jun.
 * El `periodo` es el mes de referencia (AAAA-MM), no una fecha de cobro.
 * Si el día no existe en el mes destino (31, 30, 29 en febrero no bisiesto),
 * DEFAULT SEGURO: clamp al último día de ese mes, documentado aquí.
 */
function mesSiguiente(periodo: string): string {
  const { y, m } = parseFecha(`${periodo}-01`);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

function mesAnterior(periodo: string): string {
  const { y, m } = parseFecha(`${periodo}-01`);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

export function vencimientoDelMes(periodo: string, ancla: number): string {
  if (!Number.isInteger(ancla) || ancla < 1 || ancla > 31) throw new Error('Día ancla inválido');
  const destino = mesSiguiente(periodo);
  const { y, m } = parseFecha(`${destino}-01`);
  const dia = Math.min(ancla, diasDelMes(y, m));
  return `${destino}-${String(dia).padStart(2, '0')}`;
}

/**
 * Pagos pendientes de clases individuales ya DADAS (nunca de reservas).
 * Cada clase dictada es un cobro: se identifica por `alumnoId|claseId` para
 * que no se duplique al pagar ni al recargar.
 */
export type CobroIndividual = {
  alumno: AlumnoCobro;
  clase: Clase;
  fecha: string;
  pago?: Pago;
};

export function cobrosIndividuales(
  alumnos: readonly AlumnoCobro[],
  pagos: readonly Pago[],
  clases: readonly Clase[],
  hoy: string,
): CobroIndividual[] {
  const porId = new Map(alumnos.map((a) => [a.id, a]));
  const activos = pagos.filter((p) => !p.anulado && p.concepto === 'clase-individual');
  return clases
    .filter((c) => c.estado === 'dada')
    .flatMap<CobroIndividual | null>((clase) => clase.alumnos.map((a) => {
      const alumno = porId.get(a.id);
      if (!alumno || !alumno.individual) return null;
      const pago = activos.find((p) => p.alumnoId === alumno.id && p.claseId === clase.id);
      return { alumno, clase, fecha: clase.fecha, ...(pago ? { pago } : {}) };
    }))
    .filter((f): f is CobroIndividual => f !== null)
    .filter((f) => f.fecha <= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.alumno.nombre.localeCompare(b.alumno.nombre, 'es'));
}

/**
 * Resumen de mensualidades. Las fichas individuales NO entran: reservar una
 * clase no crea deuda mensual. Cada fila debe venir con la tarifa persistida;
 * una ficha sin tarifa (monto 0/negocio inválido) no genera deuda inventada.
 */
export function resumenCobros(alumnos: readonly AlumnoCobro[], pagos: readonly Pago[], hoy: string, diasAviso: 0 | 7 | 10 = 7) {
  const periodo = hoy.slice(0, 7);
  // Con la regla del mismo día del mes siguiente, lo que vence ESTE mes es la
  // mensualidad del mes ANTERIOR; la del mes actual vence el mes que viene.
  const anterior = mesAnterior(periodo);
  const dia = diasDeFecha(hoy);
  const activos = pagos.filter((p) => !p.anulado && p.concepto !== 'clase-individual');
  const filas = alumnos
    .filter((a) => !a.individual && Number.isSafeInteger(a.montoUYU) && a.montoUYU > 0)
    .flatMap((alumno) => [anterior, periodo].map((mes) => {
      const fecha = vencimientoDelMes(mes, alumno.ancla);
      return {
        alumno, periodo: mes, fecha, dias: diasDeFecha(fecha) - dia,
        pago: activos.find((p) => p.alumnoId === alumno.id && p.periodo === mes),
      };
    })).filter((fila) => fila.dias <= diasAviso)
    .sort((a, b) => Number(a.dias < 0) - Number(b.dias < 0) || (a.dias < 0 ? b.dias - a.dias : a.dias - b.dias));
  const pendientes = filas.filter((f) => !f.pago);
  const vencenHoy = pendientes.filter((f) => f.dias === 0);
  return {
    periodo, filas, vencenHoy,
    avisos: pendientes.filter((f) => f.dias >= 0 && f.dias <= diasAviso),
    porCobrar: pendientes.reduce((total, f) => total + f.alumno.montoUYU, 0),
    cobradoHoy: activos.filter((p) => p.fecha === hoy).reduce((total, p) => total + p.montoUYU, 0),
    cobradoMes: activos.filter((p) => p.fecha.startsWith(`${periodo}-`)).reduce((total, p) => total + p.montoUYU, 0),
  };
}
