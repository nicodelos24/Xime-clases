import { Text, View, StyleSheet } from 'react-native';

/** Avatar de iniciales; tamaño configurable (por defecto 40 px). */
export function AvatarInitials({
  nombre,
  tamaño = 40,
}: {
  nombre: string;
  tamaño?: number;
}) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || '?';
  const radio = tamaño / 2;
  return (
    <View
      style={[s.circulo, { width: tamaño, height: tamaño, borderRadius: radio }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[s.letra, { fontSize: tamaño * 0.42 }]}>{inicial}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circulo: {
    backgroundColor: '#E4DCE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontWeight: '600', color: '#5E2370' },
});
