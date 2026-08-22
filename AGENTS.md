# Gimnasio — contexto de proyecto

## Propósito

Aplicación móvil personal para entrenar en gimnasio sin depender de un monitor: recoge contexto, crea y presenta planes mensuales de cuatro semanas, guía cada sesión y registra progreso. La aplicación no hace diagnóstico médico ni sustituye a un profesional sanitario.

El producto se comunica en español claro, cercano y sin promesas de resultados. Un dolor agudo, lesión o condición clínica requiere pausar y consultar a un profesional.

## Decisiones ya tomadas

- Cliente: React Native con Expo y TypeScript estricto, dentro de `mobile/`.
- Navegación: Expo Router, con cuatro pestañas: **Hoy**, **Mi plan**, **Progreso** y **Perfil**.
- Persistencia futura: Supabase para cuenta, perfil, planes y registros. No crear un proyecto remoto, credenciales ni migraciones en producción sin autorización explícita.
- Plan inicial: plantilla mensual de 4 semanas; cada sesión tiene calentamiento, ejercicios, series/repeticiones/RPE o descanso y cierre. Los planes publicados se versionan: nunca se reescribe el histórico.
- Onboarding persistente: objetivo, experiencia, disponibilidad, duración de sesión, equipamiento, limitaciones declaradas, unidades y preferencias; se puede editar desde Perfil y alimenta próximos planes.
- Tema visual: selector persistente en **Perfil → Apariencia**. Predeterminado `verde-activo`; alternativa `grafito-naranja`; el cambio se aplica inmediatamente.

## Alcance MVP

1. Onboarding y perfil editable.
2. Plan mensual navegable por semanas y sesiones.
3. Ejecución y registro de una sesión con carga, repeticiones, RPE y notas.
4. Ficha de ejercicio con instrucciones, puntos técnicos, errores frecuentes y una ilustración/animación segura de sustituir más tarde.
5. Progreso básico: adherencia, volumen y evolución por ejercicio.

Fuera del MVP: redes sociales, pagos, wearables, dieta/calorías, diagnóstico de lesiones, generación automática sin revisión y notificaciones complejas.

## Forma de trabajar

- Lee `docs/product-brief.md` y `docs/design-system.md` antes de decisiones de producto o UI.
- Antes de añadir una dependencia, comprueba que Expo no cubra la necesidad; prefiera bibliotecas mantenidas y compatibles con el SDK instalado.
- Mantén datos de muestra aislados y una capa de repositorio para que Supabase sustituya el almacenamiento local sin reescribir pantallas.
- No almacenes secretos en el repositorio ni en el cliente. Pide confirmación antes de crear servicios externos, desplegar o ejecutar builds de distribución.
- Tras cambios, ejecuta comprobaciones proporcionadas por el proyecto: typecheck, lint y tests relevantes. No ignores errores.
- Usa el skill adecuado al área: `/skill:gym-product`, `/skill:gym-ui`, `/skill:gym-mobile`, `/skill:gym-data` o `/skill:gym-quality`.

## Primera entrega de código

Crear el shell de la app Expo en `mobile/`: rutas de las cuatro pestañas, datos de muestra locales, tema verde activo, cambio a grafito naranja desde Perfil y pantallas estructurales para el flujo de sesión. No integrar Supabase todavía.
