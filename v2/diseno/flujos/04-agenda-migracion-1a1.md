# 04 · Agenda: migración 1:1 desde las referencias (sin cambiar su diseño)

**Fina · 16/11/2026.** La Agenda aprobada por Nico es la referencia visual del producto (PLAN v2 §2.4 y §6): `v2/referencias/agenda-mes.png` y `agenda-semana.png` son **criterio de aceptación**, no inspiración. Este documento fija lo que se mide en esas capturas, la conducta que no se negocia y una checklist de aceptación. Cualquier diferencia en la implementación es regresión.

Vinculado: la conducta (agendar no cobra, fichas canónicas, marcadores por personas) ya está especificada en `v1/docs/diseno/ux/agenda-enc13.md`; acá se migra tal cual y se ajustan los textos a las referencias.

## 1. Valores medidos en las capturas

Captura Mes: 390×844. Captura Semana/Día: 667×635 (recorte de la vista expandida; en móvil se adapta al ancho disponible conservando proporciones y tamaños de texto). Colores medidos píxel a píxel:

| Rol | Valor medido | Uso |
|---|---|---|
| Fondo de pantalla | `#FAF8FB` | ambas vistas |
| Texto principal | `#2A2430` | títulos, números de días, nombres |
| Texto secundario | `#6E6478` | días de semana, horas, leyenda, labels de pestañas inactivas |
| Líneas / bordes finos | `#E4DCE8` | separadores de hora, borde de botón «Hoy», borde de tarjetas base |
| Acento / Mensual | `#7A2F8C` | círculo de hoy, FAB, punto ●, borde y chip de tarjetas mensuales, sección Agenda activa |
| Tinte mensual | `#F1E4F5` | fondo de tarjeta mensual |
| Tinte chip mensual | `#E2CDE7` | chip «Mensual» dentro de la tarjeta |
| Individual | `#344E7A` | rombo ◆, borde y chip de tarjetas individuales |
| Tinte individual | `#E8EEF8` | fondo de tarjeta individual |
| Tinte chip individual | `#D1D9E8` | chip «Individual» |
| Avatar | fondo `#E4DCE8`, inicial `#5E2370` | círculo con inicial en tarjetas y filas |
| Superficie barra inferior | `#FFFFFF` con línea superior `#D8D8D8` | pestañas |

Contraste medido (WCAG): blanco sobre `#7A2F8C` 8,0:1; texto de chip mensual sobre su tinte 5,4:1; individual 5,9:1; secundario sobre fondo 5,3:1; hora sobre tinte mensual 4,6:1; inicial sobre avatar 8,0:1. Todo AA ✓.

### Mes compacto (agenda-mes.png)

- Encabezado: título **«Agenda»** 24 px bold (ascendentes incluidos, caja de ~22 px medida) a la izquierda (margen 16); botón **«Hoy»** arriba a la derecha: 51×43 aprox., borde 1 px `#E4DCE8`, radio ~8, texto 14 px bold en acento, fondo transparente.
- Navegación de mes: chevron `‹` y `›` (objetivo táctil ≥ 48×48), título **«Noviembre 2026»** centrado 17 px bold.
- Días de semana: **LU MA MI JU VI SÁ DO**, 12 px bold, `#6E6478`, 7 columnas iguales (~55 px c/u en 390).
- Números de día: 15–16 px semibold `#2A2430`, filas cada ~51 px, celdas de ~48 px de alto mínimo. **Sin bordes, fondos ni tarjeta por celda.**
- **Hoy:** círculo sólido de acento de ~34 px detrás del número, número blanco. **Fecha seleccionada/distinto día de retorno:** círculo suave (acento al ~20 %); si coincide con hoy, prevalece hoy.
- Marcadores debajo del número: **punto ● 6–7 px** (mensual, `#7A2F8C`) y **rombo ◆ 6–7 px** (individual, `#344E7A`), ambos si corresponden, con 3–4 px entre sí. Marcan que **al menos un alumno activo** de esa modalidad tiene clase ese día; nunca cantidades, asistencias ni vencimientos. Día sin alumnos: sin marcador.
- Leyenda visible bajo la grilla: **«● Mensual   ◆ Por clase individual»**, 12 px `#6E6478` con las formas en color. Siempre visible.
- Debajo de la leyenda, la captura deja el resto vacío: no se agregan secciones a la pantalla Mes.
- **FAB «+ Agendar»**: píldora ~113×51, fondo acento, texto blanco bold 16 px, sombra suave, margen derecho/inferior 16, por encima de la barra de pestañas.
- Barra de pestañas: **Hoy · Alumnos · Agenda · Cobros · Más**, ícono ~22 px + label 11–12 px, activa en acento, inactiva `#6E6478`, fondo blanco, línea superior de 1 px.

### Agenda expandida / Día con tira semanal (agenda-semana.png)

- Cabecera: **«‹ Mes»** en acento bold 15 px (izquierda), **«Hoy»** en acento (derecha), fecha larga centrada bold 15 px que ancla la vista. **Ojo:** la captura dice «Lunes 16 De Noviembre De 2026» (cada palabra en mayúscula: efecto de `textTransform: capitalize` de la v1). Se considera defecto tipográfico, no diseño: se migra como «Lunes 16 de noviembre de 2026». Es la única corrección intencional; si Nico la quiere literal, lo dice.
- **Tira de 7 días** con chevrones `‹`/`›` para cambiar de semana: chip por día (día de semana abreviado 10 px + número 15 px bold); día seleccionado con fondo de tinte de acento (`#EADEED`) y radio ~10; objetivo ≥ 44×48.
- Línea separadora bajo la cabecera `#E4DCE8`.
- **Columna de horas** a la izquierda (12 px `#6E6478`) y línea horizontal por hora; franja horaria de ~76–80 px a esta escala, con scroll vertical; cabecera, tira, FAB y pestañas fuera del scroll.
- **Tarjetas de alumno** alineadas a su hora, sangradas tras la columna de horas:
  - Fondo tinte de modalidad (`#F1E4F5` / `#E8EEF8`), **borde izquierdo de 3 px** en color pleno (`#7A2F8C` / `#344E7A`), radio ~10–12, sombra muy leve, alto mínimo ~64 px.
  - Contenido: avatar circular 36 px (fondo `#E4DCE8`, inicial `#5E2370` bold), **nombre 14–15 px semibold**, debajo hora de inicio 12–13 px `#6E6478` + **chip de modalidad** («Mensual» / «Individual», 11–12 px semibold sobre `#E2CDE7` / `#D1D9E8`).
  - Dos alumnos a la misma hora = dos tarjetas apiladas con 4–6 px de separación, no una mezclada.
- FAB «+ Agendar» idéntico al del Mes.
- La foto de referencia es de escritorio: **no** se copian sus siete columnas de eventos ni su densidad; en móvil la vista es de un día con tira para cambiar de día (igual que `agenda-semana.png`, que también muestra un solo día con su tira).

### Tema oscuro

Las capturas son solo claras. El oscuro mantiene la misma estructura y usa los pares de modalidad ya definidos por Vito (ENC-12): mensual `#D9A2EA` sobre `#3A2142`, individual `#B8CAEF` sobre `#222D40`, acento `#D9A2EA`, fondo `#181219`, superficie `#241B2B`, borde `#3A2E3F`, texto `#F2ECF5`, secundario `#B3A6BD`. Cualquier cambio de estos pares es de Vito, no de implementación.

**Desvío a corregir:** `v2/diseno/tokens.css` (fase 1) trae `--mensual-solid: #7B2D8E` e `--indiv-solid: #3A5290`, que no coinciden con lo medido en las referencias (`#7A2F8C`, `#344E7A`). Alinear los tokens a los valores medidos; la referencia manda.

## 2. Conducta congelada (no es diseño, es la decisión vigente)

1. Tap en cualquier fecha del Mes (incluida vacía) → abre la vista expandida anclada a esa fecha, con su tira semanal. Volver con «‹ Mes» (o gesto desde la cabecera) restaura mes, fecha y foco.
2. El Mes **no** muestra nombres, horarios, contadores «0» ni texto de eventos; los marcadores no son números.
3. Tap en tarjeta → edición/detalle de esa programación (no ficha ni cobro directo); retirar programación pide confirmación y no borra ficha, historial ni pago.
4. «+ Agendar» precarga la fecha (y hora si hay clase existente) y exige confirmación; agendar no cobra, no inicia ciclo, no marca asistencia.
5. Día vacío: franja horaria visible + «No hay alumnos agendados para este día» + FAB. Nunca pantalla vacía sin salida.
6. Los vencimientos no aparecen como bloques ni puntos de la Agenda; viven en Hoy y Cobros.
7. Hora de fin: la referencia muestra solo la hora de inicio; se muestra inicio y, si el dominio lo tiene, el fin. No inventar duración (duda A2).

## 3. Textos congelados (copiar literal desde las capturas)

«Agenda» · «Hoy» · «Noviembre 2026» (formato mes + año, capitalizado) · «LU MA MI JU VI SÁ DO» · «● Mensual» · «◆ Por clase individual» · «+ Agendar» · «‹ Mes» · «Lunes 16 de noviembre de 2026» (fecha larga; ver nota de mayúsculas en §1) · «Mensual» / «Individual» en chips de tarjeta.

## 4. Checklist de aceptación de la migración (para Gino, fase 4)

| # | Verificación | Referencia |
|---|---|---|
| AG-01 | Mes: sin bordes ni fondos de celda; números + marcadores; leyenda visible | agenda-mes.png |
| AG-02 | Hoy = círculo sólido acento ~34 px con número blanco; solo un círculo sólido | agenda-mes.png |
| AG-03 | Punto 6–7 px violeta y rombo azul, ambos si corresponde, ninguno en día vacío | agenda-mes.png |
| AG-04 | Colores exactos de la tabla §1 en tema claro | medición |
| AG-05 | FAB píldora acento «+ Agendar» sobre la barra, derecha | ambas |
| AG-06 | Barra de 5 pestañas con activa en acento | ambas |
| AG-07 | Tap en fecha → expandida anclada; «‹ Mes» vuelve a la misma fecha | conducta §2.1 |
| AG-08 | Tarjeta: tinte + borde izquierdo 3 px, avatar 36, nombre semibold, hora + chip de modalidad | agenda-semana.png |
| AG-09 | Misma hora, dos alumnos → dos tarjetas apiladas | agenda-semana.png |
| AG-10 | Día vacío con mensaje y FAB; sin salto de scroll | conducta §2.5 |
| AG-11 | 320/360/390 px, claro y oscuro, texto al 200 %: objetivos ≥ 44 px, sin recortes; fallback lineal si 7×44 no entra | 05 |
| AG-12 | Sin contadores, nombres ni vencimientos en la grilla mensual | conducta §2.2 |
| AG-13 | reduced-motion: transiciones Mes↔expandida instantáneas; sin bucles | 05 |

Una diferencia de color, forma, texto o conducta respecto de las capturas y esta tabla **no integra** (regla anti-rotura de `ARQUITECTURA.md` §3: captura de referencia por módulo).
