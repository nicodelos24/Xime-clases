/**
 * Proveedor de tema: claro/oscuro según el sistema + reduced-motion del
 * sistema (movimiento se vuelve instantáneo si el sistema pide menos).
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, AccessibilityInfo } from 'react-native';
import { hacerTema, type Tema } from './tokens';

interface TemaContexto {
  tema: Tema;
}
const Ctx = createContext<TemaContexto | null>(null);

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const [esquema, setEsquema] = useState(Appearance.getColorScheme());
  const [reducir, setReducir] = useState(false);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setEsquema(colorScheme),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducir,
    );
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducir).catch(() => {});
    return () => sub.remove();
  }, []);

  const tema = useMemo(
    () => hacerTema(esquema === 'dark', reducir),
    [esquema, reducir],
  );
  return <Ctx.Provider value={{ tema }}>{children}</Ctx.Provider>;
}

export function usarTema(): Tema {
  const v = useContext(Ctx);
  if (!v) throw new Error('usarTema fuera de ProveedorTema');
  return v.tema;
}
