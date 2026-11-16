/**
 * Verifica que todos los pares de texto/fondo de tokens.ts cumplan WCAG AA.
 * Ejecutar:  npx tsx docs/diseno/visual/verificar.ts   (sale con código 1 si algo falla)
 */
import { temas, temaConMarca } from './tokens';
import { contraste } from './contraste';

type Par = [string, string, string, number];
let fallos = 0;
const filas: string[] = [];

for (const nombre of ['claro', 'oscuro'] as const) {
  const t = temas[nombre];
  const pares: Par[] = [
    ['tinta / fondo', t.tinta, t.fondo, 4.5],
    ['tinta / superficie', t.tinta, t.superficie, 4.5],
    ['secundaria / fondo', t.secundaria, t.fondo, 4.5],
    ['secundaria / superficie', t.secundaria, t.superficie, 4.5],
    ['secundaria / superficieAlt', t.secundaria, t.superficieAlt, 4.5],
    ['tenue / fondo', t.tenue, t.fondo, 4.5],
    ['tenue / superficie', t.tenue, t.superficie, 4.5],
    ['tenue / superficieAlt', t.tenue, t.superficieAlt, 4.5],
    ['sobreMarca / marca (botón)', t.sobreMarca, t.marca, 4.5],
    ['marca / fondo (enlace)', t.marca, t.fondo, 4.5],
    ['marca / superficie', t.marca, t.superficie, 4.5],
    ['marca / marcaSuave', t.marca, t.marcaSuave, 4.5],
    ['foco / fondo (UI ≥3)', t.foco, t.fondo, 3],
    ['foco / superficie (UI ≥3)', t.foco, t.superficie, 3],
    ['foco / marcaSuave (UI ≥3)', t.foco, t.marcaSuave, 3],
    ['bordeFuerte / fondo (UI ≥3)', t.bordeFuerte, t.fondo, 3],
    ['bordeFuerte / superficie (UI ≥3)', t.bordeFuerte, t.superficie, 3],
    ['error / superficie', t.error, t.superficie, 4.5],
    ['sobreError / error (botón)', t.sobreError, t.error, 4.5],
    ['deshabilitadoTexto / deshabilitadoFondo', t.deshabilitadoTexto, t.deshabilitadoFondo, 3],
  ];
  for (const [k, e] of Object.entries(t.estado)) {
    pares.push([`estado ${k}: tinta / fondo`, e.tinta, e.fondo, 4.5]);
    pares.push([`estado ${k}: tinta / superficie (ícono ≥3)`, e.tinta, t.superficie, 3]);
  }
  for (const [n, a, b, min] of pares) {
    const r = contraste(a, b);
    const ok = r >= min;
    if (!ok) fallos++;
    filas.push(`${ok ? 'OK ' : 'FALLA'} ${nombre.padEnd(6)} ${n.padEnd(46)} ${r.toFixed(2)}:1 (mín ${min})`);
  }
  // Marca de instituto: casos extremos deben dar siempre pares AA
  for (const c of ['#FFD400', '#0B3D91', '#E91E63', '#2E7D32', '#808080']) {
    const m = temaConMarca(nombre, c);
    const a = contraste(m.sobreMarca, m.marca);
    const b = contraste(m.marcaTexto, t.superficie);
    const d = contraste(m.sobreMarcaSuave, m.marcaSuave);
    const ok = a >= 4.5 && b >= 4.5 && d >= 4.5;
    if (!ok) fallos++;
    filas.push(`${ok ? 'OK ' : 'FALLA'} ${nombre.padEnd(6)} marca ${c}: botón ${a.toFixed(2)} · texto ${b.toFixed(2)} · suave ${d.toFixed(2)}${m.avisoMarca.length ? ' (con aviso)' : ''}`);
  }
}
console.log(filas.join('\n'));
console.log(fallos ? `\n${fallos} pares fallan` : '\nTodos los pares cumplen WCAG AA');
process.exit(fallos ? 1 : 0);
