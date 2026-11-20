/**
 * Fichas de alumnos v5 (Pieza C): alta y edición sobre datos sintéticos.
 *
 * Dominio puro: sin DOM, sin `Date.now()`, sin localStorage. La UI habla con
 * el `RepositorioClases` (que persiste); acá solo están las reglas y el
 * cálculo de la vista derivada. La modalidad y la fecha de alta siguen el
 * contrato histórico de v2 (`Alumno`): `modalidad: 'mensual'|'individual'`,
 * `fechaAlta: AAAA-MM-DD`, `activo` (la ficha se conserva aunque deje de venir).
 *
 * Contacto es OPCIONAL y apagado por defecto: el contrato v1 §MVP deja el
 * tutor/contacto como campo opcional no habilitado. Ninguna pantalla lo pide
 * para dar de alta; si se completa, es un dato sintético más de la ficha.
 */

export type Modalidad = 'mensual' | 'individual';

/** Ficha persistida. `id` estable: lo usan los pagos y la agenda histórica. */
export type AlumnoFicha = {
  id: string;
  nombre: string;
  modalidad: Modalidad;
  /** Grupo existente (texto libre elegido en la ficha). */
  grupo: string;
  /** Día ancla del ciclo para Cobros (1..31); default 21 si no se da. */
  ancla: number;
  /** Alta AAAA-MM-DD en America/Montevideo. */
  fechaAlta: string;
  /** Sigue visible aunque deje de venir; hoy no se da de baja desde la UI. */
  activo: boolean;
  /** Color del avatar (token v5). Se elige por ID para que sea estable. */
  color: string;
  /** Contacto opcional del contrato (tutor/teléfono). Solo si se completa. */
  contacto: string;
};

/** Datos que la ficha permite cargar/editar (sin ID, sin fecha de alta). */
export type AlumnoFichaInput = {
  nombre: string;
  modalidad: Modalidad;
  grupo: string;
  ancla?: number;
  contacto?: string;
};

/** Grupos existentes de la demo (seleccionables, sin crear grupos nuevos). */
export const GRUPOS_DEMO = ['Martes A', 'Martes B', 'Viernes', 'Lunes', 'Sábado'] as const;

const COLORES = ['avatar', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];

/** Color estable a partir del ID (no cambia al editar ni al reordenar). */
export function colorPorId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORES[h % COLORES.length]!;
}

/** Iniciales para el avatar (1–2 letras), acento-insensible. */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0]![0]! + (partes[1]?.[0] ?? '')).toUpperCase();
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

/**
 * Valida los campos de la ficha. Devuelve un mapa campo→mensaje (vacío si OK).
 * RegExp literal para no depender de `v` flag: evita ReDoS y es suficiente
 * para nombres propios con acentos, apóstrofos, guiones y espacios.
 */
export function validarAlumno(input: AlumnoFichaInput): Record<string, string> {
  const errores: Record<string, string> = {};
  const nombre = texto(input.nombre);
  if (nombre.length < 2) errores.nombre = 'Ingresá el nombre del alumno';
  else if (!/^[\p{L}\p{M}][\p{L}\p{M} '\-.]*$/u.test(nombre)) errores.nombre = 'El nombre solo admite letras, espacios, apóstrofos, guiones y puntos';
  if (input.modalidad !== 'mensual' && input.modalidad !== 'individual') errores.modalidad = 'Elegí una modalidad';
  if (!GRUPOS_DEMO.includes(input.grupo as (typeof GRUPOS_DEMO)[number])) errores.grupo = 'Elegí un grupo existente';
  if (input.ancla !== undefined && (!Number.isInteger(input.ancla) || input.ancla < 1 || input.ancla > 31)) {
    errores.ancla = 'El día ancla debe estar entre 1 y 31';
  }
  const contacto = texto(input.contacto);
  if (contacto.length > 120) errores.contacto = 'El contacto es demasiado largo (máximo 120 caracteres)';
  return errores;
}

export function alumnoEsValido(input: AlumnoFichaInput): boolean {
  return Object.keys(validarAlumno(input)).length === 0;
}

/** Campos editables ya normalizados (todos presentes, listos para guardar). */
type CamposNormalizados = {
  nombre: string;
  modalidad: Modalidad;
  grupo: string;
  ancla: number;
  contacto: string;
};

/** Normaliza un input válido a los campos que se guardan (contacto opcional). */
export function normalizarAlumno(input: AlumnoFichaInput): CamposNormalizados {
  return {
    nombre: texto(input.nombre),
    modalidad: input.modalidad,
    grupo: texto(input.grupo),
    ancla: input.ancla ?? 21,
    contacto: texto(input.contacto),
  };
}

const ID_RE = /^al-[a-z0-9]{8,}$/i;

/** Genera un ID estable y único (no reutiliza nombres: los pagos lo referencian). */
export function nuevoIdAlumno(yaExiste: (id: string) => boolean, azar: () => number = Math.random): string {
  for (let intento = 0; intento < 100; intento += 1) {
    const id = `al-${Math.floor(azar() * 0xffffffff).toString(36).padStart(7, '0')}${Math.floor(azar() * 0xffffffff).toString(36).padStart(7, '0')}`;
    if (!yaExiste(id)) return id;
  }
  throw new Error('No se pudo generar un ID de alumno único');
}

/** Alta: valida, congela fecha de alta y actor, y asigna ID + color estables. */
export function crearAlumno(
  input: AlumnoFichaInput,
  fechaAlta: string,
  yaExiste: (id: string) => boolean,
  azar: () => number = Math.random,
): AlumnoFicha {
  const errores = validarAlumno(input);
  if (Object.keys(errores).length > 0) throw new Error(Object.values(errores)[0]!);
  const norm = normalizarAlumno(input);
  const id = nuevoIdAlumno(yaExiste, azar);
  return {
    id,
    ...norm,
    fechaAlta,
    activo: true,
    color: colorPorId(id),
  };
}

/** Edición: conserva ID, fecha de alta, activo y color; cambia solo lo editable. */
export function editarAlumno(alumno: AlumnoFicha, input: AlumnoFichaInput): AlumnoFicha {
  const errores = validarAlumno(input);
  if (Object.keys(errores).length > 0) throw new Error(Object.values(errores)[0]!);
  return { ...alumno, ...normalizarAlumno(input) };
}

/**
 * Sanea una ficha leída del almacén: completa campos que falten en versiones
 * anteriores sin inventar identidad (ID/nombre/fecha de alta se respetan tal
 * cual). Las fichas Planas v5 originales (`tipo`) se migran a `modalidad`.
 */
export function normalizarFichaGuardada(dato: Partial<AlumnoFicha> & { tipo?: string }): AlumnoFicha | null {
  if (!dato || typeof dato.id !== 'string' || !dato.id.trim()) return null;
  if (typeof dato.nombre !== 'string' || !dato.nombre.trim()) return null;
  const modalidad: Modalidad = dato.modalidad === 'individual' || dato.tipo === 'individual' ? 'individual' : 'mensual';
  const id = dato.id;
  return {
    id,
    nombre: dato.nombre,
    modalidad,
    grupo: texto(dato.grupo).replace(/^Grupo\s+/, '') || 'Martes A',
    ancla: Number.isInteger(dato.ancla) && dato.ancla! >= 1 && dato.ancla! <= 31 ? dato.ancla! : 21,
    fechaAlta: typeof dato.fechaAlta === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dato.fechaAlta) ? dato.fechaAlta : '2026-01-01',
    activo: dato.activo !== false,
    color: typeof dato.color === 'string' ? dato.color : colorPorId(id),
    contacto: typeof dato.contacto === 'string' ? dato.contacto : '',
  };
}

/** Identificador de ID válido (para tests y defensa al leer). */
export function esIdAlumno(id: string): boolean {
  return ID_RE.test(id);
}

/* -------------------------------------------------- vista derivada (UI) */

export type FichaVista = AlumnoFicha & {
  ini: string;
  vence: number;
  tipo: Modalidad; // alias usado por los chips/filtros de la vista actual
  alta: number;    // días desde el alta (para "Más recientes")
};

/**
 * Proyecta las fichas a la fila que pinta la lista, con el vencimiento
 * derivado del repositorio (no se edita a mano). Días = vencimiento - hoy.
 */
export function construirVista(
  fichas: readonly AlumnoFicha[],
  pagosPorAlumno: ReadonlyMap<string, number>,
  hoy: string,
): FichaVista[] {
  const dia = Date.parse(`${hoy}T00:00:00Z`);
  return fichas.map((f) => {
    const vence = pagosPorAlumno.get(f.id) ?? 0;
    return {
      ...f,
      ini: iniciales(f.nombre),
      vence,
      tipo: f.modalidad,
      alta: Number.isNaN(dia) ? 0 : Math.max(0, Math.round((dia - Date.parse(`${f.fechaAlta}T00:00:00Z`)) / 86400000)),
    };
  });
}

export type OrdenAlumnos = 'ninguno' | 'az' | 'za' | 'recientes' | 'vence';

/** Aplica búsqueda acento-insensible, filtros y orden a la vista. Sin mutar. */
export function filtrarYOrdenar(
  filas: readonly FichaVista[],
  busqueda: string,
  filtros: ReadonlySet<string>,
  orden: OrdenAlumnos,
): FichaVista[] {
  const q = busqueda.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const out = filas.filter((a) => {
    if (q && !a.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) return false;
    if (filtros.has('mensual') && a.modalidad !== 'mensual') return false;
    if (filtros.has('individual') && a.modalidad !== 'individual') return false;
    if (filtros.has('aldia') && a.vence <= 0) return false;
    return true;
  });
  const cmp: Record<Exclude<OrdenAlumnos, 'ninguno'>, (a: FichaVista, b: FichaVista) => number> = {
    az: (a, b) => a.nombre.localeCompare(b.nombre),
    za: (a, b) => b.nombre.localeCompare(a.nombre),
    recientes: (a, b) => b.alta - a.alta,
    vence: (a, b) => a.vence - b.vence,
  };
  return orden === 'ninguno' ? out : [...out].sort(cmp[orden]);
}
