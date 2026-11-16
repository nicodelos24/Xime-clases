import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { usarTema } from '../../src/tema/tema';

function Icono({ g, nombre }: { g: string; nombre: string }) {
  const { color } = usarTema();
  return (
    <Text style={{ fontSize: 20, color: color.acento }} accessibilityLabel={nombre}>
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
  const etiqueta = (texto: string) => () => (
    <Etiqueta texto={texto} color={color.textoSuave} />
  );
  return (
    <Tabs>
      <Tabs.Screen
        name="hoy"
        options={{
          title: 'Hoy',
          tabBarLabel: etiqueta('Hoy'),
          tabBarIcon: ({ color }) => <Icono g="☀" nombre="Hoy" />,
        }}
      />
      <Tabs.Screen
        name="alumnos"
        options={{
          title: 'Alumnos',
          tabBarLabel: etiqueta('Alumnos'),
          tabBarIcon: ({ color }) => <Icono g="☰" nombre="Alumnos" />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          headerShown: false,
          tabBarLabel: etiqueta('Agenda'),
          tabBarIcon: ({ color }) => <Icono g="▦" nombre="Agenda" />,
        }}
      />
      <Tabs.Screen
        name="cobros"
        options={{
          title: 'Cobros',
          tabBarLabel: etiqueta('Cobros'),
          tabBarIcon: ({ color }) => <Icono g="◈" nombre="Cobros" />,
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarLabel: etiqueta('Más'),
          tabBarIcon: ({ color }) => <Icono g="⋯" nombre="Más" />,
        }}
      />
    </Tabs>
  );
}
