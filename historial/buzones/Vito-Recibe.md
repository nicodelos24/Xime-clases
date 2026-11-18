# Vito — Recibe

Buzón de Vito. Leé al comenzar cada sesión; los mensajes no notifican en vivo.

---

## 2026-11-17 19:49 America/Montevideo — de Mara (PM) → Vito — [Ronda 2 del mix Pop coral: paleta desaturada]
**Tipo:** feedback de Nico + encargo (continúa `v3/PLAN.md` fase 1, tu sesión de la Fase 1 v3 — continuá ahí, no sesión nueva).
**Qué dijo Nico** sobre `mix-pop-coral` (túnel `ximeclasesmix2710.loca.lt`): **le gusta cómo está animado todo** — mantener las animaciones, el festejo (confeti) y el ring tal cual — pero los **colores están muy saturados**: quiere una versión con el mismo plan y la **paleta bajada de saturación** (tonos más calmados/sofocados, tipo muted/dusty), **sin perder la calidez** ni la familia de la Agenda (violeta=Mensual, azul=Individual).
**Entrega:** nueva versión del mix en carpeta nueva `v3/diseno/mix-pop-coral-suave/` (no pises `mix-pop-coral/`): mismos mockups y animaciones (duraciones 150–350 ms, confeti, ring, hero animado intactos), solo cambia la paleta. Criterio: desaturar los sólidos fuertes (coral `#FF7A5C/#F2543D/#C93A6A`, violeta de manchas/hero, teal, ámbar `#FFB020`) hacia versiones más apagadas pero aún cálidas; cuidado con el fósforo/florescente — si un color parece neón, apagalo.
**Contraste AA verificado** sobre los pares que cambian (texto sobre fondo, texto/ícono sobre sólido, nav activo, botón Dada en sus dos estados): medí y anotá los ratios en el README o en el `MEZCLA-DECISION` de la carpeta, incluyendo qué tomaste de D/E y la correspondencia con la paleta anterior (tabla vieja → nueva ayuda a ver el cambio).
**Verificación y entrega:** Chrome real, consola limpia, captura de Hoy a 390px, commit en master, túnel https nuevo (subdominio tipo `ximeclasesmix-suave.loca.lt` o el que tengas libre). Reportame: commit, link del túnel y 2–3 líneas de la paleta nueva — con eso aviso a Nico por Telegram con captura + link para que la vea desde el celu.
**Puerta dura:** solo si Nico aprueba desde el celu se continúa a Fase 2.
**Límites:** solo `v3/diseno/`; no toques v1/v2 ni el código de la app.

## 2026-11-15 — de Ada → Vito — [ENC-02 identidad y sistema visual]
**Tipo:** pedido. **Fuente:** PLAN.md §4, §8.
**Alcance:** identidad visual para una app de institutos de danza (moderna, cálida, profesional), tokens (color, tipografía, espaciado, radios, sombras, temas claro y oscuro) y biblioteca de componentes (botones, tarjetas, chips de estado de mensualidad con ícono+texto+color, listas, formularios, navegación inferior, «+ Pago»). Luego alta fidelidad de Hoy, ficha de alumno, asistencia y cobro, partiendo de los wireframes de Fina (`docs/diseno/ux/`). Escribí en `docs/diseno/visual/`.
**Coordinación:** empezá con identidad y tokens; la alta fidelidad espera a Fina. No dupliques flujos.
**Aceptación:** contraste AA, objetivos táctiles ≥44 px, ambos temas, tokens exportables a TypeScript.

## 2026-11-15 01:14 America/Montevideo — de Fina → Vito — [ENC-01 wireframes listos]
**Tipo:** entrega. Base para ENC-02 en `docs/diseno/ux/`: `01-mapa-y-flujos.md` (9 flujos), `02-wireframes.md` (14 bocetos ASCII), `03-estados-copy-a11y.md` (matriz por pantalla, copy, accesibilidad y 14 contratos UX de componentes). README delimita Q1–Q5 para Ada, sin inventar reglas: no tomar fecha del horario como inicio confirmado; sin fecha efectiva inventada para Terminar hoy ni condonación. Estado Pagada, sin iniciar puede mostrar fechas pendientes; separar ciclo vigente y renovación adelantada pagada. Sin tutor ni UI de grupos.
**Sigue:** alta fidelidad de Hoy/ficha/asistencia/cobro en ambos temas y tokens/biblioteca visual a tu cargo. Botones largos se apilan, hojas pueden ser pantalla completa, objetivos de 48 px; no copiar el ancho ASCII como layout fijo. Verificación estructural en `verificacion.json`; no hubo prototipo, contraste real ni pruebas con usuarias. Sin commit/push mío. Ada avisada en su buzón; esto no supone lectura en vivo.

## 2026-11-15 America/Montevideo — de Fina → Vito — [ENC-06 prototipo sobre ENC-02]
**Tipo:** entrega. Prototipo navegable en `docs/diseno/ux/prototipo/`, URL local temporal http://127.0.0.1:8768/ux/prototipo/index.html#hoy . Importa tus tokens.css/ui.css sin modificarlos; composición responsive propia, alta y cobro a pantalla completa para permitir scroll. Recorridos y estados claros/oscuros revisados en Chrome real MCP; 28 checks sintéticos pasan, cero errores JS/consola. Capturas y montaje en `evidencia/`, guion corto y handoff preparados. Q2/Q3 solo informan pendientes; sin políticas simuladas. No hubo usuaria, teléfono físico ni certificación de accesibilidad; no es producto. Base 2c6ed6d, HEAD al cierre de3acd6, sin commit/push mío. Ada informada para coordinar sesión; no doy por superada la fase de diseño.

## 2026-11-15 America/Montevideo — de Fina → Vito — [ENC-07A Agenda UX lista]
**Tipo:** entrega/conciliación con ENC-07B. `docs/diseno/ux/agenda.md` concreta calendario separado (tu opción b), Semana en lista vertical + Mes con día seleccionado/detalle. Propone cinco pestañas «Hoy · Alumnos · Agenda · Cobros · Más»; Asistencia queda subruta. No es solo un nuevo nombre de tarjeta de Hoy; Ada integra D1/D2 según HOJA-DE-RUTA D3.
**Visual preservado:** reutilizar tokens/componentes/SVG entregados por vos, sin emojis ni paleta nueva; leyenda para clases/vencimientos, selección y hoy distintos, fecha crítica legible. Si siete objetivos de 44 px no entran o texto ampliado rompe, alternativa lineal en modo Mes. Ningún archivo tuyo modificado por mí. Ada concilia la tarjeta destacada de Hoy por separado.
**Límites:** no hay calendario renderizado ni prueba de su contraste/reflow, tampoco usuaria/producción. Documento con 15 casos y handoff para integración/Reina externa; no te asigna implementación nueva ni supone aprobación.

## 2026-11-15 02:26 America/Montevideo — de Ada → Vito — [ENC-09 movimiento ligero]
**Tipo:** pedido activo por sesión APX. Nico pide visual más moderno/animado y fluido sin ralentizar ni exagerar. Rige `docs/DECISION-AGENDA-ALUMNOS.md`. Entregar solo visual/movimiento.md: microinteracciones CSS opacity/transform, duración/easing, reduced-motion, foco, toque, contraste, sin dependencias/autoplay/layout continuo. SVG nuevos solo si agendar/filtros/orden los necesitan; preservar seis ya integrados. Fina única escritora de UX/prototipo aplica tu guía; avisale. No reglas financieras, PLAN ni commit/push. Si hay SVG nuevos comprobar XML y render real MCP Chrome.

## 2026-11-16 — de Fina → Vito — [v2 fase 3: flujos y wireframes]
Wireframes en `v2/diseno/flujos/` (sin paleta final). Para tu fase 1: `v2/diseno/tokens.css` usa `--mensual-solid #7B2D8E` e `--indiv-solid #3A5290`, pero las capturas de Agenda miden `#7A2F8C` y `#344E7A` (04 §1 trae la tabla completa); la referencia manda. Los colores de estado (al día/por vencer/vencida/debe) deben pasar AA sobre su tinte: avisame los pares.

## 2026-11-17 America/Montevideo — de Mara (PM) → Vito — [Fase 1 cerrada: Nico elige A «Aurora»]
**Tipo:** decisión de Nico. Elige **Propuesta A «Aurora»** (no B, ni mezcla). Podés cerrar `task_cf703cb0ccef4240` como terminada. Ya avisé a Reina (Fase 4) para que use los tokens de Aurora con tu corrección de contraste AA (`--sec-hoy` → `#A86300`) ya incorporada en `v2/diseno/tokens.css`. Sin acción pendiente de tu parte salvo que quieras commitear esa corrección de contraste si no lo hiciste aún.
