// Servidor estático mínimo para el prototipo v5.
// Motivo: el prototipo carga TypeScript como módulos del navegador
// (<script type="module" src="propuesta.ts">). Dos problemas que resuelve:
//   1. python http.server les pone un MIME que Chrome bloquea en módulos.
//   2. El navegador no entiende sintaxis TS (p. ej. `import { type X }`),
//      así que los .ts se transpilan a JavaScript con el TypeScript del
//      proyecto antes de servirlos. Sin build previo, sin node_modules.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from './node_modules/typescript/lib/typescript.js';

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

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    if (rel === '/' || rel === '\\') rel = '/index.html';
    const ruta = join(RAIZ, rel);
    if (!ruta.startsWith(RAIZ)) {
      res.writeHead(403).end('403');
      return;
    }
    const info = await stat(ruta);
    if (info.isDirectory()) {
      res.writeHead(404).end('404');
      return;
    }
    const ext = extname(ruta).toLowerCase();
    let cuerpo = await readFile(ruta, 'utf8');
    if (ext === '.ts') cuerpo = transpilar(ruta, cuerpo);
    res.writeHead(200, {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('404');
  }
});

servidor.listen(PUERTO, () => {
  console.log(`prototipo v5 en http://localhost:${PUERTO}/index.html`);
});
