# Clases · identidad y sistema visual (ENC-02, propuesta v0.1)

**Autor:** Vito · **Fecha:** 15/11/2026 · **Base:** PLAN.md v2 §3–4, §7–8 y wireframes Fina `docs/diseno/ux/02-wireframes.md` (W1, W4, W7–W9). Esto es un **sistema propuesto y pantallas estáticas**, no una app ni un prototipo validado con dueñas. No incluye reglas de negocio implementadas. Valores, nombres y datos de las láminas son ficticios; importes son ejemplos de diagramación y no tarifas acordadas.

## Idea de marca

**Ritmo sereno.** Acento ciruela profundo, fondo marfil y superficies nítidas: calidez de estudio de danza sin recurrir a ilustraciones infantiles, gestos corporales o códigos de fitness. La tensión entre curvas suaves y líneas de información precisa expresa movimiento + control. Logotipo conceptual: wordmark **Clases** en sans del sistema, peso semibold, con un punto/latido que no compite con el nombre configurable del instituto. En piloto, arriba se muestra el **nombre del instituto** como contexto si se necesita, no sustituir su marca por «Clases». Ninguna foto genérica de bailarinas: el trabajo diario es leer fechas, asistir y cobrar.

- **Voz:** directa y tranquila, verbo + objeto, sin lenguaje sancionador: «Por vencer», «Vencida», «Continuar sin cobrar», «Registrar pago». No llamar «morosa» a una persona ni usar rojo como único dato.
- **Color:** el acento ciruela identifica acciones, no deuda. Semántica de estado invariable aun con marca personalizada (verde, ámbar, naranja, rojo, azul, gris con icono + texto). El dueño puede personalizar acento; `derivarMarca()` prueba variantes. Si la elección no admite texto AA sobre botones, `derivarMarca()` ajusta levemente el relleno e informa el cambio en `avisos`; la interfaz debe mostrar la variante efectiva para que la dueña la apruebe. El logo del instituto se coloca en zona reservada con tamaño máximo (144×40) y no altera las fichas.
- **Tipografía:** System (-apple-system / Roboto); números tabulares (`font-variant-numeric: tabular-nums`) para montos y fechas; mínimo de cuerpo 16 px, ayudas 14 px, etiquetas de barra inferior 12 px (no datos críticos). Respetar `fontScale`/Dynamic Type, 200 % web y reflujo sin clipping. Títulos 28/34, subtítulos 20/28, sección 18/26, cuerpo 16/24. No depender del peso de una fuente remota.
- **Forma:** espacio base 4 px, tarjetas 20 px, chips pastilla, botones 12 px. Sombras livianas solo para elevación; en oscuro bordes sustituyen las sombras. No trasladar el estilo a navegación no testeada.

## Archivos

| Archivo | Uso |
|---|---|
| [`tokens.ts`](tokens.ts) | Tokens tipados para React Native; dos temas, estados y tema personalizado. Importar desde `packages/ui` cuando exista la app, no desde el dominio. |
| [`contraste.ts`](contraste.ts) | Cálculo WCAG y derivación de marca. Un color arbitrario puede requerir ajuste/rechazo. |
| [`verificar.ts`](verificar.ts) | Comprobación de pares en ambos temas + muestras de marca: `npx tsx docs/diseno/visual/verificar.ts`. |
| [`generar-css.ts`](generar-css.ts), [`tokens.css`](tokens.css), [`ui.css`](ui.css) | Exportación CSS y estilo del prototipo de revisión, no contrato de implementación web. |
| [`componentes.md`](componentes.md) | Contratos visuales, contenido, estados, interacciones y accesibilidad. |
| [`pantallas.md`](pantallas.md) | Handoff de alta fidelidad de 4 vistas, variantes y límites. |
| [`laminas/`](laminas/) | Capturas del mockup de **Hoy**, **ficha**, **asistencia** y **cobro** en claro/oscuro, 360×780; no es UI funcional. |

### Lectura del contraste

El verificador chequea pares de texto normales ≥4.5:1 y bordes/íconos informativos ≥3:1 en superficies declaradas. Ejemplos: texto primario blanco/ciruela claro 8.04:1; tinta/crema 16.50:1; chip «Por vencer» 5.55:1; chip «Vencida» 6.00:1. La verificación algorítmica de tokens **no certifica accesibilidad integral**: no reemplaza pruebas de escala, foco, lectores, pantalla real ni revisión de marca de cada cliente. Borde decorativo tenue no comunica estado; `bordeFuerte` sí tiene mínimo 3:1. No usar color de chip sobre otro fondo ni un tono de marca sobre un fondo no verificado. En RN los bordes de foco se dibujan explícitamente y en web `:focus-visible`. En la librería: estados semánticos conservan color, icono y texto aunque se configure marca.

## Dependencias y decisiones por confirmar

Fina dejó Q1–Q5 en `docs/diseno/ux/README.md`. **No transformar esas hipótesis en reglas por el dibujo.** La pantalla de cobro muestra salida *proporcionada por el dominio*, no calcula fechas; la vista estática toma el caso explícito de renovación del plan (ciclo 18/11–17/12). El aviso WhatsApp es **manual** y el sistema no afirma entrega. Los diseños usan el viewport de Fina, 360×780; se deben revalidar textos largos, teclado, safe areas, Android/iOS, pantallas 320 px y fuente 200 %. Ni `PLAN.md` ni mockups son código productivo. La validación con usuarias/prototipo navegable corresponde al trabajo UX de Fina, no está hecha.
