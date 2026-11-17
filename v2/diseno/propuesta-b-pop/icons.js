/* Propuesta B — Pop. Íconos en cápsula con tinte por sección, rellenos más marcados. */
(function(){
const P={
hoy:'<circle cx="12" cy="12" r="5.2" fill="currentColor" opacity=".18" stroke="none"/><circle cx="12" cy="12" r="3.1" fill="currentColor" stroke="none"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6l1.6-1.6M17 7l1.6-1.6"/>',
alumnos:'<circle cx="9" cy="8.3" r="3.6" fill="currentColor" opacity=".18" stroke="none"/><circle cx="9" cy="8.3" r="2.4" fill="currentColor" stroke="none"/><path d="M2.8 20c.4-3.5 3-5.5 6.2-5.5s5.8 2 6.2 5.5"/><path d="M16.2 5.3a3.3 3.3 0 0 1 0 6.3M18.7 15c1.5.8 2.4 2.3 2.6 4.2"/>',
agenda:'<rect x="3.4" y="4.8" width="17.2" height="15.8" rx="3.2" fill="currentColor" opacity=".18" stroke="none"/><rect x="3.4" y="4.8" width="17.2" height="15.8" rx="3.2"/><path d="M3.4 9.8h17.2M8 2.8v3.6M16 2.8v3.6"/><circle cx="8.4" cy="14.4" r="1.1" fill="currentColor"/><circle cx="12" cy="14.4" r="1.1" fill="currentColor"/>',
cobros:'<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".18" stroke="none"/><circle cx="12" cy="12" r="9"/><path d="M14.6 9.2c-.5-.8-1.4-1.2-2.6-1.2-1.6 0-2.6.8-2.6 1.9 0 2.7 5.4 1.2 5.4 4 0 1.2-1.1 2-2.8 2-1.3 0-2.3-.5-2.9-1.4M12 6.2V8M12 16v1.8"/>',
mas:'<rect x="3.4" y="3.4" width="7.3" height="7.3" rx="2.3" fill="currentColor" opacity=".18" stroke="none"/><rect x="3.4" y="3.4" width="7.3" height="7.3" rx="2.3"/><rect x="13.3" y="3.4" width="7.3" height="7.3" rx="2.3"/><rect x="3.4" y="13.3" width="7.3" height="7.3" rx="2.3"/><rect x="13.3" y="13.3" width="7.3" height="7.3" rx="2.3"/><path d="M17 15v4M15 17h4"/>',
check:'<path d="M5 12.8l4.4 4.4L19 7.4"/>',
clock:'<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".18" stroke="none"/><circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3.2 2"/>',
alerta:'<path d="M12 3.4 21.4 19.8H2.6z" fill="currentColor" opacity=".18" stroke="none"/><path d="M12 3.4 21.4 19.8H2.6z"/><path d="M12 9.8v4.4"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
campana:'<path d="M5.4 17.2c1-1 1.6-2.3 1.6-4V10a5 5 0 0 1 10 0v3.2c0 1.7.6 3 1.6 4z" fill="currentColor" opacity=".18" stroke="none"/><path d="M5.4 17.2c1-1 1.6-2.3 1.6-4V10a5 5 0 0 1 10 0v3.2c0 1.7.6 3 1.6 4zM10 20.4a2.2 2.2 0 0 0 4 0"/>',
chat:'<path d="M3.8 5.4h16.4v10.7H9.5L5.4 19.6V16H3.8z" fill="currentColor" opacity=".18" stroke="none"/><path d="M3.8 5.4h16.4v10.7H9.5L5.4 19.6V16H3.8z"/><path d="M8 9.4h8M8 12.4h5"/>',
buscar:'<circle cx="10.5" cy="10.5" r="6.4" fill="currentColor" opacity=".18" stroke="none"/><circle cx="10.5" cy="10.5" r="6.4"/><path d="m15.4 15.4 5.2 5.2"/>',
mas1:'<path d="M12 5v14M5 12h14"/>',
chispa:'<path d="M12 2.8l2.1 5.9 5.9 2.1-5.9 2.1L12 18.8l-2.1-5.9L4 10.8l5.9-2.1z" fill="currentColor" opacity=".18" stroke="none"/><path d="M12 2.8l2.1 5.9 5.9 2.1-5.9 2.1L12 18.8l-2.1-5.9L4 10.8l5.9-2.1z"/>',
nota:'<path d="M5.8 3.4h9.2l3.6 3.6v13.6H5.8z" fill="currentColor" opacity=".18" stroke="none"/><path d="M5.8 3.4h9.2l3.6 3.6v13.6H5.8zM9 11h6M9 14.6h6"/>',
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
