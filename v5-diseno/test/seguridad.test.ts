import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { COLORES, normalizarFichaGuardada, colorPorId, iniciales } from '../src/alumnos.ts';
import { normalizarPagoGuardado, registrarPago, resumenCobros } from '../src/cobros.ts';
import { almacenMemoria, almacenLocalStorage, CLAVE_ESTADO, CLAVE_RUTINAS, RepositorioClases, type Almacen } from '../src/repositorio.ts';
import { relojFalso } from '../src/reloj.ts';

const payload = '"><img src=x onerror="window.__ximeXss=1">';
const almacenPagos = (pagos: unknown[], alumnos: unknown[] = [{ id: 'a1', nombre: 'Alumna', modalidad: 'mensual', fechaAlta: '2026-11-01', ancla: 1 }]) =>
  almacenMemoria(JSON.stringify({ version: 2, clases: [], alumnos, pagos, rutinas: [] }));
const abrirPagos = (pagos: unknown[]) =>
  new RepositorioClases(almacenPagos(pagos), relojFalso(Date.parse('2026-11-24T13:00:00Z')));

type VentanaPrueba = { document: { querySelector(selector: string): unknown } };
type DomPrueba = { window: VentanaPrueba };
type ConstructorDom = new (html: string) => DomPrueba;
const JSDOM: ConstructorDom = (createRequire(import.meta.url)('jsdom') as { JSDOM: ConstructorDom }).JSDOM;

const domDeAtributos = (ficha: NonNullable<ReturnType<typeof normalizarFichaGuardada>>) => new JSDOM(
  `<button data-ficha="${ficha.id}|2026-11" data-fila="${ficha.id}|2026-11">Abrir</button>`
  + `<input value="${ficha.id}">`
  + `<span class="avatar ${ficha.color}">${ficha.nombre.slice(0, 2)}</span>`,
);

test('SEG-01: las iniciales sólo contienen letras A-Z, nunca HTML de un nombre hostil', () => {
  assert.equal(iniciales('Nora Pérez'), 'NP', 'un nombre normal no cambia');
  assert.equal(iniciales('  ana  '), 'A', 'una sola palabra sigue igual');
  assert.equal(iniciales(''), '?', 'vacío sigue siendo ?');
  // Un nombre hostil no puede convertir las iniciales en marcado ni en un
  // atributo class inyectado: cualquier carácter no A-Z se descarta.
  assert.equal(iniciales('<img src=x onerror=alert(1)>'), 'S', 'angle brackets y signos no superviven: sólo queda la S de src');
  assert.equal(iniciales('"><script>'), '?', 'sin letras utilizables devuelve ?');
  assert.equal(iniciales('123 456'), '?', 'sólo dígitos devuelve ?');
  assert.equal(iniciales('Álvaro Ñandú'), 'AN', 'acentos y ñ se normalizan a letras');
});

test('SEG-01: esc() escapa > como &gt; para cerrar la inyección en texto/atributos', () => {
  // `esc` es privada de propuesta.ts (módulo de UI con efectos en DOM). Se
  // verifica en el fuente que el mapa de escapado cubre también '>' — sin él,
  // un nombre con '>' puede cerrar prematuramente un elemento/atributo.
  const fs = createRequire(import.meta.url)('node:fs') as typeof import('node:fs');
  const fuente = fs.readFileSync(new URL('../propuesta.ts', import.meta.url), 'utf8');
  assert.match(fuente, /['"]>['"]:\s*['"]&gt;['"]/, "esc() debe mapear '>' a '&gt;'");
});

test('SEG-01: los atributos de ID/color no crean nodos ni eventos inyectados', () => {
  const ficha = normalizarFichaGuardada({ id: payload, nombre: 'Alumna', fechaAlta: '2026-11-01', color: 'avatar' });
  assert.equal(ficha, null);
  const valida = normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', fechaAlta: '2026-11-01', color: 'avatar' })!;
  const dom = domDeAtributos(valida);
  assert.equal(dom.window.document.querySelector('img'), null, 'un ID/color válido no inyecta HTML');
  assert.equal(dom.window.document.querySelector('[onerror]'), null);
});

test('M-01: el color se restringe al allowlist sin cambiar un color válido', () => {
  assert.equal(normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color: payload })?.color, colorPorId('al-abcdefgh'));
  assert.equal(normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color: 'avatar-6' })?.color, 'avatar-6');
  for (const color of COLORES) assert.equal(normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color })?.color, color);
  const ficha = normalizarFichaGuardada({ id: 'al-abcdefgh', nombre: 'Alumna', color: 'avatar-2' })!;
  const dom = domDeAtributos(ficha);
  assert.equal(dom.window.document.querySelector('img'), null);
  const fila = dom.window.document.querySelector('button')! as Element;
  assert.equal(fila.getAttribute('data-fila'), 'al-abcdefgh|2026-11');
  const input = dom.window.document.querySelector('input')! as Element;
  assert.equal(input.getAttribute('value'), 'al-abcdefgh');
  const avatar = dom.window.document.querySelector('.avatar')! as Element;
  assert.equal(avatar.className, 'avatar avatar-2');
});

test('SEG-01: una clase con ID inyectable se aísla sin borrar el historial válido', () => {
  const almacen = almacenMemoria(JSON.stringify({
    version: 2, alumnos: [{ id: 'a1', nombre: 'Alumna', fechaAlta: '2026-11-01' }], pagos: [], rutinas: [],
    clases: [
      { id: payload, nombre: 'Inyectada', fecha: '2026-11-24', minutos: 900, duracionMin: 60, alumnos: [], estado: 'programada' },
      { id: 'c-valida', nombre: 'Válida', fecha: '2026-11-24', minutos: 900, duracionMin: 60, alumnos: [], estado: 'programada' },
      { id: 'c1', nombre: 'Compacta', fecha: '2026-11-24', minutos: 900, duracionMin: 60, alumnos: [], estado: 'programada' },
    ],
  }));
  assert.deepEqual(new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z'))).listar().map((c) => c.id), ['c-valida', 'c1']);
});

test('M-01: una ficha corrupta no rompe la lectura ni falsea la ficha demo', () => {
  const repo = new RepositorioClases(
    almacenPagos([], [
      { id: payload, nombre: payload, fechaAlta: payload, color: payload },
      { id: 'a1', nombre: 'Alumna', modalidad: 'mensual', fechaAlta: '2026-11-01', ancla: 1 },
    ]),
    relojFalso(Date.parse('2026-11-24T13:00:00Z')),
  );
  assert.deepEqual(repo.listarAlumnos().map((a) => a.id), ['a1']);
});

test('M-02: pagos inválidos se omiten sin tocar el almacén ni falsear deuda o KPI', () => {
  const validos = [
    { id: 'p-vigente', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime', anulado: null },
    { id: 'p-anulado', alumnoId: 'a1', periodo: '2026-10', montoUYU: 1, fecha: '2026-11-20', quien: 'Xime', anulado: { fecha: '2026-11-24', motivo: 'Error', quien: 'Xime' } },
  ];
  const malos = [
    { id: 'p-monto', alumnoId: 'a1', periodo: '2026-10', montoUYU: '<img src=x onerror=alert(1)>', fecha: '2026-11-24', quien: 'Xime', anulado: null },
    { id: 'p-fecha', alumnoId: 'a1', periodo: '2026-10', montoUYU: 1, fecha: 'no-fecha', quien: 'Xime', anulado: null },
  ];
  const almacen = almacenPagos([...malos, ...validos]);
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  assert.deepEqual(repo.listarPagos(), validos);
  const resumen = resumenCobros([{ id: 'a1', nombre: 'Alumna', grupo: 'G', ancla: 1, montoUYU: 6500 }], repo.listarPagos(), '2026-11-24');
  assert.equal(resumen.cobradoHoy, 6500);
  assert.equal(resumen.cobradoMes, 6500);
  assert.equal(resumen.porCobrar, 6500);
  assert.equal(resumen.filas.find((f) => f.periodo === '2026-10')?.pago?.id, 'p-vigente');
  assert.deepEqual(JSON.parse(almacen.leer()!).pagos, [...malos, ...validos], 'leer no reescribe ni destruye evidencia');
});

test('M-02: un pago corrupto queda como deuda pendiente, no como pagado', () => {
  const pagoMalo = { id: 'p-malo', alumnoId: 'a1', periodo: '2026-10', montoUYU: '6500', fecha: '2026-11-24', quien: {}, anulado: null };
  const pagos = abrirPagos([pagoMalo]).listarPagos();
  assert.deepEqual(pagos, []);
  const resumen = resumenCobros([{ id: 'a1', nombre: 'Alumna', grupo: 'G', ancla: 1, montoUYU: 6500 }], pagos, '2026-11-24');
  assert.equal(resumen.cobradoHoy, 0);
  assert.equal(resumen.cobradoMes, 0);
  assert.equal(resumen.porCobrar, 13000);
  assert.equal(resumen.filas.find((f) => f.periodo === '2026-10')?.pago, undefined);
});

test('M-02: un pago inválido no bloquea registrar el pago legítimo del período', () => {
  const repo = abrirPagos([
    { id: 'p-malo', alumnoId: 'a1', periodo: '2026-10', montoUYU: -1, fecha: '2026-11-24', quien: 'Xime', anulado: null },
  ]);
  repo.registrarPago({ id: 'p-bueno', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime' });
  assert.deepEqual(repo.listarPagos().map((p) => p.id), ['p-bueno']);
});

test('M-02: un ID duplicado no duplica el cobro en KPI', () => {
  const pago = { id: 'p-dup', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime', anulado: null };
  const repo = abrirPagos([pago, { ...pago }]);
  assert.deepEqual(repo.listarPagos(), [pago]);
  const resumen = resumenCobros([{ id: 'a1', nombre: 'Alumna', grupo: 'G', ancla: 1, montoUYU: 6500 }], repo.listarPagos(), '2026-11-24');
  assert.equal(resumen.cobradoHoy, 6500);
  assert.equal(resumen.cobradoMes, 6500);
});

test('M-02: el historial conserva pagos y anulaciones válidas al normalizar', () => {
  const pagos = [
    { id: 'p1', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-20', quien: ' Xime ', anulado: null },
    { id: 'p2', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6200, fecha: '2026-11-24', quien: 'Xime', anulado: { fecha: '2026-11-24', motivo: ' Error ', quien: ' Xime ' } },
  ];
  assert.deepEqual(abrirPagos(pagos).listarPagos(), [
    { ...pagos[0], quien: 'Xime' },
    { ...pagos[1], anulado: { fecha: '2026-11-24', motivo: 'Error', quien: 'Xime' } },
  ]);
});

test('SEG-02: cada pago corrupto se aísla sin descartar los válidos', () => {
  const valido = { id: 'p-ok', alumnoId: 'a1', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime', anulado: null };
  const corruptos: unknown[] = [
    null, [], {},
    { ...valido, id: '' }, { ...valido, alumnoId: '' }, { ...valido, quien: '' },
    { ...valido, periodo: '2026-13' }, { ...valido, fecha: '2026-02-30' },
    { ...valido, montoUYU: 0 }, { ...valido, montoUYU: -1 }, { ...valido, montoUYU: 1.5 },
    { ...valido, montoUYU: Number.MAX_SAFE_INTEGER + 1 },
    { ...valido, anulado: { fecha: '2026-11-23', motivo: 'Error', quien: 'Xime' } },
    { ...valido, anulado: { fecha: '2026-11-24', motivo: '', quien: 'Xime' } },
  ];
  assert.deepEqual(abrirPagos([...corruptos, valido]).listarPagos(), [valido]);
  const base = { id: ' p-ok ', alumnoId: ' a1 ', periodo: '2026-10', montoUYU: 6500, fecha: '2026-11-24', quien: ' Xime ' };
  const normalizado = normalizarPagoGuardado(base)!;
  assert.deepEqual(registrarPago([], base), [normalizado], 'registrarPago aplica el mismo normalizador que la lectura');
  assert.throws(() => registrarPago([normalizado], base), /ya está registrado/);
});

test('SEG-03: si falla el respaldo, no toca el principal ni confirma el alta', () => {
  const original = JSON.stringify({ version: 2, clases: [], alumnos: [], pagos: [], rutinas: [] });
  const respaldoOriginal = '[{"id":"rut-anterior","nombre":"Anterior","dias":[0],"desde":"2026-11-02","hora":"10:00"}]';
  let respaldo = respaldoOriginal;
  let principal = original;
  let fallarRespaldo = false;
  let fallarPrincipal = false;
  let permitirCompensacion = true;
  const almacen: Almacen = {
    leer: () => principal,
    escribir: (texto) => {
      if (fallarPrincipal) throw new Error('principal lleno');
      principal = texto;
    },
    leerRutinas: () => respaldo,
    escribirRutinas: (texto, requiere) => {
      if (fallarRespaldo || (requiere && !permitirCompensacion)) throw new Error('respaldo lleno');
      respaldo = texto;
    },
  };
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  repo.listar();
  fallarRespaldo = true;
  assert.throws(() => repo.crearAlumno({ nombre: 'Otra', modalidad: 'mensual' }), /respaldo lleno/);
  assert.equal(principal, original, 'escribir respaldo primero deja el principal intacto');
  assert.equal(respaldo, respaldoOriginal);
  assert.deepEqual(repo.listarAlumnos(), []);
  fallarRespaldo = false;
  repo.crearAlumno({ nombre: 'Otra', modalidad: 'mensual' });
  assert.deepEqual(repo.listarAlumnos().map((a) => a.nombre), ['Otra']);
  const respaldoAntes = respaldo;
  fallarPrincipal = true;
  assert.throws(() => repo.crearAlumno({ nombre: 'Tercera', modalidad: 'mensual' }), /principal lleno/);
  assert.equal(respaldo, respaldoAntes, 'la compensación restaura el respaldo anterior');
  assert.deepEqual(repo.listarAlumnos().map((a) => a.nombre), ['Otra']);
});

test('SEG-03: si también falla compensar el respaldo, propaga el error del principal', () => {
  const original = JSON.stringify({ version: 2, clases: [], alumnos: [], pagos: [], rutinas: [] });
  let principal = original;
  let respaldo = '[]';
  let fallarPrincipal = false;
  let permitirCompensacion = true;
  let respaldos = 0;
  const almacen: Almacen = {
    leer: () => principal,
    escribir: (texto) => {
      if (fallarPrincipal) throw new Error('principal lleno');
      principal = texto;
    },
    leerRutinas: () => respaldo,
    escribirRutinas: (texto, requiere) => {
      respaldos += 1;
      if (requiere && respaldos % 2 === 0 && !permitirCompensacion) throw new Error('compensación llena');
      respaldo = texto;
    },
  };
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  repo.listar();
  fallarPrincipal = true;
  assert.throws(() => repo.crearAlumno({ nombre: 'Tercera', modalidad: 'mensual' }), /principal lleno/);
  assert.deepEqual(repo.listarAlumnos(), []);
  assert.equal(respaldo, '[]', 'la compensación restaura el respaldo previo');
  fallarPrincipal = false;
  repo.crearAlumno({ nombre: 'Otra', modalidad: 'mensual' });
  respaldos = 0;
  permitirCompensacion = false;
  fallarPrincipal = true;
  assert.throws(() => repo.crearAlumno({ nombre: 'Tercera', modalidad: 'mensual' }), /principal lleno/);
  assert.deepEqual(repo.listarAlumnos().map((a) => a.nombre), ['Otra']);
  assert.equal(respaldo, '[]', 'si el primer respaldo reemplazó el previo, se conserva el nuevo; límite sin transacción');
});

test('SEG-03: una siembra con respaldo fallido deja el almacén vacío', () => {
  let principal: string | null = null;
  const respaldoOriginal = '[]';
  let respaldo = respaldoOriginal;
  const almacen: Almacen = {
    leer: () => principal,
    escribir: (texto) => { principal = texto || null; },
    leerRutinas: () => respaldo,
    escribirRutinas: (texto, requiere) => {
      if (principal === null && requiere) throw new Error('respaldo lleno');
      respaldo = texto;
    },
  };
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  assert.throws(() => repo.listarAlumnos(), /respaldo lleno/);
  assert.equal(principal, null);
  assert.equal(respaldo, respaldoOriginal);
});

test('SEG-03: el adaptador real propaga la cuota del respaldo y deja el principal intacto', () => {
  const original = JSON.stringify({ version: 2, clases: [], alumnos: [], pagos: [], rutinas: [] });
  const navegador = new Map<string, string>([[CLAVE_ESTADO, original], [CLAVE_RUTINAS, '[]']]);
  const almacen = almacenLocalStorage({
    localStorage: {
      getItem: (clave) => navegador.get(clave) ?? null,
      setItem: (clave, valor) => {
        if (clave === CLAVE_RUTINAS) throw new Error('cuota llena');
        navegador.set(clave, valor);
      },
    },
  });
  const repo = new RepositorioClases(almacen, relojFalso(Date.parse('2026-11-24T13:00:00Z')));
  repo.listar();
  assert.throws(() => repo.registrarPago({ id: 'p-nuevo', alumnoId: 'a0', periodo: '2026-11', montoUYU: 6500, fecha: '2026-11-24', quien: 'Xime' }), /respaldo/);
  assert.equal(navegador.get(CLAVE_ESTADO), original);
  assert.deepEqual(repo.listarPagos(), []);
});
