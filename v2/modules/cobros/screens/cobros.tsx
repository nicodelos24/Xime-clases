import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { usarTema } from '../../../packages/ui/src/tema';

/** Cobros: estados y límites visuales; en I1 solo demostración. */
export default function Cobros() {
  const { color } = usarTema();
  return (
    <ScrollView contentContainerStyle={[s.cont, { backgroundColor: color.fondo }]} style={{ backgroundColor: color.fondo }}>
      <Text style={[s.titulo, { color: color.texto }]}>Cobros</Text>
      <Text style={[s.nota, { color: color.textoSuave }]}>
        Pantalla de estados con datos ficticios. Registrar cobros reales llega en I2–I3; aquí no se procesa dinero.
      </Text>
      {['Mensualidades pendientes', 'Clases adeudadas', 'Cobrado del período'].map((t) => (
        <View key={t} style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
          <Text style={[s.seccion, { color: color.texto }]}>{t}</Text>
          <Text style={[s.vacio, { color: color.textoSuave }]}>
            Sin datos en la demo (requiere mensualidades y pagos de I2–I3)
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: '800' },
  nota: { fontSize: 13 },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  seccion: { fontSize: 15, fontWeight: '700' },
  vacio: { fontSize: 14 },
});
