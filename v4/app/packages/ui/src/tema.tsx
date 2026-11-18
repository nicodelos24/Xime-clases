/**
 * Proveedor de tema: claro/oscuro según el sistema + reduced-motion del
 * sistema (movimiento se vuelve instantáneo si el sistema pide menos).
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, AccessibilityInfo } from 'react-native';
import { esquemaInicial, hacerTema, type Tema } from './tokens';

interface TemaContexto {
  tema: Tema;
}
const Ctx = createContext<TemaContexto | null>(null);

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  // El export estático prerenderiza en claro; el script inline de `+html.tsx`
  // marca `data-tema` en <html> antes del primer paint y de arrancar React.
  // Leer ese valor como estado inicial hace que el primer render del cliente
  // (y por lo tanto la hidratación) ya coincida con el tema del sistema: sin
  // esto, la barra y el header quedan en claro hasta la primera interacción
  // (hallazgo de Gino, 18/11). En nativo no hay DOM y manda Appearance, como
  // siempre; en dev server el valor coincide con Appearance, así que nada
  // cambia ahí.
  const [esquema, setEsquema] = useState<'dark' | 'light'>(esquemaInicial);
  const [reducir, setReducir] = useState(false);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setEsquema(colorScheme ?? 'light'),
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
