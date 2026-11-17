/* Interacción de prueba compartida por las tres propuestas (C, D, E).
   Tocar «Dada» marca/desmarca, actualiza el ring y tira confeti (700 ms,
   solo transform/opacity; con movimiento reducido no se muestra). */
window.inyectarIconos();

document.querySelectorAll('.dada').forEach(function(btn){
  btn.addEventListener('click',function(){
    var marcada = btn.classList.toggle('marcada');
    btn.setAttribute('aria-pressed', marcada ? 'true' : 'false');
    btn.setAttribute('aria-label', (marcada ? 'Clase marcada como dada. Tocá para desmarcar' : 'Marcar la clase como dada'));
    if (marcada && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) festejo(btn.closest('.fila'));
    actualizarHero();
  });
});

function actualizarHero(){
  var n = document.querySelectorAll('.dada.marcada').length;
  var total = document.querySelectorAll('.dada').length;
  var c = 2 * Math.PI * 35.5;
  var ring = document.querySelector('.ring-valor');
  ring.style.transition = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'none'
    : 'stroke-dashoffset 240ms cubic-bezier(.22,1,.36,1)';
  ring.style.strokeDashoffset = (c * (1 - n / total)).toFixed(1);
  document.querySelector('.ring-nro b').textContent = n;
  document.querySelector('.ring').setAttribute('aria-label', n + ' de ' + total + ' clases dadas hoy');
}

function festejo(fila){
  var r = fila.getBoundingClientRect();
  var esSuave = !!document.querySelector('script[src*="hoy.js"]') && (window.__CONFETI_SUAVE || document.body.classList.contains('confeti-suave'));
  var colores = esSuave ? ['#8B7BB8','#C96B57','#6BA193','#E0A75E','#C17293','#67799B']
                        : ['#7C3AED','#F2543D','#0E8F7E','#F0A202','#D6336C','#2B4A78'];
  var st = document.createElement('style');
  st.textContent = '@keyframes confetiCae{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),calc(var(--dy) + 20px)) rotate(var(--r));opacity:0}}';
  document.head.appendChild(st);
  for (var i = 0; i < 16; i++){
    var p = document.createElement('i');
    var dx = (Math.random() - .5) * 150;
    var dy = -(55 + Math.random() * 55);
    p.style.cssText = 'position:fixed;left:' + (r.left + r.width/2) + 'px;top:' + (r.top + 10) + 'px;width:7px;height:10px;border-radius:2px;pointer-events:none;z-index:60;background:' + colores[i % colores.length] + ';animation:confetiCae 700ms cubic-bezier(.22,1,.36,1) forwards;animation-delay:' + (i % 4) * 35 + 'ms;--dx:' + dx + 'px;--dy:' + dy + 'px;--r:' + ((Math.random()-.5)*320) + 'deg';
    document.body.appendChild(p);
    setTimeout(function(el){ return function(){ el.remove(); }; }(p), 800);
  }
}

window.addEventListener('load',function(){
  setTimeout(function(){ document.body.classList.add('listo'); var t=document.querySelector('.tlon'); if(t) t.remove(); }, 350);
});
