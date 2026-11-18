/**
 * Hoy — pantalla de inicio Aurora (referencia exacta: v2/diseno/capturas/a-hoy.png).
 * Hero con anillo de progreso «Clases de hoy», tres tarjetas de resumen,
 * lista de agenda del día con botón «Dada» y aviso de vencimientos.
 * I1: fixtures sin pagos reales; los límites se nombran, nunca se inventan datos.
 * «Dada» marca en el estado de sesión compartido: Hoy y Agenda ven lo mismo.
 */

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usarTema } from '../../../packages/ui/src/tema';
import { AURORA } from '../../../packages/ui/src/tokens';
import { usarSesion } from '../../../packages/datos/src/sesion';
import {
  clasesDelDia,
  saludoPorHora,
  type ResumenHoy,
} from '../../../packages/datos/src/resumenHoy';
import { etiquetaFechaLarga } from '../../../packages/datos/src/fechas';
import { AnilloProgreso } from '../components/AnilloProgreso';
import { TarjetaResumen, type DatoResumen } from '../components/TarjetaResumen';
import { FilaClase } from '../components/FilaClase';
import { Festejo } from '../components/Festejo';
import { Icono } from '../../../packages/ui/src/components/Icono';

export default function Hoy() {
  const { color, oscuro, reducirMovimiento } = usarTema();
  const { repo, agenda, dadas } = usarSesion();
  const router = useRouter();
  const [festejo, setFestejo] = useState(false);
  const [listaY, setListaY] = useState(220);
  // Muestra el día seleccionado de la Agenda (mismo estado que Agenda); sin
  // reloj global en I1. La lista depende solo de «dadas».
  const FECHA = agenda.fecha;
  const clases = useMemo(
    () =>
      clasesDelDia(
        repo.alumnos,
        repo.ocurrencias,
        repo.programaciones,
        FECHA,
        dadas.ids,
      ),
    [repo, FECHA, dadas.ids],
  );
  const resumen: ResumenHoy = useMemo(
    () => ({
      dadas: clases.filter((c) => c.dada).length,
      total: clases.length,
      clases,
    }),
    [clases],
  );

  const marcar = (programacionId: string) => {
    const clase = clases.find((c) => c.programacionId === programacionId);
    if (!clase) return;
    if (clase.dada) dadas.desmarcar(programacionId);
    else {
      dadas.marcar(programacionId);
      if (!reducirMovimiento) setFestejo(true);
    }
  };

  const proxima = resumen.clases.find((c) => !c.dada);
  const tarjetas: DatoResumen[] = [
    { tipo: 'cobrado', titulo: 'Cobrado hoy', valor: '—', nota: 'pagos reales en I2' },
    { tipo: 'porCobrar', titulo: 'Por cobrar', valor: '—', nota: 'mensualidades en I2' },
    { tipo: 'vencen', titulo: 'Vencen', valor: '—', nota: 'avisos en I2' },
  ];

  return (
    <View style={[s.raiz, { backgroundColor: color.fondo }]}>
      <ScrollView contentContainerStyle={s.cont}>
        {/* Saludo + campana */}
        <View style={s.cabecera}>
          <View>
            <Text style={[s.saludo, { color: color.textoSuave }]}>
              {saludoPorHora(16)}, Xime
            </Text>
            <Text style={[s.titulo, { color: color.texto }]}>Hoy</Text>
          </View>
          <Pressable
            onPress={() => router.push('/cobros')}
            accessibilityRole="button"
            accessibilityLabel="Avisos: 3 vencimientos esta semana, ver en Cobros"
            style={({ pressed }) => [
              s.campana,
              { backgroundColor: color.superficie, borderColor: color.borde },
              pressed && s.presionado,
            ]}
          >
            <Icono nombre="campana" color={color.texto} tamaño={20} />
            <View style={[s.campanaBadge, { backgroundColor: AURORA.vencida.solid }]}>
              <Text style={s.campanaBadgeT}>3</Text>
            </View>
          </Pressable>
        </View>

        {/* Hero: anillo + próxima clase. Sombra en el wrapper, degradé recortado adentro. */}
        <View style={s.heroSombra}>
          <View style={[s.hero, oscuro && { backgroundColor: color.superficie }]}>
            {!oscuro && (
              <LinearGradient
                colors={['#08454A', '#0E7C7B', '#15A5A2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <AnilloProgreso
              dadas={resumen.dadas}
              total={resumen.total}
              acento={color.acento}
              acentoSuave={oscuro ? color.borde : '#15A5A2'}
              texto={oscuro ? color.texto : '#FFFFFF'}
              reducirMovimiento={reducirMovimiento}
            />
            <View style={s.heroInfo}>
              <Text style={[s.heroTitulo, { color: oscuro ? color.texto : '#FFFFFF' }]}>Clases de hoy</Text>
              <Text style={[s.heroLinea, { color: oscuro ? color.textoSuave : '#CDEFEA' }]}>
                {proxima
                  ? `Próxima: ${proxima.hora} · ${proxima.nombre}`
                  : resumen.total > 0
                    ? 'Todas las clases dadas'
                    : 'Sin clases programadas'}
              </Text>
              <Text style={[s.heroLinea, { color: oscuro ? color.textoSuave : '#CDEFEA' }]}>
                {etiquetaFechaLarga(FECHA)}
              </Text>
            </View>
          </View>
        </View>

        {/* Resumen: 3 tarjetas, accionables → Cobros (I1 placeholder, toque ya cableado) */}
        <View style={s.filaResumen}>
          {tarjetas.map((d) => (
            <TarjetaResumen key={d.tipo} dato={d} enAbrir={() => router.push('/cobros')} />
          ))}
        </View>

        {/* Agenda del día */}
        <Text style={[s.seccion, { color: color.texto }]}>Agenda de hoy</Text>
        <View style={s.lista} onLayout={(e) => setListaY(e.nativeEvent.layout.y)}>
          {resumen.clases.length === 0 && (
            <Text style={[s.vacio, { color: color.textoSuave }]}>
              Hoy no hay alumnos agendados
            </Text>
          )}
          {resumen.clases.map((c) => (
            <FilaClase
              key={c.programacionId}
              clase={c}
              enMarcar={marcar}
              enAbrir={() => {
                agenda.setOrigen({ vista: 'mes', fecha: FECHA });
                agenda.setFecha(FECHA);
                router.push(`/dia/${FECHA}`);
              }}
            />
          ))}
        </View>

        {/* Límite I1: los vencimientos reales llegan con pagos (I2). Fila táctil, destino real en I2. */}
        <Pressable
          onPress={() => router.push('/cobros')}
          accessibilityRole="button"
          accessibilityLabel="Vencimientos de la semana, se listan al activar cobros, ver en Cobros"
          style={({ pressed }) => [
            s.aviso,
            { backgroundColor: oscuro ? color.superficie : AURORA.pronto.tint, borderColor: oscuro ? color.borde : AURORA.pronto.solid },
            pressed && s.presionado,
          ]}
        >
          <Icono nombre="alerta" color={AURORA.pronto.strong} tamaño={20} />
          <View style={s.avisoInfo}>
            <Text style={[s.avisoTitulo, { color: oscuro ? color.texto : AURORA.pronto.ink }]}>
              Vencimientos de la semana
            </Text>
            <Text style={[s.avisoNota, { color: AURORA.pronto.strong }]}>
              Se listan al activar cobros (I2)
            </Text>
          </View>
          <Icono nombre="chevronDer" color={oscuro ? color.textoSuave : AURORA.pronto.strong} tamaño={18} />
        </Pressable>
      </ScrollView>
      <Festejo visible={festejo} animar={!reducirMovimiento} origenY={listaY} />
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1 },
  cont: { padding: 16, paddingBottom: 96, gap: 12 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saludo: { fontSize: 14, fontWeight: '600' },
  titulo: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  campana: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  campanaBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  campanaBadgeT: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  presionado: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  heroSombra: {
    borderRadius: 16,
    shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 16, overflow: 'hidden',
  },
  heroInfo: { flex: 1, gap: 2 },
  heroTitulo: { fontSize: 17, fontWeight: '800' },
  heroLinea: { fontSize: 13, fontWeight: '500' },
  filaResumen: { flexDirection: 'row', gap: 10 },
  seccion: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  lista: { gap: 8 },
  vacio: { fontSize: 14, paddingVertical: 8 },
  aviso: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 52,
  },
  avisoInfo: { flex: 1 },
  avisoTitulo: { fontSize: 14, fontWeight: '700' },
  avisoNota: { fontSize: 12 },
});
