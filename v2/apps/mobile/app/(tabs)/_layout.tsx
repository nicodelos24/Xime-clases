import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { usarTema } from '../../../../packages/ui/src/tema';

function Icono({ g, nombre, color }: { g: string; nombre: string; color: string }) {
  return (
    <Text style={{ fontSize: 20, color }} accessibilityLabel={nombre}>
      {g}
    </Text>
  );
}

/** Etiqueta de barra: completa incluso a texto 200 % (REV-VIS-01), sin truncar. */
function Etiqueta({ texto, color }: { texto: string; color: string }) {
  return <Text style={[s.etiqueta, { color }]}>{texto}</Text>;
}

const s = StyleSheet.create({
  etiqueta: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});

/** Cinco destinos: Hoy · Alumnos · Agenda · Cobros · Más (I1). */
export default function Pestañas() {
  const { color } = usarTema();
  const etiqueta = (texto: string) => ({ color: tinta }: { color: unknown }) => (
    <Etiqueta texto={texto} color={String(tinta ?? color.textoSuave)} />
  );
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: color.acento,
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
          tabBarIcon: ({ color: tinta }) => <Icono color={String(tinta ?? color.textoSuave)} g="☀" nombre="Hoy" />,
        }}
      />
      <Tabs.Screen
        name="alumnos"
        options={{
          title: 'Alumnos',
          tabBarLabel: etiqueta('Alumnos'),
          tabBarIcon: ({ color: tinta }) => <Icono color={String(tinta ?? color.textoSuave)} g="☰" nombre="Alumnos" />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          headerShown: false,
          tabBarLabel: etiqueta('Agenda'),
          tabBarIcon: ({ color: tinta }) => <Icono color={String(tinta ?? color.textoSuave)} g="▦" nombre="Agenda" />,
        }}
      />
      <Tabs.Screen
        name="cobros"
        options={{
          title: 'Cobros',
          tabBarLabel: etiqueta('Cobros'),
          tabBarIcon: ({ color: tinta }) => <Icono color={String(tinta ?? color.textoSuave)} g="◈" nombre="Cobros" />,
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarLabel: etiqueta('Más'),
          tabBarIcon: ({ color: tinta }) => <Icono color={String(tinta ?? color.textoSuave)} g="⋯" nombre="Más" />,
        }}
      />
    </Tabs>
  );
}
