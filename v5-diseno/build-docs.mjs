// Regenera docs/ desde v5-diseno/ (procedimiento v5/PLAN.md §7.3, pasos 3-5).
// Uso: node build-docs.mjs AAAAMMDDHHMM   (sello de cache-busting)
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from './node_modules/typescript/lib/typescript.js';

const RAIZ = fileURLToPath(new URL('.', import.meta.url));
const DOCS = join(RAIZ, '..', 'docs');
const SELLO = process.argv[2];
if (!/^\d{12}$/.test(SELLO ?? '')) {
  console.error('Falta el sello AAAAMMDDHHMM');
  process.exit(1);
}

/** TS → JS ESM: mismas opciones que serve.mjs, imports relativos .ts → .js. */
function transpilar(origen, nombre) {
  const out = ts.transpileModule(origen, {
    fileName: nombre,
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      verbatimModuleSyntax: false,
      isolatedModules: true,
      removeComments: false,
    },
  }).outputText;
  // Solo las rutas relativas: nada de tocar strings sueltos del código.
  // Igual que el build anterior, cada import lleva el sello para que el
  // navegador no sirva módulos viejos desde caché.
  return out
    .replace(/(from\s+['"])(\.{1,2}\/[^'"?]+?)\.ts(['"])/g, '$1$2.js$3')
    .replace(/(from\s+['"])(\.{1,2}\/[^'"?]+?\.js)(\?v=\d{12})?(['"])/g, `$1$2?v=${SELLO}$4`);
}

const copiar = ['index.html', 'propuesta.css', 'tokens.css', 'icons.js'];
for (const f of copiar) {
  let txt = await readFile(join(RAIZ, f), 'utf8');
  if (f === 'index.html') txt = txt.replace(/\?v=\d{12}/g, `?v=${SELLO}`);
  await writeFile(join(DOCS, f), txt);
}

const src = await readdir(join(RAIZ, 'src'));
for (const f of src.filter((n) => n.endsWith('.ts'))) {
  await writeFile(join(DOCS, 'src', f.replace(/\.ts$/, '.js')), transpilar(await readFile(join(RAIZ, 'src', f), 'utf8'), f));
}
await writeFile(join(DOCS, 'propuesta.js'), transpilar(await readFile(join(RAIZ, 'propuesta.ts'), 'utf8'), 'propuesta.ts'));

// v5-diseno/index.html también lleva el sello (sirve propuesta.ts vía serve.mjs).
const htmlFuente = join(RAIZ, 'index.html');
const html = (await readFile(htmlFuente, 'utf8')).replace(/\?v=\d{12}/g, `?v=${SELLO}`);
await writeFile(htmlFuente, html);

// docs/index.html carga propuesta.js, no propuesta.ts.
const docsIndex = join(DOCS, 'index.html');
await writeFile(docsIndex, (await readFile(docsIndex, 'utf8')).replace('propuesta.ts', 'propuesta.js'));

console.log('docs/ regenerado con sello', SELLO);
