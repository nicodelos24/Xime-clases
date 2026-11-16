/**
 * Tokens de diseño de I1 (ENC-12, paleta de Vito). Alias compartidos de
 * modalidad: sin hex dispersos por el código. Color siempre acompañado por
 * nombre/forma: punto violeta = mensual, rombo azul = individual.
 */

export const MARCA = {
  acento: '#7A2F8C',
  acentoFuerte: '#5E2370',
  sobreAcento: '#FFFFFF',
  fondo: '#FAF8FB',
  superficie: '#FFFFFF',
  borde: '#E4DCE8',
  texto: '#2A2430',
  textoSuave: '#6E6478',
} as const;

export const MARCA_OSCURO = {
  acento: '#D9A2EA',
  acentoFuerte: '#C489D8',
  sobreAcento: '#241B2B',
  fondo: '#181219',
  superficie: '#241B2B',
  borde: '#3A2E3F',
  texto: '#F2ECF5',
  textoSuave: '#B3A6BD',
} as const;

/** Modalidad: pares AA de Vito, claro y oscuro. */
export const MODALIDAD_COLOR = {
  claro: {
    mensual: { fondo: '#F1E4F5', texto: '#7A2F8C', forma: 'punto' as const },
    individual: { fondo: '#E8EEF8', texto: '#344E7A', forma: 'rombo' as const },
  },
  oscuro: {
    mensual: { fondo: '#3A2142', texto: '#D9A2EA', forma: 'punto' as const },
    individual: { fondo: '#222D40', texto: '#B8CAEF', forma: 'rombo' as const },
  },
} as const;

/** Movimiento: guía de Vito/movimiento.md — 160 ms, ≤4 px; 240 ms feedback máx. */
export const MOVIMIENTO = { corto: 160, feedback: 240, desplazamiento: 4 } as const;

export interface ParModalidad {
  fondo: string;
  texto: string;
  forma: 'punto' | 'rombo';
}

export interface Tema {
  oscuro: boolean;
  color: typeof MARCA | typeof MARCA_OSCURO;
  modalidad: { mensual: ParModalidad; individual: ParModalidad };
  reducirMovimiento: boolean;
}

export function hacerTema(oscuro: boolean, reducirMovimiento: boolean): Tema {
  const color = oscuro ? MARCA_OSCURO : MARCA;
  const modalidad = oscuro ? MODALIDAD_COLOR.oscuro : MODALIDAD_COLOR.claro;
  return { oscuro, color, modalidad, reducirMovimiento };
}
