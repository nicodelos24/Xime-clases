import { Text, View, StyleSheet } from 'react-native';

/** Avatar de iniciales; tamaño configurable (por defecto 40 px). */
export function AvatarInitials({
  nombre,
  tamaño = 40,
  fondo,
  letra,
}: {
  nombre: string;
  tamaño?: number;
  /** Fondo opcional (tint de modalidad); si falta usa el neutro del tema. */
  fondo?: string;
  /** Color de la letra opcional (ink de modalidad); si falta usa el neutro. */
  letra?: string;
}) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || '?';
  const radio = tamaño / 2;
  return (
    <View
      style={[s.circulo, { width: tamaño, height: tamaño, borderRadius: radio }, fondo ? { backgroundColor: fondo } : null]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[s.letra, { fontSize: tamaño * 0.42 }, letra ? { color: letra } : null]}>{inicial}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circulo: {
    backgroundColor: '#DCE8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontWeight: '600', color: '#5E4285' },

});
