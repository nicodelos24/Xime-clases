/**
 * Icono — set SVG propio (regla de Nico: nada de emoji en la interfaz).
 * Trazo uniforme (stroke, sin relleno salvo donde se indica), 24×24,
 * color heredado del texto que acompaña. Toque de color moderado: el color
 * lo decide quien lo usa (acento, estado), el ícono nunca lo fija.
 */

import Svg, { Circle, Path, Polyline, Line } from 'react-native-svg';

export type NombreIcono =
  | 'sol'
  | 'alumnos'
  | 'agenda'
  | 'cobros'
  | 'mas'
  | 'campana'
  | 'alerta'
  | 'cobrado'
  | 'porCobrar'
  | 'check'
  | 'reloj'
  | 'chevronIzq'
  | 'chevronDer'
  | 'lupa'
  | 'cruz'
  | 'masAlumno';

export function Icono({
  nombre,
  tamaño = 22,
  color = 'currentColor',
  grosor = 1.8,
}: {
  nombre: NombreIcono;
  tamaño?: number;
  color?: string;
  grosor?: number;
}) {
  const comun = { stroke: color, strokeWidth: grosor, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={tamaño} height={tamaño} viewBox="0 0 24 24" aria-hidden focusable={false}>
      {nombre === 'sol' && (
        <>
          <Circle cx="12" cy="12" r="4.2" {...comun} />
          <Line x1="12" y1="2.5" x2="12" y2="5" {...comun} />
          <Line x1="12" y1="19" x2="12" y2="21.5" {...comun} />
          <Line x1="2.5" y1="12" x2="5" y2="12" {...comun} />
          <Line x1="19" y1="12" x2="21.5" y2="12" {...comun} />
          <Line x1="5" y1="5" x2="6.8" y2="6.8" {...comun} />
          <Line x1="17.2" y1="17.2" x2="19" y2="19" {...comun} />
          <Line x1="5" y1="19" x2="6.8" y2="17.2" {...comun} />
          <Line x1="17.2" y1="6.8" x2="19" y2="5" {...comun} />
        </>
      )}
      {nombre === 'alumnos' && (
        <>
          <Circle cx="9" cy="8" r="3.2" {...comun} />
          <Path d="M3.5 20c0-3.3 2.5-5.6 5.5-5.6s5.5 2.3 5.5 5.6" {...comun} />
          <Circle cx="17" cy="8.5" r="2.4" {...comun} />
          <Path d="M15 14.8c2.6.2 4.6 2.2 5 5.2" {...comun} />
        </>
      )}
      {nombre === 'agenda' && (
        <>
          <Path d="M4.5 6.2c0-1 .8-1.7 1.7-1.7h11.6c1 0 1.7.8 1.7 1.7v12.6c0 1-.8 1.7-1.7 1.7H6.2c-1 0-1.7-.8-1.7-1.7V6.2Z" {...comun} />
          <Line x1="4.5" y1="9.4" x2="19.5" y2="9.4" {...comun} />
          <Line x1="8" y1="3" x2="8" y2="6" {...comun} />
          <Line x1="16" y1="3" x2="16" y2="6" {...comun} />
        </>
      )}
      {nombre === 'cobros' && (
        <>
          <Circle cx="12" cy="12" r="8.2" {...comun} />
          <Path d="M12 7.2v9.6M9.4 15.2c0 1 1 1.8 2.6 1.8s2.6-.7 2.6-1.8c0-2.4-5.2-1.4-5.2-3.8 0-1.1 1-1.8 2.6-1.8s2.6.7 2.6 1.6" {...comun} />
        </>
      )}
      {nombre === 'mas' && (
        <>
          <Circle cx="5" cy="12" r="1.4" {...comun} fill={color} />
          <Circle cx="12" cy="12" r="1.4" {...comun} fill={color} />
          <Circle cx="19" cy="12" r="1.4" {...comun} fill={color} />
        </>
      )}
      {nombre === 'campana' && (
        <>
          <Path d="M12 3.2c-2.6 0-4.6 2.1-4.6 4.8v3.3c0 1-.4 1.9-1.1 2.6l-.9.9h13.2l-.9-.9c-.7-.7-1.1-1.6-1.1-2.6V8c0-2.7-2-4.8-4.6-4.8Z" {...comun} />
          <Path d="M9.8 18.6a2.2 2.2 0 0 0 4.4 0" {...comun} />
        </>
      )}
      {nombre === 'alerta' && (
        <>
          <Path d="M12 3.6 2.6 19.2h18.8L12 3.6Z" {...comun} />
          <Line x1="12" y1="9.4" x2="12" y2="13.6" {...comun} />
          <Circle cx="12" cy="16.4" r="0.15" {...comun} fill={color} />
        </>
      )}
      {nombre === 'cobrado' && (
        <>
          <Circle cx="12" cy="12" r="8.2" {...comun} />
          <Path d="M12 7.2v9.6M9.4 15.2c0 1 1 1.8 2.6 1.8s2.6-.7 2.6-1.8c0-2.4-5.2-1.4-5.2-3.8 0-1.1 1-1.8 2.6-1.8s2.6.7 2.6 1.6" {...comun} />
        </>
      )}
      {nombre === 'porCobrar' && (
        <>
          <Path d="M5.5 4.5h10l3 3v12h-13Z" {...comun} />
          <Line x1="8.2" y1="9" x2="15.5" y2="9" {...comun} />
          <Line x1="8.2" y1="12.4" x2="15.5" y2="12.4" {...comun} />
          <Line x1="8.2" y1="15.8" x2="12.4" y2="15.8" {...comun} />
        </>
      )}
      {nombre === 'check' && <Polyline points="4.5,12.5 9.5,17.5 19.5,6.5" {...comun} />}
      {nombre === 'reloj' && (
        <>
          <Circle cx="12" cy="12" r="8.6" {...comun} />
          <Path d="M12 7.5V12l3 2" {...comun} />
        </>
      )}
      {nombre === 'chevronIzq' && <Polyline points="15,4.5 8,12 15,19.5" {...comun} />}
      {nombre === 'chevronDer' && <Polyline points="9,4.5 16,12 9,19.5" {...comun} />}
      {nombre === 'lupa' && (
        <>
          <Circle cx="10.5" cy="10.5" r="6.2" {...comun} />
          <Line x1="15" y1="15" x2="20" y2="20" {...comun} />
        </>
      )}
      {nombre === 'cruz' && (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...comun} />
          <Line x1="18" y1="6" x2="6" y2="18" {...comun} />
        </>
      )}
      {nombre === 'masAlumno' && (
        <>
          <Circle cx="9" cy="8.5" r="3.2" {...comun} />
          <Path d="M3.5 20c0-3.3 2.5-5.6 5.5-5.6s5.5 2.3 5.5 5.6" {...comun} />
          <Line x1="17.5" y1="9.5" x2="17.5" y2="15.5" {...comun} />
          <Line x1="14.5" y1="12.5" x2="20.5" y2="12.5" {...comun} />
        </>
      )}
    </Svg>
  );
}
