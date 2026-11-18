import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTemaAgenda } from '../tema';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';
import type { Alumno } from '../../../packages/datos/src/tipos';

/** Fila de alumno programado en Día, hacia ficha/retirar con confirmación. */
export function ScheduledStudentRow({
  alumno,
  programacionId,
  hora,
  enAbrirFicha,
  enRetirar,
}: {
  alumno: Alumno;
  programacionId: string;
  hora?: string;
  enAbrirFicha: (id: string) => void;
  enRetirar: (programacionId: string) => void;
}) {
  const { color } = usarTemaAgenda();
  const [retirando, setRetirando] = useState(false);

  const confirmarRetiro = () => {
    Alert.alert(
      'Retirar programación',
      `Se retira solo la programación de ${alumno.nombre}. No se borra su ficha ni cambia ningún pago.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar',
          style: 'destructive',
          onPress: () => {
            setRetirando(true);
            enRetirar(programacionId);
          },
        },
      ],
    );
  };

  return (
    <View style={[s.fila, { backgroundColor: color.superficie, borderColor: color.borde }]}>
      <AvatarInitials nombre={alumno.nombre} />
      <View style={s.info}>
        <Text style={[s.nombre, { color: color.texto }]}>{alumno.nombre}</Text>
        <View style={s.meta}>
          <ModalityBadge modalidad={alumno.modalidad} />
          {hora ? <Text style={[s.hora, { color: color.textoSuave }]}>{hora}</Text> : null}
        </View>
      </View>
      <View style={s.acciones}>
        <Pressable
          onPress={() => enAbrirFicha(alumno.id)}
          accessibilityLabel={`Abrir ficha de ${alumno.nombre}`}
          style={s.boton}
        >
          <Text style={[s.accion, { color: color.acento }]}>Ficha</Text>
        </Pressable>
        <Pressable
          onPress={confirmarRetiro}
          disabled={retirando}
          accessibilityLabel={`Retirar programación de ${alumno.nombre}`}
          style={s.boton}
        >
          <Text style={[s.accion, { color: color.textoSuave }]} disabled={retirando}>
            Retirar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    minHeight: 64,
  },
  info: { flex: 1, gap: 4 },
  nombre: { fontSize: 16, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hora: { fontSize: 13 },
  acciones: { flexDirection: 'row', gap: 4 },
  boton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  accion: { fontSize: 14, fontWeight: '600' },
});
