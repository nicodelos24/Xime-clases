/**
 * AnilloProgreso — anillo «1/3 dadas» del hero de Hoy (demo v4: captura hoy.png
 * y .ring de tokens.css). SVG puro: stroke-dashoffset animado 320 ms ease-out;
 * al completar el día pasa a blanco y late. Con movimiento reducido se dibuja
 * directo. Nunca divide por cero.
 */

import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ANILLO, HOY_COLORES } from '../screens/textoHoy';

export function AnilloProgreso({
  dadas,
  total,
  reducirMovimiento,
}: {
  dadas: number;
  total: number;
  reducirMovimiento: boolean;
}) {
  const { tamaño, grosor, radio, duracion } = ANILLO;
  const c = 2 * Math.PI * radio;
  const fraccion = total > 0 ? Math.min(1, Math.max(0, dadas / total)) : 0;
  const completo = total > 0 && dadas === total;
  const [avance, setAvance] = useState(reducirMovimiento ? fraccion : 0);
  const animado = useRef<number | null>(null);

  useEffect(() => {
    if (reducirMovimiento) {
      setAvance(fraccion);
      return;
    }
    let cancelado = false;
    const inicio = performance.now();
    const paso = (t: number) => {
      if (cancelado) return;
      const k = Math.min(1, (t - inicio) / duracion);
      const suave = 1 - Math.pow(1 - k, 3); // ease-out cúbica
      setAvance(suave * fraccion);
      if (k < 1) animado.current = requestAnimationFrame(paso);
    };
    animado.current = requestAnimationFrame(paso);
    return () => {
      cancelado = true;
      if (animado.current) cancelAnimationFrame(animado.current);
    };
  }, [fraccion, reducirMovimiento, duracion]);

  const etiqueta =
    total > 0 ? `${dadas} de ${total} clases dadas` : 'Sin clases programadas hoy';

  return (
    <View
      style={s.cont}
      accessibilityRole="image"
      accessibilityLabel={etiqueta}
    >
      {Platform.OS === 'web' && completo ? <style>{KEYFRAMES_LATIDO}</style> : null}
      <Svg width={tamaño} height={tamaño} style={completo ? s.latido : null}>
        <Circle cx={tamaño / 2} cy={tamaño / 2} r={radio} stroke={HOY_COLORES.anilloPista} strokeWidth={grosor} fill="none" />
        <Circle
          cx={tamaño / 2}
          cy={tamaño / 2}
          r={radio}
          stroke={completo ? HOY_COLORES.anilloValorCompleto : HOY_COLORES.anilloValor}
          strokeWidth={grosor}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - avance)}
        />
      </Svg>
      <View style={s.centro} pointerEvents="none">
        <Text style={s.numero}>
          {total > 0 ? dadas : 0}
          <Text style={s.sobre}>{`/${total > 0 ? total : 0}`}</Text>
        </Text>
        <Text style={s.pie}>dadas</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { width: ANILLO.tamaño, height: ANILLO.tamaño, alignItems: 'center', justifyContent: 'center' },
  centro: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  numero: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  sobre: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  pie: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', marginTop: -1 },
  latido: {
    transform: [{ scale: 1.06 }],
    animationKeyframes: 'latir',
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  } as object,
});

const KEYFRAMES_LATIDO =
  '@keyframes latir{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}';
