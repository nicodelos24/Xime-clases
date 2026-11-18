/**
 * Alumnos — lista Aurora (referencia exacta: v2/diseno/capturas/a-alumnos.png).
 * Header con título + FAB «+» (recuadrado en I1, sin alta real), buscador con
 * lupa SVG, chips de filtro, tarjetas con avatar en tint de modalidad, acento
 * lateral y chevron.
 * I1: sin estados de pago (entran con I2); el toque de la ficha ya está cableado.
 * La búsqueda es cliente y acento-insensible; filtro y orden independientes.
 */

import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '../../../packages/ui/src/tema';
import { AURORA, MODALIDAD_COLOR } from '../../../packages/ui/src/tokens';
import { usarSesion } from '../../../packages/datos/src/sesion';
import type { FiltroAlumnos, OrdenAlumnos } from '../../../packages/datos/src/tipos';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';
import { Icono } from '../../../packages/ui/src/components/Icono';
import {
  FILTROS_ALUMNOS,
  ETIQUETA_FILTRO,
  coincideBusqueda,
  type FiltroAlumnosV2,
} from './filtrosAlumnos';

const ORDENES: OrdenAlumnos[] = ['recientes', 'mensual-primero', 'individual-primero'];
const ETIQUETA_ORDEN: Record<OrdenAlumnos, string> = {
  recientes: 'Más recientes',
  'mensual-primero': 'Mensuales primero',
  'individual-primero': 'Por clase primero',
};

export default function Alumnos() {
  const { color, oscuro, modalidad } = usarTema();
  const { repo } = usarSesion();
  const router = useRouter();
  const [filtro, setFiltro] = useState<FiltroAlumnosV2>('todos');
  const [orden, setOrden] = useState<OrdenAlumnos>('recientes');
  const [busqueda, setBusqueda] = useState('');

  const lista = useMemo(() => {
    const base = repo.listar(filtro as FiltroAlumnos, orden);
    return busqueda.trim() ? base.filter((a) => coincideBusqueda(a.nombre, busqueda)) : base;
  }, [repo, filtro, orden, busqueda, repo.programaciones.length]);

  return (
    <View style={[s.raiz, { backgroundColor: color.fondo }]}>
      <FlatList
        data={lista}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.cont}
        ListHeaderComponent={
          <View>
            {/* Título + FAB «+» */}
            <View style={s.cabecera}>
              <View>
                <Text style={[s.titulo, { color: color.texto }]}>Alumnos</Text>
                <Text style={[s.conteo, { color: color.textoSuave }]}>
                  {lista.length} {lista.length === 1 ? 'activo' : 'activos'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Alta de alumno, disponible con persistencia real en I2"
                style={({ pressed }) => [
                  s.fab,
                  { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderColor: color.borde },
                  pressed && s.presionado,
                ]}
              >
                <Icono nombre="masAlumno" color={color.texto} tamaño={20} />
              </Pressable>
            </View>

            {/* Buscador con lupa SVG */}
            <View
              style={[
                s.buscador,
                { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderColor: color.borde },
              ]}
            >
              <Icono nombre="lupa" color={color.textoSuave} tamaño={18} />
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar alumno…"
                placeholderTextColor={color.textoSuave}
                accessibilityLabel="Buscar alumno por nombre"
                style={[s.buscadorInput, { color: color.texto }]}
                autoCorrect={false}
              />
              {busqueda.length > 0 && (
                <Pressable
                  onPress={() => setBusqueda('')}
                  accessibilityRole="button"
                  accessibilityLabel="Borrar búsqueda"
                  style={({ pressed }) => [s.limpiar, pressed && s.presionado]}
                >
                  <Icono nombre="cruz" color={color.textoSuave} tamaño={14} grosor={2.2} />
                </Pressable>
              )}
            </View>

            {/* Chips de filtro (segmentado 44px) */}
            <View style={s.chips}>
              {FILTROS_ALUMNOS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFiltro(f)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filtro === f }}
                  style={({ pressed }) => [
                    s.chip,
                    { borderColor: color.borde },
                    filtro === f && { backgroundColor: AURORA.mensual.solid, borderColor: AURORA.mensual.solid },
                    pressed && s.presionado,
                  ]}
                >
                  <Text
                    style={[
                      s.chipTexto,
                      { color: color.texto },
                      filtro === f && { color: AURORA.surface },
                    ]}
                  >
                    {ETIQUETA_FILTRO[f]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Chips de orden (independientes del filtro) */}
            <View style={s.chips}>
              {ORDENES.map((o) => (
                <Pressable
                  key={o}
                  onPress={() => setOrden(o)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: orden === o }}
                  style={({ pressed }) => [
                    s.chip,
                    { borderColor: color.borde },
                    orden === o && { backgroundColor: oscuro ? color.acentoFuerte : AURORA.individual.ink, borderColor: oscuro ? color.acentoFuerte : AURORA.individual.ink },
                    pressed && s.presionado,
                  ]}
                >
                  <Text
                    style={[
                      s.chipTexto,
                      { color: color.texto },
                      orden === o && { color: AURORA.surface },
                    ]}
                  >
                    {ETIQUETA_ORDEN[o]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const par = modalidad[item.modalidad];
          return (
            <Pressable
              onPress={() => router.push(`/ficha/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ficha de ${item.nombre}, ${item.modalidad === 'mensual' ? 'mensual' : 'por clase individual'}, alta ${item.fechaAlta}`}
              style={({ pressed }) => [
                s.fila,
                { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderLeftColor: par.texto },
                pressed && s.presionado,
              ]}
            >
              <AvatarInitials nombre={item.nombre} />
              <View style={s.info}>
                <Text style={[s.nombre, { color: color.texto }]}>{item.nombre}</Text>
                <View style={s.meta}>
                  <ModalityBadge modalidad={item.modalidad} />
                  <Text style={[s.alta, { color: color.textoSuave }]}>alta {item.fechaAlta}</Text>
                </View>
              </View>
              <Icono nombre="chevronDer" color={color.textoSuave} tamaño={18} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={[s.vacio, { color: color.textoSuave }]}>
            {busqueda.trim()
              ? `No encontramos alumnos para "${busqueda.trim()}"`
              : filtro === 'todos'
                ? 'Agregá tu primer alumno'
                : `Sin alumnos con ese filtro`}
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1 },
  cont: { padding: 16, paddingBottom: 32, gap: 10 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  titulo: { fontSize: 24, fontWeight: '800' },
  conteo: { fontSize: 13, marginTop: 2 },
  fab: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  buscador: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, minHeight: 44,
  },
  buscadorInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  limpiar: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 14,
    minHeight: 40, justifyContent: 'center',
  },
  chipTexto: { fontSize: 13, fontWeight: '600' },
  fila: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 3, borderRadius: 12, padding: 12, minHeight: 64,
    shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  info: { flex: 1, gap: 4 },
  nombre: { fontSize: 16, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alta: { fontSize: 12 },
  vacio: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  presionado: { transform: [{ scale: 0.97 }], opacity: 0.92 },
});
