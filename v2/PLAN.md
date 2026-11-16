# Clases v2 — plan

**Motivo:** la v1 (en `../v1/`) no convence en diseño / interfaz. v2 rehace la capa visual y de UX.
**Referencia:** v1 queda como fuente de reglas de negocio (`v1/PLAN.md`) y de dominio (`v1/packages/dominio`), a reutilizar solo si sigue sirviendo.

## Fases
1. **Diagnóstico (Nico + Fina):** qué no gusta de la v1 (capturas, pantallas, sensaciones). Salida: lista de problemas y 3 principios de diseño.
2. **Dirección visual (Vito):** 2 propuestas de estilo (paleta, tipografía, componentes clave) sobre Hoy y Agenda. Nico elige una.
3. **Flujos y wireframes (Fina):** Hoy, Agenda, Alumnos, Cobros, Más; simplificar lo que sobra.
4. **Decisión técnica (Ada):** ¿se reutiliza app Expo + dominio de v1 o se parte limpio? Salida: nota de arquitectura corta.
5. **Prototipo navegable v2 (Reina):** pantallas elegidas, validado por Nico antes de construir lógica.
6. **QA (Gino):** revisión independiente del prototipo.

## Riesgos
- Rediseñar sin criterio claro de qué falla → fase 1 obligatoria antes de diseñar.
- Reusar código de v1 arrastra decisiones de UI → Ada decide en fase 4.
- GitHub Pages apuntaba a `/docs` (ahora `v1/docs`): demo pública caída hasta reconfigurar.
