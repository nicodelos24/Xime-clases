async activa=>{
 const page=activa.context().pages().find(p=>p.url().includes(':8783/'));if(!page)throw Error('Falta pestaña ENC-08R');
 const checks=[],contrastes=[];const ok=(c,n)=>{if(!c)throw Error(n);checks.push(n);};
 const btn=n=>page.getByRole('button',{name:n,exact:true});
 await page.goto('http://127.0.0.1:8783/ux/prototipo/index.html?accesibilidad#agenda/mes/2026-11-15');await page.getByRole('heading',{name:'Agenda',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'Agenda',exact:true}).waitFor();
 for(const tema of ['claro','oscuro']){
  await page.evaluate(t=>document.documentElement.dataset.tema=t,tema);await page.setViewportSize({width:390,height:844});
  const pares=await page.evaluate(()=>{
   function rgb(v){return v.match(/[\d.]+/g).slice(0,3).map(Number);}
   function lum(v){const c=rgb(v).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
   function fondo(e){let x=e;while(x){const f=getComputedStyle(x).backgroundColor;if(!['rgba(0, 0, 0, 0)','transparent'].includes(f))return f;x=x.parentElement;}return 'rgb(255,255,255)';}
   return ['h1','.ayuda','.btn.p','.fecha-seleccionada','.navegacion [aria-current]','.aviso-sesion'].map(s=>{const e=document.querySelector(s),t=getComputedStyle(e).color,f=fondo(e),l=[lum(t),lum(f)].sort((a,b)=>b-a);return {selector:s,texto:t,fondo:f,ratio:(l[0]+.05)/(l[1]+.05)};});
  });
  contrastes.push({tema,pares});ok(pares.every(p=>p.ratio>=4.5),'AA-01: texto crítico/selección/nav/ayuda '+tema+' >=4.5:1');
  for(const ancho of [320,360,390]){
   await page.setViewportSize({width:ancho,height:780});await page.waitForTimeout(80);
   const objetivos=await page.locator('button,summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({nombre:e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(e=>e.w<43.9||e.h<43.9));
   ok(objetivos.length===0,`AA-02: objetivos >=44 px ${ancho}/${tema}`);
   await btn('Pruebas').click();await btn('Texto ampliado 200 %').click();await btn('Pruebas').click();await page.waitForTimeout(80);
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`AA-03: texto ampliado 200 sin overflow ${ancho}/${tema}`);
   await btn('Pruebas').click();await btn('Texto ampliado 200 %').click();await btn('Pruebas').click();
  }
 }
 ok(await page.locator('svg.icono:not([aria-hidden="true"])').count()===0,'AA-04: SVG decorativo no duplica nombre');
 await page.setViewportSize({width:360,height:780});await page.locator('main').getByRole('button',{name:'Ver horario'}).scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(80);
 ok(await page.evaluate(()=>{const b=document.querySelector('[data-ver-horario]').getBoundingClientRect(),n=document.querySelector('nav').getBoundingClientRect();return b.bottom<=n.top;}),'AA-05: última acción fuera de barra fija al final');
 await page.evaluate(()=>location.hash='agenda/mes/2026-02-30');await page.getByRole('heading',{name:'No encontramos esa fecha o vista'}).waitFor();await btn('Volver a Agenda').click();
 ok(await page.locator('h1').innerText()==='Agenda','AA-06: fecha inválida recuperable');
 await page.evaluate(()=>location.hash='%E0%A4%A');await page.getByRole('heading',{name:'No encontramos esa pantalla'}).waitFor();await btn('Volver a Hoy').click();ok(await page.locator('h1').innerText()==='Hoy','AA-07: hash mal codificado no rompe JS');
 return {fecha:new Date().toISOString(),resultado:'PASS',cantidad:checks.length,checks,contrastes,limites:'Contraste de pares concretos calculado sobre CSS renderizado; no auditoría completa de WCAG, lector, dispositivo físico ni texto nativo del sistema.'};
}
