# Smoke real · integración avatar + seguridad

Fecha: 24-11-2026. Candidato: `feat/integracion-avatar-seguridad-20261124`.

Comando:

```bash
node v5-diseno/smoke-integracion.mjs
```

Ejecutar desde la raíz del worktree: el script guarda por defecto en
`docs/qa/integracion-avatar-seguridad-20261124`, no dentro de `v5-diseno/`.

Navegador: Chromium headless propio de Playwright, perfil temporal, viewport móvil
390×844 y eventos táctiles reales. No usa `kaia_chrome_xime` ni el perfil compartido.

Cubre: carga sin errores, lista de alumnas, ficha, selección y reducción de una
imagen local, guardado y persistencia tras refresh, navegación a Semana, menú de
clase, cierre y reapertura de una sola hoja, y toque corto en zona vacía.
Deja capturas y `resultado.json` en esta carpeta.

Límite: verifica el flujo principal en Chromium headless móvil; no reemplaza la
revisión visual de Fina ni la prueba manual en Safari/Android.
