// Clases v4 · app.js — demo de Fase 1: Hoy + Agenda (mes ⇄ semana). Datos ficticios.
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var I = window.ico;
  var DOW = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'];
  var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var HOY = new Date(2026, 10, 17);

  // Clases de la demo, por día de noviembre. hora decimal (18.5 = 18:30).
  var CLASES = {
    16: [{ h: 16, n: 'Bruno S.', i: 'B', m: 'mensual' }, { h: 16, n: 'Carla T.', i: 'C', m: 'mensual' }, { h: 18.5, n: 'Diego V.', i: 'D', m: 'individual' }],
    17: [{ h: 15, n: 'Martina B.', i: 'MB', m: 'mensual', min: 60 }, { h: 16.25, n: 'Juan S.', i: 'JS', m: 'individual', min: 90 }, { h: 17.5, n: 'María P.', i: 'MP', m: 'mensual', min: 45 }],
    18: [{ h: 17, n: 'Ana L.', i: 'A', m: 'individual' }],
    19: [{ h: 16, n: 'Bruno S.', i: 'B', m: 'mensual' }],
    22: [{ h: 15, n: 'Carla T.', i: 'C', m: 'mensual' }],
    24: [{ h: 16, n: 'Sofía R.', i: 'S', m: 'mensual' }]
  };
  function clasesDe(d) { return d.getFullYear() === 2026 && d.getMonth() === 10 ? (CLASES[d.getDate()] || []) : []; }
  function hh(h) { var e = Math.floor(h), m = Math.round((h - e) * 60); return (e < 10 ? '0' : '') + e + ':' + (m < 10 ? '0' : '') + m; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mismoDia(a, b) { return a.toDateString() === b.toDateString(); }
  function lunes(d) { var x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function mas(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  // ---------- Hoy ----------
  var hechas = [true, false, false];
  var hoyL = CLASES[17];

  function pintarHoy() {
    $('#hoy-lista').innerHTML = hoyL.map(function (c, i) {
      var cls = c.m === 'mensual' ? 'fila-mensual' : 'fila-individual';
      return '<article class="fila aparece ' + cls + '" style="--d:' + (240 + i * 90) + 'ms">' +
        '<span class="hora">' + hh(c.h) + '</span><span class="avatar" aria-hidden="true">' + c.i + '</span>' +
        '<div class="fila-info"><p class="fila-nombre">' + c.n + '</p><p class="fila-meta"><span class="mod">' +
        I(c.m, 9, 'rel') + cap(c.m) + '</span><small>' + c.min + ' min</small></p></div>' +
        '<button class="dada' + (hechas[i] ? ' tocada' : '') + '" type="button" data-i="' + i + '" aria-pressed="' + hechas[i] + '">' +
        I('check', 15) + '<span>Dada</span></button></article>';
    }).join('');
    document.querySelectorAll('.dada').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i;
        if (hechas[i]) { hechas[i] = false; b.classList.remove('tocada'); b.setAttribute('aria-pressed', 'false'); }
        else { hechas[i] = true; b.classList.add('tocada'); b.setAttribute('aria-pressed', 'true'); festejar(b); }
        actualizarHero();
      });
    });
    actualizarHero();
  }

  function actualizarHero() {
    var n = hechas.filter(Boolean).length, tot = hechas.length;
    $('#ring-valor').style.strokeDashoffset = String(223 * (1 - n / tot));
    $('#ring-nro').textContent = n + '/' + tot;
    var sig = hoyL.filter(function (c, i) { return !hechas[i]; })[0];
    $('#hero-titulo').textContent = n === tot ? 'Día completo' : (tot - n) + (tot - n === 1 ? ' clase por dar' : ' clases por dar');
    $('#hero-linea').textContent = sig ? tot + ' clases hoy · ' + n + ' dada' + (n === 1 ? '' : 's') : 'Todas las clases del día están dadas';
    $('#hero-prox').hidden = !sig;
    if (sig) { $('#prox-hora').textContent = hh(sig.h); $('#prox-det').textContent = sig.n + ' · ' + cap(sig.m); }
    $('.ring').classList.toggle('completo', n === tot);
  }

  // Micro-festejo: 6 puntos pastel brotan del botón (320 ms). Con movimiento reducido no se crea.
  function festejar(btn) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var r = btn.getBoundingClientRect(), f = document.createElement('span');
    f.className = 'festejo';
    f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + r.height / 2 + 'px';
    var cs = ['--tq-500', '--lila', '--ambar-pastel', '--verde-pastel', '--rosa-pastel', '--tq-300'];
    cs.forEach(function (c, k) {
      var p = document.createElement('i'), a = (Math.PI * 2 * k) / cs.length - Math.PI / 2;
      p.style.setProperty('--x', Math.cos(a) * 30 + 'px'); p.style.setProperty('--y', Math.sin(a) * 30 + 'px');
      p.style.background = 'var(' + c + ')'; f.appendChild(p);
    });
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 420);
  }

  // ---------- Agenda ----------
  var mesVisto = new Date(2026, 10, 1), diaSel = new Date(HOY), vista = 'mes';

  function marcas(d) {
    var ms = {}; clasesDe(d).forEach(function (c) { ms[c.m] = 1; });
    return (ms.mensual ? '<svg width="7" height="7" aria-hidden="true"><circle cx="3.5" cy="3.5" r="3.5" fill="var(--lila)"/></svg>' : '') +
      (ms.individual ? '<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M4 0 8 4 4 8 0 4Z" fill="var(--azul)"/></svg>' : '');
  }

  function pintarMes() {
    $('#mes-nombre').textContent = MESES[mesVisto.getMonth()] + ' ' + mesVisto.getFullYear();
    var html = DOW.map(function (d) { return '<span class="mes-dow">' + d + '</span>'; }).join('');
    var vacias = (new Date(mesVisto.getFullYear(), mesVisto.getMonth(), 1).getDay() + 6) % 7;
    for (var v = 0; v < vacias; v++) html += '<span></span>';
    var n = new Date(mesVisto.getFullYear(), mesVisto.getMonth() + 1, 0).getDate();
    for (var k = 1; k <= n; k++) {
      var d = new Date(mesVisto.getFullYear(), mesVisto.getMonth(), k);
      html += '<button class="mes-dia' + (mismoDia(d, HOY) ? ' hoy' : '') + (mismoDia(d, diaSel) ? ' sel' : '') + '" type="button" data-t="' + d.getTime() + '" aria-label="' + k + ' de ' + MESES[d.getMonth()].toLowerCase() + '"><b>' + k + '</b><span class="mes-marca" aria-hidden="true">' + marcas(d) + '</span></button>';
    }
    $('#mes-rejilla').innerHTML = html;
  }

  function pintarSemana() {
    var l = lunes(diaSel), dias = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return mas(l, i); });
    $('#sem-titulo').textContent = DIAS[diaSel.getDay()] + ' ' + diaSel.getDate() + ' De ' + MESES[diaSel.getMonth()] + ' De ' + diaSel.getFullYear();
    $('#sem-tira').innerHTML = '<button class="sem-flecha" type="button" data-s="-7" aria-label="Semana anterior">' + I('izq', 18) + '</button>' +
      dias.map(function (d, i) {
        return '<button class="sem-dia' + (mismoDia(d, diaSel) ? ' sel' : '') + '" type="button" data-t="' + d.getTime() + '"><small>' + DOW[i] + '</small><b>' + d.getDate() + '</b></button>';
      }).join('') + '<button class="sem-flecha" type="button" data-s="7" aria-label="Semana siguiente">' + I('der', 18) + '</button>';
    var cs = clasesDe(diaSel), filas = '', j = 0;
    for (var h = 15; h <= 19; h++) {
      var dentro = cs.filter(function (c) { return c.h >= h && c.h < h + 1; }).map(function (c) {
        return '<article class="sem-card ' + (c.m === 'mensual' ? 'sem-mensual' : 'sem-individual') + '" style="--d:' + (j++ * 80) + 'ms"><span class="sem-avatar" aria-hidden="true">' + c.i + '</span>' +
          '<div><p class="sem-nombre">' + c.n + '</p><p class="sem-meta"><span class="sem-hora">' + hh(c.h) + '</span><span class="mod">' + cap(c.m) + '</span></p></div></article>';
      }).join('');
      filas += '<div class="sem-fila"><span class="sem-hora-lbl">' + hh(h) + '</span><div class="sem-cards">' + dentro + '</div></div>';
    }
    $('#sem-lista').innerHTML = filas;
  }

  function verAgenda(v) {
    vista = v;
    pintarMes(); pintarSemana();
    var mes = $('#vista-mes'), sem = $('#vista-semana'), el = v === 'mes' ? mes : sem;
    mes.hidden = v !== 'mes'; sem.hidden = v !== 'semana';
    el.classList.remove('vista-anim'); void el.offsetWidth; el.classList.add('vista-anim');
  }

  // ---------- Navegación entre pantallas ----------
  function ir(pant) {
    document.querySelectorAll('[data-pant]').forEach(function (s) { s.hidden = s.dataset.pant !== pant; });
    document.querySelectorAll('.nav a').forEach(function (a) { var on = a.dataset.go === pant; a.classList.toggle('activo', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (pant === 'agenda') verAgenda(vista);
    if (pant === 'hoy') { pintarHoy(); }
    location.hash = pant === 'agenda' ? 'agenda-' + vista : pant;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a'); if (!t) return;
    if (t.dataset.go) { e.preventDefault(); if (/^(hoy|agenda)$/.test(t.dataset.go)) ir(t.dataset.go); else avisar('«' + t.textContent.trim() + '» se diseña en la Fase 3'); }
    else if (t.classList.contains('mes-dia')) { diaSel = new Date(+t.dataset.t); verAgenda('semana'); location.hash = 'agenda-semana'; }
    else if (t.classList.contains('sem-dia')) { diaSel = new Date(+t.dataset.t); pintarSemana(); }
    else if (t.dataset.s) { diaSel = mas(diaSel, +t.dataset.s); pintarSemana(); }
    else if (t.dataset.m) { mesVisto = new Date(mesVisto.getFullYear(), mesVisto.getMonth() + (+t.dataset.m), 1); pintarMes(); }
    else if (t.id === 'volver-mes') { verAgenda('mes'); location.hash = 'agenda-mes'; }
    else if (t.dataset.hoy) { diaSel = new Date(HOY); mesVisto = new Date(2026, 10, 1); verAgenda(vista); }
    else if (t.id === 'link-semana') { e.preventDefault(); diaSel = new Date(HOY); vista = 'semana'; ir('agenda'); }
    else if (t.classList.contains('fab')) avisar('Agendar clase: flujo de Fase 3');
  });

  var tm;
  function avisar(txt) {
    var a = $('#toast'); a.textContent = txt; a.classList.add('ver');
    clearTimeout(tm); tm = setTimeout(function () { a.classList.remove('ver'); }, 1800);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var h = location.hash.replace('#', '');
    if (h === 'agenda-semana') { vista = 'semana'; ir('agenda'); }
    else if (/^agenda/.test(h)) { vista = 'mes'; ir('agenda'); }
    else ir('hoy');
  });
})();
