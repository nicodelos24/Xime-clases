import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTema } from '../tema/tema';
import type { ActividadDia } from '../datos/logica';
import { MODALIDAD_COLOR } from '../tema/tokens';

/** Celda del Mes: punto violeta mensual, rombo azul individual, personas únicas si cabe. */
export function MonthDayCell({
  fecha,
  enOtroMes,
  esHoy,
  seleccionada,
  actividad,
  ancho,
  enTocar,
}: {
  fecha: string;
  enOtroMes?: boolean;
  esHoy: boolean;
  seleccionada: boolean;
  actividad: ActividadDia | undefined;
  ancho: number;
  enTocar: () => void;
}) {
  const { color, oscuro } = usarTema();
  const ocupado = (actividad?.personas ?? 0) > 0;
  const celda: string[] = [];
  if (actividad?.tieneMensual) {
    celda.push(MODALIDAD_COLOR[oscuro ? 'oscuro' : 'claro'].mensual.texto);
  }
  if (actividad?.tieneIndividual) {
    celda.push(MODALIDAD_COLOR[oscuro ? 'oscuro' : 'claro'].individual.texto);
  }
  return (
    <Pressable
      onPress={enTocar}
      accessibilityRole="button"
      accessibilityLabel={
        `Día ${fecha.slice(8)}, ` +
        (ocupado
          ? `${actividad?.personas} persona${actividad?.personas === 1 ? '' : 's'} programada${actividad?.personas === 1 ? '' : 's'}`
          : 'sin programación')
      }
      accessibilityState={{ selected: seleccionada }}
      style={[
        s.celda,
        {
          width: ancho,
          height: Math.max(44, Math.min(56, ancho)),
          borderColor: color.borde,
        },
        seleccionada && { borderColor: color.acento, borderWidth: 2 },
      ]}
    >
      <Text
        style={[
          s.num,
          { color: enOtroMes ? color.textoSuave : color.texto },
          esHoy && { color: color.acento, fontWeight: '800' },
        ]}
      >
        {fecha.slice(8)}
      </Text>
      <View style={s.marcas}>
        {celda.map((c, i) => (
          <View
            key={i}
            style={[
              i === 1 ? s.rombo : s.punto,
              { backgroundColor: c },
            ]}
          />
        ))}
        {ocupado && (actividad?.personas ?? 0) <= 9 && (
          <Text style={[s.total, { color: color.textoSuave }]}>
            {actividad?.personas}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  celda: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
  },
  num: { fontSize: 14, fontWeight: '600' },
  marcas: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  punto: { width: 7, height: 7, borderRadius: 4 },
  rombo: { width: 7, height: 7, transform: [{ rotate: '45deg' }] },
  total: { fontSize: 10, fontWeight: '600', marginLeft: 2 },
});
