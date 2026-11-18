/** Clases v4 · valores claros portados 1:1 de ../tokens.css (fuente de verdad).
 * Paleta turquesa + pastel aprobada por Nico (Fase 1, commit af82516):
 * AA medido en el demo (v4/diseno/README.md). La Agenda conserva su referencia
 * (lila #5E4285 = Mensual, azul #34607F = Individual). Los nombres de los
 * tokens se mantienen estables (v2) para no tocar módulos.
 */
export const AURORA = {
  bg: '#F2F9F8', surface: '#FFFFFF', line: '#DCE8E7', text: '#1B2B30', muted: '#5A6A70',
  mensual: { solid: '#5E4285', tint: '#E8E0F6', ink: '#5E4285' },
  individual: { solid: '#34607F', tint: '#DCEBF6', ink: '#34607F' },
  aldia: { solid: '#2E6B4F', tint: '#D9F1E4', ink: '#2E6B4F' },
  pronto: { solid: '#FCE5D2', tint: '#FCE5D2', ink: '#8A5A12', strong: '#8A5A12' },
  debe: { solid: '#FADCE3', tint: '#FADCE3', ink: '#8E3552' },
  vencida: { solid: '#8E3552', tint: '#FADCE3', ink: '#8E3552' },
  secciones: { hoy: '#0B6B6A', alumnos: '#0B6B6A', agenda: '#0B6B6A', cobros: '#0B6B6A', mas: '#0B6B6A' },
  movimiento: { fast: 150, base: 220, slow: 320 },
} as const;

export const MARCA = {
  acento: '#0E7C7B',
  acentoFuerte: '#0B6B6A',
  sobreAcento: AURORA.surface,
  fondo: AURORA.bg,
  superficie: AURORA.surface,
  borde: AURORA.line,
  texto: AURORA.text,
  textoSuave: AURORA.muted,
} as const;

export const MARCA_OSCURO = {
  acento: '#0E7C7B', acentoFuerte: '#15A5A2', sobreAcento: '#FFFFFF',
  fondo: '#10201F', superficie: '#17292B', borde: '#24383A',
  texto: '#E7F2F1', textoSuave: '#9FB3B1',
} as const;

/** Formas + etiquetas respaldan el color para distinguir modalidad. */
export const MODALIDAD_COLOR = {
  claro: {
    mensual: { fondo: AURORA.mensual.tint, texto: AURORA.mensual.ink, forma: 'punto' as const },
    individual: { fondo: AURORA.individual.tint, texto: AURORA.individual.ink, forma: 'rombo' as const },
  },
  oscuro: {
    mensual: { fondo: '#2A2233', texto: '#C9B8E8', forma: 'punto' as const },
    individual: { fondo: '#1F3038', texto: '#9FC4DC', forma: 'rombo' as const },
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
