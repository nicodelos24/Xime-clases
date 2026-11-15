import { Pressable, StyleSheet, Text, View } from 'react-native';

/** Avatar de inicial, 40 px, con accesibilidad textual. */
export function AvatarInitials({ nombre }: { nombre: string }) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={s.circulo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={s.letra}>{inicial}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circulo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4DCE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontSize: 17, fontWeight: '600', color: '#5E2370' },
});
