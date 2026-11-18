/**
 * TarjetaResumen — KPI «Cobrado hoy / Por cobrar / Vencen hoy» (demo v4,
 * tokens.css .kpi): fondo blanco, ícono en tinte pastel y punto de color
 * arriba a la derecha (color + forma, nunca solo color).
 * I1 sin pagos: valor «—» con límite nombrado en la nota de accesibilidad.
 * Tocable → Cobros (destino real, mismo patrón fintech que v2).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AURORA } from '../../../packages/ui/src/tokens';
import { Icono, type NombreIcono } from '../../../packages/ui/src/components/Icono';

export interface DatoResumen {
  titulo: string;
  /** Valor I1: «—» (llegan con pagos reales en I2) o un conteo del día. */
  valor: string;
  tipo: 'cobrado' | 'porCobrar' | 'vencen';
  /** Nota para el lector y el límite explícito («pagos reales en I2»). */
  nota?: string;
}

const ACENTO = {
  cobrado: AURORA.aldia,
  porCobrar: AURORA.pronto,
  vencen: AURORA.vencida,
} as const;

const ICONO: Record<DatoResumen['tipo'], NombreIcono> = {
  cobrado: 'cobros',
  porCobrar: 'porCobrar',
  vencen: 'alerta',
};

export function TarjetaResumen({
  dato,
  enAbrir,
  reducirMovimiento,
}: {
  dato: DatoResumen;
  enAbrir?: () => void;
  /** Reservado por compatibilidad; la entrada escalonada la maneja la pantalla. */
  retraso?: number;
  animarEntrada?: boolean;
  reducirMovimiento?: boolean;
}) {
  const acento = ACENTO[dato.tipo];
  return (
    <Pressable
      onPress={enAbrir}
      accessibilityRole={enAbrir ? 'button' : undefined}
      accessibilityLabel={`${dato.titulo}: ${dato.valor}${dato.nota ? `, ${dato.nota}` : ''}`}
      style={({ pressed }) => [
        s.tarjeta,
        pressed && enAbrir ? { transform: [{ scale: 0.98 }], opacity: 0.92 } : null,
      ]}
    >
      <View style={[s.icono, { backgroundColor: acento.tint }]}>
        <Icono nombre={ICONO[dato.tipo]} color={acento.ink} tamaño={16} grosor={2} />
      </View>
      <Text style={[s.valor, { color: AURORA.text }]}>{dato.valor}</Text>
      <Text style={[s.titulo, { color: AURORA.muted }]}>{dato.titulo}</Text>
      <View style={[s.punto, { backgroundColor: acento.solid }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  tarjeta: {
    position: 'relative',
    flex: 1,
    minWidth: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 1,
    minHeight: 96,
  },
  icono: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valor: { fontSize: 16.5, fontWeight: '800', marginTop: 6, letterSpacing: -0.2 },
  titulo: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  punto: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
