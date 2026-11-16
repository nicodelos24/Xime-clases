# apps/mobile — base móvil I1

Base Expo / React Native / TypeScript con datos ficticios explícitos (unidad I1, encargo `docs/ENCARGO-I1-REINA.md` + adenda visual `docs/ENCARGO-I1-AGENDA-VISUAL-REINA.md`).

## Responsabilidad

- Cinco destinos: **Hoy · Alumnos · Agenda · Cobros · Más** (Expo Router).
- **Agenda** es el eje: Semana como calendario escaneable de personas, Mes como cuadrícula con resumen, Día con alumnos por ocurrencia, y Agendar sobre ficha canónica.
- **Alumnos**: fichas canónicas conservadas aunque dejen de venir; filtro (Todos / Mensuales / Por clase individual) y orden (Más recientes / Mensuales primero / Por clase primero) **independientes entre sí**.

## Reglas que consume (PLAN.md §3, DECISION-AGENDA-ALUMNOS.md)

- Alumno ≠ modalidad ≠ programación ≠ clase efectiva ≠ pago. Agendar/retirar **solo** toca la relación alumno–ocurrencia: no confirma asistencia, no inicia mensualidad, no genera deuda ni cobra.
- Retirar no borra ficha ni ocurrencia; una falta no prorroga ni penaliza.
- Una clase cancelada no cuenta como «vienen»; anti-duplicado por relación activa + clave idempotente (doble toque).
- Fechas locales AAAA-MM-DD (America/Montevideo), es-UY.

## Límites (fuera de I1)

- Sin Supabase/SQL/Auth/RLS, sin persistencia entre sesiones, sin pagos ni comandos financieros reales, sin notificaciones ni WhatsApp real, sin Q2/Q3. Los datos son ficticios y los cambios viven solo en memoria.

## Cómo probarlo

```bash
cd apps/mobile
npm test            # lógica de datos (node --test, 15 pruebas)
npx tsc --noEmit    # tipos
npx expo start      # app (Expo Go / dev build); también npx expo export -p web
```

## Estructura

- `app/` — rutas: `(tabs)/` (hoy, alumnos, agenda, cobros, más), `dia/[fecha]`, `agendar/[fecha]`, `ficha/[id]`.
- `src/datos/` — tipos, lógica pura, fechas, contratos de repos (`repositorios.ts`), fixtures y sesión.
- `src/componentes/` — `MonthDayCell`, `DayStrip`, `ScheduledStudentRow`, `ModalityBadge`, `AvatarInitials`, `ScheduleFAB`.
- `src/tema/` — tokens (paleta AA de Vito por modalidad) y proveedor claro/oscuro + reduced-motion.
- `testo/` — pruebas con `node --test`.
