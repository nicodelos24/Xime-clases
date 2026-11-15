# ENC-11 · Publicación comprobada de demo

**Ada · 15/11/2026 · Chrome real MCP Kaia.** Cierre técnico de D3, no aprobación estética ni validación con usuaria.

## Identidad y publicación

- Demo integrada y pusheada a `master`: **`6d81cb6bd2b9993f27e20230de12c0c1b1258265`**.
- GitHub Pages: fuente `master:/docs`, build `built` del mismo SHA, `error.message=null`, verificado con `gh api repos/nicodelos24/Xime-clases/pages/builds/latest`.
- URL verificada: https://nicodelos24.github.io/Xime-clases/diseno/ux/prototipo/index.html?v=6d81cb6#agenda/mes/2026-11-15
- Manifiesto publicado SHA-256 `25997a8c17521413da9441b09643c89355e9936bbbec579a55ddd41440d5db27`; sus **43/43 archivos públicos** devolvieron 200 y coincidieron con sus hashes. Comparación con Fetch/Web Crypto desde el origen público, sin ejecutar contenido descargado.
- Revisión estructural Ada OK y QA local independiente Gino APPROVED: [ENC-10](ENC-10-DEMO.md). El manifiesto/evidencia local se conserva como histórico, sin cambiar su declaración de candidato sin commit.

## Smoke público

Contexto aislado `ada-pages-enc08r`, viewport 390×844. No se reutilizó la página local como prueba de publicación.

- Recarga y carga de 20 recursos observados (HTML, CSS, módulos JS, ocho SVG): todos 200. `agenda.css` 200; no reapareció el 404 del estado parcial.
- Hoy / Alumnos / Agenda / Cobros / Más: títulos y rutas correctos, sin overflow horizontal en este viewport.
- Filtro Mensuales y orden Individuales primero conservaron valores independientes.
- Agenda Mes/detalle → agendar Lucía → confirmar: aparece en el día; no hay acción económica en ese recorrido.
- Ver programación → retirar → confirmar: desaparece de ese día. Alumnos conserva la ficha de Lucía; filtro Todos y orden Más recientes operativos.
- Recorrido final de agendar/retirar: `programado=true`, `retirado=true`, `fichaConservada=true`, errores JS `[]`, HTTP fallidos `[]`. En recarga/navegación inicial: advertencias/errores de consola `[]`, solicitudes fallidas `[]`.
- Copia explícita: datos ficticios, sin guardado real, recarga reinicia. No hay WhatsApp real ni cobros reales.

## Intentos de herramienta documentados

Un script de smoke supuso el texto «Sí, retirar programación» y agotó espera; el diálogo real decía «Confirmar retiro de programación». Se inspeccionó el diálogo y se completó el flujo con ese control. Otro script intentó importar `node:crypto`; el entorno MCP devolvió `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`. Se reemplazó por Fetch/Web Crypto del navegador y se verificaron los 43 hashes. No se modificó la demo ni se ocultó un defecto del producto. El recorrido final completo pasó sin esos errores.

Al integrar, `git diff --cached --check` detectó dos espacios finales en la fecha del informe nuevo de Gino; se retiraron sin cambiar el dictamen ni el candidato. Comprobación posterior limpia.

## Evidencia y puerta siguiente

Capturas actuales de la URL pública: `enc11-public/pages-agenda-390.png`, `pages-dia-390.png`, `pages-alumnos-390.png`. `resumen-pages.png` compone esas tres capturas sin recortar ni reescalar su contenido, con margen y títulos externos.

**D3 cerrado técnicamente. I1 habilitada para que Nico la inicie en OpenCode externo**, según [encargo I1](../ENCARGO-I1-REINA.md). No se inició ni delegó Reina por APX. Solo base Expo/TS, contratos visuales y fixtures; I2–I5 no quedan autorizadas por esta publicación.

**NO VERIFICADO:** app móvil productiva, persistencia durable, backend/BD/Auth/RLS, concurrencia/auditoría, dispositivo físico/lector de pantalla, uso con una dueña, WhatsApp/notificaciones reales. D4 y Q2/Q3 siguen diferidos. La matriz responsive/temas y accesibilidad focal completa pertenece al QA local de ENC-10, no se atribuye a esta pasada pública.
