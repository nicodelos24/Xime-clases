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

/* ————————————————————————————————————————————————————————————————
 * Tema antes del primer paint (web estática).
 *
 * El export prerenderiza el HTML con el tema claro (el render corre en Node,
 * sin `prefers-color-scheme`); en el navegador el tema correcto solo llega
 * con el primer render del cliente, y React 19 hidrata SIN reaplicar los
 * estilos del HTML (por eso no hay mismatch, pero la barra, el header y el
 * resto de la pantalla quedan en claro con el sistema en oscuro hasta la
 * primera interacción: hallazgo de Gino, 18/11).
 *
 * `SCRIPT_TEMA` va como `<script>` inline al final del `<body>` del HTML
 * generado (`app/+html.tsx`, después de la pantalla y antes de los scripts de
 * React): lee la media query, marca `data-tema` en `<html>` y, si el sistema
 * está en oscuro, corrige en el DOM prerenderizado (todavía sin React) los
 * colores propios de Aurora. Necesita los nodos ya parseados: en el `<head>`
 * no corrige nada (probado). React hidrata sobre ese DOM con valores ya
 * correctos, así la primera carga pinta el tema del sistema y nada cambia al
 * tocar. Es un no-op en claro y en nativo (no hay DOM).
 * ———————————————————————————————————————————————————————————————— */
export const ATRIBUTO_TEMA = 'data-tema';

/** Colores propios de Aurora por tema: [claro, oscuro] en hex. */
const TEMAS_AURORA: Record<string, [string, string]> = {
  // Barra inferior y header de las pestañas.
  superficie: ['#FFFFFF', '#17292B'],
  acento: ['#0E7C7B', '#15A5A2'],   // acento → acento fuerte
  borde: ['#DCE8E7', '#24383A'],
  fondo: ['#F2F9F8', '#10201F'],
  // Texto (títulos y contenido).
  texto: ['#1B2B30', '#E7F2F1'],
  textoSuave: ['#5A6A70', '#9FB3B1'],
};

/** Hex a `rgba(r,g,b,a)`, el formato de los estilos del prerender. */
const aRgba = (hex: string, alpha = '1.00'): string => {
  const [r, g, b] = hex.slice(1).match(/.{2}/g)!.map((h) => parseInt(h, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

/** Atributos de los íconos SVG (`Icono`): también salen en claro. */
const TEMAS_ICONOS: Record<string, [string, string]> = {
  acento: ['#0E7C7B', '#15A5A2'],
  textoSuave: ['#5A6A70', '#9FB3B1'],
  texto: ['#1B2B30', '#E7F2F1'],
};

/** Alphas con los que el prerender escribe el mismo color (`opacity` por
 *  nodo: los hijos de la barra heredan `.02` del contenedor animado). */
const ALPHAS = ['1.00', '0.01', '0.02'];

/** Mapa que usa el script: color prerenderizado → su par en oscuro. */
const MAPA_SCRIPT: Record<string, string> = Object.fromEntries(
  Object.entries(TEMAS_AURORA).flatMap(([, [claro, oscuro]]) =>
    ALPHAS.map((a) => [aRgba(claro, a), aRgba(oscuro, a)]),
  ),
);

/** Mapa de atributos SVG para el script: color del prerender → par oscuro. */
const ICONOS_SCRIPT: Record<string, string> = Object.fromEntries(
  Object.entries(TEMAS_ICONOS).map(([, [claro, oscuro]]) => [claro, oscuro]),
);

/** Tema inicial del cliente: el fijado por el script antes del primer paint. */
export function esquemaInicial(): 'dark' | 'light' {
  if (typeof document !== 'undefined') {
    const marca = document.documentElement.getAttribute(ATRIBUTO_TEMA);
    if (marca === 'oscuro') return 'dark';
    if (marca === 'claro') return 'light';
  }
  // Sin el atributo (nativo, o el script no corrió): la misma media query que
  // usa react-native-web por Appearance. Este módulo no importa react-native
  // a propósito: tiene que poder correr en Node, donde los tests lo cargan.
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/** Script inline para el `<head>` del export estático (ver arriba). */
export const SCRIPT_TEMA = `(function(){
  try {
    var d = document, h = d.documentElement;
    var m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    var oscuro = !!(m && m.matches);
    h.setAttribute('${ATRIBUTO_TEMA}', oscuro ? 'oscuro' : 'claro');
    if (!oscuro) return;
    var mapa = ${JSON.stringify(MAPA_SCRIPT)};
    var pares = [];
    for (var c in mapa) pares.push([c, mapa[c]]);
    var nodos = d.querySelectorAll('[style]');
    for (var i = 0; i < nodos.length; i++) {
      var st = nodos[i].getAttribute('style'), cambiado = st;
      for (var j = 0; j < pares.length; j++) {
        cambiado = cambiado.replace(pares[j][0], pares[j][1]);
      }
      if (cambiado !== st) nodos[i].setAttribute('style', cambiado);
    }
    // Íconos SVG: el color va en atributos stroke/fill, no en un style.
    var iconos = ${JSON.stringify(ICONOS_SCRIPT)};
    var svg = d.querySelectorAll('svg [stroke], svg [fill], svg [stroke][fill]');
    for (var k = 0; k < svg.length; k++) {
      for (var a = 0; a < 2; a++) {
        var at = a ? 'fill' : 'stroke', v = svg[k].getAttribute(at);
        if (v && iconos[v]) svg[k].setAttribute(at, iconos[v]);
      }
    }
  } catch (e) {}
})();`;
