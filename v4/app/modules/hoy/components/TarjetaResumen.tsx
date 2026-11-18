/**
 * TarjetaResumen — tarjetas «Cobrado hoy / Por cobrar / Vencen» (a-hoy.png).
 * I1 sin pagos reales: muestran límites explícitos, no números inventados.
 * Acento lateral por tipo de dato + ícono de forma (no emoji, nunca solo color).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTema } from '../../../packages/ui/src/tema';
import { AURORA } from '../../../packages/ui/src/tokens';
import { Icono, type NombreIcono } from '../../../packages/ui/src/components/Icono';

export interface DatoResumen {
  titulo: string;
  valor: string;
  nota?: string;
  tipo: 'cobrado' | 'porCobrar' | 'vencen';
}

const ACENTO = {
  cobrado: AURORA.aldia,
  porCobrar: AURORA.individual,
  vencen: AURORA.pronto,
} as const;

const ICONO: Record<DatoResumen['tipo'], NombreIcono> = {
  cobrado: 'cobrado',
  porCobrar: 'porCobrar',
  vencen: 'alerta',
};

export function TarjetaResumen({ dato, enAbrir }: { dato: DatoResumen; enAbrir?: () => void }) {
  const { oscuro } = usarTema();
  const acento = ACENTO[dato.tipo];
  const borde = oscuro ? acento.tint : acento.solid;

  return (
    <Pressable
      onPress={enAbrir}
      accessibilityRole={enAbrir ? 'button' : undefined}
      accessibilityLabel={`${dato.titulo}: ${dato.valor}${dato.nota ? `, ${dato.nota}` : ''}`}
      style={({ pressed }) => [
        s.tarjeta,
        { borderLeftColor: borde },
        pressed && enAbrir ? s.presionada : null,
      ]}
    >
      <View style={[s.icono, { backgroundColor: acento.tint }]}>
        <Icono nombre={ICONO[dato.tipo]} color={acento.ink} tamaño={16} grosor={2} />
      </View>
      <Text style={[s.valor, { color: AURORA.text }]}>{dato.valor}</Text>
      <Text style={[s.titulo, { color: AURORA.muted }]}>{dato.titulo}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tarjeta: {
    flex: 1,
    borderLeftWidth: 3,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 2,
    minHeight: 84,
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  presionada: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  icono: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  valor: { fontSize: 17, fontWeight: '800' },
  titulo: { fontSize: 11, fontWeight: '600' },
});
