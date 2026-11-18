import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { usarTema } from '../../../../packages/ui/src/tema';
import { Icono, type NombreIcono } from '../../../../packages/ui/src/components/Icono';

/** Etiqueta de barra: completa incluso a texto 200 % (REV-VIS-01), sin truncar. */
function Etiqueta({ texto, color }: { texto: string; color: string }) {
  return <Text style={[s.etiqueta, { color }]}>{texto}</Text>;
}

const s = StyleSheet.create({
  etiqueta: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});

/** Cinco destinos: Hoy · Alumnos · Agenda · Cobros · Más (I1). SVG propio, sin emoji. */
export default function Pestañas() {
  const { color, oscuro } = usarTema();
  const etiqueta = (texto: string) => ({ color: tinta }: { color: unknown }) => (
    <Etiqueta texto={texto} color={String(tinta ?? color.textoSuave)} />
  );
  const icono = (nombre: NombreIcono) => ({ color: tinta }: { color: unknown }) => (
    <Icono nombre={nombre} color={String(tinta ?? color.textoSuave)} tamaño={22} />
  );
  // AA: en oscuro la etiqueta activa pinta sobre color.superficie (#17292B);
  // el acento #0E7C7B da 3.02:1. Se usa el acento fuerte del tema (mismo
  // criterio que el aviso de Hoy); en claro se conserva el acento.
  const tintaActiva = oscuro ? color.acentoFuerte : color.acento;
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: tintaActiva,
      tabBarInactiveTintColor: color.textoSuave,
      tabBarStyle: { backgroundColor: color.superficie, borderTopColor: color.borde },
      headerStyle: { backgroundColor: color.superficie },
      headerTintColor: color.texto,
    }}>
      <Tabs.Screen
        name="hoy"
        options={{
          title: 'Hoy',
          tabBarLabel: etiqueta('Hoy'),
          tabBarIcon: icono('sol'),
        }}
      />
      <Tabs.Screen
        name="alumnos"
        options={{
          title: 'Alumnos',
          tabBarLabel: etiqueta('Alumnos'),
          tabBarIcon: icono('alumnos'),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          headerShown: false,
          tabBarLabel: etiqueta('Agenda'),
          tabBarIcon: icono('agenda'),
        }}
      />
      <Tabs.Screen
        name="cobros"
        options={{
          title: 'Cobros',
          tabBarLabel: etiqueta('Cobros'),
          tabBarIcon: icono('cobros'),
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarLabel: etiqueta('Más'),
          tabBarIcon: icono('mas'),
        }}
      />
    </Tabs>
  );
}
