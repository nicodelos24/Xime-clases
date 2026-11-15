import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTema } from '../tema/tema';
import type { ActividadDia } from '../datos/logica';
import { MODALIDAD_COLOR } from '../tema/tokens';

/**
 * Celda del Mes ENC-13:
 * - Sin borde ni fondo de celda.
 * - Hoy: círculo sólido de acento detrás del número.
 * - Día seleccionado: círculo suave (semitransparente) detrás del número.
 * - Punto violeta = mensual, rombo azul = individual.
 * - Sin contador, sin nombres, sin vencimientos.
 */
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
  const pal = MODALIDAD_COLOR[oscuro ? 'oscuro' : 'claro'];
  const tieneMensual = actividad?.tieneMensual ?? false;
  const tieneIndividual = actividad?.tieneIndividual ?? false;
  const personas = actividad?.personas ?? 0;

  // Etiqueta accesible completa
  const dia = Number(fecha.slice(8));
  const modalLabel =
    tieneMensual && tieneIndividual
      ? ', mensual e individual'
      : tieneMensual
        ? ', mensual'
        : tieneIndividual
          ? ', individual'
          : '';
  const accLabel =
    `Día ${dia}` +
    (esHoy ? ', Hoy' : '') +
    (seleccionada && !esHoy ? ', seleccionado' : '') +
    (personas > 0
      ? `, ${personas} alumno${personas === 1 ? '' : 's'} programado${personas === 1 ? '' : 's'}${modalLabel}`
      : ', sin alumnos agendados');

  const alto = Math.max(48, Math.min(60, ancho));

  return (
    <Pressable
      onPress={enTocar}
      accessibilityRole="button"
      accessibilityLabel={accLabel}
      accessibilityState={{ selected: seleccionada }}
      style={[s.celda, { width: ancho, height: alto }]}
    >
      {/* Círculo de Hoy o selección */}
      {(esHoy || seleccionada) && (
        <View
          style={[
            s.circulo,
            esHoy
              ? { backgroundColor: color.acento }
              : { backgroundColor: color.acento + '33' },
          ]}
        />
      )}
      <Text
        style={[
          s.num,
          { color: enOtroMes ? color.textoSuave : color.texto },
          esHoy && { color: color.sobreAcento },
        ]}
      >
        {dia}
      </Text>
      {/* Marcadores de modalidad: punto y/o rombo debajo del número */}
      <View style={s.marcas} accessibilityElementsHidden>
        {tieneMensual && (
          <View
            style={[s.punto, { backgroundColor: pal.mensual.texto }]}
            accessibilityLabel="mensual"
          />
        )}
        {tieneIndividual && (
          <View
            style={[s.rombo, { backgroundColor: pal.individual.texto }]}
            accessibilityLabel="individual"
          />
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
    // Sin borderWidth ni backgroundColor: grilla limpia.
  },
  circulo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  num: { fontSize: 15, fontWeight: '600', zIndex: 1 },
  marcas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 8,
    zIndex: 1,
  },
  punto: { width: 6, height: 6, borderRadius: 3 },
  rombo: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
});
