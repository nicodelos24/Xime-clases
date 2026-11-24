// Compilación aislada del build publicado: transpila las mismas fuentes y
// deja los estáticos fuera de docs/, sin sello de publicación ni tocar master.
// Uso: node build-check.mjs <directorio-de-salida>
import ts from './node_modules/typescript/lib/typescript.js';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));
const destino = process.argv[2];
if (!destino) throw new Error('Indicá el directorio de salida');
await rm(destino, { recursive: true, force: true });
await mkdir(join(destino, 'src'), { recursive: true });

/** TS → JS ESM: mismas opciones que build-docs.mjs, con imports .js. */
function transpilar(texto, nombre) {
  return ts.transpileModule(texto, {
    fileName: nombre,
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      verbatimModuleSyntax: false,
      isolatedModules: true,
    },
  }).outputText.replace(/(from\s+['"])(\.{1,2}\/[^'"?]+?)\.ts(['"])/g, '$1$2.js$3');
}

for (const nombre of ['index.html', 'propuesta.css', 'tokens.css', 'icons.js']) {
  let texto = await readFile(join(raiz, nombre), 'utf8');
  if (nombre === 'index.html') texto = texto.replace('propuesta.ts', 'propuesta.js');
  await writeFile(join(destino, nombre), texto);
}
for (const nombre of await readdir(join(raiz, 'src'))) {
  if (!nombre.endsWith('.ts')) continue;
  await writeFile(join(destino, 'src', nombre.replace(/\.ts$/, '.js')), transpilar(await readFile(join(raiz, 'src', nombre), 'utf8'), nombre));
}
await writeFile(join(destino, 'propuesta.js'), transpilar(await readFile(join(raiz, 'propuesta.ts'), 'utf8'), 'propuesta.ts'));
console.log(`Build de verificación generado en ${destino}`);
