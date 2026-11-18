# Hoy

Pantalla Hoy v4 (Fase 3a): réplica del demo aprobado por Nico
(`v4/diseno/index.html#hoy`, captura `v4/diseno/capturas/hoy.png`) sobre el
cimiento modular de Fase 2. Paleta turquesa + pastel, íconos SVG propios, cero
emoji, animaciones sobrias 150–350 ms con `reduced-motion` respetado.

## Qué muestra (I1: fixtures, sin pagos ni asistencia real)

- **Hero turquesa** (`#0E7C7B`, degradé con extremo `#08454A`): kicker con
  fecha sin año, «N clases por dar» con región viva, línea «X clases hoy · N
  dadas», anillo SVG animado (84 px, stroke 8, 320 ms ease-out; blanco y
  latido al completar el día) y tarjeta «Próxima» (hora, nombre, modalidad),
  oculta cuando no queda ninguna por dar.
- **3 KPI blancos** con ícono en tinte pastel + punto de color: «Cobrado hoy /
  Por cobrar / Vencen hoy». I1 sin pagos: valor «—», límite nombrado en la
  nota de accesibilidad. Tocables → Cobros.
- **Agenda del día**: título + «Ver semana» (→ Agenda). Filas blancas con
  hora, avatar de iniciales tintado por modalidad, nombre, chip de modalidad
  (color + forma) y botón «Dada» (check + texto, ≥ 36 px de alto, estado
  accesible). Tocar la fila → Agenda › Día. La marca «dada» es estado visual
  compartido con la Agenda (`sesion.tsx`), no asistencia real (I2).
- **Aviso crema** de vencimientos (`#FFF3CF`, ícono + texto, no solo color):
  límite I1 explícito «Se listan al activar cobros (I2)», tocable → Cobros.
- **Micro-festejo** al dar una clase: 6 puntos pastel que brotan del botón
  (320 ms; web con keyframes, nativo estático que se desvanece). No se dispara
  con `reduced-motion`.
- **Entrada escalonada** como el demo: hero → KPI (90/150/210) → filas
  (240 + 90·i) → aviso (520), duración 320 ms, solo opacity/transform.
  Con `reduced-motion` todo aparece directo.

## Contratos y límites

- Lógica pura en `screens/textoHoy.ts` (títulos, línea, kicker, constantes de
  animación y colores del demo) con tests en `test/hoy.test.ts`. La derivación
  de las clases del día vive en `packages/datos/src/resumenHoy.ts` (con sus
  propios tests): este módulo no calcula nada que no venga del estado de
  sesión (`sesion.tsx`).
- Sin imports de otros módulos (barrera en `test/fronteras.test.ts`).
- Sin montos: el dominio de dinero (`packages/dominio`) entra con I2.
- Duración de clase: el modelo I1 no la tiene, así que el meta muestra solo la
  modalidad (sin minutos inventados; los «60 min» del demo son datos ficticios
  de la propuesta visual).
- Festejo nativo: puntos estáticos que se desvanecen (sin keyframes CSS en RN);
  en web es 1:1 con el demo. Verificado en Chrome (Expo web), no en dispositivo.
