// ENC-08: demo estática. Conserva simulaciones ENC-06, sin backend ni reglas productivas.
import {esc,pesos,boton,chip,titulo} from './presentacion.js';
import {icono,destinos} from './iconografia.js';
import {crearAlumnos,HOY,CLASE_HOY} from './datos-demo.js';
import {crearEstadoAgenda,renderAgenda,rutaAgenda,fechaValida,moverFecha,fechaLarga} from './agenda.js';
import {reiniciarProgramacion,clasePorId,agendarAlumno,retirarReserva,reservaPorId,realizada,noVino,registrarRealizacion} from './programacion.js';
import {filtrarOrdenar,controlesAlumnos,modalidadNombre,fechaAlta,formularioAgendar,opcionesAgendar,detalleProgramacion} from './alumnos.js';
const $ = (s) => document.querySelector(s);
let agenda=crearEstadoAgenda(),desdeAgenda=false,origenAsistencia='hoy',focoAgenda=null,avisoProgramacion='';
function guardarContextoAgenda(b){agenda.scroll=window.scrollY;agenda.disparador=b.dataset.agendaSalida;agenda.fecha=b.dataset.fecha||agenda.fecha;desdeAgenda=true;}
function irAgenda(){ir(rutaAgenda(agenda));}
function enfocarVisible(selector){const el=[...document.querySelectorAll(selector)].find(e=>e.getClientRects().length);el?.focus({preventScroll:true});}
function irAlDetalle(selector){const el=$(selector);if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'start'});}}
let alumnos, pagos, siguiente, escenario='normal', filtro='Por vencer', busqueda='', pendiente=false;
let borradores={},ultimaRuta='',filtroAlumnos='todos',ordenAlumnos='recientes',buscarAgenda='',modalidadAgenda='todos',altaDesdeAgenda=false;
function guardarBorrador(){const f=$('#contenido form');if(!f||f.dataset.enviado||!ultimaRuta)return;borradores[ultimaRuta]=Array.from(f.querySelectorAll('input,select,textarea')).map(x=>({id:x.id,nombre:x.name,tipo:x.type,valor:x.value,checked:x.checked}));}
function restaurarBorrador(){const f=$('#contenido form');if(!f)return;for(const x of borradores[location.hash||'#hoy']||[]){const el=x.id?document.getElementById(x.id):Array.from(f.elements).find(e=>e.name===x.nombre&&e.value===x.valor);if(!el)continue;if(x.tipo==='radio')el.checked=x.checked;else el.value=x.valor;}if($('#monto'))$('#monto').dispatchEvent(new Event('input',{bubbles:true}));}
const inicializar = () => {
  alumnos=crearAlumnos(); pagos=[];siguiente=1;pendiente=false;busqueda='';filtro='Por vencer';
  reiniciarProgramacion();filtroAlumnos='todos';ordenAlumnos='recientes';buscarAgenda='';modalidadAgenda='todos';altaDesdeAgenda=false;
  agenda=crearEstadoAgenda();desdeAgenda=false;origenAsistencia='hoy';focoAgenda=null;
};
inicializar();
const persona=id=>alumnos.find(p=>p.id===id);
const deuda=p=>!!p.claseAdeudada && !p.clasePagada;
function volver(dest='alumnos'){if(ruta()[0]==='alta'&&altaDesdeAgenda)dest='agendar/'+agenda.fecha;return boton(desdeAgenda&&ruta()[0]==='alumno'?'Volver a Agenda':'Volver',desdeAgenda&&ruta()[0]==='alumno'?'data-volver-agenda':`data-ruta="${dest}"`,'t volver');}
function ciclo(p){return `<div class="ciclo"><p class="tit">Mensualidad · fechas de ejemplo</p><div class="kk">Inicio <b>${esc(p.inicio||'Pendiente de primera clase')}</b></div><div class="kk">${p.estado==='Vencida'?'Venció el':'Vence el'} <b>${esc(p.vence||'Pendiente de inicio')}</b></div><div class="kk">Próxima renovación <b>${esc(p.renueva||'Pendiente de nuevo inicio')}</b></div></div>`;}
function fila(p,acciones=true){return `<article class="item"><div class="espacio"><p class="nombre">${esc(p.nombre)}</p></div>${chip(p.estado)}<p class="ayuda">${modalidadNombre(p)} · Alta ${esc(fechaAlta(p))}</p>${p.vence?`<p class="fechas">${p.estado==='Vencida'?'Venció':'Vence'} el <strong>${esc(p.vence)}</strong><br>Próxima renovación: <strong>${esc(p.renueva||'pendiente de nuevo inicio')}</strong></p>`:''}${deuda(p)?'<p class="ayuda">1 clase adeudada · 15/11</p>':''}${acciones?`<div class="acciones">${boton('Ver ficha',`data-ruta="alumno/${p.id}"`)}${p.telefono && ['Por vencer','Vence hoy'].includes(p.estado)?boton('Avisar por WhatsApp',`data-ruta="whatsapp/${p.id}"`,'t'):''}</div>`:''}</article>`;}
function ruta(){try{return decodeURIComponent(location.hash.slice(1)||'hoy').split('/');}catch{return ['invalida'];}}
function ir(dest){if(dest==='agenda')dest=rutaAgenda(agenda);if(location.hash==='#'+dest) render();else location.hash=dest;}
function anunciar(s){$('#anuncio').textContent=s;}
function navegar(){const [r]=ruta();const actual=({hoy:'Hoy',alumnos:'Alumnos',alta:'Alumnos',alumno:'Alumnos',modalidad:'Alumnos',whatsapp:'Alumnos',agenda:'Agenda',agendar:'Agenda',programacion:'Agenda',asistencia:'Agenda',cobro:'Cobros',comprobante:'Cobros',cobros:'Cobros',pago:'Cobros',mas:'Más'})[r];$('.navegacion').innerHTML=destinos.map(([nombre,destino,figura])=>`<button data-ruta="${destino}" data-principal ${actual===nombre?'aria-current="page"':''}>${icono(figura)}<span>${nombre}</span></button>`).join('');}
function modal(t,html){$('#dialogo-contenido').innerHTML=`<h2 id="titulo-dialogo">${esc(t)}</h2>${html}${boton('Entendido','data-cerrar','p')}`;$('#dialogo').showModal();}
function bloqueo(politica){modal('Regla pendiente · no se aplica ningún cambio',`<p>${politica==='Q2'?'Q2: corregir una asistencia cobrada o cancelar una clase cobrada necesita una política de ajuste auditado. No están definidos reintegro, reimputación ni efecto sobre el inicio del ciclo.':'Q3: falta definir si «Terminar mensualidad hoy» cubre la clase de hoy y desde cuándo se cobra por clase.'}</p><p class="ayuda">Este prototipo no resuelve la política ni modifica pagos, asistencia o cobertura. Se debe cerrar con la clienta antes de implementar el borde.</p>`);}
function habilitarGuardado(){return escenario==='offline'?'disabled aria-describedby="sin-red"':'';}
function render(){
 guardarBorrador();
 const scrollAnterior=window.scrollY,rutaAnterior=ultimaRuta;
 const [r,id,tipo]=ruta();const p=persona(id);navegar();let html='';
 if(r==='agenda'){
   if((id&&!['semana','mes'].includes(id))||(tipo&&!fechaValida(tipo)))html=titulo('No encontramos esa fecha o vista')+boton('Volver a Agenda','data-agenda-valida','p');
   else{agenda.vista=id||agenda.vista;agenda.fecha=tipo||agenda.fecha;html=renderAgenda(agenda,alumnos,escenario,avisoProgramacion);}
 }
 else if(r==='agendar'&&fechaValida(id)&&!['cargando','error'].includes(escenario)){
   html=boton('Volver a Agenda','data-volver-agenda','t')+titulo('Agendar alumno',fechaLarga(id))+formularioAgendar(id,alumnos,buscarAgenda,modalidadAgenda,escenario);
 }
 else if(r==='programacion'){
   html=boton('Volver a Agenda','data-volver-agenda','t')+titulo('Detalle de programación')+detalleProgramacion(id,alumnos);
 }
 else if(escenario==='cargando'){html=titulo('Cargando…','Estado simulado para revisar claridad.')+'<div class="skel" aria-hidden="true"></div><div class="skel corta" aria-hidden="true"></div>'+boton('Finalizar carga simulada','data-recuperar','p');}
 else if(escenario==='error'){html=titulo('No pudimos cargar esta pantalla')+'<div class="banner err" role="alert">Esto es un error de prueba. No se registraron cambios nuevos.</div>'+boton('Reintentar','data-recuperar','p');}
 else if(r==='hoy'){
   const proximos=alumnos.filter(a=>['Por vencer','Vence hoy'].includes(a.estado));
   html=titulo('Hoy','Domingo 15 de noviembre · Montevideo')+`<section class="entrada-agenda"><div>${icono('agenda')}<h2>Agenda</h2></div><p>Quién viene cada día. Agendá una ficha existente.</p>${boton('Ver agenda','data-ruta="agenda"','s')}</section><div class="nums"><button class="num" data-filtro="Historial"><span class="l">Cobrado hoy · demo</span><span class="v">$ ${pagos.reduce((s,x)=>s+x.monto,0).toLocaleString('es-UY')}</span></button><button class="num marca" data-ruta="asistencia"><span class="l">Clases de hoy</span><span class="v">1</span></button><button class="num" data-filtro="Por vencer"><span class="l">Por vencer</span><span class="v">${escenario==='vacio'?0:proximos.length}</span></button><button class="num" data-filtro="Vencidas"><span class="l">Vencidas</span><span class="v">${escenario==='vacio'?0:alumnos.filter(a=>a.estado==='Vencida').length}</span></button><button class="num ancho" data-filtro="Clases adeudadas"><span class="l">Clases adeudadas</span><span class="v">${escenario==='vacio'?0:alumnos.filter(deuda).length}</span></button></div>${boton('+ Pago','data-ruta="pago"','p')}<section class="bloque"><div class="encabezado"><h2>Por vencer</h2><small>Próximos 7 días</small></div>${escenario==='vacio'?'<div class="card vac"><p>Nadie por vencer en este período.</p><p class="ayuda">Esto no significa que no haya otras deudas.</p></div>':`<div class="lista">${proximos.map(a=>fila(a)).join('')||'<div class="vac">No hay vencimientos próximos.</div>'}</div>`}</section><section class="bloque"><h2>Clase de hoy</h2><div class="card"><div class="espacio"><strong>Danza</strong><span>18:00–19:00</span></div>${boton('Ver quién viene','data-ruta="agenda"')}${boton('Registrar clase realizada','data-ruta="asistencia"','t')}</div></section>`;
 }
 else if(r==='alumnos'){
   const encontrados=filtrarOrdenar(alumnos,busqueda,filtroAlumnos,ordenAlumnos);
   html=titulo('Alumnos',`${alumnos.length} fichas ficticias · se conservan aunque no vengan un tiempo`)+boton('+ Alumno','data-ruta="alta"','p')+controlesAlumnos(filtroAlumnos,ordenAlumnos)+`<div class="campo"><label for="buscar">Buscar por nombre</label><input id="buscar" type="search" value="${esc(busqueda)}" placeholder="Por ejemplo, Ana"></div><div id="resultados">${escenario==='vacio'?'<div class="card vac"><h2>Todavía no hay alumnos</h2><p>Agregá el primero para empezar.</p></div>':listaBusqueda(encontrados)}</div>`;
 }
 else if(r==='alta'){
   html=volver()+titulo('Nuevo alumno','Datos → modalidad → ficha. Sin cobro automático.')+`<form id="alta-form"><div class="campo"><label for="nombre">Nombre y apellido *</label><input id="nombre" name="nombre" required autocomplete="off" maxlength="70" placeholder="Usá un nombre inventado"></div><div class="campo"><label for="telefono">Teléfono (opcional)</label><input id="telefono" name="telefono" type="tel" maxlength="24" placeholder="Dejalo vacío en esta prueba"><span class="ayuda">No ingreses datos personales reales. No se enviarán mensajes.</span></div><fieldset><legend>Modalidad</legend><label class="radio"><input type="radio" name="modalidad" value="mensualidad" checked>Mensualidad</label><label class="radio"><input type="radio" name="modalidad" value="suelta">Por clase individual</label></fieldset><div class="banner info"><p>Mensualidad: comienza en la primera clase posterior al pago, no al crear la ficha.</p><p>Clase suelta: se cobra al asistir.</p></div><p class="ayuda">Importes de ejemplo: mensualidad $ 1.800 UYU; clase $ 250 UYU.</p>${boton('Guardar alumno de prueba',`type="submit" ${habilitarGuardado()}`,'p')}</form>`;
 }
 else if(r==='alumno'&&p){
   html=volver()+titulo(p.nombre,p.modalidad==='suelta'?'Modalidad: clase suelta':'Modalidad: mensualidad')+chip(p.estado)+(p.modalidad==='mensualidad'?ciclo(p):`<div class="card"><h2>Clases sueltas</h2><p>${deuda(p)?'1 clase adeudada · 15/11/2026':'No hay clases adeudadas.'}</p></div>`)+(p.programado?`<div class="banner info">Clase suelta desde ${esc(p.programado)}. El ciclo actual sigue cubierto.</div>`:'')+(p.renovacion?`<div class="banner ok"><strong>Renovación ya pagada · demo</strong><p>Inicio ${esc(p.renovacion.inicio)} · vence ${esc(p.renovacion.vence)} · renueva ${esc(p.renovacion.renueva)}</p><p>No se ofrece un segundo cobro anticipado.</p></div>`:'')+`<div class="bloque">${p.modalidad==='mensualidad'&&!p.pagado&&!p.renovacion?boton(['Vigente','Por vencer','Vence hoy'].includes(p.estado)?'Renovar mensualidad':'Cobrar mensualidad',`data-ruta="cobro/${p.id}/mensualidad"`,'p'):''}${deuda(p)?boton('Cobrar clase adeudada',`data-ruta="cobro/${p.id}/suelta"`,'p'):''}${boton('Agendar alumno',`data-agendar-ficha="${p.id}"`)}${boton('Registrar clase realizada','data-ruta="asistencia"')}${boton('Avisar por WhatsApp',`data-ruta="whatsapp/${p.id}"`)}${boton('Cambiar modalidad',`data-ruta="modalidad/${p.id}"`)}</div><section class="bloque"><h2>Últimos pagos · demo</h2>${pagos.filter(x=>x.alumno===p.id).length?pagos.filter(x=>x.alumno===p.id).map(x=>boton(`${esc(x.concepto)} · ${pesos(x.monto)}`,`data-ruta="comprobante/${x.id}"`)).join(''):'<p class="ayuda">Todavía no registraste pagos en esta sesión de prueba.</p>'}</section>`;
 }
 else if(r==='asistencia'){
   const clase=clasePorId(id,escenario);
   const regreso=desdeAgenda?boton('Volver a Agenda','data-volver-agenda','t'):boton('Volver',`data-ruta="${origenAsistencia}"`,'t');
   if(id&&id!==CLASE_HOY){
     html=regreso+titulo('Clase realizada',clase?`${clase.nombre} · ${fechaLarga(clase.fecha)} · ${clase.inicio}–${clase.fin}`:'Ocurrencia no disponible')+`<div class="card"><p>${clase?'El registro de esta clase futura no está disponible en la demo.':'No encontramos esta clase.'}</p><p class="ayuda">La demo no registra asistencia de clases futuras ni carga otra lista en su lugar. No se cambió ningún pago ni asistencia.</p></div>`;
   }else html=regreso+titulo('Clase realizada','Danza · domingo 15/11/2026 · 18:00–19:00')+'<p class="ayuda">Registro de una clase efectivamente realizada, separado de la programación. No es una reserva ni una lista escolar obligatoria. El inicio manual no se ejecuta en esta demo.</p>'+`<p class="ayuda">${alumnos.filter(a=>realizada(a)).length} ${alumnos.filter(a=>realizada(a)).length===1?'presente':'presentes'} · ${alumnos.filter(a=>noVino(a)).length} ${alumnos.filter(a=>noVino(a)).length===1?'ausente':'ausentes'} · guardado solo en memoria de prueba</p>`+(escenario==='vacio'?'<div class="card vac"><h2>No hay alumnos para registrar clases realizadas</h2><p>Agregá un alumno para continuar.</p>'+boton('Ir a Alumnos','data-ruta="alumnos"')+'</div>':`<div class="lista">${alumnos.map(a=>`<article class="item"><button class="nombre enlace" data-ruta="alumno/${a.id}">${esc(a.nombre)}</button>${chip(a.estado)}<div class="acciones">${boton(realizada(a)?'Clase realizada registrada':'Clase realizada',`data-presente="${a.id}" aria-label="${realizada(a)?'Revisar clase realizada de':'Registrar clase realizada de'} ${esc(a.nombre)}" aria-pressed="${!!realizada(a)}" ${habilitarGuardado()}`,realizada(a)?'s seleccionada':'s')}${boton(noVino(a)?'No vino registrado':'No vino',`data-ausente="${a.id}" aria-label="Registrar que no vino ${esc(a.nombre)}" aria-pressed="${!!noVino(a)}" ${habilitarGuardado()}`)}</div>${realizada(a)?`<p class="ayuda">Clase realizada · registro simulado${deuda(a)?' · clase adeudada':''}${a.clasePagada?' · clase pagada':''}</p>${deuda(a)?boton('Cobrar clase $ 250 UYU',`data-ruta="cobro/${a.id}/suelta"`):''}`:''}</article>`).join('')}</div>`)+boton('Cancelar clase (política pendiente)','data-politica="Q2"','t');
 }
 else if(r==='pago'){
   html=volver('hoy')+titulo('Registrar pago','Elegí a quién cobrar. Operación de prueba.')+`<div class="lista">${alumnos.map(a=>`<article class="item"><strong>${esc(a.nombre)}</strong>${a.modalidad==='mensualidad'?a.renovacion||a.pagado?'<p class="ayuda">Ya tiene un pago programado.</p>':boton('Mensualidad',`data-ruta="cobro/${a.id}/mensualidad"`):deuda(a)?boton('Clase suelta · 15/11',`data-ruta="cobro/${a.id}/suelta"`):'<p class="ayuda">La clase individual se cobra por clase efectivamente realizada, no por reservar.</p>'}${boton('Ver ficha',`data-ruta="alumno/${a.id}"`,'t')}</article>`).join('')}</div>`;
 }
 else if(r==='cobro'&&p){
   const suelta=tipo==='suelta';const invalido=(suelta&&(!realizada(p)||p.clasePagada))||(!suelta&&(p.renovacion||p.pagado));
   html=volver('alumno/'+p.id)+titulo(suelta?'Cobrar clase suelta':'Cobrar mensualidad',p.nombre);
   if(invalido) html+='<div class="banner info">Este concepto no está disponible para cobrar de nuevo. Revisá la ficha.</div>'+boton('Ver ficha',`data-ruta="alumno/${p.id}"`,'p');
   else html+=`<form id="cobro-form" data-alumno="${p.id}" data-tipo="${suelta?'suelta':'mensualidad'}"><div class="banner info">Simulación: se registra un pago manual de prueba, no se procesa dinero.</div><div class="campo"><label for="monto">Monto total · UYU *</label><input id="monto" name="monto" inputmode="numeric" value="${suelta?250:1800}" required aria-describedby="ayuda-monto"><span class="ayuda" id="ayuda-monto">Tarifa ficticia: ${pesos(suelta?250:1800)}. Enteros, sin pagos parciales.</span></div><div class="campo" id="motivo-campo" hidden><label for="motivo">Motivo del cambio de monto *</label><input id="motivo" name="motivo" maxlength="120"></div><div class="campo"><label for="medio">Medio de pago *</label><select id="medio" name="medio" required><option value="">Elegí un medio</option><option>Efectivo</option><option>Transferencia</option><option>Otro</option></select></div><div class="dato"><span>Fecha de pago · fija en demo</span><strong>15/11/2026</strong></div>${suelta?'<div class="ciclo"><p class="tit">Concepto de prueba</p><p>Clase suelta · 15/11/2026</p></div>':vistaCobro(p)}<p id="error-cobro" class="error-campo" role="alert"></p>${boton('Confirmar registro de prueba',`type="submit" id="confirmar" ${habilitarGuardado()}`,'p')}<p class="ayuda">Solo cambia esta demo. No es un comprobante real.</p></form>`;
 }
 else if(r==='comprobante'){
   const pago=pagos.find(x=>x.id===id);html=titulo('Registro simulado','Sin valor como comprobante de pago real.');
   if(!pago) html+='<p>No hay un pago confirmado en esta sesión para ese registro.</p>'+boton('Ir a Cobros','data-ruta="cobros"','p');
   else html+=`<div class="card"><span class="resultado" aria-hidden="true">${icono('check')}</span><h2>Pago de prueba registrado</h2><p>${esc(persona(pago.alumno).nombre)} · ${esc(pago.concepto)}</p><p class="monto">${pesos(pago.monto)}</p><div class="dato"><span>Medio</span><strong>${esc(pago.medio)}</strong></div><div class="dato"><span>Fecha</span><strong>15/11/2026</strong></div><p class="ayuda">Registrado por Dueña A (ficticia).</p>${pago.ciclo?ciclo(pago.ciclo):'<p>Clase suelta del 15/11/2026.</p>'}${pago.anulado?'<div class="banner err">Anulación simulada · original conservado. Motivo: '+esc(pago.motivoAnulacion)+'</div>':''}</div>${boton('Ver ficha',`data-ruta="alumno/${pago.alumno}"`,'p')}${boton('Volver a la lista','data-ruta="asistencia"')}${!pago.anulado?boton('Sobre anulaciones',`data-anular="${pago.id}"`,'t'):''}`;
 }
 else if(r==='cobros'){
   let lista=filtro==='Historial'?[]:alumnos.filter(a=>filtro==='Vencidas'?a.estado==='Vencida':filtro==='Clases adeudadas'?deuda(a):['Por vencer','Vence hoy'].includes(a.estado));
   html=titulo('Cobros','Bandeja de trabajo · solo datos de prueba')+`<div class="acciones">${['Por vencer','Vencidas','Clases adeudadas','Historial'].map(f=>boton(f,`data-filtro="${f}" aria-pressed="${f===filtro}"`,f===filtro?'p':'s')).join('')}</div><h2>${esc(filtro)}</h2>`;
   if(escenario==='vacio'||(filtro==='Historial'?!pagos.length:!lista.length))html+=`<div class="card vac"><p>${filtro==='Historial'?'Todavía no registraste pagos en esta demo.':'No hay registros para este filtro.'}</p>${boton('Ver alumnos','data-ruta="alumnos"')}</div>`;
   else if(filtro==='Historial')html+=pagos.map(x=>boton(`${esc(persona(x.alumno).nombre)} · ${pesos(x.monto)}${x.anulado?' · Anulado':''}`,`data-ruta="comprobante/${x.id}"`)).join('');
   else html+=`<div class="lista">${lista.map(a=>fila(a)).join('')}</div>`;
   html+=boton('+ Pago','data-ruta="pago"','p');
 }
 else if(r==='whatsapp'&&p){
   html=volver('alumno/'+p.id)+titulo('Avisar por WhatsApp',p.nombre)+`<div class="guia-mensaje">${icono('whatsapp')}<p>Prepará el mensaje y revisalo antes de salir.</p></div><p class="ayuda">Pictograma genérico de mensajería, no logotipo oficial. No hay envío ni vínculo con WhatsApp en esta demo.</p>`;
   if(!p.telefono)html+='<div class="card"><h2>Falta el teléfono</h2><p>En la app se agregaría desde la ficha. En esta prueba no ingresamos teléfonos reales.</p>'+boton('Volver a la ficha',`data-ruta="alumno/${p.id}"`,'p')+'</div>';
   else html+=`<form id="whatsapp-form"><p class="ayuda">Destinatario ficticio · no hay número real ni enlace externo.</p><div class="campo"><label for="mensaje">Mensaje editable</label><textarea id="mensaje" required>Hola, ${esc(p.nombre.split(' ')[0])}. Tu mensualidad ${p.estado==='Vencida'?'venció':'vence'} el ${esc(p.vence||'día por confirmar')}. Si ya pagaste, avisame. Gracias.</textarea></div>${boton('Simular apertura de WhatsApp','type="submit"','p')}<p class="ayuda">La app real abriría wa.me para que vos decidas enviarlo. Abrir no significa enviado.</p></form>`;
 }
 else if(r==='modalidad'&&p){
   const cobertura=p.renovacion||p;
   html=volver('alumno/'+p.id)+titulo('Cambiar modalidad',p.nombre);
   if(p.modalidad==='suelta')html+='<div class="card"><h2>Clase suelta → mensualidad</h2><p>Lo pagado por clase no se reembolsa automáticamente. Las clases adeudadas anteriores se conservan.</p><p>Comienza en su primera clase posterior al pago.</p>'+boton('Continuar a cobrar mensualidad',`data-ruta="cobro/${p.id}/mensualidad" ${habilitarGuardado()}`,'p')+'</div>';
   else if(!p.vence||p.estado==='Vencida')html+='<div class="card"><p>No hay cobertura vigente que programar en este fixture. Usá Ana para explorar un cambio con cobertura.</p>'+boton('Ver a Ana','data-ruta="modalidad/ana"')+'</div>';
   else html+=`<div class="card"><h2>Mensualidad → clase suelta</h2><p>La mensualidad sigue vigente hasta ${esc(cobertura.vence)}. Desde ${esc(cobertura.renueva)} se cobra por clase.</p><p>No se modifica el pago anterior.</p>${boton(p.programado?'Cambio ya programado':'Confirmar cambio de prueba',`data-programar="${p.id}" ${p.programado?'disabled':habilitarGuardado()}`,'p')}</div>${boton('Terminar mensualidad hoy · pendiente','data-politica="Q3"','t')}`;
 }
 else if(r==='mas'){
   html=titulo('Más','Límites del prototipo')+boton('Horario y clases','data-ruta="agenda"')+'<div class="card"><h2>Tarifas de ejemplo</h2><p>Mensualidad $ 1.800 UYU<br>Clase suelta $ 250 UYU</p><p class="ayuda">No son precios de la clienta. La edición de tarifas y horario, los reportes y las cuentas no están disponibles en esta demo.</p></div><div class="card"><h2>Políticas todavía pendientes</h2>'+boton('Q2 · Correcciones y cancelación','data-politica="Q2"')+boton('Q3 · Terminar mensualidad hoy','data-politica="Q3"')+'</div>'+boton('Ver controles de prueba','data-pruebas');
 }
 else html=titulo('No encontramos esa pantalla')+boton('Volver a Hoy','data-ruta="hoy"','p');
 if(escenario==='offline')html='<div class="banner off" id="sin-red" role="status"><strong>Sin conexión · simulado</strong><p>Datos de prueba del 15/11, 18:00. Necesitás internet para guardar. No se encolan cambios.</p>'+boton('Restablecer conexión simulada','data-recuperar')+'</div>'+html;
 if(escenario==='vacio'&&['alta','cobro','alumno','whatsapp','comprobante','modalidad'].includes(r))html='<div class="banner info">Para revisar formularios sin datos, usá Nuevo alumno. Los registros existentes no se borran al cambiar este control.</div>'+html;
 $('#contenido').innerHTML=html+'<p class="pie-demo">Demo de diseño ENC-08 · datos ficticios, sin backend ni guardado real. Recargar borra esta sesión.</p>';
 ultimaRuta=location.hash||'#hoy';restaurarBorrador();
 if(r==='agenda'&&rutaAnterior.startsWith('#agenda')){
   window.scrollTo(0,scrollAnterior);if(focoAgenda){enfocarVisible(focoAgenda);focoAgenda=null;}
 }else if(r==='agenda'&&desdeAgenda){
   window.scrollTo(0,agenda.scroll);const disparador=agenda.disparador?$(`[data-agenda-salida="${agenda.disparador}"]`):null;
   (disparador||$('#detalle-dia')||$('#contenido h1'))?.focus({preventScroll:true});
 }else {($('#contenido h1')||$('#contenido')).focus({preventScroll:true});window.scrollTo(0,0);}
 anunciar(r==='agenda'?(avisoProgramacion||`Agenda, ${agenda.vista}, ${fechaLarga(agenda.fecha)}. Detalle actualizado.`):escenario==='cargando'?'Cargando pantalla de prueba':($('#contenido h1')?.textContent||'Pantalla actualizada'));
 avisoProgramacion='';
}
function listaBusqueda(xs){return xs.length?`<div class="lista">${xs.map(p=>fila(p)).join('')}</div>`:`<div class="card vac"><p>No encontramos alumnos para “${esc(busqueda)}”.</p>${boton('Borrar búsqueda','data-limpiar')}</div>`;}
function vistaCobro(p){if(['Vigente','Por vencer','Vence hoy'].includes(p.estado))return '<div class="ciclo"><p class="tit">Renovación continua · fixture</p><p>El ciclo actual no cambia.</p><div class="kk">Nuevo inicio <b>'+esc(p.renueva)+'</b></div><div class="kk">Último día cubierto <b>'+esc(p.id==='ana'?'17/12/2026':p.id==='rosa'?'15/12/2026':'31/12/2026')+'</b></div><div class="kk">Próxima renovación <b>'+esc(p.id==='ana'?'18/12/2026':p.id==='rosa'?'16/12/2026':'01/01/2027')+'</b></div></div>';if(realizada(p))return '<div class="ciclo"><p class="tit">Ya está asistiendo hoy · fixture</p><p>Inicio: 15/11/2026</p><p>Último día cubierto: 14/12/2026</p><p>Próxima renovación: 15/12/2026</p></div>';return '<div class="ciclo"><p class="tit">Después del pago</p><p>Pagada, sin iniciar.</p><p>Inicio: pendiente de primera clase.</p><p>Vencimiento y renovación: pendientes de inicio.</p></div>';}
async function pausa(){return new Promise(r=>setTimeout(r,550));}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.hasAttribute('data-cerrar'))return $('#dialogo').close();
 if(b.dataset.agendaSalida)guardarContextoAgenda(b);
 if(b.hasAttribute('data-alta-agenda')){altaDesdeAgenda=true;return ir('alta');}
 if(b.hasAttribute('data-agendar-ficha')){buscarAgenda=persona(b.dataset.agendarFicha)?.nombre||'';modalidadAgenda='todos';return ir('agendar/'+agenda.fecha);}
 if(b.dataset.retirarReserva)return modal('Retirar solo la programación',`<p>La ficha seguirá en Alumnos para volver a agendarla. No se altera ninguna clase realizada, mensualidad, deuda ni pago.</p>${boton('Confirmar retiro de programación',`data-confirmar-retiro="${b.dataset.retirarReserva}" ${habilitarGuardado()}`,'p')}`);
 if(b.dataset.confirmarRetiro){if(escenario==='offline')return;retirarReserva(b.dataset.confirmarRetiro);avisoProgramacion='Programación retirada en la demo. La ficha, las clases realizadas y los pagos se conservan.';$('#dialogo').close();irAgenda();return;}
 if(b.hasAttribute('data-principal')&&b.dataset.ruta!=='agenda'){desdeAgenda=false;altaDesdeAgenda=false;}
 if(b.hasAttribute('data-volver-agenda'))return irAgenda();
 if(b.hasAttribute('data-agenda-valida')){agenda=crearEstadoAgenda();return irAgenda();}
 if(b.dataset.vistaAgenda){agenda.vista=b.dataset.vistaAgenda;focoAgenda=`[data-vista-agenda="${agenda.vista}"]`;return irAgenda();}
 if(b.dataset.moverAgenda){const nueva=moverFecha(agenda.fecha,agenda.vista,Number(b.dataset.moverAgenda));if(!fechaValida(nueva))return modal('Límite de la demo','<p>Podés explorar fechas entre 1900 y 2100.</p>');agenda.fecha=nueva;focoAgenda=`[data-mover-agenda="${b.dataset.moverAgenda}"]`;return irAgenda();}
 if(b.dataset.fechaAgenda){agenda.fecha=b.dataset.fechaAgenda;focoAgenda=`[data-fecha-agenda="${agenda.fecha}"]`;return irAgenda();}
 if(b.hasAttribute('data-hoy-agenda')){agenda.fecha=HOY;focoAgenda='[data-hoy-agenda]';irAgenda();setTimeout(()=>irAlDetalle(agenda.vista==='semana'?'#dia-'+HOY:'#detalle-dia'),0);return;}
 if(b.hasAttribute('data-ir-hoy'))return irAlDetalle('#dia-'+HOY);
 if(b.hasAttribute('data-ir-detalle'))return irAlDetalle('#detalle-dia');
 if(b.hasAttribute('data-ver-horario'))return modal('Horario de ejemplo, sin edición','<p>Edición de horario no disponible en este prototipo. Las clases son ejemplos y no se guardan.</p>');
 if(b.dataset.ruta){if(b.dataset.ruta==='asistencia'&&ruta()[0]!=='asistencia')origenAsistencia=location.hash.slice(1)||'hoy';return ir(b.dataset.ruta);}
 if(b.dataset.filtro){filtro=b.dataset.filtro;return ir('cobros');}
 if(b.hasAttribute('data-recuperar')){escenario='normal';$('#escenario').value='normal';return render();}
 if(b.hasAttribute('data-politica'))return bloqueo(b.dataset.politica);
 if(b.hasAttribute('data-pruebas'))return $('#abrir-pruebas').click();
 if(b.hasAttribute('data-limpiar')){busqueda='';return render();}
 if(b.dataset.presente){
   if(escenario==='offline'||pendiente)return;
   const p=persona(b.dataset.presente);if(realizada(p))return p.clasePagada||p.inicioPorAsistencia?bloqueo('Q2'):modal('Asistencia ya registrada','<p>No se duplica al tocar de nuevo. Para una corrección cobrada, Q2 sigue pendiente.</p>');
   pendiente=true;b.disabled=true;b.textContent='Guardando…';await pausa();pendiente=false;if(escenario==='offline')return render();registrarRealizacion(p.id,'realizada');if(p.modalidad==='suelta')p.claseAdeudada=true;
   if(p.pagado && p.estado==='Pagada, sin iniciar'){p.estado='Vigente';p.inicio='15/11/2026';p.vence='14/12/2026';p.renueva='15/12/2026';p.inicioPorAsistencia=true;}
   render();
   if(deuda(p))modal('Presencia registrada · demo',`<p>${esc(p.nombre)} · clase suelta del 15/11.</p><p>Si no cobrás ahora, queda clase adeudada en esta demo.</p>${boton('Cobrar clase $ 250 UYU',`data-cobrar-desde-dialogo="${p.id}"`,'p')}`);
   else if(['Vencida','Sin mensualidad'].includes(p.estado))modal('No tiene mensualidad vigente',`<p>La asistencia no se bloquea.</p>${boton('Cobrar mensualidad',`data-cobrar-desde-dialogo="${p.id}" data-concepto="mensualidad"`,'p')}${boton('Cobrar clase suelta',`data-cobrar-desde-dialogo="${p.id}" data-concepto="suelta"`)}`);
   return;
 }
 if(b.dataset.cobrarDesdeDialogo){$('#dialogo').close();return ir('cobro/'+b.dataset.cobrarDesdeDialogo+'/'+(b.dataset.concepto||'suelta'));}
 if(b.dataset.ausente){if(escenario==='offline')return;const p=persona(b.dataset.ausente);if(realizada(p))return bloqueo('Q2');registrarRealizacion(p.id,'no vino');return render();}
 if(b.dataset.programar){if(escenario==='offline')return;const p=persona(b.dataset.programar);p.programado=(p.renovacion||p).renueva;ir('alumno/'+p.id);anunciar('Cambio de prueba programado');return;}
 if(b.dataset.anular)return modal('Anulaciones fuera de este recorrido','<p>En el producto, se registra una anulación con motivo, fecha y usuario; nunca se edita ni se borra el pago original. Una mensualidad anulada deja el ciclo sin efecto.</p><p>Esta demo no ejecuta anulaciones ni resuelve Q2/Q3. No se modificó este registro.</p>');
});
document.addEventListener('submit',async e=>{
 const f=e.target;if(!['alta-form','cobro-form','whatsapp-form','agendar-form'].includes(f.id))return;e.preventDefault();
 if(f.id==='whatsapp-form'){if(!$('#mensaje').value.trim())return;return modal('Apertura simulada, no envío','<p>En la app real se abriría WhatsApp con el texto que editaste. Vos decidís si lo enviás.</p><p>Esta demo no abre un contacto, no guarda un aviso y no afirma entrega.</p>');}
 if(escenario==='offline'||pendiente)return;
 if(f.id==='agendar-form'){
   const fd=new FormData(f),alumnoId=String(fd.get('alumnoId')||'');
   if(!persona(alumnoId)||!fechaValida(f.dataset.fecha))return;
   try{agendarAlumno({alumnoId,fecha:f.dataset.fecha,hora:String(fd.get('hora')||''),claseId:fd.get('claseId')});f.dataset.enviado='true';delete borradores[location.hash];agenda.fecha=f.dataset.fecha;avisoProgramacion='Alumno agendado solo en esta demo. No se registró clase realizada, deuda ni pago.';irAgenda();}catch(error){$('#error-agendar').textContent=error.message;}
   return;
 }
 if(f.id==='alta-form'){
   const fd=new FormData(f);const nombre=String(fd.get('nombre')).trim();if(!nombre)return $('#nombre').setCustomValidity('Ingresá un nombre ficticio.');
   f.dataset.enviado='true';delete borradores[location.hash];const id='nuevo'+siguiente++;alumnos.push({id,nombre,modalidad:fd.get('modalidad'),estado:fd.get('modalidad')==='suelta'?'Clase suelta':'Sin mensualidad',alta:new Date(Date.UTC(2026,10,15,18,0,siguiente)).toISOString(),telefono:!!String(fd.get('telefono')).trim()});if(altaDesdeAgenda){buscarAgenda=nombre;modalidadAgenda='todos';altaDesdeAgenda=false;return ir('agendar/'+agenda.fecha);}ir('alumno/'+id);return;
 }
 if(f.id==='cobro-form'){
   const p=persona(f.dataset.alumno),suelta=f.dataset.tipo==='suelta',fd=new FormData(f),raw=String(fd.get('monto')).trim(),monto=Number(raw),motivo=String(fd.get('motivo')||'').trim();
   if(!/^\d+$/.test(raw)||!Number.isSafeInteger(monto)||monto<=0){$('#error-cobro').textContent='En este fixture usá un importe entero mayor que cero. Becas totales no se prueban acá.';$('#monto').focus();return;}
   if(monto!==(suelta?250:1800)&&!motivo){$('#error-cobro').textContent='Indicá el motivo del cambio de monto.';$('#motivo').focus();return;}
   pendiente=true;$('#confirmar').disabled=true;$('#confirmar').textContent='Registrando en la demo…';await pausa();pendiente=false;if(escenario==='offline')return render();
   const estadoPrevio=p.estado;const id='pago'+siguiente++;const x={id,alumno:p.id,concepto:suelta?'Clase suelta':'Mensualidad',monto,medio:fd.get('medio'),motivo,estadoPrevio,modalidadPrevia:p.modalidad};
   if(suelta)p.clasePagada=true;
   else if(['Vigente','Por vencer','Vence hoy'].includes(p.estado)){p.renovacion={inicio:p.renueva,vence:p.id==='ana'?'17/12/2026':p.id==='rosa'?'15/12/2026':'31/12/2026',renueva:p.id==='ana'?'18/12/2026':p.id==='rosa'?'16/12/2026':'01/01/2027'};x.ciclo={...p.renovacion,estado:'Vigente'};}
   else{p.modalidad='mensualidad';p.pagado=true;p.estado=realizada(p)?'Vigente':'Pagada, sin iniciar';p.inicio=realizada(p)?'15/11/2026':null;p.vence=realizada(p)?'14/12/2026':null;p.renueva=realizada(p)?'15/12/2026':null;p.inicioPorAsistencia=!!realizada(p);x.ciclo={estado:p.estado,inicio:p.inicio,vence:p.vence,renueva:p.renueva};}
   f.dataset.enviado='true';delete borradores[location.hash];pagos.push(x);ir('comprobante/'+id);return;
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='nombre')e.target.setCustomValidity('');
 if(e.target.id==='buscar'){busqueda=e.target.value;$('#resultados').innerHTML=listaBusqueda(filtrarOrdenar(alumnos,busqueda,filtroAlumnos,ordenAlumnos));}
 if(e.target.id==='buscar-agenda'){buscarAgenda=e.target.value;$('#opciones-agenda').innerHTML=opcionesAgendar(filtrarOrdenar(alumnos,buscarAgenda,modalidadAgenda));}
 if(e.target.id==='monto'){const mod=Number(e.target.value)!==($('#cobro-form').dataset.tipo==='suelta'?250:1800);$('#motivo-campo').hidden=!mod;$('#motivo').required=mod;}
});
document.addEventListener('change',e=>{
 if(e.target.id==='filtro-alumnos'){filtroAlumnos=e.target.value;$('#resultados').innerHTML=listaBusqueda(filtrarOrdenar(alumnos,busqueda,filtroAlumnos,ordenAlumnos));}
 if(e.target.id==='orden-alumnos'){ordenAlumnos=e.target.value;$('#resultados').innerHTML=listaBusqueda(filtrarOrdenar(alumnos,busqueda,filtroAlumnos,ordenAlumnos));}
 if(e.target.id==='modalidad-agenda'){modalidadAgenda=e.target.value;$('#opciones-agenda').innerHTML=opcionesAgendar(filtrarOrdenar(alumnos,buscarAgenda,modalidadAgenda));}
});
$('#abrir-pruebas').addEventListener('click',()=>{const abierto=$('#pruebas').hidden;$('#pruebas').hidden=!abierto;$('#abrir-pruebas').setAttribute('aria-expanded',String(abierto));});
$('#escenario').addEventListener('change',e=>{escenario=e.target.value;render();});
$('#tema').addEventListener('click',()=>{const oscuro=document.documentElement.dataset.tema!=='oscuro';document.documentElement.dataset.tema=oscuro?'oscuro':'claro';$('#tema').textContent=oscuro?'Usar tema claro':'Usar tema oscuro';});
$('#reiniciar').addEventListener('click',()=>{borradores={};ultimaRuta='';inicializar();escenario='normal';$('#escenario').value='normal';$('#dialogo').close();ir('hoy');render();anunciar('Demo reiniciada');});
document.addEventListener('toggle',e=>{const fecha=e.target.dataset?.expansion;if(fecha){if(e.target.open)agenda.expandido.add(fecha);else agenda.expandido.delete(fecha);}},true);
$('#texto-grande').addEventListener('click',()=>{const grande=document.documentElement.dataset.textoGrande!=='true';document.documentElement.dataset.textoGrande=String(grande);$('#texto-grande').setAttribute('aria-pressed',String(grande));});
// Mantiene la última fila fuera de la barra, incluso con texto ampliado.
new ResizeObserver(([entrada])=>{$('.app').style.paddingBottom=`${entrada.target.getBoundingClientRect().height+24}px`;}).observe($('.navegacion'));
window.addEventListener('hashchange',render);
render();
