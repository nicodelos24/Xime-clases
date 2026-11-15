import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usarTema } from '../../src/tema/tema';
import { usarSesion } from '../../src/datos/sesion';
import {
  programacionesPorOcurrencia,
  personasUnicasDelDia,
} from '../../src/datos/logica';
import { etiquetaFechaLarga } from '../../src/datos/fechas';
import { ScheduledStudentRow } from '../../src/componentes/ScheduledStudentRow';
import { ScheduleFAB } from '../../src/componentes/ScheduleFAB';

/** Día: fecha y cantidad antes de horario; alumnos agrupados por ocurrencia. */
export default function Dia() {
  const { color } = usarTema();
  const { repo, agenda, refrescar } = usarSesion();
  const router = useRouter();
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const f = fecha ?? agenda.fecha;

  const grupos = programacionesPorOcurrencia(
    repo.programaciones,
    repo.ocurrenciasDe(f),
    f,
  );
  const personas = personasUnicasDelDia(repo.programaciones, repo.ocurrenciasDe(f), f).size;

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <ScrollView contentContainerStyle={s.cont}>
        <Text style={[s.titulo, { color: color.texto }]}>{etiquetaFechaLarga(f)}</Text>
        <Text style={[s.subtitulo, { color: color.textoSuave }]}>
          {personas > 0
            ? `${personas} persona${personas === 1 ? '' : 's'} programada${personas === 1 ? '' : 's'}`
            : 'Día sin programación'}
        </Text>
        {grupos.length === 0 && (
          <Text style={[s.vacio, { color: color.textoSuave }]}>
            No hay clases este día. Usá «+ Agendar» para crear una programación.
          </Text>
        )}
        {grupos.map((g) => (
          <View key={g.ocurrencia.id} style={s.grupo}>
            <Text style={[s.horario, { color: color.texto }]}>{g.ocurrencia.hora}</Text>
            {g.programaciones.map((p) => {
              const a = repo.obtener(p.alumnoId);
              if (!a) return null;
              return (
                <ScheduledStudentRow
                  key={p.id}
                  alumno={a}
                  programacionId={p.id}
                  enAbrirFicha={(id) => {
                    agenda.setOrigen({ vista: agenda.modo === 'mes' ? 'mes' : 'semana', fecha: agenda.fecha });
                    router.push(`/ficha/${id}`);
                  }}
                  enRetirar={(id) => {
                    const r = repo.retirar(id);
                    if (!r.ok) {
                      // Error explícito; no se afirma que se retiró.
                      console.warn('No se pudo retirar:', r.error.codigo);
                    }
                    refrescar();
                  }}
                />
              );
            })}
            {g.programaciones.length === 0 && (
              <Text style={[s.vacioGrupo, { color: color.textoSuave }]}>
                Nadie programado para esta clase
              </Text>
            )}
          </View>
        ))}
        <Text style={[s.legal, { color: color.textoSuave }]}>
          Retirar solo quita la programación: no borra fichas, ni confirma asistencia, ni cambia pagos.
        </Text>
      </ScrollView>
      <ScheduleFAB
        fecha={f}
        enAgendar={() => {
          agenda.setOrigen({ vista: agenda.modo === 'mes' ? 'mes' : 'semana', fecha: agenda.fecha });
          router.push(`/agendar/${f}`);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 12, paddingBottom: 96 },
  titulo: { fontSize: 22, fontWeight: '800' },
  subtitulo: { fontSize: 14 },
  vacio: { fontSize: 14 },
  grupo: { gap: 6 },
  horario: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  vacioGrupo: { fontSize: 13 },
  legal: { fontSize: 12, marginTop: 8 },
});
