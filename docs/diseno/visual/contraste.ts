/**
 * Utilidades de contraste WCAG 2.x, sin dependencias.
 * Sirven para (a) verificar los tokens (verificar.ts) y (b) derivar colores
 * accesibles cuando un instituto configura su propio color de marca.
 */

export type Hex = `#${string}`;

function canal(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function aRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function aHex([r, g, b]: [number, number, number]): Hex {
  const p = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}`.toUpperCase() as Hex;
}

export function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razón de contraste WCAG entre dos colores opacos (1 a 21). */
export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla `a` hacia `b` en proporción t (0..1). */
export function mezclar(a: string, b: string, t: number): Hex {
  const x = aRgb(a);
  const y = aRgb(b);
  return aHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

/**
 * Oscurece o aclara `fg` (hacia negro o blanco) hasta alcanzar `min` sobre `bg`.
 * Conserva el tono. Devuelve el mismo color si ya cumple.
 */
export function asegurarContraste(fg: string, bg: string, min = 4.5): Hex {
  if (contraste(fg, bg) >= min) return aHex(aRgb(fg));
  const objetivo = luminancia(bg) > 0.4 ? '#000000' : '#FFFFFF';
  for (let t = 0.02; t <= 1.0001; t += 0.02) {
    const c = mezclar(fg, objetivo, t);
    if (contraste(c, bg) >= min) return c;
  }
  return objetivo as Hex;
}

/** Texto sobre un color de marca: el de mayor contraste entre tinta clara y oscura. */
export function textoSobre(fondo: string, claro: Hex = '#FFFFFF', oscuro: Hex = '#1F1719'): Hex {
  return contraste(claro, fondo) >= contraste(oscuro, fondo) ? claro : oscuro;
}

export interface MarcaDerivada {
  /** Relleno de botones/acento: el color elegido o un ajuste mínimo informado si no alcanza AA. */
  relleno: Hex;
  /** Texto/ícono sobre `relleno`. */
  sobreRelleno: Hex;
  /** Para texto, enlaces e íconos del color de marca sobre la superficie (≥ 4.5:1). */
  texto: Hex;
  /** Fondo suave (chips, selección) y su texto (≥ 4.5:1). */
  suave: Hex;
  sobreSuave: Hex;
  /** Cosas que el instituto debería saber de su color (se muestran en Ajustes). */
  avisos: string[];
}

/**
 * Deriva la marca de un instituto a partir de UN color para un tema.
 * `superficie` = fondo de las tarjetas del tema. Nunca devuelve pares bajo AA:
 * ajusta el color de texto; si un tono medio no admite ningún texto a 4.5:1,
 * mueve ligeramente el relleno e informa el cambio en `avisos`.
 */
export function derivarMarca(color: string, superficie: string, tema: 'claro' | 'oscuro'): MarcaDerivada {
  const avisos: string[] = [];
  const original = aHex(aRgb(color));
  const tintaElegida = textoSobre(original);
  // Si el elegido es un gris medio, ninguno de los dos textos tiene 4.5:1.
  // Ajustamos el RELLENO hacia el extremo opuesto del texto hasta que sí cumpla.
  const relleno = contraste(tintaElegida, original) >= 4.5
    ? original : asegurarContraste(original, tintaElegida, 4.5);
  const sobreRelleno = textoSobre(relleno);
  if (relleno !== original) {
    avisos.push(`El acento se ajustó de ${original} a ${relleno} para que el texto del botón alcance 4.5:1.`);
  }
  const texto = asegurarContraste(relleno, superficie, 4.5);
  const suave = mezclar(relleno, superficie, tema === 'claro' ? 0.88 : 0.8);
  const sobreSuave = asegurarContraste(relleno, suave, 4.5);
  if (contraste(relleno, superficie) < 3) {
    avisos.push('Como borde o ícono sobre las tarjetas este color se ve poco (< 3:1); la app usará una variante más intensa.');
  }
  return { relleno, sobreRelleno, texto, suave, sobreSuave, avisos };
}
