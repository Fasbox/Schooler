# Schooler

Aplicación universitaria personal. Esta entrega contiene las fases 1 a 4: monorepo, autenticación, periodos, materias, horarios y gestión de actividades.

La Fase 6 (Home inteligente) se adelantó por prioridad de uso y después se completó la Fase 5 de notas.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior
- Un proyecto de Supabase

## Estructura

```text
apps/
  api/                 API Express + TypeScript
    src/config/        variables de entorno
    src/middleware/    autenticación y errores
    src/modules/       módulos por feature
  web/                 React + Vite + TypeScript
    src/components/    componentes compartidos y shadcn/ui
    src/features/      frontend organizado por feature
packages/
  shared/              constantes y contratos compartidos
supabase/
  migrations/          esquema, constraints, triggers y RLS
  seed.sql              periodo 2026-2, materias y horarios
```

## Ejecución local

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:3000
- Health: http://localhost:3000/health

También se pueden iniciar por separado con `npm run dev:web` y `npm run dev:api`.

## Base de datos y autenticación

1. En Supabase, abre **SQL Editor**.
2. Ejecuta las migraciones de `supabase/migrations` en orden. Si ya aplicaste la inicial, ejecuta solamente `202608140002_period_switch.sql`.
3. En **Authentication > Providers > Email**, deshabilita el registro público.
4. En **Authentication > Users**, crea manualmente tu usuario.
5. Abre `supabase/seed.sql`, reemplaza `TU_CORREO` y ejecútalo una sola vez.
6. En **Authentication > URL Configuration**, usa `http://localhost:5173` como Site URL y agrega `http://localhost:5173/reset-password` como Redirect URL.

La migración mantiene RLS activa y aísla todos los datos mediante `auth.uid()`. La clave secreta solo puede existir en la API y nunca debe tener prefijo `VITE_`.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npm run build
```

Después de iniciar ambos servicios, abre `/health`, inicia sesión con el usuario manual y confirma que la pantalla indica que la API está conectada.

## Fase 3

- **Configuración** permite crear periodos, seleccionar el actual, archivar y consultar el historial.
- **Materias** permite crear, editar, archivar y restaurar materias.
- El detalle de una materia permite crear, editar y eliminar sesiones semanales con modalidad y aula independientes.
- Los colores se eligen en el servidor desde una paleta de alto contraste y se guardan en PostgreSQL.

## Fase 4

- **Tareas** contiene el CRUD de tareas, parciales, quices, proyectos y sesiones de estudio.
- Permite filtrar por materia, estado, tipo, importancia y rango de fechas.
- Permite ordenar por prioridad automática, vencimiento, importancia o materia.
- Los parciales reciben 20 % por defecto y las sesiones de estudio nunca guardan nota ni porcentaje.
- Las eliminaciones envían la actividad a papelera mediante `deleted_at`; no borran sus datos definitivamente.
- La prioridad y el estado vencido se calculan en `packages/shared/src/activity-priority.ts` usando `America/Bogota`.

Ejecuta las pruebas críticas con:

```bash
npm test
```

## Home inteligente

- Encabezado contextual según la hora de Bogotá.
- Urgencias, alto impacto y pendientes vencidos.
- Clases y actividades de hoy y mañana.
- Énfasis visual de mañana después de las 17:00.
- Detección de la clase que está ocurriendo y cálculo de la próxima clase recurrente.
- Resumen semanal y progreso operativo del periodo actual.
- La consulta agregada evita cargar periodos archivados en Inicio.

## Sistema de notas

- El detalle de cada materia muestra peso planeado, evaluado y restante, promedio evaluado y acumulado ponderado.
- Calcula la nota requerida para aprobar con 3.0 y alcanzar el objetivo 4.0.
- Explica objetivos ya asegurados o matemáticamente imposibles.
- Permite registrar o retirar una nota sin alterar el estado de la actividad.
- Incluye un simulador temporal de nota y porcentaje que no guarda escenarios.
- La lógica y sus casos límite viven fuera de React y cuentan con pruebas unitarias.

## Calendario y captura rápida

- **Calendario** combina clases recurrentes, tareas, parciales, quices, proyectos y estudio.
- Incluye vista semanal responsive y vista mensual con detalle del día seleccionado.
- Resalta el día actual y la clase que está ocurriendo.
- El color representa siempre la materia; el tipo se diferencia mediante texto.
- El botón flotante **Nueva tarea** está disponible en todas las rutas privadas.
- `Ctrl+K` (o `Cmd+K`) abre la captura rápida y `Esc` la cierra.
- Si existe una clase en curso, la captura rápida selecciona automáticamente esa materia.

## Notificaciones y recordatorios

1. Ejecuta `supabase/migrations/202608140003_notification_reminders.sql` en Supabase.
2. Al iniciar una sesión, la aplicación procesa automáticamente las notificaciones pendientes del usuario autenticado.
3. `CRON_SECRET` se utiliza para el procesamiento programado con la aplicación cerrada. Para probar ese endpoint manualmente puedes ejecutar:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/internal/process-notifications -Headers @{ 'x-cron-secret' = 'TU_CRON_SECRET' }
```

La migración crea recordatorios a 7, 3 y 1 día, reprograma los no entregados cuando cambia el vencimiento y evita duplicados mediante `deduplication_key`. El procesador genera además un resumen diario después de las 08:00 `America/Bogota`. En desarrollo no es necesario ejecutar el comando manual para el uso normal.

### Web Push

Genera las claves una sola vez:

```powershell
npx.cmd web-push generate-vapid-keys
```

Configura la clave pública en `apps/web/.env` como `VITE_VAPID_PUBLIC_KEY`. Configura en `apps/api/.env` `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`. La clave privada nunca debe llegar al frontend ni a Git.

Al entrar, Schooler muestra automáticamente una explicación si el permiso aún no se decidió. El diálogo nativo del navegador se abre después del clic obligatorio en **Permitir notificaciones**. También se puede administrar Push desde **Avisos**. Si el navegador no lo soporta o deniega el permiso, el centro interno continúa funcionando.

### Programación en producción

La Edge Function está en `supabase/functions/process-notifications/index.ts`. Cuando la API tenga una URL pública:

1. Configura en Supabase los secretos `SCHOOLER_API_CRON_URL` (terminado en `/api/internal/process-notifications`) y `SCHOOLER_CRON_SECRET`.
2. Despliega `process-notifications`.
3. En Supabase Cron programa la función cada 15 minutos.
4. Ejecútala dos veces y confirma que la segunda ejecución no crea duplicados.
