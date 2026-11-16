import { StyleSheet, Text, View } from 'react-native';
import { usarTema } from '../tema/tema';

/** Badge textual de modalidad: color + nombre siempre («Mensual»/«Individual»). */
export function ModalityBadge({ modalidad }: { modalidad: 'mensual' | 'individual' }) {
  const { modalidad: pal } = usarTema();
  const c = pal[modalidad];
  const rotado = c.forma === 'rombo' ? '45deg' : '0deg';
  return (
    <View
      style={[s.chip, { backgroundColor: c.fondo }]}
      accessibilityLabel={modalidad === 'mensual' ? 'Mensual' : 'Individual'}
    >
      <View
        style={[
          s.forma,
          c.forma === 'rombo' ? { transform: [{ rotate: rotado }] } : null,
          { backgroundColor: c.texto },
        ]}
      />
      <Text style={[s.texto, { color: c.texto }]}>
        {modalidad === 'mensual' ? 'Mensual' : 'Individual'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 28,
  },
  forma: { width: 8, height: 8, borderRadius: 4 },
  texto: { fontSize: 13, fontWeight: '600' },
});
