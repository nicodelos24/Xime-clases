/* Interacción compartida: «Dada» marca/desmarca, ring y confeti. Festejo sobrio: 700 ms, 16 partículas, solo transform/opacity. */
window.listoInteraccion = function(colorConfeti){
  document.querySelectorAll('.dada').forEach(function(btn){
    btn.addEventListener('click',function(){
      var marcada = btn.classList.toggle('marcada');
      btn.setAttribute('aria-pressed', marcada ? 'true' : 'false');
      btn.setAttribute('aria-label', marcada ? 'Clase marcada como dada. Tocá para desmarcar' : 'Marcar la clase como dada');
      if (marcada && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
        festejo(btn.closest('.fila'), colorConfeti);
      }
      actualizarHero();
    });
  });
};

function actualizarHero(){
  var marcadas = document.querySelectorAll('.dada.marcada').length;
  var total = document.querySelectorAll('.dada').length;
  if (!total) return;
  var c = 2 * Math.PI * 35.5;
  var ring = document.querySelector('.ring-valor');
  if (ring){
    ring.style.transition = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'none' : 'stroke-dashoffset 240ms cubic-bezier(.22,1,.36,1)';
    ring.style.strokeDashoffset = (c * (1 - marcadas / total)).toFixed(1);
  }
  var b = document.querySelector('.ring-nro b');
  if (b) b.textContent = marcadas;
  var r = document.querySelector('.ring');
  if (r) r.setAttribute('aria-label', marcadas + ' de ' + total + ' clases dadas hoy');
}

function festejo(fila, colores){
  if (!fila) return;
  var r = fila.getBoundingClientRect();
  var st = document.createElement('style');
  st.textContent = '@keyframes confetiCae{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),calc(var(--dy) + 18px)) rotate(var(--r));opacity:0}}';
  document.head.appendChild(st);
  for (var i = 0; i < 16; i++){
    var p = document.createElement('i');
    var dx = (Math.random() - .5) * 140;
    var dy = -(50 + Math.random() * 50);
    p.style.cssText = 'position:fixed;left:' + (r.left + r.width/2) + 'px;top:' + (r.top + 12) + 'px;width:7px;height:10px;border-radius:2px;pointer-events:none;z-index:60;background:' + colores[i % colores.length] + ';animation:confetiCae 700ms cubic-bezier(.22,1,.36,1) forwards;animation-delay:' + (i % 4) * 35 + 'ms;--dx:' + dx + 'px;--dy:' + dy + 'px;--r:' + ((Math.random()-.5)*300) + 'deg';
    document.body.appendChild(p);
    setTimeout(function(el){ return function(){ el.remove(); }; }(p), 800);
  }
}

window.addEventListener('load',function(){
  setTimeout(function(){
    document.body.classList.add('listo');
    var t = document.querySelector('.tlon'); if (t) t.remove();
  }, 320);
});
