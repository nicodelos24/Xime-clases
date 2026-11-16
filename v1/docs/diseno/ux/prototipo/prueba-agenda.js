async (activa)=>{
  const page=activa.context().pages().find(p=>p.url().includes(':8783/'));
  if(!page)throw Error('Falta la pestaña dedicada ENC-08R');
  const checks=[],errores=[],advertencias=[],red=[],capturas=[];
  const ok=(c,n)=>{if(!c)throw Error(n);checks.push(n);};
  page.on('pageerror',e=>errores.push(e.message));page.on('console',m=>{if(m.type()==='error')errores.push(m.text());if(m.type()==='warning')advertencias.push(m.text());});
  page.on('response',r=>red.push({url:r.url(),status:r.status()}));page.on('requestfailed',r=>errores.push('Red: '+r.url()));
  // Playwright desactiva caché HTTP al enrutar: comprobar candidato actual, no módulo previo.
  await page.route('**/ux/prototipo/**',ruta=>ruta.continue());
  const base='http://127.0.0.1:8783/ux/prototipo/index.html?enc08r';
  const btn=n=>page.getByRole('button',{name:n,exact:true});
  const nav=n=>page.locator('nav').getByRole('button',{name:n,exact:true});
  const dia=s=>page.locator(`[data-dia="${s}"]`);
  const elegir=async s=>{await page.locator(`[data-fecha-agenda="${s}"]:visible`).click();await dia(s).waitFor();};
  const control=async()=>{if(!await page.locator('#pruebas').isVisible())await btn('Pruebas').click();};
  const cerrar=async()=>{if(await page.locator('#pruebas').isVisible())await btn('Pruebas').click();};
  const escenario=async s=>{await control();await page.getByLabel('Estado de pantalla').selectOption(s);await cerrar();};
  const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
  const nombres=()=>page.locator('#resultados .nombre').allTextContents();
  const capturar=async nombre=>{const path='/home/nico/.cache/kaia-mcp-output/'+nombre+'.png';await page.screenshot({path,fullPage:true});capturas.push(path);};
  await page.setViewportSize({width:360,height:780});await page.goto(base+'#hoy');await page.getByRole('heading',{name:'Hoy',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'Hoy',exact:true}).waitFor();
  ok(await page.locator('h1').innerText()==='Hoy'&&await page.locator('nav button').count()===5,'AG-01: Hoy inicial y cinco destinos');
  await nav('Agenda').click();ok(await page.locator('[data-dia]').count()===7&&await nav('Agenda').getAttribute('aria-current')==='page','AG-01: Semana inicial y Agenda activa');
  ok((await dia('2026-11-15').innerText()).includes('18:00–19:00')&&(await dia('2026-11-15').innerText()).includes('Ana Pérez'),'AG-02R: horario y quién viene, no lista escolar');
  await dia('2026-11-15').getByRole('button',{name:'Ver programación'}).first().click();
  ok((await page.locator('main').innerText()).includes('Esto no confirma clase realizada ni pago'),'AG-02R: detalle separado de realización');
  await btn('Volver a Agenda').click();
  ok(await page.evaluate(async()=>!(await import('./programacion.js')).realizada({id:'ana'})),'AG-02R: consultar no marca clase realizada');
  await btn('Semana siguiente').click();ok(page.url().endsWith('/2026-11-22')&&(await page.locator('.rango-agenda').innerText()).includes('16 de noviembre'),'AG-03: semana siguiente conserva domingo seleccionado');
  ok((await dia('2026-11-17').innerText()).includes('Lucía Silva')&&(await dia('2026-11-19').innerText()).includes('Ana Pérez'),'AG-03: individuales salteados y mensual por programación explícita');
  await btn('Mes').click();await elegir('2026-11-17');await dia('2026-11-17').locator('summary').click();
  await dia('2026-11-17').getByRole('button',{name:'Ver ficha',exact:true}).click();
  ok((await page.locator('.ciclo').innerText()).includes('17/11/2026')&&(await page.locator('.ciclo').innerText()).includes('18/11/2026'),'AG-04: vencimiento y renovación distintos');
  await btn('Volver a Agenda').click();
  ok(page.url().endsWith('mes/2026-11-17')&&await dia('2026-11-17').locator('details').getAttribute('open')!==null,'AG-04: vuelve al mes, día y expansión');
  ok(await page.evaluate(()=>document.activeElement?.dataset.agendaSalida==='ciclo-ana-ciclo-0'),'AG-04: foco vuelve al disparador');
  await elegir('2026-11-18');ok((await dia('2026-11-18').innerText()).includes('No hay clases ni vencimientos'),'AG-05: vacío confirmado con salida para agendar');
  ok(await page.locator('.mes-tabla tbody tr').count()===6,'AG-06: noviembre tiene seis filas lunes-domingo');
  await btn('Mes siguiente').click();await btn('Mes siguiente').click();ok((await page.locator('.rango-agenda').innerText()).includes('enero de 2027'),'AG-06: cruce de año');
  await btn('Mes anterior').click();await btn('Mes anterior').click();await elegir('2026-11-17');
  // Ficha antigua vuelve sin duplicación ni cobro.
  await dia('2026-11-17').getByRole('button',{name:'Agendar alumno',exact:true}).click();
  await page.getByLabel('Buscar alumno para agendar').fill('Marcos');await page.getByLabel('Modalidad para agendar').selectOption('mensualidad');
  await page.getByRole('radio',{name:/Marcos Díaz/}).check();await btn('Confirmar programación').click();
  ok((await dia('2026-11-17').innerText()).includes('Marcos Díaz'),'PG-01: alumno antiguo mensual vuelve por misma ficha');
  await elegir('2026-11-19');ok(!(await dia('2026-11-19').innerText()).includes('Marcos Díaz'),'PG-02: no autoagenda recurrencias');
  await elegir('2026-11-17');await dia('2026-11-17').locator('.programado').filter({hasText:'Marcos Díaz'}).getByRole('button').click();
  await btn('Retirar programación').click();await btn('Confirmar retiro de programación').click();
  ok(page.url().endsWith('mes/2026-11-17')&&!(await dia('2026-11-17').innerText()).includes('Marcos Díaz'),'PG-03: retirar solo programación conserva contexto');
  await nav('Alumnos').click();ok(await page.locator('#resultados .item').count()===5,'PG-03: ficha antigua no se duplicó ni borró');
  ok(JSON.stringify(await nombres())===JSON.stringify(['Lucía Silva','Inés Costa','Ana Pérez','Rosa Méndez','Marcos Díaz']),'AL-01: más recientes por alta, mezclando modalidades');
  await page.getByLabel('Modalidad de alumnos').selectOption('suelta');ok((await nombres()).join()==='Lucía Silva','AL-02: filtro por clase individual');
  await page.getByLabel('Modalidad de alumnos').selectOption('mensualidad');ok((await nombres()).length===4,'AL-03: filtro mensuales');
  await page.getByLabel('Modalidad de alumnos').selectOption('todos');await page.getByLabel('Orden de alumnos').selectOption('mensuales');
  ok((await nombres()).at(-1)==='Lucía Silva','AL-04: mensuales primero conserva fecha dentro del grupo');
  await page.getByLabel('Orden de alumnos').selectOption('individuales');ok((await nombres())[0]==='Lucía Silva','AL-05: por clase primero');
  ok(await page.evaluate(async()=>{const {filtrarOrdenar}=await import('./alumnos.js');return filtrarOrdenar([{id:'b',nombre:'B',alta:'2026-01-01',modalidad:'suelta'},{id:'a',nombre:'A',alta:'2026-01-01',modalidad:'suelta'}]).map(p=>p.id).join()==='a,b';}),'AL-06: desempate estable por ID');
  await page.getByLabel('Buscar por nombre').fill('Ana');ok((await nombres()).join()==='Ana Pérez','AL-07: búsqueda combina filtro y orden');
  await page.locator('#resultados .item').filter({hasText:'Ana Pérez'}).getByRole('button',{name:'Ver ficha',exact:true}).click();
  const cicloAna=await page.locator('.ciclo').innerText();await btn('Registrar clase realizada').click();await btn('Registrar que no vino Ana Pérez').click();await page.locator('button.nombre').filter({hasText:'Ana Pérez'}).click();
  ok(await page.locator('.ciclo').innerText()===cicloAna&&await btn('Cobrar clase adeudada').count()===0,'PG-09: mensual que falta no prorroga ni genera extra');
  await nav('Agenda').click();await elegir('2026-11-19');await dia('2026-11-19').getByRole('button',{name:'Agendar alumno',exact:true}).click();
  await page.getByLabel('Buscar alumno para agendar').fill('Lucía');await page.getByLabel('Modalidad para agendar').selectOption('suelta');await page.getByRole('radio',{name:/Lucía Silva/}).check();await btn('Confirmar programación').click();
  ok((await dia('2026-11-19').innerText()).includes('Lucía Silva'),'PG-04: individual en otro día salteado, misma ficha');
  // Segundo intento exacto rechazado, sin borrar la reserva previa.
  await dia('2026-11-19').getByRole('button',{name:'Agendar alumno',exact:true}).click();await page.getByRole('radio',{name:/Lucía Silva/}).check();await btn('Confirmar programación').click();
  ok((await page.locator('#error-agendar').innerText()).includes('ya está agendado'),'PG-05: doble programación no duplica');await btn('Volver a Agenda').click();
  await elegir('2026-11-18');await dia('2026-11-18').getByRole('button',{name:'Agendar alumno',exact:true}).click();await btn('Crear ficha nueva').click();
  await page.getByLabel('Nombre y apellido').fill('Vera Demo');await btn('Guardar alumno de prueba').click();
  ok(await page.locator('h1').innerText()==='Agendar alumno'&&await page.getByRole('radio',{name:/Vera Demo/}).count()===1,'PG-06: alta desde día vuelve a selector con misma ficha');
  await page.getByLabel('Hora de esta clase').fill('19:30');await page.getByRole('radio',{name:/Vera Demo/}).check();await btn('Confirmar programación').click();
  ok(page.url().endsWith('mes/2026-11-18')&&(await dia('2026-11-18').innerText()).includes('19:30'),'PG-07: día nuevo pide hora explícita, solo ese día');
  await dia('2026-11-18').getByRole('button',{name:'Ver programación'}).click();await btn('Ver ficha').click();
  ok(await page.locator('.chip.sin-mens').count()===1&&await btn('Cobrar clase adeudada').count()===0,'PG-08: agendar no inicia mensualidad ni genera deuda');
  await btn('Cobrar mensualidad').click();await page.getByLabel('Medio de pago').selectOption('Efectivo');await btn('Confirmar registro de prueba').click();await page.getByRole('heading',{name:'Pago de prueba registrado'}).waitFor();await btn('Ver ficha').click();
  ok(await page.locator('.chip.sin-iniciar').count()===1,'AG-09: mensualidad pagada sin clase efectiva queda sin iniciar');
  await btn('Volver a Agenda').click();ok(!(await dia('2026-11-18').locator('.vencimientos-dia').allTextContents()).join('').includes('Vera'),'AG-09: no inventa vencimiento por programación');
  await escenario('error-vencimientos');ok(await page.getByText('No pudimos cargar los vencimientos',{exact:true}).count()===1&&(await dia('2026-11-18').innerText()).includes('Vera Demo'),'AG-10: falla vencimientos y mantiene programación sana');await btn('Reintentar vencimientos').click();
  await escenario('error-clases');ok((await dia('2026-11-18').innerText()).includes('Clases: sin datos')&&await btn('Reintentar clases').count()===1,'AG-10: error de clases no informa cero');await btn('Reintentar clases').click();
  await escenario('cargando');ok((await page.locator('main').innerText()).includes('Cargando clases…')&&(await page.locator('main').innerText()).includes('Cargando vencimientos…'),'AG-11: carga por secciones explícita');await btn('Finalizar carga simulada').click();
  await escenario('vacio');ok((await page.locator('main').innerText()).includes('No hay clases programadas este mes.')&&(await page.locator('main').innerText()).includes('Esto no significa que no haya deuda'),'AG-11: vacío no afirma todos pagos');await escenario('normal');
  await escenario('offline');ok(await dia('2026-11-18').getByRole('button',{name:'Agendar alumno'}).isDisabled(),'AG-11: sin conexión impide programar');await btn('Restablecer conexión simulada').click();
  await elegir('2026-11-14');await dia('2026-11-14').locator('summary').click();ok((await dia('2026-11-14').innerText()).includes('Venció el 14/11/2026'),'AG-12: vencimiento histórico no deuda repetida');
  await elegir('2026-11-30');await dia('2026-11-30').locator('summary').click();ok((await dia('2026-11-30').innerText()).includes('Inés Costa'),'AG-12: evento fuera de próximos siete días');
  await escenario('cancelada');await elegir('2026-11-15');ok((await dia('2026-11-15').innerText()).includes('Cancelada por el instituto')&&await dia('2026-11-15').locator('.clase-agenda').filter({hasText:'Cancelada por el instituto'}).locator('button').count()===0,'AG-08: cancelada sin nuevas reservas/cobros');await escenario('normal');
  await page.evaluate(()=>location.hash='asistencia/demo-clase-2026-11-17-1800');await page.getByRole('heading',{name:'Clase realizada',exact:true}).waitFor();ok(await page.locator('[data-presente]').count()===0,'AG-07/08: futura no usa los hechos de hoy ni registra clase');
  await nav('Agenda').click();await btn('Ver horario').click();ok((await page.getByRole('dialog').innerText()).includes('no disponible'),'AG-14: horario sin edición ni guardado falso');await btn('Entendido').click();
  await nav('Más').click();await btn('Horario y clases').click();ok(await page.locator('h1').innerText()==='Agenda','AG-14: Más conserva acceso a Agenda');
  // Reflow real del layout; no teléfono físico ni escala nativa del sistema.
  const matriz=[];
  for(const ancho of [320,360,390])for(const tema of ['claro','oscuro']){
    await page.setViewportSize({width:ancho,height:780});await page.evaluate(t=>document.documentElement.dataset.tema=t,tema);
    for(const ruta of ['agenda/mes/2026-11-15','agenda/semana/2026-11-15','alumnos','agendar/2026-11-18','whatsapp/ana','asistencia']){
      await page.evaluate(r=>location.hash=r,ruta);await page.waitForTimeout(80);ok(await noOverflow(),`AG-13: ${ancho}/${tema}/${ruta} sin overflow`);matriz.push({ancho,tema,ruta});
    }
    if(ancho===360){await page.evaluate(()=>location.hash='agenda/mes/2026-11-15');await page.waitForTimeout(100);await capturar('enc08r-mes-360-'+tema);}
  }
  await page.setViewportSize({width:360,height:780});await page.evaluate(()=>{document.documentElement.dataset.tema='claro';location.hash='agenda/mes/2026-11-17';});await page.waitForTimeout(100);
  await btn('Mes').focus();await page.keyboard.press('Tab');ok(await page.evaluate(()=>document.activeElement?.dataset.moverAgenda==='-1'),'AG-13: teclado llega a control de rango en orden');
  await page.locator('[data-fecha-agenda="2026-11-18"]:visible').focus();await page.keyboard.press('Enter');ok(await dia('2026-11-18').count()===1,'AG-13: fecha seleccionable por teclado');
  await control();await btn('Texto ampliado 200 %').click();await cerrar();ok(await page.locator('.mes-lineal').isVisible()&&await noOverflow(),'AG-13: texto ampliado cambia a lista sin overflow');await capturar('enc08r-texto200-360');
  await control();await btn('Texto ampliado 200 %').click();await cerrar();
  await page.emulateMedia({reducedMotion:'reduce'});ok(await page.locator('.intro').evaluate(e=>getComputedStyle(e).animationName)==='none','MV-01: reduced-motion desactiva animación');await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});await nav('Alumnos').click();await page.getByLabel('Buscar por nombre').fill('');await page.getByLabel('Orden de alumnos').selectOption('recientes');await capturar('enc08r-alumnos-390');
  ok(await page.locator('#resultados .item').count()===6&&(await nombres())[0]==='Vera Demo','AL-08: alta más reciente primero y ficha duradera única');
  await page.setViewportSize({width:320,height:780});await nav('Agenda').click();await elegir('2026-11-19');await capturar('enc08r-agenda-320-lineal');
  const malas=red.filter(r=>r.status>=400);ok(malas.length===0&&errores.length===0,'AG-15: cero errores JS/red HTTP');
  const externas=red.filter(r=>!r.url.startsWith('http://127.0.0.1:8783/'));ok(externas.length===0,'PR-01: sin solicitudes externas ni WhatsApp real');
  return {fecha:new Date().toISOString(),resultado:'PASS',cantidad:checks.length,checks,errores,advertencias,peticiones:red.length,fallosHTTP:malas,externas,matriz,capturas,limites:'Chrome real MCP; fixtures de sesión. No usuaria, BD, teléfono físico, lector de pantalla ni producción. Regresión ENC-06 en callback separado.'};
}
