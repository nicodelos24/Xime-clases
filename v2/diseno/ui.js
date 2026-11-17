/* UI compartida por las dos propuestas: estructura igual, la personalidad la pone el CSS de cada una.
   Todo texto de estado lleva ícono + texto + color (no solo color). Objetivos táctiles ≥44px. */
const D = () => window.CLASES_DATA, U = () => window.CLASES_UTIL;
const AV = ["a","b","c","d","e"]; /* variantes de color de avatar, definidas en el CSS de cada propuesta */
const iniciales = n => n.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();

function chipEstado(e){
  const d = D();
  return `<span class="chip chip-estado estado-${e}">${ico(d.estIcono[e])}<span>${d.estados[e]}</span></span>`;
}
function chipTipo(t){
  const d = D();
  return `<span class="chip chip-tipo tipo-${t}">${ico(t)}<span>${d.tipos[t]}</span></span>`;
}
function avatar(nombre, i=0){
  const v = AV[i % AV.length];
  return `<span class="avatar av-${v}" aria-hidden="true">${iniciales(nombre)}</span>`;
}
function toast(msg){
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role","status"); t.textContent = msg;
  document.querySelector(".telefono").appendChild(t);
  requestAnimationFrame(() => t.classList.add("ver"));
  setTimeout(() => { t.classList.remove("ver"); setTimeout(() => t.remove(), 300); }, 1900);
}

/* ---------- HOY ---------- */
function pantallaHoy(){
  const d = D(), u = U();
  const hechas = d.clases.filter(c => c.hecha).length, total = d.clases.length;
  const proxima = d.clases.find(c => !c.hecha);
  const R = 34, C = 2 * Math.PI * R, prog = total ? hechas / total : 0;
  return `
  <header class="cab">
    <div><p class="saludo">Buenas tardes, ${d.duenia}</p><h1>Hoy</h1></div>
    <button class="campana" aria-label="3 avisos" onclick="toast('Avisos (demo)')">${ico("campana")}<i>3</i></button>
  </header>

  <section class="heroi" aria-label="Progreso de clases de hoy">
    <div class="anillo" role="img" aria-label="${hechas} de ${total} clases dadas">
      <svg viewBox="0 0 80 80" width="88" height="88" aria-hidden="true">
        <circle cx="40" cy="40" r="${R}" fill="none" stroke="var(--anillo-fondo, #EADFF0)" stroke-width="8"/>
        <circle class="anillo-prog" cx="40" cy="40" r="${R}" fill="none" stroke="var(--acento)" stroke-width="8"
          stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"
          transform="rotate(-90 40 40)" style="--meta:${C * (1 - prog)}"/>
      </svg>
      <b class="anillo-num">${hechas}<span>/${total}</span></b>
    </div>
    <div class="heroi-txt">
      <h2>Clases de hoy</h2>
      <p>${proxima ? `Próxima: <b>${proxima.hora}</b> · ${proxima.alumno}` : "Día terminado ✓"}</p>
      <p class="heroi-meta">${proxima ? `${d.hoy}` : d.hoy}</p>
    </div>
  </section>

  <section class="stats" aria-label="Resumen del día">
    <button class="stat stat-cobrado" onclick="festejar(this)">
      <span class="stat-ico">${ico("cobros")}</span>
      <b class="stat-num" data-n="${d.resumen.cobrado}" data-fmt="money">$ 0</b>
      <span class="stat-lab">Cobrado hoy</span>
      <span class="stat-delta">${ico("flecha")} +320</span>
    </button>
    <button class="stat stat-por" onclick="toast('Ir a Cobros (fase 5)')">
      <span class="stat-ico">${ico("nota")}</span>
      <b class="stat-num" data-n="${d.resumen.porCobrar}" data-fmt="money">$ 0</b>
      <span class="stat-lab">Por cobrar</span>
    </button>
    <button class="stat stat-vencen" onclick="toast('Ir a Alumnos · vencen')">
      <span class="stat-ico">${ico("alerta")}</span>
      <b class="stat-num" data-n="${d.resumen.vencen}" data-fmt="n">0</b>
      <span class="stat-lab">Vencen</span>
    </button>
  </section>

  <section class="lista" aria-label="Agenda de hoy">
    <h2>Agenda de hoy</h2>
    ${d.clases.map((c, i) => `
    <div class="clase fila" style="--i:${i}">
      <span class="hora">${c.hora}</span>
      ${avatar(c.alumno, i)}
      <div class="fila-txt"><b>${c.alumno}</b>${chipTipo(c.tipo)}</div>
      <button class="btn-hecho ${c.hecha ? "hecho" : ""}" aria-pressed="${c.hecha}"
        aria-label="${c.hecha ? "Clase dada" : `Marcar ${c.alumno} como dada`}"
        onclick="alternarHecho(this, '${c.alumno}')">
        <span class="btn-hecho-caja">${ico("check")}</span><span class="btn-hecho-txt">Dada</span>
      </button>
    </div>`).join("")}
  </section>

  <section class="aviso" style="--i:4">
    ${ico("alerta")} <p><b>2 mensualidades vencen esta semana</b><br>Elena M. y Facundo R.</p>
    ${ico("flecha")}
  </section>`;
}

/* ---------- ALUMNOS ---------- */
let filtroTipo = "todas", filtroEstado = "todos", busca = "";
function pantallaAlumnos(){
  const d = D();
  const lista = d.alumnos.filter(a =>
    (filtroTipo === "todas" || a.tipo === filtroTipo) &&
    (filtroEstado === "todos" || a.estado === filtroEstado) &&
    a.nombre.toLowerCase().includes(busca.toLowerCase()));
  const chip = (id, lab, act, fn) => `<button class="fchip ${act ? "activa" : ""}" aria-pressed="${act}" onclick="${fn}">${lab}</button>`;
  return `
  <header class="cab">
    <div><h1>Alumnos</h1><p class="saludo">${d.alumnos.length} activos</p></div>
    <button class="campana" aria-label="Agregar alumno" onclick="toast('Alta de alumno (fase 5)')">${ico("mas1")}</button>
  </header>

  <div class="buscador">
    ${ico("buscar")}
    <input type="search" placeholder="Buscar alumno…" value="${busca}" oninput="filtrar(this.value)"
      aria-label="Buscar alumno por nombre"/>
  </div>

  <div class="filtros" id="filtros" role="group" aria-label="Filtros">
    ${chip("t", "Todas", filtroTipo === "todas", "ponTipo('todas')")}
    ${chip("m", "Mensual", filtroTipo === "mensual", "ponTipo('mensual')")}
    ${chip("i", "Individual", filtroTipo === "individual", "ponTipo('individual')")}
    <span class="filtro-sep" aria-hidden="true"></span>
    ${chip("e1", "Al día", filtroEstado === "aldia", "ponEstado('aldia')")}
    ${chip("e2", "Vence pronto", filtroEstado === "pronto", "ponEstado('pronto')")}
    ${chip("e3", "Debe", filtroEstado === "debe", "ponEstado('debe')")}
    ${chip("e4", "Vencida", filtroEstado === "vencida", "ponEstado('vencida')")}
  </div>

  <div class="lista" id="lista-alumnos" aria-label="Lista de alumnos">
    ${lista.length ? lista.map((a, i) => `
    <button class="alumno fila" style="--i:${i}" onclick="toast('Ficha de ${a.nombre} (fase 5)')">
      ${avatar(a.nombre, i)}
      <div class="fila-txt"><b>${a.nombre}</b><span class="sub">${a.detalle}</span></div>
      <div class="alumno-fin">
        ${chipEstado(a.estado)}
        ${a.estado !== "aldia" ? `<span class="mini-pago" title="Registrar pago (demo)" role="button" tabindex="0"
            onclick="event.stopPropagation(); festejar(this, '${a.nombre}')"
            onkeydown="if(event.key==='Enter'){event.stopPropagation();festejar(this,'${a.nombre}')}">${ico("mas1")}</span>` : ""}
      </div>
    </button>`).join("")
    : `<div class="vacio">${ico("buscar")}<b>Nadie con este filtro</b><span>Probá con otro estado o tipo.</span></div>`}
  </div>`;
}
function ponTipo(t){ filtroTipo = t; refrescarLista(); }
function ponEstado(e){ filtroEstado = e; refrescarLista(); }
function filtrar(v){ busca = v; refrescarLista(); }
function refrescarLista(){
  const l = document.getElementById("lista-alumnos"); if (!l) return;
  const tmp = document.createElement("div"); tmp.innerHTML = pantallaAlumnos();
  l.innerHTML = tmp.querySelector("#lista-alumnos").innerHTML;
  document.getElementById("filtros").innerHTML = tmp.querySelector("#filtros").innerHTML;
}

/* ---------- acciones ---------- */
function alternarHecho(btn, nombre){
  const dado = btn.classList.toggle("hecho");
  btn.setAttribute("aria-pressed", dado);
  btn.querySelector(".btn-hecho-txt").textContent = "Dada";
  if (dado){ const r = btn.getBoundingClientRect(), t = document.querySelector(".telefono").getBoundingClientRect();
    U().confetti(document.querySelector(".telefono"), r.left - t.left + r.width/2, r.top - t.top, ["#12805A","#F2A20C","#7A2F8C","#344E7A","#C2358A"]); }
  refrescarAnillo(nombre);
}
function refrescarAnillo(){
  const d = D(), hechas = document.querySelectorAll(".btn-hecho.hecho").length, total = d.clases.length;
  const num = document.querySelector(".anillo-num"); if (num) num.firstChild.textContent = hechas;
  const prog = document.querySelector(".anillo-prog"), C = 2 * Math.PI * 34;
  if (prog) prog.style.setProperty("--meta", C * (1 - (total ? hechas / total : 0)));
}
function festejar(host, nombre){
  const t = document.querySelector(".telefono").getBoundingClientRect();
  const r = host.getBoundingClientRect();
  U().confetti(document.querySelector(".telefono"), r.left - t.left + r.width/2, r.top - t.top, ["#12805A","#F2A20C","#7A2F8C","#344E7A","#C2358A"]);
  toast(nombre ? `Pago de ${nombre} registrado (demo)` : "¡Bien ahí! (demo)");
}

/* ---------- navegación ---------- */
function irTab(tab){
  location.hash = tab;
  pintar();
}
function pintar(){
  const tab = location.hash.replace("#","") || "hoy";
  document.querySelectorAll(".nav-btn").forEach(b => {
    const act = b.dataset.tab === tab;
    b.classList.toggle("activa", act);
    if (act) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
  });
  const c = document.querySelector(".contenido");
  c.className = `contenido tab-${tab}`;
  c.innerHTML = tab === "alumnos" ? pantallaAlumnos() : pantallaHoy();
  document.querySelectorAll(".stat-num").forEach(n => {
    const v = +n.dataset.n;
    U().countUp(n, v, n.dataset.fmt === "money" ? U().money : x => String(x));
  });
}
function navActiv(tab, lab, color){
  return `<button class="nav-btn" data-tab="${tab}" onclick="irTab('${tab}')" style="--navc:${color}">
    ${ico(tab)}<span>${lab}</span></button>`;
}
function montarNav(){
  const d = D();
  return `<nav class="nav" aria-label="Navegación principal">
    ${navActiv("hoy","Hoy","var(--sec-hoy)")}
    ${navActiv("alumnos","Alumnos","var(--sec-alumnos)")}
    <button class="nav-btn nav-off" onclick="toast('Agenda: fase 3')">${ico("agenda")}<span>Agenda</span></button>
    <button class="nav-btn nav-off" onclick="toast('Cobros: fase 5')">${ico("cobros")}<span>Cobros</span></button>
    <button class="nav-btn nav-off" onclick="toast('Más: fase 5')">${ico("mas")}<span>Más</span></button>
  </nav>`;
}
document.addEventListener("DOMContentLoaded", () => {
  const t = document.querySelector(".telefono");
  t.insertAdjacentHTML("beforeend", `<main class="contenido" aria-live="polite"></main>${montarNav()}`);
  addEventListener("hashchange", pintar);
  pintar();
});
