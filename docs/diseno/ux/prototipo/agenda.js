import {HOY,vencimientos} from './datos-demo.js';
import {clasesDemo,reservasClase} from './programacion.js';
import {modalidadNombre} from './alumnos.js';
import {boton,esc,titulo} from './presentacion.js';
import {icono} from './iconografia.js';
// Aritmética exclusivamente de presentación del calendario; nunca ciclos/precios.
const fechaUTC=s=>new Date(`${s}T12:00:00Z`);
export const iso=d=>d.toISOString().slice(0,10);
export function fechaValida(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!isNaN(fechaUTC(s))&&iso(fechaUTC(s))===s&&s>='1900-01-01'&&s<='2100-12-31';}
export const fechaLarga=s=>new Intl.DateTimeFormat('es-UY',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(fechaUTC(s));
export const mesLargo=s=>new Intl.DateTimeFormat('es-UY',{month:'long',year:'numeric',timeZone:'UTC'}).format(fechaUTC(s));
export function sumarDias(s,n){const d=fechaUTC(s);d.setUTCDate(d.getUTCDate()+n);return iso(d);}
export function lunes(s){const d=fechaUTC(s);return sumarDias(s,-((d.getUTCDay()+6)%7));}
export function moverFecha(s,vista,delta){
  if(vista==='semana')return sumarDias(s,delta*7);
  const d=fechaUTC(s),dia=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+delta);
  const fin=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0,12)).getUTCDate();
  d.setUTCDate(Math.min(dia,fin));return iso(d);
}
export function crearEstadoAgenda(){return {vista:'semana',fecha:HOY,expandido:new Set(),scroll:0,disparador:null};}
export const rutaAgenda=a=>`agenda/${a.vista}/${a.fecha}`;
export function renderAgenda(a,alumnos,escenario,aviso=''){
  const clases=clasesDemo(escenario),vences=vencimientos(alumnos,escenario);
  const carga=escenario==='cargando',errorC=['error','error-clases'].includes(escenario),errorV=['error','error-vencimientos'].includes(escenario);
  const desconocidoC=carga||errorC,desconocidoV=carga||errorV;
  const semana=Array.from({length:7},(_,i)=>sumarDias(lunes(a.fecha),i));
  const inicioMes=a.fecha.slice(0,7)+'-01',nDias=new Date(Date.UTC(Number(a.fecha.slice(0,4)),Number(a.fecha.slice(5,7)),0,12)).getUTCDate();
  const dias=a.vista==='semana'?semana:Array.from({length:nDias},(_,i)=>sumarDias(inicioMes,i));
  const enRango=x=>dias.includes(x.fecha);
  const etiquetaRango=a.vista==='semana'?`${fechaLarga(semana[0])} – ${fechaLarga(semana[6])}`:mesLargo(a.fecha);
  const resumenClase=c=>c.estado==='cancelada'?'Cancelada por el instituto':`${reservasClase(c.id).length} ${reservasClase(c.id).length===1?'alumno programado':'alumnos programados'} · no confirma clase realizada`;
  const programados=c=>reservasClase(c.id).map(r=>{const p=alumnos.find(p=>p.id===r.alumnoId);return `<div class="programado"><div><strong>${esc(p.nombre)}</strong><small>${modalidadNombre(p)}</small></div>${boton('Ver programación',`data-ruta="programacion/${r.id}" data-agenda-salida="reserva-${r.id}" data-fecha="${c.fecha}"`)}</div>`;}).join('');
  function dia(s,detalle=false){
    const cs=clases.filter(c=>c.fecha===s).sort((x,y)=>x.inicio.localeCompare(y.inicio)),vs=vences.filter(v=>v.fecha===s).sort((x,y)=>x.nombre.localeCompare(y.nombre,'es'));
    return `<section class="dia-agenda ${s===HOY?'dia-hoy':''}" data-dia="${s}"><h2 tabindex="-1" id="${detalle?'detalle-dia':'dia-'+s}">${esc(fechaLarga(s))}${s===HOY?' <span class="etiqueta-hoy">Hoy</span>':''}</h2>${desconocidoC?'<p class="ayuda">Clases: '+(carga?'cargando…':'sin datos')+'</p>':cs.map(c=>`<article class="card clase-agenda"><h3>${esc(c.nombre)}</h3><p class="hora-clase">${c.inicio}${c.fin?'–'+c.fin:''}</p><p class="ayuda">${esc(resumenClase(c))}</p>${c.estado==='cancelada'?'<p class="ayuda">No se registra asistencia ni cobro. Los ajustes siguen pendientes (Q2).</p>':programados(c)}</article>`).join('')}${desconocidoV?'<p class="ayuda">Vencimientos: '+(carga?'cargando…':'sin datos')+'</p>':vs.length?`<details class="vencimientos-dia" data-expansion="${s}" ${a.expandido.has(s)?'open':''}><summary>${vs.length} ${vs.length===1?'mensualidad':'mensualidades'} ${s<HOY?(vs.length===1?'venció':'vencieron'):vs.length===1?'vence':'vencen'} este día</summary><div class="lista">${vs.map(v=>`<article class="item"><h3>${esc(v.nombre)}</h3><p>${s<HOY?'Venció':'Vence'} el <strong>${esc(v.vence)}</strong><br>Próxima renovación: <strong>${esc(v.renueva||'pendiente de nuevo inicio')}</strong></p><p class="ayuda">Estado actual: ${esc(v.estado)}. Consultá la ficha; esta fecha no prueba deuda.</p>${boton('Ver ficha',`data-ruta="alumno/${v.alumno}" data-agenda-salida="ciclo-${v.id}" data-fecha="${s}"`)}</article>`).join('')}</div></details>`:''}${!desconocidoC&&!desconocidoV&&!cs.length&&!vs.length?'<p class="ayuda vacio-dia">No hay clases ni vencimientos este día.</p>':''}${!desconocidoC?boton('Agendar alumno',`data-ruta="agendar/${s}" data-agenda-salida="agendar-${s}" data-fecha="${s}" ${escenario==='offline'?'disabled':''}`,'s'):''}</section>`;
  }
  function celda(s,lineal=false){
    const cs=clases.filter(c=>c.fecha===s),vs=vences.filter(v=>v.fecha===s),canceladas=cs.filter(c=>c.estado==='cancelada').length;
    const label=`${fechaLarga(s)}${s===HOY?', hoy':''}${s===a.fecha?', seleccionado':''}, ${desconocidoC?'clases sin datos':cs.length+' clases'+(canceladas?', '+canceladas+' canceladas':'')}, ${desconocidoV?'vencimientos sin datos':vs.length+' mensualidades vencen'}`;
    const tieneMensual=!desconocidoV&&vs.length>0;
    const tieneIndividual=!desconocidoC&&cs.some(c=>c.modalidad==='individual');
    return `<button class="fecha-agenda ${s===a.fecha?'fecha-seleccionada':''} ${s===HOY?'fecha-hoy':''}" data-fecha-agenda="${s}" aria-label="${esc(label)}" aria-pressed="${s===a.fecha}"><span class="numero-dia">${lineal?esc(fechaLarga(s)):Number(s.slice(-2))}</span><span class="indicadores-fecha" aria-hidden="true">${tieneMensual?'<span class="punto-mensual"></span>':''}${tieneIndividual?'<span class="rombo-individual"></span>':''}</span></button>`;
  }
  let mes='';
  if(a.vista==='mes'){
    const huecos=(fechaUTC(inicioMes).getUTCDay()+6)%7,celdas=Array.from({length:huecos},()=>'<td></td>').concat(dias.map(s=>`<td>${celda(s)}</td>`));
    while(celdas.length%7)celdas.push('<td></td>');
    mes=`<div class="mes-contenido"><p class="ayuda leyenda">${icono('agenda')} Clases (incluye canceladas) · ${icono('reloj')} Vencimientos</p><table class="mes-tabla"><caption class="sr-only">${esc(mesLargo(a.fecha))}</caption><thead><tr>${['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${Array.from({length:celdas.length/7},(_,i)=>'<tr>'+celdas.slice(i*7,i*7+7).join('')+'</tr>').join('')}</tbody></table><div class="mes-lineal"><h2>Días de ${esc(mesLargo(a.fecha))}</h2>${dias.map(s=>celda(s,true)).join('')}</div>${boton('Ver detalle del día','data-ir-detalle','t')}${dia(a.fecha,true)}</div>`;
  }
  const fallo=(texto,accion)=>`<div class="banner err" role="alert"><p>${texto}</p>${boton(accion,'data-recuperar')}</div>`;
  return titulo('Agenda','Quién viene cada día · programación de ejemplo')+(aviso?`<p class="banner ok">${esc(aviso)}</p>`:'')+`<div class="agenda"><div class="acciones modos-agenda" role="group" aria-label="Vista de Agenda">${['semana','mes'].map(v=>boton(v==='mes'?'Mes':'Semana',`data-vista-agenda="${v}" aria-pressed="${v===a.vista}"`,v===a.vista?'p':'s')).join('')}</div><div class="controles-agenda">${boton(a.vista==='mes'?'Mes anterior':'Semana anterior','data-mover-agenda="-1"')}${boton('Hoy','data-hoy-agenda')}${boton(a.vista==='mes'?'Mes siguiente':'Semana siguiente','data-mover-agenda="1"')}</div><h2 class="rango-agenda">${esc(etiquetaRango)}</h2><p class="ayuda">Montevideo · fecha de prueba fija 15/11/2026</p>${a.vista==='semana'&&semana.includes(HOY)?boton('Ir al día de hoy','data-ir-hoy','t'):''}${carga?'<div aria-busy="true"><p>Cargando clases…</p><p>Cargando vencimientos…</p><div class="skel" aria-hidden="true"></div>'+boton('Finalizar carga simulada','data-recuperar')+'</div>':''}${errorC?fallo('No pudimos cargar las clases de este período','Reintentar clases'):''}${errorV?fallo('No pudimos cargar los vencimientos','Reintentar vencimientos'):''}${!desconocidoC&&!clases.some(enRango)?'<p class="banner info">No hay clases programadas '+(a.vista==='mes'?'este mes.':'esta semana.')+'</p>':''}${!desconocidoV&&!vences.some(enRango)?'<p class="ayuda">No hay mensualidades que venzan en este período. Esto no significa que no haya deuda.</p>':''}${a.vista==='mes'?mes:semana.map(s=>dia(s)).join('')}${boton('Ver horario','data-ver-horario','t')}<p class="ayuda">Los ejemplos no crean clases, pagos ni asistencias al navegar.</p></div><button class="fab-agendar" data-ruta="agendar/${a.fecha}" data-agenda-salida="fab-agendar" data-fecha="${a.fecha}" aria-label="Agendar alumno">+ Agendar</button>`;
}
