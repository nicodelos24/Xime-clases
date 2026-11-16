import { Pressable, StyleSheet, Text } from 'react-native';
import { usarTema } from '../tema/tema';

/** FAB extendido «+ Agendar» con fecha contextual explícita. */
export function ScheduleFAB({ fecha, enAgendar }: { fecha: string; enAgendar: () => void }) {
  const { color } = usarTema();
  return (
    <Pressable
      onPress={enAgendar}
      accessibilityRole="button"
      accessibilityLabel={`Agendar para el ${fecha}`}
      style={[s.fab, { backgroundColor: color.acento }]}
    >
      <Text style={[s.texto, { color: color.sobreAcento }]}>
        + Agendar
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 18,
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  texto: { fontSize: 16, fontWeight: '700' },
});
