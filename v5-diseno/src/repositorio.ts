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
import {
  cancelarClase, crearClase, deshacerCancelacion, deshacerMarcada, marcarDada, reconciliar,
  registrarMensajeEnviado, reprogramarClase,
  type OpcionMarcar,
  type CanalMensaje, type Clase, type ClaseNueva, type OpcionCancelar,
  type OpcionReprogramar,
} from './clases.ts';
import { hoyLocal, type InstanteMs, type Reloj } from './reloj.ts';
import { anularPago, corregirFechaPago, registrarPago, type Pago, type PagoNuevo } from './cobros.ts';
import {
  crearAlumno, editarAlumno, normalizarFichaGuardada,
  type AlumnoFicha, type AlumnoFichaInput,
} from './alumnos.ts';
import {
  conExcepcion, crearClaseSuelta, crearRutina, generarOcurrencias, generarOcurrenciasEnRango,
  type ClaseSueltaNueva, type RutinaNueva, type RutinaSemanal,
} from './agendar.ts';
export type { Pago } from './cobros.ts';
export type { AlumnoFicha, AlumnoFichaInput } from './alumnos.ts';
export type { RutinaSemanal, RutinaNueva, ClaseSueltaNueva } from './agendar.ts';

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

/** Estado completo que se guarda. El formato de `pagos` ya existía en v1. */
export type EstadoClases = {
  version: number;
  /** ISO UTC del último guardado (diagnóstico). */
  guardadoEn: string;
  clases: Clase[];
  pagos: Pago[];
  /** Fichas de alumnos (v2). Las de la demo se siembran solas la 1.ª vez. */
  alumnos: AlumnoFicha[];
  /** Plantillas de rutinas semanales (v3). */
  rutinas: RutinaSemanal[];
};

/** Contrato mínimo del almacén: lo único que cambia en la Fase 4. */
export type Almacen = {
  leer(): string | null;
  escribir(texto: string, requierePersistencia?: boolean): void;
  /** Respaldo de rutinas en clave aparte (opcional para almacenes de test). */
  leerRutinas?(): string | null;
  escribirRutinas?(texto: string): void;
};

/** Almacén en memoria (tests, o respaldo si `localStorage` no está). */
export function almacenMemoria(inicial: string | null = null): Almacen {
  let valor = inicial;
  let rutinas: string | null = null;
  return {
    leer: () => valor,
    escribir: (texto) => { valor = texto; },
    leerRutinas: () => rutinas,
    escribirRutinas: (texto) => { rutinas = texto; },
  };
}

type VentanaConStorage = {
  localStorage?: {
    getItem(clave: string): string | null;
    setItem(clave: string, valor: string): void;
  } | null;
};

/**
 * `localStorage` del navegador, con respaldo en memoria si no existe o si
 * el navegador lo bloquea (modo privado, cuota llena): la app nunca rompe
 * por persistencia.
 */
export function almacenLocalStorage(
  ventana: VentanaConStorage = globalThis as unknown as VentanaConStorage,
): Almacen {
  let ultimo: string | null = null;
  let soloMemoria = false;
  return {
    leer: () => {
      if (!soloMemoria) {
        try {
          ultimo = ventana.localStorage?.getItem(CLAVE_ESTADO) ?? null;
        } catch {
          soloMemoria = true;
        }
      }
      return ultimo;
    },
    escribir: (texto, requierePersistencia = false) => {
      if (!soloMemoria) {
        try {
          if (!ventana.localStorage) throw new Error('localStorage no disponible');
          ventana.localStorage.setItem(CLAVE_ESTADO, texto);
          ultimo = texto;
          return;
        } catch {
          if (!requierePersistencia) soloMemoria = true;
        }
      }
      if (requierePersistencia) throw new Error('No se pudo guardar en este navegador. No se aplicaron cambios.');
      ultimo = texto;
    },
    leerRutinas: () => {
      if (soloMemoria) return null;
      try { return ventana.localStorage?.getItem(CLAVE_RUTINAS) ?? null; } catch { return null; }
    },
    escribirRutinas: (texto) => {
      if (soloMemoria) return;
      try { ventana.localStorage?.setItem(CLAVE_RUTINAS, texto); } catch { /* el estado principal ya está guardado */ }
    },
  };
}

export type SembrarClases = (ahora: InstanteMs) => Clase[];
export type SembrarAlumnos = (hoy: string) => AlumnoFicha[];

/**
 * Sanea lo leído del almacén: completa campos que falten (p. ej. `eventos`
 * de datos guardados por una versión anterior) sin inventar estado.
 */
function normalizarClase(c: Clase): Clase {
  return {
    ...c,
    alumnos: Array.isArray(c.alumnos) ? c.alumnos : [],
    marcadaEn: c.marcadaEn ?? null,
    cancelacion: c.cancelacion ?? null,
    eventos: Array.isArray(c.eventos) ? c.eventos : [],
  };
}

/** Sanea una rutina guardada: completa excepciones y valida lo esencial. */
function normalizarRutina(r: RutinaSemanal): RutinaSemanal | null {
  if (!r || typeof r.id !== 'string' || typeof r.nombre !== 'string'
    || !Array.isArray(r.dias) || typeof r.desde !== 'string' || typeof r.hora !== 'string') return null;
  return {
    ...r,
    dias: r.dias,
    duracionMin: r.duracionMin ?? 60,
    excepciones: r.excepciones && typeof r.excepciones === 'object' ? r.excepciones : {},
  };
}

/** Comandos y consultas que consume la UI, independientes del almacenamiento. */
export interface RepositorioDeClases {
  listar(): Clase[];
  crear(spec: ClaseNueva): Clase;
  /** Alta de clase suelta ( fecha exacta), persistida antes de devolver. */
  crearSuelta(spec: ClaseSueltaNueva): Clase;
  /** Alta de rutina semanal + materialización de sus ocurrencias. */
  crearRutina(spec: RutinaNueva): RutinaSemanal;
  listarRutinas(): readonly RutinaSemanal[];
  /** Materializa ocurrencias de un rango consultado SIN reconciliar por reloj. */
  materializarHasta(fecha: string): Clase[];
  reconciliar(ahora?: InstanteMs): Clase[];
  marcarDada(id: string, op: OpcionMarcar): Clase;
  deshacerMarcada(id: string, op: OpcionMarcar): Clase;
  cancelar(id: string, op: OpcionCancelar): Clase;
  revertir(id: string, op: OpcionCancelar): Clase;
  reprogramar(id: string, fechaNueva: string, op: OpcionReprogramar): Clase;
  registrarMensajeEnviado(id: string, canal: CanalMensaje): Clase;
  listarPagos(): readonly Pago[];
  registrarPago(nuevo: Omit<PagoNuevo, 'fecha'> & { fecha?: string }): void;
  anularPago(id: string, motivo: string, quien: string): void;
  corregirFechaPago(id: string, fechaNueva: string, motivo: string, quien: string): void;
  listarAlumnos(): readonly AlumnoFicha[];
  crearAlumno(input: AlumnoFichaInput): AlumnoFicha;
  editarAlumno(id: string, input: AlumnoFichaInput): AlumnoFicha;
}

/** Repositorio único: la UI lee y manda comandos acá, nunca al estado suelto. */
export class RepositorioClases implements RepositorioDeClases {
  private estado: EstadoClases | null = null;
  private readonly almacen: Almacen;
  private readonly reloj: Reloj;
  private readonly sembrar: SembrarClases;
  private readonly sembrarAlumnos: SembrarAlumnos;

  constructor(
    almacen: Almacen,
    reloj: Reloj,
    sembrar: SembrarClases = () => [],
    sembrarAlumnos: SembrarAlumnos = () => [],
  ) {
    this.almacen = almacen;
    this.reloj = reloj;
    this.sembrar = sembrar;
    this.sembrarAlumnos = sembrarAlumnos;
  }

  /** Clases actuales; la UI las usa solo para lectura. */
  listar(): Clase[] {
    return this.cargar().clases;
  }

  listarPagos(): readonly Pago[] {
    return this.cargar().pagos;
  }

  /**
   * Registra un pago con FECHA EXPLÍCITA elegida en el formulario (cuándo lo
   * hizo/renovó la alumna). Sigue vinculado al alumno por ID estable, nunca
   * por nombre, y la fecha se valida en el dominio antes de guardar.
   */
  registrarPago(nuevo: Omit<PagoNuevo, 'fecha'> & { fecha?: string }): void {
    const fecha = nuevo.fecha ?? hoyLocal(this.reloj.ahora());
    this.actualizarPagos((pagos) => registrarPago(pagos, { ...nuevo, fecha }));
  }

  anularPago(id: string, motivo: string, quien: string): void {
    const fecha = hoyLocal(this.reloj.ahora());
    this.actualizarPagos((pagos) => anularPago(pagos, id, { fecha, motivo, quien }));
  }

  corregirFechaPago(id: string, fechaNueva: string, motivo: string, quien: string): void {
    const hoy = hoyLocal(this.reloj.ahora());
    this.actualizarPagos((pagos) => corregirFechaPago(pagos, id, fechaNueva, motivo, quien, hoy));
  }

  private actualizarPagos(transformar: (pagos: Pago[]) => Pago[]): void {
    const estado = this.cargar();
    const nuevo = { ...estado, pagos: transformar(estado.pagos) };
    this.persistir(nuevo, true);
    this.estado = nuevo;
  }

  /* ------------------------------------------------------- fichas (Pieza C) */

  listarAlumnos(): readonly AlumnoFicha[] {
    return this.cargar().alumnos;
  }

  crearAlumno(input: AlumnoFichaInput): AlumnoFicha {
    const estado = this.cargar();
    const fechaAlta = hoyLocal(this.reloj.ahora());
    const ficha = crearAlumno(input, fechaAlta, (id) => estado.alumnos.some((a) => a.id === id));
    const nuevo = { ...estado, alumnos: [...estado.alumnos, ficha] };
    this.persistir(nuevo, true);
    this.estado = nuevo;
    return ficha;
  }

  editarAlumno(id: string, input: AlumnoFichaInput): AlumnoFicha {
    const estado = this.cargar();
    const original = estado.alumnos.find((a) => a.id === id);
    if (!original) throw new Error('No se encontró la ficha del alumno');
    const editada = editarAlumno(original, input);
    const nuevo = { ...estado, alumnos: estado.alumnos.map((a) => (a.id === id ? editada : a)) };
    this.persistir(nuevo, true);
    this.estado = nuevo;
    return editada;
  }

  /** Crea una clase nueva y la persiste. */
  crear(spec: ClaseNueva): Clase {
    const clase = crearClase(spec);
    this.actualizar((clases) => {
      if (clases.some((c) => c.id === clase.id)) throw new Error(`Ya existe la clase ${clase.id}`);
      return [...clases, clase];
    });
    return clase;
  }

  /** Alta de clase suelta en una fecha concreta. Persiste antes de devolver. */
  crearSuelta(spec: ClaseSueltaNueva): Clase {
    const clase = crearClaseSuelta(spec);
    this.actualizar((clases) => {
      if (clases.some((c) => c.id === clase.id)) throw new Error(`Ya existe la clase ${clase.id}`);
      return [...clases, clase];
    }, true);
    return clase;
  }

  /** Alta de rutina semanal: guarda la plantilla y materializa sus ocurrencias. */
  crearRutina(spec: RutinaNueva): RutinaSemanal {
    const rutina = crearRutina(spec);
    const estado = this.cargar();
    if (estado.rutinas.some((r) => r.id === rutina.id)) throw new Error(`Ya existe la rutina ${rutina.id}`);
    const nuevas = generarOcurrencias(rutina, estado.clases, this.reloj.ahora());
    const nuevo: EstadoClases = {
      ...estado,
      rutinas: [...estado.rutinas, rutina],
      clases: [...estado.clases, ...nuevas],
    };
    // Persistir ANTES de devolver: si falla el guardado, no se anuncia éxito.
    this.persistir(nuevo, true);
    this.estado = nuevo;
    return rutina;
  }

  listarRutinas(): readonly RutinaSemanal[] {
    return this.cargar().rutinas;
  }

  /**
   * Asegura que existan las ocurrencias de todas las rutinas hasta la fecha
   * que se está mirando (mes/semana lejana incluida). No toca ninguna marca:
   * `reconciliar` sigue siendo el ÚNICO lugar que cambia Por dar → Dada, y
   * siempre con el reloj real, nunca con la fecha consultada.
   */
  materializarHasta(fecha: string): Clase[] {
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
      const nuevo: EstadoClases = { ...estado, clases };
      this.persistir(nuevo);
      this.estado = nuevo;
    }
    return clases;
  }

  /**
   * Al abrir/volver (y en el cron): (1) genera ocurrencias nuevas de las
   * rutinas para el horizonte móvil y (2) auto-marca por fin de duración.
   * No toca canceladas, dadas ni historial; solo guarda si algo cambió.
   */
  reconciliar(ahora: InstanteMs = this.reloj.ahora()): Clase[] {
    const estado = this.cargar();
    const conOcurrencias = this.materializar(estado, ahora);
    const despues = reconciliar(conOcurrencias.clases, ahora);
    const cambioOcurrencias = despues.length !== estado.clases.length
      || conOcurrencias.clases.some((c, i) => c !== estado.clases[i]);
    const cambioMarcas = despues.some((c, i) => c !== conOcurrencias.clases[i]);
    if (!cambioOcurrencias && !cambioMarcas) return despues;
    const nuevo: EstadoClases = { ...conOcurrencias, clases: despues };
    this.persistir(nuevo);
    this.estado = nuevo;
    return despues;
  }

  /** Genera las ocurrencias que falten de todas las rutinas (sin duplicar). */
  private materializar(estado: EstadoClases, ahora: InstanteMs): EstadoClases {
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

  marcarDada(id: string, op: OpcionMarcar): Clase {
    return this.reemplazar(marcarDada(this.una(id), op));
  }

  deshacerMarcada(id: string, op: OpcionMarcar): Clase {
    return this.reemplazar(deshacerMarcada(this.una(id), op));
  }

  cancelar(id: string, op: OpcionCancelar): Clase {
    return this.cambiarClaseYExcepcion(id, cancelarClase, op, 'cancelada');
  }

  revertir(id: string, op: OpcionCancelar): Clase {
    // Revertir devuelve la clase a su día de origen: se quita la excepción.
    return this.cambiarClaseYExcepcion(id, deshacerCancelacion, op, null);
  }

  reprogramar(id: string, fechaNueva: string, op: OpcionReprogramar): Clase {
    return this.cambiarClaseYExcepcion(
      id, (c) => reprogramarClase(c, fechaNueva, op), op, 'movida',
    );
  }

  /**
   * Aplica un comando a UNA clase y, si es ocurrencia de una rutina, marca (o
   * quita) su excepción de origen. Estado + auditoría + excepción se escriben
   * en UNA SOLA llamada obligatoria: si falla el disco, no avanza nada en
   * memoria, no queda halfway ni se anuncia éxito.
   */
  private cambiarClaseYExcepcion<T>(
    id: string,
    comando: (clase: Clase, op: T) => Clase,
    op: T,
    motivo: 'cancelada' | 'movida' | null,
  ): Clase {
    const estado = this.cargar();
    const clase = estado.clases.find((x) => x.id === id);
    if (!clase) throw new Error(`No existe la clase ${id}`);
    const cambiada = comando(clase, op);
    const rutinas = this.conExcepcionEn(estado.rutinas, clase, motivo);
    const clases = estado.clases.map((x) => (x.id === id ? cambiada : x));
    const nuevo: EstadoClases = { ...estado, clases, rutinas };
    this.persistir(nuevo, true);
    this.estado = nuevo;
    return cambiada;
  }

  /** Calcula el cambio de excepción sobre el array de rutinas (puro). */
  private conExcepcionEn(
    rutinas: RutinaSemanal[],
    clase: Clase,
    motivo: 'cancelada' | 'movida' | null,
  ): RutinaSemanal[] {
    if (!clase.rutinaId || !clase.fechaRutina) return rutinas;
    return rutinas.map((r) => {
      if (r.id !== clase.rutinaId) return r;
      if (motivo === null) {
        if (!r.excepciones[clase.fechaRutina as string]) return r;
        const excepciones = { ...r.excepciones };
        delete excepciones[clase.fechaRutina as string];
        return { ...r, excepciones };
      }
      if (r.excepciones[clase.fechaRutina as string]) return r;
      return conExcepcion(r, clase.fechaRutina as string, motivo);
    });
  }

  registrarMensajeEnviado(id: string, canal: CanalMensaje): Clase {
    return this.reemplazar(registrarMensajeEnviado(this.una(id), canal));
  }

  private una(id: string): Clase {
    const c = this.cargar().clases.find((x) => x.id === id);
    if (!c) throw new Error(`No existe la clase ${id}`);
    return c;
  }

  private reemplazar(clase: Clase): Clase {
    this.actualizar((clases) => clases.map((x) => (x.id === clase.id ? clase : x)));
    return clase;
  }

  private actualizar(transformar: (clases: Clase[]) => Clase[], requierePersistencia = false): void {
    const estado = this.cargar();
    const nuevo: EstadoClases = { ...estado, clases: transformar(estado.clases) };
    // Persistir ANTES de asignar `this.estado`: si falla, el estado en memoria
    // no avanza y la UI no debe anunciar éxito.
    this.persistir(nuevo, requierePersistencia);
    this.estado = nuevo;
  }

  private cargar(): EstadoClases {
    // Una pestaña no debe sobreescribir pagos ya guardados por otra.
    return this.estado = this.leer() ?? this.estado ?? this.sembrarEstado();
  }

  private leer(): EstadoClases | null {
    const texto = this.almacen.leer();
    if (!texto) return null;
    try {
      const dato = JSON.parse(texto) as Partial<EstadoClases> | null;
      // Aceptamos v1, v2 y v3: NUNCA resembras sobre clases guardadas. Así una
      // pestaña de otro build no puede borrar los datos de la clienta.
      const version = dato?.version;
      if (!dato || !VERSIONES_LEIBLES.has(version as number) || !Array.isArray(dato.clases)) return null;
      const clases = dato.clases.map(normalizarClase);
      const pagos = Array.isArray(dato.pagos) ? dato.pagos : [];
      const alumnos = Array.isArray(dato.alumnos)
        ? dato.alumnos.map(normalizarFichaGuardada).filter((a): a is AlumnoFicha => a !== null)
        : this.sembrarAlumnos(hoyLocal(this.reloj.ahora()));
      const rutinasGuardadas = Array.isArray(dato.rutinas)
        ? dato.rutinas.map(normalizarRutina).filter((r): r is RutinaSemanal => r !== null)
        : [];
      // Si un build v2 re-grabó y quitó `rutinas`, las recuperamos del respaldo.
      const rutinas = rutinasGuardadas.length ? rutinasGuardadas : this.leerRutinasRespaldadas();
      const estado: EstadoClases = {
        version: VERSION_ESTADO,
        guardadoEn: typeof dato.guardadoEn === 'string' ? dato.guardadoEn : new Date(this.reloj.ahora()).toISOString(),
        clases,
        pagos,
        alumnos,
        rutinas,
      };
      // Si venía de una versión anterior (o faltaban campos), persistimos la migrada.
      if (version !== VERSION_ESTADO || !Array.isArray(dato.alumnos) || !Array.isArray(dato.rutinas)) this.persistir(estado);
      return estado;
    } catch {
      return null;
    }
  }

  private sembrarEstado(): EstadoClases {
    const ahora = this.reloj.ahora();
    const estado: EstadoClases = {
      version: VERSION_ESTADO,
      guardadoEn: new Date(ahora).toISOString(),
      clases: reconciliar(this.sembrar(ahora), ahora),
      pagos: [],
      alumnos: this.sembrarAlumnos(hoyLocal(ahora)),
      rutinas: [],
    };
    this.persistir(estado);
    return estado;
  }

  /** Lee las rutinas del respaldo (clave aparte que el build v2 no toca). */
  private leerRutinasRespaldadas(): RutinaSemanal[] {
    try {
      const texto = this.almacen.leerRutinas?.();
      if (!texto) return [];
      const dato = JSON.parse(texto);
      return Array.isArray(dato)
        ? dato.map(normalizarRutina).filter((r): r is RutinaSemanal => r !== null)
        : [];
    } catch {
      return [];
    }
  }

  private persistir(estado: EstadoClases, requierePersistencia = false): void {
    // Si la escritura obligatoria falla, lanza ANTES de tocar el respaldo:
    // así no quedan rutinas nuevas con un estado principal viejo.
    this.almacen.escribir(JSON.stringify({
      ...estado,
      guardadoEn: new Date(this.reloj.ahora()).toISOString(),
    }), requierePersistencia);
    // Respaldo separado: si una pestaña v2 re-graba el estado principal y
    // pierde `rutinas`, acá siguen para recuperarlas.
    this.almacen.escribirRutinas?.(JSON.stringify(estado.rutinas));
  }
}
