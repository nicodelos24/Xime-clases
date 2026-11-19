// Clases v5 · navegación + funcionamiento (auto-marcado, Cancelar clase, WhatsApp)
// La estética vive en tokens.css/propuesta.css; acá solo se cambian estados,
// textos y el flujo de cancelación. Sin emoji: solo SVG de icons.js.
import { crearClase, reconciliar, cancelarClase, deshacerCancelacion, registrarMensajeEnviado, horaClase, } from './src/clases.js';
import { resumenHoy, clasesDelDia, clasesDeLaSemana } from './src/resumen.js';
import { diaCorto, etiquetaDia, etiquetaMes, sumarDias, parseFecha } from './src/fechas.js';
import { relojDelDispositivo, hoyLocal } from './src/reloj.js';
import { textoCancelacion, destinos, resumenEnvio, linkTexto, } from './src/whatsapp.js';
/* ---------------------------------------------------------------- datos demo */
const reloj = relojDelDispositivo();
function alumnos(nombres, prefijo) {
    return nombres.map(([nombre, telefono], i) => ({ id: `${prefijo}${i}`, nombre, telefono }));
}
const GRUPO_A = alumnos([
    ['Carla T.', '099 123 456'], ['Bruno S.', '099 987 654'], ['Julieta P.', '099 112 233'],
    ['Martín R.', '099 445 566'], ['Lucía C.', '099 778 899'], ['Diego G.', '099 321 654'],
    ['Sofía M.', '099 555 101'], ['Tomás L.', '099 666 202'], ['Valentina R.', '099 777 303'],
    ['Mateo F.', '099 888 404'], ['Camila S.', '099 999 505'], ['Joaquín P.', '099 101 606'],
], 'a');
const GRUPO_B = alumnos([
    ['Julieta P.', '099 112 233'], ['Lucía C.', '099 778 899'], ['Sofía M.', '099 555 101'],
    ['Tomás L.', '099 666 202'], ['Valentina R.', '099 777 303'], ['Mateo F.', '099 888 404'],
    ['Camila S.', '099 999 505'], ['Joaquín P.', '099 101 606'], ['Abril G.', '099 212 717'],
], 'b');
const GRUPO_V = alumnos([
    ['Martín R.', '099 445 566'], ['Diego G.', '099 321 654'], ['Sofía M.', '099 555 101'],
    ['Tomás L.', '099 666 202'], ['Valentina R.', '099 777 303'], ['Mateo F.', '098 888 404'],
    ['Camila S.', '098 999 505'], ['Joaquín P.', '098 101 606'], ['Abril G.', '098 212 717'],
    ['Bruno S.', '098 987 654'], ['Lucía C.', '098 778 899'],
], 'v');
/** Semana de la demo: lunes 16 al domingo 22 de noviembre de 2026. */
function datosDemo() {
    const lunes = '2026-11-16';
    return [
        crearClase({ id: 'c-lun', nombre: 'Grupo Lunes', fecha: lunes, hora: '15:00', alumnos: GRUPO_A.slice(0, 8) }),
        crearClase({ id: 'c-mar-a', nombre: 'Grupo Martes A', fecha: sumarDias(lunes, 1), hora: '15:00', alumnos: GRUPO_A }),
        crearClase({ id: 'c-mar-b', nombre: 'Grupo Martes B', fecha: sumarDias(lunes, 1), hora: '17:30', alumnos: GRUPO_B }),
        crearClase({ id: 'c-mie', nombre: 'Grupo Miércoles', fecha: sumarDias(lunes, 2), hora: '10:00', alumnos: GRUPO_B.slice(0, 6) }),
        crearClase({ id: 'c-jue', nombre: 'Grupo Jueves', fecha: sumarDias(lunes, 3), hora: '16:00', alumnos: GRUPO_V.slice(0, 7) }),
        crearClase({ id: 'c-vie', nombre: 'Grupo Viernes', fecha: sumarDias(lunes, 4), hora: '15:00', alumnos: GRUPO_V }),
        crearClase({ id: 'c-vie-b', nombre: 'Grupo Viernes B', fecha: sumarDias(lunes, 4), hora: '18:00', alumnos: GRUPO_A.slice(2, 9) }),
        crearClase({ id: 'c-sab', nombre: 'Grupo Sábado', fecha: sumarDias(lunes, 5), hora: '11:00', alumnos: GRUPO_B.slice(1, 6) }),
    ];
}
let clases = reconciliar(datosDemo(), reloj.ahora());
/* ------------------------------------------------------------------- helpers */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const toast = $('#toast');
let tm;
function avisar(txt, ms = 2200) {
    toast.textContent = txt;
    toast.classList.add('ver');
    clearTimeout(tm);
    tm = setTimeout(() => toast.classList.remove('ver'), ms);
}
function esc(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]);
}
/** Chip de estado de una clase (SVG, sin emoji). */
function chipEstado(c) {
    if (c.estado === 'dada') {
        return '<span class="chip chip-dada"><svg class="ico" width="13" height="13"><use href="#i-check"/></svg>Dada</span>';
    }
    if (c.estado === 'cancelada') {
        return '<span class="chip chip-cancelada"><svg class="ico" width="13" height="13"><use href="#i-alerta"/></svg>Cancelada</span>';
    }
    return '<span class="chip chip-por">Por dar</span>';
}
/** Acción de una fila de clase: Cancelar clase (reemplaza a "Marcar dada"). */
function accionClase(c) {
    if (c.estado === 'cancelada') {
        return `<button class="marcar marcar-reversa" type="button" data-reversa="${c.id}">Revertir</button>`;
    }
    return `<button class="marcar marcar-cancelar" type="button" data-cancelar="${c.id}">Cancelar clase</button>`;
}
/* ------------------------------------------------------- vista Hoy (hero) */
/** El anillo anima su llenado una sola vez, al abrir la app. */
let anilloArranque = true;
function pintarHoy() {
    const hoy = hoyLocal(reloj.ahora());
    const r = resumenHoy(clases, hoy);
    const fechaEl = $('.hero-fecha');
    const fraseEl = $('.hero-frase');
    if (fechaEl)
        fechaEl.textContent = etiquetaDia(hoy).replace(/^./, (m) => m.toUpperCase());
    if (fraseEl)
        fraseEl.textContent = r.frase;
    const [dadas, total] = r.anillo;
    const circ = 2 * Math.PI * 38; // 238.76
    const anilloValor = $('.anillo-valor');
    if (anilloValor) {
        const fraccion = total === 0 ? 0 : dadas / total;
        anilloValor.style.strokeDasharray = String(circ);
        anilloValor.style.strokeDashoffset = String(circ * (1 - fraccion));
        // "El anillo que se llena" (LEEME v5): solo en el primer pintado, y
        // siempre desde el estado real del anillo (no al 0/2 fijo de la hoja).
        // Después de arrancar, el estado manda: sin animación que lo contradiga.
        if (anilloArranque) {
            // Del vacío al estado real que pinta el JS. Se hace con la Web Animations
            // API: `stroke-dashoffset` es una propiedad del SVG que el CSS no anima
            // con fiabilidad entre versiones de Chrome.
            anilloValor.style.animation = 'none';
            anilloValor.animate([{ strokeDashoffset: String(circ) }, { strokeDashoffset: String(circ * (1 - fraccion)) }], 
            // `fill: 'both'`: al terminar queda el estado real (igual que el estilo
            // inline) y la animación se puede inspeccionar después en QA.
            { duration: 900, delay: 260, easing: 'cubic-bezier(.22,.9,.36,1.02)', fill: 'both' });
            anilloArranque = false;
        }
        else {
            anilloValor.style.animation = 'none';
        }
    }
    const anilloTexto = $('.anillo-texto');
    if (anilloTexto)
        anilloTexto.innerHTML = `<strong>${dadas}</strong><span>/ ${total}</span>`;
    const grupos = $('.hero-grupos');
    if (grupos) {
        if (r.clases.length === 0) {
            grupos.innerHTML = '<p class="grupo-vacio">Sin clases grupales hoy</p>';
        }
        else {
            grupos.innerHTML = r.clases
                .map((c) => `<div class="grupo">
            <span class="grupo-hora">${horaClase(c)}</span>
            <span class="grupo-nombre">${esc(c.nombre)}</span>
            ${chipEstado(c)}
          </div>`)
                .join('');
        }
    }
    // KPIs del hero: cobrado hoy y por cobrar (demo) + vencimientos.
    const kpis = $$('.vista#v-hoy .kpi-valor');
    if (kpis.length >= 3) {
        const vencen = r.canceladas > 0 ? 2 : 2;
        kpis[2].textContent = String(vencen);
    }
}
/* -------------------------------------------------- vista Clases (semana) */
function pintarSemana() {
    const hoy = hoyLocal(reloj.ahora());
    const lunes = semanaActual(hoy);
    const dias = clasesDeLaSemana(clases, lunes);
    const tira = $('.tira');
    if (tira) {
        tira.innerHTML = dias
            .map((d) => {
            const dia = parseFecha(d.fecha);
            const activo = d.fecha === hoy ? ' activo' : '';
            const tiene = d.clases.length > 0 ? ' tiene' : '';
            return `<button class="tira-dia${tiene}${activo}" type="button" data-fecha="${d.fecha}">
          <span>${diaCorto(d.fecha)}</span><b>${dia.d}</b></button>`;
        })
            .join('');
        tira.querySelectorAll('.tira-dia').forEach((b) => {
            b.addEventListener('click', () => {
                $$('.tira-dia').forEach((o) => o.classList.remove('activo'));
                b.classList.add('activo');
                const f = b.dataset.fecha;
                pintarLinea(f);
                const tiene = clases.some((c) => c.fecha === f);
                if (!tiene)
                    avisar('Sin clases grupales ese día');
            });
        });
    }
    pintarLinea(hoy);
    const h2 = $('#v-semana .agenda-titulo h2');
    if (h2)
        h2.textContent = 'Esta semana';
    const link = $('#v-semana .link-suave');
    if (link)
        link.textContent = 'Ver mes';
}
/** Lunes de la semana que contiene `f` (o la semana de hoy). */
function semanaActual(f) {
    const idx = (new Date(`${f}T12:00:00Z`).getUTCDay() + 6) % 7;
    return sumarDias(f, -idx);
}
/** La tira y la línea se pintan con la semana de hoy; elegir un día solo cambia la línea. */
function pintarLineaSolo(dia) {
    $$('.tira-dia').forEach((o) => o.classList.toggle('activo', o.getAttribute('data-fecha') === dia));
    pintarLinea(dia);
    const tiene = clases.some((c) => c.fecha === dia);
    if (!tiene)
        avisar('Sin clases grupales ese día');
}
function pintarLinea(fecha) {
    const cont = $('.linea');
    if (!cont)
        return;
    const dia = fecha ?? hoyLocal(reloj.ahora());
    const delDia = clasesDelDia(clases, dia);
    if (delDia.length === 0) {
        cont.innerHTML = `<li class="linea-dia"><p class="linea-fecha">${esc(etiquetaDia(dia))}</p>
      <p class="linea-vacia">Sin clases ese día</p></li>`;
        return;
    }
    cont.innerHTML = `<li class="linea-dia">
    <p class="linea-fecha">${esc(etiquetaDia(dia))}${dia === hoyLocal(reloj.ahora()) ? ' · hoy' : ''}</p>
    ${delDia
        .map((c) => `<article class="clase${c.estado === 'dada' ? ' hecha' : ''}${c.estado === 'cancelada' ? ' cancelada' : ''}" data-clase="${c.id}">
          <div class="clase-hora"><b>${horaClase(c)}</b><span>${c.duracionMin} min</span></div>
          <div class="clase-datos">
            <p class="clase-nombre">${esc(c.nombre)}</p>
            <p class="clase-sub">${c.alumnos.length} alumnos inscriptos${c.estado === 'cancelada' && c.cancelacion ? ` · ${esc(c.cancelacion.motivo)}` : ''}</p>
          </div>
          ${chipEstado(c)}
          ${accionClase(c)}
        </article>`)
        .join('')}
  </li>`;
    cont.querySelectorAll('[data-cancelar]').forEach((b) => {
        b.addEventListener('click', () => abrirCancelacion(b.dataset.cancelar));
    });
    cont.querySelectorAll('[data-reversa]').forEach((b) => {
        b.addEventListener('click', () => revertirCancelacion(b.dataset.reversa));
    });
}
/* ------------------------------------------------------- vista mes (puntos) */
function pintarMes() {
    const hoy = hoyLocal(reloj.ahora());
    const { y, m } = parseFecha(hoy);
    const h2 = $('#v-mes .agenda-titulo h2');
    if (h2)
        h2.textContent = etiquetaMes(hoy);
    const cont = $('#v-mes .mes');
    if (!cont)
        return;
    const primerDia = `${y}-${String(m).padStart(2, '0')}-01`;
    const dowLunes = (new Date(`${primerDia}T12:00:00Z`).getUTCDay() + 6) % 7;
    const diasMes = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const celdas = [];
    for (let i = 0; i < dowLunes; i++)
        celdas.push('<button class="mes-dia vacio" type="button" disabled></button>');
    for (let d = 1; d <= diasMes; d++) {
        const f = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const tiene = clases.some((c) => c.fecha === f) ? ' tiene' : '';
        const activo = f === hoy ? ' activo' : '';
        celdas.push(`<button class="mes-dia${tiene}${activo}" type="button" data-fecha="${f}">${d}</button>`);
    }
    cont.innerHTML = celdas.join('');
    cont.querySelectorAll('.mes-dia:not(.vacio)').forEach((b) => {
        b.addEventListener('click', () => {
            const f = b.dataset.fecha;
            irA('v-semana');
            pintarLineaSolo(f);
        });
    });
}
/* ------------------------------------------- cancelar clase (sheet + WhatsApp) */
let sheet = null;
let claseEnSheet = null;
let modoEnvio = 'masivo';
let elegidos = new Set();
let textoEnviado = '';
function cerrarSheet() {
    if (!sheet)
        return;
    sheet.classList.add('cerrando');
    const s = sheet;
    sheet = null;
    claseEnSheet = null;
    setTimeout(() => s.remove(), 240);
}
function abrirCancelacion(id) {
    const c = clases.find((x) => x.id === id);
    if (!c)
        return;
    claseEnSheet = c;
    modoEnvio = 'masivo';
    elegidos = new Set();
    textoEnviado = textoCancelacion(c);
    const previo = document.createElement('div');
    previo.className = 'sheet';
    previo.setAttribute('role', 'dialog');
    previo.setAttribute('aria-modal', 'true');
    previo.setAttribute('aria-label', `Cancelar ${c.nombre}`);
    previo.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="sheet-eyebrow">${esc(etiquetaDia(c.fecha))} · ${horaClase(c)}</p>
        <h3>Cancelar clase</h3>
      </div>
      <button class="sheet-cerrar" type="button" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button>
    </div>
    <p class="sheet-clase"><strong>${esc(c.nombre)}</strong> · ${c.alumnos.length} alumnos</p>

    <label class="campo">
      <span>Motivo</span>
      <input type="text" id="canc-motivo" placeholder="Ej.: lluvia, enfermedad" autocomplete="off">
    </label>

    <p class="sheet-paso">Avisar por WhatsApp (opcional)</p>
    <div class="opciones" role="radiogroup" aria-label="Aviso por WhatsApp">
      <button class="opcion activa" type="button" data-modo="masivo">
        <svg class="ico" width="17" height="17"><use href="#i-alerta"/></svg>
        <span><b>Masivo a los alumnos</b><small>Un mensaje para todo el grupo</small></span>
      </button>
      <button class="opcion" type="button" data-modo="individual">
        <svg class="ico" width="17" height="17"><use href="#i-alumnos"/></svg>
        <span><b>Individual</b><small>Elegís a quién escribirle</small></span>
      </button>
      <button class="opcion" type="button" data-modo="ninguno">
        <svg class="ico" width="17" height="17"><use href="#i-mas2"/></svg>
        <span><b>No enviar ahora</b><small>Lo hacés después a mano</small></span>
      </button>
    </div>

    <div class="bloque-texto" data-modo="masivo">
      <label class="campo">
        <span>Mensaje (lo podés editar)</span>
        <textarea id="canc-texto" rows="3">${esc(textoEnviado)}</textarea>
      </label>
    </div>

    <div class="bloque-alumnos" data-modo="individual" hidden>
      <p class="sheet-paso">Elegí los alumnos</p>
      <ul class="lista-elegir">
        ${c.alumnos
        .map((a) => `<li>
              <label>
                <input type="checkbox" value="${a.id}">
                <span class="avatar">${esc(a.nombre.slice(0, 2).toUpperCase())}</span>
                <span class="al-nombre">${esc(a.nombre)}</span>
              </label>
            </li>`)
        .join('')}
      </ul>
    </div>

    <div class="sheet-acciones">
      <button class="btn-secundario" type="button" data-accion="volver">Volver</button>
      <button class="btn-primario" type="button" data-accion="confirmar">Cancelar clase</button>
    </div>`;
    document.querySelector('.cel')?.appendChild(previo);
    sheet = previo;
    previo.querySelector('.sheet-cerrar')?.addEventListener('click', cerrarSheet);
    previo.querySelector('[data-accion="volver"]')?.addEventListener('click', cerrarSheet);
    previo.querySelectorAll('.opcion').forEach((btn) => {
        btn.addEventListener('click', () => {
            modoEnvio = btn.dataset.modo ?? 'masivo';
            previo.querySelectorAll('.opcion').forEach((o) => o.classList.toggle('activa', o === btn));
            const bloqueTexto = previo.querySelector('.bloque-texto');
            const bloqueAlumnos = previo.querySelector('.bloque-alumnos');
            if (bloqueTexto)
                bloqueTexto.hidden = modoEnvio !== 'masivo';
            if (bloqueAlumnos)
                bloqueAlumnos.hidden = modoEnvio !== 'individual';
        });
    });
    const ta = previo.querySelector('#canc-texto');
    ta?.addEventListener('input', () => { textoEnviado = ta.value; });
    previo.querySelector('[data-accion="confirmar"]')?.addEventListener('click', () => {
        const motivo = previo.querySelector('#canc-motivo').value.trim();
        if (!motivo) {
            avisar('Poné un motivo para cancelar la clase');
            previo.querySelector('#canc-motivo').focus();
            return;
        }
        if (modoEnvio === 'individual' && elegidos.size === 0) {
            avisar('Elegí al menos un alumno o elegí “No enviar ahora”');
            return;
        }
        confirmarCancelacion(c, motivo);
    });
    previo.querySelectorAll('.lista-elegir input').forEach((input) => {
        input.addEventListener('change', () => {
            const idAlumno = input.value;
            if (input.checked)
                elegidos.add(idAlumno);
            else
                elegidos.delete(idAlumno);
        });
    });
    previo.querySelector('#canc-motivo').focus();
}
function confirmarCancelacion(c, motivo) {
    const ahora = reloj.ahora();
    const cancelada = cancelarClase(c, { motivo, quien: 'dueño', ahora });
    let lista = [];
    let texto = textoEnviado;
    if (modoEnvio === 'masivo') {
        lista = destinos(cancelada, 'masivo', [], texto);
    }
    else if (modoEnvio === 'individual') {
        const elegidosLista = cancelada.alumnos.filter((a) => elegidos.has(a.id));
        lista = destinos(cancelada, 'individual', elegidosLista, texto);
    }
    const anterior = c.estado;
    const registrada = modoEnvio === 'masivo' && lista.length > 0
        ? registrarMensajeEnviado(cancelada, 'masivo')
        : modoEnvio === 'individual' && lista.length > 0
            ? registrarMensajeEnviado(cancelada, 'individual')
            : registrarMensajeEnviado(cancelada, 'ninguno');
    clases = clases.map((x) => (x.id === c.id ? registrada : x));
    cerrarSheet();
    refrescar();
    // Cada cancelación arranca su propio aviso: nunca quedan enlaces de una
    // cancelación anterior ("No enviar ahora" deja 0 pendientes).
    delete toast.dataset.pendientes;
    if (lista.length > 0) {
        // Envío manual: el dueño confirma cada envío en WhatsApp (nunca automático).
        const primero = lista[0];
        window.open(primero.link, '_blank', 'noopener');
        avisar(`${resumenEnvio(cancelada, modoEnvio === 'individual' ? 'individual' : 'masivo', lista.length)}${lista.length > 1 ? ` · quedan ${lista.length - 1} para abrir` : ''} · Deshacer`, 6000);
        if (lista.length > 1) {
            toast.dataset.pendientes = JSON.stringify(lista.slice(1).map((d) => d.link));
        }
    }
    else {
        avisar(`Clase cancelada (${anterior === 'dada' ? 'estaba dada' : 'programada'}) · Deshacer`, 6000);
    }
    toast.dataset.deshacer = '1';
    toast.dataset.clase = c.id;
}
function revertirCancelacion(id) {
    const c = clases.find((x) => x.id === id);
    if (!c)
        return false;
    // El toast es reutilizable: si algo falla, se limpia igual para que no
    // quede un "Deshacer" que vuelve a lanzar el mismo error.
    try {
        const revertida = deshacerCancelacion(c, { motivo: 'error del dueño', quien: 'dueño', ahora: reloj.ahora() });
        clases = clases.map((x) => (x.id === id ? revertida : x));
    }
    catch (e) {
        avisar(e instanceof Error ? e.message : 'No se pudo deshacer', 3000);
        return false;
    }
    refrescar();
    avisar('Clase revertida a Programada');
    return true;
}
toast.addEventListener('click', () => {
    if (toast.dataset.deshacer === '1' && toast.dataset.clase) {
        revertirCancelacion(toast.dataset.clase);
        delete toast.dataset.deshacer;
        delete toast.dataset.clase;
        delete toast.dataset.pendientes;
        toast.classList.remove('ver');
        return;
    }
    const pendientes = JSON.parse(toast.dataset.pendientes || '[]');
    if (pendientes.length > 0) {
        const siguiente = pendientes.shift();
        window.open(siguiente, '_blank', 'noopener');
        toast.dataset.pendientes = JSON.stringify(pendientes);
        avisar(pendientes.length > 0 ? `Quedan ${pendientes.length} mensajes` : 'Último mensaje abierto', 2500);
    }
});
/* ------------------------------------------------------------- navegación */
const tabs = $$('.tab');
const vistas = $$('.vista');
const titulos = {
    'v-hoy': 'Hoy', 'v-semana': 'Clases', 'v-mes': 'Agenda', 'v-alumnos': 'Alumnos', 'v-cobros': 'Cobros',
};
function pintarTitulo(id) {
    const h1 = $('.barra-titulo');
    if (h1)
        h1.textContent = titulos[id] || 'Hoy';
}
function irA(id) {
    const destino = document.getElementById(id);
    if (!destino)
        return;
    vistas.forEach((v) => { if (v !== destino)
        v.classList.remove('activa'); });
    void destino.offsetWidth;
    destino.classList.add('activa');
    const pestaña = id === 'v-mes' ? 'v-semana' : id;
    tabs.forEach((t) => {
        const on = t.getAttribute('href') === '#' + pestaña;
        t.classList.toggle('activo', on);
        if (on)
            t.setAttribute('aria-current', 'page');
        else
            t.removeAttribute('aria-current');
    });
    pintarTitulo(id);
    if (history.replaceState)
        history.replaceState(null, '', '#' + id);
}
tabs.forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault();
    irA(t.getAttribute('href').slice(1));
}));
$$('.link-suave').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    irA(a.getAttribute('href').slice(1));
}));
$('.fab')?.addEventListener('click', () => avisar('Agendar: flujo a definir en la reescritura'));
$('.campana')?.addEventListener('click', () => avisar('3 avisos · 2 mensualidades vencen hoy'));
/* --------------------------------------------------------------- arranque */
function refrescar() {
    pintarSemana();
    pintarHoy();
    pintarMes();
}
// Re-alineado al abrir: las clases cuya hora pasó quedan Dadas.
clases = reconciliar(clases, reloj.ahora());
refrescar();
// El cron local avanza solo mientras la app está abierta (plan §2.1).
setInterval(() => {
    const antes = clases.map((c) => c.estado).join(',');
    clases = reconciliar(clases, reloj.ahora());
    if (clases.map((c) => c.estado).join(',') !== antes) {
        refrescar();
        avisar('Se marcaron clases dadas por la hora');
    }
}, 30000);
const inicial = location.hash.slice(1);
if (inicial && document.getElementById(inicial))
    irA(inicial);
else
    pintarTitulo('v-hoy');
// Exposición mínima para QA (consola / capturas): sin tocar el estado real.
window.ximeV5 = {
    get clases() { return clases; },
    refrescar,
    reloj,
    textoCancelacion,
    linkTexto,
};
