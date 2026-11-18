/**
 * Festejo — micro-festejo al marcar «Dada» (demo v4, tokens.css .festejo):
 * 6 puntos pastel que brotan del botón, 320 ms, solo transform/opacity.
 * Web: keyframes inline (como v2). Nativo: puntos estáticos que se desvanecen
 * (sin keyframes CSS); siempre dentro de la guía 150–350 ms.
 * Con movimiento reducido no se muestra (la pantalla ni lo dispara).
 */

import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FESTEJO } from '../screens/textoHoy';

interface Punto {
  x: number;
  y: number;
  delay: number;
  color: string;
}

function generar(): Punto[] {
  // 6 puntitos alrededor del punto de origen, como el demo (±14..48 px).
  const angulos = [-100, -60, -25, 25, 60, 100];
  return angulos.map((a, i) => {
    const rad = (a * Math.PI) / 180;
    const dist = 26 + (i % 3) * 12;
    return {
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist - 18,
      delay: (i % 3) * 40,
      color: FESTEJO.colores[i],
    };
  });
}

export function Festejo({
  visible,
  animar,
  origenX,
  origenY,
}: {
  visible: boolean;
  animar: boolean;
  /** Centro del festejo, en px relativos al contenedor raíz. */
  origenX: number;
  origenY: number;
}) {
  const [puntos, setPuntos] = useState<Punto[] | null>(null);
  const [nativo] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (!visible || !animar) return;
    setPuntos(generar());
    const t = setTimeout(() => setPuntos(null), FESTEJO.duracion + 60);
    return () => clearTimeout(t);
  }, [visible, animar]);

  if (!animar || !visible || !puntos) return null;

  return (
    <View
      style={s.capa}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {!nativo && <style>{KEYFRAMES}</style>}
      {puntos.map((p, i) => (
        <View
          key={i}
          style={[
            nativo ? s.puntoNativo : s.punto,
            {
              left: origenX,
              top: origenY,
              backgroundColor: p.color,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${FESTEJO.duracion}ms`,
              '--x': `${p.x}px`,
              '--y': `${p.y}px`,
            } as object,
          ]}
        />
      ))}
    </View>
  );
}

/** Copia local de @keyframes brotar (tokens.css del demo), 320 ms. */
const KEYFRAMES = '@keyframes brotarFestejo{from{opacity:1;transform:translate(0,0) scale(1)}to{opacity:0;transform:translate(var(--x),var(--y)) scale(.4)}}';

const s = StyleSheet.create({
  capa: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  punto: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    animationKeyframes: 'brotarFestejo',
    animationTimingFunction: 'cubic-bezier(.22,.9,.36,1.02)',
    animationFillMode: 'forwards',
    marginLeft: -3,
    marginTop: -3,
  } as object,
  puntoNativo: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
    opacity: 0,
    transform: [{ translateX: 20 }, { translateY: -16 }],
  } as object,
});
