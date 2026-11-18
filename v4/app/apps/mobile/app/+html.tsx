import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { SCRIPT_TEMA } from '../../../packages/ui/src/tokens';

/**
 * Shell HTML del export estático (Expo Router toma este archivo si existe).
 *
 * El export prerenderiza en Node, sin `prefers-color-scheme`, así que el
 * HTML sale con el tema claro aunque el navegador esté en oscuro. El script
 * del final del `<body>` corre antes de que React hidrate (los bundles van
 * con `defer`): lee la media query, marca `data-tema` en `<html>` y corrige
 * los colores propios de Aurora ya escritos en el DOM; `ProveedorTema` toma
 * `data-tema` como tema inicial. Así la primera carga ya pinta barra y
 * header en el tema del sistema, sin esperar la primera interacción
 * (hallazgo de Gino, 18/11). En nativo esto no existe; en dev server el
 * atributo también se fija y no cambia nada (ahí el tema ya era correcto).
 */
export default function Html({ children }: { children: React.ReactNode }) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } =
    useServerDocumentContext();
  return (
    <html lang="es" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {/* Al final del body: necesita los nodos ya parseados para corregir
            los colores del prerender antes de que React hidrate. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        {bodyNodes}
      </body>
    </html>
  );
}
