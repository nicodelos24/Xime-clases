/**
 * Sesión de la app en I1: una única instancia de fixtures en memoria.
 * La Agenda conserva fecha, modo y origen al volver (día/agendar/ficha).
 * Todo es simulación explícita: no hay persistencia real (I2–I3).
 */

import { createContext, useContext, useMemo, useState } from 'react';
import {
  RepositorioFixtures,
} from './repositorios';
import {
  ALUMNOS_FIXTURES,
  OCURRENCIAS_FIXTURES,
  PROGRAMACIONES_FIXTURES,
  FECHA_BASE_FIXTURES,
} from './fixtures';

const hoy = FECHA_BASE_FIXTURES;

interface AgendaEstado {
  /** Fecha seleccionada (AAA-MM-DD). Conservada al volver desde ficha/programación. */
  fecha: string;
  setFecha: (f: string) => void;
  modo: 'semana' | 'mes';
  setModo: (m: 'semana' | 'mes') => void;
  origen: { vista: 'semana' | 'mes'; fecha: string } | undefined;
  setOrigen: (o: { vista: 'semana' | 'mes'; fecha: string }) => void;
  /** Versión para refrescar listas tras agendar/retirar. */
  version: number;
}

interface Sesion {
  repo: RepositorioFixtures;
  agenda: AgendaEstado;
  refrescar: () => void;
}

const Ctx = createContext<Sesion | null>(null);

export function ProveedorSesion({ children }: { children: React.ReactNode }) {
  const repo = useMemo(
    () =>
      new RepositorioFixtures(
        ALUMNOS_FIXTURES.map((a) => ({ ...a })),
        OCURRENCIAS_FIXTURES.map((o) => ({ ...o })),
        PROGRAMACIONES_FIXTURES.map((p) => ({ ...p })),
      ),
    [],
  );
  const [fecha, setFecha] = useState(hoy);
  const [modo, setModo] = useState<'semana' | 'mes'>('mes');
  const [origen, setOrigen] = useState<
    { vista: 'semana' | 'mes'; fecha: string } | undefined
  >(undefined);
  const [version, setVersion] = useState(0);

  const agenda: AgendaEstado = {
    fecha,
    setFecha,
    modo,
    setModo,
    origen,
    setOrigen,
    version,
  };

  // Refresca las pantallas cuando repo muta (agendar/retirar).
  const valor = useMemo<Sesion>(
    () => ({
      repo,
      agenda: {
        ...agenda,
        version,
      },
      refrescar: () => setVersion((v) => v + 1),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repo, fecha, modo, origen, version],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function usarSesion(): Sesion {
  const v = useContext(Ctx);
  if (!v) throw new Error('usarSesion fuera de ProveedorSesion');
  return v;
}
