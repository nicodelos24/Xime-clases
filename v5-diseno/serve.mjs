// Servidor estático mínimo para el prototipo v5.
// Motivo: el prototipo carga TypeScript como módulos del navegador
// (<script type="module" src="propuesta.ts">). Dos problemas que resuelve:
//   1. python http.server les pone un MIME que Chrome bloquea en módulos.
//   2. El navegador no entiende sintaxis TS (p. ej. `import { type X }`),
//      así que los .ts se transpilan a JavaScript con el TypeScript del
//      proyecto antes de servirlos. Sin build previo, sin node_modules.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
// En worktrees nuevos node_modules puede no estar: se usa el TypeScript del
// repo principal (o el que tenga el proceso en NODE_PATH); nunca se sirve HTTP.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require(
  ['./node_modules/typescript', '../../node_modules/typescript', '/home/nico/Documentos/GitHub/Xime-clases/v5-diseno/node_modules/typescript']
    .find((r) => { try { require.resolve(r); return true; } catch { return false; } })
    ?? 'typescript'
);

const RAIZ = fileURLToPath(new URL('.', import.meta.url));
const PUERTO = Number(process.env.PORT ?? 8797);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.ts': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

/** TypeScript → JavaScript, conservando la ruta relativa para los imports. */
function transpilar(ruta, origen) {
  const resultado = ts.transpileModule(origen, {
    fileName: ruta,
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      verbatimModuleSyntax: false,
      isolatedModules: true,
      removeComments: false,
    },
  });
  return resultado.outputText;
}

/**
 * Allowlist: el prototipo sólo necesita sus propios archivos. Los .ts se
 * sirven transpilados (el navegador los necesita), pero NI los tests, NI
 * serve.mjs, NI package.json salen del servidor (seguridad 28-nov).
 * `docs/` se sirve tal cual porque es el build publicable; `node_modules/`
 * se blocked por defecto: TypeScript se importa por ruta absoluta de archivo.
 */
const RUTAS_PERMITIDAS = new Set([
  '/index.html', '/icons.js', '/favicon.ico',
  '/propuesta.ts', '/propuesta.css',
]);

/** Extensiones que el prototipo necesita, en cualquier carpeta propia. */
const EXTENSIONES_PERMITIDAS = new Set(['.html', '.css', '.js', '.ts', '.svg', '.png', '.jpg', '.ico']);
const CARPETAS_PERMITIDAS = new Set(['src', 'docs']);
/** Errores de URL y rutas especiales del build estático. */
const ARCHIVOS_ESPECIALES = new Set(['robots.txt', 'sitemap.xml']);

/** Normaliza y valida la ruta:false = fuera de la allowlist o traversal. */
export function rutaSegura(pathname, raiz = RAIZ) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  decoded = decoded.replace(/\\/g, '/');
  const partes = decoded.split('/').filter(Boolean);
  if (partes.some((p) => p === '..' || p === '.' || p.includes('\0'))) return null;
  if (decoded === '/' || decoded === '') return resolve(raiz, 'index.html');
  const rel = `/${partes.join('/')}`;
  const base = resolve(raiz);
  const abs = resolve(base, `.${rel}`);
  if (abs !== base && !abs.startsWith(base + sep)) return null;
  const nombre = partes.at(-1);
  const ext = extname(abs).toLowerCase();
  if (partes.length === 1 && ARCHIVOS_ESPECIALES.has(nombre)) return abs;
  if (partes.length === 1 && RUTAS_PERMITIDAS.has(rel)) return abs;
  if (partes.length > 2 || !CARPETAS_PERMITIDAS.has(partes[0])) return null;
  if (!EXTENSIONES_PERMITIDAS.has(ext)) return null;
  if (!/^[\w.-]+$/.test(nombre)) return null;
  if (partes[0] === 'src' && partes.length !== 2) return null;
  return abs;
}

const CABECERAS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // módulos TS locales; sin eval ni CDN
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "img-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
  ].join('; '),
};
const servidor = createServer(async (req, res) => {
  const ruta = rutaSegura((req.url ?? '').split('?')[0]);
  if (ruta === null) {
    res.writeHead(404, { ...CABECERAS, 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
    return;
  }
  try {
    const info = await stat(ruta);
    if (info.isDirectory()) throw new Error('directorio');
    const ext = extname(ruta).toLowerCase();
    let cuerpo = await readFile(ruta, 'utf8');
    if (ext === '.ts') cuerpo = transpilar(ruta, cuerpo);
    res.writeHead(200, { ...CABECERAS, 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404, { ...CABECERAS, 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
  }
});

// Sólo loopback: el servidor es de desarrollo, nunca se expone a la red.
// Con XIME_SERVIDOR=test se exporta para los tests y NO se abre el puerto.
if (process.env.XIME_SERVIDOR !== 'test') {
  servidor.listen(PUERTO, '127.0.0.1', () => {
    console.log(`prototipo v5 en http://127.0.0.1:${PUERTO}/index.html`);
  });
}
export { servidor, CABECERAS };
