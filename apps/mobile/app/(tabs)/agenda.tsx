import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '../../src/tema/tema';
import { usarSesion } from '../../src/datos/sesion';
import { actividadPorDia, personasUnicasDelDia } from '../../src/datos/logica';
import {
  DIAS_LUNES,
  etiquetaFechaLarga,
  etiquetaMes,
  lunesDe,
  sumarDias,
  aFecha,
  deFecha,
  diasDelMes,
  diaSemanaIndex,
} from '../../src/datos/fechas';
import { DayStrip, DayStripItem } from '../../src/componentes/DayStrip';
import { MonthDayCell } from '../../src/componentes/MonthDayCell';

const HOY = '2026-11-15';

/** Agenda: Semana como calendario escaneable de personas; Mes como cuadrícula. */
export default function Agenda() {
  const { color } = usarTema();
  const { repo, agenda } = usarSesion();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fecha = agenda.fecha;
  const modo = agenda.modo;

  const actividad = useMemo(
    () => actividadPorDia(repo.programaciones, repo.ocurrencias, repo.alumnos),
    [repo, agenda.version],
  );

  // Semana: lunes de la semana de `fecha`.
  const lunes = lunesDe(fecha);
  const diasSemana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const rango = `${lunes.slice(8)}/${lunes.slice(5, 7)} – ${sumarDias(lunes, 6).slice(8)}/${sumarDias(lunes, 6).slice(5, 7)}`;

  // Mes: cuadrícula solo si cada celda mide ≥44 px de ancho; si no, lista lineal.
  const { anio, mes } = deFecha(fecha);
  const primerDia = aFecha(anio, mes, 1);
  const desplaz = diaSemanaIndex(primerDia);
  const celdas = diasDelMes(anio, mes) + desplaz;
  const anchoCelda = Math.floor((width - 32) / 7);
  const cuadricula = anchoCelda >= 44;

  const cambiar = (n: number) => {
    if (modo === 'semana') agenda.setFecha(sumarDias(fecha, n));
    else {
      const { anio, mes, dia } = deFecha(fecha);
      const nm = mes + n;
      const na = anio + Math.floor((nm - 1) / 12);
      const nmf = ((nm - 1 + 12) % 12) + 1;
      agenda.setFecha(aFecha(na, nmf, Math.min(dia, diasDelMes(na, nmf))));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <DayStrip
        modo={modo}
        rango={modo === 'semana' ? rango : etiquetaMes(anio, mes)}
        enCambiarModo={agenda.setModo}
        enAnterior={() => cambiar(-1)}
        enHoy={() => agenda.setFecha(HOY)}
        enSiguiente={() => cambiar(1)}
      />
      {modo === 'semana' ? (
        <ScrollView contentContainerStyle={s.cont}>
          {diasSemana.map((d, i) => (
            <DayStripItem
              key={d}
              fecha={d}
              diaSemana={DIAS_LUNES[i]}
              actividades={actividad.get(d)}
              nombres={nombresDe(repo, d)}
              esHoy={d === HOY}
              enAbrir={() => {
                agenda.setOrigen({ vista: 'semana', fecha });
                agenda.setFecha(d);
                router.push(`/dia/${d}`);
              }}
            />
          ))}
        </ScrollView>
      ) : cuadricula ? (
        <ScrollView contentContainerStyle={s.cont}>
          <View style={s.grilla}>
            {DIAS_LUNES.map((d) => (
              <Text key={d} style={[s.legenda, { color: color.textoSuave }]}>
                {d.charAt(0).toUpperCase()}
              </Text>
            ))}
            {Array.from({ length: desplaz }, (_, i) => (
              <View key={`v${i}`} style={{ width: anchoCelda, height: Math.max(44, anchoCelda) }} />
            ))}
            {Array.from({ length: diasDelMes(anio, mes) }, (_, i) => {
              const f = aFecha(anio, mes, i + 1);
              return (
                <MonthDayCell
                  key={f}
                  fecha={f}
                  esHoy={f === HOY}
                  seleccionada={f === fecha}
                  actividad={actividad.get(f)}
                  ancho={anchoCelda}
                  enTocar={() => agenda.setFecha(f)}
                />
              );
            })}
          </View>
          <ResumenDia fecha={fecha} repo={repo} enVerDia={() => {
            agenda.setOrigen({ vista: 'mes', fecha });
            router.push(`/dia/${fecha}`);
          }} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.cont}>
          <Text style={[s.nota, { color: color.textoSuave }]}>
            Pantalla angosta: lista lineal del mes (sin cuadrícula).
          </Text>
          <ResumenDia fecha={fecha} repo={repo} enVerDia={() => {
            agenda.setOrigen({ vista: 'mes', fecha });
            router.push(`/dia/${fecha}`);
          }} />
          {Array.from({ length: diasDelMes(anio, mes) }, (_, i) => {
            const f = aFecha(anio, mes, i + 1);
            const act = actividad.get(f);
            return (
              <Pressable
                key={f}
                onPress={() => agenda.setFecha(f)}
                accessibilityRole="button"
                style={[s.linea, { borderColor: color.borde }]}
              >
                <Text style={[s.lineaFecha, { color: f === fecha ? color.acento : color.texto }]}>
                  {i + 1} {etiquetaMes(anio, mes).split(' ')[0].slice(0, 3)}
                </Text>
                <Text style={[s.lineaInfo, { color: color.textoSuave }]}>
                  {act && act.personas > 0
                    ? `${act.personas} persona${act.personas === 1 ? '' : 's'}`
                    : 'Sin programación'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function nombresDe(
  repo: ReturnType<typeof usarSesion>['repo'],
  f: string,
): string[] {
  const progs = repo.programacionesActivas(f);
  const vistos: string[] = [];
  for (const p of progs) {
    const a = repo.obtener(p.alumnoId);
    if (a && !vistos.includes(a.nombre)) vistos.push(a.nombre);
  }
  return vistos;
}

function ResumenDia({
  fecha,
  repo,
  enVerDia,
}: {
  fecha: string;
  repo: ReturnType<typeof usarSesion>['repo'];
  enVerDia: () => void;
}) {
  const { color } = usarTema();
  const personas = personasUnicasDelDia(
    repo.programacionesActivas(fecha),
    repo.ocurrenciasDe(fecha),
    fecha,
  ).size;
  return (
    <View style={[s.tarjeta, { backgroundColor: color.superficie, borderColor: color.borde }]}>
      <Text style={[s.resumenTitulo, { color: color.texto }]}>
        {etiquetaFechaLarga(fecha)}
      </Text>
      <Text style={[s.resumenInfo, { color: color.textoSuave }]}>
        {personas > 0
          ? `${personas} persona${personas === 1 ? '' : 's'} programada${personas === 1 ? '' : 's'}`
          : 'Día sin programación'}
      </Text>
      <Pressable
        onPress={enVerDia}
        accessibilityRole="button"
        accessibilityLabel={`Ver el día ${fecha}`}
        style={[s.verDia, { backgroundColor: color.acento }]}
      >
        <Text style={{ color: color.sobreAcento, fontWeight: '700' }}>Ver día</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 10, paddingBottom: 40 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  legenda: { width: 40, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  nota: { fontSize: 13 },
  tarjeta: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 8,
  },
  resumenTitulo: { fontSize: 16, fontWeight: '700' },
  resumenInfo: { fontSize: 14 },
  verDia: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  linea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  lineaFecha: { fontSize: 15, fontWeight: '600' },
  lineaInfo: { fontSize: 14 },
});
