# Auth

Límite de módulo reservado para Auth en otra fase; sin pantallas ni credenciales en Fase 4.

La verificación de tipos corre con `npx tsc --noEmit -p modules/auth/tsconfig.json` desde `v2/`. La barrera de imports entre módulos está en `v2/test/fronteras.test.ts`.
