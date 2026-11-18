/**
 * Ficha — pantalla madre del alumno (W4 de Fina; I1 con límites nombrados).
 * Identidad + modalidad + próximas clases (de Agenda, solo lectura) + bloque de
 * pagos como límite explícito (I2). Se conserva aunque deje de venir.
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usarTema } from '../../../packages/ui/src/tema';
import { AURORA } from '../../../packages/ui/src/tokens';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';

export default function Ficha() {
  const { color, oscuro } = usarTema();
  const { repo } = usarSesion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alumno = repo.obtener(id ?? '');
  if (!alumno) {
    return (
      <View style={[s.cont, { backgroundColor: color.fondo, flex: 1 }]}>
        <Text style={[s.titulo, { color: color.texto }]}>Ficha no encontrada</Text>
        <Text style={[s.legal, { color: color.textoSuave }]}>
          Vuelve a Alumnos e intentalo de nuevo.
        </Text>
      </View>
    );
  }
  const progs = repo.programaciones.filter((p) => p.activa && p.alumnoId === alumno.id);
  const proximas = progs
    .map((p) => repo.ocurrencias.find((o) => o.id === p.ocurrenciaId))
    .filter((o) => !!o)
    .sort((a, b) => (a as { fecha: string }).fecha.localeCompare((b as { fecha: string }).fecha) || (a as { hora: string }).hora.localeCompare((b as { hora: string }).hora));

  const tarjeta = (extra?: object) => [
    s.tarjeta,
    { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderColor: color.borde },
    extra ?? {},
  ];

  return (
    <ScrollView contentContainerStyle={[s.cont, { backgroundColor: color.fondo }]} style={{ backgroundColor: color.fondo }}>
      <View style={s.identidad}>
        <AvatarInitials nombre={alumno.nombre} />
        <View style={s.identidadInfo}>
          <Text style={[s.titulo, { color: color.texto }]}>{alumno.nombre}</Text>
          <View style={s.meta}>
            <ModalityBadge modalidad={alumno.modalidad} />
            <Text style={[s.alta, { color: color.textoSuave }]}>alta {alumno.fechaAlta}</Text>
          </View>
        </View>
      </View>

      <View style={tarjeta()}>
        <Text style={[s.seccion, { color: color.texto }]}>Estado</Text>
        <Text style={[s.vacio, { color: color.textoSuave }]}>
          {alumno.modalidad === 'mensual'
            ? 'Ciclo y vencimientos llegan con cobros (I2)'
            : 'Clases adeudadas llegan con cobros (I2)'}
        </Text>
      </View>

      <View style={tarjeta()}>
        <Text style={[s.seccion, { color: color.texto }]}>Próximas clases</Text>
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

      <View style={tarjeta()}>
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
  cont: { padding: 16, gap: 12, paddingBottom: 32 },
  identidad: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identidadInfo: { flex: 1, gap: 4 },
  titulo: { fontSize: 24, fontWeight: '800' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alta: { fontSize: 13 },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  seccion: { fontSize: 15, fontWeight: '700' },
  dato: { fontSize: 14 },
  vacio: { fontSize: 14 },
  legal: { fontSize: 12 },
});
