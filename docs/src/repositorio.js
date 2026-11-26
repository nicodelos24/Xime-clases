/**
 * Persistencia local v5 (pre-BD): un único repositorio de clases y pagos
 * sobre un almacén de texto (`localStorage` en el navegador, memoria en los
 * tests).
 *
 * Contrato para Fase 4 (BD): la UI solo habla con `RepositorioClases`; los
 * comandos siguen siendo los puros de `clases.ts`. Cuando exista API + base
 * de datos se cambia el adaptador (`Almacen`) y nada más.
 *
 * Reglas:
 *  - Nada guardado → se siembra la demo anclada al día actual (nunca fechas
 *    fijas: una demo vieja queda toda "dada" y la vista Hoy se vacía).
 *  - Datos corruptos o de otra versión → se vuelve a sembrar; la app abre.
 *  - Cada comando persiste antes de devolver, así un refresh conserva
 *    cancelaciones, reversiones, reprogramaciones y el estado por hora.
 *  - Nunca se borra una clase: el historial de eventos queda en la clase.
 */
import { cancelarClase, crearClase, deshacerCancelacion, deshacerMarcada, marcarDada, reconciliar, registrarMensajeEnviado, reprogramarClase, } from './clases.js?v=202611262130';
import { hoyLocal } from './reloj.js?v=202611262130';
import { anularPago as anularPagoDominio, corregirFechaPago as corregirFechaPagoDominio, normalizarPagosGuardados, registrarPago as registrarPagoDominio, } from './cobros.js?v=202611262130';
import { crearAlumno, editarAlumno, esFotoValida, esIdAlumno, normalizarFichaGuardada, } from './alumnos.js?v=202611262130';
import { conExcepcion, crearClaseSuelta, crearRutina, generarOcurrencias, generarOcurrenciasEnRango, } from './agendar.js?v=202611262130';
/**
 * Versión del formato guardado. v2 agregó `alumnos` (Pieza C); las rutinas
 * semanales (20/11) se guardan como campo ADITIVO `rutinas` SIN subir la
 * versión: el build v2 anterior, que sigue servido en pestañas abiertas,
 * acepta `version: 2` y conserva clases/pagos/alumnos. Si escribiéramos
 * `version: 3`, ese v2 lo trataría como desconocido y RESEMBRARÍA la demo,
 * borrando los datos de la clienta. Por eso el estado escrito es v2 con
 * `rutinas` extra, y las rutinas además se respaldan en `CLAVE_RUTINAS`
 * para recuperarlas si una pestaña v2 re-graba y las omite.
 */
export const VERSION_ESTADO = 2;
/** Versiones que el lector acepta (incluye v3 por si existediera un estado así). */
const VERSIONES_LEIBLES = new Set([1, 2, 3]);
/** Clave única de `localStorage` (por origen: puerto incluido). */
export const CLAVE_ESTADO = 'xime.v5.estado';
/** Respaldo separado de las plantillas de rutina, a prueba de pestañas v2. */
export const CLAVE_RUTINAS = 'xime.v5.rutinas';
/** Almacén en memoria (tests, o respaldo si `localStorage` no está). */
export function almacenMemoria(inicial = null) {
    let valor = inicial;
    let rutinas = null;
    return {
        leer: () => valor,
        escribir: (texto) => { valor = texto; },
        leerRutinas: () => rutinas,
        escribirRutinas: (texto) => { rutinas = texto; },
    };
}
/**
 * `localStorage` del navegador, con respaldo en memoria si no existe o si
 * el navegador lo bloquea (modo privado, cuota llena): la app nunca rompe
 * por persistencia.
 */
export function almacenLocalStorage(ventana = globalThis) {
    let ultimo = null;
    let soloMemoria = false;
    return {
        leer: () => {
            if (!soloMemoria) {
                try {
                    ultimo = ventana.localStorage?.getItem(CLAVE_ESTADO) ?? null;
                }
                catch {
                    soloMemoria = true;
                }
            }
            return ultimo;
        },
        escribir: (texto, requierePersistencia = false) => {
            if (!soloMemoria) {
                try {
                    if (!ventana.localStorage)
                        throw new Error('localStorage no disponible');
                    ventana.localStorage.setItem(CLAVE_ESTADO, texto);
                    ultimo = texto;
                    return;
                }
                catch {
                    if (!requierePersistencia)
                        soloMemoria = true;
                }
            }
            if (requierePersistencia)
                throw new Error('No se pudo guardar en este navegador. No se aplicaron cambios.');
            ultimo = texto;
        },
        leerRutinas: () => {
            if (soloMemoria)
                return null;
            try {
                return ventana.localStorage?.getItem(CLAVE_RUTINAS) ?? null;
            }
            catch {
                return null;
            }
        },
        escribirRutinas: (texto, requierePersistencia = false) => {
            if (soloMemoria) {
                if (requierePersistencia)
                    throw new Error('No se pudo guardar en este navegador. No se aplicaron cambios.');
                return;
            }
            try {
                if (!ventana.localStorage)
                    throw new Error('localStorage no disponible');
                ventana.localStorage.setItem(CLAVE_RUTINAS, texto);
            }
            catch {
                if (requierePersistencia)
                    throw new Error('No se pudo guardar el respaldo. No se aplicaron cambios.');
            }
        },
    };
}
/**
 * Sanea lo leído del almacén: completa campos que falten (p. ej. `eventos`
 * de datos guardados por una versión anterior) sin inventar estado.
 */
/** Sanea una rutina guardada: completa excepciones y valida lo esencial. */
function normalizarRutina(r) {
    if (!r || typeof r.id !== 'string' || !/^rut-[A-Za-z0-9-]+$/.test(r.id)
        || typeof r.nombre !== 'string'
        || !Array.isArray(r.dias) || typeof r.desde !== 'string' || typeof r.hora !== 'string')
        return null;
    return {
        ...r,
        dias: r.dias,
        duracionMin: r.duracionMin ?? 60,
        excepciones: r.excepciones && typeof r.excepciones === 'object' ? r.excepciones : {},
    };
}
/** Sanea una clase guardada; un ID ajeno al dominio no se entrega a los sinks. */
function normalizarClase(dato) {
    if (!dato || typeof dato !== 'object' || Array.isArray(dato))
        return null;
    const c = dato;
    if (typeof c.id !== 'string')
        return null;
    if (!esIdAlumno(c.id) && !/^(?:[abv]\d+|c-[A-Za-z0-9-]+|suelta-[A-Za-z0-9-]+|rut-[A-Za-z0-9-]+@\d{4}-\d{2}-\d{2}|c\d+)$/.test(c.id))
        return null;
    return {
        ...c,
        alumnos: Array.isArray(c.alumnos) ? c.alumnos : [],
        marcadaEn: c.marcadaEn ?? null,
        cancelacion: c.cancelacion ?? null,
        eventos: Array.isArray(c.eventos) ? c.eventos : [],
    };
}
/** Repositorio único: la UI lee y manda comandos acá, nunca al estado suelto. */
export class RepositorioClases {
    estado = null;
    almacen;
    reloj;
    sembrar;
    sembrarAlumnos;
    constructor(almacen, reloj, sembrar = () => [], sembrarAlumnos = () => []) {
        this.almacen = almacen;
        this.reloj = reloj;
        this.sembrar = sembrar;
        this.sembrarAlumnos = sembrarAlumnos;
    }
    /** Clases actuales; la UI las usa solo para lectura. */
    listar() {
        return this.cargar().clases;
    }
    listarPagos() {
        return this.cargar().pagos;
    }
    /**
     * Registra un pago con FECHA EXPLÍCITA elegida en el formulario (cuándo lo
     * hizo/renovó la alumna). Sigue vinculado al alumno por ID estable, nunca
     * por nombre, y la fecha se valida en el dominio antes de guardar.
     */
    registrarPago(nuevo) {
        const fecha = nuevo.fecha ?? hoyLocal(this.reloj.ahora());
        this.actualizarPagos((pagos) => registrarPagoDominio(pagos, { ...nuevo, fecha }));
    }
    anularPago(id, motivo, quien) {
        const fecha = hoyLocal(this.reloj.ahora());
        this.actualizarPagos((pagos) => anularPagoDominio(pagos, id, { fecha, motivo, quien }));
    }
    corregirFechaPago(id, fechaNueva, motivo, quien) {
        const hoy = hoyLocal(this.reloj.ahora());
        this.actualizarPagos((pagos) => corregirFechaPagoDominio(pagos, id, fechaNueva, motivo, quien, hoy));
    }
    actualizarPagos(transformar) {
        const estado = this.cargar();
        const nuevo = { ...estado, pagos: transformar(estado.pagos) };
        this.persistir(nuevo, true);
        this.estado = nuevo;
    }
    /* ------------------------------------------------------- fichas (Pieza C) */
    listarAlumnos() {
        return this.cargar().alumnos;
    }
    crearAlumno(input) {
        const estado = this.cargar();
        const fechaAlta = hoyLocal(this.reloj.ahora());
        const ficha = crearAlumno(input, fechaAlta, (id) => estado.alumnos.some((a) => a.id === id));
        const nuevo = { ...estado, alumnos: [...estado.alumnos, ficha] };
        this.persistir(nuevo, true);
        this.estado = nuevo;
        return ficha;
    }
    editarAlumno(id, input) {
        const estado = this.cargar();
        const original = estado.alumnos.find((a) => a.id === id);
        if (!original)
            throw new Error('No se encontró la ficha del alumno');
        const editada = editarAlumno(original, input);
        const nuevo = { ...estado, alumnos: estado.alumnos.map((a) => (a.id === id ? editada : a)) };
        this.persistir(nuevo, true);
        this.estado = nuevo;
        return editada;
    }
    registrarPagoConTarifa(alumnoId, tarifaUYU, nuevo) {
        const fecha = nuevo.fecha ?? hoyLocal(this.reloj.ahora());
        const estado = this.cargar();
        const original = estado.alumnos.find((a) => a.id === alumnoId);
        if (!original)
            throw new Error('No se encontró la ficha del alumno');
        const alumnos = estado.alumnos.map((a) => (a.id === alumnoId ? editarAlumno(a, { tarifaUYU }) : a));
        const pagos = registrarPagoDominio(estado.pagos, { ...nuevo, alumnoId, montoUYU: tarifaUYU, fecha });
        // Una sola escritura: si el pago es inválido, la tarifa tampoco se guarda.
        this.persistir({ ...estado, alumnos, pagos }, true);
        this.estado = { ...estado, alumnos, pagos };
    }
    /** Varias escrituras en memoria; no usar para flujos que deban ser atómicos. */
    transaccion(operacion) {
        const anterior = this.cargar();
        try {
            const resultado = operacion();
            const actual = this.cargar();
            if (actual !== anterior)
                this.persistir(actual);
            return resultado;
        }
        catch (error) {
            this.estado = anterior;
            throw error;
        }
    }
    /**
     * Compatibilidad con datos históricos de foto (24-nov). La UI vigente
     * (26-nov) no llama a este método: las fotos guardadas quedan intactas,
     * fuera de la vista, y no se pueden subir/cambiar/quitar desde la ficha.
     */
    asignarFotoAlumno(id, foto) {
        const estado = this.cargar();
        const ficha = estado.alumnos.find((a) => a.id === id);
        if (!ficha)
            throw new Error('No se encontró la ficha del alumno');
        const fotoLimpia = esFotoValida(foto) ? foto : '';
        const actualizada = { ...ficha, foto: fotoLimpia };
        const nuevo = { ...estado, alumnos: estado.alumnos.map((a) => (a.id === id ? actualizada : a)) };
        this.persistir(nuevo, true);
        this.estado = nuevo;
        return actualizada;
    }
    /** Crea una clase nueva y la persiste. */
    crear(spec) {
        const clase = crearClase(spec);
        this.actualizar((clases) => {
            if (clases.some((c) => c.id === clase.id))
                throw new Error(`Ya existe la clase ${clase.id}`);
            return [...clases, clase];
        });
        return clase;
    }
    /** Alta de clase suelta en una fecha concreta. Persiste antes de devolver. */
    crearSuelta(spec) {
        const clase = crearClaseSuelta(spec);
        this.actualizar((clases) => {
            if (clases.some((c) => c.id === clase.id))
                throw new Error(`Ya existe la clase ${clase.id}`);
            return [...clases, clase];
        }, true);
        return clase;
    }
    /** Alta de rutina semanal: guarda la plantilla y materializa sus ocurrencias. */
    crearRutina(spec) {
        const rutina = crearRutina(spec);
        const estado = this.cargar();
        if (estado.rutinas.some((r) => r.id === rutina.id))
            throw new Error(`Ya existe la rutina ${rutina.id}`);
        const nuevas = generarOcurrencias(rutina, estado.clases, this.reloj.ahora());
        const nuevo = {
            ...estado,
            rutinas: [...estado.rutinas, rutina],
            clases: [...estado.clases, ...nuevas],
        };
        // Persistir ANTES de devolver: si falla el guardado, no se anuncia éxito.
        this.persistir(nuevo, true);
        this.estado = nuevo;
        return rutina;
    }
    listarRutinas() {
        return this.cargar().rutinas;
    }
    /**
     * Baja de una rutina semanal (punto 1): se borra la plantilla y se cancelan
     * de una sola vez sus ocurrencias FUTURAS que siguen «Por dar». Las clases
     * dadas, canceladas o ya movidas no se tocan: son historial, y una ocurrencia
     * movida vive en otra fecha (por eso lleva excepción «movida»).
     * Todo en UNA escritura: si falla el disco no se anuncia éxito.
     */
    eliminarRutina(id, op) {
        const estado = this.cargar();
        const rutina = estado.rutinas.find((r) => r.id === id);
        if (!rutina)
            throw new Error(`No existe la rutina ${id}`);
        const hoy = hoyLocal(op.ahora);
        let canceladas = 0;
        const clases = estado.clases.map((c) => {
            const esFuturaPorDar = c.rutinaId === id
                && c.estado === 'programada'
                && c.fecha >= hoy
                && rutina.excepciones[c.fechaRutina ?? c.fecha] === undefined;
            if (!esFuturaPorDar)
                return c;
            canceladas += 1;
            return cancelarClase(c, { ...op, motivo: `Rutina «${rutina.nombre}» dada de baja` });
        });
        const nuevo = {
            ...estado,
            rutinas: estado.rutinas.filter((r) => r.id !== id),
            clases,
        };
        this.persistir(nuevo, true);
        this.estado = nuevo;
        return { rutina, canceladas };
    }
    /**
     * Asegura que existan las ocurrencias de todas las rutinas hasta la fecha
     * que se está mirando (mes/semana lejana incluida). No toca ninguna marca:
     * `reconciliar` sigue siendo el ÚNICO lugar que cambia Por dar → Dada, y
     * siempre con el reloj real, nunca con la fecha consultada.
     */
    materializarHasta(fecha) {
        const estado = this.cargar();
        let clases = estado.clases;
        let cambio = false;
        for (const rutina of estado.rutinas) {
            // Desde el inicio de la plantilla hasta la fecha consultada: se crean
            // TODAS las ocurrencias intermedias que falten (no solo ese día).
            const nuevas = generarOcurrenciasEnRango(rutina, clases, rutina.desde, fecha);
            if (nuevas.length) {
                clases = [...clases, ...nuevas];
                cambio = true;
            }
        }
        if (cambio) {
            const nuevo = { ...estado, clases };
            this.persistir(nuevo);
            this.estado = nuevo;
        }
        return clases;
    }
    /**
     * Al abrir/volver (y en el cron): (1) genera ocurrencias nuevas de las
     * rutinas para el horizonte móvil. NO cambia el estado de ninguna clase:
     * el auto-marcado por reloj está descartado (decisión de Nico, 21/11) y
     * «Dada» se marca a mano. Solo guarda si aparecieron ocurrencias.
     */
    reconciliar(ahora = this.reloj.ahora()) {
        const estado = this.cargar();
        const conOcurrencias = this.materializar(estado, ahora);
        const despues = conOcurrencias.clases;
        const cambioOcurrencias = despues.length !== estado.clases.length
            || conOcurrencias.clases.some((c, i) => c !== estado.clases[i]);
        if (!cambioOcurrencias)
            return despues;
        const nuevo = { ...conOcurrencias, clases: despues };
        this.persistir(nuevo);
        this.estado = nuevo;
        return despues;
    }
    /** Genera las ocurrencias que falten de todas las rutinas (sin duplicar). */
    materializar(estado, ahora) {
        let clases = estado.clases;
        let cambio = false;
        for (const rutina of estado.rutinas) {
            const nuevas = generarOcurrencias(rutina, clases, ahora);
            if (nuevas.length) {
                clases = [...clases, ...nuevas];
                cambio = true;
            }
        }
        return cambio ? { ...estado, clases } : estado;
    }
    marcarDada(id, op) {
        return this.reemplazar(marcarDada(this.una(id), op));
    }
    deshacerMarcada(id, op) {
        return this.reemplazar(deshacerMarcada(this.una(id), op));
    }
    cancelar(id, op) {
        return this.cambiarClaseYExcepcion(id, cancelarClase, op, 'cancelada');
    }
    revertir(id, op) {
        // Revertir devuelve la clase a su día de origen: se quita la excepción.
        return this.cambiarClaseYExcepcion(id, deshacerCancelacion, op, null);
    }
    reprogramar(id, fechaNueva, op) {
        return this.cambiarClaseYExcepcion(id, (c) => reprogramarClase(c, fechaNueva, op), op, 'movida');
    }
    /**
     * Aplica un comando a UNA clase y, si es ocurrencia de una rutina, marca (o
     * quita) su excepción de origen. Estado + auditoría + excepción se escriben
     * en UNA SOLA llamada obligatoria: si falla el disco, no avanza nada en
     * memoria, no queda halfway ni se anuncia éxito.
     */
    cambiarClaseYExcepcion(id, comando, op, motivo) {
        const estado = this.cargar();
        const clase = estado.clases.find((x) => x.id === id);
        if (!clase)
            throw new Error(`No existe la clase ${id}`);
        const cambiada = comando(clase, op);
        const rutinas = this.conExcepcionEn(estado.rutinas, clase, motivo);
        const clases = estado.clases.map((x) => (x.id === id ? cambiada : x));
        const nuevo = { ...estado, clases, rutinas };
        this.persistir(nuevo, true);
        this.estado = nuevo;
        return cambiada;
    }
    /** Calcula el cambio de excepción sobre el array de rutinas (puro). */
    conExcepcionEn(rutinas, clase, motivo) {
        if (!clase.rutinaId || !clase.fechaRutina)
            return rutinas;
        return rutinas.map((r) => {
            if (r.id !== clase.rutinaId)
                return r;
            if (motivo === null) {
                if (!r.excepciones[clase.fechaRutina])
                    return r;
                const excepciones = { ...r.excepciones };
                delete excepciones[clase.fechaRutina];
                return { ...r, excepciones };
            }
            if (r.excepciones[clase.fechaRutina])
                return r;
            return conExcepcion(r, clase.fechaRutina, motivo);
        });
    }
    registrarMensajeEnviado(id, canal) {
        return this.reemplazar(registrarMensajeEnviado(this.una(id), canal));
    }
    una(id) {
        const c = this.cargar().clases.find((x) => x.id === id);
        if (!c)
            throw new Error(`No existe la clase ${id}`);
        return c;
    }
    reemplazar(clase) {
        this.actualizar((clases) => clases.map((x) => (x.id === clase.id ? clase : x)));
        return clase;
    }
    actualizar(transformar, requierePersistencia = false) {
        const estado = this.cargar();
        const nuevo = { ...estado, clases: transformar(estado.clases) };
        // Persistir ANTES de asignar `this.estado`: si falla, el estado en memoria
        // no avanza y la UI no debe anunciar éxito.
        this.persistir(nuevo, requierePersistencia);
        this.estado = nuevo;
    }
    cargar() {
        // Una pestaña no debe sobreescribir pagos ya guardados por otra.
        return this.estado = this.leer() ?? this.estado ?? this.sembrarEstado();
    }
    leer() {
        const texto = this.almacen.leer();
        if (!texto)
            return null;
        try {
            const dato = JSON.parse(texto);
            // Aceptamos v1, v2 y v3: NUNCA resembras sobre clases guardadas. Así una
            // pestaña de otro build no puede borrar los datos de la clienta.
            const version = dato?.version;
            if (!dato || !VERSIONES_LEIBLES.has(version) || !Array.isArray(dato.clases))
                return null;
            const clases = dato.clases
                .map(normalizarClase)
                .filter((c) => c !== null);
            const pagos = normalizarPagosGuardados(dato.pagos);
            const alumnos = Array.isArray(dato.alumnos)
                ? dato.alumnos.map(normalizarFichaGuardada).filter((a) => a !== null)
                : this.sembrarAlumnos(hoyLocal(this.reloj.ahora()));
            const rutinasGuardadas = Array.isArray(dato.rutinas)
                ? dato.rutinas.map(normalizarRutina).filter((r) => r !== null)
                : [];
            // Si un build v2 re-grabó y quitó `rutinas`, las recuperamos del respaldo.
            const rutinas = rutinasGuardadas.length ? rutinasGuardadas : this.leerRutinasRespaldadas();
            const estado = {
                version: VERSION_ESTADO,
                guardadoEn: typeof dato.guardadoEn === 'string' ? dato.guardadoEn : new Date(this.reloj.ahora()).toISOString(),
                clases,
                pagos,
                alumnos,
                rutinas,
            };
            // Si venía de una versión anterior (o faltaban campos), persistimos la migrada.
            if (version !== VERSION_ESTADO || !Array.isArray(dato.alumnos) || !Array.isArray(dato.rutinas))
                this.persistir(estado, true);
            return estado;
        }
        catch {
            return null;
        }
    }
    sembrarEstado() {
        const ahora = this.reloj.ahora();
        const estado = {
            version: VERSION_ESTADO,
            guardadoEn: new Date(ahora).toISOString(),
            clases: reconciliar(this.sembrar(ahora)),
            pagos: [],
            alumnos: this.sembrarAlumnos(hoyLocal(ahora)),
            rutinas: [],
        };
        // La primera siembra también exige persistencia: si falla el respaldo,
        // no puede dejar un principal a medias ni entregar un éxito en memoria.
        this.persistir(estado, true);
        return estado;
    }
    /** Lee las rutinas del respaldo (clave aparte que el build v2 no toca). */
    leerRutinasRespaldadas() {
        try {
            const texto = this.almacen.leerRutinas?.();
            if (!texto)
                return [];
            const dato = JSON.parse(texto);
            return Array.isArray(dato)
                ? dato.map(normalizarRutina).filter((r) => r !== null)
                : [];
        }
        catch {
            return [];
        }
    }
    persistir(estado, requierePersistencia = false) {
        const principal = JSON.stringify({
            ...estado,
            guardadoEn: new Date(this.reloj.ahora()).toISOString(),
        });
        // El respaldo se escribe primero: si falla, el principal todavía no cambió.
        // Si el principal falla después, se intenta restaurar el respaldo previo.
        const respaldo = this.almacen.escribirRutinas ? JSON.stringify(estado.rutinas) : null;
        const respaldoAnterior = respaldo === null ? null : this.almacen.leerRutinas?.() ?? null;
        if (respaldo !== null)
            this.almacen.escribirRutinas(respaldo, requierePersistencia);
        try {
            this.almacen.escribir(principal, requierePersistencia);
        }
        catch (error) {
            // La compensación usa persistencia obligatoria: en modo privado/cuota
            // llena no puede afirmar que restauró si en realidad solo fue memoria.
            if (respaldo !== null) {
                try {
                    this.almacen.escribirRutinas(respaldoAnterior ?? '', true);
                }
                catch { /* se conserva el error original */ }
            }
            throw error;
        }
    }
}
