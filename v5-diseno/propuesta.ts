// Clases v5 · navegación + funcionamiento (auto-marcado, Cancelar clase, WhatsApp)
// La estética vive en tokens.css/propuesta.css; acá solo se cambian estados,
// textos y el flujo de cancelación. Sin emoji: solo SVG de icons.js.
import {
  horaClase, type Clase,
} from './src/clases.ts';
import type { DiaSemana } from './src/agendar.ts';
import { CLAVE_ESTADO, RepositorioClases, almacenLocalStorage, type RepositorioDeClases } from './src/repositorio.ts';
import { alumnosCobrosDemo, datosDemo, fichasDemo } from './src/demo.ts';
import { resumenCobros, type Pago } from './src/cobros.ts';
import { resumenHoy, clasesDelDia, clasesDeLaSemana } from './src/resumen.ts';
import { registrarToqueFecha, mesDe, type ToqueFecha } from './src/agenda.ts';
import { primerDiaDeMes, diaSeleccionadoAlCargar } from './src/agenda-mes.ts';
import { destinoDeEnlace, vistaInicial, vistasActivas } from './src/navegacion.ts';
import { pistaDeTira } from './src/scroll-pista.ts';
import {
  actualizarBarra, estadoBarraInicial, debeReaparecerPorQuietud,
  REAPARECER_TRAS_MS, type EstadoBarra,
} from './src/barra-scroll.ts';
import {
  ajustarLock, debeBloquearScroll, estiloSheet, debeCerrarPorToqueFuera, esToqueFuera,
  debeSuprimirClickTrasCierre, type PuntoToque,
} from './src/sheets.ts';
import {
  diaCorto, mesCorto, etiquetaDia, etiquetaDiaCompleta, etiquetaDiaCorta, etiquetaMes,
  fechaCorta, sumarDias, parseFecha, lunesDe, diasDelMes, esFechaValida,
} from './src/fechas.ts';
import { relojDelDispositivo, hoyLocal, type Reloj } from './src/reloj.ts';
import { CLAVE_PREFIJO, PREFIJO_POR_DEFECTO, prefijoEsValido, prefijoSeguro, conPrefijo } from './src/prefijo.ts';
import { bloqueContacto } from './src/contacto.ts';
import {
  textoCancelacion, destinos, resumenEnvio, linkTexto, linkAvisoVencimiento, type Destino,
} from './src/whatsapp.ts';

/* ------------------------------------------------- estado persistente (local) */
const reloj: Reloj = relojDelDispositivo();
/** Quién opera la app hoy: único dueño. En Fase 4 sale de la sesión. */
const QUIEN = 'dueño';

// Un solo repositorio: siembra la demo anclada a hoy la primera vez y desde
// ahí todo comando se guarda en localStorage (un refresh no pierde nada).
const repo: RepositorioDeClases = new RepositorioClases(almacenLocalStorage(), reloj, datosDemo, fichasDemo);
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
  // Ancla de foco: los avisos marcan dónde quedó el foco al cerrar un sheet,
  // sin robarlo si el usuario ya está navegando (tabindex="-1", sin focus()).
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '<', '>': '>', '"': '&quot;', '\'': '&#39;' })[c] as string);
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
  return '<button class="chip chip-por chip-por-dar chip-boton" type="button" data-acciones="' + c.id + '" aria-label="Opciones para la clase ' + esc(c.nombre) + ', por dar">Por dar</button>';
}

/**
 * Punto 1: desplegable informativo de alumnos en cada tarjeta de clase.
 * Solo muestra QUIÉN va; no permite editar la lista ni envía nada. Los nombres
 * se resuelven desde las fichas por ID estable (si el nombre cambia, se ve el
 * vigente; si la ficha ya no existe, se conserva el nombre de la clase).
 */
function desplegableAlumnos(c: Clase): string {
  const alumnos = c.alumnos;
  if (alumnos.length === 0) return '';
  const fichas = repo.listarAlumnos();
  const nombres = alumnos.map((a) => fichas.find((f) => f.id === a.id)?.nombre ?? a.nombre);
  return `<details class="clase-alumnos">
    <summary>Ver quiénes van</summary>
    <ul>${nombres.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
  </details>`;
}

/** Acción de una fila de clase (20/11): ya no hay botón rojo "Cancelar clase".
 *  El chip de estado (Por dar / Dada) abre el cuadro con las acciones;
 *  solo Cancelada conserva su "Revertir" porque no hay chip tocable. */
function accionClase(c: Clase): string {
  if (c.estado === 'cancelada') {
    return `<button class="marcar marcar-reversa" type="button" data-reversa="${c.id}">Revertir</button>`;
  }
  return '';
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
  const anclado = diaSemanaAnclado && diaSemanaAnclado >= lunesDe(hoy) ? diaSemanaAnclado : hoy;
  const lunes = semanaActual(anclado);
  const dias = clasesDeLaSemana(clases, lunes);

  const tira = $('.tira');
  if (tira) {
    tira.innerHTML = dias
      .map((d) => {
        const dia = parseFecha(d.fecha);
        const activo = d.fecha === anclado ? ' activo' : '';
        const tiene = d.clases.length > 0 ? ' tiene' : '';
        return `<button class="tira-dia${tiene}${activo}" type="button" data-fecha="${d.fecha}">
          <span><i>${diaCorto(d.fecha)}</i><em>${mesCorto(d.fecha)}</em></span><b>${dia.d}</b></button>`;
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

  pintarLinea(anclado);
  pintarTituloSemana(lunes);
  const link = $('#v-semana .link-suave .link-txt');
  if (link) link.textContent = 'Ver mes';
}

/**
 * Título de la vista Clases (punto 3: cambiar de día con fecha real). Muestra
 * el rango concreto de la semana que se está mirando y aclara cuando no es la
 * de hoy, para que mover una clase nunca quede en un «lun mar mié» ambiguo.
 */
function pintarTituloSemana(lunes: string): void {
  const h2 = $('#v-semana .agenda-titulo h2') as HTMLElement | null;
  if (!h2) return;
  const domingo = sumarDias(lunes, 6);
  const corto = (f: string) => `${parseFecha(f).d} ${MESES_CORTOS[parseFecha(f).m - 1]}`;
  const rango = `${corto(lunes)}–${corto(domingo)}`;
  const propia = lunes === lunesDe(hoyLocal(reloj.ahora()));
  h2.textContent = propia ? `Esta semana · ${rango}` : `Semana del ${rango}`;
  const detalle = `Del ${etiquetaDiaCompleta(lunes)} al ${etiquetaDiaCompleta(domingo)}`;
  h2.title = detalle;
  h2.setAttribute('aria-label', detalle);
  const volver = $('#v-semana .agenda-titulo .semana-hoy') as HTMLButtonElement | null;
  if (propia) {
    volver?.remove();
    return;
  }
  if (!volver) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'link-suave semana-hoy';
    boton.setAttribute('aria-label', 'Volver a la semana de hoy');
    boton.innerHTML = '<span class="link-txt">Volver a hoy</span>';
    boton.addEventListener('click', () => {
      const ahora = hoyLocal(reloj.ahora());
      diaSemanaAnclado = null;
      pintarSemanaDe(ahora);
      pintarSemana();
    });
    const fila = $('#v-semana .agenda-titulo');
    const verMes = fila?.querySelector('.link-suave');
    if (verMes) fila?.insertBefore(boton, verMes);
    else fila?.appendChild(boton);
  }
}

/** Lunes de la semana que contiene `f` (o la semana de hoy). */
function semanaActual(f: string): string {
  return lunesDe(f);
}

/** Pinta la tira con la semana que contiene `f` (doble toque desde el mes). */
/** Asegura ocurrencias del rango que se está mirando, sin tocar marcas. */
function asegurarOcurrencias(fecha: string): void {
  clases = repo.materializarHasta(fecha);
}

function pintarSemanaDe(f: string): void {
  asegurarOcurrencias(f);
  diaSemanaAnclado = f;
  const lunes = lunesDe(f);
  pintarTituloSemana(lunes);
  const dias = clasesDeLaSemana(clases, lunes);
  const tira = $('.tira');
  if (!tira) return;
  tira.innerHTML = dias
    .map((d) => {
      const dia = parseFecha(d.fecha);
      const activo = d.fecha === f ? ' activo' : '';
      const tiene = d.clases.length > 0 ? ' tiene' : '';
      return `<button class="tira-dia${tiene}${activo}" type="button" data-fecha="${d.fecha}">
        <span><i>${diaCorto(d.fecha)}</i><em>${mesCorto(d.fecha)}</em></span><b>${dia.d}</b></button>`;
    })
    .join('');
  tira.querySelectorAll<HTMLButtonElement>('.tira-dia').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.tira-dia').forEach((o) => o.classList.remove('activo'));
      b.classList.add('activo');
      const fecha = b.dataset.fecha as string;
      pintarLinea(fecha);
      if (!clases.some((c) => c.fecha === fecha)) avisar('Sin clases grupales ese día');
    });
  });
}

/** Cablea los chips y botones de un bloque de tarjetas (mes o semana). */
function cablearTarjetas(raiz: ParentNode): void {
  raiz.querySelectorAll<HTMLButtonElement>('[data-acciones]').forEach((b) => {
    b.addEventListener('click', () => abrirAcciones(b.dataset.acciones as string));
  });
  raiz.querySelectorAll<HTMLButtonElement>('[data-cancelar]').forEach((b) => {
    b.addEventListener('click', () => abrirCancelacion(b.dataset.cancelar as string));
  });
  raiz.querySelectorAll<HTMLButtonElement>('[data-reversa]').forEach((b) => {
    b.addEventListener('click', () => revertirCancelacion(b.dataset.reversa as string));
  });
}

/** La tira y la línea se pintan con la semana de hoy; elegir un día solo cambia la línea. */
function pintarLineaSolo(dia: string) {
  // Si el día viene del mes y está en otra semana, la tira no lo contiene.
  if (!$(`.tira-dia[data-fecha="${dia}"]`)) pintarSemanaDe(dia);
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
            ${desplegableAlumnos(c)}
          </div>
          ${chipEstado(c)}
          ${accionClase(c)}
        </article>`,
      )
      .join('')}
  </li>`;

  cablearTarjetas(cont);
}

/* ------------------------------------------------------- vista mes (puntos) */
/** Fecha del mes abierto y día que el dueño tiene seleccionado. */
function mesAbierto(): string {
  return mesSeleccionado ? mesDe(mesSeleccionado) : mesDe(hoyLocal(reloj.ahora()));
}
let mesSeleccionado: string | null = null; // primer día del mes abierto
let diaMesSeleccionado: string | null = null; // día cuyas tarjetas se muestran
let ultimoToque: ToqueFecha | null = null;
/** Día anclado de la vista semana: se preserva al repintar (F5, guardar, mover). */
let diaSemanaAnclado: string | null = null;

/** Días del mes en "AAAA-MM-DD" (lunes=0). */
function diasDelMesAbierto(): string[] {
  const { y, m } = parseFecha(mesAbierto() + '-01');
  const dowLunes = (new Date(`${y}-${String(m).padStart(2, '0')}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [
    ...Array.from({ length: dowLunes }, () => ''),
    ...Array.from({ length: total }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
  ];
}

function pintarMes() {
  // Un mes lejano (p. ej. febrero 2027) debe mostrar sus ocurrencias sin
  // inventar días previos al inicio ni usar esa fecha como «hoy».
  const diasMes = diasDelMesAbierto();
  const ultimo = diasMes.filter(Boolean).pop();
  if (ultimo) asegurarOcurrencias(ultimo);
  const hoy = hoyLocal(reloj.ahora());
  const abierto = mesAbierto();
  const h2 = $('#v-mes .agenda-titulo h2');
  if (h2) h2.textContent = etiquetaMes(abierto + '-01');
  // Nombres accesibles con el mes concreto al que se va (y el actual).
  const { y: ay, m: am } = parseFecha(abierto + '-01');
  const prev = new Date(Date.UTC(ay, am - 2, 1));
  const next = new Date(Date.UTC(ay, am, 1));
  const nomMes = (d: Date) => etiquetaMes(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`);
  if (flechaAnt) flechaAnt.setAttribute('aria-label', `Mes anterior: ${nomMes(prev)}`);
  if (flechaSig) flechaSig.setAttribute('aria-label', `Mes siguiente: ${nomMes(next)}`);

  const cont = $('#v-mes .mes');
  if (!cont) return;
  const celdas: string[] = [];
  for (const f of diasMes) {
    if (!f) { celdas.push('<button class="mes-dia vacio" type="button" disabled></button>'); continue; }
    const delDia = clases.filter((c) => c.fecha === f);
    let claseEstado = '';
    if (delDia.length > 0) {
      if (delDia.some((c) => c.estado === 'cancelada')) claseEstado = ' tiene-cancelada';
      else if (delDia.every((c) => c.estado === 'dada')) claseEstado = ' todas-dadas';
    }
    const tiene = delDia.length > 0 ? ' tiene' : '';
    const activo = f === hoy ? ' activo' : '';
    const seleccionado = f === diaMesSeleccionado ? ' seleccionado' : '';
    celdas.push(`<button class="mes-dia${tiene}${claseEstado}${activo}${seleccionado}" type="button" data-fecha="${f}" aria-label="${parseFecha(f).d} de ${etiquetaMes(f)}${tiene ? ', con clases' : ''}"${seleccionado ? ' aria-current="date"' : ''}>${parseFecha(f).d}</button>`);
  }
  cont.innerHTML = celdas.join('');
  // Punto 4: referencias coloridas sobrias, acordes a los tokens v5.
  let leyenda = $('#v-mes .mes-leyenda');
  if (!leyenda) {
    leyenda = document.createElement('div');
    leyenda.className = 'mes-leyenda';
    cont.parentElement?.appendChild(leyenda);
  }
  leyenda.innerHTML = '<span><i class="ley-dada"></i>Dada</span><span><i class="ley-prog"></i>Por dar</span><span><i class="ley-canc"></i>Cancelada</span>';

  cont.querySelectorAll<HTMLButtonElement>('.mes-dia:not(.vacio)').forEach((b) => {
    const f = b.dataset.fecha as string;
    b.addEventListener('click', (e) => {
      if ((e as MouseEvent).detail >= 2) return; // el doble clic lo resuelve dblclick
      tocarDiaMes(f);
    });
    b.addEventListener('dblclick', (e) => {
      e.preventDefault();
      abrirSemanaDe(f);
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.repeat) abrirSemanaDe(f);
        else tocarDiaMes(f);
      }
    });
  });
  pintarTarjetasDiaMes();
}

/** Mueve el almanaque al mes anterior/siguiente (flechas v5). */
function moverMes(delta: number): void {
  mesSeleccionado = primerDiaDeMes(mesAbierto() + '-01', delta);
  diaMesSeleccionado = null;
  ultimoToque = null;
  pintarMes();
}

const flechaAnt = $('#v-mes .mes-titulo-nav .flecha') as HTMLElement | null;
const flechaSig = $$('#v-mes .mes-titulo-nav .flecha')[1] as HTMLElement | null;
flechaAnt?.addEventListener('click', () => moverMes(-1));
flechaSig?.addEventListener('click', () => moverMes(1));

/** Un toque: selecciona el día y muestra sus tarjetas SIN salir del mes. */
function tocarDiaMes(f: string): void {
  const r = registrarToqueFecha(ultimoToque, f, performance.now());
  ultimoToque = r.ultimo;
  diaMesSeleccionado = f;
  $$('#v-mes .mes-dia:not(.vacio)').forEach((b) => {
    const on = b.getAttribute('data-fecha') === f;
    b.classList.toggle('seleccionado', on);
    if (on) b.setAttribute('aria-current', 'date'); else b.removeAttribute('aria-current');
  });
  pintarTarjetasDiaMes();
  if (r.doble) abrirSemanaDe(f);
}

/** Doble toque: abre «Ver semana» con el día elegido a la vista. */
function abrirSemanaDe(f: string): void {
  ultimoToque = null;
  // La tira se pinta con la semana de la fecha tocada (no con la de hoy).
  pintarSemanaDe(f);
  irA('v-semana');
  pintarLineaSolo(f);
  const tiraDia = $(`.tira-dia[data-fecha="${f}"]`) as HTMLElement | null;
  tiraDia?.focus({ preventScroll: true });
  tiraDia?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

/** Las tarjetas v5 de un día, debajo de la leyenda del almanaque. */
function pintarTarjetasDiaMes(): void {
  const viejo = $('#v-mes .dia-tarjetas');
  viejo?.remove();
  if (!diaMesSeleccionado) return;
  const seccion = $('#v-mes');
  if (!seccion) return;
  const caja = document.createElement('div');
  caja.className = 'dia-tarjetas';
  caja.setAttribute('aria-live', 'polite');
  const fecha = diaMesSeleccionado;
  const delDia = clasesDelDia(clases, fecha);
  const cabecera = document.createElement('div');
  cabecera.className = 'dia-tarjetas-head';
  cabecera.innerHTML = `<p>${esc(etiquetaDia(fecha))}</p><span class="dia-acciones-head"><button class="dia-agendar" id="dia-agendar" type="button" aria-label="Agendar clase el ${esc(etiquetaDiaCompleta(fecha))}">Agendar acá<svg class="ico" width="13" height="13" aria-hidden="true"><use href="#i-mas2"/></svg></button><button class="dia-ver-semana" type="button">Ver semana<svg class="ico" width="13" height="13" aria-hidden="true"><use href="#i-agenda"/></svg></button></span>`;
  cabecera.querySelector('.dia-ver-semana')?.addEventListener('click', () => abrirSemanaDe(fecha));
  // Desde un día de otro mes (incluso vacío), agendar una suelta ahí mismo.
  cabecera.querySelector('.dia-agendar')?.addEventListener('click', (e) => abrirFormularioSuelta(fecha, e.currentTarget as HTMLElement));
  caja.appendChild(cabecera);
  if (delDia.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'dia-vacio';
    vacio.textContent = 'Sin clases ese día';
    caja.appendChild(vacio);
  } else {
    const lista = document.createElement('div');
    lista.className = 'dia-lista';
    lista.innerHTML = delDia
      .map(
        (c) => `<article class="clase${c.estado === 'dada' ? ' hecha' : ''}${c.estado === 'cancelada' ? ' cancelada' : ''}${c.estado === 'programada' ? ' por-dar' : ''}" data-clase="${c.id}">
          <div class="clase-hora"><b>${horaClase(c)}</b><span>${c.duracionMin} min</span></div>
          <div class="clase-datos">
            <p class="clase-nombre">${esc(c.nombre)}</p>
            <p class="clase-sub">${c.alumnos.length} alumnos inscriptos${c.estado === 'cancelada' && c.cancelacion ? ` · ${esc(c.cancelacion.motivo)}` : ''}</p>
            ${desplegableAlumnos(c)}
          </div>
          ${chipEstado(c)}
          ${accionClase(c)}
        </article>`,
      )
      .join('');
    caja.appendChild(lista);
    cablearTarjetas(caja);
  }
  seccion.appendChild(caja);
}

/* --------------------------------------------------------- agendar clases (20/11) */
/** ID único para rutinas y sueltas (sin BD: contador local + aleatorio corto). */
function nuevoId(prefijo: 'rut' | 'suelta'): string {
  const azar = Array.from(crypto.getRandomValues(new Uint32Array(2)), (n) => n.toString(36)).join('').slice(0, 10);
  return `${prefijo}-${azar}`;
}

const NOMBRES_DIAS: [string, DiaSemana][] = [
  ['Lun', 0], ['Mar', 1], ['Mié', 2], ['Jue', 3], ['Vie', 4], ['Sáb', 5], ['Dom', 6],
];
/** Mes abreviado para el título de la semana («17 nov–23 nov»). */
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

/* ------------------------------------- sheets: lock, medición y cierre limpio */
/** Profundidad de sheets abiertos. Al volver a 0 se devuelve el scroll al body. */
let profundidadSheets = 0;

/**
 * Mide el viewport real y ancla el sheet a él (no al `.cel`, que crece con el
 * contenido). Así «Por dar / Dada», fichas y formularios se ven completos sin
 * hacer scroll por una altura mal calculada.
 */
function ajustarAlViewport(el: HTMLElement): void {
  const raiz = document.documentElement;
  const safe = Number.parseFloat(getComputedStyle(raiz).getPropertyValue('--sheet-safe') || '0') || 0;
  const alto = window.visualViewport?.height ?? window.innerHeight;
  el.style.cssText += ';' + estiloSheet(alto, safe);
}

/** Bloquea el scroll de la página mientras haya cualquier sheet abierto. */
function abrirSheet(el: HTMLElement): void {
  ajustarAlViewport(el);
  profundidadSheets = ajustarLock(profundidadSheets, true);
  if (debeBloquearScroll(profundidadSheets)) {
    document.body.classList.add('con-sheet');
    document.documentElement.classList.add('con-sheet');
  }
}

/**
 * Libera el lock cuando ya no queda ningún sheet abierto. Cuenta los
 * `<dialog open>` y los `.sheet` en animation de cierre para no desbloquear
 * antes de tiempo si hay dos capas superpuestas.
 */
function liberarSiNoHaySheets(): void {
  const quedan = document.querySelectorAll('.sheet:not(.cerrando), dialog.sheet[open]').length;
  if (quedan > 0) return;
  profundidadSheets = 0;
  document.body.classList.remove('con-sheet');
  document.documentElement.classList.remove('con-sheet');
}

/** Quita un sheet del DOM y libera el lock cuando no quede ninguno abierto. */
function retirarSheet(el: HTMLElement): void {
  el.classList.add('cerrando');
  el.dataset.lockLiberado = '1'; // se va: deja de contar para el lock
  liberarSiNoHaySheets();
  setTimeout(() => { el.remove(); liberarSiNoHaySheets(); }, 240);
}

/**
 * Tabulables de un contenedor, en orden de documento, para el focus trap:
 * botones, inputs, selects, textareas, links y cualquier [tabindex] >= 0,
 * sin los deshabilitados ni los ocultos (menos los de un <dialog> abierto,
 * que no tienen ancestro visible por el top layer).
 */
const SELECTOR_TABULABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function tabulablesDe(raiz: ParentNode): HTMLElement[] {
  return [...raiz.querySelectorAll<HTMLElement>(SELECTOR_TABULABLE)]
    .filter((el) => !el.closest('[hidden]') && (el.closest('dialog[open]') || el.offsetParent !== null || el === document.activeElement));
}

/**
 * Pone el foco en el primer tabulable del sheet (o en el sheet mismo si no
 * tiene ninguno). Lo usa el focus trap al dar la vuelta.
 */
function enfocarPrimero(sheet: HTMLElement): void {
  const dentro = tabulablesDe(sheet);
  (dentro[0] ?? sheet).focus();
}

/**
 * Focus trap de un sheet abierto: mientras el foco esté dentro, Tab y
 * Shift+Tab dan la vuelta dentro del sheet en vez de salir al documento.
 * Con un <dialog> con showModal() el navegador ya atrapa el Tab del teclado
 * (top layer), pero no lo hace cuando el foco sale por código (p. ej. un
 * autofocus afuera) ni en sheets que no son dialog: este trap cubre ambos.
 * Se identifica el Tab por la tecla y no por el target: con un dialog modal
 * las teclas recaen en el dialog, no en el control enfocado.
 *
 * Devuelve la función de limpieza (se llama al cerrar el sheet).
 */
function atraparTab(sheet: HTMLElement): () => void {
  const enRango = (el: Element | null): el is HTMLElement =>
    el instanceof HTMLElement && sheet.contains(el);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !sheet.isConnected) return;
    const activo = document.activeElement;
    if (!enRango(activo)) return; // foco afuera (p. ej. en otro modal apilado): no se toca
    const dentro = tabulablesDe(sheet);
    if (dentro.length === 0) return;
    const actual = dentro.indexOf(activo);
    if (e.shiftKey) {
      if (actual <= 0) { // primero o foco fuera de la lista: ir al último
        e.preventDefault();
        dentro[dentro.length - 1]!.focus();
      }
    } else if (actual === dentro.length - 1) { // último: volver al primero
      e.preventDefault();
      enfocarPrimero(sheet);
    }
  };
  sheet.addEventListener('keydown', onKeyDown);
  return () => sheet.removeEventListener('keydown', onKeyDown);
}

/**
 * Marca un formulario como sucio cuando cambia cualquiera de sus controles.
 * `input`/`change`/`click` cubren textos, selects, chips y checkboxes.
 */
function observarCambios(el: HTMLElement, onCambio?: () => void): void {
  const marcar = () => {
    if (el.dataset.dirty === '1') return;
    el.dataset.dirty = '1';
    onCambio?.();
  };
  el.addEventListener('input', marcar);
  el.addEventListener('change', marcar);
  el.addEventListener('click', (e) => {
    // Solo botones que cambian una elección (chips, opciones); «Volver» /
    // «Cerrar» no cuentan como cambio.
    if (!(e.target instanceof Element)) return;
    if (e.target.closest(
      'button[aria-pressed],button[data-modo],button[data-modalidad],button[data-grupo],button[data-dia]',
    )) marcar();
  });
}

/**
 * Si el sheet tiene cambios sin guardar, muestra el cuadro de confirmación:
 * Guardar (ejecuta el submit), Descartar (cierra) y Seguir editando.
 * Devuelve `true` cuando el dueño eligió guardar (quien llama decide si cierra).
 */
function confirmarCierreConCambios(el: HTMLElement, guardar: () => void, descartar: () => void): void {
  if (document.querySelector('dialog.confirmar-cambios[open]')) return; // un solo cuadro a la vez
  // Debe ser un <dialog> modal, no un <div>: los sheets de ficha/cobros son
  // <dialog> con showModal() y viven en la "top layer" del navegador; ningún
  // z-index del document puede pintar por encima. Otro modal nativo sí comparte
  // esa capa y se muestra encima del sheet que lo originó (Guardar recibe clics).
  const caja = document.createElement('dialog');
  caja.className = 'confirmar-cambios';
  caja.setAttribute('aria-label', 'Cambios sin guardar');
  caja.innerHTML = `
    <div class="confirmar-cambios-caja">
      <p class="sheet-eyebrow">Cambios sin guardar</p>
      <h3>¿Hay cambios sin guardar, querés guardarlos?</h3>
      <p class="confirmar-cambios-nota">Si descartás, se pierden los cambios de este cuadro.</p>
      <div class="confirmar-cambios-acciones">
        <button type="button" class="btn-secundario" data-decision="seguir">Seguir editando</button>
        <button type="button" class="btn-secundario" data-decision="descartar">Descartar</button>
        <button type="button" class="btn-primario" data-decision="guardar">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(caja);
  // Diálogo modal accesible: también es un sheet del sistema (Gino, accesibilidad 23-nov).
  caja.setAttribute('role', 'dialog');
  caja.setAttribute('aria-modal', 'true');
  const soltarTrapCaja = atraparTab(caja);
  const cerrarCuadroConfirm = () => { soltarTrapCaja(); if (caja.open) caja.close(); caja.remove(); liberarSiNoHaySheets(); };
  const descartarYValidar = () => { cerrarCuadroConfirm(); descartar(); };
  // Escape sobre el aviso significa "Seguir editando": no descarta cambios.
  caja.addEventListener('cancel', (e) => { e.preventDefault(); cerrarCuadroConfirm(); });
  caja.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const boton = e.target.closest('[data-decision]') as HTMLElement | null;
    if (!boton) return;
    const decision = boton.dataset.decision;
    if (decision === 'guardar') { cerrarCuadroConfirm(); guardar(); }
    else if (decision === 'descartar') descartarYValidar();
    else cerrarCuadroConfirm();
  });
  caja.showModal();
  (caja.querySelector('[data-decision="guardar"]') as HTMLElement).focus();
}

/**
 * Cierre genérico de un sheet con formulario: si está `dirty`, pregunta antes;
 * si no, cierra directo. `guardar` ejecuta el submit correspondiente.
 */
function cerrarCuadroConCambios(el: HTMLElement, guardar: () => void): void {
  if (el.dataset.dirty === '1') {
    confirmarCierreConCambios(el, guardar, () => cerrarCuadro(el));
    return;
  }
  cerrarCuadro(el);
}

/** Cierra el sheet activo (genérico, lo usan todos los cuadros). */
function cerrarCuadro(el: HTMLElement) {
  const origen = el.dataset.disparador;
  const control = origen ? document.getElementById(origen) : null;
  retirarSheet(el);
  if (control && document.contains(control)) control.focus();
}

/** Abre el primer cuadro del FAB: elegir «Clase semanal» o «Clase suelta». */
function abrirAgendar() {
  cerrarSheet();
  const cuadro = document.createElement('div');
  cuadro.className = 'sheet';
  cuadro.dataset.disparador = 'abrir-agenda';
  cuadro.setAttribute('role', 'dialog');
  cuadro.setAttribute('aria-modal', 'true');
  cuadro.setAttribute('aria-labelledby', 'agendar-titulo');
  cuadro.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="sheet-eyebrow">Calendario</p>
        <h3 id="agendar-titulo">¿Qué querés agregar?</h3>
      </div>
      <button class="sheet-cerrar" type="button" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button>
    </div>
    <div class="opciones" role="group" aria-label="Tipo de alta">
      <button class="opcion opcion-agendar" type="button" data-mod="alumno">
        <svg class="ico" width="19" height="19"><use href="#i-alumnos"/></svg>
        <span><b>Nueva alumna</b><small>Darla de alta y agendarla ese día</small></span>
      </button>
      <button class="opcion opcion-agendar" type="button" data-mod="semanal">
        <svg class="ico" width="19" height="19"><use href="#i-agenda"/></svg>
        <span><b>Clase semanal</b><small>Una rutina: elegís los días y la hora, se repite sola</small></span>
      </button>
      <button class="opcion opcion-agendar" type="button" data-mod="suelta">
        <svg class="ico" width="19" height="19"><use href="#i-reloj"/></svg>
        <span><b>Clase suelta</b><small>Un solo día concreto, sin repetición</small></span>
      </button>
    </div>`;
  $('.cel')?.appendChild(cuadro);
  abrirSheet(cuadro);
  cuadro.querySelector('.sheet-cerrar')?.addEventListener('click', () => cerrarCuadro(cuadro));
  cuadro.querySelector('[data-mod="alumno"]')?.addEventListener('click', () => {
    cerrarCuadro(cuadro);
    abrirFichaAltaParaAgendar(diaMesSeleccionado ?? undefined);
  });
  cuadro.querySelector('[data-mod="semanal"]')?.addEventListener('click', () => {
    cerrarCuadro(cuadro);
    abrirFormularioSemanal(diaMesSeleccionado ?? undefined);
  });
  cuadro.querySelector('[data-mod="suelta"]')?.addEventListener('click', () => {
    cerrarCuadro(cuadro);
    abrirFormularioSuelta(diaMesSeleccionado ?? undefined);
  });
  (cuadro.querySelector('[data-mod="semanal"]') as HTMLElement)?.focus();
}

/** Arma el <select> de día/mes/año reutilizable por reprogramar y suelta. */
function selectorFecha(nombre: string, inicial: string, anclaAncho = 6): string {
  const { y, m, d } = parseFecha(inicial);
  const anios = Array.from({ length: anclaAncho * 2 + 1 }, (_, i) => y - anclaAncho + i);
  const dias = Array.from({ length: diasDelMes(y, m) }, (_, i) => i + 1);
  return `<div class="fecha-elegir" data-fecha="${nombre}">
    <label class="campo"><span>Día</span><select name="dia" aria-label="Día">${dias.map((n) => `<option value="${n}"${n === d ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    <label class="campo"><span>Mes</span><select name="mes" aria-label="Mes">${Array.from({ length: 12 }, (_, i) => i + 1).map((n) => `<option value="${n}"${n === m ? ' selected' : ''}>${new Intl.DateTimeFormat('es', { month: 'short' }).format(new Date(2000, n - 1, 1)).replace('.', '')}</option>`).join('')}</select></label>
    <label class="campo"><span>Año</span><select name="anio" aria-label="Año">${anios.map((n) => `<option value="${n}"${n === y ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
  </div>`;
}

/** Lee un selectorFecha armado por `selectorFecha`. Devuelve "AAAA-MM-DD" o null. */
function leerFechaDe(raiz: ParentNode, nombre: string): string | null {
  const caja = raiz.querySelector(`[data-fecha="${nombre}"]`) as HTMLElement | null;
  if (!caja) return null;
  const d = Number((caja.querySelector('[name="dia"]') as HTMLSelectElement).value);
  const m = Number((caja.querySelector('[name="mes"]') as HTMLSelectElement).value);
  const y = Number((caja.querySelector('[name="anio"]') as HTMLSelectElement).value);
  const fecha = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return esFechaValida(fecha) ? fecha : null;
}

/** Actualiza los días del selector cuando cambia el mes/año (bisiestos). */
function cablearFecha(raiz: ParentNode, nombre: string, onChange?: () => void) {
  const caja = raiz.querySelector(`[data-fecha="${nombre}"]`) as HTMLElement | null;
  if (!caja) return;
  const dia = caja.querySelector('[name="dia"]') as HTMLSelectElement;
  const mes = caja.querySelector('[name="mes"]') as HTMLSelectElement;
  const anio = caja.querySelector('[name="anio"]') as HTMLSelectElement;
  const actualizar = () => {
    const elegido = Number(dia.value);
    const total = diasDelMes(Number(anio.value), Number(mes.value));
    dia.innerHTML = Array.from({ length: total }, (_, i) => i + 1)
      .map((n) => `<option value="${n}"${n === Math.min(elegido, total) ? ' selected' : ''}>${n}</option>`).join('');
    onChange?.();
  };
  mes.addEventListener('change', actualizar);
  anio.addEventListener('change', actualizar);
}

function abrirFormularioSemanal(fechaDesdeDia?: string) {
  const hoy = hoyLocal(reloj.ahora());
  const propuesta = fechaDesdeDia ?? diaMesSeleccionado;
  // No proponer fechas pasadas: si el día elegido ya pasó, arrancar hoy.
  const inicio = propuesta && propuesta >= hoy ? propuesta : hoy;
  const cuadro = document.createElement('div');
  cuadro.className = 'sheet';
  cuadro.dataset.disparador = 'abrir-agenda';
  cuadro.setAttribute('role', 'dialog');
  cuadro.setAttribute('aria-modal', 'true');
  cuadro.setAttribute('aria-labelledby', 'semanal-titulo');
  cuadro.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="sheet-eyebrow">Clase semanal</p>
        <h3 id="semanal-titulo">Nueva rutina</h3>
      </div>
      <button class="sheet-cerrar" type="button" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button>
    </div>
    <form novalidate>
      <label class="campo"><span>Nombre de la clase</span><input name="nombre" type="text" maxlength="60" placeholder="Ej.: Grupo Martes" autocomplete="off"></label>
      <p class="sheet-paso">Días de la semana</p>
      <div class="semana-elegir" role="group" aria-label="Días de la semana">
        ${NOMBRES_DIAS.map(([nom, idx]) => `<button type="button" class="dia-chip" data-dia="${idx}" aria-pressed="false">${nom}</button>`).join('')}
      </div>
      <p class="sheet-paso">¿Cuándo empieza?</p>
      ${selectorFecha('inicio', inicio)}
      <div class="campo-duo">
        <label class="campo"><span>Hora de inicio</span><input name="hora" type="time" value="15:00"></label>
        <label class="campo"><span>Duración</span><select name="duracion"><option value="60" selected>60 min</option><option value="90">90 min</option><option value="120">120 min</option><option value="30">30 min</option><option value="45">45 min</option></select></label>
      </div>
      <p class="campo-error" role="alert"></p>
      <p class="resumen-fecha" hidden></p>
      <div class="sheet-acciones">
        <button class="btn-secundario" type="button" data-accion="volver">Volver</button>
        <button class="btn-primario" type="submit">Guardar rutina</button>
      </div>
    </form>
    ${rutinasExistentesHtml()}`;
  $('.cel')?.appendChild(cuadro);
  abrirSheet(cuadro);
  const form = cuadro.querySelector('form') as HTMLFormElement;
  const error = cuadro.querySelector('.campo-error') as HTMLElement;
  const resumen = cuadro.querySelector('.resumen-fecha') as HTMLElement;
  const elegidos = new Set<DiaSemana>();

  observarCambios(cuadro);
  cuadro.querySelector('.sheet-cerrar')?.addEventListener('click', () => cerrarCuadroConCambios(cuadro, () => form.requestSubmit()));
  cuadro.querySelector('[data-accion="volver"]')?.addEventListener('click', () => cerrarCuadroConCambios(cuadro, () => form.requestSubmit()));
  cuadro.querySelectorAll<HTMLButtonElement>('.dia-chip').forEach((b) => {
    b.addEventListener('click', () => {
      const d = Number(b.dataset.dia) as DiaSemana;
      if (elegidos.has(d)) elegidos.delete(d); else elegidos.add(d);
      b.classList.toggle('activo', elegidos.has(d));
      b.setAttribute('aria-pressed', elegidos.has(d) ? 'true' : 'false');
      actualizarResumen();
    });
  });
  const actualizarResumen = () => {
    const fecha = leerFechaDe(cuadro, 'inicio');
    if (!fecha) { resumen.hidden = true; return; }
    const nom = Array.from(elegidos).sort().map((d) => NOMBRES_DIAS[d][0]).join(', ');
    resumen.hidden = false;
    resumen.innerHTML = `Empieza el <strong>${esc(etiquetaDia(fecha))}</strong>${nom ? ` · ${esc(nom)}` : ''}. Se repetirá cada semana.`;
  };
  cablearFecha(cuadro, 'inicio', actualizarResumen);
  cuadro.querySelectorAll('[data-fecha="inicio"] select').forEach((s) => s.addEventListener('change', actualizarResumen));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    error.textContent = '';
    const nombre = String(new FormData(form).get('nombre') ?? '').trim();
    const hora = String(new FormData(form).get('hora') ?? '');
    const duracionMin = Number(new FormData(form).get('duracion') ?? 60);
    const desde = leerFechaDe(cuadro, 'inicio');
    if (!nombre) { error.textContent = 'Poné el nombre de la clase.'; return; }
    if (elegidos.size === 0) { error.textContent = 'Elegí al menos un día de la semana.'; return; }
    if (!desde) { error.textContent = 'Elegí una fecha de inicio válida.'; return; }
    if (!/^\d{1,2}:\d{2}$/.test(hora)) { error.textContent = 'Elegí la hora de inicio.'; return; }
    const id = nuevoId('rut');
    try {
      repo.crearRutina({ id, nombre, dias: Array.from(elegidos), desde, hora, duracionMin });
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.';
      return;
    }
    clases = repo.listar();
    // Mostrar la nueva rutina en destino: primer día de ESA serie.
    const primera = clases.filter((c) => c.rutinaId === id).sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.minutos - b.minutos))[0];
    if (primera) {
      mesSeleccionado = primera.fecha;
      diaMesSeleccionado = primera.fecha;
      pintarSemanaDe(primera.fecha);
    }
    cerrarCuadro(cuadro);
    refrescar();
    avisar(`Rutina guardada · ${nombre} empieza el ${etiquetaDia(desde)}`);
  });
  (cuadro.querySelector('[name="nombre"]') as HTMLElement)?.focus();
  cablearBajaRutinas(cuadro);
}

/**
 * Punto 1: las rutinas ya configuradas, a la vista y con baja. Antes la única
 * forma de «desconfigurar» una semana era cancelar clase por clase. Muestra
 * días + hora reales de cada plantilla y, al dar de baja, dice cuántas clases
 * futuras quedaron canceladas (las dadas y las movidas no se tocan).
 */
function rutinasExistentesHtml(): string {
  const rutinas = repo.listarRutinas();
  if (rutinas.length === 0) return '';
  const filas = rutinas.map((r) => {
    const dias = r.dias.map((d) => NOMBRES_DIAS[d]?.[0] ?? '').join(' ');
    return `<li class="rutina-fila" data-rutina="${esc(r.id)}">
      <div><p class="al-nombre">${esc(r.nombre)}</p>
      <p class="al-sub">${esc(dias)} · ${esc(r.hora)} · desde ${esc(etiquetaDia(r.desde))}</p></div>
      <button class="cobros-link" type="button" data-baja-rutina="${esc(r.id)}">Dar de baja</button>
    </li>`;
  }).join('');
  return `<div class="rutinas-config">
    <p class="sheet-paso">Tus clases semanales</p>
    <ul class="cobros-panel-lista">${filas}</ul>
    <p class="al-sub">Dar de baja una rutina cancela sus clases futuras que sigan por dar. Las ya dadas quedan en el historial.</p>
  </div>`;
}

function cablearBajaRutinas(cuadro: HTMLElement): void {
  cuadro.querySelectorAll<HTMLButtonElement>('[data-baja-rutina]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.bajaRutina as string;
      const rutina = repo.listarRutinas().find((r) => r.id === id);
      if (!rutina) return;
      const seguir = confirm(`¿Dar de baja «${rutina.nombre}»? Se cancelan sus clases futuras que sigan por dar.`);
      if (!seguir) return;
      let res: { canceladas: number };
      try {
        res = repo.eliminarRutina(id, { motivo: 'Rutina dada de baja', quien: QUIEN, ahora: reloj.ahora() });
      } catch (err) {
        avisar(err instanceof Error ? err.message : 'No se pudo dar de baja la rutina', 3500);
        return;
      }
      clases = repo.listar();
      refrescar();
      cuadro.querySelector('.rutinas-config')?.remove();
      avisar(`Rutina dada de baja · ${res.canceladas} clase${res.canceladas === 1 ? '' : 's'} futura${res.canceladas === 1 ? '' : 's'} cancelada${res.canceladas === 1 ? '' : 's'}`);
    });
  });
}

function abrirFormularioSuelta(fechaDesdeDia?: string, origen?: HTMLElement) {
  // Prioridad: día tocado «Agendar acá» > día seleccionado en el mes > hoy.
  const inicial = fechaDesdeDia ?? diaMesSeleccionado ?? hoyLocal(reloj.ahora());
  const cuadro = document.createElement('div');
  cuadro.className = 'sheet';
  if (origen?.id) cuadro.dataset.disparador = origen.id;
  else cuadro.dataset.disparador = 'abrir-agenda';
  cuadro.setAttribute('role', 'dialog');
  cuadro.setAttribute('aria-modal', 'true');
  cuadro.setAttribute('aria-labelledby', 'suelta-titulo');
  cuadro.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="sheet-eyebrow">Clase suelta</p>
        <h3 id="suelta-titulo">Un solo día</h3>
      </div>
      <button class="sheet-cerrar" type="button" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button>
    </div>
    <form novalidate>
      <label class="campo"><span>Nombre de la clase</span><input name="nombre" type="text" maxlength="60" placeholder="Ej.: Inglés individual" autocomplete="off"></label>
      <p class="sheet-paso">Fecha de la clase</p>
      ${selectorFecha('fecha', inicial)}
      <div class="campo-duo">
        <label class="campo"><span>Hora de inicio</span><input name="hora" type="time" value="15:00"></label>
        <label class="campo"><span>Duración</span><select name="duracion"><option value="60" selected>60 min</option><option value="90">90 min</option><option value="120">120 min</option><option value="30">30 min</option><option value="45">45 min</option></select></label>
      </div>
      <p class="campo-error" role="alert"></p>
      <p class="resumen-fecha" hidden></p>
      <div class="sheet-acciones">
        <button class="btn-secundario" type="button" data-accion="volver">Volver</button>
        <button class="btn-primario" type="submit">Guardar clase</button>
      </div>
    </form>`;
  $('.cel')?.appendChild(cuadro);
  abrirSheet(cuadro);
  const form = cuadro.querySelector('form') as HTMLFormElement;
  const error = cuadro.querySelector('.campo-error') as HTMLElement;
  const resumen = cuadro.querySelector('.resumen-fecha') as HTMLElement;

  observarCambios(cuadro);
  cuadro.querySelector('.sheet-cerrar')?.addEventListener('click', () => cerrarCuadroConCambios(cuadro, () => form.requestSubmit()));
  cuadro.querySelector('[data-accion="volver"]')?.addEventListener('click', () => cerrarCuadroConCambios(cuadro, () => form.requestSubmit()));
  const actualizarResumen = () => {
    const fecha = leerFechaDe(cuadro, 'fecha');
    resumen.hidden = !fecha;
    if (fecha) resumen.innerHTML = `La clase se dictará el <strong>${esc(etiquetaDia(fecha))}</strong>.`;
  };
  cablearFecha(cuadro, 'fecha', actualizarResumen);
  cuadro.querySelectorAll('[data-fecha="fecha"] select').forEach((s) => s.addEventListener('change', actualizarResumen));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    error.textContent = '';
    const fd = new FormData(form);
    const nombre = String(fd.get('nombre') ?? '').trim();
    const hora = String(fd.get('hora') ?? '');
    const duracionMin = Number(fd.get('duracion') ?? 60);
    const fecha = leerFechaDe(cuadro, 'fecha');
    if (!nombre) { error.textContent = 'Poné el nombre de la clase.'; return; }
    if (!fecha) { error.textContent = 'Elegí una fecha válida.'; return; }
    if (!/^\d{1,2}:\d{2}$/.test(hora)) { error.textContent = 'Elegí la hora de inicio.'; return; }
    try {
      repo.crearSuelta({ id: nuevoId('suelta'), nombre, fecha, hora, duracionMin });
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.';
      return;
    }
    clases = repo.listar();
    mesSeleccionado = fecha;
    diaMesSeleccionado = fecha;
    pintarSemanaDe(fecha);
    cerrarCuadro(cuadro);
    refrescar();
    avisar(`Clase guardada · ${nombre} el ${etiquetaDia(fecha)}`);
  });
  actualizarResumen();
  (cuadro.querySelector('[name="nombre"]') as HTMLElement)?.focus();
}

/* ------------------------------------------- cancelar clase (sheet + WhatsApp) */
let sheet: HTMLElement | null = null;
let claseEnSheet: Clase | null = null;
let modoEnvio: 'masivo' | 'individual' | 'ninguno' = 'masivo';
let elegidos = new Set<string>();
let textoEnviado = '';

function cerrarSheet() {
  if (!sheet) return;
  const s = sheet;
  sheet = null;
  claseEnSheet = null;
  cerrarCuadro(s);
}

/** Cierre de las acciones de Por dar / Dada con aviso si se tocó la fecha. */
function cerrarAcciones(): void {
  if (!sheet) return;
  const s = sheet;
  if (s.dataset.dirty === '1') {
    const cajaCambio = s.querySelector('.cambiar-dia') as HTMLElement | null;
    const confirmar = s.querySelector('[data-accion="confirmar-cambio"]') as HTMLElement | null;
    const guardar = () => {
      if (cajaCambio && cajaCambio.hidden) {
        // Estaba en el sub-cuadro de fecha: volver a mostrarlo para que el
        // dueño revise antes de mover la clase.
        cajaCambio.hidden = false;
        (s.querySelector('[data-acciones-principales]') as HTMLElement).hidden = true;
      }
      confirmar?.click();
    };
    confirmarCierreConCambios(s, guardar, () => cerrarSheet());
    return;
  }
  cerrarSheet();
}

/** Cuadro de acciones (20/11): lo abre el chip de estado de la clase
 *  («Por dar» o «Dada»). Abrir NO cambia el estado. */
function abrirAcciones(id: string) {
  const c = clases.find((x) => x.id === id);
  if (!c || c.estado === 'cancelada') return;
  cerrarSheet();
  const previo = document.createElement('div');
  previo.className = 'sheet';
  previo.dataset.disparador = `clase-acciones-${id}`;
  previo.setAttribute('role', 'dialog');
  previo.setAttribute('aria-modal', 'true');
  previo.setAttribute('aria-label', `Opciones para ${c.nombre}`);
  const esManual = c.estado === 'dada' && c.eventos.at(-1)?.tipo === 'marcada-manual';
  previo.innerHTML = `
    <div class="sheet-head">
      <div>
        <p class="sheet-eyebrow">${esc(etiquetaDia(c.fecha))} · ${horaClase(c)}</p>
        <h3>${c.estado === 'dada' ? 'Clase dada' : 'Clase por dar'}</h3>
      </div>
      <button class="sheet-cerrar" type="button" aria-label="Cerrar"><svg class="ico" width="18" height="18"><use href="#i-mas2"/></svg></button>
    </div>
    <p class="sheet-clase"><strong>${esc(c.nombre)}</strong> · ${c.alumnos.length} alumnos</p>
    <div class="acciones-clase">
      ${c.estado === 'programada' ? `
      <button class="accion-clase" type="button" data-acc="marcar">
        <svg class="ico" width="19" height="19"><use href="#i-check"/></svg>
        <span><b>Marcar dada</b><small> Confirmar que se dictó</small></span>
      </button>` : ''}
      ${esManual ? `
      <button class="accion-clase" type="button" data-acc="desmarcar">
        <svg class="ico" width="19" height="19"><use href="#i-reloj"/></svg>
        <span><b>Volver a Por dar</b><small>Deshacer la marca manual</small></span>
      </button>` : ''}
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
      <p class="sheet-paso">Elegí la nueva fecha</p>
      <p class="resumen-fecha">Desde: <strong>${esc(etiquetaDiaCompleta(c.fecha))}</strong> · ${horaClase(c)}</p>
      ${selectorFecha('destino', c.fecha)}
      <p class="resumen-fecha" data-resumen-destino>Hacia: <strong>${esc(etiquetaDiaCompleta(c.fecha))}</strong></p>
      <p class="campo-error" role="alert"></p>
      <div class="sheet-acciones">
        <button class="btn-secundario" type="button" data-accion="cancelar-cambio">Volver</button>
        <button class="btn-primario" type="button" data-accion="confirmar-cambio">Mover clase</button>
      </div>
    </div>
    <div class="sheet-acciones" data-acciones-principales>
      <button class="btn-secundario" type="button" data-accion="volver">Volver</button>
    </div>`;
  document.querySelector('.cel')?.appendChild(previo);
  abrirSheet(previo);
  sheet = previo;
  previo.querySelector('.sheet-cerrar')?.addEventListener('click', cerrarAcciones);
  previo.querySelector('[data-accion="volver"]')?.addEventListener('click', cerrarAcciones);
  previo.querySelector('[data-acc="cancelar"]')?.addEventListener('click', () => abrirCancelacion(id));
  previo.querySelector('[data-acc="marcar"]')?.addEventListener('click', () => {
    repo.marcarDada(id, { quien: QUIEN, ahora: reloj.ahora() });
    clases = repo.listar();
    cerrarSheet();
    refrescar();
    delete toast.dataset.revertirManual;
    avisar('Clase marcada dada · Deshacer', 6000);
    toast.dataset.deshacer = '1';
    toast.dataset.revertirManual = id;
  });
  previo.querySelector('[data-acc="desmarcar"]')?.addEventListener('click', () => {
    try {
      repo.deshacerMarcada(id, { quien: QUIEN, ahora: reloj.ahora() });
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo deshacer', 3000);
      return;
    }
    clases = repo.listar();
    cerrarSheet();
    refrescar();
    avisar('Clase vuelta a Por dar');
  });
  const caja = previo.querySelector('.cambiar-dia') as HTMLElement;
  const principales = previo.querySelector('[data-acciones-principales]') as HTMLElement;
  const errorCambio = caja.querySelector('.campo-error') as HTMLElement;
  observarCambios(previo);
  previo.querySelector('[data-acc="cambiar"]')?.addEventListener('click', () => {
    caja.hidden = false;
    principales.hidden = true;
    (caja.querySelector('[data-fecha="destino"] select') as HTMLElement)?.focus();
  });
  // «Volver» sin cambios: se cierra el cuadro de fecha y quedan las acciones.
  caja.querySelector('[data-accion="cancelar-cambio"]')?.addEventListener('click', () => {
    errorCambio.textContent = '';
    caja.hidden = true;
    principales.hidden = false;
  });
  const resumenDestino = caja.querySelector('[data-resumen-destino] strong') as HTMLElement | null;
  const pintarDestino = () => {
    const elegida = leerFechaDe(caja, 'destino');
    if (resumenDestino) resumenDestino.textContent = elegida ? etiquetaDiaCompleta(elegida) : 'fecha inválida';
  };
  cablearFecha(caja, 'destino', pintarDestino);
  // Punto 3: cambiar SOLO el día también tiene que actualizar el «Hacia».
  // Antes se actualizaba únicamente al cambiar mes/año, y la dueña movía una
  // clase a ciegas: el resumen seguía mostrando la fecha vieja.
  caja.querySelectorAll('[data-fecha="destino"] select').forEach((s) => s.addEventListener('change', pintarDestino));
  pintarDestino();
  caja.querySelector('[data-accion="confirmar-cambio"]')?.addEventListener('click', () => {
    errorCambio.textContent = '';
    const nuevaFecha = leerFechaDe(caja, 'destino');
    if (!nuevaFecha) { errorCambio.textContent = 'Elegí una fecha válida.'; return; }
    if (nuevaFecha === c.fecha) {
      errorCambio.textContent = 'Esa ya es la fecha de la clase.';
      return;
    }
    try {
      repo.reprogramar(id, nuevaFecha, { quien: QUIEN, ahora: reloj.ahora() });
    } catch (err) {
      errorCambio.textContent = err instanceof Error ? err.message : 'No se pudo mover la clase.';
      return;
    }
    clases = repo.listar();
    // Mostrar la clase en el destino aunque cruce semana o mes.
    mesSeleccionado = nuevaFecha;
    diaMesSeleccionado = nuevaFecha;
    pintarSemanaDe(nuevaFecha);
    cerrarSheet();
    refrescar();
    avisar(`Clase movida al ${esc(etiquetaDiaCompleta(nuevaFecha))} · ${horaClase(c)}`);
  });
}

function abrirCancelacion(id: string) {
  const c = clases.find((x) => x.id === id);
  if (!c) return;
  claseEnSheet = c;
  modoEnvio = 'masivo';
  elegidos = new Set();
  textoEnviado = textoCancelacion(c);

  /** Cierre de la cancelación con aviso si se editó motivo/mensaje/destino. */
  const cerrarSheetConCambios = () => {
    if (!sheet || sheet.dataset.dirty !== '1') { cerrarSheet(); return; }
    confirmarCierreConCambios(sheet, () => {
      (sheet?.querySelector('[data-accion="confirmar"]') as HTMLElement | null)?.click();
    }, () => cerrarSheet());
  };

  const previo = document.createElement('div');
  previo.className = 'sheet';
  previo.dataset.disparador = `clase-acciones-${id}`;
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
  abrirSheet(previo);
  sheet = previo;

  // Observar todo el sheet: motivo, mensaje y las opciones de WhatsApp
  // también son cambios sin guardar. Antes se observaba `.cambiar-dia`, que
  // ya no existe en este sheet y hacía fallar abrirCancelacion (TypeError).
  observarCambios(previo);

  previo.querySelector('.sheet-cerrar')?.addEventListener('click', () => cerrarSheetConCambios());
  previo.querySelector('[data-accion="volver"]')?.addEventListener('click', () => cerrarSheetConCambios());

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
  delete toast.dataset.revertirManual;

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
    avisar(`Clase cancelada (${anterior === 'dada' ? 'estaba dada' : 'por dar'}) · Deshacer`, 6000);
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
  if (toast.dataset.revertirManual && toast.dataset.deshacer === '1') {
    const id = toast.dataset.revertirManual;
    try {
      repo.deshacerMarcada(id, { quien: QUIEN, ahora: reloj.ahora() });
      clases = repo.listar();
      refrescar();
      avisar('Marca manual deshecha · vuelve a Por dar');
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo deshacer', 3000);
    }
    delete toast.dataset.deshacer;
    toast.classList.remove('ver');
    return;
  }
  if (toast.dataset.deshacer === '1' && toast.dataset.clase) {
    revertirCancelacion(toast.dataset.clase);
    delete toast.dataset.deshacer;
    delete toast.dataset.clase;
    delete toast.dataset.pendientes;
    delete toast.dataset.revertirManual;
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

/* ------------------------------------------------------- alumnos (fichas) */
import {
  construirVista, filtrarYOrdenar, puntoEstadoVence, textoEstadoVence, validarAlumno,
  type AlumnoFicha, type AlumnoFichaInput, type FichaVista, type OrdenAlumnos,
} from './src/alumnos.ts';

let ordenAlumnos: OrdenAlumnos = 'ninguno';
const filtrosAlumnos = new Set<string>();
let busquedaAlumno = '';

/**
 * Días hasta el próximo vencimiento de cada alumno, derivados de Cobros
 * (mismo repositorio, mismos pagos). Quien no tiene deuda pendiente NO entra
 * en el mapa (al día); quien vence hoy entra con días = 0. Nunca se guarda
 * este valor: es un cálculo de la vista.
 */
function vencimientosDeCobros(): Map<string, number> {
  const r = verCobros(repo.listarPagos());
  const mapa = new Map<string, number>();
  for (const f of r.filas) {
    if (f.pago) continue;
    const actual = mapa.get(f.alumno.id);
    if (actual === undefined || f.dias < actual) mapa.set(f.alumno.id, f.dias);
  }
  return mapa;
}

function filasAlumnos(): FichaVista[] {
  return construirVista(repo.listarAlumnos(), vencimientosDeCobros(), hoyLocal(reloj.ahora()));
}

function alumnoSub(a: FichaVista): string {
  const v = textoEstadoVence(a);
  const et = a.modalidad === 'mensual' ? 'et-mensual' : 'et-individual';
  return `<p class="al-sub">${esc(a.grupo)} · ${v} <span class="etiqueta ${et}">${a.modalidad === 'mensual' ? 'Mensual' : 'Individual'}</span></p><span class="al-fecha">Alta ${esc(fechaCorta(a.fechaAlta))}</span>`;
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
  const todas = filasAlumnos();
  const out = filtrarYOrdenar(todas, busquedaAlumno, filtrosAlumnos, ordenAlumnos);
  if (conteo) conteo.textContent = `${out.length} ${out.length === 1 ? 'alumno' : 'alumnos'}`;
  lista.innerHTML = out.length
    ? out.map((a) => {
        const punto = puntoEstadoVence(a);
        return `<li class="fila-alumno"><button type="button" class="alumno-fila-btn" data-ficha="${esc(a.id)}" aria-label="Abrir ficha de ${esc(a.nombre)}">
          <span class="avatar ${a.color}">${esc(a.ini)}</span><div><p class="al-nombre">${esc(a.nombre)}</p>${alumnoSub(a)}</div><span class="punto ${punto}"></span>
        </button></li>`;
      }).join('')
    : `<p class="pv-vacio">${todas.length === 0 ? 'Todavía no hay alumnos. Tocá «Nuevo alumno» para cargar el primero.' : 'Ningún alumno con estos filtros'}</p>`;
  lista.querySelectorAll<HTMLButtonElement>('[data-ficha]').forEach((b) => {
    b.addEventListener('click', () => abrirFichaConCobro(repo.listarAlumnos().find((f) => f.id === b.dataset.ficha) ?? null, b));
  });
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
  busquedaAlumno = (e.target as HTMLInputElement).value;
  pintarAlumnos();
});

/* ------------------------------------------- alta / edición de ficha (C) */

/** Diálogo de ficha: mismo sheet v5 de Cobros, sin rediseñar. */
/**
 * Texto del dato de cobro de la ficha, ya marcado para leerlo con jerarquía:
 * el estado («Venció hace 13 días», acento rosa si ya venció y ámbar mientras
 * está por vencer) y el importe quedan en su propio span; el paréntesis del
 * vencimiento sigue siendo auxiliar. Solo cambia la forma de pintar, no los
 * datos ni las reglas de Cobros (romper y pulir 22-nov).
 */
function textoCobroFicha(dias: number, montoUYU: number, fecha: string): string {
  const estado = textoVence(dias);
  const clase = dias < 0 ? 'vencido' : 'pendiente';
  return `<span class="ficha-cobro-estado ${clase}">${esc(estado)}</span> · <span class="ficha-cobro-monto">${uyu(montoUYU)}</span> (vence ${esc(fechaCorta(fecha))}).`;
}

function abrirFichaConCobro(ficha: AlumnoFicha | null, origen: HTMLElement, alCrear?: (creada: AlumnoFicha) => void): void {
  abrirFicha(ficha, origen, alCrear);
  if (!ficha) return;
  // #4: al tocar la alumna se ve su estado de cobro y se puede editar el pago
  // vinculado por ID, sin depender del nombre ni de recordar el período.
  const dialogo = document.querySelector<HTMLDialogElement>('dialog.sheet.cobros-panel[open]');
  if (!dialogo) return;
  const r = verCobros();
  const filas = r.filas.filter((f) => f.alumno.id === ficha.id);
  const deuda = filas.find((f) => !f.pago && f.dias >= 0) ?? filas.find((f) => !f.pago);
  const pagos = repo.listarPagos().filter((p) => p.alumnoId === ficha.id && !p.anulado);
  const ultimo = pagos.at(-1);
  const resumen = document.createElement('div');
  resumen.className = 'cobros-panel-nota ficha-cobro';
  const texto = ultimo
    ? `Último pago: ${esc(fechaCorta(ultimo.fecha))} · ${uyu(ultimo.montoUYU)}. Renovación: mismo día del mes siguiente.`
    : deuda
      ? textoCobroFicha(deuda.dias, deuda.alumno.montoUYU, deuda.fecha)
      : 'Sin cobros registrados.';
  // Contacto (arreglo funcional): el número real se VE en la ficha y el botón
  // abre wa.me con ESE número. Sin número no se muestra un link falso.
  const contacto = bloqueContacto(ficha.nombre, ficha.contacto ?? '', prefijoMovil);
  const avisoLink = deuda && contacto.link
    ? linkAvisoVencimiento({ telefono: conPrefijo(ficha.contacto, prefijoMovil), nombre: ficha.nombre, vencimiento: deuda.fecha })
    : null;
  resumen.innerHTML = `<p>${texto}</p>
    ${contacto.visible
      ? `<p class="ficha-contacto"><span class="ficha-contacto-rotulo">WhatsApp</span> <b>${esc(contacto.visible)}</b></p>`
      : `<p class="al-sub">${esc(contacto.ayuda ?? '')}</p>`}
    <div class="ficha-acciones">
      ${contacto.link ? `<a class="cobros-link ficha-accion ficha-accion-wa" href="${contacto.link}" target="_blank" rel="noopener" data-wa>Enviar WhatsApp</a>` : ''}
      ${avisoLink ? `<a class="cobros-link ficha-accion" href="${avisoLink}" target="_blank" rel="noopener" data-avisar>Avisar por WhatsApp (por vencer)</a>` : ''}
      <button type="button" class="cobros-link ficha-accion" data-editar-cobro>${ultimo ? 'Editar fecha del pago' : deuda ? 'Registrar pago' : 'Ver cobros'}</button>
    </div>
    <p class="al-sub">${contacto.link ? 'Los links abren WhatsApp con el mensaje escrito; el envío lo confirmás vos.' : ''}</p>`;
  dialogo.querySelector('form')?.before(resumen);
  resumen.querySelector('[data-editar-cobro]')?.addEventListener('click', () => {
    if (ultimo) {
      // El ID del pago viene del ledger por alumno; nunca del nombre.
      const fila = filas.find((f) => f.pago?.id === ultimo.id);
      dialogo.close();
      abrirPago(ficha.nombre, ultimo.periodo, ultimo.montoUYU, origen, ultimo, fila);
    } else if (deuda) {
      dialogo.close();
      abrirPago(ficha.nombre, deuda.periodo, deuda.alumno.montoUYU, origen, undefined, deuda);
    } else {
      dialogo.close();
      irA('v-cobros');
    }
  });
}

function abrirFicha(ficha: AlumnoFicha | null, origen: HTMLElement, alCrear?: (creada: AlumnoFicha) => void): void {
  const esNueva = ficha === null;
  const hoy = hoyLocal(reloj.ahora());
  const listaGrupos = listaGruposHtml();
  const contenido = `<div class="cobros-panel-resumen">
    <div><p class="al-nombre">${esNueva ? 'Nuevo alumno' : esc(ficha!.nombre)}</p>
    <p class="al-sub">${esNueva ? 'Ficha real · se guarda en este dispositivo' : `Alta ${esc(fechaCorta(ficha!.fechaAlta))}`}</p></div>
    <div class="cobros-panel-dato">${esNueva ? '' : `<span class="ficha-id">ID ${esc(ficha!.id)}</span>`}</div></div>
    <p class="cobros-panel-nota">${esNueva ? 'Completá los datos para dar de alta. Nada se envía ni crea grupos.' : 'Podés corregir nombre, modalidad, día de vencimiento y teléfono. La identidad y la fecha de alta no se cambian.'}</p>
    <form novalidate>
      <label class="campo"><span>Nombre *</span><input name="nombre" required maxlength="80" autocomplete="off" value="${esNueva ? '' : esc(ficha!.nombre)}" placeholder="Nombre y apellido"></label>
      ${esNueva ? `<p class="campo"><span>Fecha de registro *</span></p>${selectorFecha('alta', hoy)}` : ''}
      <p class="campo"><span>Modalidad *</span></p>
      <div class="ficha-grupo-opciones" role="group" aria-label="Modalidad">
        <button type="button" class="ficha-grupo" data-modalidad="mensual" aria-pressed="false">Mensual</button>
        <button type="button" class="ficha-grupo" data-modalidad="individual" aria-pressed="false">Individual</button>
      </div>
      ${esNueva ? `<p class="campo"><span>¿Pagó la primera mensualidad? *</span></p>
      <div class="ficha-grupo-opciones" role="group" aria-label="Estado del pago">
        <button type="button" class="ficha-grupo" data-pago="si" aria-pressed="false">Pagó</button>
        <button type="button" class="ficha-grupo" data-pago="no" aria-pressed="false">Va a pagar</button>
      </div>` : ''}
      <label class="campo"><span>Día de vencimiento (1–31)</span><input name="ancla" type="number" min="1" max="31" inputmode="numeric" value="${ficha?.ancla ?? 21}"></label>
      <label class="campo"><span>Grupo (opcional)</span><input name="grupo" list="${listaGrupos.id}" maxlength="40" autocomplete="off" value="${esNueva ? '' : esc(ficha!.grupo)}" placeholder="Ej.: Martes A">
        <small class="campo-ayuda">Solo una etiqueta para agrupar alumnas. No crea grupos ni manda mensajes.</small>
      </label>
      ${listaGrupos.html}
      <label class="campo"><span>Teléfono / WhatsApp</span><input name="contacto" type="tel" maxlength="120" autocomplete="tel" value="${esNueva ? '' : esc(ficha!.contacto)}" placeholder="099 123 456"></label>
      <p class="cobros-panel-error" role="alert"></p>
      <div class="sheet-acciones"><button type="button" class="btn-secundario">Volver</button>
      <button type="submit" class="btn-primario ficha-guardar">${esNueva ? 'Guardar alumno' : 'Guardar cambios'}</button></div>
    </form>`;
  const dialogo = abrirDialogoCobros(esNueva ? 'Nuevo alumno' : 'Editar ficha', 'Alumnos', 'alumnos', contenido, origen);
  if (esNueva) cablearFecha(dialogo, 'alta');

  let modalidad = ficha?.modalidad ?? 'mensual';
  let pagado = false;
  const pintarSeleccion = () => {
    dialogo.querySelectorAll<HTMLButtonElement>('[data-modalidad]').forEach((b) => {
      const on = b.dataset.modalidad === modalidad;
      b.classList.toggle('activo', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };
  dialogo.querySelectorAll<HTMLButtonElement>('[data-modalidad]').forEach((b) => b.addEventListener('click', () => { modalidad = b.dataset.modalidad as AlumnoFichaInput['modalidad']; pintarSeleccion(); }));
  pintarSeleccion();
  const pintarPago = () => dialogo.querySelectorAll<HTMLButtonElement>('[data-pago]').forEach((b) => {
    const on = b.dataset.pago === (pagado ? 'si' : 'no');
    b.classList.toggle('activo', on);
    b.setAttribute('aria-pressed', String(on));
  });
  dialogo.querySelectorAll<HTMLButtonElement>('[data-pago]').forEach((b) => b.addEventListener('click', () => { pagado = b.dataset.pago === 'si'; pintarPago(); }));

  const form = dialogo.querySelector('form')!;
  const error = form.querySelector<HTMLElement>('[role="alert"]')!;
  form.querySelector('.btn-secundario')!.addEventListener('click', () => cerrarDialogoConAviso(dialogo));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!dialogo.open) return;
    const datos = new FormData(form);
    const fechaAlta = esNueva ? leerFechaDe(dialogo, 'alta') : ficha!.fechaAlta;
    if (esNueva && !fechaAlta) {
      error.textContent = 'Elegí la fecha de registro';
      return;
    }
    const anclaRaw = String(datos.get('ancla') ?? '').trim();
    const input: AlumnoFichaInput = {
      nombre: String(datos.get('nombre') ?? ''),
      modalidad,
      contacto: String(datos.get('contacto') ?? ''),
      ancla: anclaRaw === '' ? undefined : Number(anclaRaw),
      fechaAlta: fechaAlta ?? undefined,
      pagado: esNueva ? pagado : undefined,
      grupo: String(datos.get('grupo') ?? ''),
    };
    const errores = validarAlumno(input);
    if (Object.keys(errores).length > 0) {
      error.textContent = Object.values(errores)[0]!;
      return;
    }
    let creada: AlumnoFicha | undefined;
    try {
      if (esNueva) creada = repo.crearAlumno(input);
      else repo.editarAlumno(ficha!.id, input);
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : 'No se pudo guardar la ficha';
      return;
    }
    dialogo.close();
    if (creada && alCrear) alCrear(creada);
    pintarAlumnos();
    pintarCobros();
    avisar(esNueva ? 'Alumno guardado' : 'Ficha actualizada');
  });
}

$('#nuevo-alumno')?.addEventListener('click', (e) => abrirFicha(null, e.currentTarget as HTMLElement));

/**
 * Grupos reales (punto 6, alcance mínimo del plan: pocos grupos, sin crear
 * «salones»): la etiqueta `grupo` de cada ficha MÁS el nombre de las clases,
 * que es como Xime nombra sus grupos. Se ofrece como sugerencia con un
 * `<datalist>`: escribir un grupo nuevo lo crea (es solo una etiqueta), y
 * repetir uno existente agrupa sin duplicar. Nada se envía ni se comparte.
 */
function gruposConocidos(): string[] {
  // Las fichas guardan el grupo sin el prefijo «Grupo » («Martes A»): se
  // normaliza igual acá para que el datalist no ofrezca valores que después
  // se guardan distintos de lo que se ve.
  const sinPrefijo = (s: string) => s.trim().replace(/^Grupo\s+/i, '').trim();
  const deFichas = repo.listarAlumnos().map((f) => sinPrefijo(f.grupo)).filter(Boolean);
  const deClases = clases.map((c) => sinPrefijo(c.nombre))
    .filter((n) => n.length > 0 && n.length <= 40 && !/^\d/.test(n));
  return [...new Set([...deFichas, ...deClases])].sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * `<datalist>` de grupos, para reusar la etiqueta sin tipear de nuevo.
 * Devuelve el HTML y el id que el input debe referenciar en `list`.
 */
let idListaGrupos = 0;
function listaGruposHtml(): { html: string; id: string } {
  idListaGrupos += 1;
  const id = `lista-grupos-${idListaGrupos}`;
  const opciones = gruposConocidos().map((g) => `<option value="${esc(g)}"></option>`).join('');
  return { html: `<datalist id="${id}">${opciones}</datalist>`, id };
}

/**
 * Punto 7: desde el «Agregar» del calendario también se puede dar de alta una
 * alumna. Usa la MISMA ficha v5 (sin rediseñar) y, al guardar, agendas una
 * clase suelta el día elegido con la alumna vinculada por ID estable.
 * Si el día elegido es anterior a hoy, se agenda hoy: no se inventa pasado.
 */
function abrirFichaAltaParaAgendar(fechaElegida?: string): void {
  const hoy = hoyLocal(reloj.ahora());
  const fecha = fechaElegida && fechaElegida >= hoy ? fechaElegida : hoy;
  const origen = $('.cel') as HTMLElement;
  abrirFicha(null, origen, (creada) => {
    // La clase guarda el ID de la alumna: nunca el nombre, que puede cambiar.
    repo.crear({
      id: nuevoId('suelta'),
      nombre: creada.nombre,
      fecha,
      hora: '15:00',
      duracionMin: 60,
      alumnos: [{ id: creada.id, nombre: creada.nombre, telefono: creada.contacto }],
    });
    clases = repo.listar();
    mesSeleccionado = fecha;
    diaMesSeleccionado = fecha;
    pintarSemanaDe(fecha);
    pintarTarjetasDiaMes();
    avisar(`${creada.nombre} agregada y agendada el ${etiquetaDia(fecha)}`);
  });
}

/* ------------------------------------------------------------- cobros */
const formatoUYU = new Intl.NumberFormat('es-UY', { useGrouping: 'always' });
const uyu = (monto: number) => `$${formatoUYU.format(monto)}`;
const listaCobros = document.querySelector<HTMLUListElement>('#lista-cobros')!;
const botonHistorial = document.querySelector<HTMLButtonElement>('#abrir-historial')!;
const campana = document.querySelector<HTMLButtonElement>('.campana')!;
/** Tarifa por defecto para fichas creadas desde la app (demo usa 6500). */
const MONTO_UYU = 6500;
/**
 * Alumnos de Cobros: TODAS las fichas, vinculadas por ID estable. El nombre y
 * el grupo vigentes salen de la ficha; el ancla y la tarifa de la demo se
 * respetan, y una ficha nueva usa su ancla con la tarifa por defecto.
 */
function alumnosParaCobros() {
  const montos = new Map(alumnosCobrosDemo.map((a) => [a.id, a.montoUYU]));
  return repo.listarAlumnos().map((f) => ({
    id: f.id, nombre: f.nombre, grupo: f.grupo,
    ancla: f.ancla, montoUYU: montos.get(f.id) ?? MONTO_UYU,
  }));
}
const verCobros = (pagos = repo.listarPagos()) => resumenCobros(alumnosParaCobros(), pagos, hoyLocal(reloj.ahora()));
type FilaCobro = ReturnType<typeof verCobros>['filas'][number];

function fechaBreve(fecha: string) {
  return fechaCorta(fecha);
}

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
  // Estado vacío = información neutra, no alerta ámbar (sin vencimientos no hay nada que alertar).
  $('#v-hoy .aviso')!.classList.toggle('vacio', n === 0);
  $('#v-hoy .aviso strong')!.textContent = n === 1 ? '1 mensualidad vence hoy' : `${n} mensualidades vencen hoy`;
  $('#v-hoy .aviso-sub')!.textContent = n
    ? `${new Intl.ListFormat('es-UY').format(r.vencenHoy.map((f) => f.alumno.nombre))} · Ver en Cobros`
    : 'No hay vencimientos para hoy';
  const avisos = r.avisos.length;
  campana.setAttribute('aria-label', avisos === 1 ? '1 aviso de cobro' : `${avisos} avisos de cobro`);
  campana.querySelector<HTMLElement>('.campana-punto')!.hidden = avisos === 0;

  listaCobros.innerHTML = r.filas.map((f, indice) => `<li>
    <button type="button" class="cobro-fila" data-fila="${indice}" aria-haspopup="dialog"
      aria-label="${f.pago ? 'Ver pago' : 'Registrar pago'} de ${esc(f.alumno.nombre)}, ${f.periodo}">
      <span><span class="al-nombre">${esc(f.alumno.nombre)}</span>
      <span class="al-sub">${f.pago ? `Pagado el ${fechaBreve(f.pago.fecha)}` : textoVence(f.dias)} · ${esc(f.alumno.grupo)}</span></span>
      <strong class="monto ${f.pago ? 'monto-ok' : f.dias > 0 ? 'monto-suave' : ''}">${f.pago ? 'Pagado' : uyu(f.alumno.montoUYU)}</strong>
      <svg class="ico" width="13" height="13" aria-hidden="true"><use href="#i-der"/></svg>
    </button>
  </li>`).join('');
  listaCobros.querySelectorAll<HTMLButtonElement>('[data-fila]').forEach((b, i) => {
    const fila = r.filas[i];
    b.addEventListener('click', () => abrirPago(fila.alumno.nombre, fila.periodo, fila.alumno.montoUYU, b, fila.pago, fila));
  });
}

function nombrePago(pago: Pago) {
  // Coherencia por ID: si se editó la ficha, Cobros muestra el nombre vigente.
  return repo.listarAlumnos().find((a) => a.id === pago.alumnoId)?.nombre
    ?? alumnosCobrosDemo.find((a) => a.id === pago.alumnoId)?.nombre
    ?? pago.alumnoId;
}

botonHistorial.addEventListener('click', () => {
  const pagos = [...repo.listarPagos()].reverse();
  const dialogo = abrirDialogoCobros('Historial de pagos', 'Cobros', 'reloj', pagos.length ? `<ul class="cobros-panel-lista">${pagos.map((p, i) => `<li>
    <div><p class="al-nombre">${esc(nombrePago(p))}</p><p class="al-sub">${esc(p.periodo)} · Registrado el ${esc(fechaCorta(p.fecha))} por ${esc(p.quien)}</p>
      ${p.anulado ? `<p class="al-sub">Anulado el ${esc(fechaCorta(p.anulado.fecha))} por ${esc(p.anulado.quien)} · ${esc(p.anulado.motivo)}</p>` : ''}</div>
    <div class="cobros-panel-dato"><strong>${uyu(p.montoUYU)}</strong>
      ${p.anulado ? '<span class="al-sub">Anulado</span>' : `<button type="button" class="cobros-link" data-pago="${i}" aria-label="Ver pago de ${esc(nombrePago(p))}, ${esc(p.periodo)}">Ver pago</button>`}</div>
  </li>`).join('')}</ul>` : '<p class="cobros-panel-nota">Todavía no registraste pagos.</p>', botonHistorial);
  dialogo.querySelectorAll<HTMLButtonElement>('[data-pago]').forEach((b) => {
    const pago = pagos[Number(b.dataset.pago)];
    b.addEventListener('click', () => {
      dialogo.close();
      dialogo.remove();
      abrirPago(nombrePago(pago), pago.periodo, pago.montoUYU, botonHistorial, pago);
    });
  });
});

function abrirDialogoCobros(titulo: string, contexto: string, icono: string, contenido: string, origen: HTMLElement) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'sheet cobros-panel';
  // Diálogo modal accesible: role + aria-modal + título etiquetado (Gino,
  // accesibilidad 23-nov). El foco ya lo atrapa el top layer del <dialog>;
  // el trap de Tab cubre el caso de foco movido por código fuera de la lista.
  dialogo.setAttribute('role', 'dialog');
  dialogo.setAttribute('aria-modal', 'true');
  dialogo.setAttribute('aria-labelledby', 'cobros-panel-titulo');
  dialogo.innerHTML = `<div class="sheet-head cobros-panel-head">
    <span class="cobros-panel-icono"><svg class="ico" width="21" height="21" aria-hidden="true"><use href="#i-${icono}"/></svg></span>
    <div><p class="sheet-eyebrow">${esc(contexto)}</p><h3 id="cobros-panel-titulo">${esc(titulo)}</h3></div>
    <button type="button" class="sheet-cerrar" aria-label="Cerrar" autofocus><svg class="ico" width="18" height="18" aria-hidden="true"><use href="#i-mas2"/></svg></button></div>${contenido}`;
  $('.cel')!.appendChild(dialogo);
  abrirSheet(dialogo);
  dialogo.showModal();
  const soltarTrap = atraparTab(dialogo);

  observarCambios(dialogo); // cubre el-form y los chips de modalidad/grupo
  const form = dialogo.querySelector('form') as HTMLFormElement | null;
  const submit = () => form?.requestSubmit();
  const cerrarConAviso = () => {
    if (document.querySelector('dialog.confirmar-cambios[open]')) return; // ya hay un aviso
    if (dialogo.dataset.dirty === '1') {
      confirmarCierreConCambios(dialogo, submit, () => dialogo.close());
    } else dialogo.close();
  };
  // Guardamos el cierre con aviso en el elemento para que la X, el "Volver",
  // el toque fuera, Escape y el cambio de vista usen TODOS el mismo camino.
  (dialogo as HTMLDialogElement & { cerrarConAviso?: () => void }).cerrarConAviso = cerrarConAviso;
  dialogo.querySelector('.sheet-cerrar')!.addEventListener('click', cerrarConAviso);
  // Escape sobre el modal: el evento `cancel` se dispara en el <dialog> mismo;
  // engancharlo acá (y no solo en `document`) evita perderlo cuando hay modales
  // apilados, que era el motivo por el que cerraba sin avisar.
  dialogo.addEventListener('cancel', (e) => { e.preventDefault(); cerrarConAviso(); });
  dialogo.addEventListener('close', () => {
    dialogo.dataset.lockLiberado = '1';
    soltarTrap();
    dialogo.remove();
    liberarSiNoHaySheets();
    if (!document.querySelector('.cobros-panel[open]') && origen.isConnected) origen.focus();
    else if (!document.querySelector('.cobros-panel[open]')) toast.focus(); // origen fuera del DOM: el toast como ancla accesible
  });
  return dialogo;
}

/** Cierra un <dialog> de los de cobros/ficha pasando por su aviso, si existe. */
function cerrarDialogoConAviso(dlg: HTMLDialogElement): void {
  const conAviso = (dlg as HTMLDialogElement & { cerrarConAviso?: () => void }).cerrarConAviso;
  if (conAviso) conAviso();
  else dlg.close();
}

function abrirPago(nombre: string, periodo: string, monto: number, origen: HTMLElement, pago?: Pago, fila?: FilaCobro) {
  const accion = pago ? 'Anular pago' : 'Registrar pago';
  const mes = etiquetaMes(`${periodo}-01`);
  const dialogo = abrirDialogoCobros(accion, 'Mensualidad', pago ? 'alerta' : 'cobros', `<div class="cobros-panel-resumen">
    <div><p class="al-nombre">${esc(nombre)}</p><p class="al-sub">${esc(mes)}</p></div>
    <div class="cobros-panel-dato"><strong>${uyu(pago?.montoUYU ?? monto)}</strong><span class="al-sub">UYU</span></div></div>
    <p class="cobros-panel-nota">${pago ? `Registrado el ${esc(fechaCorta(pago.fecha))} por ${esc(pago.quien)}. Podés corregir la fecha en que pagó/renovió o anular el pago; queda en el historial.` : 'Confirmá cuándo pagó/renovió. La app no mueve dinero.'}</p>
    <form>
      ${pago ? `<label class="campo"><span>Fecha del pago (día / mes / año)</span></label>${selectorFecha('pago', pago.fecha)}
      <label class="campo"><span>Motivo de anulación (opcional)</span><input name="motivo" maxlength="160"></label>`
      : `<label class="campo"><span>¿Cuándo pagó/renovió? *</span></label>${selectorFecha('pago', hoyLocal(reloj.ahora()))}`}
      <p class="cobros-panel-error" role="alert"></p>
      <div class="sheet-acciones"><button type="button" class="btn-secundario">Volver</button>
      ${pago ? '<button type="button" class="btn-secundario cobros-anular">Anular pago</button>' : ''}
      <button type="submit" class="btn-primario">${pago ? 'Guardar fecha' : 'Confirmar pago'}</button></div>
    </form>`, origen);
  cablearFecha(dialogo, 'pago');
  const form = dialogo.querySelector('form')!;
  form.querySelector('.btn-secundario')!.addEventListener('click', () => cerrarDialogoConAviso(dialogo));
  form.querySelector('.cobros-anular')?.addEventListener('click', () => {
    try {
      repo.anularPago(pago!.id, String(new FormData(form).get('motivo') ?? ''), QUIEN);
      dialogo.close();
      pintarCobros();
    } catch (err) {
      form.querySelector('[role="alert"]')!.textContent = err instanceof Error ? err.message : 'No se pudo anular';
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!dialogo.open) return;
    const fecha = leerFechaDe(dialogo, 'pago');
    if (!fecha) {
      form.querySelector('[role="alert"]')!.textContent = 'Elegí una fecha válida';
      return;
    }
    try {
      if (pago) {
        // Corregir la fecha del pago conserva el MISMO ID y vínculo por alumno;
        // el cambio queda registrado, sin inventar otro pago.
        const motivo = String(new FormData(form).get('motivo') ?? '').trim() || 'Corrección de fecha';
        repo.corregirFechaPago(pago.id, fecha, motivo, QUIEN);
      } else if (fila) {
        const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => n.toString(16).padStart(8, '0')).join('');
        repo.registrarPago({ id, alumnoId: fila.alumno.id, periodo, montoUYU: monto, quien: QUIEN, fecha });
      }
    } catch (error) {
      form.querySelector('[role="alert"]')!.textContent = error instanceof Error ? error.message : 'No se pudo guardar';
      return;
    }
    dialogo.close();
    pintarCobros();
    if (origen.dataset.fila) listaCobros.querySelector<HTMLButtonElement>(`[data-fila="${origen.dataset.fila}"]`)?.focus();
    else botonHistorial.focus();
  });
}

campana.addEventListener('click', () => {
  const { avisos } = verCobros();
  const fichas = new Map(repo.listarAlumnos().map((f) => [f.id, f]));
  const avisarLink = (f: (typeof avisos)[number]) => {
    const tel = fichas.get(f.alumno.id)?.contacto ?? '';
    return tel ? linkAvisoVencimiento({ telefono: conPrefijo(tel, prefijoMovil), nombre: f.alumno.nombre, vencimiento: f.fecha }) : null;
  };
  const dlg = abrirDialogoCobros('Avisos de cobro', 'Mensualidades', 'campana', avisos.length ? `<p class="cobros-panel-nota">Mensualidades sin pagar que vencen hoy o en los próximos 7 días. «Avisar por WhatsApp» abre el chat con el mensaje ya escrito: el envío lo confirmás vos en WhatsApp.</p>
    <ul class="cobros-panel-lista">${avisos.map((f, i) => `<li>
    <div><p class="al-nombre">${esc(f.alumno.nombre)}</p><p class="al-sub">${esc(f.alumno.grupo)}</p>
    ${avisarLink(f) ? `<a class="cobros-link" href="${avisarLink(f)}" target="_blank" rel="noopener" data-avisar="${i}">Avisar por WhatsApp</a>` : '<span class="al-sub">Sin teléfono cargado</span>'}</div>
    <span class="cobros-aviso${f.dias === 0 ? ' cobros-aviso-hoy' : ''}">${textoVence(f.dias)}</span></li>`).join('')}</ul>
    <div class="cobros-panel-pie"><button class="btn-secundario" type="button" data-ver-cobros>Ver Cobros</button></div>`
    : '<p class="cobros-panel-nota">No hay avisos de vencimientos.</p>', campana);
  dlg.querySelector('[data-ver-cobros]')?.addEventListener('click', (e) => {
    (e.currentTarget as HTMLElement).closest('dialog')?.close();
    irA('v-cobros');
  });
});

/* ------------------------------------------------------------- navegación */
/** Cierra cualquier sheet abierto antes de cambiar de vista. */
function cerrarSheetsPorNavegacion(): void {
  if (sheet) cerrarAcciones();
  $$('.sheet:not(.cerrando):not(.cobros-panel)').forEach((el) => cerrarCuadro(el as HTMLElement));
  $$('dialog.sheet[open]').forEach((el) => cerrarDialogoConAviso(el as HTMLDialogElement));
}

/** Ejecuta el cierre de un sheet por toque fuera (mismo camino que X/Volver). */
function cerrarSheetPorFuera(abierto: HTMLElement): void {
  if (abierto.classList.contains('cobros-panel')) {
    cerrarDialogoConAviso(abierto as HTMLDialogElement);
    return;
  }
  if (abierto === sheet) cerrarAcciones();
  else if (abierto.dataset.dirty === '1') {
    // Los cuadros sin submit propio (p. ej. «Agendar») también avisan.
    const form = abierto.querySelector('form') as HTMLFormElement | null;
    if (form) cerrarCuadroConCambios(abierto, () => form.requestSubmit());
    else cerrarCuadro(abierto);
  } else cerrarCuadro(abierto);
}

/**
 * Cierre por toque fuera. NO se decide en `pointerdown`: eso cerraba apenas
 * apoyar el dedo fuera, con lo que un arrastre para scrollear cerraba el sheet.
 * Guardamos el inicio y sólo cerramos en `pointerup` si el mismo puntero
 * terminó fuera, sin movimiento de arrastre y sin cancelación (Gino d45758fa).
 */
let toqueFueraInicio: { pointerId: number; punto: PuntoToque; maxDesplazamiento: number } | null = null;

// Tras cerrar por tap fuera, el navegador despacha un `click` sintético en el
// mismo punto. Como el <dialog> ya se cerró, ese click atraviesa el backdrop y
// cae sobre la UI de debajo (en Cobros, un `cobro-fila` que reabría el sheet).
// Marcamos el cierre para truncar sólo ESE click; se consume en el primero que
// llegue y se limpia en el próximo pointerdown por si no llegara ninguno.
let clickTrasCierrePendiente = false;

function puntoDentroDelSheet(abierto: HTMLElement): (p: PuntoToque) => boolean {
  return (p) => {
    const r = abierto.getBoundingClientRect();
    return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
  };
}

document.addEventListener('pointerdown', (e) => {
  const destino = e.target;
  // Un gesto nuevo descarta cualquier supresión pendiente de un cierre previo.
  clickTrasCierrePendiente = false;
  if (!(destino instanceof Element)) return;
  if (destino.closest('.confirmar-cambios')) return; // el aviso tiene sus botones
  const abierto = document.querySelector('.sheet:not(.cerrando)') as HTMLElement | null;
  if (!abierto) return;
  const punto: PuntoToque = { x: e.clientX, y: e.clientY };
  const r = abierto.getBoundingClientRect();
  // Con un <dialog> modal el ::backdrop reorienta `e.target` al propio dialog:
  // `abierto.contains(destino)` daba true aunque el dedo estuviera fuera y el
  // cierre nunca se registraba. Decidimos SOLO por coordenadas (pura aritmética
  // sobre el rect, sin hit testing que reactive la página). `targetEsElSheet`
  // se usa únicamente si el navegador no dio coordenadas útiles ((0,0)).
  const targetEsElSheet = destino === abierto || abierto.contains(destino);
  if (!esToqueFuera(punto, { left: r.left, right: r.right, top: r.top, bottom: r.bottom }, targetEsElSheet)) {
    toqueFueraInicio = null;
    return;
  }
  toqueFueraInicio = { pointerId: e.pointerId, punto, maxDesplazamiento: 0 };
}, true);

// Acumulamos el mayor desplazamiento del gesto: un arrastre que vuelve al
// origen no debe pasar por tap aunque inicio≈fin.
document.addEventListener('pointermove', (e) => {
  const gesto = toqueFueraInicio;
  if (!gesto || gesto.pointerId !== e.pointerId) return;
  const dx = e.clientX - gesto.punto.x;
  const dy = e.clientY - gesto.punto.y;
  gesto.maxDesplazamiento = Math.max(gesto.maxDesplazamiento, Math.hypot(dx, dy));
}, true);

document.addEventListener('pointerup', (e) => {
  const inicio = toqueFueraInicio;
  toqueFueraInicio = null;
  if (!inicio || inicio.pointerId !== e.pointerId) return;
  const abierto = document.querySelector('.sheet:not(.cerrando)') as HTMLElement | null;
  if (!abierto) return;
  const fin: PuntoToque = { x: e.clientX, y: e.clientY };
  if (debeCerrarPorToqueFuera(
    inicio.punto, fin, false, puntoDentroDelSheet(abierto), undefined, inicio.maxDesplazamiento,
  )) {
    cerrarSheetPorFuera(abierto);
    // El click sintético que viene con este tap debe truncarse: si no, cae
    // sobre la UI que quedó al descubierto y puede reabrir el sheet (Cobros).
    clickTrasCierrePendiente = true;
  }
}, true);

// Truncamos el click sintético posterior al cierre por tap fuera. Es el primer
// click que llega tras el pointerup, y su target ya no es el dialog cerrado.
// No tocamos los clicks del aviso de cambios: ese es otro modal y tiene su
// propio camino (el flag se pone a false apenas se consume).
document.addEventListener('click', (e) => {
  if (!debeSuprimirClickTrasCierre(clickTrasCierrePendiente)) return;
  clickTrasCierrePendiente = false;
  e.preventDefault();
  e.stopPropagation();
}, true);

// El sistema tomó el gesto (scroll, pull-to-refresh…): no es un tap de cierre.
document.addEventListener('pointercancel', (e) => {
  if (toqueFueraInicio?.pointerId === e.pointerId) toqueFueraInicio = null;
}, true);

// Escape: los <dialog> nativos lo manejan con su propio `cancel` (enganchado
// en abrirDialogoCobros); los sheets <div> los atiende acá. Si hay un aviso de
// cambios abierto, su `cancel` ya lo cierra como "Seguir editando": no hacemos
// nada para no cerrar también el sheet de abajo ni solapar dos avisos.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (document.querySelector('dialog.confirmar-cambios[open]')) return;
  // Un <dialog> modal abierto ya recibió (o va a recibir) su evento `cancel`.
  if (document.querySelector('dialog.sheet[open]')) return;
  if (sheet && !sheet.classList.contains('cerrando')) { e.preventDefault(); cerrarAcciones(); return; }
  const div = document.querySelector('.sheet:not(.cerrando):not(.cobros-panel)') as HTMLElement | null;
  if (div) {
    e.preventDefault();
    const form = div.querySelector('form') as HTMLFormElement | null;
    if (form && div.dataset.dirty === '1') cerrarCuadroConCambios(div, () => form.requestSubmit());
    else cerrarCuadro(div);
  }
});

const tabs = $$('.tab') as HTMLElement[];
const vistas = $$('.vista') as HTMLElement[];
const titulos: Record<string, string> = {
  'v-hoy': 'Hoy', 'v-semana': 'Clases', 'v-mes': 'Agenda', 'v-alumnos': 'Alumnos', 'v-cobros': 'Cobros',
};

function pintarTitulo(id: string) {
  const h1 = $('.barra-titulo');
  if (h1) h1.textContent = titulos[id] || 'Hoy';
}

function irA(id: string, fijarHash = true) {
  const destino = document.getElementById(id);
  if (!destino) return;
  cerrarSheetsPorNavegacion();
  // Una sola pantalla a la vez, por construcción: el destino se lleva `activa`
  // y el resto la pierde siempre (no depende de qué clases traiga el HTML).
  const activas = new Set(vistasActivas(vistas.map((v) => v.id), id));
  vistas.forEach((v) => v.classList.toggle('activa', activas.has(v.id)));
  void destino.offsetWidth;
  const pestaña = id === 'v-mes' ? 'v-semana' : id;
  tabs.forEach((t) => {
    const on = t.getAttribute('href') === '#' + pestaña;
    t.classList.toggle('activo', on);
    if (on) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
  pintarTitulo(id);
  // Los chips de Alumnos desbordan a 320 px: recalcular la pista recién cuando
  // la vista está visible (oculta, `clientWidth` es 0 y todo parece entrar).
  if (id === 'v-alumnos') actualizarPistaFiltros();
  if (fijarHash && history.replaceState) history.replaceState(null, '', '#' + id);
  // replaceState no dispara hashchange: reconfigurar la barra acá al cambiar de vista.
  window.scrollTo(0, 0);
  document.querySelector('.tabbar')?.classList.remove('oculta');
  document.documentElement.classList.remove('barra-oculta');
}

tabs.forEach((t) => t.addEventListener('click', (e) => {
  e.preventDefault();
  irA((t.getAttribute('href') as string).slice(1));
}));

/* -------------------------------------- barra inferior: ocultar al bajar */
// Se desliza fuera de pantalla al bajar por el contenido y vuelve al subir,
// para ganar espacio útil en el celu. La decisión (zona muerta, tope, etc.)
// vive en `src/barra-scroll.ts` y es pura; acá solo se aplica al DOM.
const tabbar = document.querySelector('.tabbar') as HTMLElement | null;
if (tabbar) {
  let estado: EstadoBarra = estadoBarraInicial(window.scrollY);
  let framePendiente = false;
  let temporizador: ReturnType<typeof setTimeout> | null = null;

  const cancelarTemporizador = () => {
    if (temporizador !== null) { clearTimeout(temporizador); temporizador = null; }
  };

  // El telón crema (body::after) debe desvanecerse con la barra: si no, queda
  // una franja crema flotando cuando la cápsula se desliza fuera de pantalla.
  const aplicar = (ocultar: boolean) => {
    tabbar.classList.toggle('oculta', ocultar);
    document.documentElement.classList.toggle('barra-oculta', ocultar);
    estado = { ...estado, oculta: ocultar };
  };

  const recalibrar = () => {
    cancelarTemporizador();
    estado = estadoBarraInicial(window.scrollY);
    aplicar(false);
  };

  // Si la barra quedó oculta, (re)arma el reloj de quietud: cada muestra de
  // scroll reinicia el temporizador, así sólo vuelve sola tras ~500 ms sin tocar.
  // Al vencer, la decisión pura confirma que sigue oculta y la mostramos con
  // la misma transición (quitar `.oculta`), recalibrando la referencia de
  // scroll para que un baje subsecuente la oculte sin rebotes.
  const rearmarSiOculta = () => {
    cancelarTemporizador();
    // En Inicio la barra debe estar siempre visible: nunca la ocultamos ni
    // armamos el temporizador ahí (así no queda un reloj colgando al volver).
    if (!estado.oculta || document.getElementById('v-hoy')?.classList.contains('activa')) return;
    temporizador = setTimeout(() => {
      temporizador = null;
      if (debeReaparecerPorQuietud(estado, REAPARECER_TRAS_MS)) recalibrar();
    }, REAPARECER_TRAS_MS);
  };

  const muestrear = () => {
    framePendiente = false;
    // En Inicio Nico quiere la barra siempre visible: la ocultación queda
    // sólo para vistas con scroll largo.
    if (document.getElementById('v-hoy')?.classList.contains('activa')) {
      recalibrar();
      return;
    }
    // Recortar contra el scroll máximo real evita que el rebote elástico del
    // final de la página se lea como «subida» y haga reaparecer la barra.
    const limite = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    estado = actualizarBarra(estado, window.scrollY, limite);
    aplicar(estado.oculta);
    rearmarSiOculta();
  };

  window.addEventListener('scroll', () => {
    if (framePendiente) return;
    framePendiente = true;
    requestAnimationFrame(muestrear);
  }, { passive: true });

  // Nunca dejar un destino invisible pero enfocable: si el teclado enfoca
  // la barra (Tab), se muestra y se reinicia la referencia de scroll.
  tabbar.addEventListener('focusin', recalibrar);

  // Con la pestaña en segundo plano los temporizadores se retrasan: al volver,
  // recalibrar para que el reloj no dispare una reaparición "fantasma".
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) recalibrar();
  });

  // Al cambiar de vista puede cambiar la altura del contenido y el scroll;
  // recalcular la referencia para no interpretar ese salto como una dirección.
  window.addEventListener('hashchange', recalibrar);
  window.addEventListener('resize', recalibrar, { passive: true });
}

/* ---------------------------------------- pista de scroll de los chips */
// Los chips de Alumnos son más anchos que la pantalla a 320 px y la barra de
// scroll está oculta por diseño: sin pista, no se notaba que había más chips.
// El degradado de borde (CSS) se prende según la política pura `pistaDeTira`.
function actualizarPistaFiltros() {
  const tira = $('#alumnos-filtros');
  const filtros = $('#filtros-alumnos');
  if (!tira || !filtros) return;
  const pista = pistaDeTira({
    scrollLeft: filtros.scrollLeft,
    scrollWidth: filtros.scrollWidth,
    clientWidth: filtros.clientWidth,
  });
  tira.classList.toggle('pista-inicio', pista.inicio);
  tira.classList.toggle('pista-fin', pista.fin);
}

$('#filtros-alumnos')?.addEventListener('scroll', actualizarPistaFiltros, { passive: true });
window.addEventListener('resize', actualizarPistaFiltros, { passive: true });
// Con la pestaña en segundo plano el layout cambia de ancho: al volver, recalcular.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) actualizarPistaFiltros();
});
// Primer cálculo tras el layout inicial (fuentes y estilos ya aplicados).
requestAnimationFrame(actualizarPistaFiltros);

$$('a.link-suave').forEach((a) => a.addEventListener('click', (e) => {
  const destino = destinoDeEnlace(a.getAttribute('href'));
  if (!destino) return; // enlace convertido en botón (p. ej. «Ver mes»)
  e.preventDefault();
  irA(destino);
}));

// El mes es una vista dentro de Clases: el enlace «Ver mes» entra sin hash
// propio para que la navegación hacia atrás no se coma la vista activa.
$$('a.link-suave[href="#v-mes"]').forEach((a) => {
  a.removeAttribute('href');
  a.setAttribute('role', 'button');
  a.setAttribute('tabindex', '0');
  a.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k === 'Enter' || k === ' ') { e.preventDefault(); irA('v-mes', false); }
  });
  a.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); irA('v-mes', false); });
});

$('.fab')?.addEventListener('click', () => abrirAgendar());
window.addEventListener('storage', (e) => { if (e.key === CLAVE_ESTADO) { pintarCobros(); pintarAlumnos(); } });

/* --------------------------------------------------------------- arranque */
function refrescar() {
  pintarSemana();
  pintarHoy();
  pintarMes();
  pintarAlumnos();
}

// Al abrir se generan las ocurrencias que falten. NO se marca nada por hora:
// «Dada» es siempre una marca manual de la dueña (decisión de Nico, 21/11).
//
// El mes abierto es estado de pantalla y arranca en la fecha REAL: si se
// conservara el mes que se estaba mirando (p. ej. enero 2027) al volver a
// abrir en #v-mes, el calendario se vería en ese mes con «Hoy» en la fecha
// real y parecería que la app perdió el día. Solo se conserva el día elegido
// cuando cae en el mes de hoy (regla en `src/agenda-mes.ts`).
const hoyAlAbrir = hoyLocal(reloj.ahora());
mesSeleccionado = mesDe(hoyAlAbrir) + '-01';
diaMesSeleccionado = diaSeleccionadoAlCargar(diaMesSeleccionado, hoyAlAbrir);

/** Vuelve el almanaque al mes de hoy; lo usa la entrada real a la app. */
function alinearMesConHoy(): void {
  const hoy = hoyLocal(reloj.ahora());
  mesSeleccionado = mesDe(hoy) + '-01';
  diaMesSeleccionado = diaSeleccionadoAlCargar(diaMesSeleccionado, hoy);
  pintarMes();
}

clases = repo.reconciliar();
refrescar();
pintarCobros();
let diaCobros = hoyLocal(reloj.ahora());

/** Reconcilia con el reloj REAL: desde el 23/11 no cambia estados (el
 *  auto-marcado está descartado), pero sigue generando ocurrencias nuevas y
 *  repinta si aparecieron clases. Nunca avisa «se marcaron por la hora». */
function reconciliarAlVolver(): void {
  const antes = clases.length;
  clases = repo.reconciliar();
  if (clases.length !== antes) refrescar();
}

// Vuelta de segundo plano: reconciliar YA (sin esperar al cron de 30 s), con
// el reloj real, tanto al hacer visible la pestaña como al restaurar la página
// desde la caché del navegador (pageshow, típico en móvil). Si la página viene
// de la caché, el mes en memoria es del día en que se miró: vuelve al real.
const alVolver = (e?: PageTransitionEvent) => {
  if (e?.persisted) alinearMesConHoy();
  reconciliarAlVolver();
};
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') alVolver();
});
window.addEventListener('pageshow', (e) => alVolver(e));

// El cron local avanza solo mientras la app está abierta (plan §2.1).
setInterval(() => {
  const hoy = hoyLocal(reloj.ahora());
  if (hoy !== diaCobros) {
    diaCobros = hoy;
    pintarCobros();
    pintarAlumnos();
  }
  reconciliarAlVolver();
}, 30000);

/* ------------------------- configuración: prefijo de móvil (punto 9) ------- */
/** Prefijo vigente en este dispositivo; se lee una vez al abrir. */
let prefijoMovil = prefijoSeguro(localStorage.getItem(CLAVE_PREFIJO));

function abrirConfiguracion(origen: HTMLElement): void {
  const contenido = `<p class="cobros-panel-nota">Se agrega a los números de WhatsApp que no lo traigan. Ejemplo: ${esc(prefijoMovil)} (Uruguay).</p>
    <form novalidate>
      <label class="campo"><span>Prefijo de país</span><input name="prefijo" type="text" maxlength="5" inputmode="text" value="${esc(prefijoMovil)}" placeholder="${PREFIJO_POR_DEFECTO}"></label>
      <p class="cobros-panel-error" role="alert"></p>
      <div class="sheet-acciones"><button type="button" class="btn-secundario">Volver</button>
      <button type="submit" class="btn-primario">Guardar prefijo</button></div>
    </form>`;
  const dialogo = abrirDialogoCobros('Configuración', 'Ajustes de este dispositivo', 'ajustes', contenido, origen);
  const form = dialogo.querySelector('form')!;
  const error = form.querySelector<HTMLElement>('[role="alert"]')!;
  form.querySelector('.btn-secundario')!.addEventListener('click', () => cerrarDialogoConAviso(dialogo));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = String(new FormData(form).get('prefijo') ?? '').trim();
    if (!prefijoEsValido(valor)) {
      error.textContent = `Prefijo inválido: debe empezar con + (ej. ${PREFIJO_POR_DEFECTO})`;
      return;
    }
    prefijoMovil = valor;
    localStorage.setItem(CLAVE_PREFIJO, valor);
    dialogo.close();
    avisar(`Prefijo guardado: ${valor}`);
  });
}

$('#ajustes-btn')?.addEventListener('click', (e) => abrirConfiguracion(e.currentTarget as HTMLElement));

const inicial = vistaInicial(location.hash, vistas.map((v) => v.id));
// Entrada directa (p. ej. abrir con #v-mes): se pinta UNA sola vista. Si el
// hash no nombra una vista, manda la pantalla por defecto del HTML.
irA(inicial ?? (vistas.find((v) => v.classList.contains('activa'))?.id ?? 'v-hoy'), false);

// Exposición mínima para QA (consola / capturas): sin tocar el estado real.
(window as unknown as Record<string, unknown>).ximeV5 = {
  get clases() { return structuredClone(clases); },
  get alumnos() { return structuredClone(repo.listarAlumnos()); },
  refrescar,
  irA,
  abrirFicha,
  reloj,
  textoCancelacion,
  linkTexto,
};
