# Contraste AA y alineación de tokens (Vito, 17-nov-2026)

**Herramienta:** `wcag-contrast` 3.x (npm, fórmula WCAG 2.x de luminancia relativa), script en /tmp, corrido sobre los valores de `tokens.css`. Umbrales: texto normal ≥4,5:1; bordes/iconos/componentes UI ≥3:1.

## 1. Tokens alineados a las capturas de Agenda
| Token | Antes | Ahora |
|---|---|---|
| `--mensual-solid`, `--sec-agenda` | #7B2D8E | **#7A2F8C** |
| `--indiv-solid`, `--sec-mas` | #3A5290 | **#344E7A** |
También reemplazados en `ui.js` (confeti) y `propuesta-a-aurora/estilo.css` (hero, sombra, campana). Tints/ink de modalidad sin cambios (siguen pasando).

## 2. Contraste medido
| Estado | ink/tint (texto) | blanco/solid | solid/blanco (UI ≥3) |
|---|---|---|---|
| Mensual | 8,11 ✓ | 8,04 ✓ | 8,04 ✓ |
| Individual | 8,13 ✓ | 8,34 ✓ | 8,34 ✓ |
| Al día | 6,23 ✓ | 4,93 ✓ | 4,93 ✓ |
| Vence pronto | 6,52 ✓ | **2,11 ✗** | **2,11 ✗** |
| Debe | 6,03 ✓ | 5,04 ✓ | 5,04 ✓ |
| Vencida | 5,85 ✓ | 5,44 ✓ | 5,44 ✓ |
Texto base/fondo 15,71; muted/fondo 5,56; muted/blanco 5,91 ✓.

Los 4 pares de **texto de estado (ink sobre tint) pasan AA** tal como estaban. Lo único que fallaba era el ámbar `#F2A20C` usado como color de borde/icono/fondo de nav con texto blanco (2,11:1).

## 3. Ajuste
- Nuevo token `--pronto-strong: #A86300` (blanco 4,72 ✓; sobre blanco 4,72 ✓; sobre fondo #FAF7FB 4,44, válido para UI ≥3).
- `--sec-hoy` pasa a `#A86300` (ícono blanco en nav de la propuesta B y color activo en A/B).
- Aurora: borde del aviso, tarjeta `.alumno` pronto y `.stat-vencen` usan `--pronto-strong`.
- `--pronto-solid #F2A20C` queda solo como relleno con texto oscuro (#241A2B sobre él: 7,91 ✓).
- Hero de B (degradé naranja, texto #2A1500): no se midió con herramienta; pendiente verificar en render.

## No cubierto
No medí contraste renderizado (fondos con degradé/transparencias) ni dark mode.
