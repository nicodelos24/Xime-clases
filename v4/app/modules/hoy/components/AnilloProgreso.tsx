/**
 * AnilloProgreso — anillo «Clases de hoy» de Aurora (referencia a-hoy.png).
 * SVG puro: el avance va por stroke-dashoffset; con movimiento reducido se
 * dibuja directo sin animación. Nunca divide por cero (0 clases → vacío).
 */

import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function AnilloProgreso({
  dadas,
  total,
  acento,
  acentoSuave,
  texto,
  reducirMovimiento,
}: {
  dadas: number;
  total: number;
  acento: string;
  acentoSuave: string;
  texto: string;
  reducirMovimiento: boolean;
}) {
  const TAMAÑO = 76;
  const GROSOR = 7;
  const r = (TAMAÑO - GROSOR) / 2;
  const c = 2 * Math.PI * r;
  const fraccion = total > 0 ? Math.min(1, Math.max(0, dadas / total)) : 0;
  const [avance, setAvance] = useState(reducirMovimiento ? fraccion : 0);
  const animado = useRef<number | null>(null);

  useEffect(() => {
    if (reducirMovimiento) {
      setAvance(fraccion);
      return;
    }
    let cancelado = false;
    const inicio = performance.now();
    const duracion = 240; // MOVIMIENTO.feedback (guía: 150–350 ms)
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
  }, [fraccion, reducirMovimiento]);

  const etiqueta =
    total > 0 ? `${dadas} de ${total} clases dadas` : 'Sin clases programadas hoy';

  return (
    <View
      style={s.cont}
      accessibilityRole="image"
      accessibilityLabel={etiqueta}
    >
      <Svg width={TAMAÑO} height={TAMAÑO}>
        <Circle
          cx={TAMAÑO / 2}
          cy={TAMAÑO / 2}
          r={r}
          stroke={acentoSuave}
          strokeWidth={GROSOR}
          fill="none"
        />
        <Circle
          cx={TAMAÑO / 2}
          cy={TAMAÑO / 2}
          r={r}
          stroke={texto}
          strokeWidth={GROSOR}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - avance)}
          transform={`rotate(-90 ${TAMAÑO / 2} ${TAMAÑO / 2})`}
        />
      </Svg>
      <View style={s.centro} pointerEvents="none">
        <Text style={[s.numero, { color: texto }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {total > 0 ? dadas : 0}
          <Text style={[s.fraccion, { color: texto }]}>/{total > 0 ? total : 0}</Text>
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  centro: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  numero: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  fraccion: { fontSize: 14, fontWeight: '600' },
});
