/**
 * Mensualidad: ciclos con día ancla y la regla «nunca quitar días» (PLAN §3.1).
 *
 * Reglas implementadas (decisiones D1 y D3 de Nico, 15/11/2026):
 * - El ciclo cubre `[inicio, próximo-inicio)`; el **último día cubierto** es el
 *   día anterior al «mismo día del mes siguiente» (inicio 17/04 → último día 16/05).
 * - **Día ancla:** se guarda el día del mes en que empezó el alumno. Los inicios
 *   de ciclo son «el día ancla de cada mes»; si el mes no tiene ese día, el
 *   inicio cae en el último día del mes y **el ciclo siguiente vuelve al ancla**.
 * - **Nunca quitar días:** el alumno no pierde días por el calendario; ante
 *   duda entre dos fechas se toma la posterior.
 * - **Renovación anticipada:** si paga hasta su último día cubierto, el nuevo
 *   ciclo empieza el día siguiente, sin esperar clase, conservando el ancla.
 * - **Pago vencido:** queda «Pagada, sin iniciar» hasta su próxima clase, y el
 *   ancla se renueva al día de esa primera clase (el alumno quedó sin ciclo continuo).
 * - **Estados derivados** de fechas y pagos, nunca editables a mano.
 * - El dinero no vive aquí; las tarifas están en `tarifas.ts`.
 */

import {
  type FechaLocal,
  assertFecha,
  diaAnterior,
  diaDelMes,
  diasEntre,
  formatoFecha,
  parseFecha,
  sumarDias,
} from './fechas.ts';

/** Modalidad del alumno (§3.6). El cambio de modalidad no toca pagos viejos. */
export type Modalidad = 'mensualidad' | 'claseSuelta';

/** Un ciclo de mensualidad ya pagado/iniciado. `ultimoDiaCubierto` se deriva. */
export interface Ciclo {
  /** Día ancla del alumno: el día del mes de su inicio original (1..31). */
  ancla: number;
  /** Inicio del ciclo (primera clase posterior al pago, o lo que fijó la dueña). */
  inicio: FechaLocal;
}

/** Ciclo pagado que todavía no empezó (aún no hubo clase desde el pago). */
export interface CicloSinIniciar {
  ancla: number | null; // si el pago fue vencido, el ancla se fija con la primera clase
  pagadoEl: FechaLocal;
  /** Primera clase posterior al pago: cuando ocurra, el ciclo inicia ese día. */
  primeraClase: FechaLocal | null;
}

export const ESTADOS_MENSUALIDAD = [
  'Vigente',
  'PorVencer',
  'VenceHoy',
  'Vencida',
  'PagadaSinIniciar',
  'SinMensualidad',
] as const;

export type EstadoMensualidad = (typeof ESTADOS_MENSUALIDAD)[number];

export const CONCEPTOS_TARIFA = ['mensualidad', 'claseSuelta'] as const;
export type ConceptoTarifa = (typeof CONCEPTOS_TARIFA)[number];

/** Crea el ciclo de un pago que inicia con su primera clase; el ancla es el día de esa clase. */
export function crearPrimerCiclo(inicio: FechaLocal): Ciclo {
  assertFecha(inicio);
  const ancla = diaDelMes(inicio);
  return { ancla, inicio };
}

/** El inicio de ciclo siguiente: el día ancla del mes siguiente, recortado si el mes no tiene ese día. */
export function proximoInicio(inicio: FechaLocal, ancla: number): FechaLocal {
  assertFecha(inicio);
  if (!Number.isInteger(ancla) || ancla < 1 || ancla > 31) {
    throw new Error(`Día ancla inválido: ${ancla} (se espera 1..31)`);
  }
  const { y, m } = parseFecha(inicio);
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  const diasMes = new Date(Date.UTC(ny, nm, 0)).getUTCDate(); // último día del mes siguiente
  const d = Math.min(ancla, diasMes);
  return formatoFecha({ y: ny, m: nm, d });
}

/** Último día cubierto del ciclo: el día anterior a su próximo inicio. */
export function ultimoDiaCubierto(ciclo: Ciclo): FechaLocal {
  return diaAnterior(proximoInicio(ciclo.inicio, ciclo.ancla));
}

/** Renovación (§3.1.3): a partir de un ciclo y un pago, cuál es el siguiente.
 * - Pago hasta el último día cubierto → nuevo ciclo el día siguiente, mismo ancla.
 * - Pago después (vencida) → «Pagada, sin iniciar»; el ancla se definirá con la
 *   primera clase posterior al pago (el alumno quedó sin ciclo continuo).
 */
export function renovar(
  ciclo: Ciclo,
  pagoEl: FechaLocal,
  primeraClase: FechaLocal | null = null,
): { tipo: 'anticipada'; ciclo: Ciclo } | { tipo: 'vencida'; sinIniciar: CicloSinIniciar } {
  assertFecha(pagoEl);
  const ultimo = ultimoDiaCubierto(ciclo);
  if (diasEntre(pagoEl, ultimo) >= 0) {
    return { tipo: 'anticipada', ciclo: { ancla: ciclo.ancla, inicio: proximoInicio(ciclo.inicio, ciclo.ancla) } };
  }
  if (primeraClase !== null) assertFecha(primeraClase);
  return { tipo: 'vencida', sinIniciar: { ancla: null, pagadoEl: pagoEl, primeraClase } };
}

/** Cuando ocurre la primera clase de un pago vencido, el ciclo inicia ese día y el ancla se renueva. */
export function iniciarCicloSinIniciar(sinIniciar: CicloSinIniciar, primeraClase: FechaLocal): Ciclo {
  if (sinIniciar.primeraClase !== null && sinIniciar.primeraClase !== primeraClase) {
    throw new Error('La primera clase ya estaba fijada y no coincide');
  }
  return crearPrimerCiclo(primeraClase);
}

/** Días que le quedan al alumno desde `hoy` hasta el último día cubierto (0 = vence hoy). */
export function diasRestantes(ciclo: Ciclo, hoy: FechaLocal): number {
  return diasEntre(hoy, ultimoDiaCubierto(ciclo));
}

/** Estado de la mensualidad para `hoy` (§3.1.5), con umbral de aviso `diasAviso` (§3.4, 7 por defecto). */
export function estadoDe(
  hoy: FechaLocal,
  ciclo: Ciclo | null,
  diasAviso = 7,
): EstadoMensualidad {
  assertFecha(hoy);
  if (!Number.isInteger(diasAviso) || diasAviso < 0) throw new Error(`diasAviso inválido: ${diasAviso}`);
  if (ciclo === null) return 'SinMensualidad';
  assertFecha(ciclo.inicio);
  const restantes = diasRestantes(ciclo, hoy);
  if (restantes < 0) return 'Vencida'; // desde el día siguiente al último cubierto
  if (hoy < ciclo.inicio) return 'PagadaSinIniciar'; // pago futuro/inicio futuro fijado a mano
  if (restantes === 0) return 'VenceHoy';
  if (restantes <= diasAviso) return 'PorVencer';
  return 'Vigente';
}

/** Fecha del aviso de vencimiento (§3.4): N días antes del último día cubierto. */
export function fechaAviso(ciclo: Ciclo, diasAviso = 7): FechaLocal {
  return sumarDias(ultimoDiaCubierto(ciclo), -diasAviso);
}

/** Cierre por «Terminar mensualidad hoy» (§3.6): acorta el ciclo, sin devolver dinero.
 * Solo cierra un ciclo activo: `hoy` debe estar dentro de [inicio, último día cubierto].
 */
export function terminarHoy(ciclo: Ciclo, hoy: FechaLocal): { fin: FechaLocal } {
  const ultimo = ultimoDiaCubierto(ciclo);
  if (hoy < ciclo.inicio || hoy > ultimo) {
    throw new Error(`"Terminar hoy" exige una fecha dentro del ciclo (${ciclo.inicio}..${ultimo}), recibió ${hoy}`);
  }
  return { fin: hoy };
}
