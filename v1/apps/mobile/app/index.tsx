import { Redirect } from 'expo-router';

/** Ruta raíz: destino inicial Hoy. */
export default function Index() {
  return <Redirect href="/hoy" />;
}
