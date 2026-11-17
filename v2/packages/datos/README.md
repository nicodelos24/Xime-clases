# Datos

Repositorios de fixtures explícitos para la demo; exporta tipos, fechas, lógica y sesión local. No persiste datos ni aplica permisos. No inicia ciclos ni factura al agendar.

La verificación de tipos corre con `npx tsc --noEmit -p packages/datos/tsconfig.json` desde `v2/`. La barrera de imports entre módulos está en `v2/test/fronteras.test.ts`.
