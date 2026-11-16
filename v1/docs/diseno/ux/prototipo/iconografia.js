// Recursos originales ENC-07B, cargados desde archivos locales sin modificar sus paths.
const archivos = {
  agenda:'agenda-calendario', hoy:'agenda-hoy', asistencia:'lista-asistencia',
  whatsapp:'whatsapp-mensaje', alumnos:'estudiantes', cobros:'cobros', filtro:'filtro', orden:'orden'
};
const dibujos = {
  casa:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
  mas:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
  alerta:'<path d="m12 3 10 18H2zM12 9v5m0 3v1"/>',
  pausa:'<circle cx="12" cy="12" r="9"/><path d="M9 8v8m6-8v8"/>',
  menos:'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  volver:'<path d="m10 5-7 7 7 7M3 12h18"/>'
};
const recursos = {};
await Promise.all(Object.entries(archivos).map(async ([nombre,archivo]) => {
  const respuesta=await fetch(new URL(`../../visual/iconos/${archivo}.svg`,import.meta.url));
  if(!respuesta.ok) throw Error(`No se pudo cargar icono ${archivo}`);
  // Solo assets versionados del mismo origen, no SVG recibido del usuario.
  recursos[nombre]=(await respuesta.text()).replace('<svg ',`<svg class="icono" aria-hidden="true" focusable="false" data-icono="${nombre}" `);
}));
export function icono(nombre){
  return recursos[nombre] || `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-icono="${nombre}">${dibujos[nombre]||dibujos.menos}</svg>`;
}
export const destinos=[['Hoy','hoy','casa'],['Alumnos','alumnos','alumnos'],['Agenda','agenda','agenda'],['Cobros','cobros','cobros'],['Más','mas','mas']];
