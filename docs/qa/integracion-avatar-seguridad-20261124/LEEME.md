# Smoke real · integración avatar + seguridad

Fecha: 24-11-2026. Candidato: `feat/integracion-avatar-seguridad-20261124`.
Servidor: `http://localhost:8879/index.html` (`serve.mjs`, worktree de integración).

Comando:

```bash
node v5-diseno/smoke-integracion.mjs
```

Ejecutar desde la raíz del worktree: el script guarda por defecto en
`docs/qa/integracion-avatar-seguridad-20261124`, no dentro de `v5-diseno/`.

Navegador: Chromium headless propio de Playwright, perfil temporal, viewport móvil
390×844 y eventos táctiles reales. Chrome compartido no usado; no quedó reservado.

Cubre: carga sin errores, lista de alumnas, ficha, selección y reducción de una
imagen local, guardado y persistencia tras refresh, navegación a Semana y menú.
Refuta F5 con acciones abiertas, tras cerrar acciones, tras descartar cambios y
tras confirmar una cancelación: en los cuatro casos mide 0 hojas vivas a
0/250/350 ms desde el fin de la carga y `ximeV5.hojaAbierta=false`. También
verifica el clic del segundo chip, hashchange, motivo de cancelación persistido,
cierre/reapertura de una sola hoja y toque corto en zona vacía. Deja capturas y
`resultado.json` en esta carpeta.

Límite: verifica el flujo principal en Chromium headless móvil; no reemplaza la
revisión visual de Fina ni la prueba manual en Safari/Android.

## Cierre técnico · 24-11-2026 05:37

Candidato final: `feat/integracion-avatar-seguridad-20261124`. El SHA canónico es
el del commit de cierre; este informe y las capturas están versionados en él.
Integra el contenido de `98262bcb` por cherry-pick (`d3105d36`, parche equivalente):
el merge de `repositorio.ts` fue automático, sin conflicto ni resolución manual.
Se descartó un cambio local accidental que volvía asíncrona `listarAlumnos()`;
la interfaz y el método siguen síncronos.

Resultados finales:

| Comando | Resultado |
|---|---|
| `npm run typecheck` | verde |
| `npm test` | **225/225**, 0 fallas |
| `node verificar-deslizar.mjs` | verde; deslizar 100 cierra; estático y temblor 5 no cierran la hoja |
| `node build-check.mjs /tmp/xime-integracion-cierre-build` | build aislado generado |
| `node v5-diseno/smoke-integracion.mjs` | verde; 13 alumnas, foto persistida, asistencia y cancelación persistentes, 0 errores |

Persistencia B-01: respaldo obligatorio primero; si falla no toca el principal;
si falla el principal intenta compensar el respaldo; siembra/migración también
exigen persistencia. Los tests SEG-03 del candidato anterior quedaron reemplazados
por los de `98262bcb`, incluido el adaptador real `localStorage`.

Evidencia F5 de `resultado.json`: `conAcciones`, `trasCerrarAcciones`,
`trasDescartar` y `trasCancelar` miden `[0,0,0]` hojas vivas a 0/250/350 ms;
`hojasTrasRecarga=[]`, `ximeV5.hojaAbierta=false`, segundo chip verificado y
motivo de cancelación visible tras recargar. Captura: `06-f5-sin-hojas.png`.

Límites: no se publicó ni se usó `kaia_chrome_xime`; Chrome compartido no usado;
no quedó reservado. Sin prueba manual en Safari/Android. La URL local es efímera,
no evidencia de publicación. El build aislado queda en la carpeta temporal del chat.
