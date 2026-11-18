// Clases v5 · propuesta de navegación y micro-interacciones
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var vistas = Array.prototype.slice.call(document.querySelectorAll('.vista'));
  var toast = document.getElementById('toast');
  var tm;

  function avisar(txt) {
    toast.textContent = txt;
    toast.classList.add('ver');
    clearTimeout(tm);
    tm = setTimeout(function () { toast.classList.remove('ver'); }, 1800);
  }

  function irA(id) {
    var destino = document.getElementById(id);
    if (!destino) return;
    vistas.forEach(function (v) { v.classList.remove('activa'); });
    // reinicia la animación de entrada de la vista
    void destino.offsetWidth;
    destino.classList.add('activa');
    tabs.forEach(function (t) {
      var on = t.getAttribute('href') === '#' + id;
      t.classList.toggle('activo', on);
      if (on) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      irA(t.getAttribute('href').slice(1));
    });
  });

  document.querySelectorAll('.link-suave').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      irA(a.getAttribute('href').slice(1));
    });
  });

  // tira de días: el activo se mueve con un pop
  document.querySelectorAll('.tira-dia').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tira-dia').forEach(function (o) { o.classList.remove('activo'); });
      b.classList.add('activo');
      if (!b.classList.contains('tiene')) avisar('Sin clases grupales ese día');
    });
  });

  // marcar clase dada: un solo botón por clase, nunca por alumno
  document.querySelectorAll('.marcar').forEach(function (b) {
    b.addEventListener('click', function () {
      var dada = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', dada ? 'false' : 'true');
      b.textContent = dada ? 'Marcar dada' : 'Dada';
      b.closest('.clase').classList.toggle('hecha', !dada);
      avisar(dada ? 'Clase marcada como pendiente' : 'Grupo marcado como dada');
    });
  });

  document.querySelector('.fab').addEventListener('click', function () {
    avisar('Agendar: flujo a definir en la reescritura');
  });
  document.querySelector('.campana').addEventListener('click', function () {
    avisar('3 avisos · 2 mensualidades vencen hoy');
  });

  var inicial = location.hash.slice(1);
  if (inicial && document.getElementById(inicial)) irA(inicial);
})();
