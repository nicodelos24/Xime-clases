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
import type { InstanteMs, Reloj } from './reloj.ts';

/** Versión del formato guardado. Subirla obliga a migrar o resembrar. */
export const VERSION_ESTADO = 1;
/** Clave única de `localStorage` (por origen: puerto incluido). */
export const CLAVE_ESTADO = 'xime.v5.estado';

/**
 * Pago manual: Fase 4 lo lleva a BD sin tocar la UI. Montos en UYU enteros;
 * un pago no se edita ni se borra, se anula con registro trazable.
 */
export type Pago = {
  id: string;
  alumnoId: string;
  /** Mes cobrado, "AAAA-MM". */
  periodo: string;
  /** Monto en pesos uruguayos, entero. */
  montoUYU: number;
  /** Día en que se registró, "AAAA-MM-DD". */
  fecha: string;
  quien: string;
  anulado: { fecha: string; motivo: string; quien: string } | null;
};

/** Estado completo que se guarda. `pagos` queda listo para la pieza B. */
export type EstadoClases = {
  version: number;
  /** ISO UTC del último guardado (diagnóstico). */
  guardadoEn: string;
  clases: Clase[];
  pagos: Pago[];
};

/** Contrato mínimo del almacén: lo único que cambia en la Fase 4. */
export type Almacen = {
  leer(): string | null;
  escribir(texto: string): void;
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
    escribir: (texto) => {
      ultimo = texto;
      if (!soloMemoria) {
        try {
          if (ventana.localStorage) ventana.localStorage.setItem(CLAVE_ESTADO, texto);
          else soloMemoria = true;
        } catch {
          soloMemoria = true;
        }
      }
    },
  };
}

export type SembrarClases = (ahora: InstanteMs) => Clase[];

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
}

/** Repositorio único: la UI lee y manda comandos acá, nunca al estado suelto. */
export class RepositorioClases implements RepositorioDeClases {
  private estado: EstadoClases | null = null;
  private readonly almacen: Almacen;
  private readonly reloj: Reloj;
  private readonly sembrar: SembrarClases;

  constructor(almacen: Almacen, reloj: Reloj, sembrar: SembrarClases = () => []) {
    this.almacen = almacen;
    this.reloj = reloj;
    this.sembrar = sembrar;
  }

  /** Clases actuales; la UI las usa solo para lectura. */
  listar(): Clase[] {
    return this.cargar().clases;
  }

  /** Pagos guardados; hoy vacío, la pieza B (Cobros) los escribe. */
  listarPagos(): Pago[] {
    return this.cargar().pagos;
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
    if (this.estado) return this.estado;
    this.estado = this.leer() ?? this.sembrarEstado();
    return this.estado;
  }

  private leer(): EstadoClases | null {
    const texto = this.almacen.leer();
    if (!texto) return null;
    try {
      const dato = JSON.parse(texto) as Partial<EstadoClases> | null;
      if (!dato || dato.version !== VERSION_ESTADO || !Array.isArray(dato.clases)) return null;
      return {
        version: VERSION_ESTADO,
        guardadoEn: typeof dato.guardadoEn === 'string' ? dato.guardadoEn : new Date(this.reloj.ahora()).toISOString(),
        clases: dato.clases.map(normalizarClase),
        pagos: Array.isArray(dato.pagos) ? dato.pagos : [],
      };
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
    };
    this.persistir(estado);
    return estado;
  }

  private persistir(estado: EstadoClases): void {
    this.almacen.escribir(JSON.stringify({
      ...estado,
      guardadoEn: new Date(this.reloj.ahora()).toISOString(),
    }));
  }
}
