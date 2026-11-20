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
import { anularPago, registrarPago, type Pago, type PagoNuevo } from './cobros.ts';
import {
  crearAlumno, editarAlumno, normalizarFichaGuardada,
  type AlumnoFicha, type AlumnoFichaInput,
} from './alumnos.ts';
import {
  conExcepcion, crearClaseSuelta, crearRutina, generarOcurrencias,
  type ClaseSueltaNueva, type RutinaNueva, type RutinaSemanal,
} from './agendar.ts';
export type { Pago } from './cobros.ts';
export type { AlumnoFicha, AlumnoFichaInput } from './alumnos.ts';
export type { RutinaSemanal, RutinaNueva, ClaseSueltaNueva } from './agendar.ts';

/**
 * Versión del formato guardado. v2 agregó `alumnos` (Pieza C); v3 (20/11)
 * agrega `rutinas` para las clases semanales SIN tocar clases, pagos ni
 * alumnos: el lector migra v1/v2→v3 conservando todo lo ya guardado.
 */
export const VERSION_ESTADO = 3;
/** Clave única de `localStorage` (por origen: puerto incluido). */
export const CLAVE_ESTADO = 'xime.v5.estado';

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
};

/** Almacén en memoria (tests, o respaldo si `localStorage` no está). */
export function almacenMemoria(inicial: string | null = null): Almacen {
  let valor = inicial;
  return {
    leer: () => valor,
    escribir: (texto) => { valor = texto; },
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
      if (requierePersistencia) throw new Error('No se pudo guardar el pago en este navegador. No se aplicaron cambios.');
      ultimo = texto;
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
  reconciliar(ahora?: InstanteMs): Clase[];
  marcarDada(id: string, op: OpcionMarcar): Clase;
  deshacerMarcada(id: string, op: OpcionMarcar): Clase;
  cancelar(id: string, op: OpcionCancelar): Clase;
  revertir(id: string, op: OpcionCancelar): Clase;
  reprogramar(id: string, fechaNueva: string, op: OpcionReprogramar): Clase;
  registrarMensajeEnviado(id: string, canal: CanalMensaje): Clase;
  listarPagos(): readonly Pago[];
  registrarPago(nuevo: Omit<PagoNuevo, 'fecha'>): void;
  anularPago(id: string, motivo: string, quien: string): void;
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

  registrarPago(nuevo: Omit<PagoNuevo, 'fecha'>): void {
    const fecha = hoyLocal(this.reloj.ahora());
    this.actualizarPagos((pagos) => registrarPago(pagos, { ...nuevo, fecha }));
  }

  anularPago(id: string, motivo: string, quien: string): void {
    const fecha = hoyLocal(this.reloj.ahora());
    this.actualizarPagos((pagos) => anularPago(pagos, id, { fecha, motivo, quien }));
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
    const clase = this.una(id);
    this.marcarExcepcionDeOrigen(clase, 'cancelada');
    return this.reemplazar(cancelarClase(clase, op));
  }

  revertir(id: string, op: OpcionCancelar): Clase {
    const clase = this.una(id);
    // Revertir una cancelación devuelve la clase a su día de origen: se quita
    // la excepción para que la serie vuelva a estar completa.
    this.quitarExcepcionDeOrigen(clase);
    return this.reemplazar(deshacerCancelacion(clase, op));
  }

  reprogramar(id: string, fechaNueva: string, op: OpcionReprogramar): Clase {
    const clase = this.una(id);
    this.marcarExcepcionDeOrigen(clase, 'movida');
    return this.reemplazar(reprogramarClase(clase, fechaNueva, op));
  }

  /** Si la clase es una ocurrencia, marca su fecha de origen como excepción. */
  private marcarExcepcionDeOrigen(clase: Clase, motivo: 'cancelada' | 'movida'): void {
    if (!clase.rutinaId || !clase.fechaRutina) return;
    const estado = this.cargar();
    const rutina = estado.rutinas.find((r) => r.id === clase.rutinaId);
    if (!rutina || rutina.excepciones[clase.fechaRutina]) return;
    const rutinas = estado.rutinas.map((r) => (r.id === rutina.id ? conExcepcion(r, clase.fechaRutina as string, motivo) : r));
    this.persistir({ ...estado, rutinas });
    this.estado = { ...estado, rutinas };
  }

  /** Si la clase vuelve a su origen (reversión), limpia la excepción. */
  private quitarExcepcionDeOrigen(clase: Clase): void {
    if (!clase.rutinaId || !clase.fechaRutina) return;
    const estado = this.cargar();
    const rutina = estado.rutinas.find((r) => r.id === clase.rutinaId);
    if (!rutina || !rutina.excepciones[clase.fechaRutina]) return;
    const excepciones = { ...rutina.excepciones };
    delete excepciones[clase.fechaRutina];
    const rutinas = estado.rutinas.map((r) => (r.id === rutina.id ? { ...r, excepciones } : r));
    this.persistir({ ...estado, rutinas });
    this.estado = { ...estado, rutinas };
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
      // Migra v1→v2→v3: clases, pagos y alumnos guardados se conservan tal
      // cual; solo se agrega el campo `rutinas`. Versiones futuras → resembrar.
      const version = dato?.version;
      if (!dato || (version !== VERSION_ESTADO && version !== 1 && version !== 2) || !Array.isArray(dato.clases)) return null;
      const clases = dato.clases.map(normalizarClase);
      const pagos = Array.isArray(dato.pagos) ? dato.pagos : [];
      const alumnos = Array.isArray(dato.alumnos)
        ? dato.alumnos.map(normalizarFichaGuardada).filter((a): a is AlumnoFicha => a !== null)
        : this.sembrarAlumnos(hoyLocal(this.reloj.ahora()));
      const rutinas = Array.isArray(dato.rutinas)
        ? dato.rutinas.map(normalizarRutina).filter((r): r is RutinaSemanal => r !== null)
        : [];
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

  private persistir(estado: EstadoClases, requierePersistencia = false): void {
    this.almacen.escribir(JSON.stringify({
      ...estado,
      guardadoEn: new Date(this.reloj.ahora()).toISOString(),
    }), requierePersistencia);
  }
}
