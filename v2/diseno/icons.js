/* Set de íconos propio: trazo 1.8 + relleno duotono suave (.d). Uso: <svg class="ico"><use href="#i-nombre"/></svg> o ico('nombre') */
(function(){
const P={
hoy:'<circle class="d" cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
alumnos:'<circle class="d" cx="9" cy="8.5" r="3.4"/><circle cx="9" cy="8.5" r="3.4"/><path d="M2.8 20c.4-3.4 3-5.4 6.2-5.4s5.8 2 6.2 5.4"/><path d="M16 5.4a3.2 3.2 0 0 1 0 6.2M18.6 14.9c1.5.8 2.4 2.3 2.6 4.1"/>',
agenda:'<rect class="d" x="3.5" y="5" width="17" height="15.5" rx="3.2"/><rect x="3.5" y="5" width="17" height="15.5" rx="3.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14.5" r=".9" fill="currentColor"/><circle cx="12" cy="14.5" r=".9" fill="currentColor"/>',
cobros:'<circle class="d" cx="12" cy="12" r="8.8"/><circle cx="12" cy="12" r="8.8"/><path d="M14.6 9.2c-.5-.8-1.4-1.2-2.6-1.2-1.6 0-2.6.8-2.6 1.9 0 2.7 5.4 1.2 5.4 4 0 1.2-1.1 2-2.8 2-1.3 0-2.3-.5-2.9-1.4M12 6.3V8M12 16v1.7"/>',
mas:'<rect class="d" x="3.5" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect x="3.5" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect x="13.3" y="3.5" width="7.2" height="7.2" rx="2.2"/><rect x="3.5" y="13.3" width="7.2" height="7.2" rx="2.2"/><rect x="13.3" y="13.3" width="7.2" height="7.2" rx="2.2"/>',
check:'<path d="M5 12.8l4.4 4.4L19 7.4"/>',
clock:'<circle class="d" cx="12" cy="12" r="8.8"/><circle cx="12" cy="12" r="8.8"/><path d="M12 7.2V12l3.2 2"/>',
alerta:'<path class="d" d="M12 3.6 21.2 19.6H2.8z"/><path d="M12 3.6 21.2 19.6H2.8z"/><path d="M12 9.8v4.4"/><circle cx="12" cy="16.9" r=".9" fill="currentColor"/>',
campana:'<path class="d" d="M5.5 17.2c1-1 1.5-2.3 1.5-4V10a5 5 0 0 1 10 0v3.2c0 1.7.5 3 1.5 4z"/><path d="M5.5 17.2c1-1 1.5-2.3 1.5-4V10a5 5 0 0 1 10 0v3.2c0 1.7.5 3 1.5 4zM10 20.2a2.2 2.2 0 0 0 4 0"/>',
chat:'<path class="d" d="M4 5.5h16v10.5H9.5L5.5 19.5V16H4z"/><path d="M4 5.5h16v10.5H9.5L5.5 19.5V16H4z"/>',
buscar:'<circle class="d" cx="10.5" cy="10.5" r="6.3"/><circle cx="10.5" cy="10.5" r="6.3"/><path d="m15.4 15.4 5 5"/>',
mas1:'<path d="M12 5v14M5 12h14"/>',
chispa:'<path class="d" d="M12 3l2 5.6L19.6 11 14 13l-2 5.6L10 13 4.4 11 10 8.6z"/><path d="M12 3l2 5.6L19.6 11 14 13l-2 5.6L10 13 4.4 11 10 8.6z"/>',
nota:'<path class="d" d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M6 3.5h9l3.5 3.5v13.5H6zM9 11h6M9 14.5h6"/>',
flecha:'<path d="m9 5.5 6.5 6.5L9 18.5"/>',
mensual:'<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
individual:'<path d="M12 5.5 18.5 12 12 18.5 5.5 12z" fill="currentColor" stroke="none"/>'
};
const s=document.createElementNS("http://www.w3.org/2000/svg","svg");
s.setAttribute("width",0);s.setAttribute("height",0);s.style.position="absolute";s.setAttribute("aria-hidden","true");
s.innerHTML=Object.entries(P).map(([k,v])=>`<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join("");
document.addEventListener("DOMContentLoaded",()=>document.body.prepend(s));
window.ico=(n,c="")=>`<svg class="ico ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
})();
