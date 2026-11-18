import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usarTemaAgenda } from '../tema';
import { usarSesion } from '../../../packages/datos/src/sesion';
import { etiquetaFechaLarga } from '../../../packages/datos/src/fechas';
import { AvatarInitials } from '../../../packages/ui/src/components/AvatarInitials';
import { Icono } from '../../../packages/ui/src/components/Icono';
import type { Modalidad } from '../../../packages/datos/src/tipos';

/** Agendar: buscar ficha canónica, filtro modalidad, selección única, confirmación. */
export default function Agendar() {
  const { color } = usarTemaAgenda();
  const { repo, agenda, refrescar } = usarSesion();
  const router = useRouter();
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const f = fecha ?? agenda.fecha;

  const [busqueda, setBusqueda] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad | 'todas'>('todas');
  const [seleccion, setSeleccion] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [enviando, setEnviando] = useState(false);

  const candidatos = useMemo(() => {
    const lista = repo.listar('todos', 'recientes').filter((a) => a.activo);
    const q = busqueda.trim().toLowerCase();
    return lista.filter(
      (a) =>
        (modalidad === 'todas' || a.modalidad === modalidad) &&
        (!q || a.nombre.toLowerCase().includes(q)),
    );
  }, [repo, busqueda, modalidad]);

  const ocurrencia = repo.ocurrenciasDe(f).find((o) => o.estado === 'programada');
  const requiereHora = !ocurrencia;
  const [hora, setHora] = useState('');

  const confirmar = () => {
    if (!seleccion || enviando) return; // un solo envío: evita doble toque
    setEnviando(true);
    let ocId = ocurrencia?.id;
    let creadaEnEsteIntento = false;
    if (requiereHora) {
      // En I1 sin ocurrencia ese día se exige hora concreta (crea ocurrencia de fixture).
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        setError('Escribí la hora (HH:mm) para ese día concreto');
        setEnviando(false);
        return;
      }
      const nueva = {
        id: `o-${f}-${hora}`,
        fecha: f,
        hora,
        estado: 'programada' as const,
      };
      repo.ocurrencias.push(nueva);
      ocId = nueva.id;
      creadaEnEsteIntento = true;
    }
    const r = repo.agendar(seleccion, ocId as string, `prog-${seleccion}-${ocId}`);
    if (!r.ok) {
      // El error conserva el borrador y no deja una ocurrencia huérfana.
      if (creadaEnEsteIntento) {
        const i = repo.ocurrencias.findIndex(o => o.id === ocId);
        if (i >= 0) repo.ocurrencias.splice(i, 1);
      }
      setError(r.error.mensaje);
      setEnviando(false);
      return;
    }
    refrescar();
    // Vuelve a la misma fecha/vista de la que vino.
    if (agenda.origen) {
      agenda.setModo(agenda.origen.vista);
      agenda.setFecha(agenda.origen.fecha);
    }
    agenda.setFecha(f);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: color.fondo }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.cont}>
        <View style={[s.fecha, { backgroundColor: color.superficie, borderColor: color.borde }]}>
          <Text style={[s.fechaTexto, { color: color.texto }]}>{etiquetaFechaLarga(f)}</Text>
          {requiereHora ? (
            <TextInput
              value={hora}
              onChangeText={setHora}
              placeholder="HH:mm (hora obligatoria)"
              accessibilityLabel="Hora de la clase para ese día"
              style={[s.input, { color: color.texto, borderColor: color.borde }]}
            />
          ) : (
            <Text style={[s.horaFija, { color: color.textoSuave }]}>
              Clase existente a las {ocurrencia.hora}
            </Text>
          )}
        </View>
        {error && <Text accessibilityRole="alert" style={[s.error, { color: '#B3261E' }]}>{error}</Text>}
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar ficha por nombre"
          accessibilityLabel="Buscar ficha"
          style={[s.input, { color: color.texto, borderColor: color.borde }]}
        />
        <View style={s.filtros}>
          {(['todas', 'mensual', 'individual'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setModalidad(m)}
              accessibilityRole="button"
              accessibilityState={{ selected: modalidad === m }}
              style={[s.pill, { borderColor: color.borde }, modalidad === m && { backgroundColor: color.acento }]}
            >
              <Text style={[s.pillTexto, modalidad === m && { color: color.sobreAcento }]}>
                {m === 'todas' ? 'Todas' : m === 'mensual' ? 'Mensuales' : 'Individuales'}
              </Text>
            </Pressable>
          ))}
        </View>
        {candidatos.length === 0 && (
          <Text style={[s.vacio, { color: color.textoSuave }]}>
            Sin resultados. Podés crear la ficha desde Alumnos (alta canónica).
          </Text>
        )}
        {candidatos.map((a) => {
          const yaEsta = ocurrencia ? repo.programacionDe(a.id, ocurrencia.id) : false;
          const elegido = seleccion === a.id;
          return (
            <Pressable
              key={a.id}
              onPress={() => {
                if (yaEsta) return; // marcado preventivamente, no duplica
                setSeleccion(a.id);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: elegido }}
              accessibilityLabel={
                `${a.nombre}` +
                (yaEsta ? ', ya programado para este horario' : '')
              }
              style={[
                s.fila,
                { backgroundColor: color.superficie, borderColor: color.borde },
                elegido && { borderColor: color.acento, borderWidth: 2 },
              ]}
            >
              <AvatarInitials nombre={a.nombre} />
              <View style={s.info}>
                <Text style={[s.nombre, { color: color.texto }]}>{a.nombre}</Text>
                <Text style={[s.metaTexto, { color: color.textoSuave }]}>
                  {a.modalidad === 'mensual' ? 'Mensual' : 'Individual'}
                  {yaEsta ? ' · ya programado para este horario' : ''}
                </Text>
              </View>
              {yaEsta && (
                <Icono nombre="check" color={color.textoSuave} tamaño={16} />
              )}
            </Pressable>
          );
        })}
        <Pressable
          onPress={confirmar}
          disabled={!seleccion || enviando}
          accessibilityRole="button"
          accessibilityLabel={`Confirmar agendar de ${seleccion ? repo.obtener(seleccion)?.nombre : ''} para ${f}`}
          style={[
            s.cta,
            { backgroundColor: color.acento, opacity: !seleccion || enviando ? 0.5 : 1 },
          ]}
        >
          <Text style={{ color: color.sobreAcento, fontWeight: '700', fontSize: 16 }}>
            {enviando ? 'Agendando…' : `Confirmar agendar para ${f}`}
          </Text>
        </Pressable>
        <Text style={[s.legal, { color: color.textoSuave }]}>
          Demo con datos ficticios; sin conexión, no se afirma guardado. Agendar no confirma asistencia ni toca pagos.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, gap: 12, paddingBottom: 40 },
  fecha: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  fechaTexto: { fontSize: 16, fontWeight: '700' },
  horaFija: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    fontSize: 15,
  },
  error: { fontSize: 14, fontWeight: '600' },
  filtros: { flexDirection: 'row', gap: 8 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, minHeight: 40, justifyContent: 'center' },
  pillTexto: { fontSize: 13, fontWeight: '600', color: '#5A6A70' },
  vacio: { fontSize: 14 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
  },
  info: { flex: 1 },
  nombre: { fontSize: 15, fontWeight: '600' },
  metaTexto: { fontSize: 13 },
  cta: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 12 },
  legal: { fontSize: 12 },
});
