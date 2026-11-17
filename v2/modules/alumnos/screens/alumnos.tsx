import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '../../../packages/ui/src/tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import type { FiltroAlumnos, OrdenAlumnos } from '../../../packages/datos/src/tipos';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';

const FILTROS: FiltroAlumnos[] = ['todos', 'mensual', 'individual'];
const ORDENES: OrdenAlumnos[] = ['recientes', 'mensual-primero', 'individual-primero'];

/** Alumnos: fichas canónicas con filtro y orden independientes (I1). */
export default function Alumnos() {
  const { color } = usarTema();
  const { repo } = usarSesion();
  const router = useRouter();
  const [filtro, setFiltro] = useState<FiltroAlumnos>('todos');
  const [orden, setOrden] = useState<OrdenAlumnos>('recientes');
  const lista = repo.listar(filtro, orden);

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <View style={s.filtros}>
        {FILTROS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFiltro(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: filtro === f }}
            style={[
              s.pill,
              { borderColor: color.borde },
              filtro === f && { backgroundColor: color.acento, borderColor: color.acento },
            ]}
          >
            <Text style={[s.pillTexto, filtro === f && { color: color.sobreAcento }]}>
              {f === 'todos' ? 'Todos' : f === 'mensual' ? 'Mensuales' : 'Por clase individual'}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.filtros}>
        {ORDENES.map((o) => (
          <Pressable
            key={o}
            onPress={() => setOrden(o)}
            accessibilityRole="button"
            accessibilityState={{ selected: orden === o }}
            style={[
              s.pill,
              { borderColor: color.borde },
              orden === o && { backgroundColor: color.acentoFuerte, borderColor: color.acentoFuerte },
            ]}
          >
            <Text style={[s.pillTexto, orden === o && { color: color.sobreAcento }]}>
              {o === 'recientes'
                ? 'Más recientes'
                : o === 'mensual-primero'
                  ? 'Mensuales primero'
                  : 'Por clase primero'}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={lista}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/ficha/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ficha de ${item.nombre}`}
            style={[s.fila, { backgroundColor: color.superficie, borderColor: color.borde }]}
          >
            <AvatarInitials nombre={item.nombre} />
            <View style={s.info}>
              <Text style={[s.nombre, { color: color.texto }]}>{item.nombre}</Text>
              <View style={s.meta}>
                <ModalityBadge modalidad={item.modalidad} />
                <Text style={[s.alta, { color: color.textoSuave }]}>
                  alta {item.fechaAlta}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, paddingBottom: 4 },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  pillTexto: { fontSize: 13, fontWeight: '600', color: '#6E6478' },
  lista: { padding: 12, gap: 8 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 64,
  },
  info: { flex: 1, gap: 4 },
  nombre: { fontSize: 16, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alta: { fontSize: 12 },
});
