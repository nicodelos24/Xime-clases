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
  cancelarClase, crearClase, deshacerCancelacion, reconciliar,
  registrarMensajeEnviado, reprogramarClase,
  type CanalMensaje, type Clase, type ClaseNueva, type OpcionCancelar,
  type OpcionReprogramar,
} from './clases.ts';
import { hoyLocal, type InstanteMs, type Reloj } from './reloj.ts';
import { anularPago, registrarPago, type Pago, type PagoNuevo } from './cobros.ts';
import {
  crearAlumno, editarAlumno, normalizarFichaGuardada,
  type AlumnoFicha, type AlumnoFichaInput,
} from './alumnos.ts';
export type { Pago } from './cobros.ts';
export type { AlumnoFicha, AlumnoFichaInput } from './alumnos.ts';

/**
 * Versión del formato guardado. v2 agrega `alumnos` (Pieza C) SIN tocar
 * clases ni pagos: el lector migra v1→v2 conservando todo lo ya guardado.
 */
export const VERSION_ESTADO = 2;
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

/** Comandos y consultas que consume la UI, independientes del almacenamiento. */
export interface RepositorioDeClases {
  listar(): Clase[];
  crear(spec: ClaseNueva): Clase;
  reconciliar(ahora?: InstanteMs): Clase[];
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

  /**
   * Auto-marcado por hora (al abrir la app y en el cron local). No toca
   * clases canceladas ni dadas y solo guarda si algo cambió.
   */
  reconciliar(ahora: InstanteMs = this.reloj.ahora()): Clase[] {
    const antes = this.cargar().clases;
    const despues = reconciliar(antes, ahora);
    if (despues.every((c, i) => c === antes[i])) return despues;
    this.actualizar(() => despues);
    return despues;
  }

  cancelar(id: string, op: OpcionCancelar): Clase {
    return this.reemplazar(cancelarClase(this.una(id), op));
  }

  revertir(id: string, op: OpcionCancelar): Clase {
    return this.reemplazar(deshacerCancelacion(this.una(id), op));
  }

  reprogramar(id: string, fechaNueva: string, op: OpcionReprogramar): Clase {
    return this.reemplazar(reprogramarClase(this.una(id), fechaNueva, op));
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

  private actualizar(transformar: (clases: Clase[]) => Clase[]): void {
    const estado = this.cargar();
    const nuevo: EstadoClases = { ...estado, clases: transformar(estado.clases) };
    this.persistir(nuevo);
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
      // Migra v1→v2: clases y pagos guardados se conservan tal cual; solo se
      // agrega el campo alumnos. Versiones futuras/desconocidas → resembrar.
      if (!dato || (dato.version !== VERSION_ESTADO && dato.version !== 1) || !Array.isArray(dato.clases)) return null;
      const clases = dato.clases.map(normalizarClase);
      const pagos = Array.isArray(dato.pagos) ? dato.pagos : [];
      const alumnos = Array.isArray(dato.alumnos)
        ? dato.alumnos.map(normalizarFichaGuardada).filter((a): a is AlumnoFicha => a !== null)
        : this.sembrarAlumnos(hoyLocal(this.reloj.ahora()));
      const estado: EstadoClases = {
        version: VERSION_ESTADO,
        guardadoEn: typeof dato.guardadoEn === 'string' ? dato.guardadoEn : new Date(this.reloj.ahora()).toISOString(),
        clases,
        pagos,
        alumnos,
      };
      // Si venía de v1 (o faltaba alumnos), persistimos la versión migrada.
      if (dato.version !== VERSION_ESTADO || !Array.isArray(dato.alumnos)) this.persistir(estado);
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
