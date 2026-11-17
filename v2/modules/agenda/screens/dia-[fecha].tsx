import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usarTemaAgenda } from '../tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { programacionesPorOcurrencia } from '../../../packages/datos/src/logica';
import { DIAS_LUNES, etiquetaFechaLarga, lunesDe, sumarDias } from '../../../packages/datos/src/fechas';
import { HourBlock } from '../components/HourBlock';
import { ScheduleFAB } from '../components/ScheduleFAB';

const HOY = '2026-11-15';
const INICIO = 8;
const FIN = 21;
const ALTO_HORA = 80; // franja visual, no duración de clase

/** Un día por ancho; hora real de inicio ancla bloques, sin asumir hora de fin. */
export default function Dia() {
  const { color } = usarTemaAgenda();
  const { repo, agenda, refrescar } = usarSesion();
  const router = useRouter();
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const f = fecha ?? agenda.fecha;
  const scrollRef = useRef<{ scrollTo: (opts: { y: number; animated: boolean }) => void } | null>(null);
  const grupos = programacionesPorOcurrencia(repo.programaciones, repo.ocurrenciasDe(f), f);
  const lunes = lunesDe(f);
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const eventos = grupos.flatMap(g => g.programaciones.map(p => ({ p, oc: g.ocurrencia, a: repo.obtener(p.alumnoId) }))).filter(e => e.a?.activo);
  const porHora = new Map<number, typeof eventos>();
  for (const e of eventos) {
    const h = Number(e.oc.hora.slice(0, 2));
    const lista = porHora.get(h) ?? [];
    lista.push(e);
    porHora.set(h, lista);
  }
  const primeraHora = eventos.length ? Math.max(INICIO, Number(eventos[0].oc.hora.slice(0, 2)) - 1) : INICIO;
  // En web onContentSizeChange no siempre se dispara al entrar por primera vez.
  // Anclar al primer evento también al montar/cambiar fecha, sin animación.
  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollTo({ y: (primeraHora - INICIO) * ALTO_HORA, animated: false }), 100);
    return () => clearTimeout(timer);
  }, [f, primeraHora]);
  const cambiarDia = (d: string) => {
    agenda.setFecha(d);
    router.replace(`/dia/${d}`);
  };
  const volverMes = () => {
    agenda.setFecha(f);
    agenda.setModo('mes');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <View style={s.cabecera}>
        <Pressable onPress={volverMes} accessibilityRole="button" accessibilityLabel="Volver al mes" style={s.mesBtn}>
          <Text style={[s.mesTexto, { color: color.acento }]}>‹ Mes</Text>
        </Pressable>
        <Pressable onPress={() => cambiarDia(HOY)} accessibilityRole="button" accessibilityLabel="Ir a hoy" style={s.hoyBtn}>
          <Text style={[s.hoyTexto, { color: color.acento }]}>Hoy</Text>
        </Pressable>
        <Text accessibilityLabel={etiquetaFechaLarga(f)} style={[s.titulo, { color: color.texto }]}>{etiquetaFechaLarga(f)}</Text>
      </View>
      <View style={s.tira}>
        <Pressable onPress={() => cambiarDia(sumarDias(lunes, -7))} accessibilityRole="button" accessibilityLabel="Semana anterior" style={s.tiraNav}><Text style={[s.nav, { color: color.texto }]}>‹</Text></Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tiraScroll}>
        {dias.map((d, i) => (
          <Pressable key={d} onPress={() => cambiarDia(d)} accessibilityRole="button"
            accessibilityLabel={`${etiquetaFechaLarga(d)}${d === f ? ', seleccionado' : ''}`}
            accessibilityState={{ selected: d === f }}
            style={[s.diaTira, d === f && { backgroundColor: color.acento + '22' }]}>
            <Text style={[s.diaNombre, { color: color.textoSuave }]}>{DIAS_LUNES[i].slice(0, 2).toUpperCase()}</Text>
            <Text style={[s.diaNum, { color: d === HOY ? color.acento : color.texto }]}>{Number(d.slice(8))}</Text>
          </Pressable>
        ))}
        </ScrollView>
        <Pressable onPress={() => cambiarDia(sumarDias(lunes, 7))} accessibilityRole="button" accessibilityLabel="Semana siguiente" style={s.tiraNav}><Text style={[s.nav, { color: color.texto }]}>›</Text></Pressable>
      </View>
      <ScrollView ref={scrollRef as any} onContentSizeChange={() => scrollRef.current?.scrollTo({ y: (primeraHora - INICIO) * ALTO_HORA, animated: false })} contentContainerStyle={s.horasCont}>
        {Array.from({ length: FIN - INICIO + 1 }, (_, i) => INICIO + i).map(h => {
          const lista = porHora.get(h) ?? [];
          return (
            <View key={h} style={[s.franja, { borderColor: color.borde, minHeight: Math.max(ALTO_HORA, lista.length * 76) }]}>
              <Text numberOfLines={1} style={[s.hora, { color: color.textoSuave }]}>{String(h).padStart(2, '0')}:00</Text>
              <View style={[s.eventos, { paddingTop: lista.length ? Math.round(Number(lista[0].oc.hora.slice(3)) / 60 * 40) : 0 }]}>
                {lista.map(({ p, oc, a }) => a && (
                  <HourBlock key={p.id} alumno={a} programacion={p} fecha={f} hora={oc.hora}
                    enEditar={(id) => router.push(`/programacion/${id}`)}
                    enRetirar={(id) => { const r = repo.retirar(id); if (r.ok) refrescar(); }} />
                ))}
                {h === INICIO && eventos.length === 0 && (
                  <Text style={[s.vacio, { color: color.textoSuave }]}>No hay alumnos agendados para este día</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <ScheduleFAB fecha={f} enAgendar={() => {
        agenda.setOrigen({ vista: 'mes', fecha: f });
        router.push(`/agendar/${f}`);
      }} />
    </View>
  );
}

const s = StyleSheet.create({
  cabecera: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  mesBtn: { minWidth: 52, minHeight: 44, justifyContent: 'center' },
  mesTexto: { fontSize: 15, fontWeight: '700' },
  titulo: { width: '100%', fontSize: 15, fontWeight: '700', textTransform: 'capitalize', textAlign: 'center' },
  hoyBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  hoyTexto: { fontSize: 14, fontWeight: '700' },
  tira: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 8 },
  tiraNav: { width: 32, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  tiraScroll: { alignItems: 'center' },
  nav: { fontSize: 24 },
  diaTira: { width: 44, minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  diaNombre: { fontSize: 10, fontWeight: '600' },
  diaNum: { fontSize: 14, fontWeight: '700' },
  horasCont: { paddingBottom: 100 },
  franja: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 4, paddingBottom: 4, paddingRight: 12 },
  hora: { width: 72, fontSize: 12, textAlign: 'center', paddingTop: 4 },
  eventos: { flex: 1, gap: 4 },
  vacio: { fontSize: 14, padding: 8 },
});
