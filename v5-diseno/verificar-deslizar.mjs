// Verificación del CABLEADO del gesto: jsdom no ejecuta type=module, así que
// construyo UN scope común: los src/*.js (quedando los exports como
// declaraciones) + propuesta.js sin imports, con colisiones de nombres
// renombradas. Igual que un empaquetador tonto.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const html = readFileSync(join(DOCS, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost:8799/index.html', runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom; const { document } = window;
window.matchMedia = window.matchMedia || (() => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
// jsdom no soporta Element.animate (Web Animations): stub mínimo.
window.Element.prototype.animate = window.Element.prototype.animate || function () { return { cancel() {}, finished: Promise.resolve(), addEventListener() {} }; };
window.eval(readFileSync(join(DOCS, 'icons.js'), 'utf8'));

const orden = ['fechas.js', 'reloj.js', 'prefijo.js', 'agenda.js', 'agenda-mes.js',
  'navegacion.js', 'agendar.js', 'alumnos.js', 'clases.js', 'resumen.js',
  'cobros.js', 'contacto.js', 'whatsapp.js', 'demo.js', 'repositorio.js',
  'barra-scroll.js', 'scroll-pista.js', 'sheets.js'];

const vistos = new Set();
let codigo = '';
for (const f of orden) {
  const t = readFileSync(join(DOCS, 'src', f), 'utf8')
    .replace(/^import[\s\S]*?from '\.\/[^']+';?\s*$/gm, '')
    .replace(/^export \{[^}]*\};?\s*$/gm, '')
    .replace(/^export (const|let|function|class) ([A-Za-z_$][\w$]*)/gm, '$1 $2')
    .replace(/^(?:export )?(const|let|function|class) ([A-Za-z_$][\w$]*)/gm, (m, tipo, n) => {
      if (vistos.has(n)) return `${tipo} __dup_${f.replace('.js','')}_${n}`;
      vistos.add(n);
      return m;
    });
  codigo += t + '\n';
}
const bundle = readFileSync(join(DOCS, 'propuesta.js'), 'utf8')
  .replace(/^import[\s\S]*?from '\.\/[^']+';?\s*$/gm, '');
// El bundle repite constantes ya declaradas arriba (MESES_CORTOS en fechas.js):
// renombro las duplicadas igual que en los src.
const b = bundle.replace(/^(const|let|function|class) ([A-Za-z_$][\w$]*)/gm, (m, tipo, n) => {
  if (vistos.has(n)) return `${tipo} __dupB_${n}`;
  vistos.add(n);
  return m;
});
window.eval(codigo + '\n' + b);
await new Promise((r) => setTimeout(r, 400));

const opts = (x, y) => ({ bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y });
const resultado = { jsdomError: [] };
window.addEventListener('error', (e) => resultado.jsdomError.push(String(e.message ?? e).slice(0, 120)));

// Abrir el sheet de clase: pulso el chip del hero (el de la clase dada).
const chip = document.querySelector('.chip-boton');
resultado.chip = !!chip;
chip?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 150));
const sheet = document.querySelector('.sheet:not(.cerrando)');
resultado.sheetAbierto = !!sheet;
resultado.ariaLabel = sheet?.getAttribute('aria-label') ?? null;

// jsdom: getBoundingClientRect da 0 → parcheo el rect del sheet con el de
// pantalla real (ancho 412, bottom fijo, top≈260): así la franja del gesto
// es la de verdad y el "tap fuera" juzga con geometría coherente.
const rectReal = { left: 0, right: 412, top: 260, bottom: 768, width: 412, height: 508, x: 0, y: 260, toJSON() {} };
Object.defineProperty(window.Element.prototype, 'getBoundingClientRect', {
  value: function () {
    if (this instanceof window.HTMLElement && this.classList?.contains('sheet')) return rectReal;
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
  },
});
async function gesto(nombre, dy) {
  const s = document.querySelector('.sheet:not(.cerrando)');
  if (!s) { resultado[nombre] = 'sin sheet'; return; }
  const y0 = rectReal.top + 20;
  s.dispatchEvent(new window.PointerEvent('pointerdown', opts(150, y0)));
  await new Promise((r) => setTimeout(r, 30));
  if (dy > 0) {
    document.dispatchEvent(new window.PointerEvent('pointermove', opts(150, y0 + dy / 2)));
    await new Promise((r) => setTimeout(r, 20));
    document.dispatchEvent(new window.PointerEvent('pointermove', opts(150, y0 + dy)));
    await new Promise((r) => setTimeout(r, 20));
  }
  document.dispatchEvent(new window.PointerEvent('pointerup', opts(150, y0 + dy)));
  await new Promise((r) => setTimeout(r, 120));
  resultado[nombre] = {
    abiertos: document.querySelectorAll('.sheet:not(.cerrando)').length,
    cerrando: document.querySelector('.sheet')?.classList.contains('cerrando') ?? false,
  };
}

await gesto('deslizar100', 100);
// Reabrimos para el control del toque estático (no debe cerrar).
chip?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 150));
await gesto('estatico', 0);
// Reabrimos y probamos un temblor de 5 px (no debe cerrar).
chip?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 150));
await gesto('temblor5', 5);
// Y la X de la cabecera sigue funcionando (toque corto en botón).
const s3 = document.querySelector('.sheet:not(.cerrando)');
const x3 = s3?.querySelector('.sheet-cerrar');
resultado.xPresente = !!x3;
x3?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 120));
resultado.cierreConX = document.querySelectorAll('.sheet:not(.cerrando)').length === 0;

console.log(JSON.stringify(resultado, null, 1));
