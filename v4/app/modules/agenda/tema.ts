import { usarTema } from '../../packages/ui/src/tema';

/** ENC-13 es referencia 1:1: no heredar ajustes visuales en Agenda.
 * v4: misma estructura que v2, solo cambian los valores aprobados en el demo
 * (v4/diseno/tokens.css): acento turquesa, fondo menta, lila #5E4285 = Mensual,
 * azul #34607F = Individual. El tema oscuro conserva pares accesibles equivalentes. */
export const COLOR_AGENDA = {
  claro: {
    acento: '#0E7C7B', acentoFuerte: '#0B6B6A', sobreAcento: '#FFFFFF',
    fondo: '#F2F9F8', superficie: '#FFFFFF', borde: '#DCE8E7',
    texto: '#1B2B30', textoSuave: '#5A6A70',
  },
  oscuro: {
    acento: '#0E7C7B', acentoFuerte: '#15A5A2', sobreAcento: '#FFFFFF',
    fondo: '#10201F', superficie: '#17292B', borde: '#24383A',
    texto: '#E7F2F1', textoSuave: '#9FB3B1',
  },
} as const;
export const MODALIDAD_AGENDA = {
  claro: {
    mensual: { fondo: '#E8E0F6', texto: '#5E4285', forma: 'punto' as const },
    individual: { fondo: '#DCEBF6', texto: '#34607F', forma: 'rombo' as const },
  },
  oscuro: {
    mensual: { fondo: '#2A2233', texto: '#C9B8E8', forma: 'punto' as const },
    individual: { fondo: '#1F3038', texto: '#9FC4DC', forma: 'rombo' as const },
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
