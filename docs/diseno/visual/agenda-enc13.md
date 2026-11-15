# ENC-13 — Dirección visual Agenda: compacto + expandido

**Fecha:** 2026-11-15  
**Síntesis:** Ada a partir de la asesoría de Vito; prevalece la conciliación en `docs/ENCARGO-I1-AGENDA-ENC13-REINA.md`.  
**Base:** ENC-12 (paleta vigente); referencias de Nico (iOS Calendar compacto + Google Calendar expandido)

---

## Paleta — sin tokens nuevos

Reutilizar ENC-12 completo:

| Modalidad  | Fondo claro  | Acento claro | Fondo oscuro | Acento oscuro |
|------------|-------------|--------------|-------------|---------------|
| Mensual    | `#F1E4F5`   | `#7A2F8C`    | `#3A2142`   | `#D9A2EA`     |
| Individual | `#E8EEF8`   | `#344E7A`    | `#222D40`   | `#B8CAEF`     |

Elevación 1 (bloques evento): `box-shadow: 0 1px 2px rgba(0,0,0,0.09)` — en oscuro, sin sombra negra marcada.

---

## Estado 1 — Vista mes compacta

- Fondo de superficie plana; grilla **sin bordes ni fondos de celda**
- Números centrados; objetivo táctil mínimo 44×48 px
- **Hoy:** círculo suave de acento (outline, no relleno)
- **Día seleccionado:** círculo relleno primario (#7A2F8C)
- **Días con alumnos:** punto de 6 px centrado bajo el número, separación 3–4 px
- Sin nombres ni contadores en la grilla (no saturar)

---

## Estado 2 — Vista semana/día expandida

- Columna de horas: **52 px** de ancho
- Franja por hora: **56 px** de alto
- **Bloque de evento:**
  - Ancho mínimo: **128 px**; si no hay espacio, apilar en vez de estrechar
  - Fondo: color suave de modalidad + acento lateral de **3 px**
  - Elevación 1
  - Nombre alumno: **14 sp / 20 semibold**
  - Hora + badge: **12 sp / 16**
  - Badge: texto «Mensual» o «Individual» + color (no solo color)
  - En bloque pequeño: priorizar nombre y hora; badge pasa a línea siguiente antes de reducir tipografía

---

## Transición compacto → expandido

- Conservar fecha seleccionada como encabezado del día/semana expandido
- Animación: **200–240 ms**, expansión vertical + fundido/desplazamiento corto de bloques
- Sin zoom de toda la grilla
- `prefers-reduced-motion`: reducir o eliminar animación
- Acción accesible: alternativa a gesto (botón/tap), no depender solo de swipe

---

## Alcance

Esta guía cubre solo presentación visual. No define duración real de clases, horarios fijos ni reglas de agenda — eso es dominio de Reina.
