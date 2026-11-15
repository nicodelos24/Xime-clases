// SOLO fixtures sintéticos. Sin reloj real, recurrencias ni cálculos de negocio.
export const HOY='2026-11-15';
export const CLASE_HOY='demo-clase-2026-11-15-1800';
export function crearAlumnos(){return [
  {id:'ana',nombre:'Ana Pérez',modalidad:'mensualidad',estado:'Por vencer',inicio:'18/10/2026',vence:'17/11/2026',renueva:'18/11/2026',telefono:true},
  {id:'lucia',nombre:'Lucía Silva',modalidad:'suelta',estado:'Clase suelta',telefono:false},
  {id:'rosa',nombre:'Rosa Méndez',modalidad:'mensualidad',estado:'Vence hoy',inicio:'16/10/2026',vence:'15/11/2026',renueva:'16/11/2026',telefono:true},
  {id:'marcos',nombre:'Marcos Díaz',modalidad:'mensualidad',estado:'Vencida',inicio:'15/10/2026',vence:'14/11/2026',renueva:null,telefono:false},
  {id:'ines',nombre:'Inés Costa',modalidad:'mensualidad',estado:'Vigente',inicio:'01/11/2026',vence:'30/11/2026',renueva:'01/12/2026',telefono:true}
].map((p,i)=>({...p,alta:['2026-11-12T12:00:00Z','2026-11-14T12:00:00Z','2026-11-10T12:00:00Z','2026-10-01T12:00:00Z','2026-11-13T12:00:00Z'][i]}));}
export function ocurrencias(escenario){
  if(escenario==='vacio')return [];
  const clases=[HOY,'2026-11-17','2026-11-19'].map(fecha=>({id:`demo-clase-${fecha}-1800`,fecha,nombre:'Danza',inicio:'18:00',fin:'19:00',estado:'programada',editable:fecha===HOY}));
  if(escenario==='cancelada')clases.push({id:'demo-cancelada',fecha:'2026-11-15',nombre:'Danza · ejemplo cancelado',inicio:'16:00',fin:'17:00',estado:'cancelada',editable:false});
  return clases;
}
export function vencimientos(alumnos,escenario){
  if(escenario==='vacio')return [];
  return alumnos.flatMap(p=>[p,p.renovacion].filter(x=>x?.vence).map((c,i)=>({
    id:`${p.id}-ciclo-${i}`,alumno:p.id,nombre:p.nombre,
    fecha:c.vence.split('/').reverse().join('-'),vence:c.vence,renueva:c.renueva,estado:p.estado
  })));
}
