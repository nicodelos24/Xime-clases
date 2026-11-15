import {icono} from './iconografia.js';
export const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pesos=n=>'$ '+Number(n).toLocaleString('es-UY')+' UYU';
export function boton(text,attrs='',tipo='s'){
  const figura=/WhatsApp/.test(text)?'whatsapp':/^(Pasar lista|Abrir lista|Ver asistencia)$/.test(text)?'asistencia':text==='Volver'?'volver':null;
  return `<button class="btn ${tipo}" ${attrs}>${figura?icono(figura):''}<span>${text}</span></button>`;
}
export function titulo(t,sub=''){return `<div class="intro"><h1 tabindex="-1">${esc(t)}</h1>${sub?`<p class="ayuda">${esc(sub)}</p>`:''}</div>`;}
export function chip(estado){
  const mapa={'Vigente':['vigente','check'],'Por vencer':['por-vencer','reloj'],'Vence hoy':['vence-hoy','reloj'],'Vencida':['vencida','alerta'],'Pagada, sin iniciar':['sin-iniciar','pausa'],'Sin mensualidad':['sin-mens','menos'],'Clase suelta':['neutro','menos']};
  const [clase,figura]=mapa[estado]||['neutro','menos'];
  return `<span class="chip ${clase}">${icono(figura)}${esc(estado)}</span>`;
}
