# ENC-07B · Dirección visual: Agenda e iconografía

**Propuesta visual implementable · Vito · 15/11/2026.** Basada en ENC-02 (`tokens.ts`, `componentes.md`), UX ENC-01/03, y lectura del handoff y prototipo ENC-06 sin modificarlos. Repositorio leído en `master`, HEAD `e553ac0178c3f6b9a58205f54f3040f7ed5f0872`; árbol inicialmente limpio salvo `.apc/` ajeno (preservado). Cambios de este encargo se limitan a este documento y `iconos/*.svg`. **No modifican** prototipo ni PLAN ni documentos de Fina. Propuesta visual, no decisión de producto, UX aprobada ni implementación integrada.

## Dirección: más color, calma y guía visual

La base «Ritmo sereno» conserva legibilidad, adulto/profesional. Aumentar la sensación acogedora y orientar a una dueña poco tecnológica por **color en superficies y pistas semánticas**, no por emojis, ilustración ornamental ni saturación de botones:

- Marfil `#FBF7F4` (fondo) y ciruela `#7A2F8C` (acción en claro); lavanda suave `#F1E4F5` en contenedores de navegación, atajos y guías; blanco `#FFFFFF` para lectura de ficha. En oscuro: fondo `#171214`, superficie `#241C1F`, acento lavanda `#D9A2EA`, suave `#3A2142`.
- Dar a **Agenda** la tarjeta/entrada visual más destacada de inicio: calendario grande + título claro «Agenda» + subtítulo «Clases y asistencia de hoy» + CTA «Ver agenda». Fondo lavanda suave, tinta de primer plano y borde visible; no hacerla parecer adorno. La navegación global debe identificar Agenda como destino principal con etiqueta y icono, no solo un círculo morado. Conservar métricas de cobro como acceso secundario del tablero; estados de deuda mantienen la semántica ya definida en tokens y nunca heredan el morado.
- Guiar por verbo y redundancia: «Abrí Agenda», «Ver asistencia», «Avisar por WhatsApp»; icono acompaña, no reemplaza etiqueta. No usar un onboarding obligatorio ni lenguaje de error donde solo hay una instrucción.
- No colocar grandes bloques de acentos de estado como decoración. Chips de vencimiento solo representan el estado real, con color + icono + texto; «Vencida» no será el color global.
- Radios 16–20 px para las tarjetas guía; jerarquía de texto y aire existentes (cuerpo 16/24, títulos 20–28, base espaciado 4/8/12/16). Brillo moderado, sin gradientes como portadores de significado ni sombras pesadas.

### Agenda como opción principal — límite de UX

El prototipo ENC-06 tiene cinco destinos: **Hoy, Alumnos, Asistencia, Cobros, Más**, y una tarjeta «Clase de hoy → Pasar lista». ENC-01/03 no especifican una entidad/pantalla «Agenda» como destino nuevo. Esta pieza propone que la **Agenda calendario sea la presentación y acción principal de inicio** (p. ej. sustituir visualmente la tarjeta de «Clase de hoy» por «Agenda» con la clase de hoy resaltada), manteniendo asistencia como acción secundaria «Pasar lista». No implica añadir calendario editable, configurar horarios ni cambiar las cinco pestañas.

Antes de implementarla como nuevo destino/tab, Fina/Ada deben confirmar si Agenda es (a) nombre visual de la entrada de clases del día existente o (b) pantalla/calendario nuevo. La opción (a) permite rediseñar el acceso sin extender alcance; (b) modifica mapa y requiere una especificación UX (fecha elegible, clases y estados vacíos/error, orden/semana, interacción con cancelar clase). No cambien rutas, flujo ni comportamiento a partir de este documento solamente. Si Ada no resuelve aún, la persona que implementa debe conservar la ruta Hoy existente y presentar la tarjeta como opción visual de entrada, sin crear calendario.

## Biblioteca de SVG original

Archivos propios de este encargo, un SVG por pictograma en [`iconos/`](iconos/), sin dependencia externa, JavaScript, fuente de iconos, filtro CSS ni logo de terceros:

| Archivo | Significado y uso | Nombre accesible si interactivo |
|---|---|---|
| `agenda-calendario.svg` | Página de calendario con rejilla sencilla; icono de la entrada **Agenda** y del acceso a fecha | «Agenda» |
| `agenda-hoy.svg` | Página de agenda con marcas/lista y día actual; atajo **Agenda de hoy** (no muestra fecha numérica dinámica) | «Agenda de hoy» |
| `lista-asistencia.svg` | Lista con marca de verificación; acción contextual | «Pasar lista» |
| `whatsapp-mensaje.svg` | Burbuja de conversación con auricular genérico reconocible como **mensaje por WhatsApp**; acción de contacto, acompañado siempre por «Avisar por WhatsApp» | «Abrir WhatsApp para avisar a [nombre]» (decir «Abrir», no «Enviar») |
| `estudiantes.svg` | Dos siluetas geométricas; acceso alumnos | «Alumnos» |
| `cobros.svg` | Tarjeta/recibo con moneda implícita neutral (sin símbolo monetario de otro país) | «Cobros» |

### Contrato SVG y uso

Cada recurso usa `viewBox="0 0 24 24"`, trazado vectorial original, sin texto incrustado y sin colores fijados (`currentColor`); línea 1.8 con uniones y remates redondos. Conservar `viewBox`, aspect ratio y SVG; ajustar color con propiedad `color`, dimensiones con CSS/layout, no editar paths arbitrariamente. Tamaños por contexto:

- Barra/tab o acción regular: caja **24×24 px**, dentro de control táctil mínimo **48×48 px** (nunca reducir la caja táctil junto al ícono).
- Acción destacada «Agenda»: icono **32×32** (puede subirse a 40×40 en tarjeta amplia), título textual visible y tarjeta táctil ≥48 px de alto.
- En mensaje al alumno, icono WhatsApp **20×20** junto al texto (CTA objetivo ≥48 px); no mostrar el pictograma verde solo como botón sin nombre. El color de marca se puede expresar en el icono/acentito; preservar texto legible en ciruela/neutral según tema.
- Estados/operaciones guardadas usan los pictogramas semánticos ya indicados en `tokens.ts` (check, clock, alert, pause, minus). Estos seis SVG **no sustituyen** la matriz ni crean un estado nuevo.

#### HTML / CSS

```html
<a class="entrada-agenda" href="#agenda" aria-label="Abrir Agenda">
  <img src="../visual/iconos/agenda-calendario.svg" alt="" width="32" height="32">
  <span><strong>Agenda</strong><small>Clases y asistencia de hoy</small></span>
  <span class="visualmente-oculto">Abrir Agenda</span>
</a>
<button class="accion-mensaje" type="button">
  <img src="../visual/iconos/whatsapp-mensaje.svg" alt="" width="20" height="20">
  Avisar por WhatsApp
</button>
```

Los `alt=""` marcan imágenes decorativas porque el texto del control nombra la acción. El texto oculto no es necesario si el texto visible ya comunica «Agenda» + la acción de navegación correctamente; elegir **una sola** ruta para no repetir el nombre en lector. Si la app usa SVG inline, dar `aria-hidden="true" focusable="false"` al `<svg>`; texto visible/`accessibilityLabel` vive en el control padre. En React Native cargar `SvgXml`/`SvgUri` solo si la dependencia ya está aprobada en stack: recomendación preferida es incluir paths originales en componente pequeño y etiquetar el **botón**, no crear accesibilidad dentro del SVG. No añadir dependencia por estos seis iconos.

```css
.entrada-agenda {
  display:flex; align-items:center; gap:16px; min-height:72px;
  padding:16px; border:1px solid var(--c-borde-fuerte); border-radius:20px;
  background:var(--c-marca-suave); color:var(--c-tinta);
}
.entrada-agenda img { flex:none; width:32px; height:32px; color:var(--c-marca); }
.entrada-agenda strong { display:block; font-size:20px; line-height:28px; }
.entrada-agenda small { display:block; font-size:14px; line-height:20px; color:var(--c-secundaria); }
.entrada-agenda:focus-visible, .accion-mensaje:focus-visible {
  outline:2px solid var(--c-foco); outline-offset:2px;
}
```

Para un color de símbolo que `img` externa no puede heredar en todos los navegadores, usar `<svg>` inline o sprite local original y `currentColor`; no usar `filter` para simular un color exacto. Revisar el contraste de tinta/ícono en cada tema y estado.

## Accesibilidad y pruebas de integración requeridas

- **Nombre y acción:** cualquier interacción lleva texto visible; el lector anuncia una sola vez nombre + destino («Agenda, botón», «Avisar por WhatsApp a Ana Pérez, botón»). No usar solo color, posición, animación, icono o tooltip.
- **Contraste de información:** icono funcional ≥3:1 frente a fondo contiguo; texto de etiqueta ≥4.5:1; foco visible ≥3:1. Bordes de la tarjeta no pueden ser el único indicio de que se puede tocar. En tema oscuro no usar símbolo ciruela oscura sobre fondo oscuro; aplicar `currentColor` con token de texto/marca legible.
- **Tamaño:** icono informativo ≥20 px; tarjeta/button objetivos ≥48×48; separación entre acciones ≥8 px. El SVG escalable no aumenta el área táctil por sí solo.
- **Reducción de movimiento:** no animar pulsación o rebote para explicar Agenda/WhatsApp. Focus debe ser visible con teclado y retorno de foco tras navegación/dialog. Respetar escala de texto; no text-to-path.
- **Lectores de pantalla:** SVG siempre decorativo si hay un label equivalente; el control padre proporciona `aria-label` / `accessibilityLabel` y `role`. Evitar alt redundante «icono». `currentColor` no tiene anuncio semántico.
- **Validación al integrar:** Chrome/Safari/iOS y Android, temas claro/oscuro, zoom 200 %, 320/360/390 px, teclado/foco, VoiceOver/TalkBack. Comprobar que Agenda conduce a la ruta que UX especifique; no asumirlo por el nombre del archivo.

## WhatsApp: reconocimiento, marca y licencia

El archivo `whatsapp-mensaje.svg` es un **pictograma original de interfaz**, no reproduce el imagotipo/monograma de WhatsApp (sin círculo verde corporativo, sin handset ni proporciones de logo registradas, sin nombre embebido) y no es material oficial de Meta. La burbuja + auricular alude genéricamente a mensajería; la etiqueta visible «Avisar por WhatsApp» establece el destino con claridad. No usarlo como logo de producto, avatar, splash ni anuncio de integración oficial.

Si el producto más adelante requiere **el logotipo WhatsApp exacto** para que se reconozca mejor, no copiarlo ni trazarlo desde web: obtener assets oficiales vigentes de Meta/WhatsApp, confirmar términos de marca y color/espacio libre para el uso previsto y dejar atribución/licencia según las reglas del titular. La marca denominativa pertenece a sus titulares; usar «por WhatsApp» solo para identificar el destino de la acción, sin insinuar patrocinio, aval o envío automático. Este memo no es dictamen legal. El texto y el destino externo deben dejar claro que la dueña revisa y abre WhatsApp: no afirmar entrega ni envío en la app.

## Originalidad y licencias

Los paths de `iconos/*.svg` se dibujaron para este sistema con formas geométricas sencillas; no se importó código de una biblioteca, fuentes, ilustraciones ni sitios externos. Se ofrecen como assets internos sin atribución de tercero, compatibles con los derechos del repositorio. Esto no sustituye una búsqueda jurídica de similitud ni determina titularidad legal: antes de redistribuir la app, el equipo debe acordar licencia del repositorio. **El icono WhatsApp es genérico y no concede derecho de uso de su logotipo**; ver arriba.

## Checklist de handoff a quien implemente

1. Mantener prototipo y tokens de ENC-02 sin alterar, cargar SVG local, copiar/encapsular paths manualmente si el stack lo exige y definir `currentColor`/tema en el wrapper.
2. Fina aclara «Agenda» (acceso a clase de hoy existente versus nuevo calendario) y entrega ruta/estados antes de cualquier nueva navegación.
3. Dar a Agenda primer nivel de jerarquía visual en Hoy (tarjeta lavanda + calendario + subtítulo + CTA); no sumar tab nueva sin cambio UX autorizado.
4. En acción mensaje usar icono genérico original + etiqueta «Avisar por WhatsApp» y etiqueta de lector de pantalla; mostrar editor previo y no afirmar envío.
5. Ejecutar comprobaciones de contraste, objetivo táctil, 200 % y lectores de pantalla conforme criterios de arriba; el diseño del SVG a escala no equivale a accesibilidad del producto.

**NO VERIFICADO:** rasterización/pixel fit de cada SVG en dispositivo real o vector engine final, VoiceOver/TalkBack, pruebas con una dueña, exactitud jurídica de marca ni integración. Se verificó estructura SVG/XML, composición a 24 px y contraste de tinta/ícono al usar tokens definidos, no acceso a licencia oficial de WhatsApp. Nada de lo anterior modifica ENC-06.
