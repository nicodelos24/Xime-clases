import {HOY,CLASE_HOY,ocurrencias} from './datos-demo.js';
// Identidad duradera en alumnos; reservas y hechos separados por ocurrencia.
let extras,reservas,hechos,secuencia;
export function reiniciarProgramacion(){
  extras=[];secuencia=10;hechos=new Map();reservas=[
    {id:'reserva-ana-15',claseId:CLASE_HOY,alumnoId:'ana'},
    {id:'reserva-rosa-15',claseId:CLASE_HOY,alumnoId:'rosa'},
    {id:'reserva-lucia-17',claseId:'demo-clase-2026-11-17-1800',alumnoId:'lucia'},
    {id:'reserva-ana-19',claseId:'demo-clase-2026-11-19-1800',alumnoId:'ana'}
  ];
}
reiniciarProgramacion();
export const clasesDemo=escenario=>escenario==='vacio'?[]:[...ocurrencias(escenario),...extras];
export const clasePorId=(id,escenario='normal')=>clasesDemo(escenario).find(c=>c.id===(id||CLASE_HOY));
export const reservasClase=id=>reservas.filter(r=>r.claseId===id);
export const reservaPorId=id=>reservas.find(r=>r.id===id);
export function agendarAlumno({alumnoId,fecha,hora,claseId}){
  let clase=claseId?clasePorId(claseId):null;
  if(claseId&&(!clase||clase.fecha!==fecha))throw Error('No encontramos ese horario para este día. Volvé a Agenda.');
  if(!clase){
    if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora))throw Error('Elegí una hora para esta programación.');
    clase={id:`demo-clase-${fecha}-${hora.replace(':','')}`,fecha,nombre:'Danza',inicio:hora,fin:null,estado:'programada',editable:fecha===HOY};
    extras.push(clase);
  }
  if(clase.estado==='cancelada')throw Error('No se agenda en una clase cancelada.');
  if(reservas.some(r=>r.claseId===clase.id&&r.alumnoId===alumnoId))throw Error('Este alumno ya está agendado en ese horario. No se duplicó.');
  const reserva={id:'reserva-'+secuencia++,claseId:clase.id,alumnoId};reservas.push(reserva);return reserva;
}
export function retirarReserva(id){reservas=reservas.filter(r=>r.id!==id);}
export const estadoRealizacion=(alumnoId,claseId=CLASE_HOY)=>hechos.get(`${claseId}:${alumnoId}`)||'sin registrar';
export const realizada=p=>estadoRealizacion(p.id)==='realizada';
export const noVino=p=>estadoRealizacion(p.id)==='no vino';
export function registrarRealizacion(alumnoId,estado,claseId=CLASE_HOY){hechos.set(`${claseId}:${alumnoId}`,estado);}
