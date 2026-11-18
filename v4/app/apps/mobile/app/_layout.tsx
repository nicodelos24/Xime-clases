import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProveedorTema } from '../../../packages/ui/src/tema';
import { ProveedorSesion } from '../../../packages/datos/src/sesion';

export default function Raiz() {
  return (
    <ProveedorTema>
      <ProveedorSesion>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dia/[fecha]" options={{ title: 'Día', headerShown: false }} />
          <Stack.Screen name="agendar/[fecha]" options={{ title: 'Agendar' }} />
          <Stack.Screen name="ficha/[id]" options={{ title: 'Ficha' }} />
          <Stack.Screen name="programacion/[id]" options={{ title: 'Programación' }} />
        </Stack>
      </ProveedorSesion>
    </ProveedorTema>
  );
}
