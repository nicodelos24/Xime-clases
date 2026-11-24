// Íconos SVG propios de Clases v4 (24x24, trazo 2, redondeado). Cero emoji.
(function () {
  var S = {
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    alumnos: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.4-3.6 3.1-5.6 6.2-5.6s5.8 2 6.2 5.6"/><path d="M15.6 4.9a3.3 3.3 0 0 1 0 6.2M18.4 14.9c1.8.7 2.9 2.4 3.2 5.1"/>',
    'foto-camara': '<path d="M8.5 7 10 4.5h4L15.5 7"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/>',
    'foto-galeria': '<rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="8.5" cy="10" r="1.5"/><path d="m4 17 4.7-4.4 3.2 2.8 3-2.6L20 17"/>',
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
    individual: '<path fill="currentColor" stroke="none" d="M12 4.5 19.5 12 12 19.5 4.5 12z"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/>&lt;path d="M12 3.2v2M12 18.8v2M4.8 7.6l1.7 1M17.5 15.4l1.7 1M4.8 16.4l1.7-1M17.5 8.6l1.7-1"/>&lt;path d="M10 3.2h4M6.2 5.4 8.4 7M17.6 5.4 15.4 7M6.2 18.6 8.4 17M17.6 18.6 15.4 17"/>',
    /* En desuso: las burbujas «?» usan el carácter literal (A1, 23-nov).
       Se conserva el símbolo por si otra vista lo usa; nada lo cita hoy. */
    ayuda: '<circle cx="12" cy="12" r="8.6"/><path d="M9.6 9.8c.2-1.3 1.1-2.1 2.4-2.1 1.4 0 2.4.9 2.4 2.1 0 1.9-2.4 1.7-2.4 3.4v.4"/><circle fill="currentColor" stroke="none" cx="12" cy="16.6" r="1"/>',
    wa: '<g fill="currentColor" stroke="none"><path d="M12.05 2.25c-5.4 0-9.78 4.38-9.78 9.78 0 1.72.45 3.34 1.24 4.74L2.25 21.5l4.85-1.27a9.74 9.74 0 0 0 4.95 1.35c5.4 0 9.78-4.38 9.78-9.78s-4.38-9.55-9.78-9.55zm0 17.84c-1.6 0-3.1-.48-4.36-1.3l-.31-.19-3.24.85.86-3.16-.2-.33a8.06 8.06 0 0 1-1.24-4.32c0-4.48 3.65-8.12 8.12-8.12 4.48 0 8.12 3.64 8.12 8.12 0 4.48-3.64 8.45-8.12 8.45z"/><path d="M15.1 13.9c-.15-.08-.9-.45-1.05-.5-.14-.05-.24-.08-.35.07-.1.16-.4.5-.5.6-.09.1-.18.12-.33.04-.15-.07-.63-.23-1.2-.74-.44-.4-.74-.88-.83-1.03-.09-.15-.01-.23.06-.31.07-.07.15-.18.22-.27.08-.09.1-.15.15-.25.05-.1.03-.19-.02-.27-.05-.07-.35-.85-.48-1.16-.13-.31-.26-.27-.35-.27h-.3c-.1 0-.27.04-.4.19-.14.16-.53.52-.53 1.26 0 .74.54 1.46.62 1.56.07.1 1.06 1.62 2.56 2.27.36.16.64.25.85.32.36.11.69.1.95.06.29-.05.9-.37 1.02-.72.13-.36.13-.66.09-.72-.04-.07-.14-.1-.28-.17z"/></g>',
  };
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">';
  for (var k in S) sprite += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + S[k] + '</symbol>';
  document.body.insertAdjacentHTML('afterbegin', sprite + '</svg>');
  window.ico = function (n, s, c) {
    return '<svg class="ico ' + (c || '') + '" width="' + s + '" height="' + s + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  };
})();
