// Clases v5 · navegación + funcionamiento (auto-marcado, Cancelar clase, WhatsApp)
// La estética vive en tokens.css/propuesta.css; acá solo se cambian estados,
// textos y el flujo de cancelación. Sin emoji: solo SVG de icons.js.
import {
  horaClase, type Clase,
} from './src/clases.ts';
import { CLAVE_ESTADO, RepositorioClases, almacenLocalStorage, type RepositorioDeClases } from './src/repositorio.ts';
import { alumnosCobrosDemo, datosDemo } from './src/demo.ts';
import { resumenCobros, type Pago } from './src/cobros.ts';
import { resumenHoy, clasesDelDia, clasesDeLaSemana } from './src/resumen.ts';
import { diaCorto, diaLargo, etiquetaDia, etiquetaMes, sumarDias, parseFecha } from './src/fechas.ts';
import { relojDelDispositivo, hoyLocal, type Reloj } from './src/reloj.ts';
import {
  textoCancelacion, destinos, resumenEnvio, linkTexto, type Destino,
} from './src/whatsapp.ts';

/* ------------------------------------------------- estado persistente (local) */
const reloj: Reloj = relojDelDispositivo();
/** Quién opera la app hoy: único dueño. En Fase 4 sale de la sesión. */
const QUIEN = 'dueño';

// Un solo repositorio: siembra la demo anclada a hoy la primera vez y desde
// ahí todo comando se guarda en localStorage (un refresh no pierde nada).
const repo: RepositorioDeClases = new RepositorioClases(almacenLocalStorage(), reloj, datosDemo);
let clases: Clase[];

/* ------------------------------------------------------------------- helpers */
const $ = (sel: string) => document.querySelector(sel);
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

const toast = $('#toast') as HTMLElement;
let tm: ReturnType<typeof setTimeout> | undefined;
function avisar(txt: string, ms = 2200) {
  toast.textContent = txt;
  toast.classList.add('ver');
  clearTimeout(tm);
  tm = setTimeout(() => toast.classList.remove('ver'), ms);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c] as string);
}

/** Chip de estado de una clase (SVG, sin emoji). */
function chipEstado(c: Clase): string {
  if (c.estado === 'dada') {
    // Punto 2: el chip "Dada" es tocable → abre Cancelar / Cambiar de día.
    return '<button class="chip chip-dada chip-boton" type="button" data-acciones="' + c.id + '" aria-label="Opciones para la clase ' + c.nombre + ', dada"><svg class="ico" width="13" height="13"><use href="#i-check"/></svg>Dada</button>';
  }
  if (c.estado === 'cancelada') {
    return '<span class="chip chip-cancelada"><svg class="ico" width="13" height="13"><use href="#i-alerta"/></svg>Cancelada</span>';
  }
  return '<span class="chip chip-por chip-por-dar">Por dar</span>';
}

/** Acción de una fila de clase: Cancelar clase (reemplaza a "Marcar dada").
 *  Ronda 2 (b): en clases DADAS no se muestra "Cancelar clase" en la tarjeta —
 *  el chip "Dada" abre el sheet que ya incluye Cancelar / Cambiar de día —
 *  para que el botón no tape el nombre de la clase. */
function accionClase(c: Clase): string {
  if (c.estado === 'cancelada') {
    return `<button class="marcar marcar-reversa" type="button" data-reversa="${c.id}">Revertir</button>`;
  }
  if (c.estado === 'dada') {
    return '';
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
  if (fechaEl) fechaEl.textContent = etiquetaDia(hoy).replace(/^./, (m) => m.toUpperCase());
  if (fraseEl) fraseEl.textContent = r.frase;

  const [dadas, total] = r.anillo;
  const circ = 2 * Math.PI * 38; // 238.76
  const anilloValor = $('.anillo-valor') as SVGElement | null;
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
      anilloValor.animate(
        [{ strokeDashoffset: String(circ) }, { strokeDashoffset: String(circ * (1 - fraccion)) }],
        // `fill: 'both'`: al terminar queda el estado real (igual que el estilo
        // inline) y la animación se puede inspeccionar después en QA.
        { duration: 900, delay: 260, easing: 'cubic-bezier(.22,.9,.36,1.02)', fill: 'both' },
      );
      anilloArranque = false;
    } else {
      anilloValor.style.animation = 'none';
    }
  }
  const anilloTexto = $('.anillo-texto');
  if (anilloTexto) anilloTexto.innerHTML = `<strong>${dadas}</strong><span>/ ${total}</span>`;

  const grupos = $('.hero-grupos');
  if (grupos) {
    if (r.clases.length === 0) {
      grupos.innerHTML = '<p class="grupo-vacio">Sin clases grupales hoy</p>';
    } else {
      grupos.innerHTML = r.clases
        .map(
          (c) => `<div class="grupo">
            <span class="grupo-hora">${horaClase(c)}</span>
            <span class="grupo-nombre">${esc(c.nombre)}</span>
            ${chipEstado(c)}
          </div>`,
        )
        .join('');
    }
    // Punto 2: los chips "Dada" del hero también abren las opciones.
    grupos.querySelectorAll('[data-acciones]').forEach((b) => {
      b.addEventListener('click', () => abrirAcciones((b as HTMLElement).dataset.acciones as string));
    });
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
        const f = (b as HTMLElement).dataset.fecha as string;
        pintarLinea(f);
        const tiene = clases.some((c) => c.fecha === f);
        if (!tiene) avisar('Sin clases grupales ese día');
      });
    });
  }

  pintarLinea(hoy);
  const h2 = $('#v-semana .agenda-titulo h2');
  if (h2) h2.textContent = 'Esta semana';
  const link = $('#v-semana .link-suave .link-txt');
  if (link) link.textContent = 'Ver mes';
}

/** Lunes de la semana que contiene `f` (o la semana de hoy). */
function semanaActual(f: string): string {
  const idx = (new Date(`${f}T12:00:00Z`).getUTCDay() + 6) % 7;
  return sumarDias(f, -idx);
}

/** La tira y la línea se pintan con la semana de hoy; elegir un día solo cambia la línea. */
function pintarLineaSolo(dia: string) {
  $$('.tira-dia').forEach((o) => o.classList.toggle('activo', o.getAttribute('data-fecha') === dia));
  pintarLinea(dia);
  const tiene = clases.some((c) => c.fecha === dia);
  if (!tiene) avisar('Sin clases grupales ese día');
}

function pintarLinea(fecha: string | null) {
  const cont = $('.linea');
  if (!cont) return;
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
      .map(
        (c) => `<article class="clase${c.estado === 'dada' ? ' hecha' : ''}${c.estado === 'cancelada' ? ' cancelada' : ''}${c.estado === 'programada' ? ' por-dar' : ''}" data-clase="${c.id}">
          <div class="clase-hora"><b>${horaClase(c)}</b><span>${c.duracionMin} min</span></div>
          <div class="clase-datos">
            <p class="clase-nombre">${esc(c.nombre)}</p>
            <p class="clase-sub">${c.alumnos.length} alumnos inscriptos${c.estado === 'cancelada' && c.cancelacion ? ` · ${esc(c.cancelacion.motivo)}` : ''}</p>
          </div>
          ${chipEstado(c)}
          ${accionClase(c)}
        </article>`,
      )
      .join('')}
  </li>`;

  cont.querySelectorAll('[data-acciones]').forEach((b) => {
    b.addEventListener('click', () => abrirAcciones((b as HTMLElement).dataset.acciones as string));
  });
  cont.querySelectorAll('[data-cancelar]').forEach((b) => {
    b.addEventListener('click', () => abrirCancelacion((b as HTMLElement).dataset.cancelar as string));
  });
  cont.querySelectorAll('[data-reversa]').forEach((b) => {
    b.addEventListener('click', () => revertirCancelacion((b as HTMLElement).dataset.reversa as string));
  });
}

/* ------------------------------------------------------- vista mes (puntos) */
function pintarMes() {
  const hoy = hoyLocal(reloj.ahora());
  const { y, m } = parseFecha(hoy);
  const h2 = $('#v-mes .agenda-titulo h2');
  if (h2) h2.textContent = etiquetaMes(hoy);

  const cont = $('#v-mes .mes');
  if (!cont) return;
  const primerDia = `${y}-${String(m).padStart(2, '0')}-01`;
  const dowLunes = (new Date(`${primerDia}T12:00:00Z`).getUTCDay() + 6) % 7;
  const diasMes = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const celdas: string[] = [];
  for (let i = 0; i < dowLunes; i++) celdas.push('<button class="mes-dia vacio" type="button" disabled></button>');
  for (let d = 1; d <= diasMes; d++) {
    const f = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const delDia = clases.filter((c) => c.fecha === f);
    let claseEstado = '';
    if (delDia.length > 0) {
      if (delDia.some((c) => c.estado === 'cancelada')) claseEstado = ' tiene-cancelada';
      else if (delDia.every((c) => c.estado === 'dada')) claseEstado = ' todas-dadas';
    }
    const tiene = delDia.length > 0 ? ' tiene' : '';
    const activo = f === hoy ? ' activo' : '';
    celdas.push(`<button class="mes-dia${tiene}${claseEstado}${activo}" type="button" data-fecha="${f}" aria-label="${d} de ${etiquetaMes(hoy)}${tiene ? ', con clases' : ''}">${d}</button>`);
  }
  cont.innerHTML = celdas.join('');
  // Punto 4: referencias coloridas sobrias, acordes a los tokens v5.
  const leyenda = document.createElement('div');
  leyenda.className = 'mes-leyenda';
  leyenda.innerHTML = '<span><i class="ley-dada"></i>Dada</span><span><i class="ley-prog"></i>Por dar</span><span><i class="ley-canc"></i>Cancelada</span>';
  cont.parentElement?.appendChild(leyenda);
  cont.querySelectorAll('.mes-dia:not(.vacio)').forEach((b) => {
    b.addEventListener('click', () => {
      const f = (b as HTMLElement).dataset.fecha as string;
      irA('v-semana');
      pintarLineaSolo(f);
    });
  });
}

/* ------------------------------------------- cancelar clase (sheet + WhatsApp) */
let sheet: HTMLElement | null = null;
let claseEnSheet: Clase | null = null;
let modoEnvio: 'masivo' | 'individual' | 'ninguno' = 'masivo';
let elegidos = new Set<string>();
let textoEnviado = '';

function cerrarSheet() {
  if (!sheet) return;
  sheet.classList.add('cerrando');
  const s = sheet;
  sheet = null;
  claseEnSheet = null;
  setTimeout(() => s.remove(), 240);
}

/** Punto 2: sheet con opciones sobre una clase ya Dada. */
function abrirAcciones(id: string) {
  const c = clases.find((x) => x.id === id);
  if (!c || (c.estado !== 'dada' && c.estado !== 'cancelada')) return;
  cerrarSheet();
  const previo = document.createElement('div');
  previo.className = 'sheet';
  previo.setAttribute('role', 'dialog');
  previo.setAttribute('aria-modal', 'true');
  previo.setAttribute('aria-label', `Opciones para ${c.nombre}`);
  const proximos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  previo.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="sheet-eyebrow">${esc(etiquetaDia(c.fecha))} · ${horaClase(c)}</p>
        <h3>${c.estado === 'cancelada' ? 'Clase cancelada' : 'Clase dada'}</h3>
      </div>
      <button class="sheet-cerrar" type="button" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button>
    </div>
    <p class="sheet-clase"><strong>${esc(c.nombre)}</strong> · ${c.alumnos.length} alumnos</p>
    <div class="acciones-clase">
      <button class="accion-clase" type="button" data-acc="cancelar">
        <svg class="ico" width="19" height="19"><use href="#i-alerta"/></svg>
        <span><b>Cancelar clase</b><small>Avisar por WhatsApp (opcional)</small></span>
      </button>
      <button class="accion-clase" type="button" data-acc="cambiar">
        <svg class="ico" width="19" height="19"><use href="#i-agenda"/></svg>
        <span><b>Cambiar de día</b><small>Reprogramar la clase</small></span>
      </button>
    </div>
    <div class="cambiar-dia" hidden>
      <p class="sheet-paso">Elegí el nuevo día</p>
      <div class="dias-elegir">
        ${proximos.map((nombre, i) => `<button class="dia-elegir" type="button" data-dia="${i}">${nombre.slice(0, 3)}</button>`).join('')}
      </div>
    </div>
    <div class="sheet-acciones">
      <button class="btn-secundario" type="button" data-accion="volver">Volver</button>
    </div>`;
  document.querySelector('.cel')?.appendChild(previo);
  sheet = previo;
  previo.querySelector('.sheet-cerrar')?.addEventListener('click', cerrarSheet);
  previo.querySelector('[data-accion="volver"]')?.addEventListener('click', cerrarSheet);
  previo.querySelector('[data-acc="cancelar"]')?.addEventListener('click', () => abrirCancelacion(id));
  const caja = previo.querySelector('.cambiar-dia') as HTMLElement;
  previo.querySelector('[data-acc="cambiar"]')?.addEventListener('click', () => { caja.hidden = false; });
  caja.querySelectorAll('[data-dia]').forEach((b) => {
    b.addEventListener('click', () => {
      const idx = Number((b as HTMLElement).dataset.dia);
      // Próxima aparición de ese día de semana (lunes=0), estrictamente después de la fecha actual.
      const base = sumarDias(c.fecha, 1);
      const delta = ((idx - ((new Date(`${base}T12:00:00Z`).getUTCDay() + 6) % 7) + 7) % 7);
      const nuevaFecha = sumarDias(base, delta);
      repo.reprogramar(id, nuevaFecha, { quien: QUIEN, ahora: reloj.ahora() });
      clases = repo.listar();
      cerrarSheet();
      refrescar();
      avisar(`Clase movida al ${esc(etiquetaDia(nuevaFecha))} · ${horaClase(c)}`);
    });
  });
}

function abrirCancelacion(id: string) {
  const c = clases.find((x) => x.id === id);
  if (!c) return;
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
      <span>Motivo (opcional)</span>
      <input type="text" id="canc-motivo" placeholder="Ej.: lluvia, enfermedad — podés dejarlo vacío" autocomplete="off">
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
          .map(
            (a) => `<li>
              <label>
                <input type="checkbox" value="${a.id}">
                <span class="avatar">${esc(a.nombre.slice(0, 2).toUpperCase())}</span>
                <span class="al-nombre">${esc(a.nombre)}</span>
              </label>
            </li>`,
          )
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
      modoEnvio = ((btn as HTMLElement).dataset.modo as 'masivo' | 'individual' | 'ninguno') ?? 'masivo';
      previo.querySelectorAll('.opcion').forEach((o) => o.classList.toggle('activa', o === btn));
      const bloqueTexto = previo.querySelector('.bloque-texto') as HTMLElement | null;
      const bloqueAlumnos = previo.querySelector('.bloque-alumnos') as HTMLElement | null;
      if (bloqueTexto) bloqueTexto.hidden = modoEnvio !== 'masivo';
      if (bloqueAlumnos) bloqueAlumnos.hidden = modoEnvio !== 'individual';
    });
  });

  const ta = previo.querySelector('#canc-texto') as HTMLTextAreaElement | null;
  ta?.addEventListener('input', () => { textoEnviado = ta.value; });

  previo.querySelector('[data-accion="confirmar"]')?.addEventListener('click', () => {
    // Punto 3: el motivo es opcional. Si no se completa, la auditoría registra
    // "sin motivo" (ver confirmarCancelacion).
    const motivo = (previo.querySelector('#canc-motivo') as HTMLInputElement).value.trim();
    if (modoEnvio === 'individual' && elegidos.size === 0) {
      avisar('Elegí al menos un alumno o elegí “No enviar ahora”');
      return;
    }
    confirmarCancelacion(c, motivo);
  });

  previo.querySelectorAll('.lista-elegir input').forEach((input) => {
    input.addEventListener('change', () => {
      const idAlumno = (input as HTMLInputElement).value;
      if ((input as HTMLInputElement).checked) elegidos.add(idAlumno);
      else elegidos.delete(idAlumno);
    });
  });

  (previo.querySelector('#canc-motivo') as HTMLInputElement).focus();
}

function confirmarCancelacion(c: Clase, motivo: string) {
  const ahora = reloj.ahora();
  const cancelada = repo.cancelar(c.id, { motivo: motivo || 'sin motivo', quien: QUIEN, ahora });

  let lista: Destino[] = [];
  let texto = textoEnviado;
  if (modoEnvio === 'masivo') {
    lista = destinos(cancelada, 'masivo', [], texto);
  } else if (modoEnvio === 'individual') {
    const elegidosLista = cancelada.alumnos.filter((a) => elegidos.has(a.id));
    lista = destinos(cancelada, 'individual', elegidosLista, texto);
  }

  const anterior = c.estado;
  const canal = modoEnvio === 'masivo' && lista.length > 0
    ? 'masivo'
    : modoEnvio === 'individual' && lista.length > 0
      ? 'individual'
      : 'ninguno';
  repo.registrarMensajeEnviado(cancelada.id, canal);
  clases = repo.listar();
  cerrarSheet();
  refrescar();

  // Cada cancelación arranca su propio aviso: nunca quedan enlaces de una
  // cancelación anterior ("No enviar ahora" deja 0 pendientes).
  delete toast.dataset.pendientes;

  if (lista.length > 0) {
    // Envío manual: el dueño confirma cada envío en WhatsApp (nunca automático).
    const primero = lista[0];
    window.open(primero.link, '_blank', 'noopener');
    avisar(
      `${resumenEnvio(cancelada, modoEnvio === 'individual' ? 'individual' : 'masivo', lista.length)}${lista.length > 1 ? ` · quedan ${lista.length - 1} para abrir` : ''} · Deshacer`,
      6000,
    );
    if (lista.length > 1) {
      toast.dataset.pendientes = JSON.stringify(lista.slice(1).map((d) => d.link));
    }
  } else {
    avisar(`Clase cancelada (${anterior === 'dada' ? 'estaba dada' : 'programada'}) · Deshacer`, 6000);
  }
  toast.dataset.deshacer = '1';
  toast.dataset.clase = c.id;
}

function revertirCancelacion(id: string): boolean {
  const c = clases.find((x) => x.id === id);
  if (!c) return false;
  // El toast es reutilizable: si algo falla, se limpia igual para que no
  // quede un "Deshacer" que vuelve a lanzar el mismo error.
  try {
    repo.revertir(id, { motivo: 'error del dueño', quien: QUIEN, ahora: reloj.ahora() });
    clases = repo.listar();
  } catch (e) {
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
  const pendientes = JSON.parse(toast.dataset.pendientes || '[]') as string[];
  if (pendientes.length > 0) {
    const siguiente = pendientes.shift() as string;
    window.open(siguiente, '_blank', 'noopener');
    toast.dataset.pendientes = JSON.stringify(pendientes);
    avisar(pendientes.length > 0 ? `Quedan ${pendientes.length} mensajes` : 'Último mensaje abierto', 2500);
  }
});

/* ------------------------------------------------------- alumnos (filtros) */
type AlumnoFicha = {
  ini: string; nom: string; gr: string; vence: number;
  tipo: 'mensual' | 'individual'; alta: number; color: string;
};
const ALUMNOS_FICHA: AlumnoFicha[] = [
  { ini: 'CT', nom: 'Carla T.',    gr: 'Martes A',  vence: 0,   tipo: 'mensual',    alta: 3, color: 'avatar' },
  { ini: 'BS', nom: 'Bruno S.',    gr: 'Martes A',  vence: 0,   tipo: 'mensual',    alta: 5, color: 'avatar-2' },
  { ini: 'JP', nom: 'Julieta P.',  gr: 'Martes B',  vence: -1,  tipo: 'individual', alta: 8, color: 'avatar-3' },
  { ini: 'MR', nom: 'Martín R.',   gr: 'Viernes',   vence: 12,  tipo: 'mensual',    alta: 1, color: 'avatar-4' },
  { ini: 'LC', nom: 'Lucía C.',    gr: 'Martes B',  vence: 20,  tipo: 'individual', alta: 7, color: 'avatar-5' },
  { ini: 'DG', nom: 'Diego G.',    gr: 'Viernes',   vence: 3,   tipo: 'mensual',    alta: 2, color: 'avatar-6' },
  { ini: 'AF', nom: 'Ana F.',      gr: 'Lunes',     vence: -1,  tipo: 'individual', alta: 9, color: 'avatar' },
  { ini: 'SN', nom: 'Sofía N.',    gr: 'Sábado',    vence: 15,  tipo: 'mensual',    alta: 4, color: 'avatar-3' },
  { ini: 'EL', nom: 'Ezequiel L.', gr: 'Lunes',     vence: 6,   tipo: 'individual', alta: 6, color: 'avatar-4' },
];
type OrdenAlumnos = 'ninguno' | 'az' | 'za' | 'recientes' | 'vence';
let ordenAlumnos: OrdenAlumnos = 'ninguno';
const filtrosAlumnos = new Set<string>();
let busquedaAlumno = '';

function alumnoSub(a: AlumnoFicha): string {
  const v = a.vence < 0 ? 'vencido' : a.vence === 0 ? 'vence hoy' : `vence en ${a.vence} días`;
  const et = a.tipo === 'mensual' ? 'et-mensual' : 'et-individual';
  return `<p class="al-sub">${esc(a.gr)} · ${v} <span class="etiqueta ${et}">${a.tipo === 'mensual' ? 'Mensual' : 'Individual'}</span></p><span class="al-fecha">Alta hace ${a.alta} días</span>`;
}

function pintarChipsAlumnos(): void {
  $$('#filtros-alumnos [data-orden]').forEach((b) => {
    const on = (b as HTMLElement).dataset.orden === ordenAlumnos;
    b.classList.toggle('activo', on);
    b.setAttribute('aria-pressed', String(on));
  });
  $$('#filtros-alumnos [data-filtro]').forEach((b) => {
    const on = filtrosAlumnos.has((b as HTMLElement).dataset.filtro as string);
    b.classList.toggle('activo', on);
    b.setAttribute('aria-pressed', String(on));
  });
  const todos = ordenAlumnos === 'ninguno' && filtrosAlumnos.size === 0 && !busquedaAlumno.trim();
  const bTodos = $('#filtros-alumnos [data-todos]');
  bTodos?.classList.toggle('activo', todos);
  bTodos?.setAttribute('aria-pressed', String(todos));
}

function pintarAlumnos(): void {
  const lista = $('#lista-alumnos');
  const conteo = $('#v-alumnos .conteo');
  if (!lista) return;
  const out = ALUMNOS_FICHA.filter((a) => {
    if (busquedaAlumno && a.nom.toLowerCase().indexOf(busquedaAlumno) < 0) return false;
    if (filtrosAlumnos.has('mensual') && a.tipo !== 'mensual') return false;
    if (filtrosAlumnos.has('individual') && a.tipo !== 'individual') return false;
    if (filtrosAlumnos.has('aldia') && a.vence <= 0) return false;
    return true;
  });
  const cmp: Record<Exclude<OrdenAlumnos, 'ninguno'>, (a: AlumnoFicha, b: AlumnoFicha) => number> = {
    az: (a, b) => a.nom.localeCompare(b.nom),
    za: (a, b) => b.nom.localeCompare(a.nom),
    recientes: (a, b) => a.alta - b.alta,
    vence: (a, b) => a.vence - b.vence,
  };
  if (ordenAlumnos !== 'ninguno') out.sort(cmp[ordenAlumnos]);
  if (conteo) conteo.textContent = `${out.length} ${out.length === 1 ? 'alumno' : 'alumnos'}`;
  lista.innerHTML = out.length
    ? out.map((a) => {
        const punto = a.vence < 0 || a.vence === 0 ? 'punto-rosa' : a.vence <= 3 ? 'punto-ambar' : 'punto-verde';
        return `<li><span class="avatar ${a.color}">${a.ini}</span><div><p class="al-nombre">${esc(a.nom)}</p>${alumnoSub(a)}</div><span class="punto ${punto}"></span></li>`;
      }).join('')
    : '<p class="pv-vacio">Ningún alumno con estos filtros</p>';
  pintarChipsAlumnos();
}

$('#filtros-alumnos')?.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('.f-chip') as HTMLElement | null;
  if (!b) return;
  if (b.hasAttribute('data-todos')) {
    ordenAlumnos = 'ninguno';
    filtrosAlumnos.clear();
    busquedaAlumno = '';
    const input = $('#buscar-alumno') as HTMLInputElement | null;
    if (input) input.value = '';
  } else if (b.dataset.orden) {
    const o = b.dataset.orden as OrdenAlumnos;
    ordenAlumnos = ordenAlumnos === o ? 'ninguno' : o;
  } else if (b.dataset.filtro) {
    const f = b.dataset.filtro;
    if (filtrosAlumnos.has(f)) filtrosAlumnos.delete(f);
    else filtrosAlumnos.add(f);
  }
  pintarAlumnos();
});
$('#buscar-alumno')?.addEventListener('input', (e) => {
  busquedaAlumno = (e.target as HTMLInputElement).value.toLowerCase();
  pintarAlumnos();
});

/* ------------------------------------------------------------- cobros */
const formatoUYU = new Intl.NumberFormat('es-UY', { useGrouping: 'always' });
const uyu = (monto: number) => `$${formatoUYU.format(monto)}`;
const listaCobros = document.querySelector<HTMLUListElement>('#lista-cobros')!;
const historialCobros = document.querySelector<HTMLUListElement>('#historial-cobros')!;
const campana = document.querySelector<HTMLButtonElement>('.campana')!;
const verCobros = (pagos = repo.listarPagos()) => resumenCobros(alumnosCobrosDemo, pagos, hoyLocal(reloj.ahora()));
type FilaCobro = ReturnType<typeof verCobros>['filas'][number];

function textoVence(dias: number) {
  if (dias === 0) return 'Vence hoy';
  const n = Math.abs(dias);
  return `${dias < 0 ? 'Venció hace' : 'Vence en'} ${n} ${n === 1 ? 'día' : 'días'}`;
}

function pintarCobros() {
  const pagos = repo.listarPagos();
  const r = verCobros(pagos);
  const kpis: Record<string, string> = {
    '#v-hoy .kpi-cobrado': uyu(r.cobradoHoy), '#v-hoy .kpi-por': uyu(r.porCobrar),
    '#v-hoy .kpi-vencen': String(r.vencenHoy.length), '#v-cobros .kpi-cobrado': uyu(r.cobradoMes),
    '#v-cobros .kpi-vencen': String(r.vencenHoy.length),
  };
  for (const [selector, valor] of Object.entries(kpis)) $(`${selector} .kpi-valor`)!.textContent = valor;
  $('#v-cobros .conteo')!.textContent = etiquetaMes(`${r.periodo}-01`).replace(/^./, (letra) => letra.toUpperCase());
  const n = r.vencenHoy.length;
  $('#v-hoy .aviso strong')!.textContent = n === 1 ? '1 mensualidad vence hoy' : `${n} mensualidades vencen hoy`;
  $('#v-hoy .aviso-sub')!.textContent = n
    ? `${new Intl.ListFormat('es-UY').format(r.vencenHoy.map((f) => f.alumno.nombre))} · Ver en Cobros`
    : 'No hay vencimientos para hoy';
  const avisos = r.avisos.length;
  campana.setAttribute('aria-label', avisos === 1 ? '1 aviso de cobro' : `${avisos} avisos de cobro`);
  campana.querySelector<HTMLElement>('.campana-punto')!.hidden = avisos === 0;

  listaCobros.innerHTML = r.filas.map((f, indice) => `<li>
    <div><p class="al-nombre">${esc(f.alumno.nombre)}</p>
    <p class="al-sub">${f.pago ? `Pagado el ${esc(f.pago.fecha)}` : textoVence(f.dias)} · ${esc(f.alumno.grupo)}</p></div>
    <strong class="monto ${f.pago ? 'monto-ok' : f.dias > 0 ? 'monto-suave' : ''}">${uyu(f.pago?.montoUYU ?? f.alumno.montoUYU)}</strong>
    <button type="button" class="marcar" data-fila="${indice}" aria-label="${f.pago ? 'Anular pago' : 'Registrar pago'} de ${esc(f.alumno.nombre)}, ${f.periodo}">${f.pago ? 'Anular' : 'Registrar'}</button>
  </li>`).join('');
  listaCobros.querySelectorAll<HTMLButtonElement>('[data-fila]').forEach((b, i) => {
    const fila = r.filas[i];
    b.addEventListener('click', () => abrirPago(fila.alumno.nombre, fila.periodo, fila.alumno.montoUYU, b, fila.pago, fila));
  });

  const visibles = new Set(r.filas.map((f) => f.pago?.id));
  const historial = pagos.filter((p) => !visibles.has(p.id)).reverse();
  historialCobros.innerHTML = historial.length ? historial.map((p) => {
    const nombre = alumnosCobrosDemo.find((a) => a.id === p.alumnoId)?.nombre ?? p.alumnoId;
    const estado = p.anulado ? `Anulado el ${esc(p.anulado.fecha)} por ${esc(p.anulado.quien)} · ${esc(p.anulado.motivo)}` : 'Pagado';
    return `<li><div><p class="al-nombre">${esc(nombre)} · ${uyu(p.montoUYU)}</p>
      <p class="al-sub">${esc(p.periodo)} · Registrado el ${esc(p.fecha)} por ${esc(p.quien)}</p>
      <p class="al-sub">${estado}</p></div>${p.anulado ? '' : `<button class="marcar" type="button" data-pago="${esc(p.id)}" aria-label="Anular pago de ${esc(nombre)}, ${esc(p.periodo)}">Anular</button>`}</li>`;
  }).join('') : '<li><p class="al-sub">Sin otros pagos registrados</p></li>';
  historialCobros.querySelectorAll<HTMLButtonElement>('[data-pago]').forEach((b) => b.addEventListener('click', () => {
    const pago = historial.find((p) => p.id === b.dataset.pago)!;
    abrirPago(alumnosCobrosDemo.find((a) => a.id === pago.alumnoId)?.nombre ?? pago.alumnoId, pago.periodo, pago.montoUYU, b, pago);
  }));
}

function abrirDialogoCobros(titulo: string, contenido: string, origen: HTMLElement) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'sheet';
  // Neutraliza la caja del navegador; el color de fondo, radio y animación los aporta .sheet.
  dialogo.style.cssText = 'position:fixed;inset:auto 0 0;width:100%;max-width:min(390px,100%);margin:0 auto;border-inline:0;border-bottom:0;color:inherit';
  dialogo.setAttribute('aria-label', titulo);
  dialogo.innerHTML = `<div class="sheet-head"><h3>${titulo}</h3>
    <button type="button" class="sheet-cerrar" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button></div>${contenido}`;
  dialogo.querySelector('.sheet-cerrar')!.addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('close', () => { dialogo.remove(); if (origen.isConnected) origen.focus(); });
  $('.cel')!.appendChild(dialogo);
  dialogo.showModal();
  return dialogo;
}

function abrirPago(nombre: string, periodo: string, monto: number, origen: HTMLButtonElement, pago?: Pago, fila?: FilaCobro) {
  const accion = pago ? 'Anular pago' : 'Registrar pago';
  const dialogo = abrirDialogoCobros(accion, `<p class="sheet-clase"><strong>${esc(nombre)}</strong> · ${esc(periodo)} · ${uyu(pago?.montoUYU ?? monto)} UYU</p>
    ${pago ? `<p class="sheet-clase">Registrado el ${esc(pago.fecha)} por ${esc(pago.quien)}. La anulación queda en el historial.</p>` : '<p class="sheet-clase">Confirmá que ya recibiste el pago. La app no mueve dinero.</p>'}
    <form>${pago ? '<label class="campo"><span>Motivo de anulación</span><input name="motivo" required maxlength="160"></label>' : ''}
      <p class="sheet-clase" role="alert"></p>
      <div class="sheet-acciones"><button type="button" class="btn-secundario">Volver</button>
      <button type="submit" class="btn-primario">${pago ? 'Confirmar anulación' : 'Confirmar pago'}</button></div>
    </form>`, origen);
  const form = dialogo.querySelector('form')!;
  form.querySelector('.btn-secundario')!.addEventListener('click', () => dialogo.close());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!dialogo.open) return;
    try {
      if (pago) repo.anularPago(pago.id, String(new FormData(form).get('motivo') ?? ''), QUIEN);
      else if (fila) {
        const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => n.toString(16).padStart(8, '0')).join('');
        repo.registrarPago({ id, alumnoId: fila.alumno.id, periodo, montoUYU: monto, quien: QUIEN });
      }
    } catch (error) {
      form.querySelector('[role="alert"]')!.textContent = error instanceof Error ? error.message : 'No se pudo guardar';
      return;
    }
    dialogo.close();
    pintarCobros();
    if (origen.dataset.fila) listaCobros.querySelector<HTMLButtonElement>(`[data-fila="${origen.dataset.fila}"]`)?.focus();
    else document.querySelector<HTMLElement>('#detalle-cobros > summary')?.focus();
  });
}

campana.addEventListener('click', () => {
  const { avisos } = verCobros();
  abrirDialogoCobros('Avisos de cobro', avisos.length ? `<ul class="lista-cobros">${avisos.map((f) => `<li>
    <div><p class="al-nombre">${esc(f.alumno.nombre)}</p><p class="al-sub">${textoVence(f.dias)} · ${esc(f.alumno.grupo)}</p></div>
    <strong class="monto ${f.dias > 0 ? 'monto-suave' : ''}">${uyu(f.alumno.montoUYU)}</strong></li>`).join('')}</ul>`
    : '<p class="sheet-clase">No hay avisos de vencimientos.</p>', campana);
});

/* ------------------------------------------------------------- navegación */
const tabs = $$('.tab') as HTMLElement[];
const vistas = $$('.vista') as HTMLElement[];
const titulos: Record<string, string> = {
  'v-hoy': 'Hoy', 'v-semana': 'Clases', 'v-mes': 'Agenda', 'v-alumnos': 'Alumnos', 'v-cobros': 'Cobros',
};

function pintarTitulo(id: string) {
  const h1 = $('.barra-titulo');
  if (h1) h1.textContent = titulos[id] || 'Hoy';
}

function irA(id: string) {
  const destino = document.getElementById(id);
  if (!destino) return;
  vistas.forEach((v) => { if (v !== destino) v.classList.remove('activa'); });
  void destino.offsetWidth;
  destino.classList.add('activa');
  const pestaña = id === 'v-mes' ? 'v-semana' : id;
  tabs.forEach((t) => {
    const on = t.getAttribute('href') === '#' + pestaña;
    t.classList.toggle('activo', on);
    if (on) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
  pintarTitulo(id);
  if (history.replaceState) history.replaceState(null, '', '#' + id);
}

tabs.forEach((t) => t.addEventListener('click', (e) => {
  e.preventDefault();
  irA((t.getAttribute('href') as string).slice(1));
}));

$$('.link-suave').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  irA((a.getAttribute('href') as string).slice(1));
}));

$('.fab')?.addEventListener('click', () => avisar('Agendar: nueva clase (próximamente)'));
window.addEventListener('storage', (e) => { if (e.key === CLAVE_ESTADO) pintarCobros(); });

/* --------------------------------------------------------------- arranque */
function refrescar() {
  pintarSemana();
  pintarHoy();
  pintarMes();
  pintarAlumnos();
}

// Re-alineado al abrir: las clases cuya hora pasó quedan Dadas (y se guarda).
clases = repo.reconciliar();
refrescar();
pintarCobros();
let diaCobros = hoyLocal(reloj.ahora());

// El cron local avanza solo mientras la app está abierta (plan §2.1).
setInterval(() => {
  const hoy = hoyLocal(reloj.ahora());
  if (hoy !== diaCobros) {
    diaCobros = hoy;
    pintarCobros();
  }
  const antes = clases.map((c) => c.estado).join(',');
  clases = repo.reconciliar();
  if (clases.map((c) => c.estado).join(',') !== antes) {
    refrescar();
    avisar('Se marcaron clases dadas por la hora');
  }
}, 30000);

const inicial = location.hash.slice(1);
if (inicial && document.getElementById(inicial)) irA(inicial);
else pintarTitulo('v-hoy');

// Exposición mínima para QA (consola / capturas): sin tocar el estado real.
(window as unknown as Record<string, unknown>).ximeV5 = {
  get clases() { return structuredClone(clases); },
  refrescar,
  reloj,
  textoCancelacion,
  linkTexto,
};
