import { diasDeFecha, diasDelMes, esFechaValida, parseFecha } from './fechas.ts';

export type Pago = {
  id: string;
  alumnoId: string;
  periodo: string; // AAAA-MM del vencimiento que se liquida
  montoUYU: number;
  fecha: string; // AAAA-MM-DD en Montevideo
  quien: string;
  anulado: Anulacion | null;
};

export type PagoNuevo = Omit<Pago, 'anulado'>;
export type Anulacion = { fecha: string; motivo: string; quien: string };

export function registrarPago(pagos: readonly Pago[], nuevo: PagoNuevo): Pago[] {
  if (!nuevo.id.trim() || !nuevo.alumnoId.trim() || !nuevo.quien.trim()) throw new Error('Faltan datos del pago');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(nuevo.periodo) || !esFechaValida(nuevo.fecha)) {
    throw new Error('Fecha o período inválido');
  }
  if (!Number.isSafeInteger(nuevo.montoUYU) || nuevo.montoUYU <= 0) throw new Error('El monto debe ser un entero positivo en UYU');
  if (pagos.some((p) => p.id === nuevo.id)) throw new Error('El pago ya está registrado');
  if (pagos.some((p) => !p.anulado && p.alumnoId === nuevo.alumnoId && p.periodo === nuevo.periodo)) {
    throw new Error('Ya hay un pago activo para este período');
  }
  return [...pagos, { ...nuevo, anulado: null }];
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

export type AlumnoCobro = { id: string; nombre: string; grupo: string; ancla: number; montoUYU: number };

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

export function resumenCobros(alumnos: readonly AlumnoCobro[], pagos: readonly Pago[], hoy: string, diasAviso: 0 | 7 | 10 = 7) {
  const periodo = hoy.slice(0, 7);
  // Con la regla del mismo día del mes siguiente, lo que vence ESTE mes es la
  // mensualidad del mes ANTERIOR; la del mes actual vence el mes que viene.
  const anterior = mesAnterior(periodo);
  const dia = diasDeFecha(hoy);
  const activos = pagos.filter((p) => !p.anulado);
  const filas = alumnos.flatMap((alumno) => [anterior, periodo].map((mes) => {
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
