# ENC-13 · Evidencia de Agenda I1

Candidato: rama `feat/i1-base-movil`, base `2897387`. Capturas en Chrome Kaia de la exportación web local de esta rama, datos ficticios. Para abrir mientras siga activo el servidor local: <http://localhost:4001/> → pestaña Agenda. No está publicado ni integrado a master; el servidor local no es un preview público.

| Captura | Estado | SHA-256 |
|---|---|---|
| `01-mes-390-claro.png` | Mes compacto 390×844, claro | `be82b586efd13990f62d77f0fd29de7db50cd770b6a3612680c1a0f26fe189b9` |
| `02-dia16-390-claro.png` | Día ocupado 390, claro | `be462677afc2d43121762c66da2d96e5d95f364e91f52792ccfca3628a4903f4` |
| `03-mes-320-claro.png` | Mes a 320×568, fallback lineal ≥44 px | `7b93ad5b96d595cff9b6e55214735ac5363233efa5c9b08856d6ebf3beb05265` |
| `05-mes-360-oscuro.png` | Mes 360×780, oscuro, reduced-motion | `557a428259a0220e0a472caa6d8b3775ab99da9385c4fb69d2c30654c3a2dcbd` |
| `06-dia16-360-oscuro.png` | Día ocupado 360, oscuro, reduced-motion | `30a138165ac93d2ab519ad41e12b2871e41e8103b4806c2a11d5736f4dbc000c` |
| `10-dia-320-final.png` | Día ocupado 320, claro | `426e10f92e6e815cc719fd9541a5e6e21ea65a8226be72d3cfe79373fa2668f9` |
| `13-dia-320-text200-css.png` | Día 320 con texto duplicado por CSS de inspección; aproximación web, no equivale a escala de fuente nativa | `417c03303c2f61fd0ae1703e185357691cfc16d68657b6c280ed0f0631278b3a` |
| `14-dia-vacio-320-claro.png` | Día vacío con horas, mensaje y FAB | `9aac9b0565588a7bd4e1a465d95b1c281abe4133e8d577c037cc48ce6d263335` |
| `15-agendada-rosa-360-oscuro.png` | Agendé a Rosa desde el FAB y apareció el nuevo bloque | `a3d45af3b26fcdbf4e8683b49ebe579c1cf877dc464f90a7157fc8b43fc8f3cb` |

## Recorrido observado

- Mes: grilla sin borde/fondo individual, Hoy y marcadores de modalidad; día 16 tiene punto y rombo y etiqueta accesible de 3 alumnos. A 320 px se activa lista lineal; tap abre Día.
- Día: tira semanal horizontal con objetivos de 44 px, columna de horas y bloques con inicial, nombre, hora real de inicio y modalidad. No se muestra fin supuesto. Día vacío conserva horas y CTA.
- Toqué Bruno en 16/11, abrí detalle, cambié hora de 16:00 a 17:15 con «Confirmar cambios» y vi el nuevo bloque. Repetí con retiro: diálogo explícito `confirm` en web, acepté; Bruno desapareció y el Mes pasó de 3 a 2 alumnos. La ficha y las otras programaciones permanecen (test de contrato). En un recorrido nuevo toqué «+ Agendar» desde 16/11, seleccioné a Rosa, confirmé y vi su bloque en ese día.
- Consola Chrome: 0 errores y 0 warnings tras el recorrido final; no se usó servidor ni pagos.

## Comandos y límites

- `cd apps/mobile && npm test`: 29/29, incluidos 14 focales ENC-13.
- `cd apps/mobile && npx tsc --noEmit`: sin errores.
- `cd apps/mobile && npx expo export -p web`: exportación correcta.
- `cd packages/dominio && npm test`: 22/22.
- `npx expo lint` se intentó; no había configuración. La configuración automática (temporal) reveló 4 errores preexistentes fuera de Agenda (`_layout`, `agendar`, nombres de hooks en `sesion`/`tema`) y 6 warnings. Se retiraron configuración/dependencias automáticas para no extender el alcance. **Lint global no está verde.**
- La simulación CSS de texto al 200 % es aproximada: horas completas y bloque legible con scroll, pero no prueba escala nativa real. **NO VERIFICADO**: teléfono físico, VoiceOver/TalkBack, texto 200 % nativo, contraste medido de todos los estados, QA independiente ni aceptación estética de Nico.
