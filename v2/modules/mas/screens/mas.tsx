import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { usarTema } from '../../../packages/ui/src/tema';

/** Más: información de la unidad I1 y límites. */
export default function Mas() {
  const { color } = usarTema();
  return (
    <ScrollView contentContainerStyle={[s.cont, { backgroundColor: color.fondo }]} style={{ backgroundColor: color.fondo }}>
      <Text style={[s.titulo, { color: color.texto }]}>Más</Text>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Sobre esta app (I1)</Text>
        <Text style={[s.texto, { color: color.texto }]}>
          Base Expo / React Native / TypeScript con datos ficticios explícitos.
        </Text>
        <Text style={[s.texto, { color: color.textoSuave }]}>
          - Sin Supabase, autenticación ni SQL (I2 en adelante).
        </Text>
        <Text style={[s.texto, { color: color.textoSuave }]}>
          - No registra pagos ni procesa dinero (I2–I3).
        </Text>
        <Text style={[s.texto, { color: color.textoSuave }]}>
          - WhatsApp queda manual y simulado; sin notificaciones reales.
        </Text>
        <Text style={[s.texto, { color: color.textoSuave }]}>
          - Los cambios de Agenda (agendar/retirar) viven solo en memoria.
        </Text>
      </View>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Reglas que respeta</Text>
        <Text style={[s.texto, { color: color.textoSuave }]}>
          Alumno, modalidad, programación, clase efectiva y pago son conceptos distintos: agendar, navegar o retirar no confirma asistencia, no inicia mensualidad y no genera deuda.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: '800' },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  seccion: { fontSize: 15, fontWeight: '700' },
  texto: { fontSize: 14 },
});
