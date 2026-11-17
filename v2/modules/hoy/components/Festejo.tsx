/**
 * Festejo — micro-festejo al marcar una clase dada (a-hoy-festejo.png).
 * Partículas de color que salen y caen, 240 ms, solo transform/opacity
 * (keyframes locales: el RNW inline no ejecuta reglas globales de tokens.css).
 * Con movimiento reducido no se muestra (la guía lo apaga).
 */

import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AURORA } from '../../../packages/ui/src/tokens';

const COLORES = [
  AURORA.mensual.solid, AURORA.individual.solid, AURORA.aldia.solid,
  AURORA.pronto.solid, AURORA.debe.solid, AURORA.vencida.solid,
];

interface Particula {
  dx: number; dy: number; rot: number; delay: number; color: string; izq: number;
}

function generar(): Particula[] {
  return Array.from({ length: 16 }, (_, i) => ({
    dx: (Math.random() - 0.5) * 160,
    dy: -(60 + Math.random() * 60),
    rot: (Math.random() - 0.5) * 360,
    delay: (i % 4) * 40,
    color: COLORES[i % COLORES.length],
    izq: 10 + ((i * 37) % 80),
  }));
}

export function Festejo({
  visible,
  animar,
  origenY,
}: {
  visible: boolean;
  animar: boolean;
  /** Y de origen (px, relativo al contenedor) donde se disparó; por defecto, cerca del tope de la lista. */
  origenY?: number;
}) {
  const top = origenY ?? 220;
  const [particulas, setParticulas] = useState<Particula[] | null>(null);
  const [nativo, setNativo] = useState(false);

  useEffect(() => {
    if (!visible || !animar) return;
    // En nativo (no web) no hay keyframes CSS: versión estática instantánea.
    setNativo(Platform.OS !== 'web');
    setParticulas(generar());
    const t = setTimeout(() => {
      setParticulas(null);
    }, 400);
    return () => clearTimeout(t);
  }, [visible, animar]);

  if (!animar || !visible || !particulas) return null;

  return (
    <View style={s.capa} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <style>{KEYFRAMES}</style>
      {particulas.map((p, i) => (
        <View
          key={i}
          style={[
            nativo ? s.confetiNativo : s.confeti,
            {
              left: `${p.izq}%`,
              top,
              backgroundColor: p.color,
              animationDelay: `${p.delay}ms`,
              animationDuration: '240ms',
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--r': `${p.rot}deg`,
            } as object,
          ]}
        />
      ))}
    </View>
  );
}

/** Copia local de @keyframes confeti (packages/ui/tokens.css), 700→240 ms. */
const KEYFRAMES = '@keyframes caerConfeti{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),calc(var(--dy) + 20px)) rotate(var(--r));opacity:0}}';

const s = StyleSheet.create({
  capa: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  confeti: {
    position: 'absolute',
    width: 7,
    height: 10,
    borderRadius: 2,
    animationKeyframes: 'caerConfeti',
    animationTimingFunction: 'cubic-bezier(.22,1,.36,1)',
    animationFillMode: 'forwards',
  } as object,
  /** En nativo no hay keyframes CSS: dada → desplazamiento y desvanecer. */
  confetiNativo: {
    position: 'absolute',
    width: 7,
    height: 10,
    borderRadius: 2,
    opacity: 0,
    transform: [{ translateX: 40 }, { translateY: -80 }],
  } as object,
});
