/**
 * Detalle de programación ENC-13.
 * Punto de entrada cuando se toca un bloque en la vista Día.
 * No escribe nada por apertura; muestra Editar (placeholder I1) y Retirar con confirmación.
 */
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usarTema } from '../../src/tema/tema';
import { usarSesion } from '../../src/datos/sesion';
import { AvatarInitials } from '../../src/componentes/AvatarInitials';
import { ModalityBadge } from '../../src/componentes/ModalityBadge';
import { etiquetaFechaLarga } from '../../src/datos/fechas';

export default function DetalleProgramacion() {
  const { color } = usarTema();
  const { repo, agenda, refrescar } = usarSesion();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [editando, setEditando] = useState(false);
  const [fechaNueva, setFechaNueva] = useState<string | undefined>(undefined);
  const [horaNueva, setHoraNueva] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const prog = repo.programaciones.find(p => p.id === id);
  const alumno = prog ? repo.obtener(prog.alumnoId) : undefined;
  const ocurrencia = prog ? repo.ocurrencias.find(o => o.id === prog.ocurrenciaId) : undefined;

  if (!prog || !alumno || !ocurrencia) {
    return (
      <View style={[s.cont, { backgroundColor: color.fondo }]}>
        <Text style={[s.error, { color: color.textoSuave }]}>Programación no encontrada.</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={s.btn}>
          <Text style={{ color: color.acento, fontWeight: '700' }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const confirmarRetiro = () => {
    const mensaje = `Se retira la programación de ${alumno.nombre} para el ${ocurrencia.fecha}. No se borra la ficha ni cambia ningún pago.`;
    const retirar = () => {
      const r = repo.retirar(prog.id);
      if (r.ok) { refrescar(); router.back(); }
    };
    // Alert.alert no abre diálogo en React Native Web; confirm sí exige decisión explícita.
    if (Platform.OS === 'web') {
      if (window.confirm(`Retirar programación\n${mensaje}`)) retirar();
    } else {
      Alert.alert('Retirar programación', mensaje, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Retirar', style: 'destructive', onPress: retirar },
      ]);
    }
  };

  return (
    <View style={[s.cont, { backgroundColor: color.fondo }]}>
      <View style={[s.card, { backgroundColor: color.superficie, borderColor: color.borde }]}>
        <AvatarInitials nombre={alumno.nombre} tamaño={48} />
        <Text style={[s.nombre, { color: color.texto }]}>{alumno.nombre}</Text>
        <ModalityBadge modalidad={alumno.modalidad} />
        <Text style={[s.fecha, { color: color.textoSuave }]}>
          {etiquetaFechaLarga(ocurrencia.fecha)}
        </Text>
        <Text style={[s.hora, { color: color.texto }]}>{ocurrencia.hora}</Text>
      </View>
      {editando && (
        <View style={s.campos}>
          <Text style={{ color: color.texto }}>Fecha (AAAA-MM-DD)</Text>
          <TextInput value={fechaNueva ?? ocurrencia.fecha} onChangeText={setFechaNueva}
            accessibilityLabel="Nueva fecha" style={[s.input, { color: color.texto, borderColor: color.borde }]} />
          <Text style={{ color: color.texto }}>Hora de inicio (HH:mm)</Text>
          <TextInput value={horaNueva ?? ocurrencia.hora} onChangeText={setHoraNueva}
            accessibilityLabel="Nueva hora de inicio" style={[s.input, { color: color.texto, borderColor: color.borde }]} />
          {error && <Text accessibilityRole="alert" style={{ color: color.acento }}>{error}</Text>}
        </View>
      )}
      <Pressable
        onPress={() => {
          if (!editando) { setEditando(true); return; }
          const f = fechaNueva ?? ocurrencia.fecha;
          const r = repo.reprogramar(prog.id, f, horaNueva ?? ocurrencia.hora);
          if (!r.ok) { setError(r.error.mensaje); return; }
          refrescar();
          agenda.setFecha(f);
          router.replace(`/dia/${f}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${editando ? 'Confirmar cambios de' : 'Editar'} programación de ${alumno.nombre}`}
        style={[s.btnPrimario, { backgroundColor: color.acento }]}
      >
        <Text style={{ color: color.sobreAcento, fontWeight: '700', fontSize: 16 }}>
          {editando ? 'Confirmar cambios' : 'Editar'}
        </Text>
      </Pressable>
      <Pressable
        onPress={confirmarRetiro}
        accessibilityRole="button"
        accessibilityLabel={`Retirar programación de ${alumno.nombre}`}
        style={[s.btnSecundario, { borderColor: color.borde }]}
      >
        <Text style={[s.btnSecTexto, { color: color.textoSuave }]}>Retirar programación</Text>
      </Pressable>
      <Text style={[s.legal, { color: color.textoSuave }]}>
        Retirar solo quita la programación. No borra la ficha, no cambia pagos.
      </Text>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={s.btn}>
        <Text style={{ color: color.acento, fontWeight: '600' }}>Volver</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { flex: 1, padding: 20, gap: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  nombre: { fontSize: 20, fontWeight: '700' },
  fecha: { fontSize: 14 },
  hora: { fontSize: 18, fontWeight: '700' },
  btnPrimario: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnSecundario: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnSecTexto: { fontSize: 15, fontWeight: '600' },
  btn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  legal: { fontSize: 12, textAlign: 'center' },
  error: { fontSize: 16, textAlign: 'center' },
  campos: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, minHeight: 48, fontSize: 15 },
});
