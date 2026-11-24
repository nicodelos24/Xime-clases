# Verificación de seguridad — 24-11-2026

Rama: `fix/xime-seguridad-20261124`
Base: `00bc6825144c27f89d354e23293ac6d48c7b56db`
Fuente del encargo: informe Emma `8fa0461c8cb1264b54c9d2bdb1cd20273a6d72bb`, M-01, M-02 y B-01.

## Resultado

Suite final: **210/210 tests**, typecheck y build verdes.

- **M-01:** se validan los IDs persistidos de ficha y clase; el color acepta sólo `avatar`, `avatar-2`…`avatar-6` (si no, se deriva del ID). Se escapan los IDs en `data-ficha`, `data-fila`, `data-clase`, `data-reversa`, `data-acciones`, `value` y avatar. El payload almacenado se aísla sin romper el historial válido.
- **M-02:** cada pago leído pasa por el mismo normalizador que `registrarPago`: ID/alumno/actor no vacíos, período `AAAA-MM`, fecha civil real, monto entero positivo seguro y anulación coherente. Se omiten corruptos y duplicados; no se reescribe el almacén al leer. El período inválido vuelve a mostrarse como deuda, no como pagado.
- **B-01:** el respaldo se escribe primero y con persistencia obligatoria en comandos. Si falla, el principal no cambia. Si luego falla el principal, se intenta restaurar el respaldo previo. La siembra y migración también exigen persistencia. El estado en memoria sólo avanza después de ambas escrituras.

## Evidencia

```bash
cd .worktrees/fix-xime-seguridad-20261124/v5-diseno
npm run typecheck
npm test
npm run build:check -- /tmp/apx-scratch-4f023747/th_d72662fbe181490c/build-seguridad
```

Chromium headless propio (Chrome/155.0.8059.84, 390×844, perfil y servidor temporales):
- URL servida durante la prueba: `http://127.0.0.1:8824/` (efímera; no publicación).
- Payload de ID/color almacenado: sin ejecución, nodos ni eventos inyectados; sólo quedó la ficha válida.
- Avatar permitido y `data-fila` esperado.
- Dos pagos en el store (uno válido y otro corrupto); lectura no destructiva.
- `localStorage.setItem('xime.v5.rutinas')` forzado a lanzar por cuota: error explícito y pago nuevo ausente del principal.
- Refresh persistente, sin overflow horizontal ni errores de recursos.

## Límites

- Las dos claves de `localStorage` no comparten transacción atómica. Si el respaldo se escribe y después falla el principal **y** también falla su compensación, puede quedar sólo el respaldo nuevo; se propaga el error y no se anuncia éxito. Una transacción real requiere adaptador único/BD.
- Los pagos corruptos se aíslan de la vista, pero permanecen en el JSON hasta la próxima escritura de un comando; no se borra evidencia durante la lectura.
- No se publicó ni se modificaron los `docs/` publicados, master o la rama avatar; no se usó `kaia_chrome_xime`.
- Preparación: **5/5** para revisión/integración; la publicación a master/Pages queda a doble control Roma + Nova.
