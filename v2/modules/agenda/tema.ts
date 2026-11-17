import { usarTema } from '../../packages/ui/src/tema';

/** ENC-13 es referencia 1:1: no heredar ajustes visuales de Aurora en Agenda.
 * Aurora gobierna el resto de la aplicación; estos pares congelan la referencia
 * aprobada de Mes/Día, también en oscuro. */
export const COLOR_AGENDA = {
  claro: {
    acento: '#7A2F8C', acentoFuerte: '#5E2370', sobreAcento: '#FFFFFF',
    fondo: '#FAF8FB', superficie: '#FFFFFF', borde: '#E4DCE8',
    texto: '#2A2430', textoSuave: '#6E6478',
  },
  oscuro: {
    acento: '#D9A2EA', acentoFuerte: '#C489D8', sobreAcento: '#241B2B',
    fondo: '#181219', superficie: '#241B2B', borde: '#3A2E3F',
    texto: '#F2ECF5', textoSuave: '#B3A6BD',
  },
} as const;
export const MODALIDAD_AGENDA = {
  claro: {
    mensual: { fondo: '#F1E4F5', texto: '#7A2F8C', forma: 'punto' as const },
    individual: { fondo: '#E8EEF8', texto: '#344E7A', forma: 'rombo' as const },
  },
  oscuro: {
    mensual: { fondo: '#3A2142', texto: '#D9A2EA', forma: 'punto' as const },
    individual: { fondo: '#222D40', texto: '#B8CAEF', forma: 'rombo' as const },
  },
} as const;
export function usarTemaAgenda() {
  const tema = usarTema();
  return {
    ...tema,
    color: tema.oscuro ? COLOR_AGENDA.oscuro : COLOR_AGENDA.claro,
    modalidad: tema.oscuro ? MODALIDAD_AGENDA.oscuro : MODALIDAD_AGENDA.claro,
  };
}
