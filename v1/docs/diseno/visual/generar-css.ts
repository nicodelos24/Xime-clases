/** Genera tokens.css (variables CSS) desde tokens.ts. Ejecutar: npx tsx docs/diseno/visual/generar-css.ts */
import { writeFileSync } from 'node:fs';
import { temas, identidad as i } from './tokens';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
function vars(t: (typeof temas)['claro'] | (typeof temas)['oscuro']): string {
  const o: string[] = [];
  for (const [k, v] of Object.entries(t)) {
    if (k === 'estado') continue;
    o.push(`  --c-${kebab(k)}: ${v};`);
  }
  for (const [k, e] of Object.entries(t.estado)) {
    o.push(`  --e-${kebab(k)}-fondo: ${e.fondo};`, `  --e-${kebab(k)}-tinta: ${e.tinta};`);
  }
  return o.join('\n');
}
const escala = (p: string, r: Record<string, number>) => Object.entries(r).map(([k, v]) => `  --${p}-${kebab(k)}: ${v}px;`).join('\n');
const css = `/* GENERADO por generar-css.ts desde tokens.ts. No editar a mano. */
:root, [data-tema='claro'] {
${vars(temas.claro)}
  color-scheme: light;
}
[data-tema='oscuro'] {
${vars(temas.oscuro)}
  color-scheme: dark;
}
:root {
${escala('esp', i.espacio)}
${escala('rad', i.radio)}
${escala('dim', i.dimension)}
${escala('fs', i.tipografia.tamanos)}
${escala('lh', i.tipografia.lineas)}
}
`;
writeFileSync(new URL('./tokens.css', import.meta.url), css);
console.log('tokens.css escrito', css.length, 'bytes');
