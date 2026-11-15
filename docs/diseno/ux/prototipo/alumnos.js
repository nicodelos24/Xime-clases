import {esc,boton} from './presentacion.js';
import {icono} from './iconografia.js';
import {clasesDemo,reservasClase,reservaPorId,clasePorId} from './programacion.js';
export const fechaAlta=p=>p.alta.slice(0,10).split('-').reverse().join('/');
export const modalidadNombre=p=>p.modalidad==='suelta'?'Por clase individual':'Mensual';
// Comparación estable: alta (no último pago), luego ID. Modalidad solo agrupa.
export function filtrarOrdenar(alumnos,busqueda='',filtro='todos',orden='recientes'){
  return alumnos.filter(p=>p.nombre.toLocaleLowerCase('es-UY').includes(busqueda.toLocaleLowerCase('es-UY'))&&(filtro==='todos'||p.modalidad===filtro)).sort((a,b)=>{
    if(orden!=='recientes'&&a.modalidad!==b.modalidad){const primero=orden==='mensuales'?'mensualidad':'suelta';return a.modalidad===primero?-1:1;}
    return b.alta.localeCompare(a.alta)||a.id.localeCompare(b.id);
  });
}
export function controlesAlumnos(filtro,orden){return `<div class="controles-alumnos"><div class="campo"><label for="filtro-alumnos">${icono('filtro')} Modalidad de alumnos</label><select id="filtro-alumnos"><option value="todos" ${filtro==='todos'?'selected':''}>Todos</option><option value="mensualidad" ${filtro==='mensualidad'?'selected':''}>Mensuales</option><option value="suelta" ${filtro==='suelta'?'selected':''}>Por clase individual</option></select></div><div class="campo"><label for="orden-alumnos">${icono('orden')} Orden de alumnos</label><select id="orden-alumnos"><option value="recientes" ${orden==='recientes'?'selected':''}>Más recientes (fecha de alta)</option><option value="mensuales" ${orden==='mensuales'?'selected':''}>Mensuales primero</option><option value="individuales" ${orden==='individuales'?'selected':''}>Por clase individual primero</option></select></div></div>`;}
export function formularioAgendar(fecha,alumnos,query,filtro,escenario){
  const clases=clasesDemo(escenario).filter(c=>c.fecha===fecha&&c.estado!=='cancelada').sort((a,b)=>a.inicio.localeCompare(b.inicio));
  const listado=filtrarOrdenar(alumnos,query,filtro);
  return `<p>Elegí una ficha existente. Podés volver a agendarla aunque no venga hace tiempo.</p><form id="agendar-form" data-fecha="${fecha}"><div class="campo"><label for="buscar-agenda">Buscar alumno para agendar</label><input id="buscar-agenda" type="search" value="${esc(query)}" autocomplete="off"></div><div class="campo"><label for="modalidad-agenda">Modalidad para agendar</label><select id="modalidad-agenda"><option value="todos" ${filtro==='todos'?'selected':''}>Todos</option><option value="mensualidad" ${filtro==='mensualidad'?'selected':''}>Mensuales</option><option value="suelta" ${filtro==='suelta'?'selected':''}>Por clase individual</option></select></div>${clases.length?`<div class="campo"><label for="horario-agenda">Clase / horario</label><select id="horario-agenda" name="claseId">${clases.map(c=>`<option value="${c.id}">${esc(c.nombre)} · ${c.inicio}${c.fin?'–'+c.fin:''}</option>`).join('')}</select></div>`:'<div class="campo"><label for="hora-agenda">Hora de esta clase *</label><input id="hora-agenda" type="time" name="hora" required><p class="ayuda">Solo este día. No se repite automáticamente.</p></div>'}<fieldset><legend>Alumno *</legend><div id="opciones-agenda">${opcionesAgendar(listado)}</div></fieldset><p class="error-campo" id="error-agendar" role="alert"></p>${boton('Confirmar programación',`type="submit" ${escenario==='offline'?'disabled':''}`,'p')}<p class="ayuda">Agendar no confirma que vino, no cobra, no genera deuda ni inicia la mensualidad. Si un mensual falta no se extiende ni cobra extra desde aquí.</p></form>${boton('Crear ficha nueva','data-alta-agenda','t')}`;
}
export function opcionesAgendar(alumnos){return alumnos.length?alumnos.map(p=>`<label class="radio"><input type="radio" name="alumnoId" value="${p.id}" required><span>${esc(p.nombre)}<small>${modalidadNombre(p)} · Alta ${esc(fechaAlta(p))}</small></span></label>`).join(''):'<p>No encontramos alumnos. Probá otro nombre o modalidad, o creá una ficha nueva.</p>';}
export function detalleProgramacion(id,alumnos){
  const r=reservaPorId(id),clase=r&&clasePorId(r.claseId),p=r&&alumnos.find(p=>p.id===r.alumnoId);
  if(!r||!clase||!p)return '<p>Esta programación ya no está disponible. La ficha no se eliminó.</p>';
  return `<div class="card"><h2>${esc(p.nombre)}</h2><p>${modalidadNombre(p)} · ${clase.fecha.split('-').reverse().join('/')} · ${clase.inicio}</p><p>Programado. Esto no confirma clase realizada ni pago.</p>${boton('Ver ficha',`data-ruta="alumno/${p.id}"`)}${boton('Retirar programación',`data-retirar-reserva="${r.id}"`,'t')}</div><p class="ayuda">La ficha se conserva en Alumnos. Retirar programación no borra clases realizadas ni pagos; esos ajustes no se ejecutan aquí.</p>`;
}
