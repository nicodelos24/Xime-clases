/**
 * Prefijo de móvil configurable (pedido de Nico 22-nov, patrón Ropa V2).
 *
 * El prefijo se guarda SOLO en este dispositivo (localStorage) y se usa para
 * completar los números de WhatsApp que no lo traigan. Nunca se envía ni se
 * comparte: los deep links siguen armándose en `whatsapp.ts`, sin envío real.
 */

/** Prefijo por defecto: Uruguay, igual que Ropa V2. */
export const PREFIJO_POR_DEFECTO = '+598';

export const CLAVE_PREFIJO = 'xime.v5.prefijo-movil';

/** Valida el formato "+", seguido de 1 a 4 dígitos (ej. +598, +54, +1). */
export function prefijoEsValido(valor: string): boolean {
  return /^\+\d{1,4}$/.test(valor.trim());
}

/** Normaliza lo guardado: válido → texto limpio; inválido/ausente → default. */
export function prefijoSeguro(valor: string | null | undefined): string {
  if (typeof valor !== 'string') return PREFIJO_POR_DEFECTO;
  return prefijoEsValido(valor) ? valor.trim() : PREFIJO_POR_DEFECTO;
}

/**
 * Completa un número con el prefijo configurado. No lo duplica si ya lo trae
 * (con o sin +), y deja pasar los números largos con prefijo explícito.
 * Ej.: con +598, "99 123 456" → "+598 99 123 456"; "+54 9 11..." queda igual.
 */
export function conPrefijo(numero: string, prefijo = PREFIJO_POR_DEFECTO): string {
  const texto = numero.trim();
  if (!texto) return '';
  const seg = prefijoSeguro(prefijo);
  const digitos = seg.slice(1);
  const soloDigitos = texto.replace(/[^\d]/g, '');
  // Ya trae el prefijo: se respeta tal cual (con o sin +). Nico lo pidió así
  // en el #9: un número con "598 ..." no debe transformarse en "+598 ...".
  if (soloDigitos.startsWith(digitos)) return texto;
  return `${seg} ${texto}`;
}
