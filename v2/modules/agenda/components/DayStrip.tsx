import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTemaAgenda } from '../tema';
import type { ActividadDia } from '../../../packages/datos/src/logica';
import { etiquetaFechaLarga } from '../../../packages/datos/src/fechas';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Cabecera compacta Semana/Mes + rango y navegación anterior/Hoy/siguiente. */
export function DayStrip({
  modo,
  rango,
  enCambiarModo,
  enAnterior,
  enHoy,
  enSiguiente,
}: {
  modo: 'semana' | 'mes';
  rango: string;
  enCambiarModo: (m: 'semana' | 'mes') => void;
  enAnterior: () => void;
  enHoy: () => void;
  enSiguiente: () => void;
}) {
  const { color } = usarTemaAgenda();
  return (
    <View style={s.fila}>
      <View style={s.segmento} accessibilityRole="tablist">
        {(['semana', 'mes'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => enCambiarModo(m)}
            accessibilityRole="tab"
            accessibilityState={{ selected: modo === m }}
            style={[s.seg, modo === m && { backgroundColor: color.acento }]}
          >
            <Text
              style={[
                s.segTexto,
                modo === m && { color: color.sobreAcento },
              ]}
            >
              {m === 'semana' ? 'Semana' : 'Mes'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.rango, { color: color.texto }]}>{rango}</Text>
      <View style={s.nav}>
        <Pressable onPress={enAnterior} accessibilityLabel="Período anterior" style={s.boton}>
          <Text style={[s.flecha, { color: color.texto }]}>‹</Text>
        </Pressable>
        <Pressable onPress={enHoy} accessibilityLabel="Ir a hoy" style={s.boton}>
          <Text style={[s.hoyTexto, { color: color.acento }]}>Hoy</Text>
        </Pressable>
        <Pressable onPress={enSiguiente} accessibilityLabel="Período siguiente" style={s.boton}>
          <Text style={[s.flecha, { color: color.texto }]}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Franja de un día de la Semana: fecha prominente, vacío en una línea o chips. */
export function DayStripItem({
  fecha,
  diaSemana,
  actividades,
  nombres,
  esHoy,
  enAbrir,
}: {
  fecha: string;
  diaSemana: string;
  actividades: ActividadDia | undefined;
  nombres: string[];
  esHoy: boolean;
  enAbrir: () => void;
}) {
  const { color, modalidad } = usarTemaAgenda();
  const ocupado = (actividades?.personas ?? 0) > 0;
  return (
    <Pressable
      onPress={enAbrir}
      accessibilityRole="button"
      accessibilityLabel={`${etiquetaFechaLarga(fecha)}, ${
        ocupado
          ? `${actividades?.personas} ${
              actividades?.personas === 1 ? 'persona' : 'personas'
            } programada${actividades?.personas === 1 ? '' : 's'}`
          : 'sin personas programadas'
      }`}
      style={[
        s.franja,
        { borderColor: color.borde, backgroundColor: color.superficie },
        esHoy && { borderColor: color.acento, borderWidth: 2 },
      ]}
    >
      <View style={s.fechaCol}>
        <Text style={[s.diaSemana, { color: color.textoSuave }]}>{diaSemana}</Text>
        <Text style={[s.diaNum, { color: color.texto }]}>{fecha.slice(8)}</Text>
      </View>
      <View style={s.infoCol}>
        {!ocupado ? (
          <Text style={[s.vacio, { color: color.textoSuave }]}>Sin programación</Text>
        ) : (
          <>
            <View style={s.chips}>
              {nombres.slice(0, 2).map((n) => (
                <View key={n} style={s.chip}>
                  <Text style={s.chipInicial}>{n.charAt(0)}</Text>
                  <Text numberOfLines={1} style={[s.chipNombre, { color: color.texto }]}>{n}</Text>
                </View>
              ))}
              {nombres.length > 2 && (
                <Text style={[s.mas, { color: color.textoSuave }]}>+{nombres.length - 2}</Text>
              )}
            </View>
            <Text style={[s.conteo, { color: color.textoSuave }]}>
              {actividades?.programaciones}{' '}
              {actividades?.programaciones === 1 ? 'programación' : 'programaciones'}
              {modalidad && actividades?.tieneIndividual && ' · incluye individual'}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmento: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4DCE8',
    overflow: 'hidden',
  },
  seg: { paddingHorizontal: 14, paddingVertical: 8, minWidth: 44, alignItems: 'center' },
  segTexto: { fontSize: 14, fontWeight: '600', color: '#6E6478' },
  rango: { flex: 1, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  nav: { flexDirection: 'row' },
  boton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  flecha: { fontSize: 22 },
  hoyTexto: { fontSize: 14, fontWeight: '700' },
  franja: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 10,
    minHeight: 64,
  },
  fechaCol: { width: 44, alignItems: 'center', justifyContent: 'center' },
  diaSemana: { fontSize: 11, fontWeight: '600' },
  diaNum: { fontSize: 20, fontWeight: '700' },
  infoCol: { flex: 1, marginLeft: 8, justifyContent: 'center', gap: 4 },
  vacio: { fontSize: 14 },
  chips: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4DCE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipInicial: { fontSize: 12, fontWeight: '700', color: '#7A2F8C' },
  chipNombre: { fontSize: 13 },
  mas: { fontSize: 12, fontWeight: '600' },
  conteo: { fontSize: 12 },
});

export { DIAS };
