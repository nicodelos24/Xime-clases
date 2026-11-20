import { diasDeFecha, diasDelMes, esFechaValida, parseFecha, sumarDias } from './fechas.ts';

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

export function anularPago(pagos: readonly Pago[], id: string, datos: Anulacion): Pago[] {
  const pago = pagos.find((p) => p.id === id);
  if (!pago) throw new Error('No se encontró el pago');
  if (pago.anulado) throw new Error('El pago ya está anulado');
  const motivo = datos.motivo.trim();
  if (!motivo || !datos.quien.trim()) throw new Error('Ingresá un motivo para anular el pago');
  if (!esFechaValida(datos.fecha) || datos.fecha < pago.fecha) throw new Error('Fecha de anulación inválida');
  return pagos.map((p) => p === pago ? { ...p, anulado: { ...datos, motivo } } : p);
}

export type AlumnoCobro = { id: string; nombre: string; grupo: string; ancla: number; montoUYU: number };

// El último día cubierto es el anterior al inicio siguiente (PLAN v1 §3.1).
export function vencimientoDelMes(periodo: string, ancla: number): string {
  if (!Number.isInteger(ancla) || ancla < 1 || ancla > 31) throw new Error('Día ancla inválido');
  const primero = `${periodo}-01`;
  const { y, m } = parseFecha(primero);
  // Ancla 1: el vencimiento de este mes precede al inicio del mes siguiente.
  return ancla === 1 ? `${periodo}-${diasDelMes(y, m)}` : sumarDias(primero, Math.min(ancla, diasDelMes(y, m)) - 2);
}

export function resumenCobros(alumnos: readonly AlumnoCobro[], pagos: readonly Pago[], hoy: string, diasAviso: 0 | 7 | 10 = 7) {
  const periodo = hoy.slice(0, 7);
  const siguiente = sumarDias(vencimientoDelMes(periodo, 1), 1).slice(0, 7);
  const dia = diasDeFecha(hoy);
  const activos = pagos.filter((p) => !p.anulado);
  const filas = alumnos.flatMap((alumno) => [periodo, siguiente].map((mes) => {
    const fecha = vencimientoDelMes(mes, alumno.ancla);
    return {
      alumno, periodo: mes, fecha, dias: diasDeFecha(fecha) - dia,
      pago: activos.find((p) => p.alumnoId === alumno.id && p.periodo === mes),
    };
  })).filter((fila) => fila.periodo === periodo || fila.dias <= diasAviso)
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
