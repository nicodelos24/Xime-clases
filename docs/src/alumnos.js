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
export const COLORES = ['avatar', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];
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
    // Primera letra de la PRIMERA palabra y del ÚLTIMO apellido (no de la
    // segunda palabra): «Carla T. García» → CG, «Lucía García» → LG.
    const ultima = partes[partes.length - 1];
    const segunda = partes.length > 1 && ultima !== partes[0] ? ultima : '';
    // Sólo letras: un nombre hostil no puede convertir las iniciales en HTML.
    const ini = (partes[0][0] + (segunda[0] ?? '')).toUpperCase().replace(/[^A-Z]/g, '');
    return ini || '?';
}
/** Nombre completo visible: `nombre` + `apellido` (si hay). Sin apellido, solo `nombre`.
 *  `nombre` puede traer el apellido ya incluido (datos viejos); por eso solo se
 *  concatena si el apellido no está ya al final, para no duplicarlo. */
export function nombreCompleto(a) {
    const apellido = (a.apellido ?? '').trim();
    if (!apellido)
        return a.nombre.trim();
    const n = a.nombre.trim();
    return n.toLowerCase().endsWith(apellido.toLowerCase()) ? n : `${n} ${apellido}`;
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
    if (input.nombre !== undefined && nombre.length < 2)
        errores.nombre = 'Ingresá el nombre del alumno';
    else if (input.nombre !== undefined && !/^[\p{L}\p{M}][\p{L}\p{M} '\-.]*$/u.test(nombre)) {
        errores.nombre = 'El nombre solo admite letras, espacios, apóstrofos, guiones y puntos';
    }
    if (input.modalidad !== undefined && input.modalidad !== 'mensual' && input.modalidad !== 'individual')
        errores.modalidad = 'Elegí una modalidad';
    if (input.ancla !== undefined && (!Number.isInteger(input.ancla) || input.ancla < 1 || input.ancla > 31)) {
        errores.ancla = 'El día ancla debe estar entre 1 y 31';
    }
    const contacto = texto(input.contacto);
    if (contacto.length > 120)
        errores.contacto = 'El contacto es demasiado largo (máximo 120 caracteres)';
    if (input.fechaAlta !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(input.fechaAlta)) {
        errores.fechaAlta = 'Fecha de registro inválida';
    }
    else if (input.fechaAlta !== undefined) {
        // Validación de día real (bisiestos, meses cortos) sin depender de Date.
        const [y, m, d] = input.fechaAlta.split('-').map(Number);
        const maxDia = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0;
        if (m < 1 || m > 12 || d < 1 || d > maxDia)
            errores.fechaAlta = 'Fecha de registro inválida';
    }
    if (input.pagado !== undefined && typeof input.pagado !== 'boolean')
        errores.pagado = 'Estado de pago inválido';
    if (input.tarifaUYU !== undefined && (!Number.isSafeInteger(input.tarifaUYU) || input.tarifaUYU <= 0)) {
        errores.tarifaUYU = 'Ingresá una tarifa entera en UYU (mayor a 0)';
    }
    if (input.formaPago !== undefined && input.formaPago !== 'mensual-fijo' && input.formaPago !== 'por-clase') {
        errores.formaPago = 'Elegí la forma de pago';
    }
    return errores;
}
export function alumnoEsValido(input) {
    return Object.keys(validarAlumno(input)).length === 0;
}
/** Normaliza un input válido a los campos que se guardan (contacto opcional). */
export function normalizarAlumno(input) {
    return {
        nombre: texto(input.nombre),
        modalidad: input.modalidad ?? 'mensual',
        grupo: texto(input.grupo),
        ancla: input.ancla ?? 21,
        contacto: texto(input.contacto),
        pagado: input.pagado ?? false,
        tarifaUYU: input.tarifaUYU ?? null,
        formaPago: input.formaPago ?? 'mensual-fijo',
        apellido: texto(input.apellido),
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
    if (input.nombre === undefined)
        errores.nombre = 'Ingresá el nombre del alumno';
    if (input.formaPago === undefined && input.modalidad === undefined)
        errores.modalidad = 'Elegí una modalidad';
    if (Object.keys(errores).length > 0)
        throw new Error(Object.values(errores)[0]);
    const norm = normalizarAlumno(input);
    const id = nuevoIdAlumno(yaExiste, azar);
    return {
        id,
        ...norm,
        fechaAlta: input.fechaAlta ?? fechaAlta,
        activo: true,
        color: colorPorId(id),
        foto: '',
    };
}
/**
 * Edición: conserva ID, fecha de alta, activo y color, y también los campos
 * opcionales que el formulario no expone. Los defaults (ancla 21, contacto
 * vacío) se aplican SOLO al crear; si el input no trae `ancla`/`contacto`, se
 * mantiene el valor vigente de la ficha en vez de inventar uno. Así guardar la
 * ficha demo a2 sin tocar nada no le cambia el ancla 26 por el default 21.
 */
export function editarAlumno(alumno, input) {
    const errores = validarAlumno(input);
    if (Object.keys(errores).length > 0)
        throw new Error(Object.values(errores)[0]);
    return {
        ...alumno,
        nombre: input.nombre === undefined ? alumno.nombre : texto(input.nombre),
        modalidad: input.modalidad ?? alumno.modalidad,
        // El formulario ya no expone grupo: si el input no lo trae, se conserva el
        // grupo vigente de la ficha (dato demo/heredado, no se edita desde la UI).
        grupo: input.grupo === undefined ? alumno.grupo : texto(input.grupo),
        ancla: input.ancla ?? alumno.ancla,
        contacto: input.contacto === undefined ? alumno.contacto : texto(input.contacto),
        // Tarifa propia: si el formulario no la trae se conserva; null sigue null.
        tarifaUYU: input.tarifaUYU === undefined ? alumno.tarifaUYU ?? null : input.tarifaUYU,
        formaPago: input.formaPago ?? alumno.formaPago ?? 'mensual-fijo',
        // Alta y pago inicial se congelan: la edición no reescribe la identidad.
        fechaAlta: alumno.fechaAlta,
        pagado: alumno.pagado,
        // La UI ya no edita fotos: se conserva el dato histórico sin mostrarlo.
        foto: alumno.foto ?? '',
        // Apellido opcional: si el formulario no lo trae se conserva el vigente.
        apellido: input.apellido === undefined ? alumno.apellido ?? '' : texto(input.apellido),
    };
}
/**
 * Sanea una ficha leída del almacén: completa campos que falten en versiones
 * anteriores sin inventar identidad (ID/nombre/fecha de alta se respetan tal
 * cual). Las fichas Planas v5 originales (`tipo`) se migran a `modalidad`.
 */
export function normalizarFichaGuardada(dato) {
    if (!dato || typeof dato.id !== 'string' || !dato.id.trim())
        return null;
    // La agenda A/B usa IDs compactos (a0, b8…); las altas nuevas usan al-….
    // Cualquier otra identidad se descarta: no puede escaparse a data-* ni HTML.
    if (!esIdAlumno(dato.id) && !/^[abv]\d+$/.test(dato.id))
        return null;
    if (typeof dato.nombre !== 'string' || !dato.nombre.trim())
        return null;
    const modalidad = dato.modalidad === 'individual' || dato.tipo === 'individual' ? 'individual' : 'mensual';
    const id = dato.id;
    const color = typeof dato.color === 'string' && COLORES.includes(dato.color)
        ? dato.color
        : colorPorId(id);
    return {
        id,
        nombre: dato.nombre,
        modalidad,
        grupo: texto(dato.grupo).replace(/^Grupo\s+/, '') || 'Martes A',
        ancla: Number.isInteger(dato.ancla) && dato.ancla >= 1 && dato.ancla <= 31 ? dato.ancla : 21,
        fechaAlta: typeof dato.fechaAlta === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dato.fechaAlta) ? dato.fechaAlta : '2026-01-01',
        activo: dato.activo !== false,
        color,
        contacto: typeof dato.contacto === 'string' ? dato.contacto : '',
        pagado: typeof dato.pagado === 'boolean' ? dato.pagado : false,
        // Fichas v2 sin tarifa: null, nunca el precio de ejemplo de la demo.
        tarifaUYU: Number.isSafeInteger(dato.tarifaUYU) && dato.tarifaUYU > 0 ? dato.tarifaUYU : null,
        // Ficha guardada antes de este campo: su tarifa siempre era mensual.
        formaPago: dato.formaPago === 'por-clase' ? 'por-clase' : 'mensual-fijo',
        foto: esFotoValida(dato.foto) ? dato.foto : '',
        apellido: typeof dato.apellido === 'string' ? dato.apellido.trim() : '',
    };
}
/**
 * Compatibilidad al leer datos históricos (24-nov): valida un dataURL de
 * imagen chico sin migrar ni borrar datos. La UI vigente (26-nov) no muestra
 * ni edita fotos; el avatar generado se usa siempre.
 */
export const MAX_CARACTERES_FOTO = 150_000;
export function esFotoValida(valor) {
    if (typeof valor !== 'string' || valor.length === 0 || valor.length > MAX_CARACTERES_FOTO)
        return false;
    return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(valor);
}
/** Identificador de ID válido (para tests y defensa al leer). */
export function esIdAlumno(id) {
    return ID_RE.test(id);
}
/**
 * Proyecta las fichas a la fila que pinta la lista, con el vencimiento
 * derivado del repositorio (no se edita a mano). Días = vencimiento - hoy.
 * `undefined` en el mapa significa "sin deuda pendiente" (al día), distinto
 * de `0` ("vence hoy"): el primero se oculta con el chip «Al día», el segundo
 * debe verse y marcarse como vencimiento de hoy.
 */
export function construirVista(fichas, pagosPorAlumno, hoy, deudasIndividuales = new Map(), cobrosPorClase = new Map()) {
    const dia = Date.parse(`${hoy}T00:00:00Z`);
    return fichas.map((f) => {
        // La deuda la define la forma de pago: mensual fijo → vencimiento mensual;
        // por clase → cada clase dada sin pagar (nunca una mensualidad por reservar).
        const porClase = f.formaPago === 'por-clase';
        const dias = porClase ? undefined : pagosPorAlumno.get(f.id);
        const deuda = porClase ? cobrosPorClase.get(f.id) ?? deudasIndividuales.get(f.id) ?? null : null;
        const vence = dias ?? null;
        const estadoVence = deuda && deuda.clases > 0
            ? 'vencido'
            : dias === undefined
                ? 'aldia'
                : dias < 0 ? 'vencido' : dias === 0 ? 'hoy' : 'pendiente';
        return {
            ...f,
            ini: iniciales(nombreCompleto(f)),
            vence,
            estadoVence,
            deudaIndividual: deuda,
            tipo: f.modalidad,
            alta: Number.isNaN(dia) ? 0 : Math.max(0, Math.round((dia - Date.parse(`${f.fechaAlta}T00:00:00Z`)) / 86400000)),
        };
    });
}
/** Texto corto del estado de cobro para la fila de Alumnos. */
export function textoEstadoVence(f) {
    if (f.estadoVence === 'vencido' && f.vence === null)
        return 'deuda pendiente';
    switch (f.estadoVence) {
        case 'aldia': return 'al día';
        case 'hoy': return 'vence hoy';
        case 'vencido': return 'vencido';
        case 'pendiente': return `vence en ${f.vence} días`;
    }
}
/** Punto de color v5 coherente con el estado (verde al día, ambar pendiente, rosa vencido). */
export function puntoEstadoVence(f) {
    switch (f.estadoVence) {
        case 'aldia': return 'punto-verde';
        case 'vencido': return 'punto-rosa';
        case 'hoy':
        case 'pendiente': return 'punto-ambar';
    }
}
/** Aplica búsqueda acento-insensible, filtros y orden a la vista. Sin mutar. */
export function filtrarYOrdenar(filas, busqueda, filtros, orden) {
    const q = busqueda.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const out = filas.filter((a) => {
        // Busca por nombre completo o por apellido por separado (los datos viejos
        // guardan todo en `nombre`, así que ya cubre ambos casos).
        if (q && !norm(nombreCompleto(a)).includes(q))
            return false;
        // Modalidad se combina con OR: si se eligieron ambas, se muestran todos.
        // El resto de los filtros (aldia, búsqueda) sigue combinándose con AND.
        const modalidades = new Set(['mensual', 'individual'].filter((m) => filtros.has(m)));
        if (modalidades.size > 0 && !modalidades.has(a.modalidad))
            return false;
        if (filtros.has('aldia') && a.estadoVence !== 'aldia')
            return false;
        return true;
    });
    const cmp = {
        az: (a, b) => a.nombre.localeCompare(b.nombre),
        za: (a, b) => b.nombre.localeCompare(a.nombre),
        recientes: (a, b) => b.alta - a.alta,
        // Vencimientos ascendente (vencidos primero) y su inverso. En ambos,
        // "al día" (vence = null) va primero: Infinity en ascendente no lo cambia
        // (queda al final), y +Infinity en descendente lo pone al tope, que es lo
        // que pide el chip "Al día primero".
        vence: (a, b) => (a.vence ?? Infinity) - (b.vence ?? Infinity),
        'vence-inverso': (a, b) => (b.vence ?? Infinity) - (a.vence ?? Infinity),
    };
    return orden === 'ninguno' ? out : [...out].sort(cmp[orden]);
}
