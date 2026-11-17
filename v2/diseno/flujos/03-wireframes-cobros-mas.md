# 03 · Wireframes: Cobros y Más

Mismas convenciones que `02`. Importes y fechas son ejemplos del dominio, no cálculos de UI. Q2/Q3 sin política: se indica, no se resuelve.

## W7 · Cobros (lista por secciones)

Responde «¿quién me debe o va a vencer?» y es el punto de entrada para cobrar y anular.

```text
┌────────────────────────────────────────┐
│ Cobros                      [+ Registrar]│  (acción «+ Pago»)
│ [Por vencer 2][Vencidas 1][Adeudadas 1][Historial] │ pestañas 44 px, con número
│ ┌ Resumen del mes ───────────────────┐   │
│ │ Cobrado $ 14.400 · Por cobrar $ 5.400│  │
│ └────────────────────────────────────┘   │
│ Vencidas                                 │
│ (H) Hugo P.  ● Mensual                   │
│ ⚠ Venció el 11/11 · hace 5 días          │
│ [Cobrar mensualidad] [WhatsApp]          │
│ Clases adeudadas                         │
│ (G) Gabriela L.  ◆ Individual            │
│ ◉ Debe 3 clases · $ 2.100                │
│ [Cobrar clases]                          │
│ Hoy  Alumnos  Agenda  Cobros  Más        │
└────────────────────────────────────────┘
```

- Cada pestaña es una lista independiente (un fallo o un vacío no borra las otras). Fila tocable → Ficha; botón de la fila → hoja de cobro (W8).
- **Historial:** pagos por fecha descendente; fila: alumno, concepto, monto, medio, dueña que lo registró. Pago anulado: texto «Anulado» + tachado suave, **el original sigue visible**.
- La suscripción SaaS que el instituto le paga a la empresa no aparece acá (circuito distinto).

## W8 · Registrar pago (hoja inferior; mensualidad o clase suelta)

```text
┌────────────────────────────────────────┐
│ Registrar pago                  [Cerrar] │
│ (E) Elena M. · Mensualidad               │
│ Tarifa vigente: $ 1.800                  │
│ Monto  [$ 1.800        ]                 │
│ Motivo del cambio de monto * (si lo editó)│
│ Fecha [Hoy 16/11]   Medio [Efectivo ▾]   │
│ Nota  [Opcional                       ]  │
│ ┌ Qué va a pasar (lo calcula la app) ─┐  │
│ │ Nuevo ciclo: inicia 19/11            │  │
│ │ Vence el 18/12 · renueva el 19/12    │  │
│ └──────────────────────────────────────┘  │
│ [Confirmar pago $ 1.800]                 │
└────────────────────────────────────────┘
```

- La vista previa viene del dominio y se rotula; si el inicio depende de una próxima clase: «Pendiente de primera clase» sin fechas definitivas.
- Monto con decimales: «Ingresá un monto en pesos uruguayos, sin decimales». Precio no definido ≠ 0.
- Botón primario: «Confirmar pago $ X» (no «Pagar»: la app no procesa dinero). Mientras espera: «Registrando pago…» bloqueado.
- Éxito → W9. Es el único lugar con festejo breve; con movimiento reducido, check estático.

## W9 · Comprobante interno

```text
┌────────────────────────────────────────┐
│ ✓ Pago registrado                        │
│ Elena M. · Mensualidad · $ 1.800         │
│ 16/11/2026 · Efectivo · Registró: Xime   │
│ Ciclo: 19/11 → 18/12 · renueva 19/12     │
│ Comprobante interno (no es factura)      │
│ [Volver a Cobros]  [Ver ficha]           │
└────────────────────────────────────────┘
```

No se fabrica con datos del formulario: se muestra solo lo confirmado por el servidor. Si el resultado es incierto: «Estamos comprobando si se registró. No vuelvas a cargar el pago».

## W10 · Detalle de pago y anulación

```text
┌────────────────────────────────────────┐
│ ← Pago · 16/11 · $ 1.800                 │
│ Elena M. · Mensualidad · Efectivo        │
│ Registró: Xime · 16/11 18:42             │
│ [Anular pago]                            │
│ ─ confirmación ─                         │
│ Anular este pago                         │
│ Motivo *  [                           ]  │
│ Se registra una anulación; el pago       │
│ original sigue visible. Como era una     │
│ mensualidad, el ciclo queda sin efecto.  │
│ [Cancelar]  [Anular pago]                │
└────────────────────────────────────────┘
```

Acción destructiva con botón en rol de peligro y texto claro; nunca el mismo gesto que confirma un cobro. Si ya está anulado: se muestra el contra-registro (quién, cuándo, motivo) y desaparece el botón.

## W11 · Más (ajustes)

```text
┌────────────────────────────────────────┐
│ Más                                      │
│ Precios                                  │
│  Mensualidad            $ 1.800        > │
│  Clase por clase        $ 700          > │
│ Avisos de vencimiento                    │
│  Avisar cuando falten   [7 días ▾]       │  7 · 10 · Vence hoy
│ Horario de clases                      > │
│ Cuentas                                  │
│  Xime · dueña    Dueño 2 · dueño       > │
│ Reportes y exportar CSV                > │
│ Cerrar sesión                            │
└────────────────────────────────────────┘
```

- **Tarifas:** editar precio exige fecha de vigencia y pantalla de revisión; no altera pagos pasados. Sin descuentos automáticos.
- **Cuentas:** solo lista de las dos dueñas; sin roles ni invitaciones de recepción/profesor.
- **Horario de clases:** consulta del único grupo; «Cancelar clase» pide motivo y confirmación (efecto económico = Q2).
- Sin selector de grupos; sin ajustes de menores/tutores; sin portal del alumno.
