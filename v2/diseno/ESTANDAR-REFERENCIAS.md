# Estándar visual móvil — referencias y pautas aplicadas a Aurora (Vito, 17-nov-2026)

**Qué es:** el estándar v2 para Xime-clases (RN/Expo, módulos `v2/modules/*`), basado en investigación web real (fuentes al final). No reemplaza los documentos existentes, los ancla en referencias: complementa `tokens.css`/`tokens.ts` (color), `GUIA-ANIMACION.md` (movimiento), `CONTRASTE-AA.md` (medición).
**Audiencia:** Fina (UX), Reina (implementación) y las revisiones de Hoy (hecha), Alumnos, Cobros y Más.
**Decisiones ya tomadas que esto respeta:** Aurora (no se reemplaza, se refina), familia de la Agenda (violeta=Mensual, azul=Individual), animaciones 150–350 ms, contraste AA (con `#A86300` en los tonos ámbar), íconos SVG propios.

## 1 · Pautas de plataforma (resumen aplicable)

### Material Design 3 (motion)
- M3 2025–2026 (*GM3 Expressive*) migró a **springs físicos**; el sistema de easing/duración clásico queda "para transiciones". Implicancia práctica: para acciones de toque (botón «Dada», chips, pestañas activa) un **spring suave** es hoy el estándar de la industria, no un gustito. Nuestro `--ease-spring` + spring suave de la guía van en esa dirección: mantenerlo.
- Duraciones M3: short 50–200 ms, medium 250–400 ms, long 450–600 ms. Nuestra banda 150–350 ms calza bien; el anillo inicial (900 ms) es la excepción que M3 llama *ambient/extra-long* (700–1000 ms, reservada a transiciones sin input del usuario): correcta y hay que cuidar que quede en una sola ocasión (primera apertura), nunca en cada marcado.
- Curvas de referencia si algún día se portan tokens M3 literales: standard `cubic-bezier(0.2, 0, 0, 1)`; emphasized-decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)` (entra al final). Nuestra `--ease-out` `(.22,1,.36,1)` es más pronunciada que la standard de M3: está bien para elementos chicos; para entradas de pantalla completas consideramos `(.2,0,0,1)`.
- M3 también formaliza **estados de interacción** (hover/pressed/focus) y regla de que la *duración depende del tamaño del cambio*, no de la importancia.

### Apple HIG (iOS)
- **Feedback de interacción**: cada toque responde visualmente dentro del mismo frame; estados *pressed* visibles (escala, color o subrayado), no solo un highlight automático. La guía ya lo pide (escala 0,96–0,98): estándar confirmado.
- **Legibilidad dinámica**: tamaños de texto mínimo legible 11 pt; títulos jerárquicos con 1–2 pesos (reguler/bold). Hoy cumple (17/28/14/13).
- **Peso de la distinción**: iOS confía en *peso* más que en color para jerarquía dentro de una tarjeta; el color reservado para significado. Aurora ya hace esto bien (valor en 800, etiquetas en muted).
- **Bordes y sombras suaves en iOS**: sombras difusas de bajo alfa (0,06–0,15) con radio grande; elevación por tono en oscuro en vez de sombras. Coincide con la implementación actual.

### Tendencias 2025–2026 (referentes de agenda/hábitos/finanzas)
- **Progreso en anillo/ring** como objeto central del dashboard de "hoy" (Monzo Summary, apps de hábitos tipo Streaks/Fabulous): un anillo grande, número adentro, leyenda corta al lado. Aurora ya lo tiene: es el patrón correcto y de industria para este tipo de app.
- **Tarjetas resumen tipo KPI** (Revolut, Monzo): 3 chips/tarjetas en fila, cada una con un *acento lateral o ícono de color*, valor grande y etiqueta pequeña. Los tres estados de pago de Aurora mapean exacto a este patrón.
- **Acentos de color como rol, no decoración**: color de estado exclusivo para significado (verde/ámbar/magenta/rojo en finanzas: al día/por cobrar/deuda/vencida). Aurora ya lo cumple con pares tint+ink AA.
- **"Dopamine" bien hecha**: micro-celebraciones en logros reales (Robinhood confetti al primer trade, Monzo round-up): partículas breves, ≤400 ms, disparadas por acción del usuario. El Festejo de Aurora entra exacto en ese molde; el riesgo documentado de Robinhood (confetti por *todo* abarata) confirma nuestra regla: solo en hitos, no en cada toque.
- **Bottom navigation con acción primaria en la zona del pulgar** (thumb zone: 75 % de interacciones son una mano, zona cómoda = tercio inferior). Aurora A ya cumple; regla a mantener en módulos futuros: nada de acciones primarias arriba del midline de la pantalla.
- **Glassmorphism con moderación** y **dark mode como primera clase** (Muzli 2026): nada de vidrio en Aurora (correcto para datos duros), y el oscuro ya tiene par de colores propio (tokens `oscuro`), no es una inversión del claro: estándar confirmado.
- **Confianza en apps de dinero** (gummble 2026, fintech): estados explícitos de confirmación, jerarquía clara, densidad progresiva. Implicancia para Cobros: mostrar primero resumen (3 KPI), detalles on-demand; confirmación visible al registrar pago (el Festejo sirve).

## 2 · Pautas de íconos SVG (regla de Nico: cero emoji, SVG personalizados)

Librería/set: los íconos ya son set propio (`v2/packages/ui/src/components/Icono.tsx`, 24×24, stroke) y el prototipo tiene 17 en `v2/diseno/icons.js`. La política es **un solo set propio, nunca mezclar sets**, y cubrir los módulos antes de codearlos (ver inventario al final).

- **Estilo:** línea (stroke), no relleno, siguiendo la metáfora de "línea con toque" de Aurora. Grosor base **1,8** a 24 px de viewBox; máx 2,4 en checks de confirmación pequeños (14 px). Nunca mezclar grosores entre íconos que conviven.
- **Consistencia geométrica:** canvas 24×24, cap y join `round`, esquinas redondeadas en paths; grilla implícita de 2 px; el punto/rombo de forma auxiliar mide 8 px en la vista, no en el SVG.
- **Cuándo color y cuándo neutro:** el ícono **hereda el color del texto que acompaña** (`currentColor`) salvo que sea indicador de estado (alerta de vencida, check de "Dada", punto de sección) — ahí lleva el color del estado. La regla ya está en el header del componente: "el color lo decide quien lo usa, el ícono nunca lo fija". Confirmarla como pauta: un ícono solo lleva color propio cuando **informa** (rojo de vencida, verde de al día); si acompaña a texto que ya explica, va neutro.
- **Toque de color moderado** (lo que Nico pide): máximo 1–2 íconos con color por tarjeta/pantalla visible; el resto neutro. El fondo tint detrás del ícono (como en TarjetaResumen, 26×26 tint+ink) es la forma aprobada de "toque" sin saturar.
- **Nunca**: emoji en UI (ni como ícono ni como decoración de estado); íconos de Libros de terceros con grosores distintos; relleno sólido en íconos de navegación (rompe la familia).
- **Accesibilidad:** los íconos decorativos van `accessibilityElementsHidden`; el que informa lleva `accessibilityLabel` o va acompañado de texto que lo haga (regla ya aplicada: "ícono + texto + color siempre").

### Inventario mínimo para los módulos que vienen (agregar al set propio)
- **Alumnos:** buscador (lupa), más (+), editar (lápiz), contacto (teléfono), borrado (basura), filtro (líneas), cheque/estado, WhatsApp (el del sistema, si se linkea), flechas.
- **Cobros:** dinero (ya está), calendario-vencimiento (agenda+reloj), lista de cuotas, timbre de "aviso", cheque verde de pagado, flecha de historial.
- **Más:** configuración (engranaje), tema (luna/sol), ayuda (?), salida/logout, perfil.
Estilo exacto igual al de `Icono.tsx`; si un ícono se vuelve muy complejo (WhatsApp), se admite versión simplificada de una marca en un solo trazo.

## 3 · Qué ya cumple Aurora y qué hay que ajustar (por patrón)

| Patrón | Dónde está | Estado |
|---|---|---|
| Anillo de progreso como hero | `AnilloProgreso.tsx` | ✅ patrón correcto (Monzo/Streaks), SSOT de accesibilidad y movimiento reducido hecho |
| Tarjetas KPI con acento lateral | `TarjetaResumen.tsx` | ✅ patrón fintech 2026, borde 3 px + tint + ink AA |
| Micro-celebración discreta | `Festejo.tsx` | ✅ breve, solo transform/opacity, apagable; 240 ms c/u |
| Estados con forma+texto+color | `ModalityBadge`, `FilaClase` | ✅ punto/rombo + texto + color, no solo color |
| Objeto táctil ≥44 px | `dadaBtn` 72×44, campana 48 | ✅ |
| Sombras suaves iOS | hero 0,15/8, tarjeta 0,06/3 | ✅ |
| Duraciones/easings | guía + tokens | ✅ banda 150–350 ms + spring en acciones de toque |
| Feedback de toque (pressed) | guía lo pide (0,96–0,98) | ⚠️ Falta confirmar que el código lo aplique en todas las tarjetas/filas (solo `dadaBtn` tiene estados visibles claros; el resto de Pressables no muestra cambio de color/escala en el snapshot). |
| Clave de accesibilidad de texto | títulos | ✅ jerarquía 800/600/500 coherente |
| Color con significado | tokens | ✅ pares tint+ink AA medidos |
| Densidad progresiva | resumen→detalle | ✅ Hoy muestra 3 KPI, el detalle en Cobros/Agenda |
| Colores de marca usados como decoración | campana badge rojo fijo `#C62F36` | ⚠️ rojo de "vencida" usado como notificación; es color con significado fuerte en esta app, mejor `vencida-tint`+ink o un rojo propio de "aviso" para no diluir el significado de rojo = deuda vencida. |

## 4 · Hallazgos del review del módulo Hoy (con sugerencia aplicable para Reina)

La comparación se hizo contra `v2/diseno/capturas/a-hoy.png` (prototipo Aurora, 460×900) y contra el estándar de la sección 3. El módulo está en `.worktrees/fase5-modulos/v2/modules/hoy/` (rama `feat/fase5-modulos`), **solo lectura, nada tocado**.

1. **El hero de Aurora perdió el degradé y se ve plano.** En la captura el bloque "Clases de hoy" es un degradé violeta (`#9A54AC → #7A2F8C` aprox) con una forma suave; el código `screens/hoy.tsx` usa un `backgroundColor: '#7A2F8C'` plano. Impacto visual directo (es el elemento más grande de la pantalla, el que hace "dopamínico" a Aurora). Sugerencia para Reina: restaurar el degradé de la captura, exactamente los mismos stops que el prototipo (`estilo.css` de `propuesta-a-aurora`), con `LinearGradient` de `expo-linear-gradient` en el StyleSheet (comportamiento ya medido en capturas, AA no cambia: el texto blanco pasa 4,5:1 sobre ambos extremos).

2. **La campana no hace nada y el badge está "pegado" con rojo fijo.** El botón `s.campana` es un `View` sin handler (no navega a nada) y el badge tiene `#C62F36` hardcodeado. Sugerencia: (a) `Pressable` con pressed state (escala 0,96 + feedback visual del estándar §3) que navegue a la vista de notificaciones o desactive el badge si no hay destino real en I1; (b) reemplazar el rojo fijo por `AURORA.vencida` o por un token de "aviso" si se quiere diferenciar del rojo de deuda vencida (§3, último ítem).

3. **Los tres KPI muestran "—".** Es honesto para I1 (sin pagos reales), pero el diseño pide que ese espacio transmita el estado del negocio. Sugerencia: mantener el valor placeholder pero con nota visible (ya está) y un **toque que abra Cobros** (un `Pressable` que navegue con router.push). Hoy la tarjeta es un `View` estático: en el estándar de fintech 2026 los KPI son accionables (patrón Revolut/Monzo). Acción mínima para I1: que al tocar naveguen a Cobros (vacío), no que queden muertas.

4. **El aviso de vencimientos perdió el chevron y la jerarquía.** En la captura es una fila táctil con `>` a la derecha que anticipa navegación; el código lo muestra como caja estática. Sugerencia: `Pressable` + `Icono chevronDer` (ya existe en el set) a la derecha + pressed scale; el destino en I2.

5. **`FilaClase` y `TarjetaResumen` muestran fondo blanco en código donde la captura pide tint por estado.** `TarjetaResumen` fuerza `backgroundColor: '#FFFFFF'` (duplicado además con el del StyleSheet); `FilaClase` usa `par.fondo` (tint). Coherente en todos: la captura muestra los KPI blancos y las filas tintadas; está bien **si es decisión consciente** (KPI blancos, filas tint). Dejarlo escrito así en el README del módulo para que no se "uniformice" después sin querer. La duplicación de `#FFFFFF` es menor: quitar la del inline.

6. **Detalles menores (puntos de pauta, no urgencias):**
   - `Festejo` usa `top: 300` fijo: en pantallas más bajas las partículas quedan lejos del botón que las disparó. Cambiar a un valor relativo o pasar el ancho/alto del botón como prop.
   - El `accessibilityLabel` de `FilaClase.dadaBtn` no cambia con el estado (siempre "Marcar… como dada"): agregar el estado (dada/no dada) al label cuando `dada` es true, aunque ya se comunica con `accessibilityState.checked`.
   - `saludoPorHora(16)` está hardcodeado (viene de los fixtures I1); cuando exista reloj real, usarlo. No urgente.

## 5 · Fuentes (investigación real, web)

- Material Design 3 — Easing & duration tokens (m3.material.io, vía snapshot del md3-reference-hub, 2025-09-26): duraciones short/medium/long/extra-long, sets standard/emphasized, nota de migración a springs (GM3 Expressive).
- Muzli (Eyal Zuri, abr-2026) — *Mobile App Design Trends 2026: UI Patterns*: thumb zone (75 % una mano, Hoober 2025), bottom sheets, glassmorphism disciplinado, dark mode como primera clase, micro-interacciones con haptics, bottom-centric.
- Gummble (2026) — *15 Best Finance App Designs 2026* (Monzo, Revolut, YNAB, Robinhood, Wise): anillos de progreso en dashboards, KPI accionables, confetti en hitos, color con significado, confianza por estados explícitos.
- Contraste: medición propia previa (`CONTRASTE-AA.md`, wcag-contrast 3.x) — pares tint/ink AA ya verificados; `#A86300` corregido.
