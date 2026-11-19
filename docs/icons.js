// Íconos SVG propios de Clases v4 (24x24, trazo 2, redondeado). Cero emoji.
(function () {
  var S = {
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    alumnos: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.4-3.6 3.1-5.6 6.2-5.6s5.8 2 6.2 5.6"/><path d="M15.6 4.9a3.3 3.3 0 0 1 0 6.2M18.4 14.9c1.8.7 2.9 2.4 3.2 5.1"/>',
    agenda: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle fill="currentColor" stroke="none" cx="8.5" cy="14.2" r="1.1"/><circle fill="currentColor" stroke="none" cx="12" cy="14.2" r="1.1"/><circle fill="currentColor" stroke="none" cx="15.5" cy="14.2" r="1.1"/>',
    cobros: '<circle cx="12" cy="12" r="8.6"/><path d="M14.8 9.2c-.5-1-1.6-1.5-2.8-1.5-1.5 0-2.6.8-2.6 2 0 3 5.4 1.3 5.4 4.3 0 1.2-1.2 2-2.8 2-1.3 0-2.4-.6-3-1.6M12 6v1.7M12 16.3V18"/>',
    mas: '<circle fill="currentColor" stroke="none" cx="5.5" cy="12" r="1.7"/><circle fill="currentColor" stroke="none" cx="12" cy="12" r="1.7"/><circle fill="currentColor" stroke="none" cx="18.5" cy="12" r="1.7"/>',
    campana: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2H4.4z"/><path d="M10 21a2.2 2.2 0 0 0 4 0"/>',
    luna: '<path d="M20 14.5A8.6 8.6 0 0 1 9.5 4 8.6 8.6 0 1 0 20 14.5z"/>',
    reloj: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>',
    alerta: '<path d="M12 3.8 21 19.5H3z"/><path d="M12 10v4.2"/><circle fill="currentColor" stroke="none" cx="12" cy="16.8" r=".4"/>',
    check: '<path d="m5 12.8 4.4 4.4L19 7.5"/>',
    mas2: '<path d="M12 5v14M5 12h14"/>',
    izq: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    der: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    flor: '<circle cx="12" cy="12" r="2.6"/><path d="M12 9.4c-2.4-1.2-2.4-5.6 0-6.4 2.4.8 2.4 5.2 0 6.4zM14.6 12c1.2-2.4 5.6-2.4 6.4 0-.8 2.4-5.2 2.4-6.4 0zM12 14.6c2.4 1.2 2.4 5.6 0 6.4-2.4-.8-2.4-5.2 0-6.4zM9.4 12c-1.2 2.4-5.6 2.4-6.4 0 .8-2.4 5.2-2.4 6.4 0z"/>',
    mensual: '<circle fill="currentColor" stroke="none" cx="12" cy="12" r="6.5"/>',
    individual: '<path fill="currentColor" stroke="none" d="M12 4.5 19.5 12 12 19.5 4.5 12z"/>'
  };
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">';
  for (var k in S) sprite += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + S[k] + '</symbol>';
  document.body.insertAdjacentHTML('afterbegin', sprite + '</svg>');
  window.ico = function (n, s, c) {
    return '<svg class="ico ' + (c || '') + '" width="' + s + '" height="' + s + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  };
})();
