/**
 * WhatsApp desde la cancelación — Opción A del plan v5 (§3): deep links
 * wa.me / whatsapp:// con el mensaje listo y **editable** por el dueño.
 *
 * Invariantes:
 *  - El envío NUNCA es automático: acá solo se construye el link y se
 *    registra en la auditoría de la clase cancelada qué salió.
 *  - "Masivo" = un link por alumno (el dueño confirma cada envío, o pega el
 *    texto en el grupo de la clase); "individual" = link por alumno elegido.
 *  - Números: solo se normalizan al formato del deep link; jamás se inventan.
 */
import { etiquetaDia, horaClase, type AlumnoDeClase, type Clase } from './clases.ts';

/** Plantilla por defecto configurable por el dueño (plan §2.2). */
export const PLANTILLA_CANCELACION =
  'Hola, la clase de hoy se canceló. La reprogramamos.';

/** Normaliza un teléfono uruguayo a "59899123456" (sin + ni espacios). */
export function normalizarTelefono(raw: string): string {
  const soloDigitos = String(raw).replace(/[^\d]/g, '');
  if (soloDigitos.startsWith('598') && soloDigitos.length === 11) return soloDigitos;
  if (soloDigitos.length === 8) return `598${soloDigitos}`; // 99 123 456
  if (soloDigitos.startsWith('0') && soloDigitos.length === 9) return `598${soloDigitos.slice(1)}`;
  return soloDigitos;
}

/** Texto pre-cargado: la plantilla con el día y la hora de la clase. */
export function textoCancelacion(c: Clase, plantilla?: string): string {
  const base = (plantilla ?? PLANTILLA_CANCELACION).trim() || PLANTILLA_CANCELACION;
  return `${base}\n${etiquetaDia(c.fecha)}, ${horaClase(c)}`;
}

/** Deep link wa.me con el mensaje precargado (sin teléfono: solo el texto). */
export function linkTexto(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

/** Deep link wa.me a un alumno con el mensaje precargado. */
export function linkAlumno(a: AlumnoDeClase, texto: string): string {
  return `https://wa.me/${normalizarTelefono(a.telefono)}?text=${encodeURIComponent(texto)}`;
}

export type Destino = { alumno: AlumnoDeClase; link: string };

/**
 * Destinos del envío. `masivo` = todos los alumnos de la clase (con texto),
 * `individual` = solo los elegidos (sin texto, para escribirle a mano).
 */
export function destinos(
  c: Clase,
  modo: 'masivo' | 'individual',
  elegidos: AlumnoDeClase[],
  texto: string,
): Destino[] {
  const lista = modo === 'masivo' ? c.alumnos : elegidos;
  if (lista.length === 0 || !texto.trim()) return [];
  if (modo === 'masivo') return lista.map((alumno) => ({ alumno, link: linkAlumno(alumno, texto) }));
  return lista.map((alumno) => ({ alumno, link: `https://wa.me/${normalizarTelefono(alumno.telefono)}` }));
}

/** Plantilla sugerida para avisar que la mensualidad está por vencer. */
export const PLANTILLA_VENCIMIENTO = 'Hola, tu mensualidad está por vencer. ¿Podés confirmar el pago?';

/** Datos mínimos para armar el deep link de aviso (sin depender de la BD). */
export type AvisoVencimiento = { telefono: string; nombre: string; vencimiento: string; montoUYU?: number | null };

/** Mensaje sugerido con el nombre, el importe real de la ficha y la fecha de vencimiento (día/mes). */
export function textoAvisoVencimiento(a: AvisoVencimiento, plantilla = PLANTILLA_VENCIMIENTO): string {
  const [y, m, d] = a.vencimiento.split('-').map(Number);
  const importe = typeof a.montoUYU === 'number' && Number.isSafeInteger(a.montoUYU) && a.montoUYU > 0
    ? ` · $${new Intl.NumberFormat('es-UY').format(a.montoUYU)}`
    : '';
  return `${(plantilla || PLANTILLA_VENCIMIENTO).trim()}\n${a.nombre}${importe} · vence ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/** Deep link wa.me con el aviso de «por vencer» ya precargado. */
export function linkAvisoVencimiento(a: AvisoVencimiento, plantilla?: string): string {
  const tel = normalizarTelefono(a.telefono);
  return `https://wa.me/${tel}?text=${encodeURIComponent(textoAvisoVencimiento(a, plantilla))}`;
}

/** Resumen para el toast de la app. */
export function resumenEnvio(c: Clase, modo: 'masivo' | 'individual', cantidad: number): string {
  if (cantidad === 0) return 'No se envió ningún mensaje';
  const quien = modo === 'masivo' ? `los ${cantidad} alumnos de ${c.nombre}` : `${cantidad} alumno${cantidad === 1 ? '' : 's'} elegido${cantidad === 1 ? '' : 's'}`;
  return `WhatsApp listo para ${quien}`;
}
