'use strict';
// ENC-06: fixtures de diseño; sin backend, almacenamiento persistente ni cálculo financiero.
const $ = (s) => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pesos = n => '$ ' + Number(n).toLocaleString('es-UY') + ' UYU';
let alumnos, pagos, siguiente, escenario='normal', filtro='Por vencer', busqueda='', pendiente=false;
let borradores={},ultimaRuta='';
function guardarBorrador(){const f=$('#contenido form');if(!f||f.dataset.enviado||!ultimaRuta)return;borradores[ultimaRuta]=Array.from(f.querySelectorAll('input,select,textarea')).map(x=>({id:x.id,nombre:x.name,tipo:x.type,valor:x.value,checked:x.checked}));}
function restaurarBorrador(){const f=$('#contenido form');if(!f)return;for(const x of borradores[location.hash||'#hoy']||[]){const el=x.id?document.getElementById(x.id):Array.from(f.elements).find(e=>e.name===x.nombre&&e.value===x.valor);if(!el)continue;if(x.tipo==='radio')el.checked=x.checked;else el.value=x.valor;}if($('#monto'))$('#monto').dispatchEvent(new Event('input',{bubbles:true}));}
const inicializar = () => {
  alumnos=[
    {id:'ana',nombre:'Ana Pérez',modalidad:'mensualidad',estado:'Por vencer',inicio:'18/10/2026',vence:'17/11/2026',renueva:'18/11/2026',presente:false,telefono:true},
    {id:'lucia',nombre:'Lucía Silva',modalidad:'suelta',estado:'Clase suelta',presente:false,telefono:false},
    {id:'rosa',nombre:'Rosa Méndez',modalidad:'mensualidad',estado:'Vence hoy',inicio:'16/10/2026',vence:'15/11/2026',renueva:'16/11/2026',presente:false,telefono:true},
    {id:'marcos',nombre:'Marcos Díaz',modalidad:'mensualidad',estado:'Vencida',inicio:'15/10/2026',vence:'14/11/2026',renueva:null,presente:false,telefono:false},
    {id:'ines',nombre:'Inés Costa',modalidad:'mensualidad',estado:'Vigente',inicio:'01/11/2026',vence:'30/11/2026',renueva:'01/12/2026',presente:false,telefono:true}
  ]; pagos=[];siguiente=1;pendiente=false;busqueda='';filtro='Por vencer';
};
inicializar();
const persona=id=>alumnos.find(p=>p.id===id);
const deuda=p=>!!p.claseAdeudada && !p.clasePagada;
const iconos={Hoy:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',Alumnos:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 6"/>',Asistencia:'<rect x="4" y="4" width="16" height="18" rx="2"/><path d="M8 2v4m8-4v4M8 13l3 3 5-6"/>',Cobros:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 10h18m-6 5h3"/>',Más:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'};
function boton(text,attrs='',tipo='s'){return `<button class="btn ${tipo}" ${attrs}>${text}</button>`;}
function chip(estado){const mapa={'Vigente':['vigente','✓'],'Por vencer':['por-vencer','◷'],'Vence hoy':['vence-hoy','◷'],'Vencida':['vencida','!'],'Pagada, sin iniciar':['sin-iniciar','Ⅱ'],'Sin mensualidad':['sin-mens','—'],'Clase suelta':['neutro','·']};const [c,i]=mapa[estado]||['neutro','·'];return `<span class="chip ${c}"><span class="simbolo" aria-hidden="true">${i}</span>${esc(estado)}</span>`;}
function titulo(t,sub=''){return `<div class="intro"><h1 tabindex="-1">${esc(t)}</h1>${sub?`<p class="ayuda">${esc(sub)}</p>`:''}</div>`;}
function volver(dest='alumnos'){return boton('← Volver',`data-ruta="${dest}"`,'t volver');}
function ciclo(p){return `<div class="ciclo"><p class="tit">Mensualidad · fechas de ejemplo</p><div class="kk">Inicio <b>${esc(p.inicio||'Pendiente de primera clase')}</b></div><div class="kk">${p.estado==='Vencida'?'Venció el':'Vence el'} <b>${esc(p.vence||'Pendiente de inicio')}</b></div><div class="kk">Próxima renovación <b>${esc(p.renueva||'Pendiente de nuevo inicio')}</b></div></div>`;}
function fila(p,acciones=true){return `<article class="item"><div class="espacio"><p class="nombre">${esc(p.nombre)}</p></div>${chip(p.estado)}${p.vence?`<p class="fechas">${p.estado==='Vencida'?'Venció':'Vence'} el <strong>${esc(p.vence)}</strong><br>Próxima renovación: <strong>${esc(p.renueva||'pendiente de nuevo inicio')}</strong></p>`:''}${deuda(p)?'<p class="ayuda">1 clase adeudada · 15/11</p>':''}${acciones?`<div class="acciones">${boton('Ver ficha',`data-ruta="alumno/${p.id}"`)}${p.telefono && ['Por vencer','Vence hoy'].includes(p.estado)?boton('Avisar por WhatsApp',`data-ruta="whatsapp/${p.id}"`,'t'):''}</div>`:''}</article>`;}
function ruta(){return decodeURIComponent(location.hash.slice(1)||'hoy').split('/');}
function ir(dest){if(location.hash==='#'+dest) render();else location.hash=dest;}
function anunciar(s){$('#anuncio').textContent=s;}
function navegar(){const [r]=ruta();const actual=({hoy:'Hoy',alumnos:'Alumnos',alta:'Alumnos',alumno:'Alumnos',modalidad:'Alumnos',whatsapp:'Alumnos',asistencia:'Asistencia',cobro:'Cobros',comprobante:'Cobros',cobros:'Cobros',pago:'Cobros',mas:'Más'})[r];$('.navegacion').innerHTML=Object.keys(iconos).map(n=>`<button data-ruta="${({Hoy:'hoy',Alumnos:'alumnos',Asistencia:'asistencia',Cobros:'cobros',Más:'mas'})[n]}" ${actual===n?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${iconos[n]}</svg>${n}</button>`).join('');}
function modal(t,html){$('#dialogo-contenido').innerHTML=`<h2 id="titulo-dialogo">${esc(t)}</h2>${html}${boton('Entendido','data-cerrar','p')}`;$('#dialogo').showModal();}
function bloqueo(politica){modal('Regla pendiente · no se aplica ningún cambio',`<p>${politica==='Q2'?'Q2: corregir una asistencia cobrada o cancelar una clase cobrada necesita una política de ajuste auditado. No están definidos reintegro, reimputación ni efecto sobre el inicio del ciclo.':'Q3: falta definir si «Terminar mensualidad hoy» cubre la clase de hoy y desde cuándo se cobra por clase.'}</p><p class="ayuda">Este prototipo no resuelve la política ni modifica pagos, asistencia o cobertura. Se debe cerrar con la clienta antes de implementar el borde.</p>`);}
function habilitarGuardado(){return escenario==='offline'?'disabled aria-describedby="sin-red"':'';}
function render(){
 guardarBorrador();
 const [r,id,tipo]=ruta();const p=persona(id);navegar();let html='';
 if(escenario==='cargando'){html=titulo('Cargando…','Estado simulado para revisar claridad.')+'<div class="skel" aria-hidden="true"></div><div class="skel corta" aria-hidden="true"></div>'+boton('Finalizar carga simulada','data-recuperar','p');}
 else if(escenario==='error'){html=titulo('No pudimos cargar esta pantalla')+'<div class="banner err" role="alert">Esto es un error de prueba. No se registraron cambios nuevos.</div>'+boton('Reintentar','data-recuperar','p');}
 else if(r==='hoy'){
   const proximos=alumnos.filter(a=>['Por vencer','Vence hoy'].includes(a.estado));
   html=titulo('Hoy','Domingo 15 de noviembre · Montevideo')+`<div class="nums"><button class="num" data-filtro="Historial"><span class="l">Cobrado hoy · demo</span><span class="v">$ ${pagos.reduce((s,x)=>s+x.monto,0).toLocaleString('es-UY')}</span></button><button class="num marca" data-ruta="asistencia"><span class="l">Clases de hoy</span><span class="v">1</span></button><button class="num" data-filtro="Por vencer"><span class="l">Por vencer</span><span class="v">${escenario==='vacio'?0:proximos.length}</span></button><button class="num" data-filtro="Vencidas"><span class="l">Vencidas</span><span class="v">${escenario==='vacio'?0:alumnos.filter(a=>a.estado==='Vencida').length}</span></button><button class="num ancho" data-filtro="Clases adeudadas"><span class="l">Clases adeudadas</span><span class="v">${escenario==='vacio'?0:alumnos.filter(deuda).length}</span></button></div>${boton('+ Pago','data-ruta="pago"','p')}<section class="bloque"><div class="encabezado"><h2>Por vencer</h2><small>Próximos 7 días</small></div>${escenario==='vacio'?'<div class="card vac"><p>Nadie por vencer en este período.</p><p class="ayuda">Esto no significa que no haya otras deudas.</p></div>':`<div class="lista">${proximos.map(a=>fila(a)).join('')||'<div class="vac">No hay vencimientos próximos.</div>'}</div>`}</section><section class="bloque"><h2>Clase de hoy</h2><div class="card"><div class="espacio"><strong>Danza</strong><span>18:00–19:00</span></div>${boton('Pasar lista','data-ruta="asistencia"')}</div></section>`;
 }
 else if(r==='alumnos'){
   const encontrados=alumnos.filter(a=>a.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()));
   html=titulo('Alumnos',`${alumnos.length} alumnos ficticios`)+boton('+ Alumno','data-ruta="alta"','p')+`<div class="campo"><label for="buscar">Buscar por nombre</label><input id="buscar" type="search" value="${esc(busqueda)}" placeholder="Por ejemplo, Ana"></div><div id="resultados">${escenario==='vacio'?'<div class="card vac"><h2>Todavía no hay alumnos</h2><p>Agregá el primero para empezar.</p></div>':listaBusqueda(encontrados)}</div>`;
 }
 else if(r==='alta'){
   html=volver()+titulo('Nuevo alumno','Datos → modalidad → ficha. Sin cobro automático.')+`<form id="alta-form"><div class="campo"><label for="nombre">Nombre y apellido *</label><input id="nombre" name="nombre" required autocomplete="off" maxlength="70" placeholder="Usá un nombre inventado"></div><div class="campo"><label for="telefono">Teléfono (opcional)</label><input id="telefono" name="telefono" type="tel" maxlength="24" placeholder="Dejalo vacío en esta prueba"><span class="ayuda">No ingreses datos personales reales. No se enviarán mensajes.</span></div><fieldset><legend>Modalidad</legend><label class="radio"><input type="radio" name="modalidad" value="mensualidad" checked>Mensualidad</label><label class="radio"><input type="radio" name="modalidad" value="suelta">Clase suelta</label></fieldset><div class="banner info"><p>Mensualidad: comienza en la primera clase posterior al pago, no al crear la ficha.</p><p>Clase suelta: se cobra al asistir.</p></div><p class="ayuda">Importes de ejemplo: mensualidad $ 1.800 UYU; clase $ 250 UYU.</p>${boton('Guardar alumno de prueba',`type="submit" ${habilitarGuardado()}`,'p')}</form>`;
 }
 else if(r==='alumno'&&p){
   html=volver()+titulo(p.nombre,p.modalidad==='suelta'?'Modalidad: clase suelta':'Modalidad: mensualidad')+chip(p.estado)+(p.modalidad==='mensualidad'?ciclo(p):`<div class="card"><h2>Clases sueltas</h2><p>${deuda(p)?'1 clase adeudada · 15/11/2026':'No hay clases adeudadas.'}</p></div>`)+(p.programado?`<div class="banner info">Clase suelta desde ${esc(p.programado)}. El ciclo actual sigue cubierto.</div>`:'')+(p.renovacion?`<div class="banner ok"><strong>Renovación ya pagada · demo</strong><p>Inicio ${esc(p.renovacion.inicio)} · vence ${esc(p.renovacion.vence)} · renueva ${esc(p.renovacion.renueva)}</p><p>No se ofrece un segundo cobro anticipado.</p></div>`:'')+`<div class="bloque">${p.modalidad==='mensualidad'&&!p.pagado&&!p.renovacion?boton(['Vigente','Por vencer','Vence hoy'].includes(p.estado)?'Renovar mensualidad':'Cobrar mensualidad',`data-ruta="cobro/${p.id}/mensualidad"`,'p'):''}${deuda(p)?boton('Cobrar clase adeudada',`data-ruta="cobro/${p.id}/suelta"`,'p'):''}${boton('Ver asistencia','data-ruta="asistencia"')}${boton('Avisar por WhatsApp',`data-ruta="whatsapp/${p.id}"`)}${boton('Cambiar modalidad',`data-ruta="modalidad/${p.id}"`)}</div><section class="bloque"><h2>Últimos pagos · demo</h2>${pagos.filter(x=>x.alumno===p.id).length?pagos.filter(x=>x.alumno===p.id).map(x=>boton(`${esc(x.concepto)} · ${pesos(x.monto)}`,`data-ruta="comprobante/${x.id}"`)).join(''):'<p class="ayuda">Todavía no registraste pagos en esta sesión de prueba.</p>'}</section>`;
 }
 else if(r==='asistencia'){
   html=titulo('Asistencia','Danza · 15/11/2026 · 18:00')+`<p class="ayuda">${alumnos.filter(a=>a.presente).length} ${alumnos.filter(a=>a.presente).length===1?'presente':'presentes'} · ${alumnos.filter(a=>a.ausente).length} ${alumnos.filter(a=>a.ausente).length===1?'ausente':'ausentes'} · guardado solo en memoria de prueba</p>`+(escenario==='vacio'?'<div class="card vac"><h2>No hay alumnos para pasar lista</h2><p>Agregá un alumno para continuar.</p>'+boton('Ir a Alumnos','data-ruta="alumnos"')+'</div>':`<div class="lista">${alumnos.map(a=>`<article class="item"><button class="nombre enlace" data-ruta="alumno/${a.id}">${esc(a.nombre)}</button>${chip(a.estado)}<div class="acciones">${boton(a.presente?'✓ Presente':'Presente',`data-presente="${a.id}" aria-label="${a.presente?'Revisar presencia de':'Marcar presente a'} ${esc(a.nombre)}" aria-pressed="${!!a.presente}" ${habilitarGuardado()}`,a.presente?'s seleccionada':'s')}${boton(a.ausente?'✓ Ausente':'Ausente',`data-ausente="${a.id}" aria-label="Marcar ausente a ${esc(a.nombre)}" aria-pressed="${!!a.ausente}" ${habilitarGuardado()}`)}</div>${a.presente?`<p class="ayuda">Asistencia simulada registrada${deuda(a)?' · clase adeudada':''}${a.clasePagada?' · clase pagada':''}</p>${deuda(a)?boton('Cobrar clase $ 250 UYU',`data-ruta="cobro/${a.id}/suelta"`):''}`:''}</article>`).join('')}</div>`)+boton('Cancelar clase (política pendiente)','data-politica="Q2"','t');
 }
 else if(r==='pago'){
   html=volver('hoy')+titulo('Registrar pago','Elegí a quién cobrar. Operación de prueba.')+`<div class="lista">${alumnos.map(a=>`<article class="item"><strong>${esc(a.nombre)}</strong>${a.modalidad==='mensualidad'?a.renovacion||a.pagado?'<p class="ayuda">Ya tiene un pago programado.</p>':boton('Mensualidad',`data-ruta="cobro/${a.id}/mensualidad"`):deuda(a)?boton('Clase suelta · 15/11',`data-ruta="cobro/${a.id}/suelta"`):'<p class="ayuda">La clase suelta se cobra al marcar presente.</p>'}${boton('Ver ficha',`data-ruta="alumno/${a.id}"`,'t')}</article>`).join('')}</div>`;
 }
 else if(r==='cobro'&&p){
   const suelta=tipo==='suelta';const invalido=(suelta&&(!p.presente||p.clasePagada))||(!suelta&&(p.renovacion||p.pagado));
   html=volver('alumno/'+p.id)+titulo(suelta?'Cobrar clase suelta':'Cobrar mensualidad',p.nombre);
   if(invalido) html+='<div class="banner info">Este concepto no está disponible para cobrar de nuevo. Revisá la ficha.</div>'+boton('Ver ficha',`data-ruta="alumno/${p.id}"`,'p');
   else html+=`<form id="cobro-form" data-alumno="${p.id}" data-tipo="${suelta?'suelta':'mensualidad'}"><div class="banner info">Simulación: se registra un pago manual de prueba, no se procesa dinero.</div><div class="campo"><label for="monto">Monto total · UYU *</label><input id="monto" name="monto" inputmode="numeric" value="${suelta?250:1800}" required aria-describedby="ayuda-monto"><span class="ayuda" id="ayuda-monto">Tarifa ficticia: ${pesos(suelta?250:1800)}. Enteros, sin pagos parciales.</span></div><div class="campo" id="motivo-campo" hidden><label for="motivo">Motivo del cambio de monto *</label><input id="motivo" name="motivo" maxlength="120"></div><div class="campo"><label for="medio">Medio de pago *</label><select id="medio" name="medio" required><option value="">Elegí un medio</option><option>Efectivo</option><option>Transferencia</option><option>Otro</option></select></div><div class="dato"><span>Fecha de pago · fija en demo</span><strong>15/11/2026</strong></div>${suelta?'<div class="ciclo"><p class="tit">Concepto de prueba</p><p>Clase suelta · 15/11/2026</p></div>':vistaCobro(p)}<p id="error-cobro" class="error-campo" role="alert"></p>${boton('Confirmar registro de prueba',`type="submit" id="confirmar" ${habilitarGuardado()}`,'p')}<p class="ayuda">Solo cambia esta demo. No es un comprobante real.</p></form>`;
 }
 else if(r==='comprobante'){
   const pago=pagos.find(x=>x.id===id);html=titulo('Registro simulado','Sin valor como comprobante de pago real.');
   if(!pago) html+='<p>No hay un pago confirmado en esta sesión para ese registro.</p>'+boton('Ir a Cobros','data-ruta="cobros"','p');
   else html+=`<div class="card"><span class="resultado" aria-hidden="true">✓</span><h2>Pago de prueba registrado</h2><p>${esc(persona(pago.alumno).nombre)} · ${esc(pago.concepto)}</p><p class="monto">${pesos(pago.monto)}</p><div class="dato"><span>Medio</span><strong>${esc(pago.medio)}</strong></div><div class="dato"><span>Fecha</span><strong>15/11/2026</strong></div><p class="ayuda">Registrado por Dueña A (ficticia).</p>${pago.ciclo?ciclo(pago.ciclo):'<p>Clase suelta del 15/11/2026.</p>'}${pago.anulado?'<div class="banner err">Anulación simulada · original conservado. Motivo: '+esc(pago.motivoAnulacion)+'</div>':''}</div>${boton('Ver ficha',`data-ruta="alumno/${pago.alumno}"`,'p')}${boton('Volver a la lista','data-ruta="asistencia"')}${!pago.anulado?boton('Sobre anulaciones',`data-anular="${pago.id}"`,'t'):''}`;
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
   html=volver('alumno/'+p.id)+titulo('Avisar por WhatsApp',p.nombre);
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
   html=titulo('Más','Límites del prototipo')+'<div class="card"><h2>Tarifas de ejemplo</h2><p>Mensualidad $ 1.800 UYU<br>Clase suelta $ 250 UYU</p><p class="ayuda">No son precios de la clienta. Configuración de tarifas, horario, reportes y cuentas no son recorridos implementados en esta demo.</p></div><div class="card"><h2>Políticas todavía pendientes</h2>'+boton('Q2 · Correcciones y cancelación','data-politica="Q2"')+boton('Q3 · Terminar mensualidad hoy','data-politica="Q3"')+'</div>'+boton('Ver controles de prueba','data-pruebas');
 }
 else html=titulo('No encontramos esa pantalla')+boton('Volver a Hoy','data-ruta="hoy"','p');
 if(escenario==='offline')html='<div class="banner off" id="sin-red" role="status"><strong>Sin conexión · simulado</strong><p>Datos de prueba del 15/11, 18:00. Necesitás internet para guardar. No se encolan cambios.</p>'+boton('Restablecer conexión simulada','data-recuperar')+'</div>'+html;
 if(escenario==='vacio'&&['alta','cobro','alumno','whatsapp','comprobante','modalidad'].includes(r))html='<div class="banner info">Para revisar formularios sin datos, usá Nuevo alumno. Los registros existentes no se borran al cambiar este control.</div>'+html;
 $('#contenido').innerHTML=html+'<p class="pie-demo">Prototipo de diseño ENC-06 · sin backend ni guardado real. Recargar borra esta sesión.</p>';
 ultimaRuta=location.hash||'#hoy';restaurarBorrador();
 $('#contenido').focus({preventScroll:true});window.scrollTo(0,0);anunciar(escenario==='cargando'?'Cargando pantalla de prueba':($('#contenido h1')?.textContent||'Pantalla actualizada'));
}
function listaBusqueda(xs){return xs.length?`<div class="lista">${xs.map(p=>fila(p)).join('')}</div>`:`<div class="card vac"><p>No encontramos alumnos para “${esc(busqueda)}”.</p>${boton('Borrar búsqueda','data-limpiar')}</div>`;}
function vistaCobro(p){if(['Vigente','Por vencer','Vence hoy'].includes(p.estado))return '<div class="ciclo"><p class="tit">Renovación continua · fixture</p><p>El ciclo actual no cambia.</p><div class="kk">Nuevo inicio <b>'+esc(p.renueva)+'</b></div><div class="kk">Último día cubierto <b>'+esc(p.id==='ana'?'17/12/2026':p.id==='rosa'?'15/12/2026':'31/12/2026')+'</b></div><div class="kk">Próxima renovación <b>'+esc(p.id==='ana'?'18/12/2026':p.id==='rosa'?'16/12/2026':'01/01/2027')+'</b></div></div>';if(p.presente)return '<div class="ciclo"><p class="tit">Ya está asistiendo hoy · fixture</p><p>Inicio: 15/11/2026</p><p>Último día cubierto: 14/12/2026</p><p>Próxima renovación: 15/12/2026</p></div>';return '<div class="ciclo"><p class="tit">Después del pago</p><p>Pagada, sin iniciar.</p><p>Inicio: pendiente de primera clase.</p><p>Vencimiento y renovación: pendientes de inicio.</p></div>';}
async function pausa(){return new Promise(r=>setTimeout(r,550));}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.hasAttribute('data-cerrar'))return $('#dialogo').close();
 if(b.dataset.ruta)return ir(b.dataset.ruta);
 if(b.dataset.filtro){filtro=b.dataset.filtro;return ir('cobros');}
 if(b.hasAttribute('data-recuperar')){escenario='normal';$('#escenario').value='normal';return render();}
 if(b.hasAttribute('data-politica'))return bloqueo(b.dataset.politica);
 if(b.hasAttribute('data-pruebas'))return $('#abrir-pruebas').click();
 if(b.hasAttribute('data-limpiar')){busqueda='';return render();}
 if(b.dataset.presente){
   if(escenario==='offline'||pendiente)return;
   const p=persona(b.dataset.presente);if(p.presente)return p.clasePagada||p.inicioPorAsistencia?bloqueo('Q2'):modal('Asistencia ya registrada','<p>No se duplica al tocar de nuevo. Para una corrección cobrada, Q2 sigue pendiente.</p>');
   pendiente=true;b.disabled=true;b.textContent='Guardando…';await pausa();pendiente=false;if(escenario==='offline')return render();p.presente=true;p.ausente=false;if(p.modalidad==='suelta')p.claseAdeudada=true;
   if(p.pagado && p.estado==='Pagada, sin iniciar'){p.estado='Vigente';p.inicio='15/11/2026';p.vence='14/12/2026';p.renueva='15/12/2026';p.inicioPorAsistencia=true;}
   render();
   if(deuda(p))modal('Presencia registrada · demo',`<p>${esc(p.nombre)} · clase suelta del 15/11.</p><p>Si no cobrás ahora, queda clase adeudada en esta demo.</p>${boton('Cobrar clase $ 250 UYU',`data-cobrar-desde-dialogo="${p.id}"`,'p')}`);
   else if(['Vencida','Sin mensualidad'].includes(p.estado))modal('No tiene mensualidad vigente',`<p>La asistencia no se bloquea.</p>${boton('Cobrar mensualidad',`data-cobrar-desde-dialogo="${p.id}" data-concepto="mensualidad"`,'p')}${boton('Cobrar clase suelta',`data-cobrar-desde-dialogo="${p.id}" data-concepto="suelta"`)}`);
   return;
 }
 if(b.dataset.cobrarDesdeDialogo){$('#dialogo').close();return ir('cobro/'+b.dataset.cobrarDesdeDialogo+'/'+(b.dataset.concepto||'suelta'));}
 if(b.dataset.ausente){if(escenario==='offline')return;const p=persona(b.dataset.ausente);if(p.presente)return bloqueo('Q2');p.ausente=true;return render();}
 if(b.dataset.programar){if(escenario==='offline')return;const p=persona(b.dataset.programar);p.programado=(p.renovacion||p).renueva;ir('alumno/'+p.id);anunciar('Cambio de prueba programado');return;}
 if(b.dataset.anular)return modal('Anulaciones fuera de este recorrido','<p>En el producto, se registra una anulación con motivo, fecha y usuario; nunca se edita ni se borra el pago original. Una mensualidad anulada deja el ciclo sin efecto.</p><p>Esta demo no ejecuta anulaciones ni resuelve Q2/Q3. No se modificó este registro.</p>');
});
document.addEventListener('submit',async e=>{
 const f=e.target;if(!['alta-form','cobro-form','whatsapp-form'].includes(f.id))return;e.preventDefault();
 if(f.id==='whatsapp-form'){if(!$('#mensaje').value.trim())return;return modal('Apertura simulada, no envío','<p>En la app real se abriría WhatsApp con el texto que editaste. Vos decidís si lo enviás.</p><p>Esta demo no abre un contacto, no guarda un aviso y no afirma entrega.</p>');}
 if(escenario==='offline'||pendiente)return;
 if(f.id==='alta-form'){
   const fd=new FormData(f);const nombre=String(fd.get('nombre')).trim();if(!nombre)return $('#nombre').setCustomValidity('Ingresá un nombre ficticio.');
   f.dataset.enviado='true';delete borradores[location.hash];const id='nuevo'+siguiente++;alumnos.push({id,nombre,modalidad:fd.get('modalidad'),estado:fd.get('modalidad')==='suelta'?'Clase suelta':'Sin mensualidad',presente:false,telefono:!!String(fd.get('telefono')).trim()});ir('alumno/'+id);return;
 }
 if(f.id==='cobro-form'){
   const p=persona(f.dataset.alumno),suelta=f.dataset.tipo==='suelta',fd=new FormData(f),raw=String(fd.get('monto')).trim(),monto=Number(raw),motivo=String(fd.get('motivo')||'').trim();
   if(!/^\d+$/.test(raw)||!Number.isSafeInteger(monto)||monto<=0){$('#error-cobro').textContent='En este fixture usá un importe entero mayor que cero. Becas totales no se prueban acá.';$('#monto').focus();return;}
   if(monto!==(suelta?250:1800)&&!motivo){$('#error-cobro').textContent='Indicá el motivo del cambio de monto.';$('#motivo').focus();return;}
   pendiente=true;$('#confirmar').disabled=true;$('#confirmar').textContent='Registrando en la demo…';await pausa();pendiente=false;if(escenario==='offline')return render();
   const estadoPrevio=p.estado;const id='pago'+siguiente++;const x={id,alumno:p.id,concepto:suelta?'Clase suelta':'Mensualidad',monto,medio:fd.get('medio'),motivo,estadoPrevio,modalidadPrevia:p.modalidad};
   if(suelta)p.clasePagada=true;
   else if(['Vigente','Por vencer','Vence hoy'].includes(p.estado)){p.renovacion={inicio:p.renueva,vence:p.id==='ana'?'17/12/2026':p.id==='rosa'?'15/12/2026':'31/12/2026',renueva:p.id==='ana'?'18/12/2026':p.id==='rosa'?'16/12/2026':'01/01/2027'};x.ciclo={...p.renovacion,estado:'Vigente'};}
   else{p.modalidad='mensualidad';p.pagado=true;p.estado=p.presente?'Vigente':'Pagada, sin iniciar';p.inicio=p.presente?'15/11/2026':null;p.vence=p.presente?'14/12/2026':null;p.renueva=p.presente?'15/12/2026':null;p.inicioPorAsistencia=!!p.presente;x.ciclo={estado:p.estado,inicio:p.inicio,vence:p.vence,renueva:p.renueva};}
   f.dataset.enviado='true';delete borradores[location.hash];pagos.push(x);ir('comprobante/'+id);return;
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='nombre')e.target.setCustomValidity('');
 if(e.target.id==='buscar'){busqueda=e.target.value;$('#resultados').innerHTML=listaBusqueda(alumnos.filter(a=>a.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase())));}
 if(e.target.id==='monto'){const mod=Number(e.target.value)!==($('#cobro-form').dataset.tipo==='suelta'?250:1800);$('#motivo-campo').hidden=!mod;$('#motivo').required=mod;}
});
$('#abrir-pruebas').addEventListener('click',()=>{const abierto=$('#pruebas').hidden;$('#pruebas').hidden=!abierto;$('#abrir-pruebas').setAttribute('aria-expanded',String(abierto));});
$('#escenario').addEventListener('change',e=>{escenario=e.target.value;render();});
$('#tema').addEventListener('click',()=>{const oscuro=document.documentElement.dataset.tema!=='oscuro';document.documentElement.dataset.tema=oscuro?'oscuro':'claro';$('#tema').textContent=oscuro?'Usar tema claro':'Usar tema oscuro';});
$('#reiniciar').addEventListener('click',()=>{borradores={};ultimaRuta='';inicializar();escenario='normal';$('#escenario').value='normal';$('#dialogo').close();ir('hoy');render();anunciar('Demo reiniciada');});
window.addEventListener('hashchange',render);
render();
