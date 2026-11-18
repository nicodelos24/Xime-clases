/**
 * Hoy — pantalla v4 (Fase 3a), réplica del demo aprobado por Nico
 * (v4/diseno/index.html#hoy, captura capturas/hoy.png):
 * cabecera con campana, hero turquesa (kicker, «N clases por dar», línea,
 * anillo animado, tarjeta «Próxima»), 3 KPI blancos con punto, «Agenda del
 * día» con filas blancas + «Dada» con micro-festejo, aviso crema de
 * vencimientos, entrada escalonada, latido al completar el día.
 * I1: sin pagos ni asistencia real; los límites se nombran, nunca datos
 * inventados. La fecha y «dadas» vienen del estado de sesión compartido
 * con la Agenda (Hoy y Agenda ven lo mismo).
 */

import { useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import {
  tituloProgreso,
  lineaProgreso,
  kickerFecha,
  capitalizar,
  AVISO_VENCIMIENTOS,
  RETRASO_ENTRADA,
  HOY_COLORES,
} from './textoHoy';
import { AnilloProgreso } from '../components/AnilloProgreso';
import { TarjetaResumen, type DatoResumen } from '../components/TarjetaResumen';
import { FilaClase } from '../components/FilaClase';
import { Festejo } from '../components/Festejo';
import { Icono } from '../../../packages/ui/src/components/Icono';

export default function Hoy() {
  const { color, oscuro, reducirMovimiento } = usarTema();
  const { repo, agenda, dadas } = usarSesion();
  const router = useRouter();
  const [festejo, setFestejo] = useState<{ x: number; y: number } | null>(null);
  const [posiciones, setPosiciones] = useState<Record<string, { x: number; y: number; ancho: number; alto: number }>>({});
  // Muestra el día seleccionado de la Agenda (mismo estado); sin reloj global en I1.
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

  const proxima = resumen.clases.find((c) => !c.dada);
  const diaCompleto = resumen.total > 0 && resumen.dadas === resumen.total;

  const marcar = (programacionId: string) => {
    const clase = clases.find((c) => c.programacionId === programacionId);
    if (!clase) return;
    if (clase.dada) {
      dadas.desmarcar(programacionId);
      return;
    }
    dadas.marcar(programacionId);
    // Micro-festejo centrado en el botón «Dada» tocado (si el sistema lo permite).
    if (reducirMovimiento) return;
    const p = posiciones[programacionId];
    if (p) setFestejo({ x: p.x + p.ancho - 46, y: p.y + p.alto / 2 });
    void AccessibilityInfo.announceForAccessibility(`Clase de ${clase.nombre} marcada como dada`);
  };

  const tarjetas: DatoResumen[] = [
    { tipo: 'cobrado', titulo: 'Cobrado hoy', valor: '—', nota: 'pagos reales en I2' },
    { tipo: 'porCobrar', titulo: 'Por cobrar', valor: '—', nota: 'mensualidades en I2' },
    { tipo: 'vencen', titulo: 'Vencen hoy', valor: '—', nota: 'vencimientos en I2' },
  ];

  return (
    <View style={[s.raiz, { backgroundColor: oscuro ? color.fondo : AURORA.bg }]}>
      <ScrollView contentContainerStyle={s.cont}>
        {/* Cabecera: saludo + título + campana (40 px como el demo) */}
        <View style={s.cabecera}>
          <View>
            <Text style={[s.saludo, { color: oscuro ? color.acentoFuerte : '#0B6B6A' }]}>
              {saludoPorHora(16)}, Xime
            </Text>
            <Text style={[s.titulo, { color: color.texto }]}>Hoy</Text>
          </View>
          <Pressable
            onPress={() => router.push('/cobros')}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones: 3 avisos esta semana, ver en Cobros"
            style={({ pressed }) => [
              s.campana,
              { backgroundColor: color.superficie },
              pressed && !reducirMovimiento ? { transform: [{ translateY: -2 }] } : null,
            ]}
          >
            <Icono nombre="campana" color={color.textoSuave} tamaño={21} />
            <View style={[s.campanaBadge, { backgroundColor: AURORA.secciones.hoy, borderColor: color.superficie }]}>
              <Text style={s.campanaBadgeT}>3</Text>
            </View>
          </Pressable>
        </View>

        {/* Hero turquesa: kicker, título, línea, anillo, tarjeta próxima */}
        <View style={s.hero} accessibilityElementsHidden={false}>
          <View style={s.heroTop}>
            <View style={s.heroIzq}>
              <Text style={[s.heroKicker, { color: HOY_COLORES.kickerClaro }]}>{kickerFecha(FECHA)}</Text>
              <Text style={[s.heroTitulo, { color: '#FFFFFF' }]} accessibilityLiveRegion="polite">
                {tituloProgreso(resumen.dadas, resumen.total)}
              </Text>
              <Text style={[s.heroLinea, { color: HOY_COLORES.kickerClaro }]}>
                {lineaProgreso(resumen.clases)}
              </Text>
            </View>
            <AnilloProgreso
              dadas={resumen.dadas}
              total={resumen.total}
              reducirMovimiento={reducirMovimiento}
            />
          </View>

          {/* Tarjeta «Próxima»: solo si queda una por dar (el demo la oculta al completar) */}
          {proxima && (
            <View
              style={[s.prox, { backgroundColor: oscuro ? color.superficie : HOY_COLORES.proxCard, borderColor: oscuro ? color.borde : HOY_COLORES.proxBorde }]}
              accessibilityLabel={`Próxima clase: ${proxima.hora}, ${proxima.nombre}, ${proxima.modalidad === 'mensual' ? 'Mensual' : 'Individual'}`}
            >
              <View style={[s.proxIcono, { backgroundColor: oscuro ? color.superficie : HOY_COLORES.proxIconoFondo }]}>
                <Icono nombre="reloj" color={oscuro ? color.acento : HOY_COLORES.proxIconoTinta} tamaño={17} />
              </View>
              <View>
                <Text style={[s.proxHora, { color: '#FFFFFF' }]}>{proxima.hora}</Text>
                <Text style={[s.proxDet, { color: HOY_COLORES.kickerClaro }]}>
                  {proxima.nombre} · {capitalizar(proxima.modalidad)}
                </Text>
              </View>
            </View>
          )}
          {diaCompleto && (
            <Text style={[s.completo, { color: HOY_COLORES.kickerClaro }]}>
              Todas las clases del día están dadas
            </Text>
          )}
        </View>

        {/* Resumen: 3 KPI, accionables → Cobros (sin entrada dinámica: RN-web
            deja el style de función con opacity 0 si no dispara re-render) */}
        <View style={s.resumen}>
          {tarjetas.map((d) => (
            <TarjetaResumen key={d.tipo} dato={d} enAbrir={() => router.push('/cobros')} />
          ))}
        </View>

        {/* Agenda del día */}
        <View style={s.seccion}>
          <Text style={[s.seccionTitulo, { color: color.texto }]}>Agenda del día</Text>
          <Pressable onPress={() => router.push('/agenda')} accessibilityRole="link" accessibilityLabel="Ver la semana completa en Agenda">
            <Text style={[s.seccionLink, { color: '#0B6B6A' }]}>Ver semana</Text>
          </Pressable>
        </View>
        <View style={s.lista}>
          {resumen.clases.length === 0 && (
            <Text style={[s.vacio, { color: color.textoSuave }]}>
              Hoy no hay alumnos agendados
            </Text>
          )}
          {resumen.clases.map((c, i) => (
            <FilaClase
              key={c.programacionId}
              clase={c}
              enMarcar={marcar}
              enAbrir={() => {
                agenda.setOrigen({ vista: 'mes', fecha: FECHA });
                agenda.setFecha(FECHA);
                router.push(`/dia/${FECHA}`);
              }}
              retraso={RETRASO_ENTRADA.filaBase + i * RETRASO_ENTRADA.filaPaso}
              animarEntrada={!reducirMovimiento}
            />
          ))}
        </View>

        {/* Aviso de vencimientos: límite I1 explícito, destino real (Cobros) */}
        <Pressable
          onPress={() => router.push('/cobros')}
          accessibilityRole="button"
          accessibilityLabel={`${AVISO_VENCIMIENTOS.titulo}: ${AVISO_VENCIMIENTOS.detalle}, ver en Cobros`}
          style={({ pressed }) => [
            s.aviso,
            { backgroundColor: oscuro ? color.superficie : HOY_COLORES.avisoFondo },
            pressed && !reducirMovimiento ? { transform: [{ scale: 0.99 }], opacity: 0.92 } : null,
          ]}
        >
          <Icono nombre="alerta" color={HOY_COLORES.avisoTinta} tamaño={18} />
          <View style={s.avisoInfo}>
            <Text style={[s.avisoTitulo, { color: HOY_COLORES.avisoTinta }]}>{AVISO_VENCIMIENTOS.titulo}</Text>
            <Text style={[s.avisoDetalle, { color: HOY_COLORES.avisoTinta }]}>{AVISO_VENCIMIENTOS.detalle}</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Entrada escalonada + micro-festejo, con las medidas del demo */}
      <Festejo
        visible={festejo !== null}
        animar={festejo !== null}
        origenX={festejo?.x ?? 0}
        origenY={festejo?.y ?? 0}
      />
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1 },
  cont: { padding: 16, paddingBottom: 96, gap: 12 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  saludo: { fontSize: 12.5, fontWeight: '600', letterSpacing: 0.4 },
  titulo: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  campana: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  campanaBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 3,
  },
  campanaBadgeT: { color: '#FFFFFF', fontSize: 10.5, fontWeight: '700' },
  hero: {
    borderRadius: 24,
    padding: 18,
    paddingTop: 20,
    overflow: 'hidden',
    backgroundColor: '#0E7C7B',
    shadowOpacity: 0.16,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    shadowColor: '#08454A',
    elevation: 4,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroIzq: { flex: 1 },
  heroKicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  heroTitulo: { fontSize: 21, fontWeight: '800', letterSpacing: -0.2, marginTop: 2 },
  heroLinea: { fontSize: 12.5, marginTop: 3 },
  prox: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    paddingLeft: 12,
  },
  proxIcono: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  proxHora: { fontSize: 14, fontWeight: '700' },
  proxDet: { fontSize: 11.5, marginTop: 1 },
  completo: { fontSize: 12.5, fontWeight: '600', marginTop: 10 },
  resumen: { flexDirection: 'row', gap: 8, alignItems: 'stretch', flexWrap: 'nowrap' },
  seccion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  seccionTitulo: { fontSize: 16, fontWeight: '800' },
  seccionLink: { fontSize: 12.5, fontWeight: '700' },
  lista: { gap: 8 },
  vacio: { fontSize: 14, paddingVertical: 8 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    padding: 12,
    paddingLeft: 14,
    marginTop: 2,
  },
  avisoInfo: { flex: 1 },
  avisoTitulo: { fontSize: 13, fontWeight: '700' },
  avisoDetalle: { fontSize: 12 },
});
