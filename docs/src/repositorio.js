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
import { cancelarClase, crearClase, deshacerCancelacion, reconciliar, registrarMensajeEnviado, reprogramarClase, } from './clases.js';
import { hoyLocal } from './reloj.js';
import { anularPago, registrarPago } from './cobros.js';
/** Versión del formato guardado. Subirla obliga a migrar o resembrar. */
export const VERSION_ESTADO = 1;
/** Clave única de `localStorage` (por origen: puerto incluido). */
export const CLAVE_ESTADO = 'xime.v5.estado';
/** Almacén en memoria (tests, o respaldo si `localStorage` no está). */
export function almacenMemoria(inicial = null) {
    let valor = inicial;
    return {
        leer: () => valor,
        escribir: (texto) => { valor = texto; },
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
                throw new Error('No se pudo guardar el pago en este navegador. No se aplicaron cambios.');
            ultimo = texto;
        },
    };
}
/**
 * Sanea lo leído del almacén: completa campos que falten (p. ej. `eventos`
 * de datos guardados por una versión anterior) sin inventar estado.
 */
function normalizarClase(c) {
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
    constructor(almacen, reloj, sembrar = () => []) {
        this.almacen = almacen;
        this.reloj = reloj;
        this.sembrar = sembrar;
    }
    /** Clases actuales; la UI las usa solo para lectura. */
    listar() {
        return this.cargar().clases;
    }
    listarPagos() {
        return this.cargar().pagos;
    }
    registrarPago(nuevo) {
        const fecha = hoyLocal(this.reloj.ahora());
        this.actualizarPagos((pagos) => registrarPago(pagos, { ...nuevo, fecha }));
    }
    anularPago(id, motivo, quien) {
        const fecha = hoyLocal(this.reloj.ahora());
        this.actualizarPagos((pagos) => anularPago(pagos, id, { fecha, motivo, quien }));
    }
    actualizarPagos(transformar) {
        const estado = this.cargar();
        const nuevo = { ...estado, pagos: transformar(estado.pagos) };
        this.persistir(nuevo, true);
        this.estado = nuevo;
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
    /**
     * Auto-marcado por hora (al abrir la app y en el cron local). No toca
     * clases canceladas ni dadas y solo guarda si algo cambió.
     */
    reconciliar(ahora = this.reloj.ahora()) {
        const antes = this.cargar().clases;
        const despues = reconciliar(antes, ahora);
        if (despues.every((c, i) => c === antes[i]))
            return despues;
        this.actualizar(() => despues);
        return despues;
    }
    cancelar(id, op) {
        return this.reemplazar(cancelarClase(this.una(id), op));
    }
    revertir(id, op) {
        return this.reemplazar(deshacerCancelacion(this.una(id), op));
    }
    reprogramar(id, fechaNueva, op) {
        return this.reemplazar(reprogramarClase(this.una(id), fechaNueva, op));
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
    actualizar(transformar) {
        const estado = this.cargar();
        const nuevo = { ...estado, clases: transformar(estado.clases) };
        this.persistir(nuevo);
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
            if (!dato || dato.version !== VERSION_ESTADO || !Array.isArray(dato.clases))
                return null;
            return {
                version: VERSION_ESTADO,
                guardadoEn: typeof dato.guardadoEn === 'string' ? dato.guardadoEn : new Date(this.reloj.ahora()).toISOString(),
                clases: dato.clases.map(normalizarClase),
                pagos: Array.isArray(dato.pagos) ? dato.pagos : [],
            };
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
            clases: reconciliar(this.sembrar(ahora), ahora),
            pagos: [],
        };
        this.persistir(estado);
        return estado;
    }
    persistir(estado, requierePersistencia = false) {
        this.almacen.escribir(JSON.stringify({
            ...estado,
            guardadoEn: new Date(this.reloj.ahora()).toISOString(),
        }), requierePersistencia);
    }
}
