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
/** Grupos existentes de la demo (seleccionables, sin crear grupos nuevos). */
export const GRUPOS_DEMO = ['Martes A', 'Martes B', 'Viernes', 'Lunes', 'Sábado'];
const COLORES = ['avatar', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];
/** Color estable a partir del ID (no cambia al editar ni al reordenar). */
export function colorPorId(id) {
    let h = 0;
    for (let i = 0; i < id.length; i += 1)
        h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return COLORES[h % COLORES.length];
}
/** Iniciales para el avatar (1–2 letras), acento-insensible. */
export function iniciales(nombre) {
    const partes = nombre.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(Boolean);
    if (partes.length === 0)
        return '?';
    return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
}
function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}
/**
 * Valida los campos de la ficha. Devuelve un mapa campo→mensaje (vacío si OK).
 * RegExp literal para no depender de `v` flag: evita ReDoS y es suficiente
 * para nombres propios con acentos, apóstrofos, guiones y espacios.
 */
export function validarAlumno(input) {
    const errores = {};
    const nombre = texto(input.nombre);
    if (nombre.length < 2)
        errores.nombre = 'Ingresá el nombre del alumno';
    else if (!/^[\p{L}\p{M}][\p{L}\p{M} '\-.]*$/u.test(nombre))
        errores.nombre = 'El nombre solo admite letras, espacios, apóstrofos, guiones y puntos';
    if (input.modalidad !== 'mensual' && input.modalidad !== 'individual')
        errores.modalidad = 'Elegí una modalidad';
    if (!GRUPOS_DEMO.includes(input.grupo))
        errores.grupo = 'Elegí un grupo existente';
    if (input.ancla !== undefined && (!Number.isInteger(input.ancla) || input.ancla < 1 || input.ancla > 31)) {
        errores.ancla = 'El día ancla debe estar entre 1 y 31';
    }
    const contacto = texto(input.contacto);
    if (contacto.length > 120)
        errores.contacto = 'El contacto es demasiado largo (máximo 120 caracteres)';
    return errores;
}
export function alumnoEsValido(input) {
    return Object.keys(validarAlumno(input)).length === 0;
}
/** Normaliza un input válido a los campos que se guardan (contacto opcional). */
export function normalizarAlumno(input) {
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
export function nuevoIdAlumno(yaExiste, azar = Math.random) {
    for (let intento = 0; intento < 100; intento += 1) {
        const id = `al-${Math.floor(azar() * 0xffffffff).toString(36).padStart(7, '0')}${Math.floor(azar() * 0xffffffff).toString(36).padStart(7, '0')}`;
        if (!yaExiste(id))
            return id;
    }
    throw new Error('No se pudo generar un ID de alumno único');
}
/** Alta: valida, congela fecha de alta y actor, y asigna ID + color estables. */
export function crearAlumno(input, fechaAlta, yaExiste, azar = Math.random) {
    const errores = validarAlumno(input);
    if (Object.keys(errores).length > 0)
        throw new Error(Object.values(errores)[0]);
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
export function editarAlumno(alumno, input) {
    const errores = validarAlumno(input);
    if (Object.keys(errores).length > 0)
        throw new Error(Object.values(errores)[0]);
    return { ...alumno, ...normalizarAlumno(input) };
}
/**
 * Sanea una ficha leída del almacén: completa campos que falten en versiones
 * anteriores sin inventar identidad (ID/nombre/fecha de alta se respetan tal
 * cual). Las fichas Planas v5 originales (`tipo`) se migran a `modalidad`.
 */
export function normalizarFichaGuardada(dato) {
    if (!dato || typeof dato.id !== 'string' || !dato.id.trim())
        return null;
    if (typeof dato.nombre !== 'string' || !dato.nombre.trim())
        return null;
    const modalidad = dato.modalidad === 'individual' || dato.tipo === 'individual' ? 'individual' : 'mensual';
    const id = dato.id;
    return {
        id,
        nombre: dato.nombre,
        modalidad,
        grupo: texto(dato.grupo).replace(/^Grupo\s+/, '') || 'Martes A',
        ancla: Number.isInteger(dato.ancla) && dato.ancla >= 1 && dato.ancla <= 31 ? dato.ancla : 21,
        fechaAlta: typeof dato.fechaAlta === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dato.fechaAlta) ? dato.fechaAlta : '2026-01-01',
        activo: dato.activo !== false,
        color: typeof dato.color === 'string' ? dato.color : colorPorId(id),
        contacto: typeof dato.contacto === 'string' ? dato.contacto : '',
    };
}
/** Identificador de ID válido (para tests y defensa al leer). */
export function esIdAlumno(id) {
    return ID_RE.test(id);
}
/**
 * Proyecta las fichas a la fila que pinta la lista, con el vencimiento
 * derivado del repositorio (no se edita a mano). Días = vencimiento - hoy.
 */
export function construirVista(fichas, pagosPorAlumno, hoy) {
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
/** Aplica búsqueda acento-insensible, filtros y orden a la vista. Sin mutar. */
export function filtrarYOrdenar(filas, busqueda, filtros, orden) {
    const q = busqueda.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const out = filas.filter((a) => {
        if (q && !a.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q))
            return false;
        if (filtros.has('mensual') && a.modalidad !== 'mensual')
            return false;
        if (filtros.has('individual') && a.modalidad !== 'individual')
            return false;
        if (filtros.has('aldia') && a.vence <= 0)
            return false;
        return true;
    });
    const cmp = {
        az: (a, b) => a.nombre.localeCompare(b.nombre),
        za: (a, b) => b.nombre.localeCompare(a.nombre),
        recientes: (a, b) => b.alta - a.alta,
        vence: (a, b) => a.vence - b.vence,
    };
    return orden === 'ninguno' ? out : [...out].sort(cmp[orden]);
}
