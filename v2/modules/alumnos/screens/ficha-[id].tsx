import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usarTema } from '../../../packages/ui/src/tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';

/** Ficha canónica: identidad conservada; historial real en I2–I3. */
export default function Ficha() {
  const { color } = usarTema();
  const { repo } = usarSesion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alumno = repo.obtener(id ?? '');
  if (!alumno) {
    return (
      <View style={[s.cont, { backgroundColor: color.fondo, flex: 1 }]}>
        <Text style={[s.titulo, { color: color.texto }]}>Ficha no encontrada</Text>
      </View>
    );
  }
  const progs = repo.programaciones.filter((p) => p.activa && p.alumnoId === alumno.id);
  const proximas = progs
    .map((p) => repo.ocurrencias.find((o) => o.id === p.ocurrenciaId))
    .filter((o) => !!o)
    .sort((a, b) => (a as { fecha: string }).fecha.localeCompare((b as { fecha: string }).fecha) || (a as { hora: string }).hora.localeCompare((b as { hora: string }).hora));

  return (
    <ScrollView contentContainerStyle={[s.cont, { backgroundColor: color.fondo }]} style={{ backgroundColor: color.fondo }}>
      <Text style={[s.titulo, { color: color.texto }]}>{alumno.nombre}</Text>
      <View style={s.meta}>
        <ModalityBadge modalidad={alumno.modalidad} />
        <Text style={[s.alta, { color: color.textoSuave }]}>alta {alumno.fechaAlta}</Text>
      </View>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Próximas programaciones</Text>
        {proximas.length === 0 ? (
          <Text style={[s.vacio, { color: color.textoSuave }]}>Sin programaciones activas</Text>
        ) : (
          proximas.map((o) => (
            <Text key={o!.id} style={[s.dato, { color: color.texto }]}>
              {o!.fecha} · {o!.hora}
            </Text>
          ))
        )}
      </View>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Historial y pagos</Text>
        <Text style={[s.vacio, { color: color.textoSuave }]}>
          Disponible en I2–I3 con persistencia real. Los datos de esta demo son ficticios y no se guardan.
        </Text>
      </View>
      <Text style={[s.legal, { color: color.textoSuave }]}>
        La ficha se conserva aunque el alumno deje de venir; agendar o retirar no la modifica.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '800' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alta: { fontSize: 13 },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  seccion: { fontSize: 15, fontWeight: '700' },
  dato: { fontSize: 14 },
  vacio: { fontSize: 14 },
  legal: { fontSize: 12 },
});
