/* Datos FICTICIOS compartidos por las dos propuestas. Estados = ícono + texto + color. */
window.CLASES_DATA = {
  hoy: "Lunes 16 de noviembre",
  duenia: "Xime",
  clases: [
    { id: 1, alumno: "Bruno S.",  hora: "16:00", tipo: "mensual",    hecha: true  },
    { id: 2, alumno: "Carla T.",  hora: "16:00", tipo: "mensual",    hecha: true  },
    { id: 3, alumno: "Diego V.",  hora: "18:30", tipo: "individual", hecha: false }
  ],
  resumen: { cobrado: 14400, porCobrar: 5400, vencen: 2 },
  alumnos: [
    { id: 1, nombre: "Bruno S.",    tipo: "mensual",    estado: "aldia",   detalle: "Pagó el 3/11 · renueva 3/12", monto: 1800 },
    { id: 2, nombre: "Carla T.",    tipo: "mensual",    estado: "aldia",   detalle: "Pagó el 5/11 · renueva 5/12", monto: 1800 },
    { id: 3, nombre: "Diego V.",    tipo: "individual", estado: "aldia",   detalle: "2 clases tomadas este mes",   monto: 700  },
    { id: 4, nombre: "Elena M.",    tipo: "mensual",    estado: "pronto",  detalle: "Vence en 2 días · 18/11",     monto: 1800 },
    { id: 5, nombre: "Facundo R.",  tipo: "mensual",    estado: "pronto",  detalle: "Vence en 4 días · 20/11",     monto: 1800 },
    { id: 6, nombre: "Gabriela L.", tipo: "individual", estado: "debe",    detalle: "Debe 3 clases sueltas",       monto: 2100 },
    { id: 7, nombre: "Hugo P.",     tipo: "mensual",    estado: "vencida", detalle: "Venció hace 5 días · 11/11",  monto: 1800 },
    { id: 8, nombre: "Inés B.",     tipo: "mensual",    estado: "aldia",   detalle: "Pagó el 8/11 · renueva 8/12", monto: 1800 }
  ],
  estados: { aldia: "Al día", pronto: "Vence pronto", debe: "Debe clases", vencida: "Vencida" },
  estIcono: { aldia: "check", pronto: "clock", debe: "nota", vencida: "alerta" },
  tipos: { mensual: "Mensual", individual: "Individual" }
};
window.CLASES_UTIL = {
  money: n => "$ " + n.toLocaleString("es-UY"),
  reduce: () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  /* cuenta animada 0→n en ~650 ms; con movimiento reducido salta directo */
  countUp(el, n, fmt, ms = 650) {
    if (CLASES_UTIL.reduce()) { el.textContent = fmt(n); return; }
    const t0 = performance.now();
    const f = t => { const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(n * e)); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  },
  /* festejo: 16 partículas, 700 ms; no se dispara con movimiento reducido */
  confetti(host, x, y, colors) {
    if (CLASES_UTIL.reduce()) return;
    const n = 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i"); s.className = "confeti";
      const a = (Math.PI * 2 * i) / n + Math.random() * .4, d = 46 + Math.random() * 46;
      s.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};` +
        `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 20}px;--r:${Math.random() * 360}deg`;
      host.appendChild(s); setTimeout(() => s.remove(), 750);
    }
  }
};
