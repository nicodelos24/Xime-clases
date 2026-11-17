/**
 * HourBlock — bloque de alumno en la vista Día expandida (ENC-13).
 *
 * Muestra: avatar de iniciales, nombre semibold, hora de inicio (sin fin si no existe),
 * badge de modalidad textual. Tap = editar programación (accesible). Alto mínimo 64 px.
 * Acento lateral de 3 px por modalidad. No inventar horas de fin.
 * La marca «Dada» la pone el estado de sesión compartido (Hoy la marca): solo lectura.
 */
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTemaAgenda } from '../tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { Icono } from '../../../packages/ui/src/components/Icono';
import { MODALIDAD_AGENDA } from '../tema';
import type { Alumno, Programacion } from '../../../packages/datos/src/tipos';

export function HourBlock({
  alumno,
  programacion,
  fecha,
  hora,
  horaFin,
  enEditar,
  enRetirar,
}: {
  alumno: Alumno;
  programacion: Programacion;
  fecha: string;
  hora: string;
  horaFin?: string;
  enEditar: (programacionId: string) => void;
  enRetirar: (programacionId: string) => void;
}) {
  const { color, oscuro } = usarTemaAgenda();
  const { dadas } = usarSesion();
  const pal = MODALIDAD_AGENDA[oscuro ? 'oscuro' : 'claro'];
  const par =
    alumno.modalidad === 'mensual' ? pal.mensual : pal.individual;
  const dada = dadas.ids.has(programacion.id);

  const horarioLabel = horaFin ? `${hora}–${horaFin}` : hora;
  const modalidadLabel =
    alumno.modalidad === 'mensual' ? 'Mensual' : 'Por clase individual';

  const accLabel = `Editar programación de ${alumno.nombre}, ${fecha}, ${hora}${horaFin ? '–' + horaFin : ''}, ${modalidadLabel}`;

  const confirmarRetiro = () => {
    const mensaje = `Se retira solo la programación de ${alumno.nombre}. No se borra su ficha ni cambia ningún pago.`;
    if (Platform.OS === 'web') {
      if (window.confirm(`Retirar programación\n${mensaje}`)) enRetirar(programacion.id);
    } else {
      Alert.alert('Retirar programación', mensaje, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Retirar', style: 'destructive', onPress: () => enRetirar(programacion.id) },
      ]);
    }
  };

  return (
    <Pressable
      onPress={() => enEditar(programacion.id)}
      onLongPress={confirmarRetiro}
      accessibilityRole="button"
      accessibilityLabel={accLabel}
      accessibilityHint="Toque para editar; mantenga pulsado para retirar con confirmación"
      style={[
        s.bloque,
        {
          backgroundColor: par.fondo,
          borderLeftColor: par.texto,
        },
      ]}
    >
      <AvatarInitials nombre={alumno.nombre} tamaño={36} />
      <View style={s.info}>
        <Text style={[s.nombre, { color: color.texto }]} numberOfLines={2}>
          {alumno.nombre}
        </Text>
        <View style={s.meta}>
          <Text style={[s.hora, { color: color.textoSuave }]}>
            {horarioLabel}
          </Text>
          {/* Badge textual de modalidad: nunca solo color */}
          <View style={[s.badge, { backgroundColor: par.texto + '22' }]}>
            <Text style={[s.badgeTexto, { color: par.texto }]}>
              {alumno.modalidad === 'mensual' ? 'Mensual' : 'Individual'}
            </Text>
          </View>
          {/* Marca «Dada» compartida con Hoy: texto + forma, no solo color. */}
          {dada && (
            <View
              style={[s.dada, { backgroundColor: color.acento + '26', borderColor: color.acento }]}
              accessibilityLabel={`La clase de ${alumno.nombre} ya fue dada`}
            >
              <Icono nombre="check" color={color.acento} tamaño={13} grosor={2.4} />
              <Text style={[s.dadaTexto, { color: color.acento }]}>Dada</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  bloque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 10,
    minHeight: 64,
    // Elevación 1 equivalente en RN:
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    marginBottom: 4,
  },
  info: { flex: 1, gap: 4 },
  nombre: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  hora: { fontSize: 12, lineHeight: 16 },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  dada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dadaTexto: { fontSize: 11, fontWeight: '700' },
});
