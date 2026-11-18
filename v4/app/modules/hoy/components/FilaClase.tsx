/**
 * FilaClase — fila de «Agenda del día» en Hoy (demo v4, tokens.css .fila).
 * Fondo blanco, hora a la izquierda, avatar de iniciales con tint por
 * modalidad, nombre + chip de modalidad + «60 min», botón «Dada» con check.
 * El tiempo llega de la ocurrencia (hora); no hay duración en el modelo I1,
 * así que el meta muestra solo la modalidad — sin minutos inventados.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';
import { Icono } from '../../../packages/ui/src/components/Icono';
import { usarTema } from '../../../packages/ui/src/tema';
import { HOY_COLORES, DADA_ETIQUETA, RETRASO_ENTRADA } from '../screens/textoHoy';
import type { ClaseDelDia } from '../../../packages/datos/src/resumenHoy';

export function FilaClase({
  clase,
  enMarcar,
  enAbrir,
  retraso,
  animarEntrada,
}: {
  clase: ClaseDelDia;
  enMarcar: (programacionId: string) => void;
  enAbrir: () => void;
  /** ms de retraso de la entrada escalonada (demo: 240 + i*90). */
  retraso?: number;
  animarEntrada?: boolean;
}) {
  const { color, oscuro, modalidad, reducirMovimiento } = usarTema();
  const par = modalidad[clase.modalidad];
  const dada = clase.dada;
  // Entrada escalonada (demo: 240 + i·90 ms): estado real en RN-web, el style
  // de función de Pressable no re-renderiza por sí solo. 0.001 evita el
  // estilo inicial con opacity 0 que el navegador no anima.
  const [visible, setVisible] = useState(!animarEntrada || reducirMovimiento);
  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setVisible(true), retraso ?? RETRASO_ENTRADA.filaBase);
    return () => clearTimeout(t);
  }, [visible, retraso]);
  const dadaC = oscuro
    ? {
        reposo: { fondo: color.superficie, borde: color.acento, texto: color.acento },
        tocada: { fondo: color.acento, texto: color.sobreAcento },
      }
    : {
        reposo: { fondo: HOY_COLORES.dadaReposo.fondo, borde: HOY_COLORES.dadaReposo.borde, texto: HOY_COLORES.dadaReposo.texto },
        tocada: { fondo: HOY_COLORES.dadaTocada.fondo, texto: HOY_COLORES.dadaTocada.texto },
      };

  const estiloDada = dada
    ? { backgroundColor: dadaC.tocada.fondo }
    : { backgroundColor: dadaC.reposo.fondo, borderWidth: 1.5, borderColor: dadaC.reposo.borde };

  return (
    <View
      style={[
        s.fila,
        { opacity: visible ? 1 : 0.001, transform: [{ translateY: visible ? 0 : 12 }] },
      ]}
    >
      <Pressable
        onPress={enAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Ver la agenda del día de ${clase.nombre}, ${clase.hora}`}
        style={s.zona}
      >
        <Text style={[s.hora, { color: color.textoSuave }]}>{clase.hora}</Text>
        <AvatarInitials nombre={clase.nombre} tamaño={36} fondo={par.fondo} letra={par.texto} />
        <View style={s.info}>
          <Text style={[s.nombre, { color: color.texto }]} numberOfLines={1}>
            {clase.nombre}
          </Text>
          <View style={s.meta}>
            <ModalityBadge modalidad={clase.modalidad} />
          </View>
        </View>
      </Pressable>
      <Pressable
        onPress={() => enMarcar(clase.programacionId)}
        accessibilityRole="button"
        accessibilityState={{ checked: dada }}
        accessibilityLabel={
          dada
            ? `Clase de ${clase.nombre} marcada como dada, tocar para deshacer`
            : `Marcar la clase de ${clase.nombre} como dada`
        }
        style={({ pressed }) => [s.dada, estiloDada, pressed && !reducirMovimiento ? { transform: [{ scale: 0.96 }] } : null]}
      >
        <Icono nombre="check" color={dada ? dadaC.tocada.texto : dadaC.reposo.texto} tamaño={14} grosor={2.2} />
        <Text style={[s.dadaTexto, { color: dada ? dadaC.tocada.texto : dadaC.reposo.texto }]}>{DADA_ETIQUETA}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    paddingLeft: 12,
    gap: 4,
  },
  zona: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  hora: { width: 44, fontSize: 12.5, fontWeight: '700', flex: 0 },
  info: { flex: 1, gap: 2 },
  nombre: { fontSize: 14, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 1 },
  dada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    minHeight: 36,
    flexShrink: 0,
  },
  dadaTexto: { fontSize: 12.5, fontWeight: '700' },
});
