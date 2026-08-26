# Diseño de Supabase y asistente remoto

> **Estado: diseño propuesto para revisar antes de autorizar los servicios.** Este documento no crea un proyecto de Supabase, migraciones, credenciales ni llamadas a un proveedor de IA.

## Objetivo y límites

La app seguirá funcionando sin conexión con sus repositorios locales. Cuando la persona cree una cuenta y lo acepte, Supabase ofrecerá autenticación, copia privada de sus datos y sincronización entre dispositivos. Un asistente remoto podrá conversar para proponer el siguiente ciclo o cambios, pero nunca publicará ni modificará un plan por sí mismo.

No forma parte de esta fase: diagnóstico de lesiones, recomendaciones médicas, cargas absolutas, imágenes o GIFs de terceros, redes sociales, analítica publicitaria o incorporar una clave de proveedor de IA en la app.

## Invariantes de producto

1. Un plan publicado es una instantánea inmutable. Activar una nueva versión no altera las versiones anteriores.
2. Un entrenamiento completado, sus series, feedback y nota son inmutables. Puede existir un borrador editable hasta completarlo.
3. El asistente solo crea **propuestas revisables**. La persona confirma la publicación con una acción explícita.
4. Una propuesta solo se puede publicar si deriva de la versión que sigue activa. Una propuesta desfasada se conserva como historial, pero se rechaza al publicar.
5. El historial, el perfil, las limitaciones declaradas, las notas y las conversaciones pertenecen exclusivamente a su autor.
6. El catálogo es curado. Una respuesta del modelo solo puede referirse a ejercicios y material permitidos por el catálogo vigente.
7. Dolor agudo, lesión, embarazo o condición clínica declarada requieren un mensaje prudente para detenerse y consultar a un profesional; el asistente no diagnostica ni prescribe.

## Arquitectura objetivo

```text
Expo / Expo Router
  ├─ repositorios locales (modo sin cuenta o sin conexión)
  ├─ repositorios remotos Supabase (sesión autenticada)
  └─ invocación HTTPS con JWT
                   │
                   ▼
Supabase
  ├─ Auth
  ├─ Postgres + RLS
  ├─ RPC transaccionales para publicar y completar
  └─ Edge Function `assistant-turn`
                   │  (secreto solo aquí)
                   ▼
Proveedor de IA
```

La app solo distribuye la URL pública de Supabase y la clave anónima pública. Las claves `service_role`, del proveedor de IA y cualquier secreto viven únicamente en los secretos del entorno de la Edge Function. No se registra el contenido completo de prompts ni respuestas en logs de producción.

## Datos y propiedad

Todas las tablas privadas tienen `user_id uuid not null references auth.users(id)`. Los identificadores remotos son UUID generados por base de datos. Una importación consentida conserva el ID local del plan dentro de su instantánea de petición para poder repetirla sin duplicar versiones.

| Área | Tabla propuesta | Datos esenciales | Regla |
| --- | --- | --- | --- |
| Perfil | `profiles` | `user_id`, nombre, disponibilidad, duración, limitaciones, unidades, fechas | una fila privada por persona |
| Preferencias | `user_preferences` | `user_id`, tema, fechas | privada; el tema no cambia con un plan |
| Catálogo | `exercise_catalog` | id estable, nombre, equipo, técnica, errores, series, atribución y estado | lectura autenticada; escritura solo editorial/backend |
| Plan publicado | `plan_versions` | id, `user_id`, número de versión, nombre, petición de origen JSONB, propuesta de origen, `published_at` | inserción; no actualización ni borrado por cliente |
| Estructura del plan | `plan_weeks`, `plan_sessions`, `plan_session_exercises` | FK a versión, orden, objetivo, calentamiento, ejercicios, series y enfriamiento | se insertan junto con la versión; no se editan |
| Plan activo | `active_plan_selection` | `user_id` único, `plan_version_id`, `selected_at` | es un puntero; cambiarlo no cambia ninguna versión |
| Conversación | `assistant_conversations`, `assistant_messages` | origen de plan, rol, texto, fechas, estado | privada; los mensajes ya enviados son append-only |
| Propuesta | `plan_proposals` | origen de plan, conversación, petición, plan propuesto JSONB o estructura normalizada, cambios, revisión, modelo, estado, fechas | cada respuesta propuesta es una nueva instantánea |
| Sesión | `workout_logs` | plan/sesión de origen, estado, inicio/fin, unidades, nota | borrador editable; completado inmutable |
| Series | `workout_log_sets` | log, ejercicio de origen, nº de serie, objetivo, descanso, carga introducida, unidad, carga canónica kg, repeticiones, RPE | se bloquean al completar su log |
| Feedback | `workout_exercise_feedback` | log, ejercicio, reacción y nota | se bloquea al completar su log |

### Planes versionados

`plan_versions` no contiene un campo booleano `is_active`: el plan activo se deriva de `active_plan_selection`. Publicar debe ejecutarse mediante una sola RPC transaccional:

1. comprueba que la propuesta pertenece al `user_id` del JWT y está en estado `reviewable`;
2. comprueba que su versión origen coincide con `active_plan_selection`;
3. valida esquema, catálogo permitido y cuatro semanas;
4. inserta `plan_versions`, semanas, sesiones y ejercicios como instantáneas;
5. marca la propuesta como `published` y enlaza la nueva versión;
6. actualiza únicamente el puntero `active_plan_selection`;
7. devuelve la nueva versión.

Si falla cualquier paso, no se publica nada. Una propuesta no se sobreescribe al editar la conversación: una nueva respuesta del asistente crea otra propuesta y la anterior queda `superseded`, `dismissed` o `stale` según corresponda.

### Registros y progreso

Las cargas se guardarán con `input_unit` y `input_load`, más `load_kg` calculada en el servidor. Así se conserva cómo la persona lo anotó y se puede calcular progreso de forma consistente. La vista de progreso será una consulta o RPC derivada de logs completados y plan activo; no será una fuente de verdad duplicada.

Completar una sesión debe ser otra RPC transaccional. Un trigger rechaza cambios o borrados de una fila cuyo estado anterior sea `completed`; el cliente tampoco recibe políticas que permitan borrar registros completados.

## RLS y acceso

No se utilizará `service_role` desde Expo. Para toda tabla privada, las políticas siguen este patrón:

- `SELECT`: `auth.uid() = user_id`.
- `INSERT`: `auth.uid() = user_id` con `WITH CHECK` equivalente.
- `UPDATE`: solo filas propias y, para borradores, solo mientras el estado anterior sea `in-progress`.
- `DELETE`: no permitido para versiones publicadas, propuestas auditables ni logs; la eliminación de cuenta se gestiona en backend con confirmación explícita.

Las tablas hijas aplican la misma propiedad mediante su fila padre, por ejemplo comprobando que el `workout_log` o `plan_version` asociado sea del `auth.uid()` actual. Las RPC de publicación y finalización verifican también el usuario internamente y no confían en un `user_id` recibido desde el móvil.

`exercise_catalog` se expone en modo solo lectura a usuarios autenticados. Las operaciones editoriales y la importación de datos con licencia se ejecutan fuera del cliente y quedan auditadas. No se almacenará ni referenciará media de Gym Visual sin licencia directa.

## Asistente remoto

El actual asistente local es un fallback determinista. El asistente remoto será conversacional y no debe quedar limitado por el wizard local `PlanConversation`.

### Contrato de aplicación futuro

Se añadirá un límite de repositorio independiente, por ejemplo:

```ts
interface PlanAssistantRepository {
  getConversation(sourcePlanVersionId: string): Promise<AssistantConversation | null>;
  sendMessage(input: AssistantTurnInput): Promise<AssistantTurnResult>;
  listProposals(sourcePlanVersionId: string): Promise<PlanProposal[]>;
}
```

`AssistantTurnInput` llevará el identificador de conversación si ya existe y el mensaje de la persona. No incluirá un `user_id` ni secretos. `AssistantTurnResult` incluirá mensajes del asistente, estado de seguridad, y opcionalmente un identificador de propuesta `reviewable`; no incluirá una orden de publicación.

Esto permite peticiones naturales como: “el press de banca no me encaja; prefiero mancuernas”, “solo tendré poleas este mes” o “quiero menos ejercicios el viernes”. El asistente responde, explica lo que entendió y propone un borrador. La pantalla de revisión sigue siendo la única ruta hacia publicación.

### Edge Function `assistant-turn`

1. Verifica el JWT de Supabase Auth y obtiene el `user_id` del token.
2. Lee bajo RLS el perfil, la versión activa, el catálogo permitido, la conversación y solo el historial relevante (feedback, progresión resumida y notas necesarias).
3. Detecta primero señales de seguridad. Si hay dolor agudo, lesión, embarazo o condición clínica, devuelve un mensaje prudente sin generar prescripción y pide pausar/consultar a un profesional.
4. Envía al modelo un contexto minimizado, delimitado y sin instrucciones de confianza procedentes de texto de usuario. Incluye reglas de producto, catálogo permitido y un esquema de salida estricto.
5. Valida de nuevo la respuesta contra JSON Schema y reglas de negocio: cuatro semanas, sesiones compatibles con disponibilidad/duración, IDs del catálogo, sin cargas absolutas, sin diagnósticos y con avisos de revisión.
6. Persiste los nuevos mensajes y, si procede, una `plan_proposal` inmutable en estado `reviewable`.
7. Devuelve un resultado redactado para la interfaz. Si el proveedor falla, no cambia el plan y la app comunica el error o usa el fallback local.

La función no invoca `publish_plan_proposal`. La publicación se solicita después desde el cliente autenticado mediante su propia RPC y confirmación explícita.

### Privacidad, coste y abuso

- Enviar al modelo el mínimo contexto necesario; no los logs completos por defecto.
- Conservar `provider`, versión de modelo, fecha, versión de prompt y resultado de validación como metadatos de la propuesta; no registrar secretos.
- Establecer límites por usuario y ventana de tiempo en backend antes de llamar al proveedor.
- Definir presupuesto mensual y un modelo permitido antes de activar la función.
- Ofrecer claramente la opción de no usar IA y mantener la app local.
- Definir retención, exportación y borrado de conversaciones antes de producción.

## Migración desde AsyncStorage

La sincronización no será silenciosa. Al crear sesión, la persona verá una decisión explícita: **mantener solo este dispositivo**, **hacer copia privada en su cuenta** o, si ya tiene nube, elegir la fuente que desea conservar.

Para una importación aprobada:

1. se lee el perfil, tema, historial de publicaciones y logs locales;
2. se valida en el dispositivo y se muestra un resumen;
3. se crea una operación de importación idempotente que asocia el ID local con la instantánea remota y registra el resumen de la copia;
4. los planes y logs se insertan como instantáneas, sin intentar fusionar ni sobrescribir registros remotos;
5. se verifica el recuento y se confirma a la persona;
6. la app conserva el modo local hasta que la sincronización esté confirmada.

Los borradores en curso y propuestas locales pueden ofrecerse para importar, pero no son necesarios para conservar un historial válido. No se suben datos de una instalación sin consentimiento.

## Orden de implementación posterior

1. Obtener las decisiones pendientes de abajo y autorización para crear el proyecto Supabase.
2. Crear migraciones revisadas, RLS, triggers de inmutabilidad y RPC de publicación/finalización; probarlas con usuarios A/B.
3. Integrar Auth y repositorios remotos de perfil, preferencias, planes y logs, conservando el modo local.
4. Implementar importación consentida y pruebas de conflicto/sin conexión.
5. Crear Edge Function, secretos y límites de uso; integrar `PlanAssistantRepository` y la conversación remota.
6. Validar el flujo completo: petición natural → propuesta → revisión → publicación → ejecución → historial y progreso.

## Decisiones necesarias antes de crear recursos externos

- Organización, región y presupuesto del proyecto Supabase.
- Métodos de acceso iniciales (correo/contraseña, magic link, Apple/Google) y requisitos de eliminación de cuenta.
- Proveedor, modelo, presupuesto mensual, límites de uso y política de retención de IA.
- Texto de consentimiento para enviar contexto al asistente y para importar datos locales.
- Política de copias de seguridad, exportación y borrado de datos.
- Revisión final de los esquemas SQL, RLS y RPC antes de aplicarlos en cualquier entorno remoto.
