/**
 * Más — pantalla Aurora (W11 de Fina, v2/diseno/flujos/03-wireframes-cobros-mas.md).
 * Precios con vigencia (del dominio tarifas), días de aviso N (7/10/vence hoy),
 * dos dueñas, y límites I2 como filas con detalle. Íconos SVG propios, cero emoji.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usarTema } from '../../../packages/ui/src/tema';
import { AURORA } from '../../../packages/ui/src/tokens';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { Icono } from '../../../packages/ui/src/components/Icono';
import {
  filasMas,
  OPCIONES_AVISO,
  ETIQUETA_AVISO,
  esOpcionValida,
  DUENIAS,
  type DiasAviso,
} from './ajustesMas';

export default function Mas() {
  const { color, oscuro } = usarTema();
  const { agenda } = usarSesion();
  const [diasAviso, setDiasAviso] = useState<DiasAviso>(7);
  const filas = filasMas(diasAviso, agenda.fecha);

  const tarjeta = (extra?: object) => [
    s.tarjeta,
    { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderColor: color.borde },
    extra ?? {},
  ];

  const precioIcono = (id: string) =>
    id === 'precio-mensualidad' ? ('agenda' as const) : ('alumnos' as const);

  return (
    <View style={[s.raiz, { backgroundColor: color.fondo }]}>
      <ScrollView contentContainerStyle={s.cont}>
        <View style={s.cabecera}>
          <Text style={[s.titulo, { color: color.texto }]}>Más</Text>
          <Text style={[s.conteo, { color: color.textoSuave }]}>
            Instituto de danza · piloto, 1 grupo
          </Text>
        </View>

        {/* Precios (lista; edición con vigencia en I2) */}
        <View style={tarjeta()}>
          <Text style={[s.seccion, { color: color.texto }]}>Precios</Text>
          {filas.filter((f) => f.id.startsWith('precio-')).map((f) => (
            <View key={f.id} style={s.fila}>
              <View style={[s.filaIcono, { backgroundColor: AURORA.mensual.tint }]}>
                <Icono nombre={precioIcono(f.id)} color={AURORA.mensual.ink} tamaño={14} grosor={2.2} />
              </View>
              <View style={s.filaInfo}>
                <Text style={[s.filaTexto, { color: color.texto }]}>{f.etiqueta}</Text>
                <Text style={[s.filaDetalle, { color: color.textoSuave }]}>{f.detalle}</Text>
              </View>
              <Text style={[s.filaValor, { color: color.texto }]}>{f.valor}</Text>
            </View>
          ))}
        </View>

        {/* Avisos de vencimiento: N editable en demo (§3.4) */}
        <View style={tarjeta()}>
          <Text style={[s.seccion, { color: color.texto }]}>Avisos de vencimiento</Text>
          <View style={s.fila}>
            <View style={[s.filaIcono, { backgroundColor: AURORA.pronto.tint }]}>
              <Icono nombre="porCobrar" color={AURORA.pronto.ink} tamaño={14} grosor={2.2} />
            </View>
            <Text style={[s.filaTexto, { color: color.texto, flex: 1 }]}>Avisar cuando falten</Text>
          </View>
          <View style={s.chips}>
            {OPCIONES_AVISO.map((n) => {
              const activo = diasAviso === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setDiasAviso(esOpcionValida(n) ? n : 7)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={`Aviso con ${ETIQUETA_AVISO[n]}`}
                  style={({ pressed }) => [
                    s.chip,
                    { borderColor: color.borde },
                    activo && { backgroundColor: oscuro ? color.acentoFuerte : AURORA.mensual.solid, borderColor: oscuro ? color.acentoFuerte : AURORA.mensual.solid },
                    pressed && s.presionado,
                  ]}
                >
                  <Text style={[s.chipTexto, { color: color.texto }, activo && { color: AURORA.surface }]}>
                    {ETIQUETA_AVISO[n]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[s.nota, { color: color.textoSuave }]}>
            N se guarda por instituto (7 por defecto). El aviso real llega con cobros (I2).
          </Text>
        </View>

        {/* Resto de filas (horario, cuentas, reportes, sesión): límites I2 */}
        <View style={tarjeta()}>
          {filas.filter((f) => !f.id.startsWith('precio-') && f.id !== 'aviso' && f.id !== 'cuentas').map((f) => (
            <FilaLimite key={f.id} fila={f} />
          ))}
        </View>

        {/* Cuentas: las dos dueñas del piloto */}
        <View style={tarjeta()}>
          <Text style={[s.seccion, { color: color.texto }]}>Cuentas</Text>
          {DUENIAS.map((d) => (
            <View key={d.nombre} style={s.fila}>
              <View style={[s.filaIcono, { backgroundColor: AURORA.aldia.tint }]}>
                <Icono nombre="alumnos" color={AURORA.aldia.ink} tamaño={14} grosor={2.2} />
              </View>
              <View style={s.filaInfo}>
                <Text style={[s.filaTexto, { color: color.texto }]}>{d.nombre}</Text>
                <Text style={[s.filaDetalle, { color: color.textoSuave }]}>{d.rol}</Text>
              </View>
            </View>
          ))}
          <Text style={[s.nota, { color: color.textoSuave }]}>
            Dos cuentas propias con auditoría por usuario: login en I2. Sin roles de recepción ni profesores.
          </Text>
        </View>

        {/* Límites de la unidad, en familia con el resto */}
        <View style={tarjeta()}>
          <Text style={[s.seccion, { color: color.texto }]}>Sobre esta demo (I1)</Text>
          <Text style={[s.nota, { color: color.textoSuave }]}>
            Datos ficticios en memoria; sin Supabase, autenticación ni dinero real (I2–I3).
            Agendar o marcar «Dada» no cobra ni inicia mensualidades.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/** Fila no disponible: ícono neutral, etiqueta y detalle de cuándo llega. */
function FilaLimite({ fila }: { fila: { id: string; etiqueta: string; valor?: string; detalle?: string } }) {
  const { color } = usarTema();
  return (
    <View style={s.fila}>
      <View style={[s.filaIcono, { backgroundColor: color.fondo }]}>
        <Icono nombre="campana" color={color.textoSuave} tamaño={14} grosor={2.2} />
      </View>
      <View style={s.filaInfo}>
        <Text style={[s.filaTexto, { color: color.texto }]}>{fila.etiqueta}</Text>
        {fila.detalle ? <Text style={[s.filaDetalle, { color: color.textoSuave }]}>{fila.detalle}</Text> : null}
      </View>
      {fila.valor ? <Text style={[s.filaValor, { color: color.texto }]}>{fila.valor}</Text> : null}
      <Icono nombre="chevronDer" color={color.textoSuave} tamaño={16} />
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1 },
  cont: { padding: 16, paddingBottom: 96, gap: 10 },
  cabecera: { marginBottom: 2 },
  titulo: { fontSize: 24, fontWeight: '800' },
  conteo: { fontSize: 13, marginTop: 2 },
  presionado: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  tarjeta: {
    borderWidth: 1, borderRadius: 12, padding: 14, gap: 8,
    shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  seccion: { fontSize: 15, fontWeight: '700' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  filaIcono: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  filaInfo: { flex: 1, gap: 2 },
  filaTexto: { fontSize: 14.5, fontWeight: '600' },
  filaDetalle: { fontSize: 12 },
  filaValor: { fontSize: 15, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 38 },
  chip: {
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 14,
    minHeight: 38, justifyContent: 'center',
  },
  chipTexto: { fontSize: 13, fontWeight: '600' },
  nota: { fontSize: 12.5 },
});
