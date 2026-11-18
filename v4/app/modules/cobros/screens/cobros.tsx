/**
 * Cobros — pantalla Aurora (W7 de Fina, v2/diseno/flujos/03-wireframes-cobros-mas.md).
 * Pestañas Por vencer / Vencidas / Adeudadas / Historial + resumen del mes,
 * filas derivadas del dominio y límites I2 explícitos: registrar y anular
 * pagos llega con I2–I3; aquí no se procesa dinero y no se inventan montos.
 * KPI y filas van en familia con Hoy (a-hoy.png): KPI blancos, filas tint.
 */

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '../../../packages/ui/src/tema';
import { AURORA } from '../../../packages/ui/src/tokens';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { ModalityBadge } from '../../../packages/ui/src/components/ModalityBadge';
import { Icono } from '../../../packages/ui/src/components/Icono';
import {
  cobrosPendientes,
  PESTANIAS_COBROS,
  ETIQUETA_PESTANIA,
  type CobroPendiente,
  type PestaniaCobros,
} from './estadosCobros';

export default function Cobros() {
  const { color, oscuro } = usarTema();
  const { repo, agenda, dadas } = usarSesion();
  const router = useRouter();
  const [pestania, setPestania] = useState<PestaniaCobros>('porVencer');

  const HOY = agenda.fecha;
  const pendientes = useMemo(
    () => cobrosPendientes(repo.alumnos, repo.ocurrencias, repo.programaciones, HOY, dadas.ids),
    [repo, HOY, dadas.ids],
  );

  // I1: sin pagos registrados (llegan con I2). Historial vacío real, no inventado.
  const vencidas: CobroPendiente[] = [];
  const porVencer: CobroPendiente[] = [];
  const listas: Record<PestaniaCobros, CobroPendiente[]> = {
    porVencer,
    vencidas,
    adeudadas: pendientes.filter((c) => c.estado === 'Adeudada'),
    historial: [],
  };
  const activa = listas[pestania];

  const tarjeta = (extra?: object) => [
    s.tarjeta,
    { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderColor: color.borde },
    extra ?? {},
  ];

  return (
    <View style={[s.raiz, { backgroundColor: color.fondo }]}>
      <ScrollView contentContainerStyle={s.cont}>
        {/* Título + acción primaria (W7: «+ Registrar», deshabilitada con límite) */}
        <View style={s.cabecera}>
          <View>
            <Text style={[s.titulo, { color: color.texto }]}>Cobros</Text>
            <Text style={[s.conteo, { color: color.textoSuave }]}>
              Estados de cobro · pagos reales en I2–I3
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Registrar pago, disponible con pagos reales en I2"
            style={({ pressed }) => [
              s.fab,
              { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderColor: color.borde },
              pressed && s.presionado,
            ]}
          >
            <Icono nombre="porCobrar" color={color.texto} tamaño={20} />
          </Pressable>
        </View>

        {/* Pestañas con contador (44 px, familia de los chips de Alumnos) */}
        <View style={s.pestanias}>
          {PESTANIAS_COBROS.map((p) => {
            const n = listas[p].length;
            const activo = pestania === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPestania(p)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={({ pressed }) => [
                  s.pestania,
                  { borderColor: color.borde },
                  activo && { backgroundColor: oscuro ? color.acentoFuerte : AURORA.mensual.solid, borderColor: oscuro ? color.acentoFuerte : AURORA.mensual.solid },
                  pressed && s.presionado,
                ]}
              >
                <Text
                  style={[
                    s.pestaniaTexto,
                    { color: color.texto },
                    activo && { color: AURORA.surface },
                  ]}
                >
                  {ETIQUETA_PESTANIA[p]}{n > 0 ? ` ${n}` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Resumen del mes: solo cobrado/por cobrar reales existen en I2 */}
        <View style={tarjeta()}>
          <Text style={[s.seccion, { color: color.texto }]}>Resumen del mes</Text>
          <View style={s.kpiFila}>
            <View style={s.kpi}>
              <View style={[s.kpiIcono, { backgroundColor: AURORA.aldia.tint }]}>
                <Icono nombre="cobrado" color={AURORA.aldia.ink} tamaño={15} grosor={2} />
              </View>
              <Text style={[s.kpiValor, { color: color.texto }]}>—</Text>
              <Text style={[s.kpiEtiqueta, { color: color.textoSuave }]}>Cobrado</Text>
            </View>
            <View style={s.kpi}>
              <View style={[s.kpiIcono, { backgroundColor: AURORA.individual.tint }]}>
                <Icono nombre="porCobrar" color={AURORA.individual.ink} tamaño={15} grosor={2} />
              </View>
              <Text style={[s.kpiValor, { color: color.texto }]}>—</Text>
              <Text style={[s.kpiEtiqueta, { color: color.textoSuave }]}>Por cobrar</Text>
            </View>
          </View>
          <Text style={[s.legal, { color: color.textoSuave }]}>
            Los montos aparecen al registrar pagos (I2). La demo no inventa dinero.
          </Text>
        </View>

        {/* Lista de la pestaña activa */}
        {activa.length === 0 ? (
          <View style={tarjeta()}>
            <View style={s.vacioFila}>
              <View style={[s.vacioIcono, { backgroundColor: pestania === 'historial' ? AURORA.individual.tint : AURORA.aldia.tint }]}>
                <Icono
                  nombre={pestania === 'historial' ? 'agenda' : 'check'}
                  color={pestania === 'historial' ? AURORA.individual.ink : AURORA.aldia.ink}
                  tamaño={16}
                  grosor={2}
                />
              </View>
              <Text style={[s.vacioTitulo, { color: color.texto }]}>
                {pestania === 'porVencer' && 'Nada por vencer en la demo'}
                {pestania === 'vencidas' && 'Sin mensualidades vencidas'}
                {pestania === 'adeudadas' && 'Sin clases adeudadas'}
                {pestania === 'historial' && 'El historial llega con pagos reales (I2)'}
              </Text>
            </View>
            <Text style={[s.vacioNota, { color: color.textoSuave }]}>
              {pestania === 'porVencer' && 'Los vencimientos se calculan al tener ciclos y pagos (I2)'}
              {pestania === 'vencidas' && 'Se calculan al tener ciclos y pagos (I2)'}
              {pestania === 'adeudadas' && 'Marcá clases «Dada» en Hoy y volvé: quedan acá si son por clase'}
              {pestania === 'historial' && 'Cada pago queda con fecha, medio y quién lo registró'}
            </Text>
          </View>
        ) : (
          activa.map((c) => (
            <FilaCobro key={c.alumnoId} cobro={c} enAbrir={() => router.push(`/ficha/${c.alumnoId}`)} />
          ))
        )}

        {/* Límite de anulación: I3 (server), nunca acá */}
        <View style={tarjeta()}>
          <View style={s.vacioFila}>
            <View style={[s.vacioIcono, { backgroundColor: AURORA.vencida.tint }]}>
              <Icono nombre="alerta" color={AURORA.vencida.ink} tamaño={16} grosor={2} />
            </View>
            <Text style={[s.vacioTitulo, { color: color.texto }]}>Anular un pago</Text>
          </View>
          <Text style={[s.vacioNota, { color: color.textoSuave }]}>
            Se hace desde el detalle del pago (W10) al tener pagos reales (I2–I3), con motivo y
            registro visible. El pago original nunca desaparece.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/** Fila de cobro pendiente: avatar, nombre, concepto + estado, detalle del dominio. */
function FilaCobro({ cobro, enAbrir }: { cobro: CobroPendiente; enAbrir: () => void }) {
  const { color, oscuro, modalidad } = usarTema();
  const par = modalidad[cobro.modalidad === 'mensual' ? 'mensual' : 'individual'];
  const estadoPar =
    cobro.estado === 'Vencida'
      ? AURORA.vencida
      : cobro.estado === 'PorVencer'
        ? AURORA.pronto
        : AURORA.debe;

  return (
    <Pressable
      onPress={enAbrir}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ficha de ${cobro.nombre}: ${cobro.concepto}, ${cobro.detalle}`}
      style={({ pressed }) => [
        s.fila,
        { backgroundColor: oscuro ? color.superficie : AURORA.surface, borderLeftColor: par.texto },
        pressed && s.presionado,
      ]}
    >
      <AvatarInitials nombre={cobro.nombre} />
      <View style={s.filaInfo}>
        <Text style={[s.filaNombre, { color: color.texto }]}>{cobro.nombre}</Text>
        <View style={s.filaMeta}>
          <ModalityBadge modalidad={cobro.modalidad === 'mensual' ? 'mensual' : 'individual'} />
          <View style={[s.estadoChip, { backgroundColor: estadoPar.tint }]}>
            <Icono
              nombre={cobro.estado === 'Vencida' ? 'alerta' : 'porCobrar'}
              color={estadoPar.ink}
              tamaño={11}
              grosor={2.2}
            />
            <Text style={[s.estadoTexto, { color: estadoPar.ink }]}>
              {cobro.estado === 'Adeudada' ? 'Adeudada' : cobro.estado === 'Vencida' ? 'Vencida' : 'Por vencer'}
            </Text>
          </View>
        </View>
        <Text style={[s.filaDetalle, { color: color.textoSuave }]}>{cobro.detalle}</Text>
      </View>
      <Icono nombre="chevronDer" color={color.textoSuave} tamaño={18} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1 },
  cont: { padding: 16, paddingBottom: 96, gap: 10 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  titulo: { fontSize: 24, fontWeight: '800' },
  conteo: { fontSize: 13, marginTop: 2 },
  fab: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  presionado: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  pestanias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pestania: {
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 14,
    minHeight: 40, justifyContent: 'center',
  },
  pestaniaTexto: { fontSize: 13, fontWeight: '600' },
  tarjeta: {
    borderWidth: 1, borderRadius: 12, padding: 14, gap: 8,
    shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  seccion: { fontSize: 15, fontWeight: '700' },
  kpiFila: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, gap: 2 },
  kpiIcono: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  kpiValor: { fontSize: 17, fontWeight: '800' },
  kpiEtiqueta: { fontSize: 11, fontWeight: '600' },
  legal: { fontSize: 12 },
  vacioFila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vacioIcono: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  vacioTitulo: { fontSize: 14, fontWeight: '700', flex: 1 },
  vacioNota: { fontSize: 13 },
  fila: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 3, borderRadius: 10, padding: 12, minHeight: 64,
    shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  filaInfo: { flex: 1, gap: 4 },
  filaNombre: { fontSize: 15, fontWeight: '700' },
  filaMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  filaDetalle: { fontSize: 12.5 },
  estadoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  estadoTexto: { fontSize: 11, fontWeight: '700' },
});
