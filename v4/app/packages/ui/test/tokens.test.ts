/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ATRIBUTO_TEMA, AURORA, MARCA, MARCA_OSCURO, SCRIPT_TEMA, esquemaInicial, hacerTema } from '../src/tokens.ts';

const base = resolve(import.meta.dirname, '..', '..', '..');
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
const valores: Record<string, string> = {
  bg: AURORA.bg, surface: AURORA.surface, line: AURORA.line, text: AURORA.text, muted: AURORA.muted,
  'mensual-solid': AURORA.mensual.solid, 'mensual-tint': AURORA.mensual.tint, 'mensual-ink': AURORA.mensual.ink,
  'indiv-solid': AURORA.individual.solid, 'indiv-tint': AURORA.individual.tint, 'indiv-ink': AURORA.individual.ink,
  'aldia-solid': AURORA.aldia.solid, 'aldia-tint': AURORA.aldia.tint, 'aldia-ink': AURORA.aldia.ink,
  'pronto-solid': AURORA.pronto.solid, 'pronto-tint': AURORA.pronto.tint, 'pronto-ink': AURORA.pronto.ink,
  'pronto-strong': AURORA.pronto.strong,
  'debe-solid': AURORA.debe.solid, 'debe-tint': AURORA.debe.tint, 'debe-ink': AURORA.debe.ink,
  'vencida-solid': AURORA.vencida.solid, 'vencida-tint': AURORA.vencida.tint, 'vencida-ink': AURORA.vencida.ink,
  ...Object.fromEntries(Object.entries(AURORA.secciones).map(([k,v]) => [`sec-${k === 'mas' ? 'mas' : k}`,v])),
};
test('Aurora RN coincide con tokens.css de diseño (incluido ámbar AA)', () => {
  for (const [nombre, esperado] of Object.entries(valores)) {
    const real = css.match(new RegExp(`--${nombre}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
    assert.equal(real?.toUpperCase(), esperado.toUpperCase(), nombre);
  }
  assert.equal(AURORA.secciones.hoy, '#0B6B6A');
  assert.equal(MARCA.acento, '#0E7C7B');
  assert.equal(AURORA.mensual.solid, '#5E4285');
  assert.equal(AURORA.individual.solid, '#34607F');
  assert.equal(MARCA.fondo, AURORA.bg);
});
test('claro/oscuro y movimiento reducido no comparten estados mutables', () => {
  const claro = hacerTema(false, false), oscuro = hacerTema(true, true);
  assert.equal(claro.oscuro, false);
  assert.equal(oscuro.oscuro, true);
  assert.notEqual(claro.color.fondo, oscuro.color.fondo);
  assert.equal(oscuro.reducirMovimiento, true);
});

// AA de la etiqueta activa de la barra inferior (18/11): pinta sobre
// color.superficie, que en oscuro es #17292B. El acento #0E7C7B da 3.02:1;
// en oscuro corresponde el acento fuerte del tema. El layout de las pestañas
// toma la tinta de aquí: `oscuro ? color.acentoFuerte : color.acento`.
const lum = (hex: string): number => {
  const [r, g, b] = hex.slice(1).match(/.{2}/g)!.map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test('barra inferior · etiqueta activa: AA ≥ 4.5 en ambos temas', () => {
  const claro = hacerTema(false, false);
  const oscuro = hacerTema(true, false);
  const activaClaro = claro.oscuro ? claro.color.acentoFuerte : claro.color.acento;
  const activaOscuro = oscuro.oscuro ? oscuro.color.acentoFuerte : oscuro.color.acento;
  assert.equal(activaClaro, MARCA.acento);
  assert.equal(activaOscuro, MARCA_OSCURO.acentoFuerte);
  assert.ok(contraste(activaOscuro, MARCA_OSCURO.superficie) >= 4.5,
    `AA etiqueta activa oscuro: ${contraste(activaOscuro, MARCA_OSCURO.superficie).toFixed(2)}`);
  assert.ok(contraste(activaClaro, MARCA.superficie) >= 4.5,
    `AA etiqueta activa claro: ${contraste(activaClaro, MARCA.superficie).toFixed(2)}`);
  // Guardia: el acento fijo no vuelve a usarse en oscuro (3.02:1).
  assert.ok(contraste(MARCA.acento, MARCA_OSCURO.superficie) < 4.5,
    'el acento claro sobre superficie oscura no debe usarse');
});

test('barra inferior · el layout usa acentoFuerte en oscuro, no un valor fijo', () => {
  const layout = readFileSync(
    resolve(base, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8');
  assert.match(layout, /tintaActiva = oscuro \? color\.acentoFuerte : color\.acento/);
  assert.match(layout, /tabBarActiveTintColor:\s*tintaActiva/);
  assert.doesNotMatch(layout, /tabBarActiveTintColor:\s*['"]#|tabBarActiveTintColor:\s*color\.acento\b/);
});

// —— Tema antes del primer paint en el export web estático ——
// El export prerenderiza en claro (Node, sin prefers-color-scheme) y React 19
// hidrata sin reaplicar los estilos del HTML, así que el tema correcto hay
// que fijarlo en el DOM prerenderizado antes de que React arranque: el script
// inline marca data-tema en <html> y convierte los colores propios de Aurora
// a su par en oscuro. El proveedor arranca con ese atributo (hallazgo de
// Gino, 18/11).

/** DOM falso con los nodos que el script debe recorrer. */
const DOM_FALSO = (estilos: string[]) => ({
  documentElement: {
    atributos: {} as Record<string, string>,
    setAttribute(n: string, v: string) { this.atributos[n] = v; },
    getAttribute(n: string) { return this.atributos[n] ?? null; },
  },
  nodos: estilos.map((estilo) => ({
    estilo,
    getAttribute(n: string) { return n === 'style' ? this.estilo : null; },
    setAttribute(_n: string, v: string) { this.estilo = v; },
  })),
});

/** Ejecuta el script inline con el DOM y la media query dados. */
const correrScriptTema = (
  doc: ReturnType<typeof DOM_FALSO>,
  matchOscuro: boolean | null,
): void => {
  const ejecutar = new Function('window', 'document', SCRIPT_TEMA) as
    (w: unknown, d: unknown) => void;
  const docConNodos = {
    ...doc,
    querySelectorAll: (sel: string) =>
      sel.startsWith('svg') ? (doc as { iconos?: unknown[] }).iconos ?? [] : doc.nodos,
  };
  ejecutar(
    matchOscuro === null ? {} : { matchMedia: () => ({ matches: matchOscuro }) },
    docConNodos,
  );
};

test('export estático · el script va inline al final del <body> de +html.tsx', () => {
  const html = readFileSync(
    resolve(base, 'apps/mobile/app/+html.tsx'), 'utf8');
  // Inline, y al final del <body>: en el <head> corre durante el parseo, con
  // el <body> todavía sin nodos, y no tiene nada que corregir (probado).
  assert.match(html, /<script dangerouslySetInnerHTML=\{\{ __html: SCRIPT_TEMA \}\}\s*\/>/);
  assert.doesNotMatch(html, /src=\{?["'].*SCRIPT_TEMA/);
  const iBody = html.indexOf('<body');
  const iScript = html.indexOf('__html: SCRIPT_TEMA');
  const iChildren = html.indexOf('{children}');
  assert.ok(iBody >= 0 && iScript > iBody, 'el script va después de abrir el <body>');
  assert.ok(iChildren >= 0 && iScript > iChildren,
    'el script va después de {children}: necesita los nodos ya parseados');

  // El proveedor arranca con el atributo del script, no con Appearance.
  const tema = readFileSync(resolve(base, 'packages/ui/src/tema.tsx'), 'utf8');
  assert.match(tema, /useState<'dark' \| 'light'>\(esquemaInicial\)/);
  assert.doesNotMatch(tema, /useState\(Appearance\.getColorScheme\(\)\)/);
});

test('el script del head marca data-tema y corrige los colores a oscuro', () => {
  // Con oscuro: marca <html> y convierte la barra clara a su par oscuro.
  const doc = DOM_FALSO([
    'background-color:rgba(255,255,255,1.00)',
    'color:rgba(14,124,123,1.00)',
  ]);
  correrScriptTema(doc, true);
  assert.equal(doc.documentElement.getAttribute(ATRIBUTO_TEMA), 'oscuro');
  assert.equal(doc.nodos[0].estilo, 'background-color:rgba(23,41,43,1.00)',
    'barra clara → superficie oscura');
  assert.equal(doc.nodos[1].estilo, 'color:rgba(21,165,162,1.00)',
    'acento → acento fuerte');

  // Los íconos de la barra pintan el color en atributos stroke/fill del SVG,
  // no en un style: también tienen que pasar a oscuro.
  const conIconos = {
    ...DOM_FALSO([]),
    iconos: [
      { attrs: { stroke: '#5A6A70', fill: 'none' } as Record<string, string>,
        getAttribute(n: string) { return this.attrs[n] ?? null; },
        setAttribute(n: string, v: string) { this.attrs[n] = v; } },
    ],
  };
  correrScriptTema(conIconos, true);
  assert.equal(conIconos.iconos[0].getAttribute('stroke'), '#9FB3B1',
    'ícono inactivo #5A6A70 → tinta suave oscura');
  assert.equal(conIconos.iconos[0].getAttribute('fill'), 'none',
    'fill que no es de Aurora queda igual');

  // En claro: solo marca el atributo; no toca nada.
  const claro = DOM_FALSO(['background-color:rgba(255,255,255,1.00)']);
  correrScriptTema(claro, false);
  assert.equal(claro.documentElement.getAttribute(ATRIBUTO_TEMA), 'claro');
  assert.equal(claro.nodos[0].estilo, 'background-color:rgba(255,255,255,1.00)');

  // Sin matchMedia (nativo o navegador viejo): asume claro y no rompe.
  const sinMedia = DOM_FALSO(['color:rgba(90,106,112,1.00)']);
  correrScriptTema(sinMedia, null);
  assert.equal(sinMedia.documentElement.getAttribute(ATRIBUTO_TEMA), 'claro');
  assert.equal(sinMedia.nodos[0].estilo, 'color:rgba(90,106,112,1.00)');
});

test('el mapa del script cubre los colores propios de Aurora (par claro/oscuro)', () => {
  // Cada entrada es [claro, oscuro] y debe coincidir con los tokens reales:
  // si alguien cambia un color en tokens.ts, este test lo agarra.
  const pares: [string, string, string][] = [
    ['superficie', MARCA.superficie, MARCA_OSCURO.superficie],
    ['acento', MARCA.acento, MARCA_OSCURO.acentoFuerte],
    ['borde', MARCA.borde, MARCA_OSCURO.borde],
    ['fondo', MARCA.fondo, MARCA_OSCURO.fondo],
    ['texto', MARCA.texto, MARCA_OSCURO.texto],
    ['textoSuave', MARCA.textoSuave, MARCA_OSCURO.textoSuave],
  ];
  const rgba = (hex: string): string => {
    const [r, g, b] = hex.slice(1).match(/.{2}/g)!.map((h) => parseInt(h, 16));
    return `rgba(${r},${g},${b},1.00)`;
  };
  for (const [nombre, claro, oscuro] of pares) {
    assert.ok(
      SCRIPT_TEMA.includes(`${JSON.stringify(rgba(claro))}:${JSON.stringify(rgba(oscuro))}`),
      `el mapa del script debe tener el par de ${nombre}: ${rgba(claro)} → ${rgba(oscuro)}`,
    );
  }
  // El mapa no debe llevar colores que no son de Aurora: si aparece uno
  // ajeno, el script estaría pintando algo que no le corresponde.
  for (const hex of [AURORA.mensual.solid, AURORA.individual.solid, AURORA.pronto.ink]) {
    assert.ok(!SCRIPT_TEMA.includes(rgba(hex)), `no debe tocar ${hex}`);
  }
});

test('esquemaInicial · el atributo del script decide el tema del cliente', () => {
  // Sin DOM (nativo): manda la media query, como Appearance.
  assert.equal(typeof esquemaInicial(), 'string');
  // Con el atributo fijado por el script: manda él.
  const previo = (globalThis as { document?: unknown }).document;
  const con = (marca: string | null): unknown => {
    (globalThis as { document?: unknown }).document = {
      documentElement: { getAttribute: (n: string) => (n === ATRIBUTO_TEMA ? marca : null) },
    };
    try { return esquemaInicial(); } finally {
      (globalThis as { document?: unknown }).document = previo;
    }
  };
  assert.equal(con('oscuro'), 'dark');
  assert.equal(con('claro'), 'light');
  // Sin atributo (o con uno desconocido) cae en la media query, no en claro.
  assert.ok(con(null) === 'dark' || con(null) === 'light');
});
