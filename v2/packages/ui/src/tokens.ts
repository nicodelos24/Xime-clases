/** Aurora · valores claros portados 1:1 de ../tokens.css (fuente de verdad).
 * El tema oscuro conserva los pares accesibles de ENC-13; nunca usa el ámbar
 * #F2A20C con blanco. Los nombres de la Agenda se mantienen estables.
 */
export const AURORA = {
  bg: '#FAF7FB', surface: '#FFFFFF', line: '#EADFF0', text: '#241A2B', muted: '#6B6075',
  mensual: { solid: '#7A2F8C', tint: '#F1E4F6', ink: '#6A2279' },
  individual: { solid: '#344E7A', tint: '#E5EDF9', ink: '#2E4378' },
  aldia: { solid: '#12805A', tint: '#DDF4E9', ink: '#0B6444' },
  pronto: { solid: '#F2A20C', tint: '#FFF0CC', ink: '#7D4A00', strong: '#A86300' },
  debe: { solid: '#C2358A', tint: '#FBE2F1', ink: '#9C226C' },
  vencida: { solid: '#C62F36', tint: '#FDE3E3', ink: '#A8242A' },
  secciones: { hoy: '#A86300', alumnos: '#C62F36', agenda: '#7A2F8C', cobros: '#12805A', mas: '#344E7A' },
  movimiento: { fast: 150, base: 240, slow: 350 },
} as const;

export const MARCA = {
  acento: AURORA.mensual.solid,
  acentoFuerte: AURORA.mensual.ink,
  sobreAcento: AURORA.surface,
  fondo: AURORA.bg,
  superficie: AURORA.surface,
  borde: AURORA.line,
  texto: AURORA.text,
  textoSuave: AURORA.muted,
} as const;

export const MARCA_OSCURO = {
  acento: '#D9A2EA', acentoFuerte: '#C489D8', sobreAcento: '#241B2B',
  fondo: '#181219', superficie: '#241B2B', borde: '#3A2E3F',
  texto: '#F2ECF5', textoSuave: '#B3A6BD',
} as const;

/** Formas + etiquetas respaldan el color para distinguir modalidad. */
export const MODALIDAD_COLOR = {
  claro: {
    mensual: { fondo: AURORA.mensual.tint, texto: AURORA.mensual.ink, forma: 'punto' as const },
    individual: { fondo: AURORA.individual.tint, texto: AURORA.individual.ink, forma: 'rombo' as const },
  },
  oscuro: {
    mensual: { fondo: '#3A2142', texto: '#D9A2EA', forma: 'punto' as const },
    individual: { fondo: '#222D40', texto: '#B8CAEF', forma: 'rombo' as const },
  },
} as const;

export const MOVIMIENTO = { corto: AURORA.movimiento.fast, feedback: AURORA.movimiento.base, desplazamiento: 4 } as const;

export interface ParModalidad { fondo: string; texto: string; forma: 'punto' | 'rombo' }
export interface Tema {
  oscuro: boolean;
  color: typeof MARCA | typeof MARCA_OSCURO;
  modalidad: { mensual: ParModalidad; individual: ParModalidad };
  reducirMovimiento: boolean;
}
export function hacerTema(oscuro: boolean, reducirMovimiento: boolean): Tema {
  return {
    oscuro,
    color: oscuro ? MARCA_OSCURO : MARCA,
    modalidad: oscuro ? MODALIDAD_COLOR.oscuro : MODALIDAD_COLOR.claro,
    reducirMovimiento,
  };
}
