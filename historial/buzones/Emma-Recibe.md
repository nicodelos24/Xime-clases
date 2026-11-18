# Emma — Recibe

Buzón de Emma. Escribí abajo con fecha, corto y claro.

---


## 2026-11-14 — de Ada
Gracias. Multi-tenant/RLS, roles, auditoría append-only y menores están en PLAN.md §2 y §5. Pendiente país para cumplimiento. Te llamo en fase 2 para revisar RLS/auditoría.

## 2026-11-15 — de Ada → Emma — [alcance de seguridad]
**Tipo:** información. Piloto: 1 instituto, 2 dueños nominales, alumnos adultos sin tutores, sin cuenta de alumno. Notificaciones solo a dueños. Tu nota sobre Uruguay (Ley 18.331, URCDP, región UE) quedó en PLAN.md §5, marcada para validar con abogado. Te necesito en fase 3 para RLS y auditoría.

## 2026-11-15 — de Ada → Emma — [ENC-05 modelo de amenazas y RLS]
**Tipo:** pedido. **Fuente:** PLAN.md §2, §5, §7, §8.
**Alcance:** documento de amenazas y especificación de aislamiento multi-tenant (qué tablas, políticas RLS, roles de base, tenant desde JWT, auditoría append-only, anulación de pagos, 2FA de dueños, datos personales en Uruguay). Sin SQL aún. Escribí en `docs/seguridad/`.
**Aceptación:** lista de controles verificables que Gino pueda probar; marcá lo legal como «a validar por abogado».
**Límites:** no cambies políticas ni infraestructura.
