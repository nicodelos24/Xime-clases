import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usarTemaAgenda } from '../tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { actividadPorDia } from '../../../packages/datos/src/logica';
import {
  DIAS_LUNES,
  etiquetaMes,
  aFecha,
  deFecha,
  diasDelMes,
  diaSemanaIndex,
} from '../../../packages/datos/src/fechas';
import { MonthDayCell } from '../components/MonthDayCell';
import { MODALIDAD_AGENDA } from '../tema';
import { ScheduleFAB } from '../components/ScheduleFAB';
import { Icono } from '../../../packages/ui/src/components/Icono';

const HOY = '2026-11-15';

/**
 * Agenda ENC-13: Mes compacto por defecto.
 * Tocar cualquier fecha abre Día expandido por horas.
 * Cuadrícula 7 columnas sin bordes/fondos individuales, solo números y marcadores.
 */
export default function Agenda() {
  const { color, oscuro } = usarTemaAgenda();
  const { repo, agenda } = usarSesion();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fecha = agenda.fecha;

  const actividad = useMemo(
    () => actividadPorDia(repo.programaciones, repo.ocurrencias, repo.alumnos),
    [repo, agenda.version],
  );

  const { anio, mes } = deFecha(fecha);
  const primerDia = aFecha(anio, mes, 1);
  const desplaz = diaSemanaIndex(primerDia);
  const anchoDisponible = width - 32; // padding horizontal 16×2
  const anchoCelda = Math.floor(anchoDisponible / 7);
  const cuadricula = anchoCelda >= 44;
  const pal = MODALIDAD_AGENDA[oscuro ? 'oscuro' : 'claro'];

  const cambiarMes = (n: number) => {
    const { dia } = deFecha(fecha);
    const nm = mes + n;
    const na = anio + Math.floor((nm - 1) / 12);
    const nmf = ((nm - 1 + 12) % 12) + 1;
    agenda.setFecha(aFecha(na, nmf, Math.min(dia, diasDelMes(na, nmf))));
  };

  const abrirDia = (f: string) => {
    agenda.setOrigen({ vista: 'mes', fecha: f });
    agenda.setFecha(f);
    router.push(`/dia/${f}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      {/* Cabecera: mes, navegación y Hoy */}
      <View style={s.cabecera}>
        <Text style={[s.titulo, { color: color.texto }]}>Agenda</Text>
        <Pressable
          onPress={() => agenda.setFecha(HOY)}
          accessibilityRole="button"
          accessibilityLabel="Ir a hoy"
          style={[s.hoyBtn, { borderColor: color.borde }]}
        >
          <Text style={[s.hoyTexto, { color: color.acento }]}>Hoy</Text>
        </Pressable>
      </View>
      <View style={s.mesNav}>
        <Pressable
          onPress={() => cambiarMes(-1)}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          style={s.navBtn}
        >
          <Icono nombre="chevronIzq" color={color.texto} tamaño={18} />
        </Pressable>
        <Text style={[s.mesTexto, { color: color.texto }]}>
          {etiquetaMes(anio, mes)}
        </Text>
        <Pressable
          onPress={() => cambiarMes(1)}
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          style={s.navBtn}
        >
          <Icono nombre="chevronDer" color={color.texto} tamaño={18} />
        </Pressable>
      </View>

      {cuadricula ? (
        <ScrollView contentContainerStyle={s.cont}>
          <View style={s.grilla}>
            {DIAS_LUNES.map((d) => (
              <Text
                key={d}
                style={[s.diaSemana, { width: anchoCelda, color: color.textoSuave }]}
              >
                {d.slice(0, 2).toUpperCase()}
              </Text>
            ))}
            {Array.from({ length: desplaz }, (_, i) => (
              <View key={`v${i}`} style={{ width: anchoCelda, height: Math.max(48, anchoCelda) }} />
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
                  enTocar={() => abrirDia(f)}
                />
              );
            })}
          </View>
          <View style={s.leyenda}>
            <View style={s.leyendaItem}>
              <View style={[s.punto, { backgroundColor: pal.mensual.texto }]} />
              <Text style={[s.leyendaTexto, { color: color.textoSuave }]}>Mensual</Text>
            </View>
            <View style={s.leyendaItem}>
              <View style={[s.rombo, { backgroundColor: pal.individual.texto }]} />
              <Text style={[s.leyendaTexto, { color: color.textoSuave }]}>Por clase individual</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* Fallback lineal si 7×44 no caben: conserva objetivos táctiles. */
        <ScrollView contentContainerStyle={s.cont}>
          <Text style={[s.nota, { color: color.textoSuave }]}>Días del mes</Text>
          {Array.from({ length: diasDelMes(anio, mes) }, (_, i) => {
            const f = aFecha(anio, mes, i + 1);
            const act = actividad.get(f);
            return (
              <Pressable
                key={f}
                onPress={() => abrirDia(f)}
                accessibilityRole="button"
                accessibilityLabel={`${i + 1} de ${etiquetaMes(anio, mes)}, ${act?.personas ?? 0} alumno${act?.personas === 1 ? '' : 's'} agendado${act?.personas === 1 ? '' : 's'}`}
                style={[s.linea, { borderColor: color.borde }]}
              >
                <Text style={[s.lineaFecha, { color: f === fecha ? color.acento : color.texto }]}>
                  {i + 1} {etiquetaMes(anio, mes).split(' ')[0].slice(0, 3)}
                </Text>
                <View style={s.marcasLineales}>
                  {act?.tieneMensual && <View style={[s.punto, { backgroundColor: pal.mensual.texto }]} />}
                  {act?.tieneIndividual && <View style={[s.rombo, { backgroundColor: pal.individual.texto }]} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <ScheduleFAB
        fecha={fecha}
        enAgendar={() => {
          agenda.setOrigen({ vista: 'mes', fecha });
          router.push(`/agendar/${fecha}`);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titulo: { fontSize: 24, fontWeight: '800' },
  hoyBtn: {
    minWidth: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  hoyTexto: { fontSize: 14, fontWeight: '700' },
  mesNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  navBtn: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  mesTexto: { fontSize: 17, fontWeight: '700', textTransform: 'capitalize' },
  cont: { paddingHorizontal: 16, paddingBottom: 96 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  diaSemana: { textAlign: 'center', fontSize: 12, fontWeight: '700', paddingVertical: 8 },
  leyenda: { flexDirection: 'row', gap: 20, alignItems: 'center', marginTop: 16, paddingHorizontal: 8 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaTexto: { fontSize: 12 },
  punto: { width: 6, height: 6, borderRadius: 3 },
  rombo: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
  nota: { fontSize: 13, marginBottom: 8 },
  linea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  lineaFecha: { fontSize: 15, fontWeight: '600' },
  marcasLineales: { flexDirection: 'row', gap: 4 },
});
