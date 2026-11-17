/* Clases v3 · íconos SVG propios, trazo 2 + duotono suave (.d). Regla: cero emoji, color solo cuando informa.
   Uso: <svg class="ico" style="color:#5B2E91"><use href="#i-nombre"/></svg> — el sprite se inyecta con inyectarIconos(). */
window.inyectarIconos = function(){
  const d = document.createElement('div');
  d.style.color = 'inherit';
  d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none;fill:currentColor;stroke:currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <symbol id="i-sol" viewBox="0 0 24 24"><circle fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="4.4"/><path d="M12 2.6v2.5M12 18.9v2.5M2.6 12h2.5M18.9 12h2.5M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M5.4 18.6l1.8-1.8M16.8 7.2l1.8-1.8"/></symbol>
    <symbol id="i-alumnos" viewBox="0 0 24 24"><circle fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" cx="9" cy="8.4" r="3.5"/><circle cx="9" cy="8.4" r="3.5"/><path d="M2.7 20c.4-3.5 3-5.6 6.3-5.6s5.9 2.1 6.3 5.6"/><path d="M15.9 5.3a3.3 3.3 0 0 1 0 6.2M18.4 14.8c1.5.8 2.5 2.3 2.7 4.2"/></symbol>
    <symbol id="i-agenda" viewBox="0 0 24 24"><rect fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" x="3.5" y="5" width="17" height="15.5" rx="3.2"/><rect x="3.5" y="5" width="17" height="15.5" rx="3.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
    <symbol id="i-cobros" viewBox="0 0 24 24"><circle fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" cx="12" cy="12" r="8.8"/><circle fill="none" stroke-width="2.4" cx="12" cy="12" r="5.4"/><path d="M14.6 9.2c-.5-.8-1.4-1.2-2.6-1.2-1.6 0-2.6.8-2.6 1.9 0 2.7 5.4 1.2 5.4 4 0 1.2-1.1 2-2.8 2-1.3 0-2.3-.5-2.9-1.4M12 6.3V8M12 16v1.7"/></symbol>
    <symbol id="i-mas" viewBox="0 0 24 24"><rect fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" x="3.5" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect x="3.5" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect fill="#FFFFFF" fill-opacity="0.28" stroke="none" x="13.3" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect x="13.3" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect fill="#FFFFFF" fill-opacity="0.28" stroke="none" x="3.5" y="13.3" width="7.2" height="7.2" rx="2.2"/><rect x="3.5" y="13.3" width="7.2" height="7.2" rx="2.2"/><rect fill="#FFFFFF" fill-opacity="0.28" stroke="none" x="13.3" y="13.3" width="7.2" height="7.2" rx="2.2"/><rect x="13.3" y="13.3" width="7.2" height="7.2" rx="2.2"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" d="M4.8 12.9l4.6 4.6L19.2 7"/></symbol>
    <symbol id="i-reloj" viewBox="0 0 24 24"><circle fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" cx="12" cy="12" r="8.8"/><path d="M12 7.2V12l3.2 2"/></symbol>
    <symbol id="i-alerta" viewBox="0 0 24 24"><path fill="#FFFFFF" fill-opacity="0.28" stroke="currentColor" stroke-width="2" d="M12 3.6 21.2 19.6H2.8z"/><path d="M12 3.6 21.2 19.6H2.8z"/><path d="M12 9.8v4.4"/><circle cx="12" cy="16.9" r=".9" fill="currentColor" stroke="none"/></symbol>
    <symbol id="i-campana" viewBox="0 0 24 24"><path fill="none" d="M5.5 17.2c1-1 1.5-2.3 1.5-4V10a5 5 0 0 1 10 0v3.2c0 1.7.5 3 1.5 4z"/><path fill="none" d="M10 20.2a2.2 2.2 0 0 0 4 0"/></symbol>
    <symbol id="i-chispa" viewBox="0 0 24 24"><path fill="none" d="M12 3l2 5.6L19.6 11 14 13l-2 5.6L10 13 4.4 11 10 8.6z"/></symbol>
    <symbol id="i-doc" viewBox="0 0 24 24"><path fill="none" d="M6 3.5h9l3.5 3.5v13.5H6z"/><path fill="none" d="M9 11h6M9 14.5h6"/></symbol>
    <symbol id="i-flecha" viewBox="0 0 24 24"><path fill="none" d="m9 5.5 6.5 6.5L9 18.5"/></symbol>
    <symbol id="i-mensual" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/></symbol>
    <symbol id="i-individual" viewBox="0 0 24 24"><path d="M12 5.5 18.5 12 12 18.5 5.5 12z" fill="currentColor" stroke="none"/></symbol>
  </svg>`;
  document.body.appendChild(d);
};
