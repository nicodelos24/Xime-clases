/**
 * FilaClase — fila de la agenda del día en Hoy (a-hoy.png + wireframe W1).
 * Avatar de iniciales, chip de modalidad (texto + forma) y botón «Dada».
 * El botón marca en el estado de sesión compartido (Agenda lo muestra);
 * tocar la fila abre Agenda › Día (no edita acá). Botón ≥44 px.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usarTema } from '../../../packages/ui/src/tema';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';
import { Icono } from '../../../packages/ui/src/components/Icono';
import type { ClaseDelDia } from '../../../packages/datos/src/resumenHoy';

export function FilaClase({
  clase,
  enMarcar,
  enAbrir,
}: {
  clase: ClaseDelDia;
  enMarcar: (programacionId: string) => void;
  enAbrir: () => void;
}) {
  const { color, modalidad } = usarTema();
  const par = modalidad[clase.modalidad];
  const dada = clase.dada;

  return (
    // Contenedor no interactivo: evita botón-dentro-de-botón en web
    // (inválido en HTML, rompe accesibilidad). Dos zonas táctiles propias.
    <View
      style={[
        s.fila,
        {
          backgroundColor: par.fondo,
          borderLeftColor: par.texto,
        },
      ]}
    >
      <Pressable
        onPress={enAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Abrir la agenda del día para ${clase.nombre}, ${clase.hora}`}
        style={s.filaTocable}
      >
        <Text style={[s.hora, { color: color.texto }]}>{clase.hora}</Text>
        <AvatarInitials
          nombre={clase.nombre}
          tamaño={36}
        />
        <View style={s.info}>
          <Text style={[s.nombre, { color: color.texto }]}>{clase.nombre}</Text>
          <ModalityBadge modalidad={clase.modalidad} />
        </View>
      </Pressable>
      <Pressable
        onPress={() => enMarcar(clase.programacionId)}
        accessibilityRole="button"
        accessibilityLabel={`Marcar la clase de ${clase.nombre} como dada`}
        accessibilityState={{ checked: dada }}
        style={[
          s.dadaBtn,
          dada ? { backgroundColor: color.acento } : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color.borde },
        ]}
      >
        <Text style={[s.dadaTexto, { color: dada ? color.sobreAcento : color.texto }]}>
          Dada
        </Text>
        {dada && <Icono nombre="check" color={color.sobreAcento} tamaño={14} grosor={2.4} />}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
  },
  filaTocable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hora: { width: 44, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  info: { flex: 1, gap: 4 },
  nombre: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  dadaBtn: {
    minWidth: 72,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dadaTexto: { fontSize: 14, fontWeight: '700' },
});
