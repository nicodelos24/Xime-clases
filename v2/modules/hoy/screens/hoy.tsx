import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { usarTema } from '../../../packages/ui/src/tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { personasUnicasDelDia } from '../../../packages/datos/src/logica';import { etiquetaFechaLarga } from '../../../packages/datos/src/fechas';

/** Hoy: estados derivados de fixtures, con límites explícitos (I1, sin cobros reales). */
export default function Hoy() {
  const { color } = usarTema();
  const { repo, agenda } = usarSesion();
  const fecha = agenda.fecha; // datos ficticios fijados a la fecha base de fixtures
  const ocurrencias = repo.ocurrenciasDe(fecha);
  const programaciones = repo.programacionesActivas(fecha);
  const personas = personasUnicasDelDia(programaciones, ocurrencias, fecha).size;

  return (
    <ScrollView contentContainerStyle={[s.cont, { backgroundColor: color.fondo }]} style={{ backgroundColor: color.fondo }}>
      <Text style={[s.titulo, { color: color.texto }]}>{etiquetaFechaLarga(fecha)}</Text>
      <Text style={[s.nota, { color: color.textoSuave }]}>
        Datos ficticios de la demo. Cobros y vencimientos reales llegan en I2–I3.
      </Text>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Clases del día</Text>
        <Text style={[s.dato, { color: color.texto }]}>
          {personas} persona{personas === 1 ? '' : 's'} programada{personas === 1 ? '' : 's'} en{' '}
          {ocurrencias.filter((o) => o.estado === 'programada').length} clase
          {ocurrencias.length === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Cobrado hoy</Text>
        <Text style={[s.vacio, { color: color.textoSuave }]}>
          Sin registro de cobros (I1 no registra pagos)
        </Text>
      </View>
      <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <Text style={[s.seccion, { color: color.texto }]}>Por vencer / Vencidos</Text>
        <Text style={[s.vacio, { color: color.textoSuave }]}>
          Se muestra con mensualidades reales (I2–I3)
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: '800' },
  nota: { fontSize: 13 },
  tarjeta: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  seccion: { fontSize: 15, fontWeight: '700' },
  dato: { fontSize: 14 },
  vacio: { fontSize: 14 },
});
