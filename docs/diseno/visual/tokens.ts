/** Clases · sistema visual v0.1, propuesta ENC-02. No implementado en app. */
import { derivarMarca } from './contraste';

export const identidad = {
  nombreTrabajo: 'Clases',
  concepto: 'Ritmo sereno: una herramienta de trabajo clara, cálida y humana para institutos de danza.',
  tipografia: {
    interfaz: 'System', // -apple-system / Roboto; sin descarga, respeta escalado del SO
    display: 'System',
    pesos: { regular: 400, medio: 500, semibold: 600, negrita: 700 },
    tamanos: { micro: 12, pequeño: 14, cuerpo: 16, destacado: 18, subtitulo: 20, titulo: 28, numero: 32 },
    lineas: { micro: 16, pequeño: 20, cuerpo: 24, destacado: 26, subtitulo: 28, titulo: 34, numero: 38 },
  },
  espacio: { cero: 0, xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 40 },
  radio: { pequeño: 8, mediano: 12, grande: 16, tarjeta: 20, hoja: 28, pildora: 999 },
  dimension: { toque: 48, toqueMinimo: 44, boton: 48, campo: 52, itemLista: 64, barra: 64, fabAlto: 56, fabMinAncho: 112, icono: 20, iconoGrande: 24, borde: 1, foco: 2 },
  sombra: {
    tarjeta: { shadowColor: '#1F1719', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    flotante: { shadowColor: '#1F1719', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  },
  animacion: { cortaMs: 160, mediaMs: 240, reducidaMs: 0 },
} as const;

export const temas = {
  claro: {
    fondo: '#FBF7F4', superficie: '#FFFFFF', superficieAlt: '#F4EDE8',
    tinta: '#1F1719', secundaria: '#5F5258', tenue: '#6B5A62',
    borde: '#DED2D6', bordeFuerte: '#8A7B73',
    marca: '#7A2F8C', sobreMarca: '#FFFFFF', marcaSuave: '#F1E4F5',
    foco: '#2347B5', error: '#A61E1E', sobreError: '#FFFFFF',
    deshabilitadoFondo: '#E9E2E2', deshabilitadoTexto: '#5F5258',
    estado: {
      vigente: { fondo: '#E4F2E6', tinta: '#1F6B3A', icono: 'check-circle', texto: 'Vigente' },
      porVencer: { fondo: '#FCEFD2', tinta: '#8A5300', icono: 'clock', texto: 'Por vencer' },
      venceHoy: { fondo: '#FFE4D1', tinta: '#A33B00', icono: 'alert-circle', texto: 'Vence hoy' },
      vencida: { fondo: '#FCE1DE', tinta: '#A61E1E', icono: 'alert-triangle', texto: 'Vencida' },
      pagadaSinIniciar: { fondo: '#E3E9FA', tinta: '#2F4FA3', icono: 'pause-circle', texto: 'Pagada, sin iniciar' },
      sinMensualidad: { fondo: '#ECE4DC', tinta: '#5E5149', icono: 'minus-circle', texto: 'Sin mensualidad' },
    },
  },
  oscuro: {
    fondo: '#171214', superficie: '#241C1F', superficieAlt: '#2E2529',
    tinta: '#FFF8F8', secundaria: '#CBBFC5', tenue: '#B8AAB1',
    borde: '#504148', bordeFuerte: '#8B7D84',
    marca: '#D9A2EA', sobreMarca: '#2A0E33', marcaSuave: '#3A2142',
    foco: '#8FB0FF', error: '#FF9E96', sobreError: '#3B1715',
    deshabilitadoFondo: '#3C3337', deshabilitadoTexto: '#CBBFC5',
    estado: {
      vigente: { fondo: '#1F2E22', tinta: '#8FD19E', icono: 'check-circle', texto: 'Vigente' },
      porVencer: { fondo: '#33290F', tinta: '#F0C36B', icono: 'clock', texto: 'Por vencer' },
      venceHoy: { fondo: '#3A2012', tinta: '#FFB68A', icono: 'alert-circle', texto: 'Vence hoy' },
      vencida: { fondo: '#3B1715', tinta: '#FF9E96', icono: 'alert-triangle', texto: 'Vencida' },
      pagadaSinIniciar: { fondo: '#1F2740', tinta: '#A9BCFF', icono: 'pause-circle', texto: 'Pagada, sin iniciar' },
      sinMensualidad: { fondo: '#2A2320', tinta: '#CFC3B9', icono: 'minus-circle', texto: 'Sin mensualidad' },
    },
  },
} as const;

export type Tema = keyof typeof temas;
export type EstadoMensualidad = keyof typeof temas.claro.estado;
export const tokens = { ...identidad, temas } as const;

/** Acento por instituto; NO reemplaza colores semánticos de deuda/estado. */
export function temaConMarca(tema: Tema, colorInstituto?: string) {
  const base = temas[tema];
  if (!colorInstituto) {
    return { ...base, marcaTexto: base.marca as string, sobreMarcaSuave: base.marca as string, avisoMarca: [] as string[] };
  }
  const m = derivarMarca(colorInstituto, base.superficie, tema);
  return {
    ...base,
    marca: m.relleno as string,
    sobreMarca: m.sobreRelleno as string,
    marcaTexto: m.texto as string,
    marcaSuave: m.suave as string,
    sobreMarcaSuave: m.sobreSuave as string,
    avisoMarca: m.avisos,
  };
}
