# Aplicar la migración inicial de Supabase

Esta guía aplica la base privada de datos diseñada para Workout Plan Companion. La migración debe revisarse y autorizarse para el proyecto de desarrollo elegido antes de ejecutarla.

## Qué crea

- Perfil, preferencias y catálogo curado sin media externa.
- Planes, semanas, sesiones y ejercicios versionados como instantáneas.
- Conversaciones, mensajes y propuestas revisables.
- Borradores y logs de entrenamiento, series y feedback.
- RLS en todas las tablas privadas, políticas explícitas y permisos mínimos.
- Triggers para impedir sobrescribir planes publicados y logs completados.
- La RPC autenticada `complete_workout_log` para finalizar una sesión.

La migración no incorpora automáticamente datos desde AsyncStorage ni incluye una Edge Function, proveedor de IA o secretos. La app ofrece Magic Link y una copia manual y consentida de perfil y tema. La importación de planes publicados y logs terminados requiere la migración posterior descrita en [`apply-training-history-backup.md`](apply-training-history-backup.md); el progreso sigue local.

## Aplicación desde el panel

1. Abre **SQL Editor** en el panel del proyecto de desarrollo autorizado.
2. Crea una consulta nueva.
3. Copia el contenido completo de [`supabase/migrations/20260826135522_initial_private_data_foundation.sql`](../supabase/migrations/20260826135522_initial_private_data_foundation.sql) y pégalo.
4. Confirma que el editor está apuntando al proyecto de desarrollo correcto y pulsa **Run** una sola vez.
5. Si el editor muestra un error, no pruebes a ejecutar fragmentos de la migración: conserva el mensaje de error (sin datos sensibles) para corregir la migración de forma versionada.

El archivo queda en `supabase/migrations/` para que todas las futuras modificaciones sigan la misma historia SQL. Cuando el proyecto esté enlazado desde un entorno con credenciales privadas, `supabase db push` aplicará únicamente las migraciones pendientes.

## Verificación posterior

Ejecuta estas consultas en SQL Editor después de que la migración termine sin errores:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'user_preferences', 'exercise_catalog',
    'plan_versions', 'plan_weeks', 'plan_sessions', 'plan_session_exercises',
    'active_plan_selection', 'assistant_conversations', 'assistant_messages',
    'plan_proposals', 'workout_logs', 'workout_log_sets',
    'workout_exercise_feedback'
  )
order by tablename;
```

Las 14 filas deben aparecer con `rowsecurity = true`.

```sql
select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;
```

Debe haber políticas para todas las tablas privadas y ninguna política de escritura directa para planes, propuestas o mensajes del asistente.

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'complete_workout_log';
```

Debe devolver una fila.

## Autenticación elegida

El MVP usa **magic link por correo**, con el callback profundo `gimnasio://auth/callback` configurado en Supabase Auth. El servicio de correo predeterminado de Supabase sirve para desarrollo limitado; antes de producción se necesitará SMTP propio y revisar sus límites.
