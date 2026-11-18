# Clases v4 · Fase 1 — dirección visual desde cero (turquesa + pastel)

Demo navegable de **Hoy** + **Agenda (mes ⇄ semana)** a 390 px. Cero código/tokens/animaciones heredados de v1–v3.
Abrir `index.html` (hashes: `#hoy`, `#agenda-mes`, `#agenda-semana`). Capturas en `capturas/`.

## Dirección
- **Marca:** turquesa `#0E7C7B` (primario) / `#0B6B6A` (texto) / `#08454A` (profundidad del hero), sobre fondo menta muy suave `#F2F9F8`. Nada de neón ni coral.
- **Pastel:** tintes de estado (verde `#D9F1E4`, durazno `#FCE5D2`, rosa `#FADCE3`, crema `#FFF3CF`) con texto en la versión oscura del mismo tono.
- **Agenda (referencia conservada):** mismo layout que `v4/referencias/` (mes con marcas ●/◆ y leyenda; semana con «‹ Mes», tira de 7 días, línea horaria, tarjetas con inicial + hora + chip, «+ Agendar»). Solo cambian colores: violeta `#7A2F8C`→lila `#5E4285`, azul `#344E7A`→`#34607F`, acento violeta→turquesa. Tarjetas tintadas en lila/azul pastel como en la captura.
- **Íconos:** sprite SVG propio (`icons.js`, 24 px, trazo 2 redondeado) — sol, alumnos, agenda, cobros, más, campana, reloj, alerta, check, flechas, +. Marcas ● y ◆ también SVG. Cero emoji.
- **Animación (150–350 ms, `cubic-bezier(.22,.9,.36,1.02)`, solo opacity/transform):** entrada escalonada (hero → KPI → filas → aviso), ring que se llena al cambiar, micro-festejo al tocar «Dada» (check que rebota + 6 puntos pastel, 320 ms), latido del ring al completar el día, selección de día con «pop», fundido al cambiar mes⇄semana, tarjetas de semana en cascada. `prefers-reduced-motion` anula todo (y no se crean partículas).

## Contraste AA (medido; texto normal ≥ 4.5, texto grande/ícono ≥ 3)
Medido dos veces: script (fórmula WCAG) y recorrido en Chrome real de **todo el texto visible** de Hoy (antes y después de tocar «Dada»), Agenda mes y Agenda semana (110+ nodos): **0 fallas, mínimo 4.58**.

| Par (texto / fondo) | Ratio |
|---|---|
| Tinta `#1B2B30` / fondo `#F2F9F8` | 13.7 |
| Secundario `#5A6A70` / fondo | 5.3 |
| Hora semana `#4F6066` / fondo | 6.2 |
| Turquesa texto `#0B6B6A` / fondo | 5.9 |
| Blanco / turquesa `#0E7C7B` (botón Dada, FAB, día elegido, nav activo) | 5.0 |
| Blanco / hero (extremo claro `#0F8381`) | 4.6 |
| Chip Mensual `#5E4285` / `#E8E0F6` (Hoy) · `#DDD2EF` (semana) | 6.3 · 5.6 |
| Chip Individual `#34607F` / `#DCEBF6` · `#D2E3F0` | 5.5 · 5.1 |
| Dada (reposo) `#0B6B6A` / `#EAF7F5` | 5.8 |
| Verde `#2E6B4F` / `#D9F1E4` | 5.3 |
| Durazno `#8A5A12` / `#FCE5D2` | 4.9 |
| Rosa `#8E3552` / `#FADCE3` | 5.9 |
| Aviso `#7A5A00` / `#FFF3CF` | 5.8 |

Correcciones hechas al medir: lila `#6A4C93`→`#5E4285` y azul `#3E6A8A`→`#34607F` (chips daban 3.8–4.4); hora de semana (4.4→6.2); hero: se quitó la opacidad del texto y se oscureció la tarjeta «próxima» (daba 1.06 por fondo mal leído → 4.6 real).

## Honestidad
- Medido en Chrome de escritorio a 390 px, no en teléfono físico. Los gradientes se midieron en su punto más claro.
- Datos ficticios. Alumnos/Cobros/Más no están diseñados (Fase 3, tras OK de Nico): su botón muestra un aviso.
- La Agenda replica la estructura de las capturas; no es pixel-idéntica (fuente del sistema, colores nuevos) — Fina/Gino lo verifican contra `v4/referencias/` en Fase 2.
